"use client";

import { User, FriendRequest, Friend } from "./utils";
import { useProfile } from "./providers";
import { useSendRequest } from "../lib/utils";
import { useConst } from "../providers";
import { useGetUser } from "./utils";

import Main from "../ui/Main";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Form from "../ui/Form";

function FriendView() {
  const { state, dispatch } = useProfile();
  const { apiUrl } = useConst();
  const sendRequest = useSendRequest();
  const getUser = useGetUser();

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
        <div className="flex flex-col gap-4 w-48 md:w-60">
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
          <Button type="submit" className="bg-cyan-500">
            Send Friend Request
          </Button>
        </div>
        {sendRequestErrorMsg && (
          <p className="text-rose-500">{sendRequestErrorMsg}</p>
        )}
        {sendRequestLoading && <p className="text-zinc-500">Loading...</p>}
        {sendRequestSuccessMsg && <p>{sendRequestSuccessMsg}</p>}
      </Form>
      <div className="flex justify-center">
        <div className="w-full">
          <table className="table-auto m-auto">
            <thead>
              <tr className="bg-slate-300 text-zinc-500 font-semibold">
                <th className="px-4 py-4 text-left">Sent Friend Requests</th>
              </tr>
            </thead>
            <tbody className="bg-slate-100 shadow-2xl text-zinc-500">
              {sentFriendRequests.map((friendRequest: FriendRequest) => (
                <tr
                  key={friendRequest.uid}
                  className={`border-t border-zinc-500 ${
                    friendRequest.status !== "pending" && "hidden"
                  }`}
                >
                  <td className="px-4 py-4 text-left">
                    {friendRequest.username}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="flex justify-center">
        <div className="w-full">
          <table className="table-auto m-auto">
            <thead>
              <tr className="bg-slate-300 text-zinc-500 font-semibold">
                <th className="px-4 py-4 text-left">
                  Incoming Friend Requests
                </th>
              </tr>
            </thead>
            <tbody className="bg-slate-100 shadow-2xl text-zinc-500">
              {incomingFriendRequests.map((friendRequest: FriendRequest) => (
                <tr
                  key={friendRequest.uid}
                  className={`border-t border-zinc-500 ${
                    friendRequest.status !== "pending" && "hidden"
                  }`}
                >
                  <td className="px-4 py-4 w-72">
                    <div className="flex">
                      <div className="flex flex-1 justify-start">
                        <p className="flex flex-col justify-center">
                          {friendRequest.username}
                        </p>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Form onSubmit={(e) => handleAcceptFriendRequest(e)}>
                          <Input
                            id="acceptUsername"
                            name="username"
                            type="hidden"
                            value={friendRequest.username}
                          />
                          <Button type="submit" className="bg-cyan-500">
                            Accept
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
                            Decline
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
      </div>
      <div className="flex justify-center">
        <div className="w-full">
          <table className="table-auto m-auto">
            <thead>
              <tr className="bg-slate-300 text-zinc-500 font-semibold">
                <th className="px-4 py-4 text-left">Friends</th>
              </tr>
            </thead>
            <tbody className="bg-slate-100 shadow-2xl text-zinc-500">
              {friends.map((friend: Friend) => (
                <tr
                  key={friend.uid}
                  className={`border-t border-zinc-500 ${
                    friend.status !== "confirmed" && "hidden"
                  }`}
                >
                  <td className="px-4 py-4 w-48 md:w-60">
                    <div className="flex">
                      <div className="flex flex-1 justify-start">
                        <p className="flex flex-col justify-center">
                          {friend.username}
                        </p>
                      </div>
                      <div className="flex justify-end">
                        <Form onSubmit={(e) => handleDeleteFriend(e)}>
                          <Input
                            id="deleteUsername"
                            name="username"
                            type="hidden"
                            value={friend.username}
                          />
                          <Button type="submit" className="bg-rose-500">
                            Delete
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
      </div>
    </Main>
  );
}

export default FriendView;
