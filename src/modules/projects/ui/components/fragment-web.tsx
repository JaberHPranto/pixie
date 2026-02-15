import { Hint } from "@/components/hint";
import { Button } from "@/components/ui/button";
import { Fragment } from "@/generated/prisma";
import { cn } from "@/lib/utils";
import { SelectedElement } from "@/types/element-picker";
import {
  ExternalLinkIcon,
  MousePointerClickIcon,
  RefreshCcwIcon,
} from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";

interface Props {
  data: Fragment;
  isEditMode: boolean;
  onToggleEditMode: () => void;
  onElementSelected: (element: SelectedElement) => void;
}

export const FragmentWeb = ({
  data,
  isEditMode,
  onToggleEditMode,
  onElementSelected,
}: Props) => {
  const [copied, setCopied] = useState(false);
  const [fragmentKey, setFragmentKey] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const onRefresh = () => {
    setFragmentKey((prev) => prev + 1);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(data.sandboxUrl);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 1000);
  };

  // Send postMessage to iframe to toggle picker
  const sendPickerMessage = useCallback((enable: boolean) => {
    const iframe = iframeRef.current;
    if (!iframe?.contentWindow) return;
    iframe.contentWindow.postMessage(
      { type: enable ? "pixie-enable-picker" : "pixie-disable-picker" },
      "*",
    );
  }, []);

  // Listen for messages from the iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (!event.data?.type) return;

      if (event.data.type === "pixie-element-selected") {
        onElementSelected(event.data.data as SelectedElement);
      }

      if (event.data.type === "pixie-picker-ready" && isEditMode) {
        sendPickerMessage(true);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [isEditMode, onElementSelected, sendPickerMessage]);

  // Toggle picker when edit mode changes (for already-loaded iframe)
  useEffect(() => {
    sendPickerMessage(isEditMode);
  }, [isEditMode, sendPickerMessage]);

  return (
    <div className="flex flex-col w-full h-full">
      <div className="p-2 border-b bg-sidebar flex items-center gap-x-2">
        <Hint text="Refresh" side="bottom">
          <Button size={"sm"} variant={"outline"} onClick={onRefresh}>
            <RefreshCcwIcon />
          </Button>
        </Hint>
        <Hint text="Click to copy" side="bottom">
          <Button
            size={"sm"}
            variant={"outline"}
            onClick={handleCopy}
            disabled={false}
            className="flex-1 justify-start text-start font-normal"
          >
            <span className="truncate">{data.sandboxUrl}</span>
          </Button>
        </Hint>
        <Hint text="Open in a new tab" align="start" side="bottom">
          <Button
            size={"sm"}
            disabled={!data.sandboxUrl || copied}
            variant={"outline"}
            onClick={() => {
              if (!data.sandboxUrl) return;
              window.open(data.sandboxUrl, "_blank");
            }}
          >
            <ExternalLinkIcon />
          </Button>
        </Hint>

        <div className="w-px h-5 bg-border" />

        <Hint
          text={
            isEditMode ? "Exit visual edit mode" : "Select elements to edit"
          }
          side="bottom"
        >
          <Button
            size={"sm"}
            variant={isEditMode ? "default" : "outline"}
            onClick={onToggleEditMode}
            className={cn(
              "gap-1.5",
              isEditMode &&
                "bg-blue-600 hover:bg-blue-700 text-white border-blue-600",
            )}
          >
            <MousePointerClickIcon className="size-3.5" />
            <span className="text-xs">
              {isEditMode ? "Editing" : "Visual edits"}
            </span>
          </Button>
        </Hint>
      </div>
      <div className="relative flex-1">
        <iframe
          ref={iframeRef}
          key={fragmentKey}
          title="sandbox"
          aria-label="sandbox"
          className="w-full h-full"
          sandbox="allow-scripts allow-same-origin allow-forms"
          loading="lazy"
          src={data.sandboxUrl}
        />
        {isEditMode && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10">
            <div className="bg-blue-600/90 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5">
              <MousePointerClickIcon className="size-3" />
              Click on any element to select it for editing
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
