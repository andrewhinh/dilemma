// import Image from "next/image";
// import { useAccount } from "../providers";
// import { useConst } from "@/app/providers";
// import { sendRequest } from "../../lib/api";
// import {
//   useSetUser,
// } from "../../utils";

// import Form from "../../ui/Form";
// import Input from "../../ui/Input";
// import { Button } from "../../ui/Button";
// import check from "@/public/check.svg";
// import x from "@/public/x.svg";
// import buttonLoading from "@/public/button-loading.svg";
// import profileOutline from "@/public/profile-outline.svg";

// function ChatsTable({
//   title,
//   data,
//   type,
// }: {
//   title: string;
//   data: Array<any>;
//   type: "sent" | "incoming" | "chats";
// }) {
//   const { state: accountState, dispatch } = useAccount();
//   const setUser = useSetUser();

//   const {
//     revertRequestLoading,
//     acceptRequestLoading,
//     declineRequestLoading,
//   } = accountState;

//     const {state } = useConst();
//   const { uuid } = state;

//   const maxSmallChars = 7;
//   const maxLargeChars = 12;

//   const handleRevertChatRequest = (
//     e: React.MouseEvent<HTMLButtonElement, MouseEvent>
//   ) => {
//     e.preventDefault();
//     dispatch({ type: "SET_REVERT_REQUEST_ERROR_MSG", payload: null });
//     dispatch({ type: "SET_REVERT_REQUEST_LOADING", payload: true });

//     const formData = new FormData(e.target as HTMLFormElement);
//     const formDataObj = Object.fromEntries(
//       Array.from(formData.entries()).map(([key, value]) => [
//         key,
//         value.toString(),
//       ])
//     );

//     if (formDataObj.uuid === "") {
//       dispatch({
//         type: "SET_REVERT_REQUEST_ERROR_MSG",
//         payload: "UUID cannot be empty",
//       });
//       dispatch({ type: "SET_REVERT_REQUEST_LOADING", payload: false });
//       return;
//     }

//     let request = {
//         requester_uuid: uuid,
//         receiver_uuid: formDataObj.uuid,
//     };

//     sendRequest("/chat-request/revert/", "POST", request).then((data) => {
//       if (data.detail)
//         dispatch({
//           type: "SET_REVERT_REQUEST_ERROR_MSG",
//           payload: data.detail,
//         });
//       else {
//         setUser(data);
//       }
//       dispatch({ type: "SET_REVERT_REQUEST_LOADING", payload: false });
//     });
//   };

//   const handleAcceptChatRequest = (
//     e: React.MouseEvent<HTMLButtonElement, MouseEvent>
//   ) => {
//     e.preventDefault();
//     dispatch({ type: "SET_ACCEPT_REQUEST_ERROR_MSG", payload: null });
//     dispatch({ type: "SET_ACCEPT_REQUEST_LOADING", payload: true });

//     const formData = new FormData(e.target as HTMLFormElement);
//     const formDataObj = Object.fromEntries(
//       Array.from(formData.entries()).map(([key, value]) => [
//         key,
//         value.toString(),
//       ])
//     );

//     if (formDataObj.uuid === "") {
//       dispatch({
//         type: "SET_ACCEPT_REQUEST_ERROR_MSG",
//         payload: "UUID cannot be empty",
//       });
//       dispatch({ type: "SET_ACCEPT_REQUEST_LOADING", payload: false });
//       return;
//     }

//     let request = {
//         requester_uuid: formDataObj.uuid,
//         receiver_uuid: uuid,
//     };

//     sendRequest("/chat-request/accept/", "POST", request).then((data) => {
//       if (data.detail)
//         dispatch({
//           type: "SET_ACCEPT_REQUEST_ERROR_MSG",
//           payload: data.detail,
//         });
//       else {
//         setUser(data);
//       }
//       dispatch({ type: "SET_ACCEPT_REQUEST_LOADING", payload: false });
//     });
//   };

//   const handleDeclineChatRequest = (
//     e: React.MouseEvent<HTMLButtonElement, MouseEvent>
//   ) => {
//     e.preventDefault();
//     dispatch({ type: "SET_DECLINE_REQUEST_ERROR_MSG", payload: null });
//     dispatch({ type: "SET_DECLINE_REQUEST_LOADING", payload: true });

//     const formData = new FormData(e.target as HTMLFormElement);
//     const formDataObj = Object.fromEntries(
//       Array.from(formData.entries()).map(([key, value]) => [
//         key,
//         value.toString(),
//       ])
//     );

//     if (formDataObj.uuid === "") {
//       dispatch({
//         type: "SET_DECLINE_REQUEST_ERROR_MSG",
//         payload: "UUID cannot be empty",
//       });
//       dispatch({ type: "SET_DECLINE_REQUEST_LOADING", payload: false });
//       return;
//     }

//     let request = {
//       requester_uuid: formDataObj.uuid,
//         receiver_uuid: uuid,
//     };

//     sendRequest("/chat-request/decline/", "POST", request).then((data) => {
//       if (data.detail)
//         dispatch({
//           type: "SET_DECLINE_REQUEST_ERROR_MSG",
//           payload: data.detail,
//         });
//       else {
//         setUser(data);
//       }
//       dispatch({ type: "SET_DECLINE_REQUEST_LOADING", payload: false });
//     });
//   };

//   return (
//     <table className="table-auto m-auto w-48 md:w-60">
//       <thead>
//         <tr className="bg-slate-300 font-semibold">
//           <th className="p-4 text-center whitespace-nowrap">{title}</th>
//         </tr>
//       </thead>
//       <tbody className="bg-slate-100 shadow-md">
//         {data.map((row) => (
//           <tr key={row.uuid} className="border-t border-zinc-500">
//             <td className="p-4 flex justify-between">
//               <div className="flex flex-1 gap-2 justify-start items-center">
//                 <div className="group relative inline-block">
//                   <Image
//                     src={row.profile_picture || ""}
//                     width={40}
//                     height={40}
//                     alt="Profile Picture"
//                     className={`rounded-full w-8 h-8 md:w-10 md:h-10 ${
//                       row.profile_picture ? "block" : "hidden"
//                     }`}
//                   />
//                   <Image
//                     src={profileOutline}
//                     width={40}
//                     height={40}
//                     alt="Profile Picture"
//                     className={`rounded-full w-8 h-8 md:w-10 md:h-10 ${
//                       row.profile_picture ? "hidden" : "block"
//                     }`}
//                   />
//                   <div className="w-24 md:w-44 absolute bottom-full left-1/2 transform -translate-x-1/2 -translate-y-2 bg-cyan-200 text-zinc-500 p-2 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300">
//                     <p className="flex md:hidden justify-center font-semibold">
//                       {row.username.slice(0, maxSmallChars)}
//                       {row.username.length > maxSmallChars && "..."}
//                     </p>
//                     <p className="hidden md:flex justify-center font-semibold">
//                       {row.username.slice(0, maxLargeChars)}
//                       {row.username.length > maxLargeChars && "..."}
//                     </p>
//                     <p>Joined on </p>
//                     <p className="flex md:hidden justify-center text-cyan-500">
//                       {new Date(row.join_date).toLocaleDateString("en-US", {
//                         month: "numeric",
//                         day: "numeric",
//                         year: "2-digit",
//                       })}
//                     </p>
//                     <p className="hidden md:flex justify-center text-cyan-500">
//                       {new Date(row.join_date).toLocaleDateString("en-US", {
//                         month: "long",
//                         day: "numeric",
//                         year: "numeric",
//                       })}
//                     </p>
//                   </div>
//                 </div>
//               </div>
//               <div className="flex gap-1 md:gap-2">
//                 {type === "sent" && (
//                   <Form onSubmit={(e) => handleRevertChatRequest(e)}>
//                     <Input
//                       id="revertUsername"
//                       name="username"
//                       type="hidden"
//                       value={row.username}
//                     />
//                     <Button
//                       type="submit"
//                       className="bg-rose-500 rounded-full w-8 h-8 md:w-10 md:h-10"
//                     >
//                       <Image
//                         className={`w-4 h-4 ${
//                           revertRequestLoading ? "block" : "hidden"
//                         }`}
//                         src={buttonLoading}
//                         alt="Revert"
//                       />
//                       <Image
//                         className={`w-4 h-4 ${
//                           revertRequestLoading ? "hidden" : "block"
//                         }`}
//                         src={x}
//                         alt="Revert"
//                       />
//                     </Button>
//                   </Form>
//                 )}
//                 {type === "incoming" && (
//                   <>
//                     <Form onSubmit={(e) => handleAcceptChatRequest(e)}>
//                       <Input
//                         id="acceptUsername"
//                         name="username"
//                         type="hidden"
//                         value={row.username}
//                       />
//                       <Button
//                         type="submit"
//                         className="rounded-full w-8 h-8 md:w-10 md:h-10"
//                       >
//                         <Image
//                           className={`w-4 h-4 ${
//                             acceptRequestLoading ? "block" : "hidden"
//                           }`}
//                           src={buttonLoading}
//                           alt="Accept"
//                         />
//                         <Image
//                           className={`w-4 h-4 ${
//                             acceptRequestLoading ? "hidden" : "block"
//                           }`}
//                           src={check}
//                           alt="Accept"
//                         />
//                       </Button>
//                     </Form>
//                     <Form onSubmit={(e) => handleDeclineChatRequest(e)}>
//                       <Input
//                         id="declineUsername"
//                         name="username"
//                         type="hidden"
//                         value={row.username}
//                       />
//                       <Button
//                         type="submit"
//                         className="bg-rose-500 rounded-full w-8 h-8 md:w-10 md:h-10"
//                       >
//                         <Image
//                           className={`w-4 h-4 ${
//                             declineRequestLoading ? "block" : "hidden"
//                           }`}
//                           src={buttonLoading}
//                           alt="Decline"
//                         />
//                         <Image
//                           className={`w-4 h-4 ${
//                             declineRequestLoading ? "hidden" : "block"
//                           }`}
//                           src={x}
//                           alt="Decline"
//                         />
//                       </Button>
//                     </Form>
//                   </>
//                 )}
//               </div>
//             </td>
//           </tr>
//         ))}
//       </tbody>
//     </table>
//   );
// }

// export default ChatsTable;
