"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useConst } from "../../providers";
import { useToProfile, useRefreshToken } from "../../(util)/lib/HelperFns";
import Nav from "../../(util)/nav/Nav";
import Main from "../../(util)/ui/Main";
import validator from "validator";

function SignUp() {
  const router = useRouter();
  const { token, uid, apiUrl } = useConst();
  const toProfile = useToProfile();
  const refreshToken = useRefreshToken();

  const signUpUrl = apiUrl + "/token/signup";

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    if (!token) refreshToken();
    if (token) {
      setLoading(false);
      router.push("/profile/" + uid);
    }
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

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
    <>
      <Nav>
        <div className="flex-1 text-right">
          <Link href="/login" className="hover:text-blue-500">
            Login
          </Link>
        </div>
      </Nav>
      <Main header="Sign Up">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col text-center items-center justify-center gap-4"
        >
          <label className="text-xl">Email</label>
          <input
            type="email"
            name="email"
            className="mb-8 text-center text-amber-500"
          />
          <label className="text-xl">Password</label>
          <input
            type="password"
            name="password"
            className="mb-8 text-center text-amber-500"
          />
          <label className="text-xl">Confirm Password</label>
          <input
            type="password"
            name="confirm_password"
            className="mb-8 text-center text-amber-500"
          />
          <button
            type="submit"
            className="mb-4 py-2 px-4 bg-blue-500 hover:bg-blue-700 text-white font-bold rounded"
          >
            Sign Up
          </button>
        </form>
        {errorMsg && <p className="text-xl text-rose-500">{errorMsg}</p>}
        {loading && <p className="text-xl">Loading...</p>}
        <Link
          href="/login"
          className="mt-4 text-xl hover:text-blue-500 underline"
        >
          Already have an account?
        </Link>
      </Main>
    </>
  );
}

export default SignUp;
