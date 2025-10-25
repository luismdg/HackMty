export function Badge({
  variant = "default",
  className = "",
  children,
  ...props
}) {
  const baseStyles =
    "inline-flex items-center px-2.5 py-0.5 text-xs font-semibold transition-all focus:outline-none focus:ring-1 focus:ring-[#3B82F6] focus:ring-offset-0";

  const variants = {
    default: "bg-[#0C1526] text-white border border-[#1E293B]",
    secondary: "bg-[#11233F] text-white border border-[#1E293B]",
    destructive: "bg-red-900 text-red-400 border border-red-700",
    outline: "bg-transparent text-white border border-[#1E293B]",
    accent: "bg-[#1E293B] text-[#3B82F6] border border-[#1E293B]",
    muted: "bg-[#09111E] text-[#C8D6E5] border border-[#1E293B]",
    status: "bg-[#0C1E3A] text-[#3B82F6] border border-[#3B82F6]/30",
  };

  const variantStyles = variants[variant] || variants.default;

  return (
    <div className={`${baseStyles} ${variantStyles} ${className}`} {...props}>
      {children}
    </div>
  );
}
