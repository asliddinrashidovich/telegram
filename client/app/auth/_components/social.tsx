"use client";

import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { FaGithub, FaGoogle } from "react-icons/fa";

function Social() {
  const [isLoading, setIsLoading] = useState(false);
  const onSignIn = async (provider: string) => {
    setIsLoading(true);
    await signIn(provider, { callbackUrl: "/" });
  };
  return (
    <div className="grid grid-cols-2 w-full gap-1">
      <Button
        variant={"outline"}
        onClick={() => onSignIn("google")}
        disabled={isLoading}
      >
        <span>Sign in with Google</span>
        <FaGoogle />
      </Button>
      <Button
        variant={"outline"}
        onClick={() => onSignIn("github")}
        disabled={isLoading}
      >
        <span>Sign in with Github</span>
        <FaGithub />
      </Button>
    </div>
  );
}

export default Social;
