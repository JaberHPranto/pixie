import { ProjectForm } from "@/modules/home/ui/project-form";
import { ProjectList } from "@/modules/home/ui/project-list";
import Image from "next/image";
import React from "react";

const Home = () => {
  return (
    <div className="flex flex-col max-w-5xl mx-auto w-full relative isolate p-10">
      <section className="space-y-6  relative">
        <div className="space-y-4 pt-48">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -z-10 w-[600px] h-[400px] bg-primary/20 blur-[120px] rounded-full opacity-50 dark:opacity-30 pointer-events-none" />

          <div className="relative isolate">
            <h1 className="text-2xl md:text-5xl font-bold text-center">
              Built something with Pixie
            </h1>
            <Image
              src={"/pixie-icon-logo.png"}
              alt="pixie logo"
              width={52}
              height={52}
              className="absolute -top-10 right-36 z-10"
            />
          </div>
          <p className="text-lg md:text-xl  text-muted-foreground text-center relative z-10">
            Pixie turn your ideas into real working websites by chatting AI
          </p>
        </div>

        <div className="max-w-3xl mx-auto w-full mt-12 relative z-10">
          <ProjectForm />
        </div>

        <div className="relative z-10 w-full overflow-hidden">
          <ProjectList />
        </div>
      </section>
    </div>
  );
};

export default Home;
