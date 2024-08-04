import { useConst, Property } from "../providers";
import { sendRequest } from "../lib/api";
import { SearchRequest } from "../providers";

const useSearch = () => {
  const { dispatch } = useConst();

  return (request: SearchRequest) => {
    return new Promise((resolve, reject) => {
      sendRequest("/search/properties", "POST", request).then((data) => {
        if (data.detail) {
          reject(data.detail);
        }
        if (Array.isArray(data)) {
          dispatch({ type: "SET_REPLACEMENTS", payload: data as string[] });
        } else {
          dispatch({
            type: "SET_POPUPS",
            payload: data.popups as number[],
          });
          dispatch({
            type: "SET_CENTER_LAT",
            payload: data.center_lat as number,
          });
          dispatch({
            type: "SET_CENTER_LONG",
            payload: data.center_long as number,
          });
          dispatch({
            type: "SET_PROPERTIES",
            payload: data.properties as Property[],
          });
        }
        resolve(data);
      });
    });
  };
};

export default useSearch;
