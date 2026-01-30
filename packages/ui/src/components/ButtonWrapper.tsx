interface ButtonWrapperProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export default function ButtonWrapper({
  children,
  ...args
}: ButtonWrapperProps) {
  const { className, ...restArgs } = args;
  return (
    <button
      className={`w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg cursor-pointer ${className}`}
      {...restArgs}
    >
      {children}
    </button>
  );
}
