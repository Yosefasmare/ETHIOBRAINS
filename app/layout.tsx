import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext";
import { ToastContainer } from "react-toastify";

 



export const metadata: Metadata = {
  title: "EthioBrain - Grow your Knowledge Base",
  description: "Use our platform for Summeriztion, Quiz generation , Flash Card Generation and Much More!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {


  return (
    <html lang="en" className=" ">
      <body  className="bg-gray-100 dark:bg-gray-900">
        <ThemeProvider>
           {children}
        </ThemeProvider>
           <ToastContainer />
      </body>
    </html>
  );
}
