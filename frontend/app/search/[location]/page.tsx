"use client";

import React, { useEffect, useState, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { MapContainer, TileLayer } from "react-leaflet";
import Image from "next/image";

import { useConst } from "../../providers";
import useSearch from "../utils";

import { MainNav } from "@/app/ui/Nav";
import Main from "../../ui/Main";
import PropertyMarker from "./PropertyMarker";
import Grid from "@/app/ui/Grid";
import PropertyCard from "./PropertyCard";
import Support from "@/app/home/Support";

import pageLoading from "@/public/page-loading.svg";
import "leaflet/dist/leaflet.css";

function Search() {
  const router = useRouter();
  const pathname = usePathname();
  const { state, dispatch } = useConst();
  const search = useSearch();
  const {
    location,
    listing_type,
    radius,
    mls_only,
    past_days,
    date_from,
    date_to,
    foreclosure,
    min_price,
    max_price,
    min_beds,
    max_beds,
    min_baths,
    max_baths,
    style,
    min_sqft,
    max_sqft,
    min_lot_sqft,
    max_lot_sqft,
    min_stories,
    max_stories,
    min_year_built,
    max_year_built,
    min_price_per_sqft,
    max_price_per_sqft,
    hoa_fee,
    parking_garage,
    replacements,
    popups,
    center_lat,
    center_long,
    properties,
  } = state;

  // marker focus + hover
  const [focus, setFocus] = useState(0); // index of property in properties
  const [hover, setHover] = useState<number | null>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const path_loc = pathname.split("/")[2];
    if (path_loc === "") {
      router.push("/search");
    }
    dispatch({ type: "SET_LOCATION", payload: decodeURIComponent(path_loc) });
    if (properties.length === 0) {
      search({
        location: decodeURIComponent(path_loc),
        listing_type: listing_type,
        radius: radius,
        mls_only: mls_only,
        past_days: past_days,
        date_from: date_from,
        date_to: date_to,
        foreclosure: foreclosure,
        min_price: min_price,
        max_price: max_price,
        min_beds: min_beds,
        max_beds: max_beds,
        min_baths: min_baths,
        max_baths: max_baths,
        style: style,
        min_sqft: min_sqft,
        max_sqft: max_sqft,
        min_lot_sqft: min_lot_sqft,
        max_lot_sqft: max_lot_sqft,
        min_stories: min_stories,
        max_stories: max_stories,
        min_year_built: min_year_built,
        max_year_built: max_year_built,
        min_price_per_sqft: min_price_per_sqft,
        max_price_per_sqft: max_price_per_sqft,
        hoa_fee: hoa_fee,
        parking_garage: parking_garage,
      })
        .then(() => {
          if (replacements.length > 0) router.push("/search");
        })
        .catch(() => {
          router.push("/search");
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (properties.length > 0 && cardRefs.current[focus]) {
      cardRefs.current[focus]?.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "center",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focus]);

  return (
    <>
      <div
        className={`flex flex-col max-h-screen ${
          properties.length > 0 ? "block" : "hidden"
        }`}
      >
        <MainNav />
        {properties.length > 0 && (
          <div className="flex flex-row flex-1">
            <MapContainer
              center={[center_lat || 0, center_long || 0]}
              zoom={
                properties.length > 10000
                  ? 11
                  : properties.length > 1000
                  ? 12
                  : 13
              }
              scrollWheelZoom={true}
              className="flex-1 hidden md:block"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {properties.map((property, index) => (
                <PropertyMarker
                  key={`${property.uuid}-marker-${index === focus}-${
                    index === hover
                  }`}
                  listingType={listing_type}
                  property={property}
                  isActive={index === focus}
                  isHovered={index === hover}
                  showPopup={popups.includes(index)}
                  onMouseEnter={() => {
                    setHover(index);
                  }}
                  onMouseLeave={() => {
                    setHover(null);
                  }}
                  onClick={() => {
                    setFocus(index);
                  }}
                />
              ))}
            </MapContainer>
            <div className="flex flex-col flex-1">
              {/* h-screen (100vh) - nav (h-10 (2.5rem) + 2 * p-4 (1rem)) - footer (text-lg (1.75rem) + 2 * p-4 (1rem))
               */}
              <Grid className="p-4 overflow-y-auto h-[calc(100vh-8.25rem)]">
                {properties.map((property, index) => (
                  <PropertyCard
                    key={`${property.uuid}-card-${index === focus}`}
                    ref={(el) => {
                      cardRefs.current[index] = el;
                    }}
                    listingType={listing_type}
                    property={property}
                    isActive={index === focus}
                    onClick={() => {
                      window.open(
                        `/property/${property.street || ""}-${
                          property.unit || ""
                        }-${property.city || ""}-${property.state || ""}-${
                          property.zip_code || ""
                        }`,
                        "_blank"
                      );
                    }}
                  />
                ))}
              </Grid>
              <Support />
            </div>
          </div>
        )}
      </div>
      <Main className={`${properties.length > 0 ? "hidden" : "block"}`}>
        <Image
          src={pageLoading}
          alt="Loading"
          className="w-24 md:w-48 object-contain"
        />
      </Main>
    </>
  );
}

export default Search;
