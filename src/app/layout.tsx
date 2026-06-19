import { Toaster } from "@/components/ui/sonner";
import { TRPCReactProvider } from "@/trpc/client";
import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { Fira_Code, Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = Fira_Code({
  variable: "--font-fira-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Pixie - Turn Ideas into Apps",
  description:
    "Pixie is an AI assistant designed to build fully-functional apps in minutes with just your words. No coding necessary.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "oklch(67.23% 0.1607 248.017)",
        },
      }}
    >
      <TRPCReactProvider>
        <html lang="en" suppressHydrationWarning>
          <body
            className={`${outfit.className} ${jetbrainsMono.variable} antialiased`}
            suppressHydrationWarning
          >
            <ThemeProvider
              attribute={"class"}
              defaultTheme="dark"
              enableSystem
              disableTransitionOnChange
            >
              <Toaster richColors />
              {children}
            </ThemeProvider>
          </body>
        </html>
      </TRPCReactProvider>
    </ClerkProvider>
  );
}
