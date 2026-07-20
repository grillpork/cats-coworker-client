import React from "react";
import { Loader2 } from "lucide-react";

export const Button = ({
  children,
  type = "button",
  variant = "primary",
  isLoading = false,
  disabled = false,
  className = "",
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 select-none active:scale-[0.98] disabled:scale-100 disabled:opacity-50 disabled:pointer-events-none";

  const variants = {
    primary:
      "bg-blue-600 hover:bg-blue-500 text-white focus:ring-blue-500/20 border border-transparent",
    secondary:
      "bg-neutral-800 hover:bg-neutral-700 text-neutral-100 focus:ring-neutral-500/20 border border-transparent",
    outline:
      "bg-transparent hover:bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-neutral-100 focus:ring-neutral-500/20",
    danger:
      "bg-red-600 hover:bg-red-500 text-white focus:ring-red-500/20 border border-transparent",
  };

  const sizes = "px-4 py-2.5 text-sm";

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={`${baseStyles} ${variants[variant]} ${sizes} ${className}`}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" />
          Loading...
        </>
      ) : (
        children
      )}
    </button>
  );
};
