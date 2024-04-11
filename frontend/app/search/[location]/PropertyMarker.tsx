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
          iconSize: [0, 0],
        }),
      []
    );

    return (
      <Marker
        key={key}
        position={[property.latitude ?? 0, property.longitude ?? 0]}
        icon={markerIcon}
      >
        <Tooltip
          className={`font-medium ${isActive ? "invert text-zinc-50 z-10" : ""}`}
          permanent={true}
          direction="top"
          interactive={true}
          eventHandlers={{
            click: onClick,
          }}
        >
          {listingType === "sold"
            ? property.sold_price
              ? property.sold_price < 1000000
                ? `${property.sold_price.toString().slice(0, 3)}K`
                : `${(property.sold_price / 1000000).toFixed(2)}M`
              : ""
            : property.list_price
            ? property.list_price < 1000000
              ? `${property.list_price.toString().slice(0, 3)}K`
              : `${(property.list_price / 1000000).toFixed(2)}M`
            : ""}
        </Tooltip>
      </Marker>
    );
  }
);

PropertyMarker.displayName = "PropertyMarker";

export default PropertyMarker;
