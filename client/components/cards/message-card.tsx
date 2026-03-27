import { useCurrentContact } from "@/hooks/use-contact"
import { cn } from "@/lib/utils"
import { IMessage } from "@/types"
import { FC } from "react"

interface Props {
    message? :IMessage
}

const MessageCard: FC<Props> = ({ message}) => {
  const {currentContact} = useCurrentContact()

  return (
    <div className={cn("m-2.5 font-medium text-xs flex", message?.receiver._id == currentContact?._id ? "justify-end" : "justify-start")}>
        <div className={cn("relative rounded-[4px] inline p-2 pl-2.5 pr-12 max-w-full",  message?.receiver._id == currentContact?._id ? "bg-secondary" : "bg-primary")}>
            <p className={`text-sm ${message.receiver._id == currentContact._id ? "text-muted-foreground" : "text-white"}`}>{message?.text}</p>
            <span className="text-xs right-1 bottom-1 absolute opacity-60">✓</span>
        </div>
    </div>
  )
}

export default MessageCard