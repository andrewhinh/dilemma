"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import { sendRequest } from "../lib/api";
import { Property } from "../providers";
import { useConst } from "../providers";

import Form from "../ui/Form";
import Input from "../ui/Input";
import { Button } from "../ui/Button";
import x from "@/public/x.svg";
import search from "@/public/search.svg";
import buttonLoading from "@/public/button-loading.svg";

function Search() {
  const router = useRouter();
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const { state, dispatch } = useConst();
  const { location, replacements } = state;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    if (location === "") {
      setErrorMsg("Please enter a location.");
      setLoading(false);
      return;
    }

    sendRequest("/search/properties", "POST", { location: location }).then(
      (data) => {
        if (data.detail) {
          setErrorMsg(data.detail);
        }
        if (Array.isArray(data)) {
          dispatch({ type: "SET_REPLACEMENTS", payload: data as string[] });
        } else {
          dispatch({
            type: "SET_PROPERTIES",
            payload: data.properties as Property[],
          });
          router.push("/search/" + encodeURIComponent(location));
        }
        setLoading(false);
      }
    );
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
                src={search}
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
