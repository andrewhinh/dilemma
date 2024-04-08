"""Item models."""

from uuid import UUID, uuid4

from sqlmodel import Field, Relationship, SQLModel


class SearchRequest(SQLModel):
    """Search request model."""

    location: str
    listing_type: str = "for_sale"  # for_rent, for_sale, sold
    radius: float | None = None  # miles
    mls_only: bool | None = None  # only show properties with MLS
    past_days: int | None = None
    date_from: str | None = None  # "YYYY-MM-DD"
    date_to: str | None = None
    foreclosure: bool | None = None


class AltPhoto(SQLModel, table=True):
    """Alternate photo model."""

    id: int = Field(primary_key=True, index=True)
    uuid: UUID = Field(default_factory=lambda: uuid4(), unique=True)
    url: str | None = Field(default=None)

    property_uuid: UUID = Field(default=None, foreign_key="property.uuid")
    property: "Property" = Relationship(back_populates="alt_photos")


class AltPhotoRead(SQLModel):
    """Alternate photo read model."""

    uuid: UUID
    url: str | None


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
    neighborhoods: str | None = None


class Property(PropertyBase, table=True):
    """Property model."""

    id: int = Field(primary_key=True, index=True)
    uuid: UUID = Field(default_factory=lambda: uuid4(), unique=True)

    alt_photos: list[AltPhoto | None] = Relationship(back_populates="property")

    search_result_uuid: UUID = Field(
        default=None,
        foreign_key="searchresult.uuid",
    )
    search_result: "SearchResult" = Relationship(back_populates="properties")


class PropertyRead(PropertyBase):
    """Property read model."""

    uuid: UUID
    alt_photos: list[AltPhotoRead | None]


class SearchResult(SQLModel, table=True):
    """Search result model."""

    id: int = Field(primary_key=True, index=True)
    uuid: UUID = Field(default_factory=lambda: uuid4(), unique=True)

    properties: list[Property | None] = Relationship(back_populates="search_result")


class SearchResultRead(SQLModel):
    """Search result read model."""

    uuid: UUID
    properties: list[PropertyRead | None]
