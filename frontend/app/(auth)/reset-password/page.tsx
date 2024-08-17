"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { sendRequest } from "../../lib/api";
import validator from "validator";

import Header from "../../ui/Header";
import Form from "../../ui/Form";
import Input from "../../ui/Input";
import { FormButton } from "../../ui/Button";
import buttonLoading from "@/public/button-loading.svg";

function ResetPassword() {
  const router = useRouter();

  const [email, setEmail] = useState("");

  const [verifiedUserMessage, setVerifiedUserMessage] = useState("");
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
      setErrorMsg("Invalid email");
      setLoading(false);
      return;
    }

    let request = { email: email
    };
    sendRequest("/account/password/forgot", "POST", request).then((data) => {
      if (data.detail) setErrorMsg(data.detail);
      else setVerifiedUserMessage(data.message);
      setLoading(false);
    });
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

    let request = {email: email,
      code: code,
    };
    sendRequest("/account/code/verify", "POST", request).then((data) => {
      if (data.detail) setErrorMsg(data.detail);
      else setVerifiedCode(true);
      setLoading(false);
    });
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

    let request = {email: email,
      password: password,
      confirm_password: confirmPassword,
      code: code,
    };
    sendRequest("/account/password/reset", "POST", request).then((data) => {
      if (data.detail) setErrorMsg(data.detail);
      else {
        setLoading(false);
        router.push(data.url);
      }
    });
  };

  return (
    <>
      <Header>
        <h1 className="p-2 text-4xl md:text-6xl">Reset Password</h1>
      </Header>
      <div className="flex flex-col gap-8">
        <Form
          onSubmit={handleSendEmail}
          className={!verifiedUserMessage && !verifiedCode ? "block" : "hidden"}
        >
          <Input
            type="email"
            name="email"
            placeholder="Email"
            autoFocus
            onChange={(e) => setEmail(e.target.value)}
          />
          <FormButton>
            <Image
              src={buttonLoading}
              className={`w-6 h-6 ${loading ? "block" : "hidden"}`}
              alt="Send Email"
            />
            <p>Send Email</p>
          </FormButton>
        </Form>
        <Form
          onSubmit={handleCodeSubmit}
          className={verifiedUserMessage && !verifiedCode ? "block" : "hidden"}
        >
          <p>{verifiedUserMessage}</p>
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
            <p>Verify Code</p>
          </FormButton>
        </Form>
        <Form
          onSubmit={handlePwdSubmit}
          className={verifiedUserMessage && verifiedCode ? "block" : "hidden"}
        >
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
          <FormButton>
            <Image
              src={buttonLoading}
              className={`w-6 h-6 ${loading ? "block" : "hidden"}`}
              alt="Reset Password"
            />
            <p>Reset Password</p>
          </FormButton>
        </Form>
        {errorMsg && <p className="text-rose-500">{errorMsg}</p>}
      </div>
    </>
  );
}

export default ResetPassword;
