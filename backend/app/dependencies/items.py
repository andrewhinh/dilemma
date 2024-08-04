"""Dependencies for items endpoints."""

import logging
import math
import random
import signal
import traceback
from contextlib import contextmanager
from datetime import datetime

import dspy
from dsp.utils import deduplicate
from homeharvest import scrape_property
from pydantic import BaseModel, Field
from sqlmodel import Session, select

from app.config import get_settings
from app.models.items import Property, SearchRequest, SearchResult

logger = logging.getLogger(__name__)

SETTINGS = get_settings()
OPENAI_API_KEY = SETTINGS.openai_api_key

DEFAULT_MAX_POPUPS = 10

DEFAULT_MODEL = "gpt-3.5-turbo"
DEFAULT_MAX_HOPS = 3
DEFAULT_TEMPERATURE = 0.7
DEFAULT_DELTA = 0.0001
DEFAULT_MAX_RETRIES = 3
DEFAULT_TIMEOUT = 10  # seconds


# Timeout handling
class TimeoutException(Exception):
    """Exception raised when a timeout occurs."""

    pass


@contextmanager
def time_limit(seconds):
    def signal_handler(signum, frame):
        raise TimeoutException

    signal.signal(signal.SIGALRM, signal_handler)
    signal.alarm(seconds)
    try:
        yield
    finally:
        signal.alarm(0)


# Get property
def get_property(
    session: Session,
    street: str | None = None,
    unit: str | None = None,
    city: str | None = None,
    state: str | None = None,
    zip_code: str | None = None,
) -> Property:
    return session.exec(
        select(Property)
        .where(Property.street == street)
        .where(Property.unit == unit)
        .where(Property.city == city)
        .where(Property.state == state)
        .where(Property.zip_code == zip_code)
    ).first()


# Search properties
def search_properties(session: Session, request: SearchRequest) -> SearchResult:
    """Search properties."""
    properties = scrape_property(
        location=request.location,
        listing_type=request.listing_type,
        radius=request.radius,
        mls_only=request.mls_only,
        past_days=request.past_days,
        date_from=request.date_from,
        date_to=request.date_to,
        foreclosure=request.foreclosure,
    )

    list_properties = []
    for _, row in properties.iterrows():
        property = get_property(
            session,
            street=row["street"],
            unit=row["unit"],
            city=row["city"],
            state=row["state"],
            zip_code=row["zip_code"],
        )
        if property:
            property.property_url = row["property_url"] if "property_url" in row else property.url
            property.mls = row["mls"] if "mls" in row else property.mls
            property.mls_id = row["mls_id"] if "mls_id" in row else property.mls_id
            property.status = row["status"] if "status" in row else property.status
            property.street = row["street"] if "street" in row else property.street
            property.unit = row["unit"] if "unit" in row else property.unit
            property.city = row["city"] if "city" in row else property.city
            property.state = row["state"] if "state" in row else property.state
            property.zip_code = row["zip_code"] if "zip_code" in row else property.zip_code
            property.style = row["style"].name if "style" in row else property.style
            property.beds = row["beds"] if "beds" in row else property.beds
            property.full_baths = row["full_baths"] if "full_baths" in row else property.full_baths
            property.half_baths = row["half_baths"] if "half_baths" in row else property.half_baths
            property.sqft = row["sqft"] if "sqft" in row else property.sqft
            property.year_built = row["year_built"] if "year_built" in row else property.year_built
            property.stories = row["stories"] if "stories" in row else property.stories
            property.lot_sqft = row["lot_sqft"] if "lot_sqft" in row else property.lot_sqft
            property.days_on_mls = row["days_on_mls"] if "days_on_mls" in row else property.days_on_mls
            property.list_price = (
                row["list_price"]
                if "list_price" in row
                and row["list_price"] is not None
                and not math.isinf(row["list_price"])
                and not math.isnan(row["list_price"])
                else property.list_price
            )
            property.list_date = row["list_date"] if "list_date" in row else property.list_date
            property.pending_date = row["pending_date"] if "pending_date" in row else property.pending_date
            property.sold_price = (
                row["sold_price"]
                if "sold_price" in row
                and row["sold_price"] is not None
                and not math.isinf(row["sold_price"])
                and not math.isnan(row["sold_price"])
                else property.sold_price
            )
            property.last_sold_date = row["last_sold_date"] if "last_sold_date" in row else property.last_sold_date
            property.price_per_sqft = (
                row["price_per_sqft"]
                if "price_per_sqft" in row
                and row["price_per_sqft"] is not None
                and not math.isinf(row["price_per_sqft"])
                and not math.isnan(row["price_per_sqft"])
                else property.price_per_sqft
            )
            property.hoa_fee = (
                row["hoa_fee"]
                if "hoa_fee" in row
                and row["hoa_fee"] is not None
                and not math.isinf(row["hoa_fee"])
                and not math.isnan(row["hoa_fee"])
                else property.hoa_fee
            )
            property.latitude = (
                row["latitude"]
                if "latitude" in row
                and row["latitude"] is not None
                and not math.isinf(row["latitude"])
                and not math.isnan(row["latitude"])
                else property.latitude
            )
            property.longitude = (
                row["longitude"]
                if "longitude" in row
                and row["longitude"] is not None
                and not math.isinf(row["longitude"])
                and not math.isnan(row["longitude"])
                else property.longitude
            )
            property.parking_garage = row["parking_garage"] if "parking_garage" in row else property.parking_garage
            property.primary_photo = row["primary_photo"] if "primary_photo" in row else property.primary_photo
            property.alt_photos = list(row["alt_photos"].split(",")) if "alt_photos" in row else property.alt_photos
            property.neighborhoods = row["neighborhoods"] if "neighborhoods" in row else property.neighborhoods
        else:
            property = Property(
                property_url=row["property_url"] if "property_url" in row else None,
                mls=row["mls"] if "mls" in row else None,
                mls_id=row["mls_id"] if "mls_id" in row else None,
                status=row["status"] if "status" in row else None,
                street=row["street"] if "street" in row else None,
                unit=row["unit"] if "unit" in row else None,
                city=row["city"] if "city" in row else None,
                state=row["state"] if "state" in row else None,
                zip_code=row["zip_code"] if "zip_code" in row else None,
                style=row["style"].name if "style" in row else None,
                beds=row["beds"] if "beds" in row else None,
                full_baths=row["full_baths"] if "full_baths" in row else None,
                half_baths=row["half_baths"] if "half_baths" in row else None,
                sqft=row["sqft"] if "sqft" in row else None,
                year_built=row["year_built"] if "year_built" in row else None,
                stories=row["stories"] if "stories" in row else None,
                lot_sqft=row["lot_sqft"] if "lot_sqft" in row else None,
                days_on_mls=row["days_on_mls"] if "days_on_mls" in row else None,
                list_price=row["list_price"]
                if "list_price" in row
                and row["list_price"] is not None
                and not math.isinf(row["list_price"])
                and not math.isnan(row["list_price"])
                else None,
                list_date=row["list_date"] if "list_date" in row else None,
                pending_date=row["pending_date"] if "pending_date" in row else None,
                sold_price=row["sold_price"]
                if "sold_price" in row
                and row["sold_price"] is not None
                and not math.isinf(row["sold_price"])
                and not math.isnan(row["sold_price"])
                else None,
                last_sold_date=row["last_sold_date"] if "last_sold_date" in row else None,
                price_per_sqft=row["price_per_sqft"]
                if "price_per_sqft" in row
                and row["price_per_sqft"] is not None
                and not math.isinf(row["price_per_sqft"])
                and not math.isnan(row["price_per_sqft"])
                else None,
                hoa_fee=row["hoa_fee"]
                if "hoa_fee" in row
                and row["hoa_fee"] is not None
                and not math.isinf(row["hoa_fee"])
                and not math.isnan(row["hoa_fee"])
                else None,
                latitude=row["latitude"]
                if "latitude" in row
                and row["latitude"] is not None
                and not math.isinf(row["latitude"])
                and not math.isnan(row["latitude"])
                else None,
                longitude=row["longitude"]
                if "longitude" in row
                and row["longitude"] is not None
                and not math.isinf(row["longitude"])
                and not math.isnan(row["longitude"])
                else None,
                parking_garage=row["parking_garage"] if "parking_garage" in row else None,
                primary_photo=row["primary_photo"] if "primary_photo" in row else None,
                alt_photos=list(row["alt_photos"].split(",")) if "alt_photos" in row else [],
                neighborhoods=row["neighborhoods"] if "neighborhoods" in row else None,
            )
        list_properties.append(property)

    lats = [property.latitude for property in list_properties if property.latitude]
    longs = [property.longitude for property in list_properties if property.longitude]

    search_result = SearchResult(
        popups=random.sample(range(len(list_properties)), min(len(list_properties), DEFAULT_MAX_POPUPS))
        if list_properties
        else [],
        center_lat=sum(lats) / len(lats) if lats else None,
        center_long=sum(longs) / len(longs) if longs else None,
        search_request=request,
        properties=list_properties,
    )
    session.add(search_result)
    session.commit()
    session.refresh(search_result)
    return search_result


# Location checker
class Input(BaseModel):
    """Input model."""

    context: list[str] = Field(description="may contain relevant context")
    location: str = Field(
        description="string that is either a) a zip code, full address, city/state, etc. or b) an invalid location"
    )
    current_date: datetime = Field(default_factory=datetime.utcnow)


class Output(BaseModel):
    """Output model."""

    replacements: list[str] = Field(
        description="empty list for a valid location, or list of possible locations for an invalid location"
    )


class ReplaceLocation(dspy.Signature):
    """
    Given a location, check if it is valid.
    If so, return an empty list.

    If not, and it is most like a zip code, full address, city/state, etc.,
    return replacements that are similar to the location but are valid.
    e.g. 12345 -> 12346, 12347, etc.
    """

    input: Input = dspy.InputField()
    output: Output = dspy.OutputField()


class LocationReplacer(dspy.Module):
    """Location replacer."""

    def __init__(
        self,
        model: str = DEFAULT_MODEL,
        max_hops: int = DEFAULT_MAX_HOPS,
        temperature: float = DEFAULT_TEMPERATURE,
        delta: float = DEFAULT_DELTA,
        max_retries: int = DEFAULT_MAX_RETRIES,
        gen_timeout: int = DEFAULT_TIMEOUT,
    ):
        super().__init__()

        self.lm = dspy.OpenAI(model=model, api_key=OPENAI_API_KEY, model_type="chat")
        self.max_hops = max_hops
        self.temperature = temperature
        self.delta = delta
        self.gen_timeout = gen_timeout

        self.generate_replace = [
            dspy.TypedChainOfThought(signature=ReplaceLocation, max_retries=max_retries) for _ in range(max_hops)
        ]

    def forward(self, location):
        context, replacements = [], []

        for hop in range(self.max_hops):
            try:
                with time_limit(self.gen_timeout):
                    with dspy.context(lm=self.lm):
                        replacements = self.generate_replace[hop](
                            input=Input(
                                context=context,
                                location=location,
                            ),
                            config={"temperature": self.temperature + self.delta * random.randint(-1, 1)},
                        ).output.replacements
            except TimeoutException:
                message = "Location: Generation timeout"
                logger.error(message)
                properties = [message]
                context = deduplicate(context + properties)
                continue
            except Exception:
                message = traceback.format_exc()
                logger.error(message)
                properties = [message]
                context = deduplicate(context + properties)
                continue

        return dspy.Prediction(replacements=replacements)
