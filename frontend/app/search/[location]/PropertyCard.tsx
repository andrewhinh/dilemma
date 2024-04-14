import { useState } from "react";
import Image from "next/image";
import { memo, forwardRef } from "react";
import { Property } from "@/app/providers";

import { Button } from "@/app/ui/Button";
import leftArrow from "@/public/left-arrow.svg";
import rightArrow from "@/public/right-arrow.svg";

interface PropertyCardProps {
  listingType: string;
  property: Property;
  isActive: boolean;
  onClick: () => void;
}

const PropertyCard = memo(
  forwardRef<HTMLDivElement, PropertyCardProps>(
    ({ listingType, property, isActive, onClick }, ref) => {
      const altPhotos = property.alt_photos || [];

      const [photoIndex, setPhotoIndex] = useState(0);

      const nextPhoto = (event: { stopPropagation: () => void }) => {
        event.stopPropagation(); // Prevent outer div's onClick
        if (altPhotos.length > 0) {
          setPhotoIndex((prevIndex) => (prevIndex + 1) % altPhotos.length);
        }
      };

      const prevPhoto = (event: { stopPropagation: () => void }) => {
        event.stopPropagation();
        if (altPhotos.length > 0) {
          setPhotoIndex(
            (prevIndex) => (prevIndex - 1 + altPhotos.length) % altPhotos.length
          );
        }
      };

      const currentPhoto =
        altPhotos.length > 0 ? altPhotos[photoIndex] : property.primary_photo;

      return (
        <div
          ref={ref}
          className={`flex flex-col w-60 h-60 md:w-80 md:h-80 gap-2 shadow-md rounded-lg border-2 border-solid hover:shadow-xl ${
            isActive ? "border-cyan-500" : ""
          }`}
          onClick={onClick}
        >
          {currentPhoto && (
            <div className="relative">
              <Image
                className="w-60 max-h-32 md:w-80 md:max-h-52 object-fill rounded-t-md"
                width={240} // w-60
                height={160} // max-h-40
                src={currentPhoto}
                alt="Property Photo"
              />
              {altPhotos.length > 0 && (
                <div className="absolute p-1 top-2 right-2 bg-gray-700 text-zinc-50 text-xs rounded-lg">
                  {`${photoIndex + 1}/${altPhotos.length}`}
                </div>
              )}
              <Button className="absolute left-2 top-1/2" onClick={prevPhoto}>
                <Image
                  className="invert w-8 h-8"
                  src={leftArrow}
                  alt="Previous Photo"
                />
              </Button>
              <Button className="absolute right-2 top-1/2" onClick={nextPhoto}>
                <Image
                  className="invert w-8 h-8"
                  src={rightArrow}
                  alt="Next Photo"
                />
              </Button>
            </div>
          )}
          <div className="flex flex-col pt-2 pb-4 px-2">
            <h1 className="text-base md:text-lg font-bold">
              {listingType === "sold"
                ? property.sold_price
                  ? `$${property.sold_price.toLocaleString()}`
                  : ""
                : property.list_price
                ? `$${property.list_price.toLocaleString()}`
                : ""}
            </h1>
            <div className="flex gap-2 text-sm">
              <h2>{property.beds || "-"} beds</h2>
              <h2>
                {(property.full_baths || 0) + (property.half_baths || 0) / 2 ||
                  "-"}{" "}
                baths
              </h2>
              <h2>{property.sqft || "-"} sqft</h2>
            </div>
            <h3 className="text-xs">
              {`${property.street || ""}${
                property.unit ? `, ${property.unit}` : ""
              }${property.city ? `, ${property.city}` : ""}${
                property.state ? `, ${property.state}` : ""
              }${property.zip_code ? ` ${property.zip_code}` : ""}`}
            </h3>
          </div>
        </div>
      );
    }
  )
);

export default PropertyCard;
