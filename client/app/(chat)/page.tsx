"use client";

import { Loader2 } from "lucide-react";
import ContactList from "./_components/contact-list";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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
import { IError, Iuser } from "@/types";
import { toast } from "sonner";
import { axiosClient } from "@/http/axios";

const Page = () => {
  const { setCreating, setLoading, isLoading } = useLoading();
  const [contacts, setContacts] = useState<Iuser[]>([]);
  const { data: session } = useSession();
  const router = useRouter();
  const { currentContact } = useCurrentContact();

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
  const onSendMessage = (values: z.infer<typeof messageSchema>) => {
    console.log(values);
  };

  useEffect(() => {
    router.replace("/");
  }, []);
  useEffect(() => {
    if (session?.currentUser?._id) {
      getContacts();
    }
  }, [session?.currentUser]);
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
            <Chat messageForm={messageForm} onSendMessage={onSendMessage} />
          </div>
        )}
      </div>
    </>
  );
};

export default Page;
