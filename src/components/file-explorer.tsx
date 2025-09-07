import React, { useState } from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Hint } from "./hint";
import { Button } from "./ui/button";
import { CopyIcon } from "lucide-react";
import { CodeView } from "./code-view";

type FileCollection = {
  [path: string]: string;
};

function getLanguageFromExtension(filename: string): string {
  const extension = filename.split(".").pop()?.toLowerCase();
  return extension || "text";
}

interface FileExplorerProps {
  files: FileCollection;
}

export const FileExplorer = ({ files }: FileExplorerProps) => {
  const [selectedFile, setSelectedFile] = useState<string | null>(() => {
    const fileKeys = Object.keys(files);
    return fileKeys.length > 0 ? fileKeys[0] : null;
  });

  return (
    <ResizablePanelGroup direction="horizontal">
      <ResizablePanel
        defaultSize={30}
        minSize={30}
        className="bg-sidebar"
      ></ResizablePanel>
      <ResizableHandle />
      <ResizablePanel defaultSize={70} minSize={50}>
        {selectedFile && files[selectedFile] ? (
          <div className="h-full w-full flex flex-col">
            <div className="border-b bg-sidebar px-4 py-2 flex justify-between items-center gap-x-2">
              {/* TODO: File Breadcrumbs */}
              <Hint text="Copy to clipboard" side="bottom">
                <Button
                  size={"icon"}
                  variant={"outline"}
                  className="ml-auto"
                  onClick={() => {}}
                >
                  <CopyIcon />
                </Button>
              </Hint>
            </div>
            <div className="flex-1 overflow-y-auto">
              <CodeView
                code={files[selectedFile]}
                lang={getLanguageFromExtension(selectedFile)}
              />
            </div>
          </div>
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            Select a file to view it&apos;s content
          </div>
        )}
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};
