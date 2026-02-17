import type { Metadata } from "next";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { Questrial, Michroma } from "next/font/google";
import { ReduxProvider } from "@/store/Provider";
import ToasterProvider from "@/providers/ToasterProvider";
import "./globals.css";

// body font
const questrial = Questrial({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  variable: "--font-sans",
});

// heading font
const michroma = Michroma({
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
  variable: "--font-heading",
});

// meta data of the page
export const metadata: Metadata = {
  title: "MediCare | Professional Medication Manager",
  description:
    "Advanced medication tracking and caregiver monitoring system designed for clinical precision and patient comfort.",
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
};

const RootLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <html
      lang="en"
      className={`${questrial.variable} ${michroma.variable}`}
      suppressHydrationWarning
    >
      <body className="antialiased">
        {/* redux wrap */}
        <ReduxProvider>
          {/* theme wrap */}
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            {/* common react toast comp */}
            <ToasterProvider />
            {children}
          </ThemeProvider>
        </ReduxProvider>
      </body>
    </html>
  );
};

export default RootLayout;
