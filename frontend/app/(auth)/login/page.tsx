"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import validator from "validator";

import { useToHome } from "../../lib/callbacks";

import Header from "../../ui/Header";
import GoogleButton from "../GoogleButton";
import Form from "../../ui/Form";
import Input from "../../ui/Input";
import { FormButton } from "../../ui/Button";
import buttonLoading from "@/public/button-loading.svg";

function Base() {
  const searchParams = useSearchParams();
  const toHome = useToHome();

  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const error = searchParams.get("error");
    if (error) {
      setErrorMsg(error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

    toHome(
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
    <>
      <Header>
        <h1 className="p-2 text-4xl md:text-6xl">Login</h1>
      </Header>
      <div className="flex flex-col gap-8">
        <Form onSubmit={handleSubmit}>
          <div className="gap-4 flex flex-col">
            <div className="gap-2 flex flex-col text-left">
              <Input
                type="id"
                name="id"
                placeholder="Username or email"
                autoFocus
              />
              <Input type="password" name="password" placeholder="Password" />
              <Link
                href="/reset-password"
                className="text-md underline hover:opacity-50 transition 300ms ease-in-out"
              >
                Forgot Password?
              </Link>
            </div>
            <FormButton>
              <Image
                src={buttonLoading}
                className={`w-6 h-6 ${loading ? "block" : "hidden"}`}
                alt="Login"
              />
              <p className={`${loading ? "hidden" : "block"}`}>Login</p>
            </FormButton>
            <p>--- or ---</p>
            <GoogleButton action="login" setErrorMsg={setErrorMsg} />
          </div>
          {errorMsg && <p className="text-rose-500">{errorMsg}</p>}
        </Form>
      </div>
    </>
  );
}

const Login = () => {
  return (
    <Suspense>
      <Base />
    </Suspense>
  );
};

export default Login;
