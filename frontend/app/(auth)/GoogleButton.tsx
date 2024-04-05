import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { sendRequest } from "../lib/api";

import { Button } from "../ui/Button";
import googleIcon from "@/public/google-icon.svg";
import buttonLoading from "@/public/button-loading.svg";

type GoogleButtonProps = {
  action: "login" | "signup";
  setErrorMsg: (msg: string) => void;
};

function GoogleButton({ action, setErrorMsg }: GoogleButtonProps) {
  const router = useRouter();
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogle = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setGoogleLoading(true);

    sendRequest("/auth/google/verify-email", "POST", { state: action }).then(
      (data) => {
        setGoogleLoading(false);
        if (data.detail) {
          setErrorMsg(data.detail);
        } else {
          router.push(data.url);
        }
      }
    );
  };

  return (
    <Button className="w-full h-10 p-3" onClick={handleGoogle}>
      <Image
        src={buttonLoading}
        className={`w-6 h-6 ${googleLoading ? "block" : "hidden"}`}
        alt="Loading..."
      />
      <div
        className={`flex justify-center items-center gap-2 ${
          googleLoading ? "hidden" : "block"
        }`}
      >
        <Image src={googleIcon} className="w-6 h-6" alt="Google Icon" />
        <p>Google</p>
      </div>
    </Button>
  );
}

export default GoogleButton;
