/* eslint-disable @next/next/no-img-element */
import { Friend, FriendRequest } from "./utils";
import { useProfile } from "./providers";
import { sendRequest } from "../api/route";
import { useSetUser } from "./utils";

import Form from "../ui/Form";
import Input from "../ui/Input";
import { Button } from "../ui/Button";
import check from "@/public/check.svg";
import x from "@/public/x.svg";
import trash from "@/public/trash.svg";
import buttonLoading from "@/public/button-loading.svg";
import profileOutline from "@/public/profile-outline.svg";

function FriendTable({
  title,
  data,
  type,
}: {
  title: string;
  data: FriendRequest[] | Friend[];
  type: "sent" | "incoming" | "friends";
}) {
  const { state, dispatch } = useProfile();
  const setUser = useSetUser();

  const {
    revertRequestLoading,
    acceptRequestLoading,
    declineRequestLoading,
    deleteFriendLoading,
  } = state;

  const maxSmallChars = 7;
  const maxLargeChars = 12;

  const handleRevertFriendRequest = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();
    dispatch({ type: "SET_REVERT_REQUEST_ERROR_MSG", payload: null });
    dispatch({ type: "SET_REVERT_REQUEST_LOADING", payload: true });

    const formData = new FormData(e.target as HTMLFormElement);
    const formDataObj = Object.fromEntries(
      Array.from(formData.entries()).map(([key, value]) => [
        key,
        value.toString(),
      ])
    );

    if (formDataObj.username === "") {
      dispatch({
        type: "SET_REVERT_REQUEST_ERROR_MSG",
        payload: "Username cannot be empty",
      });
      dispatch({ type: "SET_REVERT_REQUEST_LOADING", payload: false });
      return;
    }

    let request = {
      username: formDataObj.username,
    };

    sendRequest("/friends/revert-request", "POST", request)
      .then((data) => {
        setUser({ data });
      })
      .catch((error) => {
        dispatch({
          type: "SET_REVERT_REQUEST_ERROR_MSG",
          payload: error.detail || error.message,
        });
      })
      .finally(() => {
        dispatch({ type: "SET_REVERT_REQUEST_LOADING", payload: false });
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

    sendRequest("/friends/accept-request", "POST", request)
      .then((data) => {
        setUser({ data });
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

    sendRequest("/friends/decline-request", "POST", request)
      .then((data) => {
        setUser({ data });
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

    sendRequest("/friends/delete", "POST", request)
      .then((data) => {
        setUser({ data });
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
    <table className="table-auto m-auto w-60 md:w-80">
      <thead>
        <tr className="bg-slate-300 font-semibold">
          <th className="p-4 text-center whitespace-nowrap">{title}</th>
        </tr>
      </thead>
      <tbody className="bg-slate-100 shadow-md">
        {data.map((row) => (
          <tr key={row.uid} className="border-t border-zinc-500">
            <td className="p-4 flex justify-between">
              <div className="flex flex-1 gap-2 justify-start items-center">
                <img
                  src={
                    row.profile_picture
                      ? row.profile_picture
                      : profileOutline.src
                  }
                  alt="Picture"
                  className={`rounded-full w-8 h-8 md:w-10 md:h-10`}
                />
                <div className="flex justify-center items-center">
                  <p className="flex md:hidden flex-col justify-center">
                    {row.username.slice(0, maxSmallChars)}
                    {row.username.length > maxSmallChars && "..."}
                  </p>
                  <p className="hidden md:flex flex-col justify-center">
                    {row.username.slice(0, maxLargeChars)}
                    {row.username.length > maxLargeChars && "..."}
                  </p>
                </div>
              </div>
              <div className="flex gap-1 md:gap-2">
                {type === "sent" && (
                  <Form onSubmit={(e) => handleRevertFriendRequest(e)}>
                    <Input
                      id="revertUsername"
                      name="username"
                      type="hidden"
                      value={row.username}
                    />
                    <Button
                      type="submit"
                      className="bg-rose-500 rounded-full w-8 h-8 md:w-10 md:h-10"
                    >
                      {revertRequestLoading ? (
                        <img
                          className="w-4 h-4"
                          src={buttonLoading.src}
                          alt="Revert"
                        />
                      ) : (
                        <img className="w-4 h-4" src={x.src} alt="Revert" />
                      )}
                    </Button>
                  </Form>
                )}
                {type === "incoming" && (
                  <>
                    <Form onSubmit={(e) => handleAcceptFriendRequest(e)}>
                      <Input
                        id="acceptUsername"
                        name="username"
                        type="hidden"
                        value={row.username}
                      />
                      <Button
                        type="submit"
                        className="rounded-full w-8 h-8 md:w-10 md:h-10"
                      >
                        {acceptRequestLoading ? (
                          <img
                            className="w-4 h-4"
                            src={buttonLoading.src}
                            alt="Accept"
                          />
                        ) : (
                          <img
                            className="w-4 h-4"
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
                        value={row.username}
                      />
                      <Button
                        type="submit"
                        className="bg-rose-500 rounded-full w-8 h-8 md:w-10 md:h-10"
                      >
                        {declineRequestLoading ? (
                          <img
                            className="w-4 h-4"
                            src={buttonLoading.src}
                            alt="Decline"
                          />
                        ) : (
                          <img className="w-4 h-4" src={x.src} alt="Decline" />
                        )}
                      </Button>
                    </Form>
                  </>
                )}
                {type === "friends" && (
                  <Form onSubmit={(e) => handleDeleteFriend(e)}>
                    <Input
                      id="deleteUsername"
                      name="username"
                      type="hidden"
                      value={row.username}
                    />
                    <Button
                      type="submit"
                      className="bg-rose-500 rounded-full w-8 h-8 md:w-10 md:h-10"
                    >
                      {deleteFriendLoading ? (
                        <img
                          className="w-4 h-4"
                          src={buttonLoading.src}
                          alt="Delete"
                        />
                      ) : (
                        <img className="w-4 h-4" src={trash.src} alt="Delete" />
                      )}
                    </Button>
                  </Form>
                )}
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default FriendTable;
