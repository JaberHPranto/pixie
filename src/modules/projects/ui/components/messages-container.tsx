import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import React, { useEffect } from "react";
import { MessageCard } from "./message-card";
import { MessageForm } from "./message-form";
import { Fragment } from "@/generated/prisma";
import { MessageLoading } from "./message-loading";
import { SelectedElement } from "@/types/element-picker";

interface Props {
  projectId: string;
  activeFragment: Fragment | null;
  setActiveFragment: React.Dispatch<React.SetStateAction<Fragment | null>>;
  selectedElement: SelectedElement | null;
  onClearElement: () => void;
  isEditMode: boolean;
  onExitEditMode: () => void;
}

export const MessagesContainer = ({
  projectId,
  activeFragment,
  setActiveFragment,
  selectedElement,
  onClearElement,
  isEditMode,
  onExitEditMode,
}: Props) => {
  const trpc = useTRPC();
  const bottomRef = React.useRef<HTMLDivElement>(null);
  const lastAssistantMessageRef = React.useRef<string | null>(null);

  const { data: messages } = useSuspenseQuery(
    trpc.messages.getMany.queryOptions(
      { projectId },
      {
        refetchInterval: 5000,
      },
    ),
  );

  useEffect(() => {
    const lastAssistantMessage = messages?.findLast((message) => {
      return message.role === "ASSISTANT";
    });

    if (
      lastAssistantMessage?.fragment &&
      lastAssistantMessage.id !== lastAssistantMessageRef.current
    ) {
      setActiveFragment(lastAssistantMessage.fragment);
      lastAssistantMessageRef.current = lastAssistantMessage.id;
    }
  }, [messages, setActiveFragment]);

  useEffect(() => {
    if (bottomRef.current?.scrollIntoView) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages.length]);

  const lastMessage = messages?.[messages.length - 1];
  const isLastMessageUser = lastMessage?.role === "USER";

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="pt-2 pr-1">
          {messages.map((message) => (
            <MessageCard
              key={message.id}
              content={message.content}
              role={message.role}
              type={message.type}
              fragment={message.fragment}
              createdAt={message.createdAt}
              isActiveFragment={message.fragment?.id === activeFragment?.id}
              onFragmentClick={() => setActiveFragment(message.fragment)}
            />
          ))}
        </div>

        {isLastMessageUser && <MessageLoading projectId={projectId} />}
        <div ref={bottomRef} />
      </div>

      <div className="relative p-3 pt-1">
        <div className="absolute -top-6 left-0 right-0 h-6 bg-gradient-to-b from-transparent to-background pointer-events-none" />
        <MessageForm
          projectId={projectId}
          selectedElement={selectedElement}
          onClearElement={onClearElement}
          onExitEditMode={onExitEditMode}
          isEditMode={isEditMode}
        />
      </div>
    </div>
  );
};
