
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "./icomoon/style.css";
import { ThemeProvider } from "./ThemeContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "IntelliDash -  AI-Powered Data Analytics Dashboard",
  description: "IntelliDash is an AI-powered data analytics dashboard that transforms raw data into actionable insights with ease. Import your data and let our intelligent algorithms analyze and visualize the information for you.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
