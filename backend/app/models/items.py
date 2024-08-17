"""Item models."""

from pydantic import BaseModel


class SearchRequest(BaseModel):
    """Search request model."""

    location: str
    listing_type: str = "for_sale"  # for_rent, for_sale, sold
    radius: float | None = None  # miles
    mls_only: bool | None = None  # only show properties with MLS
    past_days: int | None = None
    date_from: str | None = None  # "YYYY-MM-DD"
    date_to: str | None = None
    foreclosure: bool | None = None

    min_price: float | None = None
    max_price: float | None = None
    min_beds: int | None = None
    max_beds: int | None = None
    min_baths: int | None = None
    max_baths: int | None = None
    style: str | None = None
    min_sqft: int | None = None
    max_sqft: int | None = None
    min_lot_sqft: int | None = None
    max_lot_sqft: int | None = None
    min_stories: int | None = None
    max_stories: int | None = None
    min_year_built: int | None = None
    max_year_built: int | None = None
    min_price_per_sqft: float | None = None
    max_price_per_sqft: float | None = None
    hoa_fee: float | None = None
    parking_garage: int | None = None


class Property(BaseModel):
    """Property base model."""

    property_url: str | None = None
    mls: str | None = None
    mls_id: str | None = None
    status: str | None = None
    street: str | None = None
    unit: str | None = None
    city: str | None = None
    state: str | None = None
    zip_code: str | None = None
    style: str | None = None
    beds: int | None = None
    full_baths: int | None = None
    half_baths: int | None = None
    sqft: int | None = None
    year_built: int | None = None
    stories: int | None = None
    lot_sqft: int | None = None
    days_on_mls: int | None = None
    list_price: float | None = None
    list_date: str | None = None
    pending_date: str | None = None
    sold_price: float | None = None
    last_sold_date: str | None = None
    price_per_sqft: float | None = None
    hoa_fee: float | None = None
    latitude: float | None = None
    longitude: float | None = None
    parking_garage: int | None = None
    primary_photo: str | None = None
    alt_photos: list[str | None] = None
    neighborhoods: str | None = None


class SearchResult(BaseModel):
    """Search results model."""

    popups: list[int | None] = None
    center_lat: float | None = None
    center_long: float | None = None
    properties: list[Property] = None
