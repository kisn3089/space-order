interface ButtonWrapperProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export default function ButtonWrapper({
  children,
  ...args
}: ButtonWrapperProps) {
  const { className, ...restArgs } = args;
  return (
    <button
      type="button"
      className={`w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-xl ${className}`}
      {...restArgs}
    >
      {children}
    </button>
  );
}
