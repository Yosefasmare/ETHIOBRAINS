import { ChatProvider } from "@/context/ChatContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
        <ChatProvider >
               <div className="w-full pb-16 md:pb-0">
                {children}
               </div>
        </ChatProvider>
 
  );
}
