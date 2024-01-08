"use client";

import { useState } from "react";
import Link from "next/link";

import { useConst } from "../../providers";
import { useToProfile } from "../../lib/utils";

import validator from "validator";

import Form from "../../ui/Form";
import Input from "../../ui/Input";
import Button from "../../ui/Button";

function SignUp() {
  const { apiUrl } = useConst();
  const toProfile = useToProfile();

  const signUpUrl = apiUrl + "/token/signup";

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
      <Button type="submit">Sign Up</Button>
      {errorMsg && <p className="text-rose-500">{errorMsg}</p>}
      {loading && <p>Loading...</p>}
    </Form>
  );
}

export default SignUp;
