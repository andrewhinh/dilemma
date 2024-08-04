// import { useState } from "react";
// import Image from "next/image";
// import { useConst } from "@/app/providers";
// import { useAccount } from "../providers";
// import { sendRequest } from "../../lib/api";
// import { useSetUser } from "../../utils";

// import Main from "../../ui/Main";
// import Form from "../../ui/Form";
// import Input from "../../ui/Input";
// import { FormButton } from "../../ui/Button";
// import ChatsTable from "./ChatsTable";
// import buttonLoading from "@/public/button-loading.svg";

// function ChatView({ show }: { show: boolean }) {
//   const { state: constState } = useConst();
//   const { state: accountState } = useAccount();
//   const setUser = useSetUser();

//   const { sentChatRequests, receivedChatRequests } = constState;

//   const {
//     revertRequestErrorMsg,
//     acceptRequestErrorMsg,
//     declineRequestErrorMsg,
//   } = accountState;

//   const [requestName, setRequestName] = useState("");
//   const [sendRequestErrorMsg, setSendRequestErrorMsg] = useState("");
//   const [sendRequestLoading, setSendRequestLoading] = useState(false);

//   const handlesendChatRequest = (
//     e: React.MouseEvent<HTMLButtonElement, MouseEvent>
//   ) => {
//     e.preventDefault();
//     setSendRequestErrorMsg("");
//     setSendRequestLoading(true);

//     if (requestName === "") {
//       setSendRequestErrorMsg("Name cannot be empty");
//       setSendRequestLoading(false);
//       return;
//     }

//     let request = {
//       username: requestUsername,
//     };

//     sendRequest("/friends/send-request", "POST", request).then((data) => {
//       if (data.detail) setSendRequestErrorMsg(data.detail);
//       else {
//         setUser(data);
//         setRequestUsername("");
//       }
//       setSendRequestLoading(false);
//     });
//   };

//   return (
//     <Main className={`relative z-0 gap-16 ${show ? "block" : "hidden"}`}>
//       <Form onSubmit={(e) => handlesendChatRequest(e)}>
//         <div className="flex flex-col gap-4 w-48 md:w-60">
//           <Input
//             id="requestName"
//             type="text"
//             value={requestName}
//             placeholder="Name"
//             onChange={(e) => setRequestName(e.target.value)}
//           />
//           <FormButton className="whitespace-nowrap">
//             <Image
//               className={`w-6 h-6 ${sendRequestLoading ? "block" : "hidden"}`}
//               src={buttonLoading}
//               alt="Send Request"
//             />
//             <p className={`${sendRequestLoading ? "hidden" : "block"}`}>
//               Send Request
//             </p>
//           </FormButton>
//         </div>
//         {sendRequestErrorMsg && (
//           <p className="text-rose-500">{sendRequestErrorMsg}</p>
//         )}
//       </Form>
//       <div className="gap-6 flex flex-col text-center items-center justify-center">
//         <div className="w-full">
//           <ChatsTable
//             title="Sent"
//             data={sentChatRequests}
//             type="sent"
//           />
//         </div>
//         {revertRequestErrorMsg && (
//           <p className="text-rose-500">{revertRequestErrorMsg}</p>
//         )}
//       </div>
//       <div className="gap-6 flex flex-col text-center items-center justify-center">
//         <div className="w-full">
//           <ChatsTable
//             title="Received"
//             data={receivedChatRequests}
//             type="received"
//           />
//         </div>
//         {acceptRequestErrorMsg && (
//           <p className="text-rose-500">{acceptRequestErrorMsg}</p>
//         )}
//         {declineRequestErrorMsg && (
//           <p className="text-rose-500">{declineRequestErrorMsg}</p>
//         )}
//       </div>
//     </Main>
//   );
// }

// export default ChatView;
