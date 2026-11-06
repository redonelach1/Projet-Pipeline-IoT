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
      <body className="min-h-screen bg-scada-bg text-scada-text antialiased selection:bg-scada-neon selection:text-scada-pill-text">
        {children}
      </body>
    </html>
  );
}
