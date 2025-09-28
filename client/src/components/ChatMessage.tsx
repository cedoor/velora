import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { AlertCircle } from "lucide-react"

interface ChatMessageProps {
  message: {
    id: string
    content: string
    role: "user" | "assistant"
    timestamp: Date
    isError?: boolean
  }
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user"
  const isError = message.isError
  
  return (
    <div className={`flex gap-3 p-4 ${isUser ? "bg-muted/50" : ""} ${isError ? "bg-red-50 dark:bg-red-950/20" : ""}`}>
      <Avatar className="h-8 w-8">
        <AvatarFallback className={
          isError 
            ? "bg-red-500 text-white" 
            : isUser 
              ? "bg-blue-500 text-white" 
              : "bg-green-500 text-white"
        }>
          {isError ? <AlertCircle className="h-4 w-4" /> : (isUser ? "U" : "AI")}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm">
            {isUser ? "You" : isError ? "Error" : "Assistant"}
          </span>
          <span className="text-xs text-muted-foreground">
            {message.timestamp.toLocaleTimeString()}
          </span>
        </div>
        <div className={`prose prose-sm max-w-none ${isError ? "text-red-600 dark:text-red-400" : ""}`}>
          <p className="whitespace-pre-wrap">{message.content}</p>
        </div>
      </div>
    </div>
  )
}
