"use client";

import { useState } from "react";
import Image from "next/image";
import { sendRequest } from "../lib/api";

import Form from "../ui/Form";
import Input from "../ui/Input";
import { FormButton } from "../ui/Button";
import buttonLoading from "@/public/button-loading.svg";

function CreateBox() {
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    const formData = new FormData(e.target as HTMLFormElement);
    const formDataObj = Object.fromEntries(
      Array.from(formData.entries()).map(([key, value]) => [
        key,
        value.toString(),
      ])
    );

    if (formDataObj.query === "") {
      setErrorMsg("Enter a topic to learn!");
      setLoading(false);
      return;
    }

    sendRequest("/create/path", "POST", formDataObj);
  };

  return (
    <Form onSubmit={handleSubmit}>
      <div className="gap-2 flex flex-col">
        <Input
          type="text"
          name="query"
          placeholder="Let's learn..."
          autoFocus
        />
        <FormButton>
          <Image
            src={buttonLoading}
            className={`w-6 h-6 ${loading ? "block" : "hidden"}`}
            alt="Create"
          />
          <p className={`${loading ? "hidden" : "block"}`}>Create</p>
        </FormButton>
      </div>
      {errorMsg && <p className="text-rose-500">{errorMsg}</p>}
    </Form>
  );
}

export default CreateBox;
