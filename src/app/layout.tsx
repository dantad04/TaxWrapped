import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Australian Budget Wrapped",
  description:
    "Estimate how Commonwealth tax maps across Australian Government spending.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
