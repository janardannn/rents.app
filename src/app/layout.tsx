import type { Metadata } from "next";
import { Geist, Geist_Mono, Paytone_One, Outfit } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap"
});

const paytone = Paytone_One({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-paytone",
  display: "swap"
});


export const metadata: Metadata = {
  title: "rents.app",
  description: "build by github.com/janardannn",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${outfit.variable} ${paytone.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
