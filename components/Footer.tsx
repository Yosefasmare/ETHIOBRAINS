'use client'


const Footer = () => {
    
    const year = new Date().getFullYear()

  return (
    <footer className="flex justify-center font-bold text-2xl items-center w-full p-4 border-t border-gray-800 dark:border-gray-200 text-gray-900 dark:text-gray-200">
    © {year} EthioBrain. All rights reserved.
   </footer>
  )
}

export default Footer