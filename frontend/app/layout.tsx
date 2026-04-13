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
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`h-full antialiased`}
    >
      <body className={`${schoolbell.className} min-h-screen flex flex-col`}>
        {children}
        <footer className="mt-5 mb-7 text-center text-sm text-gray-500 leading-6">
          In the hope that everyone can build good habits. <br />
          © 2025 Sam<br /> <br />
          <a href="/privacy" className="underline ml-1">Privacy</a> - 
          <a href="/terms" className="underline ml-1">Terms of Use</a>
        </footer>
      </body>
    </html>
  );
}
