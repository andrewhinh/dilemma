/* eslint-disable @next/next/no-img-element */
"use client";

import { useRef, useReducer, useEffect, Suspense } from "react";
import { useConst } from "../../providers";
import { LoggedInNav, LoggedOutNav } from "../../(util)/nav/LoggedInNav";
import Main from "../../(util)/ui/Main";
import validator from "validator";
import {
  useLogOut,
  useRefreshToken,
  useSendRequest,
} from "../../(util)/lib/HelperFns";
import { usePathname, notFound } from "next/navigation";
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
    dispatch({ type: "SET_UPDATE_TEAM_ERROR_MSG", payload: null });
    dispatch({ type: "SET_UPDATE_TEAM_LOADING", payload: true });
    dispatch({ type: "SET_UPDATE_TEAM_SUCCESS_MSG", payload: null });

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

    sendRequest(leaveTeamUrl, "POST")
      .then(() => {
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
      <div className="flex flex-col md:flex-row items-stretch text-center text-white">
        <aside
          className={`flex flex-col items-center justify-top bg-gradient-to-b from-purple-500 via-pink-500 to-purple-500 p-4 ${
            isSideBarOpen ? "min-w-min" : "hidden"
          }`}
        >
          <button
            onClick={(e) => {
              handleUpdateProfile(e, "user", null);
            }}
            className={`w-full my-2 py-2 px-4 text-white font-bold rounded ${
              profileView === "user"
                ? "bg-blue-700"
                : "bg-blue-500 hover:bg-blue-700"
            }`}
          >
            Your Profile
          </button>
          <button
            onClick={(e) => {
              handleUpdateProfile(e, "team", null);
            }}
            className={`w-full my-2 py-2 px-4 text-white font-bold rounded ${
              profileView === "team"
                ? "bg-blue-700"
                : "bg-blue-500 hover:bg-blue-700"
            }`}
          >
            Your Team
          </button>
        </aside>
        <div className="relative flex-1 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500">
          <button
            onClick={(e) => handleUpdateProfile(e, null, !isSideBarOpen)}
            className="hidden md:block absolute top-1/2 left-5 z-10 bg-blue-500 hover:bg-blue-700 font-bold py-2 px-4 rounded"
          >
            {isSideBarOpen ? "Close" : "Open"}
          </button>
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
            <Main header="Your Profile" className="relative z-0 gap-8">
              <form className="flex flex-col items-center justify-center gap-4">
                <label htmlFor="email" className="text-xl">
                  Email:
                </label>
                <input
                  id="email"
                  type="text"
                  value={email}
                  className="mb-4 text-center text-amber-500"
                  onChange={(e) =>
                    dispatch({
                      type: "SET_FIELD",
                      field: "email",
                      payload: e.target.value,
                    })
                  }
                />
                <label htmlFor="username" className="text-xl">
                  Username:
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  className="mb-4 text-center text-amber-500"
                  onChange={(e) =>
                    dispatch({
                      type: "SET_FIELD",
                      field: "username",
                      payload: e.target.value,
                    })
                  }
                />
                <label htmlFor="fullname" className="text-xl">
                  Full Name:
                </label>
                <input
                  id="fullname"
                  type="text"
                  value={fullname}
                  className="mb-4 text-center text-amber-500"
                  onChange={(e) =>
                    dispatch({
                      type: "SET_FIELD",
                      field: "fullname",
                      payload: e.target.value,
                    })
                  }
                />
                <button
                  onClick={(e) => handleUpdateProfile(e, null, null)}
                  className="mb-4 py-2 px-4 bg-blue-500 hover:bg-blue-700 text-white font-bold rounded"
                >
                  Update Profile
                </button>
                {updateUserErrorMsg && (
                  <p className="text-rose-500">{updateUserErrorMsg}</p>
                )}
                {updateUserLoading && <p>Loading...</p>}
                {updateUserSuccessMsg && <p>{updateUserSuccessMsg}</p>}
              </form>
              <form className="flex flex-col items-center justify-center gap-4">
                <label htmlFor="password" className="text-xl">
                  New password:
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  className="mb-4 text-center text-amber-500"
                  onChange={(e) =>
                    dispatch({
                      type: "SET_FIELD",
                      field: "password",
                      payload: e.target.value,
                    })
                  }
                />
                <label htmlFor="confirmPassword" className="text-xl">
                  Confirm new password:
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  className="mb-4 text-center text-amber-500"
                  onChange={(e) =>
                    dispatch({
                      type: "SET_FIELD",
                      field: "confirmPassword",
                      payload: e.target.value,
                    })
                  }
                />
                <button
                  onClick={(e) => handleUpdatePassword(e)}
                  className="mb-4 py-2 px-4 bg-blue-500 hover:bg-blue-700 text-white font-bold rounded"
                >
                  Update Password
                </button>
                {pwdErrorMsg && <p className="text-rose-500">{pwdErrorMsg}</p>}
                {pwdLoading && <p>Loading...</p>}
                {pwdSuccessMsg && <p>{pwdSuccessMsg}</p>}
              </form>
              <form className="flex flex-col items-center justify-center gap-4">
                <label htmlFor="deleteAccountConfirm" className="text-xl">
                  Type
                  <span className="font-bold"> {deleteAccountPhrase} </span>
                  to delete your account:
                </label>
                <input
                  id="deleteAccountConfirm"
                  type="text"
                  value={deleteAccountConfirm}
                  className="mb-4 text-center text-amber-500"
                  onChange={(e) =>
                    dispatch({
                      type: "SET_FIELD",
                      field: "deleteAccountConfirm",
                      payload: e.target.value,
                    })
                  }
                />
                <button
                  onClick={(e) => handleDeleteAccount(e)}
                  className="mb-4 py-2 px-4 bg-red-500 hover:bg-red-700 text-white font-bold rounded"
                >
                  Delete Account
                </button>
                {deleteAccountErrorMsg && (
                  <p className="text-rose-500">{deleteAccountErrorMsg}</p>
                )}
                {deleteAccountLoading && <p>Loading...</p>}
              </form>
            </Main>
          )}
          {profileView === "team" && (
            <Main header="Your Team" className="relative z-0 gap-8">
              {update_team_name ? (
                <>
                  <div className="flex justify-center">
                    <div className="w-full md:max-w-2xl">
                      <table className="table-auto m-auto">
                        <thead>
                          <tr className="bg-gradient-to-r from-blue-400 to-pink-500">
                            <th className="px-4 py-4 text-left text-xl">
                              Users
                            </th>
                            <th className="px-4 py-4 text-left text-xl">
                              Role
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {users.map((user: User) => (
                            <tr
                              key={user.uid}
                              className={`${
                                user.team_role === "admin"
                                  ? "bg-gradient-to-r from-pink-500 to-blue-400"
                                  : "bg-gradient-to-r from-blue-400 to-pink-500"
                              }`}
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
                    <form className="flex flex-col items-center justify-center gap-4">
                      <label htmlFor="update_team_name" className="text-xl">
                        Team name:
                      </label>
                      <input
                        id="update_team_name"
                        type="text"
                        value={update_team_name}
                        className="mb-4 text-center text-amber-500"
                        onChange={(e) =>
                          dispatch({
                            type: "SET_FIELD",
                            field: "update_team_name",
                            payload: e.target.value,
                          })
                        }
                      />
                      <label
                        htmlFor="update_team_description"
                        className="text-xl"
                      >
                        Team description (optional):
                      </label>
                      <input
                        id="update_team_description"
                        type="text"
                        value={update_team_description}
                        className="mb-4 text-center text-amber-500"
                        onChange={(e) =>
                          dispatch({
                            type: "SET_FIELD",
                            field: "update_team_description",
                            payload: e.target.value,
                          })
                        }
                      />
                      <button
                        onClick={(e) => handleUpdateTeam(e)}
                        className="mb-4 py-2 px-4 bg-blue-500 hover:bg-blue-700 text-white font-bold rounded"
                      >
                        Update Team
                      </button>
                      {updateTeamErrorMsg && (
                        <p
                          className="text-
              rose-500"
                        >
                          {updateTeamErrorMsg}
                        </p>
                      )}
                      {updateTeamLoading && <p>Loading...</p>}
                      {updateTeamSuccessMsg && <p>{updateTeamSuccessMsg}</p>}
                    </form>
                  )}
                  {team_role === "member" && (
                    <div className="flex flex-col items-center justify-center gap-4">
                      <p className="text-xl">Team name:</p>
                      <p className="text-xl text-amber-500">
                        {update_team_name}
                      </p>
                      {update_team_description && (
                        <>
                          <p className="text-xl">Team description:</p>
                          <p className="text-xl text-amber-500">
                            {update_team_description}
                          </p>
                        </>
                      )}
                    </div>
                  )}
                  <form className="flex flex-col items-center justify-center gap-4">
                    <label className="text-xl">Leave your team:</label>
                    <button
                      onClick={(e) => handleLeaveTeam(e)}
                      className="mb-4 py-2 px-4 bg-red-500 hover:bg-red-700 text-white font-bold rounded"
                    >
                      Leave Team
                    </button>
                    {leaveTeamErrorMsg && (
                      <p className="text-rose-500">{leaveTeamErrorMsg}</p>
                    )}
                    {leaveTeamLoading && <p>Loading...</p>}
                  </form>
                  {team_role === "admin" && (
                    <form className="flex flex-col items-center justify-center gap-4">
                      <label className="text-xl">Delete your team:</label>
                      <button
                        onClick={(e) => handleDeleteTeam(e)}
                        className="mb-4 py-2 px-4 bg-red-500 hover:bg-red-700 text-white font-bold rounded"
                      >
                        Delete Team
                      </button>
                      {deleteTeamErrorMsg && (
                        <p className="text-rose-500">{deleteTeamErrorMsg}</p>
                      )}
                      {deleteTeamLoading && <p>Loading...</p>}
                    </form>
                  )}
                </>
              ) : (
                <>
                  <form className="flex flex-col items-center justify-center gap-4">
                    <label htmlFor="create_team_name" className="text-xl">
                      Team name:
                    </label>
                    <input
                      id="create_team_name"
                      type="text"
                      value={create_team_name}
                      className="mb-4 text-center text-amber-500"
                      onChange={(e) =>
                        dispatch({
                          type: "SET_FIELD",
                          field: "create_team_name",
                          payload: e.target.value,
                        })
                      }
                    />
                    <label
                      htmlFor="create_team_description"
                      className="text-xl"
                    >
                      Team description (optional):
                    </label>
                    <input
                      id="create_team_description"
                      type="text"
                      value={create_team_description}
                      className="mb-4 text-center text-amber-500"
                      onChange={(e) =>
                        dispatch({
                          type: "SET_FIELD",
                          field: "create_team_description",
                          payload: e.target.value,
                        })
                      }
                    />
                    <button
                      onClick={(e) => handleCreateTeam(e)}
                      className="mb-4 py-2 px-4 bg-green-500 hover:bg-green-700 text-white font-bold rounded"
                    >
                      Create Team
                    </button>
                    {createTeamErrorMsg && (
                      <p className="text-rose-500">{createTeamErrorMsg}</p>
                    )}
                    {createTeamLoading && <p>Loading...</p>}
                  </form>
                  <form className="flex flex-col text-center items-center justify-center gap-4">
                    <label htmlFor="join_team_name" className="text-xl">
                      Join a team:
                    </label>
                    <input
                      id="join_team_name"
                      type="text"
                      value={join_team_name}
                      className="mb-4 text-center text-amber-500"
                      onChange={(e) =>
                        dispatch({
                          type: "SET_FIELD",
                          field: "join_team_name",
                          payload: e.target.value,
                        })
                      }
                    />
                    <button
                      onClick={(e) => handleJoinTeam(e)}
                      className="mb-4 py-2 px-4 bg-blue-500 hover:bg-blue-700 text-white font-bold rounded"
                    >
                      Join Team
                    </button>
                    {joinTeamErrorMsg && (
                      <p className="text-rose-500">{joinTeamErrorMsg}</p>
                    )}
                    {joinTeamLoading && <p>Loading...</p>}
                  </form>
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
