import { useState } from "react";
import Image from "next/image";
import { useConst } from "@/app/providers";
import { useAccount } from "../providers";
import { sendRequest } from "../../lib/api";
import { useGetSentFriendRequests, useSetUser } from "../../utils";

import Main from "../../ui/Main";
import Form from "../../ui/Form";
import Input from "../../ui/Input";
import { FormButton } from "../../ui/Button";
import FriendTable from "./FriendTable";
import buttonLoading from "@/public/button-loading.svg";

function FriendView() {
  const { state: constState } = useConst();
  const { state: accountState } = useAccount();
  const setUser = useSetUser();
  const getSentFriendRequests = useGetSentFriendRequests();

  const { sentFriendRequests, incomingFriendRequests, friends } = constState;

  const {
    revertRequestErrorMsg,
    acceptRequestErrorMsg,
    declineRequestErrorMsg,
    deleteFriendErrorMsg,
  } = accountState;

  const [requestUsername, setRequestUsername] = useState("");
  const [sendRequestErrorMsg, setSendRequestErrorMsg] = useState("");
  const [sendRequestLoading, setSendRequestLoading] = useState(false);

  const handlesendFriendRequest = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();
    setSendRequestErrorMsg("");
    setSendRequestLoading(true);

    if (requestUsername === "") {
      setSendRequestErrorMsg("Username cannot be empty");
      setSendRequestLoading(false);
      return;
    }

    let request = {
      username: requestUsername,
    };

    sendRequest("/friends/send-request", "POST", request).then((data) => {
      if (data.detail) setSendRequestErrorMsg(data.detail);
      else {
        setUser(data);
        getSentFriendRequests();
        setRequestUsername("");
      }
      setSendRequestLoading(false);
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
            onChange={(e) => setRequestUsername(e.target.value)}
          />
          <FormButton className="whitespace-nowrap">
            {sendRequestLoading ? (
              <Image
                className="w-6 h-6"
                src={buttonLoading}
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
