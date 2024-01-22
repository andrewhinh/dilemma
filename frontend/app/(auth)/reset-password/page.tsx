"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { sendRequest } from "../../lib/api";
import validator from "validator";

import Form from "../../ui/Form";
import Input from "../../ui/Input";
import { FormButton } from "../../ui/Button";
import buttonLoading from "@/public/button-loading.svg";

function ResetPassword() {
  const router = useRouter();

  const [id, setId] = useState("");
  const [isEmail, setIsEmail] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
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

    if (id === "") {
      setErrorMsg("Username or email cannot be empty");
      setLoading(false);
      return;
    }

    if (validator.isEmail(id)) {
      setIsEmail(true);
    } else {
      setIsEmail(false);
    }

    let request = {
      ...(isEmail ? { email: id } : { username: id }),
    };
    sendRequest("/forgot-password", "POST", request).then((data) => {
      if (data.detail) setErrorMsg(data.detail);
      else setIsVerified(true);
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

    let request = {
      ...(isEmail ? { email: id } : { username: id }),
      recovery_code: code,
    };
    sendRequest("/check-code", "POST", request).then((data) => {
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

    let request = {
      ...(isEmail ? { email: id } : { username: id }),
      recovery_code: code,
      password: password,
      confirm_password: confirmPassword,
    };
    sendRequest("/reset-password", "POST", request).then((data) => {
      if (data.detail) setErrorMsg(data.detail);
      else router.push("/login");
      setLoading(false);
    });
  };

  return (
    <>
      {!isVerified ? (
        <Form onSubmit={handleSendEmail}>
          <Input
            type="id"
            name="id"
            placeholder="Username or email"
            autoFocus
            onChange={(e) => setId(e.target.value)}
          />
          <FormButton>
            {loading ? (
              <Image src={buttonLoading} className="w-6 h-6" alt="Send Email" />
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
              <Image
                src={buttonLoading}
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
