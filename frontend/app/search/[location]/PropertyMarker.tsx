import React, { memo, useMemo } from "react";
import L from "leaflet";
import { Marker, Tooltip } from "react-leaflet";
import mapMarker from "@/public/cyan-map-marker.svg";
import { Property } from "@/app/providers";

interface PropertyMarkerProps {
  key: string;
  listingType: string;
  property: Property;
  isActive: boolean;
  onClick: () => void;
}

const PropertyMarker = memo(
  ({ key, listingType, property, isActive, onClick }: PropertyMarkerProps) => {
    const markerIcon = useMemo(
      () =>
        new L.Icon({
          iconUrl: mapMarker.src,
          iconSize: [25, 25],
        }),
      []
    );

    return (
      <Marker
        key={key}
        position={[property.latitude ?? 0, property.longitude ?? 0]}
        icon={markerIcon}
        eventHandlers={{
          click: onClick,
        }}
      >
        <Tooltip permanent={isActive} direction="top">
          {listingType === "sold" ? property.sold_price : property.list_price}
        </Tooltip>
      </Marker>
    );
  }
);

PropertyMarker.displayName = "PropertyMarker";

export default PropertyMarker;
