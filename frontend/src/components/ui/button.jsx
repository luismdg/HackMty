export function Button({
  variant = "default",
  size = "default",
  className = "",
  children,
  ...props
}) {
  const baseStyles =
    "inline-flex items-center justify-center text-sm font-medium transition-all focus:outline-none focus:ring-1 focus:ring-[#3B82F6] focus:ring-offset-0 disabled:opacity-50 disabled:pointer-events-none";

  const variants = {
    default:
      "bg-[#09111E] text-white border border-white/10 rounded-sm hover:bg-[#0C1526] shadow-sm hover:shadow-md",
    destructive:
      "bg-red-900 text-red-400 border border-red-700 hover:bg-red-800 hover:text-red-200 shadow-sm hover:shadow-md",
    outline:
      "border border-[#1E293B] text-white hover:bg-[#0C1526] shadow-sm hover:shadow-md",
    secondary:
      "bg-[#0C1526] text-white border border-[#1E293B] hover:bg-[#11233F] shadow-sm hover:shadow-md",
    ghost:
      "bg-transparent text-white hover:bg-[#1E293B] shadow-none hover:shadow-sm",
    link: "underline-offset-4 hover:underline text-[#3B82F6] bg-transparent shadow-none",
  };

  const sizes = {
    default: "h-10 py-2 px-4",
    sm: "h-9 px-3",
    lg: "h-11 px-8",
    icon: "h-10 w-10",
  };

  const variantStyles = variants[variant] || variants.default;
  const sizeStyles = sizes[size] || sizes.default;

  return (
    <button
      className={`${baseStyles} ${variantStyles} ${sizeStyles} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
