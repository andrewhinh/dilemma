/* eslint-disable @next/next/no-img-element */
"use client";

import { useRef, useEffect } from "react";
import { usePathname, notFound } from "next/navigation";

import { useConst } from "../../providers";
import { useLogOut, useRefreshToken } from "../../lib/utils";
import { useProfile } from "../providers";
import { useGetUser, useUpdateUser } from "../utils";

import Main from "../../ui/Main";
import Form from "../../ui/Form";
import { Button } from "../../ui/Button";
import UserView from "../UserView";
import FriendView from "../FriendView";
import profileLoading from "@/public/profile-loading.svg";
import profile from "@/public/profile.svg";
import friends from "@/public/friends.svg";
import xCloseSidebar from "@/public/x-close-sidebar.svg";
import xOpenSidebar from "@/public/x-open-sidebar.svg";
import yCloseSidebar from "@/public/y-close-sidebar.svg";
import yOpenSidebar from "@/public/y-open-sidebar.svg";

function Profile() {
  const { token, uid } = useConst();
  const refreshToken = useRefreshToken();
  const logOut = useLogOut();
  const pathname = usePathname();
  const { dispatch, state } = useProfile();
  const getUser = useGetUser();
  const updateUser = useUpdateUser();

  const { getUserInfo, updateUserErrorMsg, profileView, isSideBarOpen } = state;

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
        if (getUserInfo) {
          getUser();
          if (updateUserErrorMsg) logOut();
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, getUserInfo]);

  return (
    <div className="flex flex-col md:flex-row items-stretch text-center">
      <aside
        className={`p-2 gap-2 md:gap-4 md:p-4 flex flex-col items-center justify-top bg-slate-300 ${
          isSideBarOpen ? "min-w-min" : "hidden"
        }`}
      >
        <Form className="w-full" onSubmit={(e) => updateUser(e, false)}>
          <Button
            type="submit"
            onClick={() => {
              dispatch({
                type: "SET_CAN_UPDATE_USER",
                payload: true,
              });
              dispatch({
                type: "SET_FIELD",
                field: "profileView",
                payload: "user",
              });
            }}
            className={`w-full px-4 py-2 ${
              profileView === "user" && "bg-zinc-500"
            }`}
          >
            <img src={profile.src} className="w-6 h-6" alt="Your Profile" />
          </Button>
        </Form>
        <Form className="w-full" onSubmit={(e) => updateUser(e, false)}>
          <Button
            type="submit"
            onClick={() => {
              dispatch({
                type: "SET_CAN_UPDATE_USER",
                payload: true,
              });
              dispatch({
                type: "SET_FIELD",
                field: "profileView",
                payload: "friend",
              });
            }}
            className={`w-full px-4 py-2 ${
              profileView === "friend" && "bg-zinc-500"
            }`}
          >
            <img src={friends.src} className="w-6 h-6" alt="Your Friends" />
          </Button>
        </Form>
      </aside>
      <div className="relative flex-1">
        <div className="flex justify-center">
          <Form className="w-full" onSubmit={(e) => updateUser(e, false)}>
            <Button
              type="submit"
              onClick={() => {
                dispatch({
                  type: "SET_CAN_UPDATE_USER",
                  payload: true,
                });
                dispatch({
                  type: "SET_FIELD",
                  field: "isSideBarOpen",
                  payload: !isSideBarOpen,
                });
              }}
              className="bg-transparent top-2 md:top-1/2 md:left-5 absolute z-10"
            >
              {isSideBarOpen ? (
                <>
                  <img
                    className="hidden md:block w-6 h-6"
                    src={xCloseSidebar.src}
                    alt="Close Sidebar"
                  />
                  <img
                    className="block md:hidden w-6 h-6"
                    src={yCloseSidebar.src}
                    alt="Close Sidebar"
                  />
                </>
              ) : (
                <>
                  <img
                    className="hidden md:block w-6 h-6"
                    src={xOpenSidebar.src}
                    alt="Open Sidebar"
                  />
                  <img
                    className="block md:hidden w-6 h-6"
                    src={yOpenSidebar.src}
                    alt="Open Sidebar"
                  />
                </>
              )}
            </Button>
          </Form>
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
        {profileView === "user" && <UserView />}
        {profileView === "friend" && <FriendView />}
      </div>
    </div>
  );
}

export default Profile;
