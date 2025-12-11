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
import z, { set } from "zod";
import emojies from '@emoji-mart/data'
// import Picker from '@emoji-mart/react'
import { useTheme } from "next-themes";
import { ModeToggle } from "@/components/shared/mode-toggle";
import { useRef } from "react";

interface Props {
  messageForm: UseFormReturn<z.infer<typeof messageSchema>>;
  onSendMessage: (values: z.infer<typeof messageSchema>) => void;
}

function Chat({ messageForm, onSendMessage }: Props) {
  const {resolvedTheme} = useTheme()
  const inputRef = useRef<HTMLInputElement>(null)

  function handleSelectEmoji(emoji: string) {
    const input = inputRef.current;
    if(!input) return;

    const text = messageForm.getValues("text")
    const start = input.selectionStart || 0;
    const end = input.selectionEnd || 0;

    const newText = text.slice(0, start) + emoji + text.slice(end);
    messageForm.setValue("text", newText);

    setTimeout(() => {
      input.setSelectionRange(start + emoji.length, start + emoji.length);
    }, 0)
  }
  return (
    <div className="flex flex-col justify-end z-40 min-h-[92vh]">
      {/* Loading */}
      {/* <ChatLoading/> */}
      {/* Messages */}
      <MessageCard isReceived />
      {/* chat */}

      {/* start conversation */}
      <div className="w-full h-[88vh] flex items-center justify-center">
        <div
          className="text-[100px] cursor-pointer"
          onClick={() => onSendMessage({ text: "👋" })}
        >
          👋
        </div>
      </div>

      {/* messages input */}
      <Form {...messageForm}>
        <form
          onSubmit={messageForm.handleSubmit(onSendMessage)}
          className="w-full flex relative"
        >
          <Button type="button" variant={"secondary"} size={"icon"}>
            <Paperclip />
          </Button>
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
                    onChange={(val) => field.onChange(val.target.value)}
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
