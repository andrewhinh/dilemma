"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { MapContainer, TileLayer } from "react-leaflet";
import Image from "next/image";

import { useConst } from "../../providers";
import { sendRequest } from "@/app/lib/api";
import { Property } from "@/app/providers";

import Main from "../../ui/Main";
import PropertyMarker from "./PropertyMarker";
import pageLoading from "@/public/page-loading.svg";
import "leaflet/dist/leaflet.css";

function Search() {
  const router = useRouter();
  const pathname = usePathname();
  const { state, dispatch } = useConst();
  const { location, replacements, properties } = state;

  const [focus, setFocus] = useState(0); // index of property in properties

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

  return (
    <>
      <div
        className={`flex flex-1 ${properties.length > 0 ? "block" : "hidden"}`}
      >
        {properties.length > 0 && (
          <>
            <MapContainer
              center={[
                properties[0]?.latitude || 0,
                properties[0]?.longitude || 0,
              ]}
              zoom={13}
              scrollWheelZoom={true}
              className="flex-1 hidden md:block"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {properties.map((property, index) => (
                <PropertyMarker
                  key={`${property.uuid}-${index === focus}`}
                  listingType={listingType}
                  property={property}
                  isActive={index === focus}
                  onClick={() => {
                    console.log(focus);
                    setFocus(index);
                  }}
                />
              ))}
            </MapContainer>
            <div className="flex flex-1">
              <h1>Search</h1>
            </div>
          </>
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
