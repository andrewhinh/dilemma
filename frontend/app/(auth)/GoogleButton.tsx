import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { sendRequest } from "../lib/api";

import Form from "../ui/Form";
import { Button } from "../ui/Button";
import googleIcon from "@/public/google-icon.svg";
import buttonLoading from "@/public/button-loading.svg";

type GoogleButtonProps = {
  action: "login" | "signup";
};

function GoogleButton({ action }: GoogleButtonProps) {
  const router = useRouter();
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogle = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setGoogleLoading(true);

    sendRequest("/verify-email/google", "POST", { state: action }).then(
      (data) => {
        setGoogleLoading(false);
        if (data.detail) {
          router.push("/login");
        } else {
          router.push(data.url);
        }
      }
    );
  };

  return (
    <Form onSubmit={handleGoogle}>
      <Button className="p-3">
        {googleLoading ? (
          <Image src={buttonLoading} className="w-6 h-6" alt="Sign Up" />
        ) : (
          <div className="flex justify-center items-center gap-2">
            <Image src={googleIcon} className="w-8 h-8" alt="Google Icon" />
            <p className="hidden md:block">
              {action === "login" ? "Login" : "Sign up"} with Google
            </p>
            <p className="block md:hidden">Google</p>
          </div>
        )}
      </Button>
    </Form>
  );
}

export default GoogleButton;
