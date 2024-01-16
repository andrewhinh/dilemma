/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { useLogOut } from "../lib/utils";
import { sendRequest } from "../api/route";
import { useProfile } from "./providers";
import { useUpdateUser } from "./utils";

import Main from "../ui/Main";
import Form from "../ui/Form";
import { ProfilePicture } from "../ui/Upload";
import Input from "../ui/Input";
import { FormButton } from "../ui/Button";
import buttonLoading from "@/public/button-loading.svg";

function UserView() {
  const { state, dispatch } = useProfile();
  const logOut = useLogOut();
  const updateUser = useUpdateUser();

  const {
    profilePicture,
    email,
    username,
    fullname,
    password,
    confirmPassword,
    deleteAccountConfirm,
    canUpdateUser,
    updateUserErrorMsg,
    updateUserLoading,
    pwdErrorMsg,
    pwdLoading,
    pwdSuccessMsg,
    deleteAccountErrorMsg,
    deleteAccountLoading,
  } = state;
  const [tempProfilePicture, setTempProfilePicture] = useState(profilePicture);
  const [tempEmail, setTempEmail] = useState(email);
  const [tempUsername, setTempUsername] = useState(username);
  const [tempFullname, setTempFullname] = useState(fullname);

  const deleteAccountPhrase = "delete my account";

  const handlePicUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileType = file.type.split("/")[0];
    if (fileType !== "image") {
      dispatch({
        type: "SET_UPDATE_USER_ERROR_MSG",
        payload: "File type must be image",
      });
      return;
    }

    const fileExtension = file.type.split("/")[1];
    if (!["png", "jpg", "jpeg"].includes(fileExtension)) {
      dispatch({
        type: "SET_UPDATE_USER_ERROR_MSG",
        payload: "File type must be png, jpg, or jpeg",
      });
      return;
    }

    const fileSize = file.size;
    if (fileSize > 3 * 1024 * 1024) {
      dispatch({
        type: "SET_UPDATE_USER_ERROR_MSG",
        payload: "File size must be less than 3MB",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target && event.target.result) {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          if (ctx) {
            const size = Math.min(img.width, img.height);
            const startX = (img.width - size) / 2;
            const startY = (img.height - size) / 2;

            // Update ProfilePicture if this is changed
            canvas.width = 96;
            canvas.height = 96;

            ctx.drawImage(img, startX, startY, size, size, 0, 0, 96, 96);
            const croppedImageDataURL = canvas.toDataURL(file.type);
            setTempProfilePicture(croppedImageDataURL);
            if (croppedImageDataURL !== profilePicture) {
              dispatch({
                type: "SET_CAN_UPDATE_USER",
                payload: true,
              });
            } else {
              dispatch({
                type: "SET_CAN_UPDATE_USER",
                payload: false,
              });
            }
          }
        };
        img.src = event.target.result as string;
      }
    };
    reader.readAsDataURL(file);
  };

  const handleUpdatePassword = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();
    dispatch({ type: "SET_PWD_ERROR_MSG", payload: null });
    dispatch({ type: "SET_PWD_LOADING", payload: true });
    dispatch({ type: "SET_PWD_SUCCESS_MSG", payload: null });

    if (password === "") {
      dispatch({
        type: "SET_PWD_ERROR_MSG",
        payload: "Password cannot be empty",
      });
      dispatch({ type: "SET_PWD_LOADING", payload: false });
      return;
    }

    if (confirmPassword === "") {
      dispatch({
        type: "SET_PWD_ERROR_MSG",
        payload: "Confirm password cannot be empty",
      });
      dispatch({ type: "SET_PWD_LOADING", payload: false });
      return;
    }

    if (password !== confirmPassword) {
      dispatch({
        type: "SET_PWD_ERROR_MSG",
        payload: "Passwords do not match",
      });
      dispatch({ type: "SET_PWD_LOADING", payload: false });
      return;
    }

    sendRequest("/user/update", "PATCH", {
      password: password,
      confirm_password: confirmPassword,
    })
      .then(() =>
        dispatch({ type: "SET_PWD_SUCCESS_MSG", payload: "Password updated!" })
      )
      .catch((error) =>
        dispatch({ type: "SET_PWD_ERROR_MSG", payload: error.detail || error })
      )
      .finally(() => dispatch({ type: "SET_PWD_LOADING", payload: false }));
  };

  const handleDeleteAccount = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();
    dispatch({ type: "SET_DELETE_ACCOUNT_ERROR_MSG", payload: null });
    dispatch({ type: "SET_DELETE_ACCOUNT_LOADING", payload: true });

    if (deleteAccountConfirm === "") {
      dispatch({
        type: "SET_DELETE_ACCOUNT_ERROR_MSG",
        payload: "You must enter the phrase to delete your account",
      });
      dispatch({ type: "SET_DELETE_ACCOUNT_LOADING", payload: false });
      return;
    }

    if (deleteAccountConfirm !== deleteAccountPhrase) {
      dispatch({
        type: "SET_DELETE_ACCOUNT_ERROR_MSG",
        payload: "Incorrect phrase to delete your account",
      });
      dispatch({ type: "SET_DELETE_ACCOUNT_LOADING", payload: false });
      return;
    }

    sendRequest("/user/delete", "DELETE")
      .then(() => logOut())
      .catch((error) =>
        dispatch({
          type: "SET_DELETE_ACCOUNT_ERROR_MSG",
          payload: error.detail || error.message,
        })
      )
      .finally(() =>
        dispatch({ type: "SET_DELETE_ACCOUNT_LOADING", payload: false })
      );
  };

  return (
    <Main className="relative z-0 gap-16">
      <Form onSubmit={(e) => updateUser(e)}>
        <ProfilePicture
          picture={tempProfilePicture}
          handleUpload={handlePicUpload}
        />
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
                    dispatch({
                      type: "SET_CAN_UPDATE_USER",
                      payload: false,
                    });
                  } else {
                    dispatch({
                      type: "SET_CAN_UPDATE_USER",
                      payload: true,
                    });
                  }
                } else {
                  dispatch({
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
                    dispatch({
                      type: "SET_CAN_UPDATE_USER",
                      payload: false,
                    });
                  } else {
                    dispatch({
                      type: "SET_CAN_UPDATE_USER",
                      payload: true,
                    });
                  }
                } else {
                  dispatch({
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
                    dispatch({
                      type: "SET_CAN_UPDATE_USER",
                      payload: false,
                    });
                  } else {
                    dispatch({
                      type: "SET_CAN_UPDATE_USER",
                      payload: true,
                    });
                  }
                } else {
                  dispatch({
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
              dispatch({
                type: "SET_FIELD",
                field: "profilePicture",
                payload: tempProfilePicture,
              });
              dispatch({
                type: "SET_FIELD",
                field: "email",
                payload: tempEmail,
              });
              dispatch({
                type: "SET_FIELD",
                field: "username",
                payload: tempUsername,
              });
              dispatch({
                type: "SET_FIELD",
                field: "fullname",
                payload: tempFullname,
              });
            }}
          >
            {updateUserLoading ? (
              <img
                src={buttonLoading.src}
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
              onChange={(e) =>
                dispatch({
                  type: "SET_FIELD",
                  field: "password",
                  payload: e.target.value,
                })
              }
            />
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              placeholder="Confirm New Password"
              onChange={(e) =>
                dispatch({
                  type: "SET_FIELD",
                  field: "confirmPassword",
                  payload: e.target.value,
                })
              }
            />
          </div>
          <FormButton>
            {pwdLoading ? (
              <img src={buttonLoading.src} className="w-6 h-6" alt="Update" />
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
              onChange={(e) =>
                dispatch({
                  type: "SET_FIELD",
                  field: "deleteAccountConfirm",
                  payload: e.target.value,
                })
              }
            />
          </div>
          <FormButton className="bg-rose-500">
            {deleteAccountLoading ? (
              <img src={buttonLoading.src} className="w-6 h-6" alt="Delete" />
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
