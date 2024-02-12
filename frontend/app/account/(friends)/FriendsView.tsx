import { useConst } from "@/app/providers";
import { useAccount } from "../providers";

import Main from "../../ui/Main";
import FriendsTable from "./FriendsTable";

function FriendView({ show }: { show: boolean }) {
  const { state: constState } = useConst();
  const { state: accountState } = useAccount();

  const { friends } = constState;
  const { deleteFriendErrorMsg } = accountState;

  return (
    <Main className={`relative z-0 gap-16 ${show ? "block" : "hidden"}`}>
      <div className="gap-6 flex flex-col text-center items-center justify-center">
        <div className="w-full">
          <FriendsTable title="Friends" data={friends} type="friends" />
        </div>
        {deleteFriendErrorMsg && (
          <p className="text-rose-500">{deleteFriendErrorMsg}</p>
        )}
      </div>
    </Main>
  );
}

export default FriendView;
