import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";

export const metadata: Metadata = {
  title: "Vijaya Industries | Precision Automobile Clips",
  description: "High-quality, durable fastening solutions trusted by workshops and distributors across India.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="font-sans min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
