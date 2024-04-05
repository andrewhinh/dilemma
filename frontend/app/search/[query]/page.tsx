"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

import Image from "next/image";

import Main from "../../ui/Main";

import pageLoading from "@/public/page-loading.svg";
import "leaflet/dist/leaflet.css"; // Ensuring Leaflet's CSS is loaded

function Search() {
  return (
    <div className="flex flex-row flex-1">
      <MapContainer center={[51.505, -0.09]} zoom={13} scrollWheelZoom={false} className="flex-1 hidden md:block">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[51.505, -0.09]}>
        <Popup>
          A pretty CSS3 popup. <br /> Easily customizable.
        </Popup>
      </Marker>
    </MapContainer>
    <div className="flex-1">
      <h1>Search</h1>
    </div>
      {/* <Main>
        <Image
          src={pageLoading}
          alt="Loading"
          className="w-24 md:w-48 object-contain"
        />
      </Main> */}
    </div>
  );
}

export default Search;
