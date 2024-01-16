/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { sendRequest } from "../../api/route";
import validator from "validator";

import Form from "../../ui/Form";
import Input from "../../ui/Input";
import { FormButton } from "../../ui/Button";
import buttonLoading from "@/public/button-loading.svg";

function ResetPassword() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [verifiedEmail, setVerifiedEmail] = useState(false);
  const [code, setCode] = useState("");
  const [verifiedCode, setVerifiedCode] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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

    sendRequest("/forgot-password", "POST", { email: email })
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

    sendRequest("/check-code", "POST", { email: email, recovery_code: code })
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

    sendRequest("/reset-password", "POST", {
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
      {!verifiedEmail ? (
        <Form onSubmit={handleSendEmail}>
          <Input
            type="email"
            name="email"
            value={email}
            placeholder="Email"
            autoFocus
            onChange={(e) => setEmail(e.target.value)}
          />
          <FormButton>
            {loading ? (
              <img
                src={buttonLoading.src}
                className="w-6 h-6"
                alt="Send Email"
              />
            ) : (
              <p>Send Email</p>
            )}
          </FormButton>
        </Form>
      ) : (
        <Form onSubmit={verifiedCode ? handlePwdSubmit : handleCodeSubmit}>
          {!verifiedCode ? (
            <>
              <p>A recovery code has been sent to your email.</p>
              <Input
                type="text"
                name="code"
                value={code}
                placeholder="Code"
                autoFocus
                onChange={(e) => setCode(e.target.value)}
              />
            </>
          ) : (
            <>
              <div className="gap-2 flex flex-col text-left">
                <Input
                  type="password"
                  name="password"
                  value={password}
                  placeholder="New Password"
                  autoFocus
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Input
                  type="password"
                  name="confirmPassword"
                  value={confirmPassword}
                  placeholder="Confirm New Password"
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </>
          )}
          <FormButton>
            {loading ? (
              <img
                src={buttonLoading.src}
                className="w-6 h-6"
                alt={verifiedCode ? "Reset Password" : "Verify Code"}
              />
            ) : (
              <p>{verifiedCode ? "Reset Password" : "Verify Code"}</p>
            )}
          </FormButton>
          {errorMsg && <p className="text-rose-500">{errorMsg}</p>}
        </Form>
      )}
    </>
  );
}

export default ResetPassword;
