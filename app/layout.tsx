import type { Metadata } from "next";
import "./globals.css";
import localFont from "next/font/local";
import { Poppins } from "next/font/google";
import { QueryClientProviderWrapper } from "@/lib/query-client";

const local = localFont({
  src: "./fonts/Garet-Heavy.otf",
  variable: "--font-garet",
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700"],
});

const mabry = localFont({
  src: [
    {
      path: "./fonts/MabryPro-Regular.woff",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/MabryPro-Medium.woff",
      weight: "500",
      style: "normal",
    },
    {
      path: "./fonts/MabryPro-Bold.woff",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-mabry",
});



export const metadata: Metadata = {
  title: "Kraftigo Admin",
  description: "Internal admin dashboard for Kraftigo"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${local.variable} ${poppins.variable} ${mabry.variable} min-h-screen bg-white text-black antialiased`}>
        <QueryClientProviderWrapper>{children}</QueryClientProviderWrapper>
      </body>
    </html>
  );
}

