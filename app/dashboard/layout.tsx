import SideBar from "@/components/SideBar";
import AuthWrapper from "@/context/AuthContext";



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
        <AuthWrapper >
           <div className="w-full flex " >
               <SideBar />
               <div className="w-full pb-16 md:pb-0">
                {children}
               </div>
           </div>
        </AuthWrapper>
 
  );
}
