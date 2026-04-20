import MessageCard from "@/components/cards/message-card";
import ChatLoading from "@/components/loaders/chat-loading";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { messageSchema } from "@/lib/validation";
import { Paperclip, Send, Smile } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import z from "zod";
// import emojies from "@emoji-mart/data";
import { useTheme } from "next-themes";
import { ChangeEvent, useEffect, useRef, useState } from "react";
// import Picker from '@emoji-mart/react'
import { useLoading } from "@/hooks/use-loading";
import { IMessage } from "@/types";
import { useCurrentContact } from "@/hooks/use-contact";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { UploadDropzone } from "@/lib/uploadthing";
import { useSession } from "next-auth/react";

interface Props {
  messageForm: UseFormReturn<z.infer<typeof messageSchema>>;
  onSubmitMessage: (values: z.infer<typeof messageSchema>) => Promise<void>;
  onReaction: (reaction: string, messageId: string) => Promise<void>;
  onDeleteMessage: (messageId: string) => Promise<void>;
  onTyping: (e: ChangeEvent<HTMLInputElement>) => void;
  messages?: IMessage[];
  onReadMessages: () => Promise<void>;
}

function Chat({
  messageForm,
  onSubmitMessage,
  messages,
  onReadMessages,
  onReaction,
  onTyping,
  onDeleteMessage,
}: Props) {
  const { resolvedTheme } = useTheme();
  const { loadMessages } = useLoading();
  const { editedMessage, setEditedMessage, currentContact } =
    useCurrentContact();
  const inputRef = useRef<HTMLInputElement>(null);
  const { data: session } = useSession();
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);

  const filteredMessages = messages.filter(
    (message, index, self) =>
      ((message.sender?._id === session.currentUser?._id &&
        message.receiver?._id === currentContact?._id) ||
        (message.sender?._id === currentContact?._id &&
          message.receiver?._id === session.currentUser?._id)) &&
      index === self.findIndex((m) => m._id === message._id),
  );

  useEffect(() => {
    onReadMessages();
  }, [messages]);

  useEffect(() => {
    if (editedMessage) {
      messageForm.setValue("text", editedMessage?.text);
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [editedMessage]);

  function handleSelectEmoji(emoji: string) {
    const input = inputRef.current;
    if (!input) return;

    const text = messageForm.getValues("text");
    const start = input.selectionStart || 0;
    const end = input.selectionEnd || 0;

    const newText = text.slice(0, start) + emoji + text.slice(end);
    messageForm.setValue("text", newText);

    setTimeout(() => {
      input.setSelectionRange(start + emoji.length, start + emoji.length);
    }, 0);
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col justify-end z-40 min-h-[92vh] w-full relative sidebar-custom-scrollbar overflow-y-scroll">
      {/* Loading */}
      {loadMessages && <ChatLoading />}

      {/* Messages */}
      <div className="mb-15">
        {filteredMessages?.map((message, index) => (
          <MessageCard
            key={index}
            message={message}
            onReaction={onReaction}
            onDeleteMessage={onDeleteMessage}
          />
        ))}
      </div>
      {/* chat */}

      {/* start conversation */}
      {messages?.length === 0 && (
        <div className="w-full h-[88vh] flex items-center justify-center">
          <div
            className="text-[100px] cursor-pointer"
            onClick={() => onSubmitMessage({ text: "👋" })}
          >
            👋
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />

      {/* messages input */}
      <Form {...messageForm}>
        <form
          onSubmit={messageForm.handleSubmit(onSubmitMessage)}
          className="w-full max-md:pl-16 pl-80 fixed right-0 flex bottom-0 "
        >
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button type="button" variant={"secondary"} size={"icon"}>
                <Paperclip />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle />
              </DialogHeader>
              <UploadDropzone
                endpoint={"imageUploader"}
                onClientUploadComplete={(res) => {
                  onSubmitMessage({ text: "", image: res[0].url });
                  setOpen(false);
                }}
                config={{ appendOnPaste: true, mode: "auto" }}
              />
            </DialogContent>
          </Dialog>
          <FormField
            name="text"
            control={messageForm.control}
            render={({ field }) => (
              <FormItem className="w-full">
                <FormControl>
                  <Input
                    className="bg-secondary border-l border-l-muted-foreground border-r border-r-muted-foreground h-9"
                    placeholder="Type a message"
                    value={field.value}
                    onChange={(val) => {
                      field.onChange(val.target.value);
                      onTyping(val);
                      if (val.target.value === "") setEditedMessage(null);
                    }}
                    ref={inputRef}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <Popover>
            <PopoverTrigger asChild>
              <Button type="button" variant={"secondary"} size={"icon"}>
                <Smile />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0 border-none rounded-md absolute right-6 bottom-0 ">
              {/* <Picker data={emojies} theme={resolvedTheme ===  "dark" ? "dark" : "light"} onEmojiSelect={(emoji: {native: string}) => handleSelectEmoji(emoji.native)}/> */}
            </PopoverContent>
          </Popover>
          <Button type="submit" size={"icon"}>
            <Send />
          </Button>
        </form>
      </Form>
    </div>
  );
}

export default Chat;
