import Image from "next/image";
import { useState } from "react";
import { useProfile } from "../providers";
import { useConst } from "../../providers";
import { sendRequest } from "../../lib/api";
import { useLogOut } from "../../lib/callbacks";
import { useUpdateUser } from "../utils";

import Main from "../../ui/Main";
import Form from "../../ui/Form";
import { ProfilePicture } from "../../ui/Upload";
import Input from "../../ui/Input";
import { FormButton } from "../../ui/Button";
import buttonLoading from "@/public/button-loading.svg";

function UserView() {
  const { state: constState, dispatch: constDispatch } = useConst();
  const { state: profileState, dispatch: profileDispatch } = useProfile();
  const logOut = useLogOut();
  const updateUser = useUpdateUser();

  const { joinDate, profilePicture, email, username, fullname } = constState;
  const { canUpdateUser, updateUserErrorMsg, updateUserLoading } = profileState;

  const [tempProfilePicture, setTempProfilePicture] = useState(profilePicture);
  const [tempEmail, setTempEmail] = useState(email);
  const [tempUsername, setTempUsername] = useState(username);
  const [tempFullname, setTempFullname] = useState(fullname);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwdErrorMsg, setPwdErrorMsg] = useState("");
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdSuccessMsg, setPwdSuccessMsg] = useState("");

  const [deleteAccountErrorMsg, setDeleteAccountErrorMsg] = useState("");
  const [deleteAccountLoading, setDeleteAccountLoading] = useState(false);
  const [deleteAccountConfirm, setDeleteAccountConfirm] = useState("");

  const deleteAccountPhrase = "delete my account";

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
      else logOut();
      setDeleteAccountLoading(false);
    });
  };

  return (
    <Main className="relative z-0 gap-16">
      <Form onSubmit={(e) => updateUser(e)}>
        <ProfilePicture
          picture={tempProfilePicture}
          setErrorMsg={(msg) =>
            profileDispatch({
              type: "SET_UPDATE_USER_ERROR_MSG",
              payload: msg,
            })
          }
          setPicture={(pic) => setTempProfilePicture(pic)}
          onChange={(pic) => {
            if (pic !== profilePicture) {
              profileDispatch({
                type: "SET_CAN_UPDATE_USER",
                payload: true,
              });
            } else {
              profileDispatch({
                type: "SET_CAN_UPDATE_USER",
                payload: false,
              });
            }
          }}
        />
        <div className="flex flex-col">
          <p>Joined on</p>
          <p className="text-cyan-500">
            {new Date(joinDate).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>
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
                    profileDispatch({
                      type: "SET_CAN_UPDATE_USER",
                      payload: false,
                    });
                  } else {
                    profileDispatch({
                      type: "SET_CAN_UPDATE_USER",
                      payload: true,
                    });
                  }
                } else {
                  profileDispatch({
                    type: "SET_CAN_UPDATE_USER",
                    payload: false,
                  });
                }
              }}
            />
            <Input
              id="username"
              type="text"
              value={tempUsername}
              placeholder="Username"
              onChange={(e) => {
                setTempUsername(e.target.value);
                if (e.target.value !== username) {
                  if (e.target.value === "" && username === null) {
                    profileDispatch({
                      type: "SET_CAN_UPDATE_USER",
                      payload: false,
                    });
                  } else {
                    profileDispatch({
                      type: "SET_CAN_UPDATE_USER",
                      payload: true,
                    });
                  }
                } else {
                  profileDispatch({
                    type: "SET_CAN_UPDATE_USER",
                    payload: false,
                  });
                }
              }}
            />
            <Input
              id="fullname"
              type="text"
              value={tempFullname}
              placeholder="Full Name"
              onChange={(e) => {
                setTempFullname(e.target.value);
                if (e.target.value !== fullname) {
                  if (e.target.value === "" && fullname === null) {
                    profileDispatch({
                      type: "SET_CAN_UPDATE_USER",
                      payload: false,
                    });
                  } else {
                    profileDispatch({
                      type: "SET_CAN_UPDATE_USER",
                      payload: true,
                    });
                  }
                } else {
                  profileDispatch({
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
                type: "SET_PROFILE_PICTURE",
                payload: tempProfilePicture,
              });
              constDispatch({
                type: "SET_EMAIL",
                payload: tempEmail,
              });
              constDispatch({
                type: "SET_USERNAME",
                payload: tempUsername,
              });
              constDispatch({
                type: "SET_FULLNAME",
                payload: tempFullname,
              });
            }}
          >
            {updateUserLoading ? (
              <Image
                src={buttonLoading}
                className="w-6 h-6"
                alt="Update Profile"
              />
            ) : (
              <p>Update Profile</p>
            )}
          </FormButton>
        </div>
        {updateUserErrorMsg && (
          <p className="text-rose-500">{updateUserErrorMsg}</p>
        )}
      </Form>
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
              placeholder="Confirm New Password"
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

export default UserView;
