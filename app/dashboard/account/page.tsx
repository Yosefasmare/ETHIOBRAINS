'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiUser, FiCreditCard, FiCheckCircle,  FiRefreshCw } from 'react-icons/fi';
import { useStore } from '@/app/store';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Image from 'next/image';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

const AccountPage: React.FC = () => {
  const { user, userFirestoreID } = useStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {

    const fetchUserData = async () => {
      if (!userFirestoreID) return;
  
      try {
        setIsLoading(true);
        const userDocRef = doc(db, "users", userFirestoreID);
        const userDoc = await getDoc(userDocRef);
  
        if (userDoc.exists()) {
         setIsLoading(false)
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast.error('Failed to load user data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [userFirestoreID]);

 

  const getPlanFeatures = () => {
    switch (user?.plan) {
      case 'premium':
        return [
          'Unlimited explanations',
          'Unlimited flashcards',
          'Unlimited quizzes',
          'Priority support',
          'Advanced AI features'
        ];
      case 'pro':
        return [
          '50 explanations per month',
          '100 flashcards per month',
          '50 quizzes per month',
          'Standard support',
          'Basic AI features'
        ];
      default:
        return [
          '10 explanations per month',
          '20 flashcards per month',
          '10 quizzes per month',
          'Community support',
          'Basic features'
        ];
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto space-y-8"
      >
        {/* Profile Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-gray-700"
        >
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 flex items-center justify-center overflow-hidden ring-4 ring-blue-100 dark:ring-blue-900/30">
                {user?.profileUrl ? (
                  <Image
                    src={user.profileUrl}
                    alt="Profile"
                    width={128}
                    height={128}
                    className="object-cover"
                  />
                ) : (
                  <FiUser className="w-16 h-16 text-blue-500 dark:text-blue-400" />
                )}
              </div>
            </div>
            <div className="text-center md:text-left">
              <h2 className="text-3xl font-bold dark:text-white mb-2">{user?.name}</h2>
              <p className="text-gray-600 dark:text-gray-400 text-lg mb-4">{user?.email}</p>
              <div className="flex items-center gap-2">
                <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                  user?.plan === 'premium' 
                    ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                    : user?.plan === 'pro'
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                    : 'bg-gray-100 text-gray-700 dark:bg-gray-700/50 dark:text-gray-400'
                }`}>
                  {user?.plan ? user.plan.charAt(0).toUpperCase() + user.plan.slice(1) : 'Basic'} Plan
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Plan Details Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold dark:text-white">Your Plan Details</h2>
            <Link 
              href="/dashboard/plans"
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
            >
              <FiRefreshCw className="w-4 h-4" />
              Upgrade Plan
            </Link>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6">
                <h3 className="text-lg font-semibold dark:text-white mb-4">Current Plan</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Plan Type</span>
                    <span className="font-medium dark:text-white">
                      {user?.plan ? user.plan.charAt(0).toUpperCase() + user.plan.slice(1) : 'Basic'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Status</span>
                    <span className="flex items-center gap-2 text-green-600 dark:text-green-400">
                      <FiCheckCircle className="w-4 h-4" />
                      Active
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6">
                <h3 className="text-lg font-semibold dark:text-white mb-4">Plan Features</h3>
                <ul className="space-y-3">
                  {getPlanFeatures().map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <FiCheckCircle className="w-4 h-4 text-green-500 dark:text-green-400" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6">
              <h3 className="text-lg font-semibold dark:text-white mb-4">Upgrade Benefits</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FiCreditCard className="w-6 h-6 text-blue-500 dark:text-blue-400" />
                  </div>
                  <h4 className="font-medium dark:text-white mb-2">More Features</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Access to advanced AI features and unlimited generations
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FiUser className="w-6 h-6 text-purple-500 dark:text-purple-400" />
                  </div>
                  <h4 className="font-medium dark:text-white mb-2">Priority Support</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Get faster responses and dedicated support
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FiCheckCircle className="w-6 h-6 text-green-500 dark:text-green-400" />
                  </div>
                  <h4 className="font-medium dark:text-white mb-2">Early Access</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Be the first to try new features and improvements
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AccountPage; 