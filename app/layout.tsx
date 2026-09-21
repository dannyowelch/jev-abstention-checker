import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Jev Abstention Checker",
  description: "Check abstention behavior: forced Choice vs Choice+IDK vs Noul sufficiency gate",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-gray-50">{children}</body>
    </html>
  );
}
