import { useState, useEffect } from "react";
import { getSession, isValidSession } from "../../../utils/session";
import { decodeToken } from "../../../utils/jwt";

export const useSession = () => {
  const [token, setToken] = useState(null);
  const [decoded, setDecoded] = useState(null);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    const activeToken = getSession();
    setToken(activeToken);
    setDecoded(decodeToken(activeToken));
    setIsValid(isValidSession());
  }, []);

  return {
    token,
    decoded,
    isValid,
  };
};
