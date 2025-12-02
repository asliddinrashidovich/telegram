"use client";

import { Loader2 } from "lucide-react";
import ContactList from "./_components/contact-list";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useCurrentContact } from "@/hooks/use-contact";
import AddContact from "./_components/add-contact";
import { useForm } from "react-hook-form";
import z from "zod";
import { emailSchema } from "@/lib/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import TopChat from "./_components/top-chat";
import Chat from "./_components/chat";

const Page = () => {
  const router = useRouter();
  const { currentContact } = useCurrentContact();

  const contactForm = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: "",
    },
  });

  const onCreateContact = (values: z.infer<typeof emailSchema>) => {
    console.log(values);
  };

  useEffect(() => {
    router.replace("/");
  }, []);
  return (
    <>
      <div className="w-80 h-screen border-r fixed inset-0 z-50">
        {/* <div className="w-full h-[95vh] flex justify-center items-center">
          <Loader2 size={50} className='animate-spin'/>
        </div> */}
        <ContactList contacts={contacts} />
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
            <Chat />
          </div>
        )}
      </div>
    </>
  );
};

const contacts = [
  {
    email: "asliddin@gmail.com",
    _id: "1",
    avatar:
      "https://imageio.forbes.com/specials-images/imageserve/645ea1c4fce09061884bd21c/0x0.jpg?format=jpg&crop=2774,2772,x925,y0,safe&height=416&width=416&fit=bounds",
  },
  {
    email: "asliddin@gmail2.com",
    _id: "2",
    avatar: "https://fcb-abj-pre.s3.amazonaws.com/img/jugadors/MESSI.jpg",
  },
  {
    email: "asliddin@gmail3.com",
    _id: "3",
    avatar:
      "https://media.gettyimages.com/id/2211028077/photo/rome-italy-eldor-shomurodov-of-as-roma-celebrates-scoring-his-teams-first-goal-during-the.jpg?s=612x612&w=0&k=20&c=5TMqMsMIbYi-xEA9oHT_fM6jLus9A-avuREcftZ0n-s=",
  },
  {
    email: "asliddin@gmail4.com",
    _id: "4",
    avatar:
      "https://media.gettyimages.com/id/1972611303/photo/al-wakrah-qatar-abbosbek-fayzullaev-of-uzbekistan-celebrates-scoring-their-second-goal-during.jpg?s=612x612&w=0&k=20&c=jwrvWouiX-HKQrM_bfMnEkSL_yS0XG5V2UO9R5Em_As=",
  },
  {
    email: "asliddin@gmail5.com",
    _id: "5",
    avatar:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQHvmQTw2KvOBn_PhOjxFXNvd3mhIvkdXblMzv4stAbnAJe05Z4m2tpqdSaOsMF24l8wxLHmEKQdLCTc3monS9PHmR6_sNFtbISF51zmMQ&s=10",
  },
];

export default Page;
