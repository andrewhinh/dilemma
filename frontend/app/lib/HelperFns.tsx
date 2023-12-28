import { useRouter } from "next/navigation";
import { useConst } from "../providers";

const useToProfile = () => {
  const router = useRouter();
  const { setToken, setUid } = useConst();

  return (
    url: string,
    formDataObj: object,
    onSuccess: () => void,
    onError: (error: string) => void
  ) => {
    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(formDataObj),
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then((data) => Promise.reject(data));
        }
        return response.json();
      })
      .then((data) => {
        setToken(data.access_token);
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
  const { apiUrl, setToken, setUid } = useConst();
  const logOutUrl = apiUrl + "/token/logout";

  return (noNavigate = false) => {
    fetch(logOutUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    }).then(() => {
      setToken("");
      setUid("");
      if (!noNavigate) router.push("/");
    });
  };
};

const useRefreshToken = () => {
  const { apiUrl, setToken, setUid } = useConst();
  const refreshTokenUrl = apiUrl + "/token/refresh";

  return () => {
    return new Promise((resolve) => {
      fetch(refreshTokenUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      })
        .then((response) => {
          if (!response.ok) {
            // If response is not OK, throw an error to catch
            return response.json().then((data) => {
              Promise.reject(data);
              resolve(false); // Resolve to false in case of error
            });
          }
          return response.json();
        })
        .then((data) => {
          setToken(data.access_token);
          setUid(data.uid);
          resolve(true); // Resolve to true for success
        })
        .catch(() => {
          resolve(false); // Resolve to false in case of an error
        });
    });
  };
};

const useSendRequest = () => {
  const { token } = useConst();

  return async (url: string, method: string, data: any = null) => {
    const response = await fetch(url, {
      method: method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
      body:
        data !== null && (method === "PATCH" || method === "POST")
          ? JSON.stringify(data)
          : null,
    });

    if (!response.ok) {
      return response.json().then((data) => Promise.reject(data));
    }
    return response.json();
  };
};

const useSendWebsocket = () => {
  return (
    websocket: WebSocket,
    setText: (value: string | ((prevValue: string) => string)) => void
  ) => {
    let timeout: number | NodeJS.Timeout | null | undefined = null;

    websocket.onopen = () => {
      timeout = setTimeout(() => {
        websocket.close(1011, "timeout");
      }, 15000);
    };

    websocket.onmessage = (event: MessageEvent) => {
      if (timeout !== null) {
        clearTimeout(timeout);
      }
      const data = JSON.parse(event.data);

      if (data.status === "ERROR") {
        websocket.close(1011, "error");
      } else if (data.status === "DONE") {
        setText(data.result);
        websocket.close(1000, "success");
      } else {
        setText((prevMessage: string) => prevMessage + data.message);
      }
    };

    websocket.onclose = (event) => {
      if (timeout !== null) {
        clearTimeout(timeout);
      }
      if (event.code !== 1000) {
        setText("There was an error. Please try again later.");
      }
    };

    websocket.onerror = () => {
      websocket.close(1011, "error");
    };
  };
};

export {
  useToProfile,
  useLogOut,
  useRefreshToken,
  useSendRequest,
  useSendWebsocket,
};
