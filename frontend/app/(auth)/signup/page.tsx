"use client";

import { useEffect, useState, Suspense } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import validator from "validator";

import { sendRequest } from "../../lib/api";
import { useToHome } from "../../lib/callbacks";

import Header from "../../ui/Header";
import GoogleButton from "../GoogleButton";
import Form from "../../ui/Form";
import { ProfilePicture } from "../../ui/Upload";
import Input from "../../ui/Input";
import { FormButton } from "../../ui/Button";
import buttonLoading from "@/public/button-loading.svg";

function Base() {
  const searchParams = useSearchParams();
  const toHome = useToHome();

  const [pic, setPic] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");

  const [verifiedEmailMessage, setVerifiedEmailMessage] = useState("");
  const [code, setCode] = useState("");

  const [errorMsg, setErrorMsg] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const error = searchParams.get("error");
    if (error) {
      setErrorMsg(error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSendEmail = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setLoading(true);
    setErrorMsg("");

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
      password: password,
      confirm_password: confirmPassword,
    };
    sendRequest("/auth/verify-email", "POST", request).then((data) => {
      if (data.detail) setErrorMsg(data.detail);
      else setVerifiedEmailMessage(data.message);
      setLoading(false);
    });
  };

  const handleCodeSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setLoading(true);
    setErrorMsg("");

    if (code === "") {
      setErrorMsg("Code cannot be empty");
      setLoading(false);
      return;
    }

    let request = {
      profile_picture: pic,
      email: email,
      password: password,
      confirm_password: confirmPassword,
      code: code,
    };

    toHome(
      "/auth/signup",
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
      <Header>
        <h1 className="p-2 text-4xl md:text-6xl whitespace-nowrap">Sign Up</h1>
      </Header>
      <div className="flex flex-col gap-8">
        <Form
          onSubmit={handleSendEmail}
          className={`flex flex-col gap-8 ${
            verifiedEmailMessage ? "hidden" : "block"
          }`}
        >
          <ProfilePicture
            picture={pic}
            setErrorMsg={setErrorMsg}
            setPicture={setPic}
          />
          <div className="gap-4 flex flex-col">
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
            </div>
            <FormButton>
              <Image
                src={buttonLoading}
                className={`w-6 h-6 ${loading ? "block" : "hidden"}`}
                alt="Sign Up"
              />
              <p className={`${loading ? "hidden" : "block"}`}>Sign Up</p>
            </FormButton>
            <p>--- or ---</p>
            <GoogleButton action="signup" setErrorMsg={setErrorMsg} />
          </div>
        </Form>
        <Form
          onSubmit={handleCodeSubmit}
          className={`${verifiedEmailMessage ? "block" : "hidden"}`}
        >
          <p>{verifiedEmailMessage}</p>
          <div className="gap-4 flex flex-col">
            <Input
              type="text"
              name="code"
              value={code}
              placeholder="Code"
              autoFocus
              onChange={(e) => setCode(e.target.value)}
            />
            <FormButton>
              <Image
                src={buttonLoading}
                className={`w-6 h-6 ${loading ? "block" : "hidden"}`}
                alt="Verify Code"
              />
              <p className={`${loading ? "hidden" : "block"}`}>Verify Code</p>
            </FormButton>
          </div>
        </Form>
        {errorMsg && <p className="text-rose-500">{errorMsg}</p>}
      </div>
    </>
  );
}

const SignUp = () => {
  return (
    <Suspense>
      <Base />
    </Suspense>
  );
};

export default SignUp;
