import Image from "next/image";
import { useState } from "react";
import { useAccount } from "../providers";
import { useConst } from "../../providers";
import { sendRequest } from "../../lib/api";
import { useLogOut } from "../../lib/callbacks";
import validator from "validator";

import Main from "../../ui/Main";
import Form from "../../ui/Form";
import Input from "../../ui/Input";
import { FormButton } from "../../ui/Button";
import buttonLoading from "@/public/button-loading.svg";

function EditView() {
  const { state: constState, dispatch: constDispatch } = useConst();
  const { state: accountState, dispatch: accountDispatch } = useAccount();
  const logOut = useLogOut();

  const { email } = constState;
  const { canUpdateUser } = accountState;

  const [tempEmail, setTempEmail] = useState(email);
  const [verifiedEmailMessage, setVerifiedEmailMessage] = useState("");
  const [code, setCode] = useState("");
  const [updateEmailLoading, setUpdateEmailLoading] = useState(false);
  const [updateEmailErrorMsg, setUpdateEmailErrorMsg] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwdErrorMsg, setPwdErrorMsg] = useState("");
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdSuccessMsg, setPwdSuccessMsg] = useState("");

  const [deleteAccountErrorMsg, setDeleteAccountErrorMsg] = useState("");
  const [deleteAccountLoading, setDeleteAccountLoading] = useState(false);
  const [deleteAccountConfirm, setDeleteAccountConfirm] = useState("");

  const deleteAccountPhrase = "delete my account";

  const handleSendEmail = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();
    setUpdateEmailErrorMsg("");
    setUpdateEmailLoading(true);

    if (tempEmail === "") {
      setUpdateEmailErrorMsg("Email cannot be empty");
      setUpdateEmailLoading(false);
      return;
    }

    if (!validator.isEmail(tempEmail)) {
      setUpdateEmailErrorMsg("Invalid email");
      setUpdateEmailLoading(false);
      return;
    }

    sendRequest("/verify-email/update", "POST", { email: tempEmail }).then(
      (data) => {
        if (data.detail) setUpdateEmailErrorMsg(data.detail);
        else setVerifiedEmailMessage(data.message);
        setUpdateEmailLoading(false);
      }
    );
  };

  const handleCodeSubmit = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();
    setUpdateEmailErrorMsg("");
    setUpdateEmailLoading(true);

    if (code === "") {
      setUpdateEmailErrorMsg("Code cannot be empty");
      setUpdateEmailLoading(false);
      return;
    }

    let request = {
      email: tempEmail,
      code: code,
    };
    sendRequest("/update-email", "POST", request).then((data) => {
      if (data.detail) setUpdateEmailErrorMsg(data.detail);
      else {
        setVerifiedEmailMessage("");
        accountDispatch({
          type: "SET_CAN_UPDATE_USER",
          payload: false,
        });
      }
      setUpdateEmailLoading(false);
    });
  };

  const handleUpdatePassword = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();
    setPwdErrorMsg("");
    setPwdLoading(true);
    setPwdSuccessMsg("");

    if (password === "") {
      setPwdErrorMsg("Password cannot be empty");
      setPwdLoading(false);
      return;
    }

    if (confirmPassword === "") {
      setPwdErrorMsg("Confirm password cannot be empty");
      setPwdLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setPwdErrorMsg("Passwords do not match");
      setPwdLoading(false);
      return;
    }

    sendRequest("/user/update", "PATCH", {
      password: password,
      confirm_password: confirmPassword,
    }).then((data) => {
      if (data.detail) setPwdErrorMsg(data.detail);
      else {
        setPassword("");
        setConfirmPassword("");
        setPwdSuccessMsg("Password updated!");
      }
      setPwdLoading(false);
    });
  };

  const handleDeleteAccount = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();
    setDeleteAccountErrorMsg("");
    setDeleteAccountLoading(true);

    if (deleteAccountConfirm === "") {
      setDeleteAccountErrorMsg(
        "You must enter the phrase to delete your account"
      );
      setDeleteAccountLoading(false);
      return;
    }

    if (deleteAccountConfirm !== deleteAccountPhrase) {
      setDeleteAccountErrorMsg("Incorrect phrase to delete your account");
      setDeleteAccountLoading(false);
      return;
    }

    sendRequest("/user/delete", "DELETE").then((data) => {
      if (data.detail) setDeleteAccountErrorMsg(data.detail);
      else {
        setDeleteAccountLoading(false);
        logOut();
      }
    });
  };

  return (
    <Main className="relative z-0 gap-16">
      {!verifiedEmailMessage ? (
        <Form onSubmit={handleSendEmail}>
          <div className="flex flex-col gap-4 w-48 md:w-60">
            <div className="flex flex-col gap-2">
              <Input
                id="email"
                type="text"
                value={tempEmail}
                placeholder="Email"
                onChange={(e) => {
                  setTempEmail(e.target.value);
                  if (e.target.value !== email) {
                    if (e.target.value === "" && email === null) {
                      accountDispatch({
                        type: "SET_CAN_UPDATE_USER",
                        payload: false,
                      });
                    } else {
                      accountDispatch({
                        type: "SET_CAN_UPDATE_USER",
                        payload: true,
                      });
                    }
                  } else {
                    accountDispatch({
                      type: "SET_CAN_UPDATE_USER",
                      payload: false,
                    });
                  }
                }}
              />
            </div>
            <FormButton
              noHover={canUpdateUser}
              onClick={() => {
                constDispatch({
                  type: "SET_EMAIL",
                  payload: tempEmail,
                });
              }}
            >
              {updateEmailLoading ? (
                <Image
                  src={buttonLoading}
                  className="w-6 h-6"
                  alt="Update Email"
                />
              ) : (
                <p>Update Email</p>
              )}
            </FormButton>
            {updateEmailErrorMsg && (
              <p className="text-rose-500">{updateEmailErrorMsg}</p>
            )}
          </div>
        </Form>
      ) : (
        <Form onSubmit={handleCodeSubmit}>
          <p>{verifiedEmailMessage}</p>
          <Input
            type="text"
            name="code"
            value={code}
            placeholder="Code"
            autoFocus
            onChange={(e) => setCode(e.target.value)}
          />
          <FormButton>
            {updateEmailLoading ? (
              <Image
                src={buttonLoading}
                className="w-6 h-6"
                alt="Verify Code"
              />
            ) : (
              <p>Verify Code</p>
            )}
          </FormButton>
          {updateEmailErrorMsg && (
            <p className="text-rose-500">{updateEmailErrorMsg}</p>
          )}
        </Form>
      )}
      <Form onSubmit={(e) => handleUpdatePassword(e)}>
        <div className="flex flex-col gap-4 w-48 md:w-60">
          <div className="flex flex-col gap-2">
            <Input
              id="password"
              type="password"
              value={password}
              placeholder="New Password"
              onChange={(e) => setPassword(e.target.value)}
            />
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              placeholder="Confirm Password"
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          <FormButton>
            {pwdLoading ? (
              <Image src={buttonLoading} className="w-6 h-6" alt="Update" />
            ) : (
              <p>Update Password</p>
            )}
          </FormButton>
        </div>
        {pwdErrorMsg && <p className="text-rose-500">{pwdErrorMsg}</p>}
        {pwdSuccessMsg && <p className="text-cyan-500">{pwdSuccessMsg}</p>}
      </Form>
      <Form onSubmit={(e) => handleDeleteAccount(e)}>
        <div className="flex flex-col gap-4 w-48 md:w-60">
          <div className="flex flex-col gap-2">
            <label htmlFor="deleteAccountConfirm" className="text-lg">
              Type
              <span className="font-semibold text-rose-500">
                {" "}
                {deleteAccountPhrase}{" "}
              </span>
              to delete your account:
            </label>
            <Input
              id="deleteAccountConfirm"
              type="text"
              value={deleteAccountConfirm}
              placeholder={deleteAccountPhrase}
              onChange={(e) => setDeleteAccountConfirm(e.target.value)}
            />
          </div>
          <FormButton className="bg-rose-500">
            {deleteAccountLoading ? (
              <Image src={buttonLoading} className="w-6 h-6" alt="Delete" />
            ) : (
              <p>Delete Account</p>
            )}
          </FormButton>
        </div>
        {deleteAccountErrorMsg && (
          <p className="text-rose-500">{deleteAccountErrorMsg}</p>
        )}
      </Form>
    </Main>
  );
}

export default EditView;
