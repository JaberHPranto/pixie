"use client";
import { PricingTable } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { useTheme } from "next-themes";

const PricingPage = () => {
  const { resolvedTheme: theme } = useTheme();
  return (
    <div className="flex flex-col max-w-4xl mx-auto w-full">
      <section className="space-y-6 pt-[16vh] 2xl:pt-48">
        <h1 className="text-2xl md:text-4xl font-bold text-center">Pricing</h1>

        <p className="text-center text-muted-foreground text-sm md:text-base">
          Choose the plan that best fits your needs.
        </p>
        <PricingTable
          appearance={{
            baseTheme: theme === "dark" ? dark : undefined,
            elements: {
              pricingTableCard: "border! shadow-none! rounded-lg!",
            },
          }}
        />
      </section>
    </div>
  );
};

export default PricingPage;
