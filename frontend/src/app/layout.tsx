import type { Metadata } from "next";
import { Schoolbell } from 'next/font/google'
import "./globals.css";

const schoolbell = Schoolbell({
  weight: '400',
})

export const metadata: Metadata = {
  title: "Good Habits",
  description: "In the hope that everyone can build good habits.",
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html className="h-full antialiased">
      <body className={`${schoolbell.className} min-h-screen flex flex-col`}>
        {children}
      </body>
    </html>
  );
}