/* eslint-disable @next/next/no-img-element */
"use client";

import { FriendRequest, Friend } from "./utils";
import { useProfile } from "./providers";
import { useSendRequest } from "../lib/utils";
import { useConst } from "../providers";
import { useGetUser } from "./utils";

import Main from "../ui/Main";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Form from "../ui/Form";
import check from "@/public/check.svg";
import x from "@/public/x.svg";
import trash from "@/public/trash.svg";
import buttonLoading from "@/public/button-loading.svg";

function FriendView() {
  const { state, dispatch } = useProfile();
  const { apiUrl } = useConst();
  const sendRequest = useSendRequest();
  const getUser = useGetUser();

  const maxSmallChars = 7;
  const maxLargeChars = 12;

  const {
    requestUsername,
    sentFriendRequests,
    sendRequestErrorMsg,
    sendRequestLoading,
    sendRequestSuccessMsg,
    incomingFriendRequests,
    acceptRequestErrorMsg,
    acceptRequestLoading,
    declineRequestErrorMsg,
    declineRequestLoading,
    friends,
    deleteFriendErrorMsg,
    deleteFriendLoading,
  } = state;

  const sendFriendRequestUrl = apiUrl + "/friends/send-request";
  const acceptFriendRequestUrl = apiUrl + "/friends/accept-request";
  const declineFriendRequestUrl = apiUrl + "/friends/decline-request";
  const deleteFriendUrl = apiUrl + "/friends/delete";

  const handlesendFriendRequest = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();
    dispatch({ type: "SET_SEND_REQUEST_ERROR_MSG", payload: null });
    dispatch({ type: "SET_SEND_REQUEST_LOADING", payload: true });
    dispatch({ type: "SET_SEND_REQUEST_SUCCESS_MSG", payload: null });

    if (requestUsername === "") {
      dispatch({
        type: "SET_SEND_REQUEST_ERROR_MSG",
        payload: "Username cannot be empty",
      });
      dispatch({ type: "SET_SEND_REQUEST_LOADING", payload: false });
      return;
    }

    let request = {
      username: requestUsername,
    };

    sendRequest(sendFriendRequestUrl, "POST", request)
      .then(() => {
        getUser();
        dispatch({
          type: "SET_SEND_REQUEST_SUCCESS_MSG",
          payload: "Friend request sent",
        });
      })
      .catch((error) => {
        dispatch({
          type: "SET_SEND_REQUEST_ERROR_MSG",
          payload: error.detail || error.message,
        });
      })
      .finally(() => {
        dispatch({ type: "SET_SEND_REQUEST_LOADING", payload: false });
      });
  };

  const handleAcceptFriendRequest = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();
    dispatch({ type: "SET_ACCEPT_REQUEST_ERROR_MSG", payload: null });
    dispatch({ type: "SET_ACCEPT_REQUEST_LOADING", payload: true });

    const formData = new FormData(e.target as HTMLFormElement);
    const formDataObj = Object.fromEntries(
      Array.from(formData.entries()).map(([key, value]) => [
        key,
        value.toString(),
      ])
    );

    if (formDataObj.username === "") {
      dispatch({
        type: "SET_ACCEPT_REQUEST_ERROR_MSG",
        payload: "Username cannot be empty",
      });
      dispatch({ type: "SET_ACCEPT_REQUEST_LOADING", payload: false });
      return;
    }

    let request = {
      username: formDataObj.username,
    };

    sendRequest(acceptFriendRequestUrl, "POST", request)
      .then(() => {
        getUser();
      })
      .catch((error) => {
        dispatch({
          type: "SET_ACCEPT_REQUEST_ERROR_MSG",
          payload: error.detail || error.message,
        });
      })
      .finally(() => {
        dispatch({ type: "SET_ACCEPT_REQUEST_LOADING", payload: false });
      });
  };

  const handleDeclineFriendRequest = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();
    dispatch({ type: "SET_DECLINE_REQUEST_ERROR_MSG", payload: null });
    dispatch({ type: "SET_DECLINE_REQUEST_LOADING", payload: true });

    const formData = new FormData(e.target as HTMLFormElement);
    const formDataObj = Object.fromEntries(
      Array.from(formData.entries()).map(([key, value]) => [
        key,
        value.toString(),
      ])
    );

    if (formDataObj.username === "") {
      dispatch({
        type: "SET_DECLINE_REQUEST_ERROR_MSG",
        payload: "Username cannot be empty",
      });
      dispatch({ type: "SET_DECLINE_REQUEST_LOADING", payload: false });
      return;
    }

    let request = {
      username: formDataObj.username,
    };

    sendRequest(declineFriendRequestUrl, "POST", request)
      .then(() => {
        getUser();
      })
      .catch((error) => {
        dispatch({
          type: "SET_DECLINE_REQUEST_ERROR_MSG",
          payload: error.detail || error.message,
        });
      })
      .finally(() => {
        dispatch({ type: "SET_DECLINE_REQUEST_LOADING", payload: false });
      });
  };

  const handleDeleteFriend = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();
    dispatch({ type: "SET_DELETE_FRIEND_ERROR_MSG", payload: null });
    dispatch({ type: "SET_DELETE_FRIEND_LOADING", payload: true });

    const formData = new FormData(e.target as HTMLFormElement);
    const formDataObj = Object.fromEntries(
      Array.from(formData.entries()).map(([key, value]) => [
        key,
        value.toString(),
      ])
    );

    if (formDataObj.username === "") {
      dispatch({
        type: "SET_DELETE_FRIEND_ERROR_MSG",
        payload: "Username cannot be empty",
      });
      dispatch({ type: "SET_DELETE_FRIEND_LOADING", payload: false });
      return;
    }

    let request = {
      username: formDataObj.username,
    };

    sendRequest(deleteFriendUrl, "POST", request)
      .then(() => {
        getUser();
      })
      .catch((error) => {
        dispatch({
          type: "SET_DELETE_FRIEND_ERROR_MSG",
          payload: error.detail || error.message,
        });
      })
      .finally(() => {
        dispatch({ type: "SET_DELETE_FRIEND_LOADING", payload: false });
      });
  };

  return (
    <Main className="relative z-0 gap-16">
      <Form onSubmit={(e) => handlesendFriendRequest(e)}>
        <div className="w-48 md:w-60 flex flex-col gap-4">
          <Input
            id="requestUsername"
            type="text"
            value={requestUsername}
            placeholder="Username"
            onChange={(e) =>
              dispatch({
                type: "SET_FIELD",
                field: "requestUsername",
                payload: e.target.value,
              })
            }
          />
          <Button type="submit" className="whitespace-nowrap">
            {sendRequestLoading ? (
              <img
                className="w-5 h-5"
                src={buttonLoading.src}
                alt="Send Request"
              />
            ) : (
              <p>Send Request</p>
            )}
          </Button>
        </div>
        {sendRequestErrorMsg && (
          <p className="text-rose-500">{sendRequestErrorMsg}</p>
        )}
        {sendRequestSuccessMsg && (
          <p className="text-cyan-500">{sendRequestSuccessMsg}</p>
        )}
      </Form>
      <div className="flex justify-center">
        <div className="w-full">
          <table className="table-auto m-auto w-48 md:w-60">
            <thead>
              <tr className="bg-slate-300 font-semibold">
                <th className="px-4 py-4 text-center whitespace-nowrap">
                  Sent Friend Requests
                </th>
              </tr>
            </thead>
            <tbody className="bg-slate-100 shadow-2xl">
              {sentFriendRequests.map((friendRequest: FriendRequest) => (
                <tr
                  key={friendRequest.uid}
                  className="border-t border-zinc-500"
                >
                  <td className="px-4 py-4 text-center">
                    {friendRequest.username.slice(0, maxLargeChars)}
                    {friendRequest.username.length > maxLargeChars && "..."}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="flex justify-center">
        <div className="w-full">
          <table className="table-auto m-auto w-60 md:w-80">
            <thead>
              <tr className="bg-slate-300 font-semibold">
                <th className="px-4 py-4 text-center whitespace-nowrap">
                  Incoming Friend Requests
                </th>
              </tr>
            </thead>
            <tbody className="bg-slate-100 shadow-2xl">
              {incomingFriendRequests.map((friendRequest: FriendRequest) => (
                <tr
                  key={friendRequest.uid}
                  className="border-t border-zinc-500"
                >
                  <td className="px-4 py-4">
                    <div className="flex justify-between">
                      <div className="flex flex-1">
                        <p className="flex md:hidden flex-col justify-center">
                          {friendRequest.username.slice(0, maxSmallChars)}
                          {friendRequest.username.length > maxSmallChars &&
                            "..."}
                        </p>
                        <p className="hidden md:flex flex-col justify-center">
                          {friendRequest.username.slice(0, maxLargeChars)}
                          {friendRequest.username.length > maxLargeChars &&
                            "..."}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Form onSubmit={(e) => handleAcceptFriendRequest(e)}>
                          <Input
                            id="acceptUsername"
                            name="username"
                            type="hidden"
                            value={friendRequest.username}
                          />
                          <Button type="submit">
                            {acceptRequestLoading ? (
                              <img
                                className="w-5 h-5"
                                src={buttonLoading.src}
                                alt="Accept"
                              />
                            ) : (
                              <img
                                className="w-5 h-5"
                                src={check.src}
                                alt="Accept"
                              />
                            )}
                          </Button>
                        </Form>
                        <Form onSubmit={(e) => handleDeclineFriendRequest(e)}>
                          <Input
                            id="declineUsername"
                            name="username"
                            type="hidden"
                            value={friendRequest.username}
                          />
                          <Button type="submit" className="bg-rose-500">
                            {declineRequestLoading ? (
                              <img
                                className="w-5 h-5"
                                src={buttonLoading.src}
                                alt="Decline"
                              />
                            ) : (
                              <img
                                className="w-5 h-5"
                                src={x.src}
                                alt="Decline"
                              />
                            )}
                          </Button>
                        </Form>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {acceptRequestErrorMsg && (
          <p className="text-rose-500">{acceptRequestErrorMsg}</p>
        )}
        {declineRequestErrorMsg && (
          <p className="text-rose-500">{declineRequestErrorMsg}</p>
        )}
      </div>
      <div className="flex justify-center">
        <div className="w-full">
          <table className="table-auto m-auto w-60">
            <thead>
              <tr className="bg-slate-300 font-semibold">
                <th className="px-4 py-4 text-center">Friends</th>
              </tr>
            </thead>
            <tbody className="bg-slate-100 shadow-2xl">
              {friends.map((friend: Friend) => (
                <tr
                  key={friend.uid}
                  className="w-60 md:w-72 border-t border-zinc-500"
                >
                  <td className="px-4 py-4">
                    <div className="flex justify-between">
                      <div className="flex flex-1">
                        <p className="flex flex-col justify-center">
                          {friend.username.slice(0, maxLargeChars)}
                          {friend.username.length > maxLargeChars && "..."}
                        </p>
                      </div>
                      <div className="flex">
                        <Form onSubmit={(e) => handleDeleteFriend(e)}>
                          <Input
                            id="deleteUsername"
                            name="username"
                            type="hidden"
                            value={friend.username}
                          />
                          <Button type="submit" className="bg-rose-500">
                            {deleteFriendLoading ? (
                              <img
                                className="w-5 h-5"
                                src={buttonLoading.src}
                                alt="Delete"
                              />
                            ) : (
                              <img
                                className="w-5 h-5"
                                src={trash.src}
                                alt="Delete"
                              />
                            )}
                          </Button>
                        </Form>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {deleteFriendErrorMsg && (
          <p className="text-rose-500">{deleteFriendErrorMsg}</p>
        )}
      </div>
    </Main>
  );
}

export default FriendView;
