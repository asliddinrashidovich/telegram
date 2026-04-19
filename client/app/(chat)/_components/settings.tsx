import DangerZoneForm from "@/components/forms/danger-zone.form";
import EmailForm from "@/components/forms/email.form";
import InformationForm from "@/components/forms/information.form";
import NotificationForm from "@/components/forms/notification.form";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { axiosClient } from "@/http/axios";
import { generateToken } from "@/lib/generate-token";
import { UploadButton, UploadDropzone } from "@/lib/uploadthing";
import { useMutation } from "@tanstack/react-query";
import {
  LogIn,
  Menu,
  Moon,
  Settings2,
  Sun,
  Upload,
  UserPlus,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { useState } from "react";
import { toast } from "sonner";
import { boolean } from "zod";

function Settings() {
  const { resolvedTheme, setTheme } = useTheme();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { data: session, update } = useSession();

  const { mutate, isPending } = useMutation({
    mutationFn: async (payload: IPayload) => {
      const token = await generateToken(session?.currentUser?._id);
      const { data } = await axiosClient.put("/user/profile", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return data;
    },
    onSuccess: () => {
      toast.success("Settings updated successfully");
      update();
    },
  });
  return (
    <>
      <Popover>
        <PopoverTrigger asChild>
          <Button size={"icon"} variant={"secondary"} className="max-md:w-full">
            <Menu size={30} />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0 w-80">
          <h2 className="pt-2 pl-2 text-muted-foreground text-sm">
            Settings:{" "}
            <span className="text-muted-foreground">{session?.currentUser?.email}</span>
          </h2>
          <Separator className="my-2" />
          <div className="flex flex-col">
            <div
              onClick={() => setIsProfileOpen(true)}
              className="flex justify-between items-center p-2 hover:bg-secondary cursor-pointer"
            >
              <div className="flex items-center gap-1">
                <Settings2 size={16} />
                <span className="text-sm">Profile</span>
              </div>
            </div>

            <div
              className="flex justify-between items-center p-2 hover:bg-secondary cursor-pointer"
              onClick={() => window.location.reload()}
            >
              <div className="flex items-center gap-1">
                <UserPlus size={16} />
                <span className="text-sm">Create contact</span>
              </div>
            </div>

            <div className="flex justify-between items-center p-2 hover:bg-secondary">
              <div className="flex items-center gap-1">
                <UserPlus size={16} />
                <span className="text-sm">Mute</span>
              </div>
              <Switch
                checked={!session?.currentUser?.muted}
                onCheckedChange={() =>
                  mutate({ muted: !session?.currentUser?.muted })
                }
                disabled={isPending}
              />
            </div>

            <div className="flex justify-between items-center p-2 hover:bg-secondary">
              <div className="flex items-center gap-1">
                {resolvedTheme === "dark" ? (
                  <Sun size={16} />
                ) : (
                  <Moon size={16} />
                )}
                <span className="text-sm">
                  {resolvedTheme === "dark" ? "Light mode" : "Dark mode"}
                </span>
              </div>
              <Switch
                checked={resolvedTheme === "dark" ? true : false}
                onCheckedChange={() =>
                  setTheme(resolvedTheme == "dark" ? "light" : "dark")
                }
              />
            </div>

            <div
              className="flex justify-between items-center p-2 cursor-pointer bg-destructive"
              onClick={() => signOut()}
            >
              <div className="flex items-center gap-1">
                <LogIn size={16} />
                <span className="text-sm">Logout</span>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      <Sheet open={isProfileOpen} onOpenChange={setIsProfileOpen}>
        <SheetContent side="left" className="w-80 p-2 max-md:w-full overflow-y-scroll">
          <SheetHeader>
            <SheetTitle className="text-2xl">My profile</SheetTitle>
            <SheetDescription>
              Setting up your profile will help you connect with your friends
              and family easily.
            </SheetDescription>
          </SheetHeader> 

          <Separator className="my-2" />
          {/* <UploadDropzone
              endpoint={"imageUploader"}
              onClientUploadComplete={(res) => console.log(res)}
              config={{appendOnPaste: true, mode: 'auto'}}
            /> */}

          <div className="md:mx-auto w-1/2 relative md:mb-5">
            <Avatar className="w-full h-full max-md:w-20 max-md:h-20">
              <AvatarImage src={session?.currentUser?.avatar} alt={session?.currentUser?.email} className="object-cover"/>
              <AvatarFallback className="text-xl uppercase">
                {session?.currentUser?.email.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <UploadButton
              endpoint={"imageUploader"}
              onClientUploadComplete={(res) => mutate({avatar: res[0].url})}
              config={{ appendOnPaste: true, mode: "auto" }}
              className="absolute md:right-0 max-md:left-22 max-md:top-7 md:buttom-0"
              appearance={{
                allowedContent: { display: "none" },
                button: { width: 40, height: 40, borderRadius: "100%" },
              }}
              content={{ button: <Upload size={16} /> }}
            />
            {/* <Button className="absolute right-0 bottom-0" size={"icon"}>
              <Upload size={16} />
            </Button> */}
          </div>

          <Accordion type="single" collapsible className="mt-4 overflow-y-auto">
            <AccordionItem value="item-3" className="mt-2">
              <AccordionTrigger className="bg-secondary px-2">
                Notification
              </AccordionTrigger>
              <AccordionContent className="mt-2 overflow-y-auto">
                <NotificationForm />
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-1">
              <AccordionTrigger className="bg-secondary px-2">
                Basic informataion
              </AccordionTrigger>
              <AccordionContent className="px-2 mt-2">
                <InformationForm />
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2" className="mt-2">
              <AccordionTrigger className="bg-secondary px-2">
                Email
              </AccordionTrigger>
              <AccordionContent className="px-2 mt-2">
                <EmailForm />
              </AccordionContent>
            </AccordionItem>


            <AccordionItem value="item-4" className="mt-2">
              <AccordionTrigger className="bg-secondary px-2">
                Danger zone
              </AccordionTrigger>
              <AccordionContent className="my-2 mt-2">
                <DangerZoneForm />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </SheetContent>
      </Sheet>
    </>
  );
}

export default Settings;

interface IPayload {
  muted?: boolean;
  avatar?: string;
}
