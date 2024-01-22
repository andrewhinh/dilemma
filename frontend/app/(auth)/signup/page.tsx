"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { sendRequest } from "../../lib/api";
import { useToProfile } from "../../lib/callbacks";
import validator from "validator";

import Form from "../../ui/Form";
import { ProfilePicture } from "../../ui/Upload";
import Input from "../../ui/Input";
import { FormButton } from "../../ui/Button";
import buttonLoading from "@/public/button-loading.svg";

function SignUp() {
  const toProfile = useToProfile();

  const [pic, setPic] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [verifiedEmail, setVerifiedEmail] = useState(false);
  const [code, setCode] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
    sendRequest("/verify-email", "POST", request).then((data) => {
      if (data.detail) setErrorMsg(data.detail);
      else setVerifiedEmail(true);
      setLoading(false);
    });
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
      "/token/signup",
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
          <ProfilePicture
            picture={pic}
            setErrorMsg={setErrorMsg}
            setPicture={setPic}
          />
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
              <Image src={buttonLoading} className="w-6 h-6" alt="Sign Up" />
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
              <Image
                src={buttonLoading}
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
