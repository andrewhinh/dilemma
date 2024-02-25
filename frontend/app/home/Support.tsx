import Footer from "../ui/Footer";

function Support() {
  return (
    <Footer>
      <div className="justify-center md:justify-end flex flex-1">
        <h3 className="text-lg font-semibold">
          <a
            href={`mailto:${process.env.NEXT_PUBLIC_SUPPORT_EMAIL}`}
            className="hover:opacity-50 transition 300ms ease-in-out"
          >
            Contact Support
          </a>
        </h3>
      </div>
    </Footer>
  );
}

export default Support;
