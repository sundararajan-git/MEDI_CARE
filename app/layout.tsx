import type { Metadata } from "next";
import { ThemeProvider } from "@/components/shadcn/theme-provider";
import { Questrial, Michroma } from "next/font/google";
import "./globals.css";
import { ReduxProvider } from "@/store/Provider";
import ToasterProvider from "@/components/app/provider/ToasterProvider";

const questrial = Questrial({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  variable: "--font-sans",
});

const michroma = Michroma({
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
  variable: "--font-heading",
});

export const metadata: Metadata = {
  title: "MediCare",
  description: "Healthcare Made Simple",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${questrial.variable} ${michroma.variable}`}
      suppressHydrationWarning
    >
      <body className={`antialiased`}>
        <ReduxProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <ToasterProvider />
            {children}
          </ThemeProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
