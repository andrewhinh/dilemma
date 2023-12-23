/* eslint-disable @next/next/no-img-element */
import personalWebsiteURL from "@/public/personal-website.png";

function Footer() {
  return (
    <footer className="flex flex-col gap-4 p-4 text-center text-white bg-gradient-to-r from-pink-500 via-purple-500 to-blue-400">
      <h3 className="text-lg font-semibold">{"Made by Andrew Hinh"}</h3>
      <div className="flex justify-center gap-14">
        <a href={"https://andrewhinh.github.io/"}>
          <img
            src={personalWebsiteURL.src}
            alt="Personal Website Link"
            className="object-contain h-12 mx-auto hover:opacity-50"
          />
        </a>
        <a href={"https://github.com/andrewhinh/project"}>
          <img
            src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg"
            alt="Repository Link"
            className="object-contain h-12 mx-auto hover:opacity-50"
          />
        </a>
        <a href={"https://www.linkedin.com/in/andrew-hinh/"}>
          <img
            src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/linkedin/linkedin-original.svg"
            alt="LinkedIn Link"
            className="object-contain h-12 mx-auto hover:opacity-50"
          />
        </a>
      </div>
      <img
        src="https://storage.googleapis.com/chydlx/codepen/random-gif-generator/giphy-logo.gif"
        alt="Giphy Logo"
        className="object-contain h-6 mx-auto"
      />
    </footer>
  );
}

export default Footer;
