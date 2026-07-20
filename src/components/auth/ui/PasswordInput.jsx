import React from "react";
import { InputField } from "../../components/ui/InputField";

export default function PasswordInput({
  name = "password",
  label = "รหัสผ่าน",
  ...props
}) {
  return <InputField name={name} label={label} type="password" {...props} />;
}
