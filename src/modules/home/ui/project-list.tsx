"use client";
import { Button } from "@/components/ui/button";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import Image from "next/image";
import Link from "next/link";
import React from "react";

export const ProjectList = () => {
  const trpc = useTRPC();

  const { data: projects } = useQuery(trpc.projects.getMany.queryOptions());

  return (
    <div className="w-full bg-white dark:bg-sidebar rounded-xl p-8 border flex flex-col gap-y-6 sm:gap-y-4 mt-20">
      <h2 className="text-2xl font-semibold">Saved Projects</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {projects?.length === 0 && (
          <div className="col-span-full text-center">
            <p className="text-sm text-muted-foreground">No projects found</p>
          </div>
        )}

        {projects?.map((project) => {
          return (
            <Button
              key={project.id}
              variant={"outline"}
              className="font-normal h-auto justify-start w-full text-start p-4"
              asChild
            >
              <Link href={`/projects/${project.id}`}>
                <div className="flex items-center gap-x-4">
                  <Image
                    className="w-6 h-auto rounded-full"
                    src="/pixie-icon-logo.png"
                    alt="logo"
                    width={0}
                    height={0}
                    sizes="100vw"
                  />

                  <div className="flex flex-col">
                    <h3 className="font-medium truncate">{project.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(project.updatedAt), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </div>
              </Link>
            </Button>
          );
        })}
      </div>
    </div>
  );
};
