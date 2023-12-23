"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useConst } from "../../providers";
import { useSendRequest, useRefreshToken } from "../../(util)/lib/HelperFns";
import Nav from "../../(util)/nav/Nav";
import Main from "../../(util)/ui/Main";
import validator from "validator";

function ResetPassword() {
  const router = useRouter();
  const { token, uid, apiUrl } = useConst();
  const sendRequest = useSendRequest();
  const refreshToken = useRefreshToken();
  const forgotPasswordUrl = apiUrl + "/forgot-password";
  const checkCodeUrl = apiUrl + "/check-code";
  const resetPasswordUrl = apiUrl + "/reset-password";

  const [email, setEmail] = useState("");
  const [verifiedEmail, setVerifiedEmail] = useState(false);
  const [code, setCode] = useState("");
  const [verifiedCode, setVerifiedCode] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
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

  const handleSendEmail = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

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

    sendRequest(forgotPasswordUrl, "POST", { email: email })
      .then(() => {
        setVerifiedEmail(true);
      })
      .catch((error) => setErrorMsg(error.detail || error))
      .finally(() => setLoading(false));
  };

  const handleCodeSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    if (code === "") {
      setErrorMsg("Code cannot be empty");
      setLoading(false);
      return;
    }

    sendRequest(checkCodeUrl, "POST", { email: email, recovery_code: code })
      .then(() => {
        setVerifiedCode(true);
      })
      .catch((error) => setErrorMsg(error.detail || error))
      .finally(() => setLoading(false));
  };

  const handlePwdSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

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

    sendRequest(resetPasswordUrl, "POST", {
      email: email,
      password: password,
      confirm_password: confirmPassword,
    })
      .then(() => {
        router.push("/login");
      })
      .catch((error) => setErrorMsg(error.detail || error))
      .finally(() => setLoading(false));
  };

  return (
    <>
      <Nav>
        <div className="flex flex-1 justify-end gap-4">
          <Link href="/login" className="hover:text-blue-500">
            Login
          </Link>
          <Link href="/signup" className="hover:text-blue-500">
            Sign Up
          </Link>
        </div>
      </Nav>
      <Main header={"Reset Password"}>
        {!verifiedEmail ? (
          <form
            onSubmit={handleSendEmail}
            className="flex flex-col text-center items-center justify-center gap-4"
          >
            <label className="text-xl">Enter your email:</label>
            <input
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mb-8 text-center text-amber-500"
            />
            <button
              type="submit"
              className="mb-4 py-2 px-4 bg-blue-500 hover:bg-blue-700 text-white font-bold rounded"
            >
              Send Email
            </button>
          </form>
        ) : (
          <form
            onSubmit={verifiedCode ? handlePwdSubmit : handleCodeSubmit}
            className="flex flex-col text-center items-center justify-center gap-4"
          >
            {!verifiedCode ? (
              <>
                <label className="text-xl">Enter your code:</label>
                <input
                  type="text"
                  name="code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="mb-8 text-center text-amber-500"
                />
              </>
            ) : (
              <>
                <label className="text-xl">New password:</label>
                <input
                  type="password"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mb-8 text-center text-amber-500"
                />
                <label className="text-xl">Confirm new password:</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="mb-8 text-center text-amber-500"
                />
              </>
            )}
            <button
              type="submit"
              className="mb-4 py-2 px-4 bg-blue-500 hover:bg-blue-700 text-white font-bold rounded"
            >
              {verifiedCode ? "Reset Password" : "Verify Code"}
            </button>
          </form>
        )}
        {errorMsg && <p className="text-xl text-rose-500">{errorMsg}</p>}
        {loading && <p className="text-xl">Loading...</p>}
        <Link
          href="/signup"
          className="mt-4 text-xl hover:text-blue-500 underline"
        >
          Create Account
        </Link>
      </Main>
    </>
  );
}

export default ResetPassword;
