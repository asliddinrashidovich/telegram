import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme.provider";
import QueryProvider from "@/components/providers/query-provider";
import { Toaster } from "sonner";
import SessionProvider from "@/components/providers/session.provider";

const spaceGretesk = Space_Grotesk({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-spaceGretesk",
});

export const metadata: Metadata = {
  title: "Telegram",
  description: "Telegram clone | created by Asliddin Norboyev",
  icons: {
    icon: "./telegram-blue-logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SessionProvider>
      <QueryProvider>
        <html lang="en" suppressHydrationWarning>
          <body
            className={`${spaceGretesk.variable} font-sans antialiased`}
            suppressHydrationWarning
          >
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <main>{children}</main>
              <Toaster />
            </ThemeProvider>
          </body>
        </html>
      </QueryProvider>
    </SessionProvider>
  );
}
