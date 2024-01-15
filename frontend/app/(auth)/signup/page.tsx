/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import Link from "next/link";
import { useSendRequest } from "../../lib/utils";
import { useConst } from "../../providers";
import { useToProfile } from "../../lib/utils";

import validator from "validator";

import Form from "../../ui/Form";
import { ProfilePicture } from "../../ui/Upload";
import Input from "../../ui/Input";
import { FormButton } from "../../ui/Button";
import buttonLoading from "@/public/button-loading.svg";

function SignUp() {
  const { apiUrl } = useConst();
  const toProfile = useToProfile();
  const sendRequest = useSendRequest();

  const verifyEmailUrl = apiUrl + "/verify-email";
  const signUpUrl = apiUrl + "/token/signup";

  const [pic, setPic] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [verifiedEmail, setVerifiedEmail] = useState(false);
  const [code, setCode] = useState("");
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

  const handleSendEmail = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setLoading(true);
    setErrorMsg(null);

    if (email === "") {
      setErrorMsg("Email cannot be empty");
      setLoading(false);
      return;
    }

    if (!validator.isEmail(email)) {
      setErrorMsg("Email is not valid");
      setLoading(false);
      return;
    }

    if (username === "") {
      setErrorMsg("Username cannot be empty");
      setLoading(false);
      return;
    }

    if (password === "") {
      setErrorMsg("Password cannot be empty");
      setLoading(false);
      return;
    }

    if (confirmPassword === "") {
      setErrorMsg("Confirm password cannot be empty");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match");
      setLoading(false);
      return;
    }

    let request = {
      profile_picture: pic,
      email: email,
      username: username,
      password: password,
      confirm_password: confirmPassword,
    };
    sendRequest(verifyEmailUrl, "POST", request)
      .then(() => {
        setVerifiedEmail(true);
      })
      .catch((error) => setErrorMsg(error.detail || error))
      .finally(() => setLoading(false));
  };

  const handleCodeSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setLoading(true);
    setErrorMsg(null);

    if (email === "") {
      setErrorMsg("Email cannot be empty");
      setLoading(false);
      return;
    }

    if (!validator.isEmail(email)) {
      setErrorMsg("Email is not valid");
      setLoading(false);
      return;
    }

    if (username === "") {
      setErrorMsg("Username cannot be empty");
      setLoading(false);
      return;
    }

    if (password === "") {
      setErrorMsg("Password cannot be empty");
      setLoading(false);
      return;
    }

    if (confirmPassword === "") {
      setErrorMsg("Confirm password cannot be empty");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match");
      setLoading(false);
      return;
    }

    if (code === "") {
      setErrorMsg("Code cannot be empty");
      setLoading(false);
      return;
    }

    let request = {
      profile_picture: pic,
      email: email,
      username: username,
      password: password,
      confirm_password: confirmPassword,
      verify_code: code,
    };
    toProfile(
      signUpUrl,
      request,
      () => setLoading(false),
      (error) => {
        setErrorMsg(error);
        setLoading(false);
      }
    );
  };

  return (
    <>
      {!verifiedEmail ? (
        <Form onSubmit={handleSendEmail}>
          <ProfilePicture picture={pic} handleUpload={handlePicUpload} />
          <div className="gap-2 flex flex-col text-left">
            <Input
              type="email"
              name="email"
              value={email}
              placeholder="Email"
              autoFocus
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              type="username"
              name="username"
              value={username}
              placeholder="Username"
              onChange={(e) => setUsername(e.target.value)}
            />
            <Input
              type="password"
              name="password"
              value={password}
              placeholder="Password"
              onChange={(e) => setPassword(e.target.value)}
            />
            <Input
              type="password"
              name="confirm_password"
              value={confirmPassword}
              placeholder="Confirm Password"
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <Link
              href="/login"
              className="text-md underline hover:opacity-50 transition 300ms ease-in-out"
            >
              Already have an account?
            </Link>
          </div>
          <FormButton>
            {loading ? (
              <img src={buttonLoading.src} className="w-6 h-6" alt="Sign Up" />
            ) : (
              <p>Sign Up</p>
            )}
          </FormButton>
          {errorMsg && <p className="text-rose-500">{errorMsg}</p>}
        </Form>
      ) : (
        <Form onSubmit={handleCodeSubmit}>
          <p>A verification code has been sent to your email.</p>
          <Input
            type="text"
            name="code"
            value={code}
            placeholder="Code"
            autoFocus
            onChange={(e) => setCode(e.target.value)}
          />
          <FormButton>
            {loading ? (
              <img
                src={buttonLoading.src}
                className="w-6 h-6"
                alt="Verify Code"
              />
            ) : (
              <p>Verify Code</p>
            )}
          </FormButton>
          {errorMsg && <p className="text-rose-500">{errorMsg}</p>}
        </Form>
      )}
    </>
  );
}

export default SignUp;
