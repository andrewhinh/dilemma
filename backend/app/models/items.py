"""Item models."""

from uuid import UUID, uuid4

from sqlalchemy import ARRAY, INTEGER, String
from sqlmodel import Column, Field, Relationship, SQLModel


class SearchRequestBase(SQLModel):
    """Search request base model."""

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


class SearchRequest(SearchRequestBase, table=True):
    """Search request model."""

    id: int = Field(primary_key=True, index=True)
    uuid: UUID = Field(default_factory=lambda: uuid4(), unique=True)

    search_results: list["SearchResult"] = Relationship(back_populates="search_request")


class SearchRequestRead(SearchRequestBase):
    """Search request read model."""

    uuid: UUID


class PropertyBase(SQLModel):
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
    alt_photos: list[str | None] = Field(sa_column=Column(ARRAY(String)))
    neighborhoods: str | None = None


class SearchResultPropertyLink(SQLModel, table=True):
    """Search result property link model."""

    search_result_id: int = Field(foreign_key="searchresult.id", primary_key=True)
    property_id: int = Field(foreign_key="property.id", primary_key=True)


class Property(PropertyBase, table=True):
    """Property model."""

    id: int = Field(primary_key=True, index=True)
    uuid: UUID = Field(default_factory=lambda: uuid4(), unique=True)

    search_results: list["SearchResult"] = Relationship(
        back_populates="properties", link_model=SearchResultPropertyLink
    )


class PropertyRead(PropertyBase):
    """Property read model."""

    uuid: UUID


class SearchResultsBase(SQLModel):
    """Search results base model."""

    popups: list[int | None] = Field(sa_column=Column(ARRAY(INTEGER)))
    center_lat: float | None = None
    center_long: float | None = None


class SearchResult(SearchResultsBase, table=True):
    """Search result model."""

    id: int = Field(primary_key=True, index=True)
    uuid: UUID = Field(default_factory=lambda: uuid4(), unique=True)

    search_request_uuid: UUID = Field(foreign_key="searchrequest.uuid")
    search_request: SearchRequest = Relationship(back_populates="search_results")
    properties: list[Property] = Relationship(back_populates="search_results", link_model=SearchResultPropertyLink)


class SearchResultRead(SearchResultsBase):
    """Search result read model."""

    uuid: UUID
    search_request_uuid: UUID
    search_request: SearchRequestRead
    properties: list[PropertyRead]
