import React, { ReactNode } from "react";
import NextImage from "next/image"; // HTMLImageElement conflicts with Image from next/image
import Input from "./Input";
import profileOutline from "@/public/profile-outline.svg";

interface UploadProps {
  upload?: string;
  children: ReactNode;
  className?: string;
}

function Upload({ children, className }: UploadProps) {
  const defaultClassName =
    "relative text-cyan-500 hover:text-zinc-500 hover:bg-slate-100 border-double border-4 border-cyan-500 shadow-2xl hover:shadow-none transition duration-300 ease-in-out";

  return (
    <div
      className={
        className ? `${className} ${defaultClassName}` : defaultClassName
      }
    >
      {children}
    </div>
  );
}

interface ProfilePictureProps {
  picture: string;
  setErrorMsg: (msg: string) => void;
  setPicture: (pic: string) => void;
  onChange?: (pic: string) => void;
}

function ProfilePicture({
  picture,
  setErrorMsg,
  setPicture,
  onChange,
}: ProfilePictureProps) {
  const handlePicUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileType = file.type.split("/")[0];
    if (fileType !== "image") {
      setErrorMsg("File type must be image");
      return;
    }

    const fileExtension = file.type.split("/")[1];
    if (!["png", "jpg", "jpeg"].includes(fileExtension)) {
      setErrorMsg("File type must be png, jpg, or jpeg");
      return;
    }

    const fileSize = file.size;
    if (fileSize > 3 * 1024 * 1024) {
      setErrorMsg("File size must be less than 3MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target && event.target.result) {
        const img = new Image();

        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          if (ctx) {
            const size = Math.min(img.width, img.height);
            const startX = (img.width - size) / 2;
            const startY = (img.height - size) / 2;

            canvas.width = 96; // w-24
            canvas.height = 96; // h-24

            ctx.drawImage(img, startX, startY, size, size, 0, 0, 96, 96);
            const croppedImageDataURL = canvas.toDataURL(file.type);
            setPicture(croppedImageDataURL);
            if (onChange) {
              onChange(croppedImageDataURL);
            }
          }
        };
        img.src = event.target.result as string;
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <Upload className="rounded-full p-12 w-24 h-24">
      <label
        htmlFor="pic-upload"
        className="absolute inset-0 cursor-pointer flex items-center justify-center"
      >
        <NextImage
          src={picture || profileOutline}
          alt="Profile Picture"
          width={96}
          height={96}
          className={`rounded-full ${picture ? "w-24 h-24" : "w-8 h-8"}`}
        />
      </label>
      <Input
        id="pic-upload"
        type="file"
        className="hidden"
        onChange={handlePicUpload}
        accept="image/png, image/jpg, image/jpg"
      />
    </Upload>
  );
}

function File() {
  return (
    <Upload className="p-12 w-48 h-48 rounded-lg">
      <label
        htmlFor="file-upload"
        className="absolute inset-0 cursor-pointer flex flex-col text-center items-center justify-center"
      >
        Upload to create flashcards
      </label>
      <Input id="file-upload" type="file" className="hidden" />
    </Upload>
  );
}

export { ProfilePicture, File };
