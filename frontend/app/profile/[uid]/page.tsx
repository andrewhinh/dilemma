/* eslint-disable @next/next/no-img-element */
"use client";

import { useRef, useEffect } from "react";
import { usePathname, notFound } from "next/navigation";

import { useConst } from "../../providers";
import { useLogOut, useRefreshToken } from "../../lib/utils";
import { useProfile } from "../providers";
import { useGetUser, useUpdateUser } from "../utils";

import Main from "../../ui/Main";
import Button from "../../ui/Button";
import profileLoading from "@/public/profile-loading.svg";
import UserView from "../UserView";
import FriendView from "../FriendView";

function Profile() {
  const { token, uid } = useConst();
  const refreshToken = useRefreshToken();
  const logOut = useLogOut();
  const pathname = usePathname();
  const { state } = useProfile();
  const getUser = useGetUser();
  const updateUser = useUpdateUser();

  const { updateUserErrorMsg, profileView, isSideBarOpen } = state;

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

  return (
    <div className="flex flex-col md:flex-row items-stretch text-center">
      <aside
        className={`p-2 gap-2 md:gap-4 md:p-4 flex flex-col items-center justify-top bg-slate-300 ${
          isSideBarOpen ? "min-w-min" : "hidden"
        }`}
      >
        <Button
          onClick={(e) => {
            updateUser(e, "user", null);
          }}
          className={`w-full ${
            profileView === "user" ? "bg-zinc-500" : "bg-cyan-500"
          }`}
        >
          Your Profile
        </Button>
        <Button
          onClick={(e) => {
            updateUser(e, "friend", null);
          }}
          className={`w-full ${
            profileView === "friend" ? "bg-zinc-500" : "bg-cyan-500"
          }`}
        >
          Your Friends
        </Button>
      </aside>
      <div className="relative flex-1">
        <div className="flex justify-center">
          <Button
            onClick={(e) => updateUser(e, null, !isSideBarOpen)}
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
        {profileView === "user" && <UserView />}
        {profileView === "friend" && <FriendView />}
      </div>
    </div>
  );
}

export default Profile;
