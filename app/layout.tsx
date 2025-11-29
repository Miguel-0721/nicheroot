import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NicheRoot — Smart Business Matching",
  description:
    "NicheRoot analyzes your time, money, strengths, goals, and personality to generate your perfect business blueprint.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`
          ${geistSans.variable} 
          ${geistMono.variable} 
          antialiased 
          bg-[var(--background)] 
          text-[var(--foreground)]
        `}
        suppressHydrationWarning
      >
        {/* Main content wrapper */}
        <main className="min-h-screen w-full">
          {children}
        </main>
      </body>
    </html>
  );
}
