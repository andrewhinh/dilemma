"use client";

import { useLogOut, useSendRequest } from "../lib/utils";
import { useConst } from "../providers";
import { useProfile } from "./providers";
import { useUpdateUser } from "./utils";

import Main from "../ui/Main";
import Form from "../ui/Form";
import Input from "../ui/Input";
import Button from "../ui/Button";

function UserView() {
  const { state, dispatch } = useProfile();
  const { apiUrl } = useConst();
  const sendRequest = useSendRequest();
  const logOut = useLogOut();
  const updateUser = useUpdateUser();

  const {
    email,
    username,
    fullname,
    password,
    confirmPassword,
    deleteAccountConfirm,
    updateUserErrorMsg,
    updateUserLoading,
    updateUserSuccessMsg,
    pwdErrorMsg,
    pwdLoading,
    pwdSuccessMsg,
    deleteAccountErrorMsg,
    deleteAccountLoading,
  } = state;
  const updateUserUrl = apiUrl + "/user/update";
  const deleteUserUrl = apiUrl + "/user/delete";

  const deleteAccountPhrase = "delete my account";

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

    sendRequest(updateUserUrl, "PATCH", {
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

    sendRequest(deleteUserUrl, "DELETE")
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
      <Form onSubmit={(e) => updateUser(e, null, null)}>
        <div className="flex flex-col gap-4 w-48 md:w-60">
          <div className="flex flex-col gap-2">
            <Input
              id="email"
              type="text"
              value={email}
              placeholder="Email"
              onChange={(e) =>
                dispatch({
                  type: "SET_FIELD",
                  field: "email",
                  payload: e.target.value,
                })
              }
            />
            <Input
              id="username"
              type="text"
              value={username}
              placeholder="Username"
              onChange={(e) =>
                dispatch({
                  type: "SET_FIELD",
                  field: "username",
                  payload: e.target.value,
                })
              }
            />
            <Input
              id="fullname"
              type="text"
              value={fullname}
              placeholder="Full Name"
              onChange={(e) =>
                dispatch({
                  type: "SET_FIELD",
                  field: "fullname",
                  payload: e.target.value,
                })
              }
            />
          </div>
          <Button className="bg-cyan-500">Update Profile</Button>
        </div>
        {updateUserErrorMsg && (
          <p className="text-rose-500">{updateUserErrorMsg}</p>
        )}
        {updateUserLoading && <p className="text-zinc-500">Loading...</p>}
        {updateUserSuccessMsg && <p>{updateUserSuccessMsg}</p>}
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
          <Button className="bg-cyan-500">Update Password</Button>
        </div>
        {pwdErrorMsg && <p className="text-rose-500">{pwdErrorMsg}</p>}
        {pwdLoading && <p className="text-zinc-500">Loading...</p>}
        {pwdSuccessMsg && <p>{pwdSuccessMsg}</p>}
      </Form>
      <Form onSubmit={(e) => handleDeleteAccount(e)}>
        <div className="flex flex-col gap-4 w-48 md:w-60">
          <div className="flex flex-col gap-2">
            <label
              htmlFor="deleteAccountConfirm"
              className="text-zinc-500 text-lg"
            >
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
          <Button className="bg-rose-500">Delete Account</Button>
        </div>
        {deleteAccountErrorMsg && (
          <p className="text-rose-500">{deleteAccountErrorMsg}</p>
        )}
        {deleteAccountLoading && <p className="text-zinc-500">Loading...</p>}
      </Form>
    </Main>
  );
}

export default UserView;
