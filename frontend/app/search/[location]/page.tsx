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
import Header from "@/app/ui/Header";
import Dropdown from "@/app/ui/Dropdown";
import { Button } from "@/app/ui/Button";
import Grid from "@/app/ui/Grid";
import PropertyCard from "./PropertyCard";
import Support from "@/app/home/Support";

import downArrow from "@/public/down-arrow.svg";
import upArrow from "@/public/up-arrow.svg";
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
  const [sort, setSort] = useState("newest");
  const [showSort, setShowSort] = useState(false);

  // marker focus + hover
  const [focus, setFocus] = useState(0); // index of property in properties
  const [hover, setHover] = useState<number | null>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  // pathname check + filter change
  useEffect(() => {
    const path_loc = pathname.split("/")[2];
    if (path_loc === "") {
      router.push("/search");
    }
    if (location !== decodeURIComponent(path_loc)) {
      dispatch({ type: "SET_LOCATION", payload: decodeURIComponent(path_loc) });
    }
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    pathname,
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
  ]);

  // sort properties
  useEffect(() => {
    const sorted = properties.slice().sort((a, b) => {
      if (sort === "newest") {
        if (listing_type === "for_sale") {
          return (
            new Date(b.list_date || "").getTime() -
            new Date(a.list_date || "").getTime()
          );
        }
        return (
          new Date(b.last_sold_date || "").getTime() -
          new Date(a.last_sold_date || "").getTime()
        );
      } else if (sort === "price_desc") {
        if (listing_type === "for_sale") {
          return (a.list_price || 0) - (b.list_price || 0);
        }
        return (a.sold_price || 0) - (b.sold_price || 0);
      } else if (sort === "price_asc") {
        if (listing_type === "for_sale") {
          return (b.list_price || 0) - (a.list_price || 0);
        }
        return (b.sold_price || 0) - (a.sold_price || 0);
      } else if (sort === "sqft_desc") {
        return (b.sqft || 0) - (a.sqft || 0);
      } else if (sort === "lot_sqft_desc") {
        return (b.lot_sqft || 0) - (a.lot_sqft || 0);
      } else if (sort === "price_per_sqft_desc") {
        return (b.price_per_sqft || 0) - (a.price_per_sqft || 0);
      }
      return 0;
    });
    dispatch({ type: "SET_PROPERTIES", payload: sorted });
    setFocus(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sort]);

  // focus card on click
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
              <Header className="p-8 gap-2 items-start border-b-2 max-h-60">
                <h1 className="text-xl md:text-2xl">
                  {location} Homes{" "}
                  {listing_type === "for_sale"
                    ? "For Sale"
                    : listing_type === "for_rent"
                    ? "For Rent"
                    : "Sold"}
                </h1>
                <h2 className="text-sm md:text-md">
                  {properties.length.toLocaleString()} homes
                </h2>
                <div
                  className="flex flex-row justify-center items-center gap-0.5"
                  onMouseLeave={() => {
                    setShowSort(false);
                  }}
                >
                  <h2 className="text-sm md:text-md">Sort by:</h2>
                  <div
                    className="relative gap-0.5 p-0.5 flex flex-row justify-center items-center"
                    onClick={() => {
                      setShowSort(!showSort);
                    }}
                  >
                    <h2 className="text-sm md:text-md">
                      {sort === "newest"
                        ? "Newest"
                        : sort === "price_desc"
                        ? "Price (Low to High)"
                        : sort === "price_asc"
                        ? "Price (High to Low)"
                        : sort === "sqft_desc"
                        ? "Square Feet (High to Low)"
                        : sort === "lot_sqft_desc"
                        ? "Lot Square Feet (High to Low)"
                        : sort === "price_per_sqft_desc"
                        ? "Price/Sqft (High to Low)"
                        : "Newest"}
                    </h2>
                    <Image
                      src={showSort ? upArrow : downArrow}
                      alt={showSort ? "Up Arrow" : "Down Arrow"}
                      className="w-6 h-6"
                    />
                    <Dropdown
                      className={`z-20 top-6 text-sm md:text-md ${
                        showSort ? "block" : "hidden"
                      }`}
                    >
                      <Button
                        className={`p-2 whitespace-nowrap ${
                          sort === "newest" ? "hidden" : "block"
                        }`}
                        onClick={() => {
                          setSort("newest");
                          setShowSort(false);
                        }}
                      >
                        Newest
                      </Button>
                      <Button
                        className={`p-2 whitespace-nowrap ${
                          sort === "price_desc" ? "hidden" : "block"
                        }`}
                        onClick={() => {
                          setSort("price_desc");
                          setShowSort(false);
                        }}
                      >
                        Price (Low to High)
                      </Button>
                      <Button
                        className={`p-2 whitespace-nowrap ${
                          sort === "price_asc" ? "hidden" : "block"
                        }`}
                        onClick={() => {
                          setSort("price_asc");
                          setShowSort(false);
                        }}
                      >
                        Price (High to Low)
                      </Button>
                      <Button
                        className={`p-2 whitespace-nowrap ${
                          sort === "sqft_desc" ? "hidden" : "block"
                        }`}
                        onClick={() => {
                          setSort("sqft_desc");
                          setShowSort(false);
                        }}
                      >
                        Sqft
                      </Button>
                      <Button
                        className={`p-2 whitespace-nowrap ${
                          sort === "lot_sqft_desc" ? "hidden" : "block"
                        }`}
                        onClick={() => {
                          setSort("lot_sqft_desc");
                          setShowSort(false);
                        }}
                      >
                        Lot Sqft
                      </Button>
                      <Button
                        className={`p-2 whitespace-nowrap ${
                          sort === "price_per_sqft_desc" ? "hidden" : "block"
                        }`}
                        onClick={() => {
                          setSort("price_per_sqft_desc");
                          setShowSort(false);
                        }}
                      >
                        Price/Sqft
                      </Button>
                    </Dropdown>
                  </div>
                </div>
              </Header>
              {/* h-[calc()] = h-screen (100vh) - nav (h-10 (2.5rem) + 2 * p-4 (1rem)) - header (max-h-60 (15rem) + 2 * p-8 (2rem)) - footer (text-lg (1.75rem) + 2 * p-4 (1rem))
               */}
              <Grid className="grid-cols-auto-fit-min-15 md:grid-cols-auto-fit-min-20 p-4 overflow-y-auto h-[calc(100vh-18.25rem)]">
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
