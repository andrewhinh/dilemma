"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import { useConst } from "../providers";
import useSearch from "./utils";

import Form from "../ui/Form";
import Input from "../ui/Input";
import { Button } from "../ui/Button";
import x from "@/public/x.svg";
import searchIcon from "@/public/search.svg";
import buttonLoading from "@/public/button-loading.svg";

function Search() {
  const router = useRouter();
  const search = useSearch();

  const { state, dispatch } = useConst();
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
  } = state;
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    if (location === "") {
      setErrorMsg("Please enter a location.");
      setLoading(false);
      return;
    }

    search({
      location: location,
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
        if (replacements.length > 0) {
          return;
        }
        router.push("/search/" + encodeURIComponent(location));
      })
      .catch((reason) => {
        setErrorMsg(reason);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <>
      <p className="text-base md:text-lg">Search properties to buy or rent:</p>
      <Form onSubmit={handleSubmit}>
        <div className="flex flex-col gap-2">
          <div className="relative flex gap-2">
            <Input
              type="text"
              name="location"
              value={location}
              onChange={(e) =>
                dispatch({ type: "SET_LOCATION", payload: e.target.value })
              }
              placeholder="ZIP, Address, City..."
              className="block md:hidden w-48"
              autoFocus
            />
            <Input
              type="text"
              name="location-md"
              value={location}
              onChange={(e) =>
                dispatch({ type: "SET_LOCATION", payload: e.target.value })
              }
              placeholder="ZIP, Address, City/State, etc."
              className="hidden md:block md:w-96"
              autoFocus
            />
            <Button
              type="button"
              onClick={() => {
                dispatch({ type: "SET_LOCATION", payload: "" });
                dispatch({ type: "SET_REPLACEMENTS", payload: [] });
              }}
              className="absolute right-14 top-2 bg-transparent invert"
            >
              <Image src={x} className="w-6 h-6" alt="Clear" />
            </Button>
            <Button className="w-10">
              <Image
                src={buttonLoading}
                className={`w-6 h-6 ${loading ? "block" : "hidden"}`}
                alt="Search"
              />
              <Image
                src={searchIcon}
                className={`w-6 h-6 ${loading ? "hidden" : "block"}`}
                alt="Search"
              />
            </Button>
          </div>
        </div>
        {errorMsg && <p className="text-rose-500">{errorMsg}</p>}
      </Form>
      <div
        className={`bg-slate-100 shadow-md w-48 md:w-96 ${
          replacements.length === 0 ? "hidden" : "block"
        }`}
      >
        <p className="text-base md:text-lg bg-slate-300 p-4">Did you mean:</p>
        {replacements.map((r) => (
          <Button
            key={r}
            className="border-t border-zinc-500 p-4 bg-transparent text-zinc-500 w-full font-normal"
            onClick={() => {
              dispatch({ type: "SET_LOCATION", payload: r });
              dispatch({ type: "SET_REPLACEMENTS", payload: [] });
            }}
          >
            {r}
          </Button>
        ))}
      </div>
    </>
  );
}

export default Search;
