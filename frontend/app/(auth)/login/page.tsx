/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import Link from "next/link";
import { useToProfile } from "../../lib/utils";
import validator from "validator";

import Form from "../../ui/Form";
import Input from "../../ui/Input";
import { FormButton } from "../../ui/Button";
import buttonLoading from "@/public/button-loading.svg";

function Login() {
  const toProfile = useToProfile();
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

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

    if (formDataObj.id === "") {
      setErrorMsg("Username or email cannot be empty");
      setLoading(false);
      return;
    }

    if (validator.isEmail(formDataObj.id)) {
      formDataObj.email = formDataObj.id;
    } else {
      formDataObj.username = formDataObj.id;
    }
    delete formDataObj.id;

    if (formDataObj.password === "") {
      setErrorMsg("Password cannot be empty");
      setLoading(false);
      return;
    }

    toProfile(
      "/token/login",
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
      <div className="gap-2 flex flex-col text-left">
        <Input type="id" name="id" placeholder="Username or email" autoFocus />
        <Input type="password" name="password" placeholder="Password" />
        <Link
          href="/reset-password"
          className="text-md underline hover:opacity-50 transition 300ms ease-in-out"
        >
          Forgot Password?
        </Link>
      </div>
      <FormButton>
        {loading ? (
          <img src={buttonLoading.src} className="w-6 h-6" alt="Login" />
        ) : (
          <p>Login</p>
        )}
      </FormButton>
      {errorMsg && <p className="text-rose-500">{errorMsg}</p>}
    </Form>
  );
}

export default Login;
