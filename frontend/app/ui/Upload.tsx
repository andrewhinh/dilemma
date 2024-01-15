/* eslint-disable @next/next/no-img-element */
import React, { ReactNode } from "react";
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
  picture?: string;
  handleUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

function ProfilePicture({ picture, handleUpload }: ProfilePictureProps) {
  return (
    <Upload className="rounded-full p-12 w-24 h-24">
      <label
        htmlFor="pic-upload"
        className="absolute inset-0 cursor-pointer flex items-center justify-center"
      >
        <img
          src={picture ? picture : profileOutline.src}
          alt="Profile Picture"
          className={`rounded-full ${picture ? "w-24 h-24" : "w-8 h-8"}`}
        />
      </label>
      <Input
        id="pic-upload"
        type="file"
        className="hidden"
        onChange={handleUpload}
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
