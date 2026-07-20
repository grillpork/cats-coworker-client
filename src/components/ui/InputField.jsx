import React, { useState } from "react";
import { useFormContext } from "react-hook-form";
import { Eye, EyeOff } from "lucide-react";

export const InputField = ({
  name,
  label,
  type = "text",
  placeholder = "",
  className = "",
  validation = {},
  ...props
}) => {
  const context = useFormContext();
  const [showPassword, setShowPassword] = useState(false);

  // Fallback if not inside FormProvider
  const register = context ? context.register : () => ({});
  const errors = context ? context.formState.errors : {};

  // Support nested errors (e.g. "profile.name")
  const getNestedError = (errorsObj, path) => {
    if (!errorsObj || !path) return null;
    return path.split(".").reduce((acc, part) => acc?.[part], errorsObj);
  };

  const error = getNestedError(errors, name);
  const isPassword = type === "password";
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div className={`flex flex-col gap-1.5 w-full ${className}`}>
      {label && (
        <label
          htmlFor={name}
          className="text-sm font-medium text-neutral-300 select-none"
        >
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        <input
          id={name}
          type={inputType}
          placeholder={placeholder}
          className={`w-full px-3.5 py-2.5 bg-neutral-900/50 border rounded-lg text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 transition-all duration-200 ${
            error
              ? "border-red-500/80 focus:ring-red-500/20 focus:border-red-500"
              : "border-neutral-800 focus:ring-blue-500/20 focus:border-blue-500"
          }`}
          {...register(name, validation)}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 text-neutral-400 hover:text-neutral-200 transition-colors focus:outline-none"
          >
            {showPassword ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        )}
      </div>
      {error && (
        <span className="text-xs text-red-500 font-medium mt-1 select-none animate-pulse">
          {error.message}
        </span>
      )}
    </div>
  );
};
