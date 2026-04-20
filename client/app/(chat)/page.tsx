"use client";

import { Loader2 } from "lucide-react";
import ContactList from "./_components/contact-list";
import { ChangeEvent, useEffect, useRef, useState } from "react";
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
import { toast, Toaster } from "sonner";
import { axiosClient } from "@/http/axios";
import { io } from "socket.io-client";
import { useAuth } from "@/hooks/use-auth";
import useAudio from "@/hooks/use-audio";
import { CONST } from "@/lib/constants";

const Page = () => {
  const [contacts, setContacts] = useState<Iuser[]>([]);
  const [messages, setMessages] = useState<IMessage[]>([]);

  const { setCreating, setLoading, isLoading, setLoadMessages, setTyping } =
    useLoading();
  const { currentContact, editedMessage, setEditedMessage } =
    useCurrentContact();
  const { data: session } = useSession();
  const { setOnlineUsers } = useAuth();
  const { playSound } = useAudio();

  const socket = useRef<ReturnType<typeof io> | null>(null);

  const contactForm = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: "" },
  });

  const messageForm = useForm<z.infer<typeof messageSchema>>({
    resolver: zodResolver(messageSchema),
    defaultValues: { text: "", image: "" },
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
      setContacts(data?.contacts);
    } catch {
      toast.error("Something went wrong");
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
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setMessages(data.messages);
      setContacts((prev) =>
        prev.map((item) =>
          item._id === currentContact?._id
            ? {
                ...item,
                lastMessage: item.lastMessage
                  ? { ...item.lastMessage, status: CONST.READ }
                  : null,
              }
            : item,
        ),
      );
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoadMessages(false);
    }
  };

  useEffect(() => {
    const socketUrl =
      process.env.NEXT_PUBLIC_SOCKET_URL || "ws://localhost:5000";
    socket.current = io(socketUrl);
  }, []);

  useEffect(() => {
    if (session?.currentUser?._id) {
      socket.current?.emit("addOnlineUser", session.currentUser);
      socket.current?.on(
        "getOnlineUsers",
        (data: { socketId: string; user: Iuser }[]) => {
          setOnlineUsers(data.map((item) => item.user));
        },
      );
      getContacts();
    }
  }, [session?.currentUser]);

  useEffect(() => {
    if (session?.currentUser) {
      socket.current?.on("getCreatedUser", (user) => {
        setContacts((prev) => {
          const isExist = prev.some((item) => item._id === user._id);
          return isExist ? prev : [...prev, user];
        });
      });

      socket.current?.on(
        "getNewMessage",
        ({ newMessage, sender, receiver }: GetSocketType) => {
          setTyping({ message: "", sender: null });
          if (currentContact?._id === newMessage.sender._id) {
            setMessages((prev) => [...prev, newMessage]);
          }
          setContacts((prev) => {
            return prev.map((contact) => {
              if (contact._id === sender._id) {
                return {
                  ...contact,
                  lastMessage: {
                    ...newMessage,
                    status:
                      currentContact?._id === sender._id
                        ? CONST.READ
                        : newMessage.status,
                  },
                };
              }
              return contact;
            });
          });
          if (!receiver.muted) {
            playSound(receiver.notificationSound);
          }
        },
      );

      socket.current?.on("getReadMessages", (messages: IMessage[]) => {
        setMessages((prev) => {
          return prev.map((item) => {
            console.log(messages);
            const message = messages.find((msg) => msg._id === item._id);
            return message ? { ...item, status: CONST.READ } : item;
          });
        });
      });

      socket.current?.on(
        "getUpdatedMessage",
        ({ updatedMessage, sender }: GetSocketType) => {
          setTyping({ message: "", sender: null });
          console.log("asdad");
          setMessages((prev) =>
            prev.map((item) =>
              item._id === updatedMessage._id
                ? {
                    ...item,
                    reaction: updatedMessage.reaction,
                    text: updatedMessage.text,
                  }
                : item,
            ),
          );
          setContacts((prev) =>
            prev.map((item) =>
              item._id === sender._id
                ? {
                    ...item,
                    lastMessage:
                      item.lastMessage?._id === updatedMessage._id
                        ? updatedMessage
                        : item.lastMessage,
                  }
                : item,
            ),
          );
        },
      );

      socket.current?.on(
        "getDeletedMessage",
        ({ deletedMessage, sender, filteredMessages }: GetSocketType) => {
          setMessages((prev) =>
            prev.filter((item) => item._id !== deletedMessage._id),
          );
          const lastMessage = filteredMessages.length
            ? filteredMessages[filteredMessages.length - 1]
            : null;
          setContacts((prev) =>
            prev.map((item) =>
              item._id === sender._id
                ? {
                    ...item,
                    lastMessage:
                      item.lastMessage?._id === deletedMessage._id
                        ? lastMessage
                        : item.lastMessage,
                  }
                : item,
            ),
          );
        },
      );

      socket.current?.on("getTyping", ({ message, sender }: GetSocketType) => {
        if (currentContact?._id === sender._id) {
          setTyping({ message, sender });
        }
      });
    }
  }, [session?.currentUser, currentContact?._id]);

  useEffect(() => {
    if (currentContact?._id) {
      getMessages();
    }
  }, [currentContact]);

  const onCreateContact = async (values: z.infer<typeof emailSchema>) => {
    setCreating(true);
    const token = await generateToken(session?.currentUser?._id);
    try {
      const { data } = await axiosClient.post<{ contact: Iuser }>(
        "/user/contact",
        values,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setContacts((prev) => [...prev, data.contact]);
      socket.current?.emit("createContact", {
        currentUser: session?.currentUser,
        receiver: data.contact,
      });
      toast.success("Contact added successfully");
      contactForm.reset();
    } catch (error: any) {
      toast.error("This contact is not on Telegram.");
    } finally {
      setCreating(false);
    }
  };

  const onSubmitMessage = async (values: z.infer<typeof messageSchema>) => {
    setCreating(true);
    if (editedMessage?._id) {
      onEditMessage(editedMessage._id, values.text);
    } else {
      onSendMessage(values);
    }
  };

  const onSendMessage = async (values: z.infer<typeof messageSchema>) => {
    setCreating(true);
    const token = await generateToken(session?.currentUser?._id);
    try {
      const { data } = await axiosClient.post<GetSocketType>(
        "/user/message",
        { ...values, receiver: currentContact?._id },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setMessages((prev) => [...prev, data.newMessage]);
      setContacts((prev) =>
        prev.map((item) =>
          item._id === currentContact?._id
            ? {
                ...item,
                lastMessage: { ...data.newMessage, status: CONST.READ },
              }
            : item,
        ),
      );
      messageForm.reset();
      socket.current?.emit("sendMessage", {
        newMessage: data.newMessage,
        receiver: data.receiver,
        sender: data.sender,
      });
      if (!data.sender.muted) {
        playSound(data.sender.sendingSound);
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setCreating(false);
    }
  };

  const onEditMessage = async (messageId: string, text: string) => {
    const token = await generateToken(session?.currentUser?._id);
    try {
      const { data } = await axiosClient.put<{ updatedMessage: IMessage }>(
        `/user/message/${messageId}`,
        { text },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setMessages((prev) =>
        prev.map((item) =>
          item._id === data.updatedMessage._id
            ? { ...item, text: data.updatedMessage.text }
            : item,
        ),
      );
      socket.current?.emit("updatedMessage", {
        updatedMessage: data.updatedMessage,
        receiver: currentContact,
        sender: session?.currentUser,
      });
      messageForm.reset();
      setContacts((prev) =>
        prev.map((item) =>
          item._id === currentContact?._id
            ? {
                ...item,
                lastMessage:
                  item.lastMessage?._id === messageId
                    ? data.updatedMessage
                    : item.lastMessage,
              }
            : item,
        ),
      );
      setEditedMessage(null);
    } catch {
      toast.error("Something went wrong");
    }
  };

  const onReadMessages = async () => {
    const receivedMessages = messages
      .filter((message) => message.receiver._id === session?.currentUser?._id)
      .filter((message) => message.status !== CONST.READ);

    if (receivedMessages.length === 0) return;
    const token = await generateToken(session?.currentUser?._id);
    try {
      const { data } = await axiosClient.post<{ messages: IMessage[] }>(
        "/user/message-read",
        { messages: receivedMessages },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      socket.current?.emit("readMessages", {
        messages: data.messages,
        receiver: currentContact,
      });
      setMessages((prev) => {
        return prev.map((item) => {
          const message = data.messages.find((msg) => msg._id === item._id);
          return message ? { ...item, status: CONST.READ } : item;
        });
      });
    } catch {
      toast.error("Something went wrong");
    }
  };

  const onReaction = async (reaction: string, messageId: string) => {
    const token = await generateToken(session?.currentUser?._id);
    try {
      const { data } = await axiosClient.post<{ updatedMessage: IMessage }>(
        "/user/reaction",
        { reaction, messageId },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setMessages((prev) =>
        prev.map((item) =>
          item._id === data.updatedMessage?._id
            ? { ...item, reaction: data.updatedMessage.reaction }
            : item,
        ),
      );
      socket.current?.emit("updatedMessage", {
        updatedMessage: data.updatedMessage,
        receiver: currentContact,
        sender: session?.currentUser,
      });
    } catch {
      toast.error("Something went wrong");
    }
  };

  const onDeleteMessage = async (messageId: string) => {
    const token = await generateToken(session?.currentUser?._id);
    try {
      const { data } = await axiosClient.delete<{ deletedMessage: IMessage }>(
        `/user/message/${messageId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const filteredMessages = messages.filter(
        (item) => item._id !== data.deletedMessage._id,
      );
      const lastMessage = filteredMessages.length
        ? filteredMessages[filteredMessages.length - 1]
        : null;
      setMessages(filteredMessages);
      socket.current?.emit("deleteMessage", {
        deletedMessage: data.deletedMessage,
        sender: session?.currentUser,
        receiver: currentContact,
        filteredMessages,
      });
      setContacts((prev) =>
        prev.map((item) =>
          item._id === currentContact?._id
            ? {
                ...item,
                lastMessage:
                  item.lastMessage?._id === messageId
                    ? lastMessage
                    : item.lastMessage,
              }
            : item,
        ),
      );
    } catch {
      toast.error("Something went wrong");
    }
  };

  const onTyping = (e: ChangeEvent<HTMLInputElement>) => {
    socket.current?.emit("typing", {
      receiver: currentContact,
      sender: session?.currentUser,
      message: e.target.value,
    });
  };
  return (
    <>
      <div className="w-80 max-md:w-16 h-screen border-r fixed inset-0 z-50">
        {isLoading && (
          <div className="w-full h-[95vh] flex justify-center items-center">
            <Loader2 size={50} className="animate-spin" />
          </div>
        )}
        {!isLoading && <ContactList contacts={conts} />}
      </div>
      <div className="max-md:pl-16 pl-80 w-full">
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
            <TopChat messages={messages} />
            <Chat
              messageForm={messageForm}
              onSubmitMessage={onSubmitMessage}
              messages={messages}
              onReadMessages={onReadMessages}
              onReaction={onReaction}
              onDeleteMessage={onDeleteMessage}
              onTyping={onTyping}
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
  message: string;
  newMessage: IMessage;
  updatedMessage: IMessage;
  deletedMessage: IMessage;
  filteredMessages: IMessage[];
}

const conts = [
    {
        "_id": "69c5f463222de4f199da55df",
        "email": "asliddinrashidovich7@gmail.com",
        "isVerified": true,
        "muted": false,
        "notificationSound": "notification.mp3",
        "sendingSound": "",
        "contacts": [
            "69c5f548222de4f199da560f"
        ],
        "createdAt": "2026-03-27T03:07:15.829Z",
        "updatedAt": "2026-04-20T08:21:22.820Z",
        "__v": 0,
        "avatar": "https://utfs.io/f/iGbM2qFtbJmWZYYJZI9HMO4zPkY5AvybQf8wliSLFjdDnBoJ",
        "lastMessage": {
            "_id": "69e5e4a701ff3709e295bc7c",
            "sender": {
                "_id": "69c5f463222de4f199da55df",
                "email": "asliddinrashidovich7@gmail.com",
                "isVerified": true,
                "muted": false,
                "notificationSound": "notification.mp3",
                "sendingSound": "",
                "contacts": [
                    "69c5f548222de4f199da560f"
                ],
                "createdAt": "2026-03-27T03:07:15.829Z",
                "updatedAt": "2026-04-20T08:21:22.820Z",
                "__v": 0,
                "avatar": "https://utfs.io/f/iGbM2qFtbJmWZYYJZI9HMO4zPkY5AvybQf8wliSLFjdDnBoJ"
            },
            "receiver": {
                "_id": "69c5f548222de4f199da560f",
                "email": "asliddindev7@gmail.com",
                "isVerified": true,
                "muted": false,
                "notificationSound": "notification.mp3",
                "sendingSound": "sending.mp3",
                "contacts": [
                    "69c5f463222de4f199da55df"
                ],
                "createdAt": "2026-03-27T03:11:04.047Z",
                "updatedAt": "2026-04-20T08:18:56.387Z",
                "__v": 0,
                "avatar": "https://utfs.io/f/iGbM2qFtbJmWfvapyr4wouQYBy1Ve3XHtxdfi4P9JIALFnNr"
            },
            "text": "Resths",
            "image": "",
            "status": "read",
            "createdAt": "2026-04-20T08:32:39.660Z",
            "updatedAt": "2026-04-20T08:46:11.699Z",
            "__v": 0
        }
    }
]
