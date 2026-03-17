import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Wanderlust - Travel Planner",
  description: "Plan your trips with ease",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
