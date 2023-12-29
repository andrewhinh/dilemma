"use client";

import { useState } from "react";
import Link from "next/link";

import { useConst } from "../../providers";
import { useToProfile } from "../../lib/HelperFns";

import validator from "validator";

import Form from "../../ui/Form";
import Input from "../../ui/Input";
import Button from "../../ui/Button";

function Login() {
  const { apiUrl } = useConst();
  const toProfile = useToProfile();

  const loginUrl = apiUrl + "/token/login";

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
      loginUrl,
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
          className="text-md text-zinc-500 underline hover:opacity-50 transition 300ms ease-in-out"
        >
          Forgot Password?
        </Link>
      </div>
      <Button type="submit" className="bg-cyan-500">
        Login
      </Button>
      {errorMsg && <p className="text-rose-500">{errorMsg}</p>}
      {loading && <p className="text-zinc-500">Loading...</p>}
    </Form>
  );
}

export default Login;
