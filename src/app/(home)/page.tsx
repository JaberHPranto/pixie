import { ProjectForm } from "@/modules/home/ui/project-form";
import { ProjectList } from "@/modules/home/ui/project-list";
import Image from "next/image";
import React from "react";

const Home = () => {
  return (
    <div className="flex flex-col max-w-5xl mx-auto w-full">
      <section className="space-y-6 py-[16vh] 2xl:py-48">
        <div className="flex flex-col items-center ">
          <Image
            src={"/pixie-logo.png"}
            alt="logo"
            width={0}
            height={0}
            sizes="100vw"
            className="h-32 w-auto shrink-0 hidden md:block"
          />
        </div>

        <div className="space-y-4 -mt-6">
          <h1 className="text-2xl md:text-5xl font-bold text-center">
            Built something with Pixie
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground text-center">
            Create apps and websites by chatting with AI
          </p>
        </div>

        <div className="max-w-3xl mx-auto w-full mt-12">
          <ProjectForm />
        </div>

        <ProjectList />
      </section>
    </div>
  );
};

export default Home;
