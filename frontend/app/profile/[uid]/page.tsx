"use client";

import { useEffect } from "react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";

import { useConst } from "../../providers";
import { useGetUser } from "../../utils";
import { useRefreshToken, useLogOut } from "../../lib/callbacks";
import { useProfile } from "../providers";
import { useUpdateUser } from "../utils";

import { LoggedInNav } from "../../ui/Nav";
import Main from "../../ui/Main";
import Form from "../../ui/Form";
import { Button } from "../../ui/Button";
import UserView from "../(user)/UserView";
import FriendView from "../(friends)/FriendView";
import profileLoading from "@/public/profile-loading.svg";
import profile from "@/public/profile.svg";
import friends from "@/public/friends.svg";
import xCloseSidebar from "@/public/x-close-sidebar.svg";
import xOpenSidebar from "@/public/x-open-sidebar.svg";
import yCloseSidebar from "@/public/y-close-sidebar.svg";
import yOpenSidebar from "@/public/y-open-sidebar.svg";

function Profile() {
  const { state: constState, dispatch: constDispatch } = useConst();
  const { state: profileState, dispatch: profileDispatch } = useProfile();

  const router = useRouter();
  const refreshToken = useRefreshToken();
  const logOut = useLogOut();
  const pathname = usePathname();
  const getUser = useGetUser();
  const updateUser = useUpdateUser();

  const { isLoggedIn, profileView, isSideBarOpen, uid } = constState;
  const { getUserInfo } = profileState;

  useEffect(() => {
    if (!isLoggedIn) {
      refreshToken().catch(() => {
        logOut("/login");
      });
    } else {
      if (pathname.split("/")[2] !== uid) {
        router.push(`/profile/${uid}`);
      } else if (getUserInfo) {
        getUser();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn, getUserInfo]);

  return (
    <>
      <LoggedInNav />
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
                profileDispatch({
                  type: "SET_CAN_UPDATE_USER",
                  payload: true,
                });
                constDispatch({
                  type: "SET_PROFILE_VIEW",
                  payload: "user",
                });
              }}
              className={`w-full px-4 py-2 ${
                profileView === "user" && "bg-zinc-500"
              }`}
            >
              <Image src={profile} className="w-6 h-6" alt="Your Profile" />
            </Button>
          </Form>
          <Form className="w-full" onSubmit={(e) => updateUser(e, false)}>
            <Button
              type="submit"
              onClick={() => {
                profileDispatch({
                  type: "SET_CAN_UPDATE_USER",
                  payload: true,
                });
                constDispatch({
                  type: "SET_PROFILE_VIEW",
                  payload: "friend",
                });
              }}
              className={`w-full px-4 py-2 ${
                profileView === "friend" && "bg-zinc-500"
              }`}
            >
              <Image src={friends} className="w-6 h-6" alt="Your Friends" />
            </Button>
          </Form>
        </aside>
        <div className="relative flex-1">
          <div className="flex justify-center">
            <Form className="w-full" onSubmit={(e) => updateUser(e, false)}>
              <Button
                type="submit"
                onClick={() => {
                  profileDispatch({
                    type: "SET_CAN_UPDATE_USER",
                    payload: true,
                  });
                  constDispatch({
                    type: "SET_IS_SIDEBAR_OPEN",
                    payload: !isSideBarOpen,
                  });
                }}
                className="bg-transparent top-2 md:top-1/2 md:left-5 absolute z-10"
              >
                {isSideBarOpen ? (
                  <>
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
                  </>
                ) : (
                  <>
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
                  </>
                )}
              </Button>
            </Form>
          </div>
          {profileView === "" && (
            <Main className="relative z-0">
              <Image
                src={profileLoading}
                alt="Loading"
                className="w-24 md:w-48 object-contain"
              />
            </Main>
          )}
          {profileView === "user" && <UserView />}
          {profileView === "friend" && <FriendView />}
        </div>
      </div>
    </>
  );
}

export default Profile;
