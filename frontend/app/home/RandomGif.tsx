/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useEffect } from "react";
import gifLoading from "@/public/gif-loading.svg";
import { useDebouncedCallback } from "use-debounce";
import { useSearchParams, usePathname, useRouter } from "next/navigation";

function RandomGif() {
  const defaultURL =
    "https://media.giphy.com/media/3o7527pa7qs9kCG78A/giphy.gif";

  const [url, setURL] = useState(gifLoading.src);
  const defaultTag = "dog";
  const defaultRating = "r";

  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const handleUpdate = () => {
    setURL(gifLoading.src);

    const tag = searchParams.get("tag")?.toString() || defaultTag;
    const rating = searchParams.get("rating")?.toString() || defaultRating;
    let giphyURL = encodeURI(
      `https://api.giphy.com/v1/gifs/random?api_key=${process.env.NEXT_PUBLIC_GIPHY_API_KEY}&rating=${rating}&tag=${tag}`
    );

    fetch(giphyURL, {
      method: "GET",
      headers: {
        accept: "application/json; charset=UTF-8",
      },
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then((data) => Promise.reject(data));
        }
        return response.json();
      })
      .then((data) => {
        setURL(data.data.images.original.url);
      })
      .catch(() => {
        setURL(defaultURL);
      });
  };

  const handleTagUpdate = useDebouncedCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const params = new URLSearchParams(searchParams);
      params.set("tag", event.target.value);
      replace(`${pathname}?${params.toString()}`, { scroll: false });
      handleUpdate();
    },
    300
  );

  const handleRatingUpdate = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    event.preventDefault();
    const params = new URLSearchParams(searchParams);
    params.set("rating", event.currentTarget.value);
    replace(`${pathname}?${params.toString()}`, { scroll: false });
    handleUpdate();
  };

  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    params.set("tag", defaultTag);
    params.set("rating", defaultRating);
    replace(`${pathname}?${params.toString()}`, { scroll: false });
    handleUpdate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <aside className="p-4 rounded-lg shadow-md flex flex-col justify-center items-center text-center gap-4">
      <img
        src={url}
        alt="Random Gif"
        className="p-4 object-contain w-96 max-h-48"
      />
      <form className="flex flex-col justify-center items-center text-center gap-2">
        <label htmlFor="tag" className="text-xl">
          GIF of...
        </label>
        <input
          type="text"
          id="tag"
          name="tag"
          defaultValue={searchParams.get("tag")?.toString()}
          onChange={(e) => handleTagUpdate(e)}
          className="mb-8 text-center text-amber-500"
        />
        <label htmlFor="rating" className="text-xl">
          Who&apos;s around?
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4">
          {["g", "pg", "pg-13", "r"].map((rate) => (
            <button
              key={rate}
              type="button"
              id={rate}
              name={rate}
              value={rate}
              onClick={(e) => handleRatingUpdate(e)}
              className={"rounded-lg shadow-md p-4 m-2 flex justify-center items-center hover:bg-blue-700".concat(
                searchParams.get("rating")?.toString() === rate
                  ? " bg-blue-700"
                  : " bg-blue-500"
              )}
            >
              <span>{rate.toUpperCase()}</span>
            </button>
          ))}
        </div>
      </form>
    </aside>
  );
}

export default RandomGif;
