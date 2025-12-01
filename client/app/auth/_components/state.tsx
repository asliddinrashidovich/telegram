"use client";

import { useAuth } from "@/hooks/use-auth";
import SignIn from "./sign-in";
import Verification from "./verification";

function State() {
  const {step} = useAuth()

  return (
    <>
      {step == "login" && <SignIn/>}
      {step == "verify" && <Verification />}
    </>
  );
}

export default State;
