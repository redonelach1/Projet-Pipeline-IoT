import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ENSAM IIoT SCADA Operations Center",
  description: "End-to-End Industrial IoT Pipeline & Operations Center — ENSAM Rabat Industrie 4.0",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-industrial-dark text-gray-100 antialiased selection:bg-industrial-cyan selection:text-black">
        {children}
      </body>
    </html>
  );
}

