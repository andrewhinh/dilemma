"use client";

import { useState, useEffect } from "react";
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
import ProfileView from "../(profile)/ProfileView";
import ProfileEditView from "../(profile)/ProfileEditView";
import FriendRequests from "../(friends)/FriendRequests";
import FriendsView from "../(friends)/FriendsView";

import pageLoading from "@/public/page-loading.svg";
import profile from "@/public/profile.svg";
import profileEdit from "@/public/profile-edit.svg";
import friends from "@/public/friends.svg";
import friendRequests from "@/public/friend-requests.svg";
import xCloseSidebar from "@/public/x-close-sidebar.svg";
import xOpenSidebar from "@/public/x-open-sidebar.svg";
import yCloseSidebar from "@/public/y-close-sidebar.svg";
import yOpenSidebar from "@/public/y-open-sidebar.svg";

function Account() {
  const { state: constState, dispatch: constDispatch } = useConst();
  const { dispatch: accountDispatch } = useAccount();

  const router = useRouter();
  const logOut = useLogOut();
  const pathname = usePathname();
  const getUser = useGetUser();
  const updateUser = useUpdateUser();

  const { getUserInfo, accountView, isSideBarOpen, uuid } = constState;
  const [profileHover, setProfileHover] = useState(false);
  const [profileEditHover, setProfileEditHover] = useState(false);
  const [friendHover, setFriendHover] = useState(false);
  const [friendRequestHover, setFriendRequestHover] = useState(false);
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
          isSideBarOpen ? "min-w-min" : "hidden"
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
                accountView === "profile" && "bg-zinc-500"
              }`}
            >
              <Image src={profile} className="w-6 h-6" alt="Your Profile" />
            </Button>
          </Form>
          {profileHover && (
            <Tooltip message="Your Profile" className="left-16 top-1/4" />
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
                accountView === "profile-edit" && "bg-zinc-500"
              }`}
            >
              <Image src={profileEdit} className="w-6 h-6" alt="Edit Profile" />
            </Button>
          </Form>
          {profileEditHover && (
            <Tooltip message="Edit Profile" className="left-16 top-1/4" />
          )}
        </div>
        <div
          className="relative w-full"
          onMouseEnter={() => setFriendHover(true)}
          onMouseLeave={() => setFriendHover(false)}
        >
          <Form
            onSubmit={(e) => {
              let value = "friends";
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
                accountView === "friends" && "bg-zinc-500"
              }`}
            >
              <Image src={friends} className="w-6 h-6" alt="Your Friends" />
            </Button>
          </Form>
          {friendHover && (
            <Tooltip message="Your Friends" className="left-16 top-1/4" />
          )}
        </div>
        <div
          className="relative w-full"
          onMouseEnter={() => setFriendRequestHover(true)}
          onMouseLeave={() => setFriendRequestHover(false)}
        >
          <Form
            onSubmit={(e) => {
              let value = "friend_requests";
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
                accountView === "friend_requests" && "bg-zinc-500"
              }`}
            >
              <Image
                src={friendRequests}
                className="w-6 h-6"
                alt="Add Friends"
              />
            </Button>
          </Form>
          {friendRequestHover && (
            <Tooltip message="Add Friends" className="left-16 top-1/4" />
          )}
        </div>
      </div>
      <div className="relative flex flex-col md:flex-row flex-1">
        <div
          onMouseEnter={() => setSidebarHover(true)}
          onMouseLeave={() => setSidebarHover(false)}
        >
          <Form
            className="w-full"
            onSubmit={(e) => {
              let value = !isSideBarOpen;
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
              <div className={isSideBarOpen ? "block" : "hidden"}>
                <Image
                  className="hidden md:block w-6 h-6"
                  src={xCloseSidebar}
                  alt="Close Sidebar"
                />
                <Image
                  className="block md:hidden w-6 h-6"
                  src={yCloseSidebar}
                  alt="Close Sidebar"
                />
              </div>
              <div className={isSideBarOpen ? "hidden" : "block"}>
                <Image
                  className="hidden md:block w-6 h-6"
                  src={xOpenSidebar}
                  alt="Open Sidebar"
                />
                <Image
                  className="block md:hidden w-6 h-6"
                  src={yOpenSidebar}
                  alt="Open Sidebar"
                />
              </div>
            </Button>
          </Form>
          {sidebarHover && (
            <Tooltip
              message={isSideBarOpen ? "Close Sidebar" : "Open Sidebar"}
              className="top-2 md:top-1/2 md:left-14 absolute z-10"
            />
          )}
        </div>
        <Main className={`relative z-0 ${accountView === "" ? "" : "hidden"}`}>
          <Image
            src={pageLoading}
            alt="Loading"
            className="w-24 md:w-48 object-contain"
          />
        </Main>
        <ProfileView show={accountView === "profile"} />
        <ProfileEditView show={accountView === "profile-edit"} />
        <FriendsView show={accountView === "friends"} />
        <FriendRequests show={accountView === "friend_requests"} />
      </div>
    </div>
  );
}

export default Account;
