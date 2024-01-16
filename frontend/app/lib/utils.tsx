import { useRouter } from "next/navigation";
import { useConst } from "../providers";
import { sendRequest } from "../api/route";

const useToProfile = () => {
  const router = useRouter();
  const { setIsLoggedIn, setUid } = useConst();

  return (
    route: string,
    formDataObj: object,
    onSuccess: () => void,
    onError: (error: string) => void
  ) => {
    sendRequest(route, "POST", formDataObj)
      .then((data) => {
        setIsLoggedIn(true);
        setUid(data.uid);
        onSuccess();
        router.push("/profile/" + data.uid);
      })
      .catch((error) => {
        onError(error.detail || error.message);
      });
  };
};

const useLogOut = () => {
  const router = useRouter();
  const { setIsLoggedIn, setUid } = useConst();

  return (noNavigate = false) => {
    sendRequest("/token/logout", "POST").then(() => {
      setIsLoggedIn(false);
      setUid("");
      if (!noNavigate) router.push("/");
    });
  };
};

const useRefreshToken = () => {
  const { setIsLoggedIn, setUid } = useConst();

  return () => {
    sendRequest("/token/refresh", "POST").then((data) => {
      setIsLoggedIn(true);
      setUid(data.uid);
    });
  };
};

export { useToProfile, useLogOut, useRefreshToken };
