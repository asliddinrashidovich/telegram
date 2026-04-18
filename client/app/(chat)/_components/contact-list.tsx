"use client";

import { Iuser } from "@/types";
import { FC, useState } from "react";
import Settings from "./settings";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";
import { cn, sliceText } from "@/lib/utils";
import { useCurrentContact } from "@/hooks/use-contact";
import { useAuth } from "@/hooks/use-auth";
import { format } from "date-fns";
import { CONST } from "@/lib/constants";

interface Props {
  contacts: Iuser[];
}

const ContactList: FC<Props> = ({ contacts }) => {
  const [query, setQuery] = useState("");
  const router = useRouter();
  const { onlineUsers } = useAuth();
  const { currentContact, setCurrentContact } = useCurrentContact();

  const filteredContacts = contacts.filter((contact) =>
    contact.email.toLowerCase().includes(query.toLowerCase()),
  );

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
          currentContact?._id == contact._id && "bg-secondary/50",
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
            {onlineUsers.some((user) => user._id == contact._id) && (
              <div className="size-3 bg-green-500 absolute rounded-full bottom-0 right-0 z-50"></div>
            )}
          </div>
          <div>
            <h2 className="capitalize line-clamp-1 text-sm">
              {contact.email.split("@")[0]}
            </h2>
            <p className={cn("text-xs line-clamp-1", contact.lastMessage ? contact.lastMessage.status !== CONST.READ ? "text-foreground" : "text-muted-foreground" : "text-muted-foreground")}>
              {contact.lastMessage
                ? sliceText(contact.lastMessage.text, 20)
                : "No messages yet"}
            </p>
          </div>
        </div>
        {contact.lastMessage && (
          <div className="self-end">
            <p className="text-xs text-muted-foreground">
              {format(new Date(contact.lastMessage.updated_at), "hh:mm a")}
            </p>
          </div>
        )}
      </div>
    );
  };
  return (
    <>
      <div className="flex items-center bg-background pl-2 sticky top-0">
        <Settings />
        <div className="w-full m-2">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="bg-secondary"
            type="text"
            placeholder="Search..."
          />
        </div>
      </div>

      {filteredContacts.length == 0 ? (
        <div className="w-full flex justify-center items-center text-center text-muted-foreground h-[95vh]">
          <p>Contacts lists is empty</p>
        </div>
      ) : (
        filteredContacts.map((contact) => (
          <div key={contact._id}>{renderContact(contact)}</div>
        ))
      )}
    </>
  );
};

export default ContactList;
