"use client";

import { Loader2 } from "lucide-react";
import ContactList from "./_components/contact-list";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useCurrentContact } from "@/hooks/use-contact";
import AddContact from "./_components/add-contact";
import { useForm } from "react-hook-form";
import z from "zod";
import { emailSchema, messageSchema } from "@/lib/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import TopChat from "./_components/top-chat";
import Chat from "./_components/chat";
import { useLoading } from "@/hooks/use-loading";
import { generateToken } from "@/lib/generate-token";
import { useSession } from "next-auth/react";
import { IError, IMessage, Iuser } from "@/types";
import { toast } from "sonner";
import { axiosClient } from "@/http/axios";
import { io } from "socket.io-client";
import { useAuth } from "@/hooks/use-auth";
import useAudio from "@/hooks/use-audio";

const Page = () => {
  const { setCreating, setLoading, isLoading, loadMessages, setLoadMessages } =
    useLoading();
  const [contacts, setContacts] = useState<Iuser[]>([]);
  const [messages, setMessages] = useState<IMessage[]>([]);
  const { data: session } = useSession();
  const router = useRouter();
  const { currentContact } = useCurrentContact();
  const socket = useRef<ReturnType<typeof io>>(null);
  const { setOnlineUsers } = useAuth();
  const {playSound} = useAudio()

  const contactForm = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: "",
    },
  });
  const messageForm = useForm<z.infer<typeof messageSchema>>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      text: "",
      image: "",
    },
  });

  const getContacts = async () => {
    setLoading(true);
    const token = await generateToken(session?.currentUser?._id);
    try {
      const { data } = await axiosClient.get<{ contacts: Iuser[] }>(
        "/user/contacts",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setContacts(data.contacts);
    } catch (err) {
      toast.error("Cannot fetch contacts");
    } finally {
      setLoading(false);
    }
  };

  const getMessages = async () => {
    setLoadMessages(true);
    const token = await generateToken(session?.currentUser?._id);
    try {
      const { data } = await axiosClient.get<{ messages: IMessage[] }>(
        `/user/messages/${currentContact?._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      setMessages(data.messages);
    } catch {
      toast.error("Cannot fetch messages");
    } finally {
      setLoadMessages(false);
    }
  };
  const onCreateContact = async (values: z.infer<typeof emailSchema>) => {
    setCreating(true);
    const token = await generateToken(session?.currentUser?._id);
    try {
      const { data } = await axiosClient.post<{ contact: Iuser }>(
        "/user/contacts",
        values,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      console.log(token);
      setContacts((prev) => [...prev, data.contact]);
      socket.current?.emit("createContact", {
        currentUser: session?.currentUser,
        receiver: data.contact,
      });
      toast.success("Contact added successfully");
    } catch (error: any) {
      if ((error as IError).response?.data?.message) {
        return toast.error((error as IError).response.data.message);
      }
      return toast.error("Something went wrong");
    } finally {
      setCreating(false);
    }
  };
  const onSendMessage = async (values: z.infer<typeof messageSchema>) => {
    setCreating(true);
    const token = await generateToken(session?.currentUser?._id);
    try {
      const { data } = await axiosClient.post<GetSocketType>(
        "/user/message",
        {
          ...values,
          receiver: currentContact?._id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      setMessages((prev) => [...prev, data.newMessage]);
      messageForm.reset();
      socket.current?.emit("sendMessage", {
        newMessage: data.newMessage,
        receiver: data.receiver,
        sender: data.sender,
      });
    } catch {
      toast.error("Cannot send message");
    } finally {
      setCreating(false);
    }
  };

  useEffect(() => {
    router.replace("/");
    socket.current = io("ws://localhost:5000");
  }, []);
  useEffect(() => {
    if (session?.currentUser) {
      socket.current?.on("getCreatedUser", (user) => {
        setContacts((prev) => {
          const isExist = prev.some((u) => u._id == user._id);
          return isExist ? prev : [...prev, user];
        });
      });
      socket.current?.on(
        "getNewMessage",
        ({ newMessage, receiver, sender }: GetSocketType) => {
          setMessages((prev) => {
            const isExist = prev.some((item) => item._id == newMessage._id);
            return isExist ? prev : [...prev, newMessage];
          });
          toast.info(`${sender.email.split("@")[0]} sent you a message`)
          if(!receiver.muted) {
            playSound(receiver.notificationSound)
          }
        },
      );
    }
  }, [session?.currentUser, socket]);
  useEffect(() => {
    if (session?.currentUser?._id) {
      socket.current?.emit("addOnlineUser", session?.currentUser);
      socket.current?.on(
        "getOnlineUsers",
        (data: { user: Iuser; socket: string }[]) => {
          setOnlineUsers(data.map((item) => item.user));
        },
      );
      getContacts();
    }
  }, [session?.currentUser]);

  useEffect(() => {
    if (currentContact?._id) {
      getMessages();
    }
  }, [currentContact]);
  return (
    <>
      <div className="w-80 h-screen border-r fixed inset-0 z-50">
        {isLoading && (
          <div className="w-full h-[95vh] flex justify-center items-center">
            <Loader2 size={50} className="animate-spin" />
          </div>
        )}
        {!isLoading && <ContactList contacts={contacts} />}
      </div>
      <div className="pl-80 w-full">
        {/* Add Contact */}
        {!currentContact?._id && (
          <AddContact
            contactForm={contactForm}
            onCreateContact={onCreateContact}
          />
        )}
        {/* current contact */}
        {currentContact?._id && (
          <div className="w-full relative">
            <TopChat />
            <Chat
              messageForm={messageForm}
              onSendMessage={onSendMessage}
              messages={messages}
            />
          </div>
        )}
      </div>
    </>
  );
};

export default Page;

interface GetSocketType {
  receiver: Iuser;
  sender: Iuser;
  newMessage: IMessage;
}
