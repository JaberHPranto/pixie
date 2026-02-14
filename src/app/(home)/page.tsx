import { ProjectForm } from "@/modules/home/ui/project-form";
import { ProjectList } from "@/modules/home/ui/project-list";
import Image from "next/image";
import React from "react";

const Home = () => {
  return (
    <div className="flex flex-col max-w-5xl mx-auto w-full">
      <section className="space-y-6 py-[16vh] 2xl:py-68">
        <div className="space-y-4 -mt-6 ">
          <div className="relative ">
            <h1 className="text-2xl md:text-5xl font-bold text-center">
              Built something with Pixie
            </h1>
            <Image
              src={"/pixie-icon-logo.png"}
              alt="pixie logo"
              width={52}
              height={52}
              className="absolute -top-10 right-46"
            />
          </div>
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
