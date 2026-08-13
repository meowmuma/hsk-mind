import type { Metadata } from "next";
import "./globals.css";
import { QueryProvider } from "../src/components/query-provider";

export const metadata: Metadata = {
  title: "HSK Mind",
  description: "Gamified Chinese vocabulary learning for HSK 1–4",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="th">
      <body>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
