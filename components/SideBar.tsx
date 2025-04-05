'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { IconType } from 'react-icons';
import { FiHome, FiBook,  FiSettings, FiFrown, FiLogOut } from 'react-icons/fi';
import { AiFillSun } from "react-icons/ai";
import { FaMoon } from "react-icons/fa";
import { RiAtLine, RiFlashlightLine, RiQuestionLine } from 'react-icons/ri';
import { MdOutlineManageAccounts } from "react-icons/md";
import { useTheme } from '@/context/ThemeContext';
import Link from 'next/link';
import { useStore } from '@/app/store';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';

interface SidebarLinkProps {
  icon: IconType;
  label: string;
  path: string | '/dashboard';
  isCollapsed: boolean;
}


const SidebarLink: React.FC<SidebarLinkProps> = ({ icon: Icon, label, isCollapsed,path }) => (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className=" rounded-lg cursor-pointer  hover:bg-white/10 transition-all"
    >
      <Link href={path} className='flex items-center gap-3 p-3'>
      <Icon className="w-5 h-5" />
      {!isCollapsed && <span>{label}</span>}
      </Link>
    </motion.div>
  );

const SideBar = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isDesktop, setIsDesktop] = useState<boolean>(false);
  const {darkMode,setDarkMode} = useTheme()
  const {user, setUser} = useStore()
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  useEffect(() => {
    const checkScreenSize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };

    // Initial check
    checkScreenSize();

    // Add event listener
    window.addEventListener('resize', checkScreenSize);

    // Cleanup
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  return (
    <>
      {/* Mobile Hamburger Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg text-gray-900 bg-gray-100 dark:text-gray-100 dark:bg-gray-800 shadow-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      >
        ☰
      </button>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && !isDesktop && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <motion.aside
        initial={{ x: '-100%' }}
        animate={{ 
          x: isMobileMenuOpen || isDesktop ? '0%' : '-100%',
          width: isSidebarCollapsed ? '80px' : '250px'
        }}
        transition={{ type: "spring", damping: 20 }}
        className="bg-gray-100 backdrop-blur-xl text-gray-900 drop-shadow-2xl fixed z-50 flex flex-col gap-4 dark:text-gray-100 dark:bg-gray-800
          md:h-full md:top-0 md:left-0 md:p-4 md:w-[250px] md:translate-x-0 md:animate-none
          bottom-0 left-0 right-0 h-full p-4 w-[250px]"
      >
        {/* Header - Show on both mobile and desktop */}
        <div className="items-center gap-3 mb-8 flex justify-between">
          <div className="flex  items-center gap-3">
            {!isSidebarCollapsed && <h1 className="text-xl font-bold">EthioBrain</h1>}
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className={`p-2 rounded-lg hover:bg-white/10 ${isSidebarCollapsed ? 'block' : 'hidden'}   md:block`}
            >
              ☰
            </button>
          </div>
          
          {/* Close button for mobile */}
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="md:hidden p-2 rounded-lg hover:bg-white/10 text-gray-600 dark:text-gray-400"
          >
            ✕
          </button>
        </div>
    
        {/* Main Navigation - Same for both mobile and desktop */}
        <div className="flex flex-col w-full">
          <SidebarLink path='/dashboard' icon={FiHome} label="Dashboard" isCollapsed={isSidebarCollapsed} />
          <SidebarLink path='/dashboard/account' icon={MdOutlineManageAccounts} label="Account" isCollapsed={isSidebarCollapsed} />
          
          <div className="px-3 py-2 text-sm text-center text-gray-800 dark:text-gray-50">AI Tools</div>
          <SidebarLink path='/dashboard/summarization' icon={RiAtLine} label="Summarization" isCollapsed={isSidebarCollapsed} />
          <SidebarLink path='/dashboard/flashcards' icon={RiFlashlightLine} label="Flashcards" isCollapsed={isSidebarCollapsed} />
          <SidebarLink path='/dashboard/explanation' icon={FiBook} label="Explanation" isCollapsed={isSidebarCollapsed} />
          <SidebarLink path='/dashboard/quizzes' icon={RiQuestionLine} label="Quiz Generation" isCollapsed={isSidebarCollapsed} />
        </div>
        
        {/* Footer - Show on both mobile and desktop */}
        <div className="mt-auto">
          <motion.button
            whileHover={{ scale: 1.02 }}
            className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-white/10 transition-all"
            onClick={()=>setDarkMode(prev=>!prev)}
          >
            {darkMode ?  <AiFillSun className="w-5 h-5" /> :  <FaMoon className="w-5 h-5" />}
            {!isSidebarCollapsed && <span>{darkMode ? 'Light' : 'Dark'}</span>}
          </motion.button>
          <SidebarLink path='/dashboard/settings' icon={FiSettings} label="Settings" isCollapsed={isSidebarCollapsed} />
          {user?.plan != 'Premium' && (
            <SidebarLink path='/dashboard/plans' icon={FiFrown} label={user?.plan === 'basic' ? 'Upgrade to pro' : 'Upgrade to Premium'} isCollapsed={isSidebarCollapsed} />
          )}
          <motion.button
            whileHover={{ scale: 1.02 }}
            onClick={handleLogout}
            className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-white/10 transition-all text-red-500"
          >
            <FiLogOut className="w-5 h-5" />
            {!isSidebarCollapsed && <span>Logout</span>}
          </motion.button>
        </div>
      </motion.aside>

      {/* Spacer for desktop layout */}
      <div className={`hidden md:block ${isSidebarCollapsed ? 'w-[80px]' : 'w-[250px]'}`} />
    </>
  )
}

export default SideBar