"use client";

import { Loader2 } from "lucide-react";
import ContactList from "./_components/contact-list";
import { useRouter, useSearchParams } from "next/navigation";
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
import { toast } from "sonner";
import { axiosClient } from "@/http/axios";
import { io } from "socket.io-client";
import { useAuth } from "@/hooks/use-auth";
import useAudio from "@/hooks/use-audio";
import { CONST } from "@/lib/constants";

const Page = () => {
  const {
    setCreating,
    setLoading,
    isLoading,
    loadMessages,
    setTyping,
    setLoadMessages,
  } = useLoading();
  const [contacts, setContacts] = useState<Iuser[]>([]);
  const [messages, setMessages] = useState<IMessage[]>([]);
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { currentContact, setEditedMessage, editedMessage } =
    useCurrentContact();
  const socket = useRef<ReturnType<typeof io>>(null);
  const { setOnlineUsers } = useAuth();
  const { playSound } = useAudio();
  const CONTACT_ID = searchParams.get("chat");

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
      setContacts((prev) =>
        prev.map((item) =>
          item._id == currentContact?._id
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
      setContacts((prev) =>
        prev.map((item) =>
          item._id == currentContact?._id
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
    } catch {
      toast.error("Cannot send message");
    } finally {
      setCreating(false);
    }
  };

  const onReadMessages = async () => {
    const receivedMessages = messages
      .filter((message) => message.receiver._id == session.currentUser._id)
      .filter((message) => message.status !== CONST.READ);

    if (receivedMessages.length == 0) return;

    const token = await generateToken(session?.currentUser?._id);

    try {
      const { data } = await axiosClient.post<{ messages: IMessage[] }>(
        "/user/message-read",
        {
          messages: receivedMessages,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      socket.current?.emit("readMessage", {
        receiver: currentContact,
        messages: data.messages,
      });
      setMessages((prev) => {
        return prev.map((item) => {
          const message = data.messages?.find((m) => m._id == item._id);
          return message ? { ...item, status: CONST.READ } : item;
        });
      });
    } catch {
      toast.error("Cannot read messages");
    }
  };

  const onReaction = async (reaction: string, messageId: string) => {
    const token = await generateToken(session.currentUser._id);
    try {
      const { data } = await axiosClient.post<{ updatedMessage: IMessage }>(
        "/user/reaction",
        { reaction, messageId },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setMessages((prev) =>
        prev.map((item) =>
          item._id === data.updatedMessage._id
            ? { ...item, reaction: data.updatedMessage.reaction }
            : item,
        ),
      );
      socket.current?.emit("updateMessage", {
        updateMessage: data.updatedMessage,
        receiver: currentContact,
        sender: session.currentUser,
      });
    } catch {
      toast.error("Cannot react to message");
    }
  };

  const onDeleteMessage = async (messageId: string) => {
    const token = await generateToken(session.currentUser._id);
    try {
      const { data } = await axiosClient.delete(`/user/message/${messageId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const filteredMessages = messages.filter(
        (item) => item._id !== data.deletedMessage._id,
      );
      const lastMessage = filteredMessages.length
        ? filteredMessages[filteredMessages.length - 1]
        : null;
      setMessages(filteredMessages);
      socket.current.emit("deleteMessage", {
        deletedMessage: data.deletedMessage,
        receiver: currentContact,
        sender: session.currentUser,
        filteredMessages,
      });
      setContacts((prev) =>
        prev.map((item) =>
          item._id === currentContact._id
            ? {
                ...item,
                lastMessage:
                  item.lastMessage._id === messageId
                    ? lastMessage
                    : item.lastMessage,
              }
            : item,
        ),
      );
    } catch (error) {
      toast.error("Cannot delete message");
    }
  };

  const onSubmitMessage = async (values: z.infer<typeof messageSchema>) => {
    setCreating(true);
    if (editedMessage?._id) {
      onEditMessage(editedMessage?._id, values.text);
    } else {
      onSendMessage(values);
    }
  };

  const onEditMessage = async (messageId: string, text: string) => {
    const token = await generateToken(session.currentUser._id);
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
      socket.current?.emit("updateMessage", {
        updateMessage: data.updatedMessage,
        receiver: currentContact,
        sender: session.currentUser,
      });
      messageForm.reset();
      setContacts((prev) =>
        prev.map((item) =>
          item._id === currentContact?._id
            ? {
                ...item,
                lastMessage:
                  item.lastMessage._id === messageId
                    ? data.updatedMessage
                    : item.lastMessage,
              }
            : item,
        ),
      );
      setEditedMessage(null);
    } catch (error) {
      toast.error("Cannot edit message");
    }
  };

  const onTyping = async (e: ChangeEvent<HTMLInputElement>) => {
    socket.current?.emit("typing", {
      receiver: currentContact,
      sender: session?.currentUser,
      message: e.target.value,
    });
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
          setTyping("");
          if(CONTACT_ID === sender._id) {
            setMessages(prev => [...prev, newMessage])
          }
          // setMessages((prev) => {
          //   const isExist = prev.some((item) => item._id == newMessage._id);
          //   if(isExist) return prev
          //   if(CONTACT_ID == sender._id) {
          //     return [...prev, newMessage]
          //   }
          //   return prev
          // });
          setContacts((prev) => {
            return prev.map((contact) => {
              if (contact._id == sender._id) {
                return {
                  ...contact,
                  lastMessage: newMessage,
                  status:
                    CONTACT_ID === sender._id ? CONST.READ : newMessage.status,
                };
              }
              return contact;
            });
          });
          toast.info(`${sender.email.split("@")[0]} sent you a message`);
          if (!receiver.muted) {
            playSound(receiver.notificationSound);
          }
        },
      );

      socket.current?.on("getReadMessage", (messages: IMessage[]) => {
        setMessages((prev) => {
          return prev.map((item) => {
            const message = messages?.find((m) => m._id == item._id);
            return message ? { ...item, status: CONST.READ } : item;
          });
        });
      });

      socket.current?.on(
        "getUpdatedMessage",
        ({ updateMessage, receiver, sender }: GetSocketType) => {
          setTyping("");
          setMessages((prev) => {
            return prev.map((item) =>
              item._id === updateMessage._id
                ? {
                    ...item,
                    reaction: updateMessage.reaction,
                    text: updateMessage.text,
                  }
                : item,
            );
          });
          setContacts((prev) =>
            prev.map((item) =>
              item._id === sender._id
                ? {
                    ...item,
                    lastMessage:
                      item.lastMessage._id === updateMessage._id
                        ? updateMessage
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
          setMessages((prev) => {
            return prev.filter((item) => item._id !== deletedMessage._id);
          });
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
        if (CONTACT_ID === sender._id) {
          setTyping(message);
        }
      });
    }
  }, [session?.currentUser, socket, CONTACT_ID]);
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
            <TopChat messages={messages}/>
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
  updateMessage: IMessage;
  deletedMessage: IMessage;
  filteredMessages: IMessage[];
}
