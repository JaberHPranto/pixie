"use client";

import { generateInngestToken } from "@/app/actions";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { useInngestSubscription } from "@inngest/realtime/hooks";
import {
  Box,
  CheckCircle,
  CheckCircle2,
  ChevronDown,
  Circle,
  FileEdit,
  FileSearch,
  Image as ImageIcon,
  Loader2,
  Settings2,
  Sparkles,
  SquareTerminal,
  XCircle,
} from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

const ShimmerMessages = () => {
  const messages = [
    "Thinking...",
    "Loading...",
    "Generating...",
    "Analyzing your request...",
    "Building your website...",
    "Crafting components...",
    "Optimizing layouts...",
    "Adding final touches...",
    "Almost ready...",
  ];

  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessageIndex((prevIndex) => (prevIndex + 1) % messages.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [messages.length]);

  return (
    <div className="flex items-center gap-2">
      <span className="text-muted-foreground animate-pulse">
        {messages[currentMessageIndex]}
      </span>
    </div>
  );
};

const getEventIcon = (message: string, isError: boolean) => {
  if (isError) {
    return XCircle;
  }

  if (message.includes("Executing command:")) {
    return SquareTerminal;
  }
  if (
    message.includes("Creating/Updating files:") ||
    message.includes("createOrUpdateFiles")
  ) {
    return FileEdit;
  }
  if (message.includes("Reading files:") || message.includes("readFiles")) {
    return FileSearch;
  }
  if (
    message.includes("Searching Unsplash") ||
    message.includes("unsplashImage")
  ) {
    return ImageIcon;
  }
  if (
    message.includes("Generating summary") ||
    message.includes("Generating title")
  ) {
    return Sparkles;
  }
  if (
    message.includes("Initializing sandbox") ||
    message.includes("sandbox environment")
  ) {
    return Box;
  }
  if (
    message.includes("Analyzing previous context") ||
    message.includes("analyzeContext")
  ) {
    return Settings2;
  }
  if (message.includes("completed")) {
    return CheckCircle;
  }

  // Default fallback icon
  return Circle;
};

interface MessageLoadingProps {
  projectId: string;
}
const formatMessage = (message: string, isError = false) => {
  if (isError) {
    return (
      <span className="text-sm font-medium leading-none text-destructive">
        {message}
      </span>
    );
  }

  const commandPattern =
    /^(Executing command:|Searching Unsplash for:|Creating\/Updating files:|Reading files:)\s*([\s\S]+)$/;
  const match = message.match(commandPattern);

  if (match) {
    const [, label, command] = match;
    const lines = command.split('\n').filter(line => line.trim());

    return (
      <div className="flex flex-col gap-1">
        <span className="text-xs text-muted-foreground font-medium">
          {label}
        </span>
        {lines.length === 1 ? (
          <code className="text-xs bg-muted/50 px-2 py-1 rounded font-mono break-all">
            {lines[0]}
          </code>
        ) : (
          <div className="flex flex-col gap-0.5">
            {lines.map((line, idx) => (
              <code key={idx} className="text-xs bg-muted/50 px-2 py-1 rounded font-mono break-all">
                {line}
              </code>
            ))}
          </div>
        )}
      </div>
    );
  }

  return <span className="text-sm font-medium leading-none">{message}</span>;
};

export const MessageLoading = ({ projectId }: MessageLoadingProps) => {
  const [isOpen, setIsOpen] = useState(true);

  const fetchToken = useCallback(async () => {
    return generateInngestToken(projectId);
  }, [projectId]);

  const { data: events = [] } = useInngestSubscription({
    refreshToken: fetchToken,
  });

  const hasEvents = events.length > 0;
  const hasError = events.some((e: any) => e.data?.error === true);
  const lastEvent = events[events.length - 1];
  const isComplete = hasEvents && !hasError && lastEvent?.data?.complete;

  return (
    <div className="flex flex-col group px-2 pb-4 transition-opacity duration-500 ease-out">
      <div className="flex items-center gap-2">
        <Image
          src="/pixie-logo.png"
          alt="logo"
          width={0}
          height={0}
          sizes="100vw"
          className="h-12 w-auto shrink-0"
        />
        {!hasEvents && <ShimmerMessages />}
        {hasEvents && (
          <span className="text-muted-foreground text-sm animate-pulse">
            Generating...
          </span>
        )}
      </div>

      {hasEvents && (
        <div className="pl-8.5 mt-2">
          <Collapsible
            open={isOpen}
            onOpenChange={setIsOpen}
            className="w-full border rounded-lg overflow-hidden bg-card text-card-foreground shadow-sm"
          >
            <CollapsibleTrigger
              className={cn(
                "flex items-center justify-between w-full px-4 py-2 text-sm font-medium hover:bg-muted/50 transition-colors",
                hasError ? "bg-destructive/10" : "bg-muted/20",
              )}
            >
              <span className="flex items-center gap-2">
                {hasError ? (
                  <XCircle className="h-3 w-3 text-destructive" />
                ) : isComplete ? (
                  <CheckCircle2 className="h-3 w-3 text-green-500" />
                ) : (
                  <Loader2 className="h-3 w-3 animate-spin" />
                )}
                {hasError
                  ? "Failed"
                  : isComplete
                    ? "Completed"
                    : "Working on it..."}
              </span>
              <ChevronDown
                className={cn(
                  "h-4 w-4 transition-transform duration-200 text-muted-foreground",
                  isOpen ? "rotate-180" : "",
                )}
              />
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="relative py-4 pl-8 pr-4">
                {/* Timeline vertical line - only between dots */}
                <div className="absolute left-[20px] top-[19px] bottom-[19px] w-px bg-border" />

                {events.map((event: any, index: number) => {
                  const message = event.data?.message ?? "Processing...";
                  const isLatest = index === events.length - 1 && !isComplete;
                  const isError = event.data?.error === true;
                  const EventIcon = getEventIcon(message, isError);

                  return (
                    <div key={index} className="relative pb-6 last:pb-0 ">
                      {/* Timeline icon */}
                      <div
                        className={cn(
                          "absolute left-[-22px] -top-0.5 p-1 rounded-full ring-3 ring-background",
                          isError
                            ? "bg-destructive/10 text-destructive"
                            : isLatest
                              ? "bg-muted text-primary  shadow-lg shadow-primary/50"
                              : "bg-muted text-muted-foreground",
                        )}
                      >
                        <EventIcon
                          className={cn("size-3 text-primary/90", {
                            "animate-pulse": isLatest,
                          })}
                        />
                      </div>

                      {/* Event content */}
                      <div className="flex flex-col gap-1 ml-2">
                        {formatMessage(message, isError)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      )}
    </div>
  );
};
