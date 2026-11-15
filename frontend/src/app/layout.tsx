import type { Metadata } from "next";
import "./globals.css";
import { AppProviders } from "../components/providers/AppProviders";

export const metadata: Metadata = {
  title: "CareCircle | Elderly Care & Medication Management Platform",
  description: "Shared healthcare ecosystem connecting seniors, families, and caretakers with secure passcode access.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased font-sans">
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 font-sans">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
