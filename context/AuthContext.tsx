"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useStore } from "@/app/store";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { getUserByFirebaseId } from "@/lib/utils";
import Image from "next/image";
import Logo from "../public/logo.png";

const AuthWrapper = ({ children }: { children: React.ReactNode }) => {
  const { user, setUser, isAuthenticated, setFirestoreID } = useStore();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        setLoading(true);
        try {
          const data = await getUserByFirebaseId(authUser.uid);
          const userdata = data?.docs[0].data()
          if (userdata) {
            setUser({
              name: userdata?.name,
              id: userdata?.authId,
              fireStoreId: userdata?.$id,
              email: userdata?.email,
              profileUrl: userdata?.profilePicUrl,
              plan: userdata?.plan,
              NoFileUploads: userdata?.NoFileUploads,
              NoFlashcardsGenerated: userdata?.NoFlashcardsGenerated || 0,
              NoExplanationsGenerated: userdata?.NoExplanationsGenerated || 0,
              NoSummariesGenerated: userdata?.NoSummariesGenerated || 0,
              NoQuizzesGenerated: userdata?.NoQuizzesGenerated || 0,
              createdAt: "",
            });
            setFirestoreID(data!.docs[0].id)

            if(!pathname.startsWith('/dashboard')){
              router.push('/dashboard')
            }
          
          }

          
        } catch (error) {
          console.error("Error fetching user data:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    });
    
    return () => unsubscribe(); // Cleanup listener on unmount
  }, []);

  // Handle redirect if user is not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated && !user) {
      router.push("/auth");
    }

  }, [loading, isAuthenticated,user]);

  if (loading) {
    return (
      <div className="w-full h-screen flex flex-col justify-center items-center bg-white dark:bg-gray-900">
        <Image src={Logo} alt="Logo" className="text-3xl animate-bounce" />
        <h1 className="text-3xl font-bold animate-pulse text-gray-900 dark:text-gray-100">
          Loading...
        </h1>
      </div>
    );
  }
  if(isAuthenticated && user){
    return <>{children}</>;
  }

};

export default AuthWrapper;