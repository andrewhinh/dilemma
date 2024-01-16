/* eslint-disable @next/next/no-img-element */
"use client";

import { useProfile } from "./providers";
import { sendRequest } from "../api/route";
import { useSetUser } from "./utils";

import Main from "../ui/Main";
import Form from "../ui/Form";
import Input from "../ui/Input";
import { FormButton } from "../ui/Button";
import FriendTable from "./FriendTable";
import buttonLoading from "@/public/button-loading.svg";

function FriendView() {
  const { state, dispatch } = useProfile();
  const setUser = useSetUser();

  const {
    requestUsername,
    sentFriendRequests,
    sendRequestErrorMsg,
    sendRequestLoading,
    revertRequestErrorMsg,
    incomingFriendRequests,
    acceptRequestErrorMsg,
    declineRequestErrorMsg,
    friends,
    deleteFriendErrorMsg,
  } = state;

  const handlesendFriendRequest = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();
    dispatch({ type: "SET_SEND_REQUEST_ERROR_MSG", payload: null });
    dispatch({ type: "SET_SEND_REQUEST_LOADING", payload: true });

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

    sendRequest("/friends/send-request", "POST", request)
      .then((data) => {
        setUser({ data });
        dispatch({
          type: "SET_FIELD",
          field: "requestUsername",
          payload: "",
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
          <FormButton className="whitespace-nowrap">
            {sendRequestLoading ? (
              <img
                className="w-6 h-6"
                src={buttonLoading.src}
                alt="Send Request"
              />
            ) : (
              <p>Send Request</p>
            )}
          </FormButton>
        </div>
        {sendRequestErrorMsg && (
          <p className="text-rose-500">{sendRequestErrorMsg}</p>
        )}
      </Form>
      <div className="gap-6 flex flex-col text-center items-center justify-center">
        <div className="w-full">
          <FriendTable
            title="Sent Requests"
            data={sentFriendRequests}
            type="sent"
          />
        </div>
        {revertRequestErrorMsg && (
          <p className="text-rose-500">{revertRequestErrorMsg}</p>
        )}
      </div>
      <div className="gap-6 flex flex-col text-center items-center justify-center">
        <div className="w-full">
          <FriendTable
            title="Incoming Requests"
            data={incomingFriendRequests}
            type="incoming"
          />
        </div>
        {acceptRequestErrorMsg && (
          <p className="text-rose-500">{acceptRequestErrorMsg}</p>
        )}
        {declineRequestErrorMsg && (
          <p className="text-rose-500">{declineRequestErrorMsg}</p>
        )}
      </div>
      <div className="gap-6 flex flex-col text-center items-center justify-center">
        <div className="w-full">
          <FriendTable title="Friends" data={friends} type="friends" />
        </div>
        {deleteFriendErrorMsg && (
          <p className="text-rose-500">{deleteFriendErrorMsg}</p>
        )}
      </div>
    </Main>
  );
}

export default FriendView;
