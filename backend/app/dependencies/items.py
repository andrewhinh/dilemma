"""Dependencies for items endpoints."""

import logging
import signal
from contextlib import contextmanager
from uuid import UUID

import pandas
from homeharvest import scrape_property

from app.config import get_settings
from app.models.items import Property

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
    print(properties.loc[0])
    for _, row in properties.iterrows():
        list_properties.append(
            Property(
                property_url=row["property_url"],
                mls=row["mls"],
                mls_id=row["mls_id"],
                status=row["status"],
                street=row["street"],
                unit=row["unit"],
                city=row["city"],
                state=row["state"],
                zip_code=row["zip_code"],
                style=row["style"],
                beds=row["beds"],
                full_baths=row["full_baths"],
                half_baths=row["half_baths"],
                sqft=row["sqft"],
                year_built=row["year_built"],
                days_on_mls=row["days_on_mls"],
                list_price=row["list_price"],
                list_date=row["list_date"],
                sold_price=row["sold_price"],
                last_sold_date=row["last_sold_date"],
                lot_sqft=row["lot_sqft"],
                price_per_sqft=row["price_per_sqft"],
                latitude=row["latitude"],
                longitude=row["longitude"],
                stories=row["stories"],
                hoa_fee=row["hoa_fee"],
                parking_garage=row["parking_garage"],
                primary_photo=row["primary_photo"],
            )
        )

    return list_properties
