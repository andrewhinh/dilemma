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

from app.config import get_settings
from app.models.items import AltPhoto, Property, SearchRequest

logger = logging.getLogger(__name__)

SETTINGS = get_settings()
OPENAI_API_KEY = SETTINGS.openai_api_key

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


# Search properties
def search_properties(request: SearchRequest) -> list[Property]:
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
        alt_photos = []
        if "alt_photos" in row:
            alt_photos = [AltPhoto(url=url) for url in row["alt_photos"].split(",")]
        list_properties.append(
            Property(
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
                alt_photos=alt_photos,
                neighborhoods=row["neighborhoods"] if "neighborhoods" in row else None,
            )
        )

    return list_properties


# Location checker
class Input(BaseModel):
    """Input model."""

    context: list[str] = Field(description="may contain relevant context")
    location: str = Field(description="zip code, a full address, city/state, etc. or invalid location")
    current_date: datetime = Field(default_factory=datetime.utcnow)


class Output(BaseModel):
    """Output model."""

    replacements: list[str] = Field(description="list of possible locations in place of an invalid location")


class ReplaceLocation(dspy.Signature):
    """
    Given a location, check if it is valid and return possible replacements.
    If the location is invalid and is most like a zip code, full address, city/state, etc.,
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
