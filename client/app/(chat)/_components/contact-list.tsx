"use client";

import { Iuser } from "@/types";
import { FC } from "react";
import Settings from "./settings";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useCurrentContact } from "@/hooks/use-contact";

interface Props {
  contacts: Iuser[];
}

const ContactList: FC<Props> = ({ contacts }) => {
  const router = useRouter();
  const { currentContact, setCurrentContact } = useCurrentContact();

  const renderContact = (contact: Iuser) => {
    const onChat = () => {
      if (currentContact?._id == contact._id) return;
      setCurrentContact(contact);
      router.push(`/?chat=${contact._id}`);
    };
    return (
      <div
        onClick={onChat}
        className={cn(
          "flex justify-between items-center cursor-pointer hover:bg-secondary/50 p-2",
          currentContact?._id == contact._id && "bg-secondary/50"
        )}
      >
        <div className="flex items-center gap-2">
          <div className="relative">
            <Avatar className="z-40 w-10 h-10">
              <AvatarImage
                alt={contact.email}
                className="object-cover"
                src={contact.avatar}
              />
              <AvatarFallback className="uppercase">
                {contact.email[0]}
              </AvatarFallback>
            </Avatar>
            <div className="size-3 bg-green-500 absolute rounded-full bottom-0 right-0 z-50"></div>
          </div>
          <div>
            <h2 className="capitalize line-clamp-1 text-sm">
              {contact.email.split("@")[0]}
            </h2>
            <p className="text-xs line-clamp-1 text-muted-foreground">
              No message yet
            </p>
          </div>
        </div>
        <div className="self-end">
          <p className="text-xs text-muted-foreground">19:20 pm</p>
        </div>
      </div>
    );
  };
  return (
    <>
      <div className="flex items-center bg-background pl-2 sticky top-0">
        <Settings />
        <div className="w-full m-2">
          <Input className="bg-secondary" type="text" placeholder="Search..." />
        </div>
      </div>

      {/*contacts length  */}
      {contacts.length == 0 && (
        <div className="w-full flex justify-center items-center text-center text-muted-foreground h-[95vh]">
          <p>Contacts lists is empty</p>
        </div>
      )}
      {contacts.map((contact) => (
        <div key={contact._id}>{renderContact(contact)}</div>
      ))}
    </>
  );
};

export default ContactList;
