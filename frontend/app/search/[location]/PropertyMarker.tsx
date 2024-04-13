import React, { memo, useMemo, useState } from "react";
import L from "leaflet";
import { Marker, Tooltip, CircleMarker } from "react-leaflet";
import mapMarker from "@/public/cyan-map-marker.svg";
import { Property } from "@/app/providers";

interface PropertyMarkerProps {
  key: string;
  listingType: string;
  property: Property;
  isActive: boolean;
  showPopup: boolean;
  onClick: () => void;
}

const PropertyMarker = memo(
  ({
    key,
    listingType,
    property,
    isActive,
    showPopup,
    onClick,
  }: PropertyMarkerProps) => {
    const [hover, setHover] = useState(false);

    const markerIcon = useMemo(
      () =>
        new L.Icon({
          iconUrl: mapMarker.src,
          iconSize: [0, 0],
        }),
      []
    );

    if (showPopup) {
      return (
        <Marker
          position={[property.latitude ?? 0, property.longitude ?? 0]}
          icon={markerIcon}
        >
          <Tooltip
            className={`font-medium hover:bg-gray-700 hover:text-zinc-50 hover:z-10 ${
              isActive ? "invert text-zinc-50 z-10" : ""
            }`}
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
    } else {
      return (
        <CircleMarker
          key={`${key}-${hover}`}
          className={`${isActive ? "z-10" : ""}`}
          center={[property.latitude ?? 0, property.longitude ?? 0]}
          radius={5}
          color={hover || isActive ? "#06b6d4" : "#71717a"} // cyan-500, zinc-500
          fillOpacity={1}
          fillColor={hover || isActive ? "#06b6d4" : "#71717a"} // cyan-500, zinc-500
          eventHandlers={{
            click: onClick,
            mouseover: () => {
              setHover(true);
            },
            mouseout: () => {
              setHover(false);
            },
          }}
        />
      );
    }
  }
);

PropertyMarker.displayName = "PropertyMarker";

export default PropertyMarker;
