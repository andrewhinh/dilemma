import Image from "next/image";
import { useState } from "react";
import { useAccount } from "../providers";
import { useConst } from "../../providers";
import { useUpdateUser } from "../../utils";

import Main from "../../ui/Main";
import Form from "../../ui/Form";
import { ProfilePicture } from "../../ui/Upload";
import Input from "../../ui/Input";
import { FormButton } from "../../ui/Button";
import buttonLoading from "@/public/button-loading.svg";

function ProfileView({ show }: { show: boolean }) {
  const { state: constState, dispatch: constDispatch } = useConst();
  const { state: accountState, dispatch: accountDispatch } = useAccount();
  const updateUser = useUpdateUser();

  const { join_date, profile_picture, first_name, last_name } = constState;
  const { canUpdateUser, updateUserErrorMsg, updateUserLoading } = accountState;

  const [tempProfilePicture, setTempProfilePicture] = useState(profile_picture);
  const [tempFirstName, setTempFirstName] = useState(first_name);
  const [tempLastName, setTempLastName] = useState(last_name);

  return (
    <Main className={`relative z-0 gap-16 ${show ? "block" : "hidden"}`}>
      <Form
        onSubmit={(e) =>
          updateUser(e, {
            profile_picture: tempProfilePicture,
            first_name: tempFirstName,
            last_name: tempLastName,
          })
        }
      >
        <ProfilePicture
          picture={tempProfilePicture || ''}
          setErrorMsg={(msg) =>
            accountDispatch({
              type: "SET_UPDATE_USER_ERROR_MSG",
              payload: msg,
            })
          }
          setPicture={(pic) => setTempProfilePicture(pic)}
          onChange={(pic) => {
            if (pic !== profile_picture) {
              accountDispatch({
                type: "SET_CAN_UPDATE_USER",
                payload: true,
              });
            } else {
              accountDispatch({
                type: "SET_CAN_UPDATE_USER",
                payload: false,
              });
            }
          }}
        />
        <div className="flex flex-col">
          <p>Joined on</p>
          <p className="text-cyan-500">
            {join_date && new Date(join_date).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>
        <div className="flex flex-col gap-4 w-48 md:w-60">
          <div className="flex flex-col gap-2">
            <Input
              id="first_name"
              type="text"
              value={tempFirstName}
              placeholder="First Name"
              onChange={(e) => {
                setTempFirstName(e.target.value);
                if (e.target.value !== first_name) {
                  if (e.target.value === "" && first_name === null) {
                    accountDispatch({
                      type: "SET_CAN_UPDATE_USER",
                      payload: false,
                    });
                  } else {
                    accountDispatch({
                      type: "SET_CAN_UPDATE_USER",
                      payload: true,
                    });
                  }
                } else {
                  accountDispatch({
                    type: "SET_CAN_UPDATE_USER",
                      payload: false,
                  });
                }
              }}
            />
            <Input
              id="last_name"
              type="text"
              value={tempLastName}
              placeholder="Last Name"
              onChange={(e) => {
                setTempLastName(e.target.value);
                if (e.target.value !== last_name) {
                  if (e.target.value === "" && last_name === null) {
                    accountDispatch({
                      type: "SET_CAN_UPDATE_USER",
                      payload: false,
                    });
                  } else {
                    accountDispatch({
                      type: "SET_CAN_UPDATE_USER",
                      payload: true,
                    });
                  }
                } else {
                  accountDispatch({
                    type: "SET_CAN_UPDATE_USER",
                    payload: false,
                  });
                }
              }}
            />
          </div>
          <FormButton
            noHover={canUpdateUser}
            onClick={() => {
              constDispatch({
                type: "SET_PROFILE_PICTURE",
                payload: tempProfilePicture,
              });
              constDispatch({
                type: "SET_FIRST_NAME",
                payload: tempFirstName,
              });
              constDispatch({
                type: "SET_LAST_NAME",
                payload: tempLastName,
              });
            }}
          >
            <Image
              src={buttonLoading}
              className={`w-6 h-6 ${updateUserLoading ? "block" : "hidden"}`}
              alt="Update Profile"
            />
            <p className={updateUserLoading ? "hidden" : "block"}>
              Update Profile
            </p>
          </FormButton>
        </div>
        {updateUserErrorMsg && (
          <p className="text-rose-500">{updateUserErrorMsg}</p>
        )}
      </Form>
    </Main>
  );
}

export default ProfileView;
