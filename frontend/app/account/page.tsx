"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useConst } from "../providers";
import { useLogOut } from "../lib/callbacks";
import { useAuthEffect } from "../lib/callbacks";

import Main from "../ui/Main";
import pageLoading from "@/public/page-loading.svg";

const Redirect = () => {
  const router = useRouter();
  const { state } = useConst();
  const logOut = useLogOut();

  const { uid } = state;

  useAuthEffect({
    onSuccess: () => {
      router.push("/account/" + uid);
    },
    onError: () => {
      logOut("/login");
    },
  });

  return (
    <Main>
      <Image
        src={pageLoading}
        alt="Loading"
        className="w-24 md:w-48 object-contain"
      />
    </Main>
  );
};

export default Redirect;
