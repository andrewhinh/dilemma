/* eslint-disable @next/next/no-img-element */
"use client";

import { useRef, useReducer, useEffect, Suspense } from "react";
import { usePathname, notFound } from "next/navigation";

import { useConst } from "../../providers";
import {
  useLogOut,
  useRefreshToken,
  useSendRequest,
} from "../../lib/HelperFns";

import validator from "validator";

import { LoggedInNav, LoggedOutNav } from "../../ui/LoggedInNav";
import Main from "../../ui/Main";
import Form from "../../ui/Form";
import Input from "../../ui/Input";
import Button from "../../ui/Button";
import profileLoading from "@/public/profile-loading.svg";

interface User {
  uid: string;
  email: string;
  team_role: string;
}

interface Action {
  type: string;
  field?: keyof State;
  payload?: any;
}

interface State {
  email: string;
  username: string;
  fullname: string;
  password: string;
  confirmPassword: string;
  deleteAccountConfirm: string;
  leaveTeamConfirm: string;
  deleteTeamConfirm: string;
  create_team_name: string;
  create_team_description: string;
  join_team_name: string;
  users: User[];
  team_role: string;
  update_team_name: string;
  update_team_description: string;
  updateUserErrorMsg: string | null;
  updateUserSuccessMsg: string | null;
  updateUserLoading: boolean;
  pwdErrorMsg: string | null;
  pwdSuccessMsg: string | null;
  pwdLoading: boolean;
  deleteAccountErrorMsg: string | null;
  deleteAccountLoading: boolean;
  createTeamErrorMsg: string | null;
  createTeamLoading: boolean;
  joinTeamErrorMsg: string | null;
  joinTeamLoading: boolean;
  updateTeamErrorMsg: string | null;
  updateTeamSuccessMsg: string | null;
  updateTeamLoading: boolean;
  leaveTeamErrorMsg: string | null;
  leaveTeamLoading: boolean;
  deleteTeamErrorMsg: string | null;
  deleteTeamLoading: boolean;
  profileView: string;
  isSideBarOpen: boolean;
}

const initialState = {
  email: "",
  username: "",
  fullname: "",
  password: "",
  confirmPassword: "",
  deleteAccountConfirm: "",
  leaveTeamConfirm: "",
  deleteTeamConfirm: "",
  create_team_name: "",
  create_team_description: "",
  join_team_name: "",
  users: [],
  team_role: "",
  update_team_name: "",
  update_team_description: "",
  updateUserErrorMsg: null,
  updateUserSuccessMsg: null,
  updateUserLoading: false,
  pwdErrorMsg: null,
  pwdSuccessMsg: null,
  pwdLoading: false,
  deleteAccountErrorMsg: null,
  deleteAccountLoading: false,
  createTeamErrorMsg: null,
  createTeamLoading: false,
  joinTeamErrorMsg: null,
  joinTeamLoading: false,
  updateTeamErrorMsg: null,
  updateTeamSuccessMsg: null,
  updateTeamLoading: false,
  leaveTeamErrorMsg: null,
  leaveTeamLoading: false,
  deleteTeamErrorMsg: null,
  deleteTeamLoading: false,
  profileView: "",
  isSideBarOpen: null,
};

const reducer = (state: State, action: Action) => {
  switch (action.type) {
    case "SET_FIELD":
      if (action.field) {
        return { ...state, [action.field]: action.payload };
      }
      return state;
    case "SET_UPDATE_USER_ERROR_MSG":
      return { ...state, updateUserErrorMsg: action.payload };
    case "SET_UPDATE_USER_LOADING":
      return { ...state, updateUserLoading: action.payload };
    case "SET_UPDATE_USER_SUCCESS_MSG":
      return { ...state, updateUserSuccessMsg: action.payload };
    case "SET_PWD_ERROR_MSG":
      return { ...state, pwdErrorMsg: action.payload };
    case "SET_PWD_LOADING":
      return { ...state, pwdLoading: action.payload };
    case "SET_PWD_SUCCESS_MSG":
      return { ...state, pwdSuccessMsg: action.payload };
    case "SET_DELETE_ACCOUNT_ERROR_MSG":
      return { ...state, deleteAccountErrorMsg: action.payload };
    case "SET_DELETE_ACCOUNT_LOADING":
      return { ...state, deleteAccountLoading: action.payload };
    case "SET_CREATE_TEAM_ERROR_MSG":
      return { ...state, createTeamErrorMsg: action.payload };
    case "SET_CREATE_TEAM_LOADING":
      return { ...state, createTeamLoading: action.payload };
    case "SET_JOIN_TEAM_ERROR_MSG":
      return { ...state, joinTeamErrorMsg: action.payload };
    case "SET_JOIN_TEAM_LOADING":
      return { ...state, joinTeamLoading: action.payload };
    case "SET_UPDATE_TEAM_ERROR_MSG":
      return { ...state, updateTeamErrorMsg: action.payload };
    case "SET_UPDATE_TEAM_LOADING":
      return { ...state, updateTeamLoading: action.payload };
    case "SET_UPDATE_TEAM_SUCCESS_MSG":
      return { ...state, updateTeamSuccessMsg: action.payload };
    case "SET_LEAVE_TEAM_ERROR_MSG":
      return { ...state, leaveTeamErrorMsg: action.payload };
    case "SET_LEAVE_TEAM_LOADING":
      return { ...state, leaveTeamLoading: action.payload };
    case "SET_DELETE_TEAM_ERROR_MSG":
      return { ...state, deleteTeamErrorMsg: action.payload };
    case "SET_DELETE_TEAM_LOADING":
      return { ...state, deleteTeamLoading: action.payload };
    case "SET_PROFILE_VIEW":
      return { ...state, profileView: action.payload };
    case "SET_IS_SIDEBAR_OPEN":
      return { ...state, isSideBarOpen: action.payload };
    default:
      return state;
  }
};

function Profile() {
  const { token, setToken, uid, apiUrl } = useConst();
  const sendRequest = useSendRequest();
  const refreshToken = useRefreshToken();
  const logOut = useLogOut();
  const pathname = usePathname();
  const [state, dispatch] = useReducer(reducer, initialState);
  const {
    email,
    username,
    fullname,
    password,
    confirmPassword,
    updateUserErrorMsg,
    updateUserSuccessMsg,
    updateUserLoading,
    pwdErrorMsg,
    pwdSuccessMsg,
    pwdLoading,
    deleteAccountConfirm,
    leaveTeamConfirm,
    deleteTeamConfirm,
    deleteAccountErrorMsg,
    deleteAccountLoading,
    create_team_name,
    create_team_description,
    createTeamErrorMsg,
    createTeamLoading,
    join_team_name,
    joinTeamErrorMsg,
    joinTeamLoading,
    users,
    team_role,
    update_team_name,
    update_team_description,
    updateTeamErrorMsg,
    updateTeamSuccessMsg,
    updateTeamLoading,
    leaveTeamErrorMsg,
    leaveTeamLoading,
    deleteTeamErrorMsg,
    deleteTeamLoading,
    profileView,
    isSideBarOpen,
  } = state;

  const deleteAccountPhrase = "delete my account";
  const leaveTeamPhrase = "leave";
  const deleteTeamPhrase = "delete";
  const getUserUrl = apiUrl + "/user/";
  const updateUserUrl = apiUrl + "/user/update";
  const deleteUserUrl = apiUrl + "/user/delete";
  const createTeamUrl = apiUrl + "/team/create";
  const joinTeamUrl = apiUrl + "/team/join";
  const getTeamUrl = apiUrl + "/team/";
  const updateTeamUrl = apiUrl + "/team/update";
  const leaveTeamUrl = apiUrl + "/team/leave";
  const deleteTeamUrl = apiUrl + "/team/delete";

  // Helper functions
  const getTeam = () => {
    sendRequest(getTeamUrl, "GET")
      .then((data) => {
        dispatch({
          type: "SET_FIELD",
          field: "users",
          payload: data.users,
        });
        dispatch({
          type: "SET_FIELD",
          field: "update_team_name",
          payload: data.name,
        });
        dispatch({
          type: "SET_FIELD",
          field: "update_team_description",
          payload: data.description,
        });
      })
      .catch((error) => {
        dispatch({
          type: "SET_UPDATE_TEAM_ERROR_MSG",
          payload: error.detail || error,
        });
      })
      .finally(() => {
        dispatch({ type: "SET_UPDATE_TEAM_LOADING", payload: false });
      });
  };

  const getUser = () => {
    dispatch({ type: "SET_UPDATE_USER_ERROR_MSG", payload: null });
    dispatch({ type: "SET_UPDATE_USER_LOADING", payload: true });
    dispatch({ type: "SET_UPDATE_USER_SUCCESS_MSG", payload: null });

    sendRequest(getUserUrl, "GET")
      .then((data) => {
        dispatch({
          type: "SET_PROFILE_VIEW",
          payload: data.profile_view,
        });
        dispatch({
          type: "SET_IS_SIDEBAR_OPEN",
          payload: data.is_sidebar_open,
        });
        dispatch({ type: "SET_FIELD", field: "email", payload: data.email });
        dispatch({
          type: "SET_FIELD",
          field: "username",
          payload: data.username,
        });
        dispatch({
          type: "SET_FIELD",
          field: "fullname",
          payload: data.fullname,
        });
        dispatch({
          type: "SET_FIELD",
          field: "team_role",
          payload: "",
        });
        if (data.team !== null) {
          dispatch({
            type: "SET_FIELD",
            field: "team_role",
            payload: data.team_role,
          });
          getTeam();
        }
      })
      .catch((error) => {
        dispatch({
          type: "SET_UPDATE_USER_ERROR_MSG",
          payload: error.detail || error,
        });
      })
      .finally(() => {
        dispatch({ type: "SET_UPDATE_USER_LOADING", payload: false });
      });
  };

  // Main logic
  let numAttempts = useRef(0);
  const maxAttempts = 1;

  useEffect(() => {
    if (!token) {
      refreshToken().then((success) => {
        if (!success) {
          numAttempts.current++;
          if (numAttempts.current > maxAttempts) {
            logOut();
          }
        }
      });
    } else {
      let pathnameUid = pathname.split("/")[2];
      if (pathnameUid !== uid) {
        notFound();
      } else {
        getUser();
        if (updateUserErrorMsg) logOut();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleUpdateProfile = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    view: string | null,
    sidebar: boolean | null
  ) => {
    e.preventDefault();
    dispatch({ type: "SET_UPDATE_USER_ERROR_MSG", payload: null });
    dispatch({ type: "SET_UPDATE_USER_SUCCESS_MSG", payload: null });

    if (view === null && sidebar === null)
      dispatch({ type: "SET_UPDATE_USER_LOADING", payload: true });

    dispatch({
      type: "SET_PROFILE_VIEW",
      payload: view !== null ? view : profileView,
    });
    dispatch({
      type: "SET_IS_SIDEBAR_OPEN",
      payload: sidebar !== null ? sidebar : isSideBarOpen,
    });

    if (email === "") {
      dispatch({
        type: "SET_UPDATE_USER_ERROR_MSG",
        payload: "Email cannot be empty",
      });
      dispatch({ type: "SET_UPDATE_USER_LOADING", payload: false });
      return;
    }

    if (!validator.isEmail(email)) {
      dispatch({
        type: "SET_UPDATE_USER_ERROR_MSG",
        payload: "Email is invalid",
      });
      dispatch({ type: "SET_UPDATE_USER_LOADING", payload: false });
      return;
    }

    let request = {
      email: email,
      username: username,
      fullname: fullname,
      profile_view: view !== null ? view : profileView,
      is_sidebar_open: sidebar !== null ? sidebar : isSideBarOpen,
    };
    sendRequest(updateUserUrl, "PATCH", request)
      .then((response) => {
        if (response.access_token) setToken(response.access_token); // new email generates new token
        if (view === null && sidebar === null)
          dispatch({
            type: "SET_UPDATE_USER_SUCCESS_MSG",
            payload: "User updated!",
          });
      })
      .catch((error) =>
        dispatch({
          type: "SET_UPDATE_USER_ERROR_MSG",
          payload: error.detail || error,
        })
      )
      .finally(() =>
        dispatch({ type: "SET_UPDATE_USER_LOADING", payload: false })
      );
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

  const handleCreateTeam = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();
    dispatch({ type: "SET_CREATE_TEAM_ERROR_MSG", payload: null });
    dispatch({ type: "SET_CREATE_TEAM_LOADING", payload: true });

    if (create_team_name === "") {
      dispatch({
        type: "SET_CREATE_TEAM_ERROR_MSG",
        payload: "Team name cannot be empty",
      });
      dispatch({ type: "SET_CREATE_TEAM_LOADING", payload: false });
      return;
    }

    let request = {
      name: create_team_name,
      description: create_team_description,
    };

    sendRequest(createTeamUrl, "POST", request)
      .then(() => {
        getUser();
        dispatch({ type: "SET_FIELD", field: "create_team_name", payload: "" });
        dispatch({
          type: "SET_FIELD",
          field: "create_team_description",
          payload: "",
        });
      })
      .catch((error) =>
        dispatch({
          type: "SET_CREATE_TEAM_ERROR_MSG",
          payload: error.detail || error.message,
        })
      )
      .finally(() => {
        dispatch({ type: "SET_CREATE_TEAM_LOADING", payload: false });
      });
  };

  const handleJoinTeam = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();
    dispatch({ type: "SET_JOIN_TEAM_ERROR_MSG", payload: null });
    dispatch({ type: "SET_JOIN_TEAM_LOADING", payload: true });

    if (join_team_name === "") {
      dispatch({
        type: "SET_JOIN_TEAM_ERROR_MSG",
        payload: "Team name cannot be empty",
      });
      dispatch({ type: "SET_JOIN_TEAM_LOADING", payload: false });
      return;
    }

    sendRequest(joinTeamUrl, "POST", { name: join_team_name })
      .then(() => {
        getUser();
        dispatch({ type: "SET_FIELD", field: "join_team_name", payload: "" });
      })
      .catch((error) =>
        dispatch({
          type: "SET_JOIN_TEAM_ERROR_MSG",
          payload: error.detail || error.message,
        })
      )
      .finally(() => {
        dispatch({ type: "SET_JOIN_TEAM_LOADING", payload: false });
      });
  };

  const handleUpdateTeam = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();
    dispatch({ type: "SET_UPDATE_TEAM_ERROR_MSG", payload: null });
    dispatch({ type: "SET_UPDATE_TEAM_LOADING", payload: true });
    dispatch({ type: "SET_UPDATE_TEAM_SUCCESS_MSG", payload: null });

    if (team_role !== "admin") {
      dispatch({
        type: "SET_UPDATE_TEAM_ERROR_MSG",
        payload: "You are not an admin",
      });
      dispatch({ type: "SET_UPDATE_TEAM_LOADING", payload: false });
      return;
    }

    if (update_team_name === "") {
      dispatch({
        type: "SET_UPDATE_TEAM_ERROR_MSG",
        payload: "Team name cannot be empty",
      });
      dispatch({ type: "SET_UPDATE_TEAM_LOADING", payload: false });
      return;
    }

    let request = {
      name: update_team_name,
      description: update_team_description,
    };

    sendRequest(updateTeamUrl, "PATCH", request)
      .then(() => {
        dispatch({
          type: "SET_UPDATE_TEAM_SUCCESS_MSG",
          payload: "Team updated!",
        });
      })
      .catch((error) =>
        dispatch({
          type: "SET_UPDATE_TEAM_ERROR_MSG",
          payload: error.detail || error.message,
        })
      )
      .finally(() =>
        dispatch({ type: "SET_UPDATE_TEAM_LOADING", payload: false })
      );
  };

  const handleLeaveTeam = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();
    dispatch({ type: "SET_LEAVE_TEAM_ERROR_MSG", payload: null });
    dispatch({ type: "SET_LEAVE_TEAM_LOADING", payload: true });

    if (leaveTeamConfirm === "") {
      dispatch({
        type: "SET_LEAVE_TEAM_ERROR_MSG",
        payload: "You must enter the phrase to leave your team",
      });
      dispatch({ type: "SET_LEAVE_TEAM_LOADING", payload: false });
      return;
    }

    if (leaveTeamConfirm !== leaveTeamPhrase) {
      dispatch({
        type: "SET_LEAVE_TEAM_ERROR_MSG",
        payload: "Incorrect phrase to leave your team",
      });
      dispatch({ type: "SET_LEAVE_TEAM_LOADING", payload: false });
      return;
    }

    sendRequest(leaveTeamUrl, "POST")
      .then(() => {
        getUser();
        dispatch({ type: "SET_FIELD", field: "users", payload: [] });
        dispatch({ type: "SET_FIELD", field: "update_team_name", payload: "" });
        dispatch({
          type: "SET_FIELD",
          field: "update_team_description",
          payload: "",
        });
      })
      .catch((error) =>
        dispatch({
          type: "SET_LEAVE_TEAM_ERROR_MSG",
          payload: error.detail || error.message,
        })
      )
      .finally(() =>
        dispatch({ type: "SET_LEAVE_TEAM_LOADING", payload: false })
      );
  };

  const handleDeleteTeam = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();
    dispatch({ type: "SET_DELETE_TEAM_ERROR_MSG", payload: null });
    dispatch({ type: "SET_DELETE_TEAM_LOADING", payload: true });

    if (deleteTeamConfirm === "") {
      dispatch({
        type: "SET_DELETE_TEAM_ERROR_MSG",
        payload: "You must enter the phrase to delete your team",
      });
      dispatch({ type: "SET_DELETE_TEAM_LOADING", payload: false });
      return;
    }

    if (deleteTeamConfirm !== deleteTeamPhrase) {
      dispatch({
        type: "SET_DELETE_TEAM_ERROR_MSG",
        payload: "Incorrect phrase to delete your team",
      });
      dispatch({ type: "SET_DELETE_TEAM_LOADING", payload: false });
      return;
    }

    if (team_role !== "admin") {
      dispatch({
        type: "SET_DELETE_TEAM_ERROR_MSG",
        payload: "You are not an admin",
      });
      dispatch({ type: "SET_DELETE_TEAM_LOADING", payload: false });
      return;
    }

    sendRequest(deleteTeamUrl, "DELETE")
      .then(() => {
        getUser();
        dispatch({ type: "SET_FIELD", field: "users", payload: [] });
        dispatch({ type: "SET_FIELD", field: "update_team_name", payload: "" });
        dispatch({
          type: "SET_FIELD",
          field: "update_team_description",
          payload: "",
        });
      })
      .catch((error) =>
        dispatch({
          type: "SET_DELETE_TEAM_ERROR_MSG",
          payload: error.detail || error.message,
        })
      )
      .finally(() =>
        dispatch({ type: "SET_DELETE_TEAM_LOADING", payload: false })
      );
  };

  return (
    <>
      <Suspense fallback={<LoggedOutNav />}>
        <LoggedInNav />
      </Suspense>
      <div className="flex flex-col md:flex-row items-stretch text-center">
        <aside
          className={`p-2 gap-2 md:gap-4 md:p-4 flex flex-col items-center justify-top bg-slate-300 ${
            isSideBarOpen ? "min-w-min" : "hidden"
          }`}
        >
          <Button
            onClick={(e) => {
              handleUpdateProfile(e, "user", null);
            }}
            className={`w-full ${
              profileView === "user" ? "bg-zinc-500" : "bg-cyan-500"
            }`}
          >
            Your Profile
          </Button>
          <Button
            onClick={(e) => {
              handleUpdateProfile(e, "team", null);
            }}
            className={`w-full ${
              profileView === "team" ? "bg-zinc-500" : "bg-cyan-500"
            }`}
          >
            Your Team
          </Button>
        </aside>
        <div className="relative flex-1">
          <div className="flex justify-center">
            <Button
              onClick={(e) => handleUpdateProfile(e, null, !isSideBarOpen)}
              className="top-2 md:top-1/2 md:left-5 block absolute z-10 bg-cyan-500"
            >
              {isSideBarOpen ? "Close" : "Open"}
            </Button>
          </div>
          {profileView === "" && (
            <Main className="relative z-0">
              <img
                src={profileLoading.src}
                alt="Loading"
                className="w-96 object-contain"
              />
            </Main>
          )}
          {profileView === "user" && (
            <Main className="relative z-0 gap-16">
              <Form onSubmit={(e) => handleUpdateProfile(e, null, null)}>
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
                {updateUserLoading && (
                  <p className="text-zinc-500">Loading...</p>
                )}
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
                {deleteAccountLoading && (
                  <p className="text-zinc-500">Loading...</p>
                )}
              </Form>
            </Main>
          )}
          {profileView === "team" && (
            <Main className="relative z-0 gap-16">
              {team_role !== "" ? (
                <>
                  <div className="flex justify-center">
                    <div className="w-full">
                      <table className="table-auto m-auto">
                        <thead>
                          <tr className="bg-slate-300 text-zinc-500 font-semibold">
                            <th className="px-4 py-4 text-left">Users</th>
                            <th className="px-4 py-4 text-left">Role</th>
                          </tr>
                        </thead>
                        <tbody className="bg-slate-100 shadow-2xl text-zinc-500">
                          {users.map((user: User) => (
                            <tr
                              key={user.uid}
                              className="border-t border-zinc-500"
                            >
                              <td className="px-4 py-4 text-left">
                                {user.email}
                              </td>
                              <td className="px-4 py-4 text-left">
                                {user.team_role}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  {team_role === "admin" && (
                    <Form onSubmit={(e) => handleUpdateTeam(e)}>
                      <div className="flex flex-col gap-4 w-48 md:w-60">
                        <div className="flex flex-col gap-2">
                          <Input
                            id="update_team_name"
                            type="text"
                            value={update_team_name}
                            placeholder="Team Name"
                            onChange={(e) =>
                              dispatch({
                                type: "SET_FIELD",
                                field: "update_team_name",
                                payload: e.target.value,
                              })
                            }
                          />
                          <Input
                            id="update_team_description"
                            type="text"
                            value={update_team_description}
                            placeholder="Team Description (optional)"
                            onChange={(e) =>
                              dispatch({
                                type: "SET_FIELD",
                                field: "update_team_description",
                                payload: e.target.value,
                              })
                            }
                          />
                        </div>
                        <Button
                          onClick={(e) => handleUpdateTeam(e)}
                          className="bg-cyan-500"
                        >
                          Update Team
                        </Button>
                      </div>
                      {updateTeamErrorMsg && (
                        <p className="text-rose-500">{updateTeamErrorMsg}</p>
                      )}
                      {updateTeamLoading && (
                        <p className="text-zinc-500">Loading...</p>
                      )}
                      {updateTeamSuccessMsg && <p>{updateTeamSuccessMsg}</p>}
                    </Form>
                  )}
                  {team_role === "member" && (
                    <div className="flex flex-col gap-2">
                      <p className="text-zinc-500 bg-slate-300 p-2 w-48 md:w-60 text-left">
                        {update_team_name}
                      </p>
                      <p
                        className={`text-zinc-500 bg-slate-300 p-2 w-48 md:w-60 text-left ${
                          !update_team_description && "italic"
                        }`}
                      >
                        {update_team_description
                          ? update_team_description
                          : "No description"}
                      </p>
                    </div>
                  )}
                  <Form onSubmit={(e) => handleLeaveTeam(e)}>
                    <div className="flex flex-col gap-4 w-48 md:w-60">
                      <div className="flex flex-col gap-2">
                        <label
                          htmlFor="leaveTeamConfirm"
                          className="text-zinc-500 text-lg"
                        >
                          Type
                          <span className="font-semibold text-rose-500">
                            {" "}
                            leave{" "}
                          </span>
                          to leave your team:
                        </label>
                        <Input
                          id="leaveTeamConfirm"
                          type="text"
                          value={leaveTeamConfirm}
                          placeholder="leave"
                          onChange={(e) =>
                            dispatch({
                              type: "SET_FIELD",
                              field: "leaveTeamConfirm",
                              payload: e.target.value,
                            })
                          }
                        />
                      </div>
                      <Button className="bg-rose-500">Leave Team</Button>
                    </div>
                    {leaveTeamErrorMsg && (
                      <p className="text-rose-500">{leaveTeamErrorMsg}</p>
                    )}
                    {leaveTeamLoading && (
                      <p className="text-zinc-500">Loading...</p>
                    )}
                  </Form>
                  {team_role === "admin" && (
                    <Form onSubmit={(e) => handleDeleteTeam(e)}>
                      <div className="flex flex-col gap-4 w-48 md:w-60">
                        <div className="flex flex-col gap-2">
                          <label
                            htmlFor="deleteTeamConfirm"
                            className="text-zinc-500 text-lg"
                          >
                            Type
                            <span className="font-semibold text-rose-500">
                              {" "}
                              delete{" "}
                            </span>
                            to delete your team:
                          </label>
                          <Input
                            id="deleteTeamConfirm"
                            type="text"
                            value={deleteTeamConfirm}
                            placeholder="delete"
                            onChange={(e) =>
                              dispatch({
                                type: "SET_FIELD",
                                field: "deleteTeamConfirm",
                                payload: e.target.value,
                              })
                            }
                          />
                        </div>
                        <Button className="bg-rose-500">Delete Team</Button>
                      </div>
                      {deleteTeamErrorMsg && (
                        <p className="text-rose-500">{deleteTeamErrorMsg}</p>
                      )}
                      {deleteTeamLoading && (
                        <p className="text-zinc-500">Loading...</p>
                      )}
                    </Form>
                  )}
                </>
              ) : (
                <>
                  <Form onSubmit={(e) => handleCreateTeam(e)}>
                    <div className="flex flex-col gap-4 w-48 md:w-60">
                      <div className="flex flex-col gap-2">
                        <Input
                          id="create_team_name"
                          type="text"
                          value={create_team_name}
                          placeholder="Team name"
                          onChange={(e) =>
                            dispatch({
                              type: "SET_FIELD",
                              field: "create_team_name",
                              payload: e.target.value,
                            })
                          }
                        />
                        <Input
                          id="create_team_description"
                          type="text"
                          value={create_team_description}
                          placeholder="Team description (optional)"
                          onChange={(e) =>
                            dispatch({
                              type: "SET_FIELD",
                              field: "create_team_description",
                              payload: e.target.value,
                            })
                          }
                        />
                      </div>
                      <Button className="bg-cyan-500">Create Team</Button>
                    </div>
                    {createTeamErrorMsg && (
                      <p className="text-rose-500">{createTeamErrorMsg}</p>
                    )}
                    {createTeamLoading && (
                      <p className="text-zinc-500">Loading...</p>
                    )}
                  </Form>
                  <Form onSubmit={(e) => handleJoinTeam(e)}>
                    <div className="flex flex-col gap-4 w-48 md:w-60">
                      <div className="flex flex-col gap-2">
                        <Input
                          id="join_team_name"
                          type="text"
                          value={join_team_name}
                          placeholder="Team name"
                          onChange={(e) =>
                            dispatch({
                              type: "SET_FIELD",
                              field: "join_team_name",
                              payload: e.target.value,
                            })
                          }
                        />
                      </div>
                      <Button className="bg-cyan-500">Join Team</Button>
                    </div>
                    {joinTeamErrorMsg && (
                      <p className="text-rose-500">{joinTeamErrorMsg}</p>
                    )}
                    {joinTeamLoading && (
                      <p className="text-zinc-500">Loading...</p>
                    )}
                  </Form>
                </>
              )}
            </Main>
          )}
        </div>
      </div>
    </>
  );
}

export default Profile;
