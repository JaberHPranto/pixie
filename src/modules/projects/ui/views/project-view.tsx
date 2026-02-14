"use client";

import { FileExplorer } from "@/components/file-explorer";
import { Button } from "@/components/ui/button";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserControl } from "@/components/user-control";
import { Fragment } from "@/generated/prisma";
import { useTRPC } from "@/trpc/client";
import { useAuth } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";
import { CodeIcon, CrownIcon, EyeIcon, Loader2 } from "lucide-react";
import Link from "next/link";
import { Suspense, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { FragmentWeb } from "../components/fragment-web";
import { InitialLoadingAnimation } from "../components/initial-loading-animation";
import { MessagesContainer } from "../components/messages-container";
import { ProjectHeader } from "../components/project-header";

interface Props {
  projectId: string;
}

type TabView = "code" | "preview";

export const ProjectView = ({ projectId }: Props) => {
  const [activeFragment, setActiveFragment] = useState<Fragment | null>(null);
  const [tabState, setTabState] = useState<TabView>("preview");

  const trpc = useTRPC();
  const { data: usage } = useQuery(trpc.usage.status.queryOptions());

  const { has, isLoaded } = useAuth();
  const hasProAccess = isLoaded ? has?.({ plan: "pro_user" }) : false;
  const showUpgradeButton = isLoaded && !hasProAccess;

  return (
    <div className="h-screen">
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel
          defaultSize={35}
          minSize={20}
          className="flex flex-col min-h-0"
        >
          <ErrorBoundary
            fallback={
              <div className="text-red-500/80 text-lg text-medium">
                Something went wrong loading the project.
              </div>
            }
          >
            <Suspense
              fallback={
                <div className="flex h-full w-full items-center justify-center gap-2">
                  <Loader2 className="w-6 h-6 text-primary animate-spin" />
                  <p className="animate-pulse text-sm">Loading messages...</p>
                </div>
              }
            >
              <ProjectHeader projectId={projectId} />
              <MessagesContainer
                projectId={projectId}
                activeFragment={activeFragment}
                setActiveFragment={setActiveFragment}
              />
            </Suspense>
          </ErrorBoundary>
        </ResizablePanel>
        <ResizableHandle className="hover:bg-primary transition-colors" />

        <ResizablePanel defaultSize={65} minSize={50}>
          <Tabs
            className="h-full gap-y-0"
            defaultValue="preview"
            value={tabState}
            onValueChange={(value) => setTabState(value as TabView)}
          >
            <div className="w-full flex items-center p-2 border-b gap-x-2">
              <TabsList className="h-8 p-0 border rounded-md">
                <TabsTrigger value="preview" className="rounded-md">
                  <EyeIcon />
                  <span>Demo</span>
                </TabsTrigger>
                <TabsTrigger value="code" className="rounded-md">
                  <CodeIcon />
                  <span>Code</span>
                </TabsTrigger>
              </TabsList>
              <div className="ml-auto flex items-center gap-x-2">
                {isLoaded && (
                  <div className="flex items-center gap-1 border rounded-lg py-[5px] px-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className=" text-yellow-500/90"
                    >
                      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                      <path d="M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
                      <path d="M14.8 9a2 2 0 0 0 -1.8 -1h-2a2 2 0 1 0 0 4h2a2 2 0 1 1 0 4h-2a2 2 0 0 1 -1.8 -1" />
                      <path d="M12 7v10" />
                    </svg>
                    <span className="text-xs">
                      {usage?.remainingPoints || 0} credits
                    </span>
                  </div>
                )}
                {showUpgradeButton && (
                  <Button asChild size={"sm"} variant={"tertiary"}>
                    <Link href={"/pricing"}>
                      <CrownIcon />
                      Upgrade
                    </Link>
                  </Button>
                )}
                <UserControl />
              </div>
            </div>
            <TabsContent value="preview">
              {activeFragment ? (
                <FragmentWeb data={activeFragment} />
              ) : (
                <InitialLoadingAnimation />
              )}
            </TabsContent>

            <TabsContent value="code" className="min-h-0">
              {activeFragment?.files ? (
                <FileExplorer
                  files={activeFragment.files as { [key: string]: string }}
                />
              ) : (
                <InitialLoadingAnimation />
              )}
            </TabsContent>
          </Tabs>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};
