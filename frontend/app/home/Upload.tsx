"use client";

import Form from "../ui/Form";

function Upload() {
  return (
    <Form
      onSubmit={() => {}}
      className="hover:text-zinc-500 hover:bg-slate-100 border-double border-4 border-cyan-500 shadow-2xl hover:shadow-sm p-24 md:p-48 transition duration-300 ease-in-out rounded-lg relative"
    >
      <label
        htmlFor="file-upload"
        className="absolute inset-0 cursor-pointer flex flex-col justify-center items-center"
      >
        Upload to create flashcards
      </label>
      <input id="file-upload" type="file" className="hidden" />
    </Form>
  );
}

export default Upload;
