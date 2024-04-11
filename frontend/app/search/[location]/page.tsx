"use client";

import React, { useEffect, useState, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { MapContainer, TileLayer } from "react-leaflet";
import Image from "next/image";

import { useConst } from "../../providers";
import { sendRequest } from "@/app/lib/api";
import { Property } from "@/app/providers";

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
  const { location, replacements, properties } = state;

  const [focus, setFocus] = useState(0); // index of property in properties
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  const [listingType, setListingType] = useState("for_sale"); // for_rent, for_sale, sold
  const [radius, setRadius] = useState(null); // miles
  const [mlsOnly, setMlsOnly] = useState(null); // only show properties with MLS
  const [pastDays, setPastDays] = useState(null);
  const [dateFrom, setDateFrom] = useState(null); // "YYYY-MM-DD"
  const [dateTo, setDateTo] = useState(null);
  const [foreclosure, setForeclosure] = useState(null);

  const [beds, setBeds] = useState(null);
  const [listPrice, setListPrice] = useState(null);
  const [fullBaths, setFullBaths] = useState(null);
  const [listDate, setListDate] = useState(null);
  const [parkingGarage, setParkingGarage] = useState(null);
  const [halfBaths, setHalfBaths] = useState(null);
  const [sqft, setSqft] = useState(null);
  const [soldPrice, setSoldPrice] = useState(null);
  const [yearBuilt, setYearBuilt] = useState(null);
  const [lastSoldDate, setLastSoldDate] = useState(null);
  const [stories, setStories] = useState(null);
  const [pricePerSqft, setPricePerSqft] = useState(null);
  const [mls, setMls] = useState(null);
  const [lotSqft, setLotSqft] = useState(null);
  const [hoaFee, setHoaFee] = useState(null);
  const [style, setStyle] = useState(null);
  const [daysOnMls, setDaysOnMls] = useState(null);

  useEffect(() => {
    const path_loc = pathname.split("/")[2];
    if (path_loc === "") {
      router.push("/search");
    }
    dispatch({ type: "SET_LOCATION", payload: path_loc });
    if (properties.length === 0) {
      sendRequest("/search/properties", "POST", { location: path_loc }).then(
        (data) => {
          if (Array.isArray(data)) {
            router.push("/search");
          } else {
            dispatch({
              type: "SET_PROPERTIES",
              payload: data.properties as Property[],
            });
          }
        }
      );
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
              center={[
                properties[0]?.latitude || 0,
                properties[0]?.longitude || 0,
              ]}
              zoom={
                properties.length > 10000
                  ? 12
                  : properties.length > 1000
                  ? 13
                  : 14
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
                  key={`${property.uuid}-marker-${index === focus}`}
                  listingType={listingType}
                  property={property}
                  isActive={index === focus}
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
                    listingType={listingType}
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
