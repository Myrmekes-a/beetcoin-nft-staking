import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Providers from "./providers";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Staking | BeetCoin",
  description: "Generated by create next app",
  icons: {
    icon: [
      {
        media: "(prefers-color-scheme: light)",
        url: "/icons/favicon.ico",
        href: "/icons/favicon.ico",
      },
      {
        media: "(prefers-color-scheme: dark)",
        url: "/icons/favicon.ico",
        href: "/icons/favicon.ico",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
