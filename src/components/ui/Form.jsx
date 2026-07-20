import React from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

export const Form = ({
  schema,
  onSubmit,
  defaultValues,
  children,
  className = "",
  ...props
}) => {
  const methods = useForm({
    resolver: schema ? zodResolver(schema) : undefined,
    defaultValues,
  });

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(onSubmit)}
        className={className}
        {...props}
      >
        {typeof children === "function" ? children(methods) : children}
      </form>
    </FormProvider>
  );
};
