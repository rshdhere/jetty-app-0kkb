import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "jetty-app-0kkb",
  description: "make me a flappy bird game using nextjs",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
