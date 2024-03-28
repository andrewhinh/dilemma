"""Item models."""

from uuid import UUID, uuid4

from pydantic import BaseModel
from sqlmodel import Field, Relationship, SQLModel


class Request(BaseModel):
    """Request model."""

    query: str


class AltPhoto(SQLModel, table=True):
    """Alternate photo model."""

    id: int = Field(primary_key=True, index=True)
    uuid: UUID = Field(default_factory=lambda: uuid4(), unique=True)
    url: str | None = Field(default=None)

    property_uuid: UUID = Field(default=None, foreign_key="property.uuid")
    property: "Property" = Relationship(back_populates="alt_photos")


class Property(SQLModel, table=True):
    """Property model."""

    id: int = Field(primary_key=True, index=True)
    uuid: UUID = Field(default_factory=lambda: uuid4(), unique=True)
    property_url: str | None = Field(default=None)
    mls: str | None = Field(default=None)
    mls_id: str | None = Field(default=None)
    status: str | None = Field(default=None)
    street: str | None = Field(default=None)
    unit: str | None = Field(default=None)
    city: str | None = Field(default=None)
    state: str | None = Field(default=None)
    zip_code: str | None = Field(default=None)
    style: str | None = Field(default=None)
    beds: int | None = Field(default=None)
    full_baths: int | None = Field(default=None)
    half_baths: int | None = Field(default=None)
    sqft: int | None = Field(default=None)
    year_built: int | None = Field(default=None)
    stories: int | None = Field(default=None)
    lot_sqft: int | None = Field(default=None)
    days_on_mls: int | None = Field(default=None)
    list_price: float | None = Field(default=None)
    list_date: str | None = Field(default=None)
    pending_date: str | None = Field(default=None)
    sold_price: float | None = Field(default=None)
    last_sold_date: str | None = Field(default=None)
    price_per_sqft: float | None = Field(default=None)
    hoa_fee: float | None = Field(default=None)
    latitude: float | None = Field(default=None)
    longitude: float | None = Field(default=None)
    parking_garage: int | None = Field(default=None)
    primary_photo: str | None = Field(default=None)
    alt_photos: list[AltPhoto | None] = Relationship(back_populates="property")
    neighborhoods: str | None = Field(default=None)

    search_result_uuid: UUID = Field(
        default=None,
        foreign_key="searchresult.uuid",
    )
    search_result: "SearchResult" = Relationship(back_populates="properties")


class SearchResultBase(SQLModel):
    """Search result base model."""

    location: str = Field(default=None)
    listing_type: str = Field(default=None)
    radius: float | None = Field(default=None)
    mls_only: bool | None = Field(default=None)
    past_days: int | None = Field(default=None)
    date_from: str | None = Field(default=None)
    date_to: str | None = Field(default=None)
    foreclosure: bool | None = Field(default=None)


class SearchResult(SearchResultBase, table=True):
    """Search result model."""

    id: int = Field(primary_key=True, index=True)
    uuid: UUID = Field(default_factory=lambda: uuid4(), unique=True)

    properties: list[Property | None] = Relationship(back_populates="search_result")


class SearchResultRead(SearchResultBase):
    """Search result read model."""

    uuid: UUID
    properties: list[Property | None]
