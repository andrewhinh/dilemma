"use client";

import { useState } from "react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";

import { useConst } from "../../providers";
import { useGetUser, useUpdateUser } from "../../utils";
import { useLogOut, useAuthEffect } from "../../lib/callbacks";
import { useAccount } from "../providers";

import Main from "../../ui/Main";
import Form from "../../ui/Form";
import { Button } from "../../ui/Button";
import Tooltip from "../../ui/ToolTip";
import ProfileView from "./ProfileView";
import ProfileEditView from "./ProfileEditView";
// import ChatRequests from "./ChatRequests";

import pageLoading from "@/public/page-loading.svg";
import profile from "@/public/profile.svg";
import profileEdit from "@/public/profile-edit.svg";
import chats from "@/public/chats.svg";
import chatRequests from "@/public/chat-requests.svg";
import leftArrow from "@/public/left-arrow.svg";
import rightArrow from "@/public/right-arrow.svg";
import upArrow from "@/public/up-arrow.svg";
import downArrow from "@/public/down-arrow.svg";

function Account() {
  const { state: constState, dispatch: constDispatch } = useConst();
  const { dispatch: accountDispatch } = useAccount();

  const router = useRouter();
  const logOut = useLogOut();
  const pathname = usePathname();
  const getUser = useGetUser();
  const updateUser = useUpdateUser();

  const { getUserInfo, account_view, is_sidebar_open, uuid } = constState;
  const [profileHover, setProfileHover] = useState(false);
  const [profileEditHover, setProfileEditHover] = useState(false);
  const [chatRequestHover, setChatRequestHover] = useState(false);
  const [sidebarHover, setSidebarHover] = useState(false);

  useAuthEffect({
    onError: () => {
      logOut("/login");
    },
    onSuccess: () => {
      if (pathname.split("/")[2] !== uuid) router.push(`/account/${uuid}`);
      if (getUserInfo) {
        getUser();
        constDispatch({ type: "SET_GET_USER_INFO", payload: false });
      }
    },
    dependencies: [getUserInfo],
  });

  return (
    <div className="flex flex-col md:flex-row flex-1">
      <div
        className={`p-2 gap-2 md:gap-4 md:p-4 flex flex-col items-center justify-top bg-slate-300 ${
          is_sidebar_open ? "min-w-min" : "hidden"
        }`}
      >
        <div
          className="relative w-full"
          onMouseEnter={() => setProfileHover(true)}
          onMouseLeave={() => setProfileHover(false)}
        >
          <Form
            onSubmit={(e) => {
              let value = "profile";
              constDispatch({
                type: "SET_ACCOUNT_VIEW",
                payload: value,
              });
              updateUser(e, {
                account_view: value,
              });
            }}
          >
            <Button
              type="submit"
              onClick={() => {
                accountDispatch({
                  type: "SET_CAN_UPDATE_USER",
                  payload: true,
                });
              }}
              className={`relative w-full px-4 py-2 ${
                account_view === "profile" && "bg-zinc-500"
              }`}
            >
              <Image src={profile} className="w-6 h-6" alt="Your Profile" />
            </Button>
          </Form>
          {profileHover && (
            <Tooltip
              message="Your Profile"
              className="hidden md:block left-16 top-1/4"
            />
          )}
        </div>
        <div
          className="relative w-full"
          onMouseEnter={() => setProfileEditHover(true)}
          onMouseLeave={() => setProfileEditHover(false)}
        >
          <Form
            onSubmit={(e) => {
              let value = "profile-edit";
              constDispatch({
                type: "SET_ACCOUNT_VIEW",
                payload: value,
              });
              updateUser(e, {
                account_view: value,
              });
            }}
          >
            <Button
              type="submit"
              onClick={() => {
                accountDispatch({
                  type: "SET_CAN_UPDATE_USER",
                  payload: true,
                });
              }}
              className={`w-full px-4 py-2 ${
                account_view === "profile-edit" && "bg-zinc-500"
              }`}
            >
              <Image src={profileEdit} className="w-6 h-6" alt="Edit Profile" />
            </Button>
          </Form>
          {profileEditHover && (
            <Tooltip
              message="Edit Profile"
              className="hidden md:block left-16 top-1/4"
            />
          )}
        </div>
        {/* <div
          className="relative w-full"
          onMouseEnter={() => setChatRequestHover(true)}
          onMouseLeave={() => setChatRequestHover(false)}
        >
          <Form
            onSubmit={(e) => {
              let value = "chat_requests";
              constDispatch({
                type: "SET_ACCOUNT_VIEW",
                payload: value,
              });
              updateUser(e, {
                account_view: value,
              });
            }}
          >
            <Button
              type="submit"
              onClick={() => {
                accountDispatch({
                  type: "SET_CAN_UPDATE_USER",
                  payload: true,
                });
              }}
              className={`w-full px-4 py-2 ${
                account_view === "chat_requests" && "bg-zinc-500"
              }`}
            >
              <Image
                src={chatRequests}
                className="w-6 h-6"
                alt="Manage Chat Requests"
              />
            </Button>
          </Form>
          {chatRequestHover && (
            <Tooltip
              message="Manage Chat Requests"
              className="hidden md:block left-16 top-1/4"
            />
          )}
        </div> */}
      </div>
      <div className="relative flex flex-col md:flex-row flex-1">
        <div
          onMouseEnter={() => setSidebarHover(true)}
          onMouseLeave={() => setSidebarHover(false)}
        >
          <Form
            className="w-full"
            onSubmit={(e) => {
              let value = !is_sidebar_open;
              constDispatch({
                type: "SET_IS_SIDEBAR_OPEN",
                payload: value,
              });
              updateUser(e, {
                is_sidebar_open: value,
              });
            }}
          >
            <Button
              type="submit"
              onClick={() => {
                accountDispatch({
                  type: "SET_CAN_UPDATE_USER",
                  payload: true,
                });
              }}
              className="bg-transparent top-2 md:top-1/2 md:left-5 absolute z-10"
            >
              <div className={is_sidebar_open ? "block" : "hidden"}>
                <Image
                  className="hidden md:block w-6 h-6"
                  src={leftArrow}
                  alt="Close Sidebar"
                />
                <Image
                  className="block md:hidden w-6 h-6"
                  src={upArrow}
                  alt="Close Sidebar"
                />
              </div>
              <div className={is_sidebar_open ? "hidden" : "block"}>
                <Image
                  className="hidden md:block w-6 h-6"
                  src={rightArrow}
                  alt="Open Sidebar"
                />
                <Image
                  className="block md:hidden w-6 h-6"
                  src={downArrow}
                  alt="Open Sidebar"
                />
              </div>
            </Button>
          </Form>
          {sidebarHover && (
            <Tooltip
              message={is_sidebar_open ? "Close Sidebar" : "Open Sidebar"}
              className="hidden md:block top-2 md:top-1/2 md:left-14 absolute z-10"
            />
          )}
        </div>
        <Main className={`relative z-0 ${account_view === "" ? "" : "hidden"}`}>
          <Image
            src={pageLoading}
            alt="Loading"
            className="w-24 md:w-48 object-contain"
          />
        </Main>
        <ProfileView show={account_view === "profile"} />
        <ProfileEditView show={account_view === "profile-edit"} />
        {/* <ChatRequests show={account_view === "chat_requests"} /> */}
      </div>
    </div>
  );
}

export default Account;
