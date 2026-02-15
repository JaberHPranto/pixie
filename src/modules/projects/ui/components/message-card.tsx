import { MarkdownRenderer } from "@/components/markdown-renderer";
import { Card } from "@/components/ui/card";
import { Fragment, MessageRole, MessageType } from "@/generated/prisma";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { AlertCircle, ChevronRightIcon, Code2Icon } from "lucide-react";
import Image from "next/image";

interface Props {
  content: string;
  role: MessageRole;
  type: MessageType;
  fragment: Fragment | null;
  createdAt: Date;
  isActiveFragment: boolean;
  onFragmentClick: () => void;
}

export const MessageCard = ({
  content,
  role,
  type,
  fragment,
  createdAt,
  isActiveFragment,
  onFragmentClick,
}: Props) => {
  const renderUserMessage = () => {
    let displayContent = content;
    let selectedElement: { tag: string; text?: string } | null = null;

    try {
      const parsed = JSON.parse(content);
      if (parsed.designSystem || parsed.constraints) {
        displayContent = parsed.prompt ?? content;
      }
    } catch {}

    const visualEditMatch = displayContent.match(
      /^\[Visual Edit — Selected <(.+?)>(?: with text "(.+?)")?\s*\(selector:.+?\)\]\s*/,
    );
    if (visualEditMatch) {
      selectedElement = {
        tag: visualEditMatch[1],
        text: visualEditMatch[2],
      };
      displayContent = displayContent.replace(visualEditMatch[0], "");
    }

    return (
      <div className="flex justify-end pb-4 pr-2 pl-10">
        <div className="flex flex-col items-end gap-2 max-w-[80%]">
          {selectedElement && (
            <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-emerald-500/10 border border-emerald-500/30">
              <span className="bg-emerald-600 text-white text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded">
                {selectedElement.tag}
              </span>
              {selectedElement.text && (
                <span className="text-xs text-muted-foreground">
                  {selectedElement.text.length > 40
                    ? selectedElement.text.substring(0, 40) + "…"
                    : selectedElement.text}
                </span>
              )}
              <span className="text-[10px] text-emerald-600 font-medium">
                Selected element
              </span>
            </div>
          )}
          <Card className="rounded-lg bg-muted p-3 shadow-none border-none break-words">
            <MarkdownRenderer content={displayContent} />
          </Card>
        </div>
      </div>
    );
  };

  const renderAssistantMessage = () => {
    return (
      <div
        className={cn("flex flex-col group px-2 pb-4", {
          "text-red-700 dark:text-red-500/90": type === "ERROR",
        })}
      >
        <div className="flex items-center gap-2 pl-2">
          <Image
            src="/pixie-logo.png"
            alt="logo"
            width={0}
            height={0}
            sizes="100vw"
            className="h-12 w-auto -ml-1 shrink-0"
          />
          <span className="text-xs text-mutated-foreground -ml-2 mt-1 opacity-0 transition-opacity group-hover:opacity-100">
            {format(createdAt, "HH:mm 'on' MMM dd, yyyy")}
          </span>
        </div>

        <div className="pl-8.5 flex flex-col gap-y-4">
          <span className="dark:text-white/75">{content}</span>

          {fragment && (
            <button
              className={cn(
                "flex items-start text-start gap-2 border rounded-lg bg-muted w-fit p-3 hover:bg-accent transition-colors",
                isActiveFragment &&
                  "bg-primary text-primary-foreground border-primary hover:bg-primary",
              )}
              onClick={onFragmentClick}
            >
              <Code2Icon className="size-4 mt-0.5" />
              <div className="flex flex-col flex-1">
                <span className="text-sm font-medium line-clamp-1">
                  {fragment.title}
                </span>
                <span className="text-sm">Preview</span>
              </div>
              <div className="flex items-center gap-2 justify-center mt-0.5">
                <ChevronRightIcon className="size-3.5 mt-0.25" />
              </div>
            </button>
          )}
        </div>
      </div>
    );
  };

  if (role === "ASSISTANT") return renderAssistantMessage();

  return <div>{renderUserMessage()}</div>;
};
