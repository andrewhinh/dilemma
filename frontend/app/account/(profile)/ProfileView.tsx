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

function ProfileView() {
  const { state: constState, dispatch: constDispatch } = useConst();
  const { state: accountState, dispatch: accountDispatch } = useAccount();
  const updateUser = useUpdateUser();

  const { joinDate, profilePicture, username, fullname } = constState;
  const { canUpdateUser, updateUserErrorMsg, updateUserLoading } = accountState;

  const [tempProfilePicture, setTempProfilePicture] = useState(profilePicture);
  const [tempUsername, setTempUsername] = useState(username);
  const [tempFullname, setTempFullname] = useState(fullname);

  return (
    <Main className="relative z-0 gap-16">
      <Form
        onSubmit={(e) =>
          updateUser(e, {
            profile_picture: tempProfilePicture,
            username: tempUsername,
            fullname: tempFullname,
          })
        }
      >
        <ProfilePicture
          picture={tempProfilePicture}
          setErrorMsg={(msg) =>
            accountDispatch({
              type: "SET_UPDATE_USER_ERROR_MSG",
              payload: msg,
            })
          }
          setPicture={(pic) => setTempProfilePicture(pic)}
          onChange={(pic) => {
            if (pic !== profilePicture) {
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
            {new Date(joinDate).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>
        <div className="flex flex-col gap-4 w-48 md:w-60">
          <div className="flex flex-col gap-2">
            <Input
              id="username"
              type="text"
              value={tempUsername}
              placeholder="Username"
              onChange={(e) => {
                setTempUsername(e.target.value);
                if (e.target.value !== username) {
                  if (e.target.value === "" && username === null) {
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
              id="fullname"
              type="text"
              value={tempFullname}
              placeholder="Full Name"
              onChange={(e) => {
                setTempFullname(e.target.value);
                if (e.target.value !== fullname) {
                  if (e.target.value === "" && fullname === null) {
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
                type: "SET_USERNAME",
                payload: tempUsername,
              });
              constDispatch({
                type: "SET_FULLNAME",
                payload: tempFullname,
              });
            }}
          >
            {updateUserLoading ? (
              <Image
                src={buttonLoading}
                className="w-6 h-6"
                alt="Update Profile"
              />
            ) : (
              <p>Update Profile</p>
            )}
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
