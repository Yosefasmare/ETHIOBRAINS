'use client'

import { useRouter } from 'next/navigation';
import React, {  useState } from 'react'
import { motion } from 'framer-motion';
import Image from 'next/image';
import Logo from '../public/logo.png'
import { FcGoogle } from "react-icons/fc";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, provider } from '@/lib/firebase';
import { AddUserToFirestore, getUserByFirebaseId } from '@/lib/utils';

  

const AuthBox = () => {
    const router = useRouter();
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [username,setUserName] = useState('')
    const [loading,setLoading] = useState(false)

   

      
    const handleEmailAuth = () =>{
   

        if(isSignUp ? username === '' || email === '' || password === '' : email === '' || password === ''){
          setError('Please Fill The Required Fields First!')
          return
        }
        setLoading(true)
        try {
          if(isSignUp){
            createUserWithEmailAndPassword(auth,email,password).then((authUser)=>{
              const data = {
                authId: authUser.user!.uid,  
                name: username, 
                email: authUser.user!.email ?? "",
                profilePicUrl: authUser.user?.photoURL ?? "",  
                plan: "basic",
                fileUploads: null,  
                createdAt: new Date(),
                NoFileUploads: 0,
                NoFlashcardsGenerated: 0,
                NoExplanationsGenerated: 0,
                NoSummariesGenerated: 0,
                NoQuizzesGenerated: 0
              };
              
              AddUserToFirestore({userdata: data});
              router.push('/dashboard')
            })
          }else{
            signInWithEmailAndPassword(auth,email,password)
            router.push('/dashboard')
          }
        } catch (error) {
          console.log('Error in Auth',error)
        } finally {
          setLoading(false)
        }
    }

    const signInWithGoogle = () => {

      setLoading(true)
       try {
          signInWithPopup(auth,provider).then(async(authUser)=>{
             const res = await getUserByFirebaseId(authUser.user!.uid)
             if(!res){
              const data = {
                authId: authUser.user!.uid,  
                name: authUser.user.displayName ?? 'Annonymess' , 
                email: authUser.user!.email ?? "",
                profilePicUrl: authUser.user?.photoURL ?? "",  
                plan: "basic",
                fileUploads: null,  
                createdAt: new Date(),
                NoFileUploads: 0,
                NoFlashcardsGenerated: 0,
                NoExplanationsGenerated: 0,
                NoSummariesGenerated: 0,
                NoQuizzesGenerated: 0
              };

              AddUserToFirestore({userdata: data});
            }
            router.push('/dashboard')
          })
       } catch (error) {
        console.log(error)
       } finally{
        setLoading(false)
       }
    }

    if(loading ) {
      return(
       <div className='w-full h-full  flex justify-center items-center' >
             <h1 className='text-gray-900 animate-pulse text-4xl dark:text-gray-100 '>Wait just A Moment!</h1>
       </div>

      )
    }else{
      return (
        <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`w-full max-w-md ${isSignUp ? 'md:h-[95%]' : 'md:h-[90%]'} transition-all ease-in-out  p-8 space-y-8 md:border border-gray-900 dark:border-gray-100   dark:bg-gray-900 rounded-2xl shadow-lg `}
      >
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="mx-auto w-40 h-40   flex items-center justify-center "
          >
           <Image src={Logo} alt='Logo' className='w-full h-full  scale-[2]' />
          </motion.div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome to EthioBrain
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Your AI-powered study companion
          </p>
        </div>
    
        <form onSubmit={(e)=>e.preventDefault()} className="space-y-4">
        {isSignUp && (
              <div>
                 <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                     User Name
                 </label>
               <input
                 type="text"
                 id="username"
                 value={username}
                 onChange={(e) => setUserName(e.target.value)}
                 className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                 required
               />
              </div>
        )}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              required
            />
          </div>
          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}
          <button
            type="submit"
            onClick={handleEmailAuth}
            className="w-full flex items-center cursor-pointer justify-center gap-2 px-4 py-3 bg-teal-500 text-white rounded-xl hover:bg-teal-600 transition-colors"
          >
             
            {isSignUp ? 'Sign Up' : 'Sign In'}
          </button>
        </form>
    
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white dark:bg-gray-900 text-gray-500">Or continue with</span>
          </div>
        </div>
    
        <div className="flex ">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={signInWithGoogle}
            className=" flex items-center cursor-pointer font-bold justify-center gap-2 flex-1 px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-700  dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <FcGoogle className='w-5 h-5'/>
            Google
          </motion.button>
         
        </div>
    
        <div className="text-center">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-md font-bold cursor-pointer text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300"
          >
            {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
          </button>
        </div>
    
        <p className="text-sm text-center text-gray-600 dark:text-gray-400">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </motion.div>
      )
    }

  
}

export default AuthBox
