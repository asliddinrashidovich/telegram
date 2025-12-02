import MessageCard from "@/components/cards/message-card"
import ChatLoading from "@/components/loaders/chat-loading"

function Chat() {
  return (
    <div className="flex flex-col justify-end z-40 min-h-[92vh]">
        {/* Loading */}
        {/* <ChatLoading/> */}
        {/* Messages */}
        <MessageCard isReceived/>
        {/* chat */}
    </div>
  )
}

export default Chat