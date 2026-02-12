"use client";

import { Button } from "@/components/ui/button";
import { UserControl } from "@/components/user-control";
import { useScroll } from "@/hooks/use-scroll";
import { cn } from "@/lib/utils";
import { SignedIn, SignedOut, SignInButton, SignUpButton } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";

export const Navbar = () => {
  const isScrolled = useScroll();
  return (
    <nav
      className={cn(
        "p-4 bg-transparent fixed top-0 inset-x-0 z-50 transition-all duration-200 border-b",
        isScrolled
          ? "backdrop-blur-sm bg-background/75 border-border/75"
          : "border-transparent",
      )}
    >
      <div className="max-w-5xl mx-auto w-full flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src={"/pixie-icon-logo.png"}
            alt="logo"
            width={0}
            height={0}
            sizes="100vw"
            className="h-10 w-auto shrink-0"
            priority={true}
          />
          <span className="text-2xl font-semibold">Pixie</span>
        </Link>
        <SignedOut>
          <div className="flex items-center gap-2">
            <SignUpButton>
              <Button variant={"outline"} size={"sm"} className="px-4">
                Sign Up
              </Button>
            </SignUpButton>
            <SignInButton>
              <Button size={"sm"} className="px-4">
                Sign In
              </Button>
            </SignInButton>
          </div>
        </SignedOut>
        <SignedIn>
          <UserControl showName />
        </SignedIn>
      </div>
    </nav>
  );
};
