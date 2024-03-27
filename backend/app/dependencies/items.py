"""Dependencies for items endpoints."""

import logging
import math
import signal
from contextlib import contextmanager
from uuid import UUID

import pandas
from homeharvest import scrape_property

from app.config import get_settings
from app.models.items import AltPhoto, Property

logger = logging.getLogger(__name__)

SETTINGS = get_settings()
OPENAI_API_KEY = SETTINGS.openai_api_key

DEFAULT_MODEL = "gpt-3.5-turbo"
DEFAULT_MAX_HOPS = 2
DEFAULT_TEMPERATURE = 0.7
DEFAULT_DELTA = 0.0001
DEFAULT_TIMEOUT = 10  # seconds


# Convert UUID to float between 0 and 1
def uuid_to_float(uuid: UUID) -> float:
    """Convert UUID to float between 0 and 1."""
    return int(uuid) / 2**128


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


# Get home data
def get_home_data(location: str) -> list[Property]:
    """Get home data from location."""
    try:
        with time_limit(DEFAULT_TIMEOUT):
            properties = scrape_property(
                location=location,
                listing_type="for_sale",
            )
    except TimeoutException:
        logger.error("Timeout occurred while fetching home data.")
        properties = pandas.DataFrame()

    list_properties = []
    for _, row in properties.iterrows():
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
