import Footer from "../ui/Footer";

function Support() {
  return (
    <Footer className="max-h-16">
      <h3 className="text-lg font-semibold">
        <a
          href={`mailto:${process.env.NEXT_PUBLIC_SUPPORT_EMAIL}`}
          className="hover:opacity-50 transition 300ms ease-in-out"
        >
          Contact Support
        </a>
      </h3>
    </Footer>
  );
}

export default Support;
