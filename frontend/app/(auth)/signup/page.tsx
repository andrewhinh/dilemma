/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import Link from "next/link";

import { useConst } from "../../providers";
import { useToProfile } from "../../lib/utils";

import validator from "validator";

import Form from "../../ui/Form";
import { ProfilePicture } from "../../ui/Upload";
import Input from "../../ui/Input";
import { FormButton } from "../../ui/Button";

function SignUp() {
  const { apiUrl } = useConst();
  const toProfile = useToProfile();

  const signUpUrl = apiUrl + "/token/signup";

  const [pic, setPic] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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

            // Update ProfilePicture if this is changed
            canvas.width = 96;
            canvas.height = 96;

            ctx.drawImage(img, startX, startY, size, size, 0, 0, 96, 96);
            const croppedImageDataURL = canvas.toDataURL(file.type);
            setPic(croppedImageDataURL);
          }
        };
        img.src = event.target.result as string;
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setLoading(true);
    setErrorMsg(null);

    const formData = new FormData(e.target as HTMLFormElement);
    const formDataObj = Object.fromEntries(
      Array.from(formData.entries()).map(([key, value]) => [
        key,
        value.toString(),
      ])
    );

    if (pic) formDataObj.profile_picture = pic;

    if (formDataObj.email === "") {
      setErrorMsg("Email cannot be empty");
      setLoading(false);
      return;
    }

    if (!validator.isEmail(formDataObj.email)) {
      setErrorMsg("Email is not valid");
      setLoading(false);
      return;
    }

    if (formDataObj.username === "") {
      setErrorMsg("Username cannot be empty");
      setLoading(false);
      return;
    }

    if (formDataObj.password === "") {
      setErrorMsg("Password cannot be empty");
      setLoading(false);
      return;
    }

    if (formDataObj.confirm_password === "") {
      setErrorMsg("Confirm password cannot be empty");
      setLoading(false);
      return;
    }

    if (formDataObj.password !== formDataObj.confirm_password) {
      setErrorMsg("Passwords do not match");
      setLoading(false);
      return;
    }

    toProfile(
      signUpUrl,
      formDataObj,
      () => setLoading(false),
      (error) => {
        setErrorMsg(error);
        setLoading(false);
      }
    );
  };

  return (
    <Form onSubmit={handleSubmit}>
      <ProfilePicture picture={pic} handleUpload={handlePicUpload} />
      <div className="gap-2 flex flex-col text-left">
        <Input type="email" name="email" placeholder="Email" autoFocus />
        <Input
          type="username"
          name="username"
          placeholder="Username"
          autoFocus
        />
        <Input type="password" name="password" placeholder="Password" />
        <Input
          type="password"
          name="confirm_password"
          placeholder="Confirm Password"
        />
        <Link
          href="/login"
          className="text-md underline hover:opacity-50 transition 300ms ease-in-out"
        >
          Already have an account?
        </Link>
      </div>
      <FormButton>Sign Up</FormButton>
      {errorMsg && <p className="text-rose-500">{errorMsg}</p>}
      {loading && <p>Loading...</p>}
    </Form>
  );
}

export default SignUp;
