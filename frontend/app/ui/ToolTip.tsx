function Tooltip({
  message,
  className,
}: {
  message: string;
  className?: string;
}) {
  return (
    <div
      className={`absolute bg-gray-700 text-zinc-50 text-xs py-1 px-2 rounded-md whitespace-nowrap ${className}`}
    >
      {message}
    </div>
  );
}

export default Tooltip;
