import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useCurrentContact } from "@/hooks/use-contact";
import { Settings2 } from "lucide-react";

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
      <Button className="cursor-pointer" variant={'secondary'} size={'icon'}>
        <Settings2/>
      </Button>
    </div>
  );
};

export default TopChat;
