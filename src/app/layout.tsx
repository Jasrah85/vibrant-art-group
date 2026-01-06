import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vibrant Art Group",
  description: "Family artist collective and commissions.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
