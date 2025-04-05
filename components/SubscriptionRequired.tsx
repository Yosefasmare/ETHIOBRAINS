'use client';

import { motion } from 'framer-motion';
import { FiLock, FiCheck } from 'react-icons/fi';
import Link from 'next/link';
import { useStore } from '@/app/store';

const SubscriptionRequierd = ({children}: {children: React.ReactNode}) => {
  const { user } = useStore();

  const getPlanFeatures = () => {
    switch (user?.plan) {
      case 'basic':
        return {
          title: 'Upgrade to Premium',
          message: 'Your current Basic plan has limited features. Upgrade to Premium to unlock:',
          features: [
            'Unlimited flashcards generation',
            'Advanced quiz modes',
            'Priority support',
            'Custom study plans'
          ],
          buttonText: 'Upgrade to Premium',
          buttonLink: '/dashboard/plans'
        };
      case 'pro':
        return {
          title: 'Upgrade to Premium',
          message: 'Your current Pro plan has some limitations. Upgrade to Premium to unlock:',
          features: [
            'Advanced AI features',
            'Custom study plans',
            'Priority support',
            'Early access to new features'
          ],
          buttonText: 'Upgrade to Premium',
          buttonLink: '/dashboard/plans'
        };
      default:
        return {
          title: 'Premium Feature',
          message: 'This feature is available only for premium users. Upgrade your subscription to access:',
          features: [
            'Unlimited flashcards generation',
            'Advanced quiz modes',
            'Custom study plans',
            'Priority support'
          ],
          buttonText: 'View Plans',
          buttonLink: '/dashboard/plans'
        };
    }
  };

  const planFeatures = getPlanFeatures();

  if(user?.plan === 'basic'){
    return (
      <div className="fixed inset-0 flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative w-full max-w-md"
        >
          <div className="absolute inset-0 bg-white/30 dark:bg-gray-800/30 backdrop-blur-lg rounded-2xl shadow-2xl" />
          <div className="relative p-8">
            <div className="flex justify-center mb-6">
              <div className="bg-white/20 dark:bg-gray-700/20 p-4 rounded-full backdrop-blur-sm">
                <FiLock className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 text-center">
              {planFeatures.title}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6 text-center">
              {planFeatures.message}
            </p>
            <div className="space-y-3 mb-8">
              {planFeatures.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="bg-blue-100 dark:bg-blue-900/30 p-1 rounded-full">
                    <FiCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-center">
              <Link
                href={planFeatures.buttonLink}
                className="inline-flex items-center justify-center px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20"
              >
                {planFeatures.buttonText}
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    );

  } else {
    return <>{children}</>
  }

};

export default SubscriptionRequierd; 