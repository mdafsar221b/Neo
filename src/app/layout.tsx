import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NeoCore Platform | Memory Intelligence",
  description: "Enterprise memory feed and conversation intelligence explorer for NeoCore Platform API v2.0.0",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased selection:bg-blue-600 selection:text-white">
        {children}
      </body>
    </html>
  );
}
