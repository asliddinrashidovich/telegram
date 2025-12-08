import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useCurrentContact } from "@/hooks/use-contact";
import { Settings2 } from "lucide-react";
import Image from "next/image";

const TopChat = () => {
  const { currentContact } = useCurrentContact();
  return (
    <div className="w-full flex justify-between items-center sticky top-0 z-50 h-[8vh] p-2 border-b bg-background">
      <div className="flex items-center">
        <Avatar className="z-40 w-10 h-10">
          <AvatarImage
            alt={currentContact?.email}
            className="object-cover"
            src={currentContact?.avatar}
          />
          <AvatarFallback className="uppercase">
            {currentContact?.email[0]}
          </AvatarFallback>
        </Avatar>
        <div className="ml-2">
          <h2 className="text-sm font-medium">{currentContact?.email}</h2>
          {/* typing */}
          {/* <div className="text-xs flex items-center justify-center gap-1 text-muted-foreground">
            <p className="text-secondary-foreground animate-pulse line-clamp-1">Hello world</p>
            <div className="self-end mb-1">
                <div className="flex justify-center items-center gap-1">
                    <div className="w-1 h-1 bg-secondary-foreground rounded-full animate-bounce [animate-delay: -0.3s]"></div>
                    <div className="w-1 h-1 bg-secondary-foreground rounded-full animate-bounce [animate-delay: -0.10s]"></div>
                    <div className="w-1 h-1 bg-secondary-foreground rounded-full animate-bounce [animate-delay: -0.15s]"></div>
                </div>
            </div>
          </div> */}

          {/* online or offline */}
          <p className="text-xs flex items-center">
            {/* <span className="bg-green-500 w-2 h-2 rounded-full mr-2"></span> Online */}
            Last seen recently
          </p>
        </div>
      </div>

      <Sheet>
        <SheetTrigger asChild>
          <Button
            className="cursor-pointer"
            variant={"secondary"}
            size={"icon"}
          >
            <Settings2 />
          </Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle />
          </SheetHeader>
          <div className="mx-auto w-1/2 h-36 relative">
            <Avatar className="w-full h-36">
              <AvatarImage
                alt={currentContact?.email}
                className="object-cover"
                src={currentContact?.avatar}
              />
              <AvatarFallback className="uppercase text-6xl">
                {currentContact?.email[0]}
              </AvatarFallback>
            </Avatar>
          </div>

          <Separator className="my-2"/>
          <h1 className="text-6xl uppercase">{currentContact?.email}</h1>

          <div className="flex flex-col space-y-1">
            {currentContact?.firstName && (
              <div className="flex items-center gap-1 mt-4">
                <p>First Name: </p>
                <p className="text-muted-foreground">{currentContact?.firstName}</p>
              </div>
            )}
            {currentContact?.lastName && (
              <div className="flex items-center gap-1 mt-4">
                <p>Last Name: </p>
                <p className="text-muted-foreground">{currentContact?.lastName}</p>
              </div>
            )}
            {currentContact?.bio && (
              <div className="flex items-center gap-1 mt-4">
                <p>About: <span className="text-muted-foreground">{currentContact?.bio}</span></p>
              </div>
            )}

            <Separator className="my-2"/>

            <h2 className="text-xl">Image</h2>
            <div className="flex flex-col space-y-2">
              <div className="w-full h-36 relative">
                <Image
                  src={"https://fcb-abj-pre.s3.amazonaws.com/img/jugadors/MESSI.jpg"}
                  alt={"https://fcb-abj-pre.s3.amazonaws.com/img/jugadors/MESSI.jpg"}
                  className="object-cover rounded-md"
                  fill
                />
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default TopChat;
