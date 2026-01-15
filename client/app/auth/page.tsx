import { FaTelegram } from "react-icons/fa";
import Social from "./_components/social";
import State from "./_components/state";
import { ModeToggle } from "@/components/shared/mode-toggle";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { redirect } from "next/navigation";

async function Page() {
  const session = await getServerSession(authOptions)
  if(session) return redirect("/")

  return (
    <div className="container max-w-md w-full h-screen flex justify-center items-center flex-col space-y-4">
      <FaTelegram size={120} className="text-blue-500" />
      <div className="flex items-center gap-2">
        <h1 className="text-4xl font-bold text-center">Telegram</h1>
        <ModeToggle />
      </div>
      <State />
      <Social />
    </div>
  );
}

export default Page;
