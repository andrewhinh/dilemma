"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import { sendRequest } from "../lib/api";

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

  const [query, setQuery] = useState("");
  const [queryMd, setQueryMd] = useState("");

  const handleClear = () => {
    setQuery("");
    setQueryMd("");
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    const formData = new FormData(e.target as HTMLFormElement);
    const formDataObj = Object.fromEntries(
      Array.from(formData.entries()).map(([key, value]) => [
        key,
        value.toString(),
      ])
    );

    if (formDataObj.query === "") {
      setLoading(false);
      return;
    }

    sendRequest("/property-data", "POST", formDataObj).then((data) => {
      if (data.detail) {
        setErrorMsg(data.detail);
      }
      setLoading(false);
      router.push("/search/" + data.uuid);
    });
  };

  return (
    <Form onSubmit={handleSubmit}>
      <div className="relative gap-2 flex">
        <Input
          type="text"
          name="query"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ZIP, Address, City..."
          className="block md:hidden w-48"
          autoFocus
        />
        <Input
          type="text"
          name="query-md"
          value={queryMd}
          onChange={(e) => setQueryMd(e.target.value)}
          placeholder="ZIP, Address, City/State, etc."
          className="hidden md:block md:w-96"
          autoFocus
        />
        <Button
          type="button"
          onClick={() => {
            handleClear();
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
      {errorMsg && <p className="text-rose-500">{errorMsg}</p>}
    </Form>
  );
}

export default Search;
