import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/layout/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ScholarTrack - Scholarship Management System",
  description: "Automated and secure scholarship management platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body suppressHydrationWarning className={`${inter.className} bg-[#0f0c29] min-h-screen flex flex-col`}>
        <AuthProvider>
          <Navbar />
          <main className="flex-grow w-full">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
