"""Item models."""

from sqlmodel import Field, SQLModel


class Property(SQLModel, table=True):
    """Property model."""

    id: int = Field(primary_key=True, index=True)
    property_url: str
    mls: str
    mls_id: str
    status: str
    street: str
    unit: str
    city: str
    state: str
    zip_code: str
    style: str
    beds: int
    full_baths: int
    half_baths: int
    sqft: int
    year_built: int
    days_on_mls: int
    list_price: float
    list_date: str
    sold_price: float
    last_sold_date: str
    lot_sqft: int
    price_per_sqft: float
    latitude: float
    longitude: float
    stories: int
    hoa_fee: float
    parking_garage: bool
    primary_photo: str
