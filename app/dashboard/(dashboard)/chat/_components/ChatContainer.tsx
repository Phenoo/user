"use client";

import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  PromptInput,
  PromptInputActionAddAttachments,
  PromptInputActionMenu,
  PromptInputActionMenuContent,
  PromptInputActionMenuTrigger,
  PromptInputAttachment,
  PromptInputAttachments,
  PromptInputBody,
  type PromptInputMessage,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
} from "@/components/ai-elements/prompt-input";
import {
  Message,
  MessageContent,
} from "@/components/ai-elements/message";
import { Response } from "@/components/ai-elements/response";
import { Suggestion, Suggestions } from "@/components/ai-elements/suggestion";
import { Loader } from "@/components/ai-elements/loader";
import { Action, Actions } from "@/components/ai-elements/actions";
import { Fragment, useState } from "react";
import { toast } from "sonner";
import { useChat } from "@ai-sdk/react";
import { CopyIcon, RefreshCcwIcon } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

const suggestions = [
  "Create flashcards for my registered courses",
  "Explain this concept in simple terms",
  "Help me study for my upcoming exam",
  "Create a study schedule for me",
  "Quiz me on key terms",
  "Help me understand this formula",
];

const ChatContainer = () => {
  const [input, setInput] = useState("");

  const user = useQuery(api.users.currentUser);
  const courses =
    useQuery(
      api.courses.getAllCourses,
      user?._id ? { userId: user._id as Id<"users"> } : "skip"
    ) || [];

  const { messages, sendMessage, status } = useChat({
    onError: (error) => {
      toast.error("Failed to send message", {
        description: error.message,
      });
    },
  });

  const handleSubmit = (message: PromptInputMessage) => {
    const hasText = Boolean(message.text?.trim());
    const hasAttachments = Boolean(message.files?.length);

    if (!(hasText || hasAttachments)) {
      return;
    }

    if (message.files?.length) {
      toast.success("Files attached", {
        description: `${message.files.length} file(s) attached to message`,
      });
    }

    const userCourses = courses.map((c) => ({
      name: c.name,
      code: c.code,
      credits: c.credits,
      academicYear: c.academicYear,
      session: c.session,
      instructor: c.instructor,
      description: c.description,
    }));

    sendMessage(
      {
        text: message.text || "Sent with attachments",
        files: message.files,
      },
      {
        body: {
          userId: user?._id?.toString() || "anonymous",
          userCourses,
        },
      }
    );

    setInput("");
  };

  const handleSuggestionClick = (suggestion: string) => {
    const userCourses = courses.map((c) => ({
      name: c.name,
      code: c.code,
      credits: c.credits,
      academicYear: c.academicYear,
      session: c.session,
      instructor: c.instructor,
      description: c.description,
    }));

    sendMessage(
      { text: suggestion },
      {
        body: {
          userId: user?._id?.toString() || "anonymous",
          userCourses,
        },
      }
    );
  };

  return (
    <div className="relative flex size-full flex-col divide-y overflow-hidden">
      <Conversation className="h-full">
        <ConversationContent>
          {messages.map((message, messageIndex) => (
            <div key={message.id}>
              {message.parts.map((part, partIndex) => {
                if (part.type === "text") {
                  return (
                    <Fragment key={`${message.id}-${partIndex}`}>
                      <Message from={message.role}>
                        <MessageContent>
                          <Response>{part.text}</Response>
                        </MessageContent>
                      </Message>
                      {message.role === "assistant" &&
                        messageIndex === messages.length - 1 &&
                        status === "ready" && (
                          <Actions className="mt-2">
                            <Action label="Retry">
                              <RefreshCcwIcon className="size-3" />
                            </Action>
                            <Action
                              onClick={() =>
                                navigator.clipboard.writeText(part.text)
                              }
                              label="Copy"
                            >
                              <CopyIcon className="size-3" />
                            </Action>
                          </Actions>
                        )}
                    </Fragment>
                  );
                }
                return null;
              })}
            </div>
          ))}
          {status === "submitted" && (
            <Message from="assistant">
              <MessageContent>
                <Loader />
              </MessageContent>
            </Message>
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      <div className="bg-background p-4 space-y-4">
        {messages.length === 0 && (
          <Suggestions>
            {suggestions.map((suggestion) => (
              <Suggestion
                key={suggestion}
                onClick={() => handleSuggestionClick(suggestion)}
                suggestion={suggestion}
              />
            ))}
          </Suggestions>
        )}

        <PromptInput onSubmit={handleSubmit}>
          <PromptInputAttachments>
            {(attachment) => <PromptInputAttachment data={attachment} />}
          </PromptInputAttachments>
          <PromptInputBody>
            <PromptInputTextarea
              placeholder="Ask about your courses, create flashcards, solve problems..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
          </PromptInputBody>
          <PromptInputToolbar>
            <PromptInputTools>
              <PromptInputActionAddAttachments />
            </PromptInputTools>
            <PromptInputSubmit />
          </PromptInputToolbar>
        </PromptInput>
      </div>
    </div>
  );
};

export default ChatContainer;
