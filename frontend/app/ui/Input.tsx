interface InputProps {
  input?: string;
  id?: string;
  type?: string;
  name?: string;
  value?: string;
  placeholder?: string;
  autoFocus?: boolean;
  accept?: string;
  onChange?: (e: any) => void;
  className?: string;
  readonly?: boolean;
}

function Input({
  id,
  type,
  name,
  value,
  placeholder,
  autoFocus,
  accept,
  onChange,
  className,
  readonly,
}: InputProps) {
  const defaultClassName = "h-10 text-zinc-500 bg-slate-300 p-2";

  return (
    <input
      id={id}
      type={type}
      name={name}
      value={value}
      placeholder={placeholder}
      autoFocus={autoFocus}
      accept={accept}
      onChange={onChange}
      className={
        className ? `${className} ${defaultClassName}` : defaultClassName
      }
      readOnly={readonly}
    />
  );
}

export default Input;
