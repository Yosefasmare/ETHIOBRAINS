'use client';

import { useState } from 'react';
import { motion  } from 'framer-motion';
import { FiCheck, FiX, FiZap, FiStar, FiAward, FiArrowRight } from 'react-icons/fi';
import { useStore } from '../../store';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface Plan {
  name: string;
  price: {
    monthly: number;
    yearly: number;
  };
  features: string[];
  description: string;
  icon: React.ReactNode;
  color: string;
  isPopular?: boolean;
}

const plans: Plan[] = [
  {
    name: 'Basic',
    price: {
      monthly: 0,
      yearly: 0,
    },
    features: [
      'Access to AI-powered file summarization',
      'Limited flashcard generation',
      '5 quizzes per month',
      'Limited AI explanations',
      '5 File Uploades per month'
    ],
    description: 'Perfect for getting started with AI-powered learning',
    icon: <FiZap className="w-6 h-6" />,
    color: 'from-blue-500 to-blue-600',
  },
  {
    name: 'Pro',
    price: {
      monthly: 299,
      yearly: 2999,
    },
    features: [
      'Everything in Basic',
      'Unlimited AI file summarization',
      '50 quizzes per month',
      'Full flashcard access',
      'Priority support',
      '40 File Uploades per month'
    ],
    description: 'Best for students who want to excel in their studies',
    icon: <FiStar className="w-6 h-6" />,
    color: 'from-purple-500 to-purple-600',
    isPopular: true,
  },
  {
    name: 'Premium',
    price: {
      monthly: 599,
      yearly: 5999,
    },
    features: [
      'Everything in Pro',
      'Unlimited quizzes',
      'Advanced AI explanations',
      'Exclusive access to past Ethiopian Grade 12 exam questions',
      'Personalized study insights',
      '100 File Uploades per month'
    ],
    description: 'For serious learners who want the ultimate study experience',
    icon: <FiAward className="w-6 h-6" />,
    color: 'from-yellow-500 to-yellow-600',
  },
];

const PlansPage: React.FC = () => {
  const [isYearly, setIsYearly] = useState(false);
  const [loading,setLoading] = useState(false)
  const {user,userFirestoreID} = useStore()

  const togglePricing = () => {
    setIsYearly(!isYearly);
  }
    
 const handlePayment = async (amount: number, name: string) => {
  setLoading(true);
  try {
    const txRef = "txn_" + Date.now();
    const response = await fetch("/api/chapa", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount,
        currency: "ETB",
        email: user?.email || "test@example.com",
        first_name: user?.name?.split(" ")[0] || "John",
        last_name: user?.name?.split(" ")[1] || "Doe",
        tx_ref: txRef,
        callback_url: process.env.NEXT_PUBLIC_CALLBACK_URL || "http://localhost:3000/dashboard/account",
      }),
    });

    const data = await response.json();

    if (response.ok && data.data?.checkout_url) {
      if (!userFirestoreID) {
        console.error("Missing userFirestoreID");
        return;
      }

      const userDocRef = doc(db, "users", userFirestoreID);
      await updateDoc(userDocRef, { plan: name });

      window.location.href = data.data.checkout_url;
    } else {
      console.error("Payment error:", data.message);
    }
  } catch (error) {
    console.error("Payment error:", error);
  } finally {
    setLoading(false);
  }
};

  

  const isCurrentPlan = (planName: string) => {
    return user?.plan?.toLowerCase() === planName.toLowerCase();
  };

  return (
    <div className="min-h-screen p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto"
      >
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 dark:text-white">
            Unlock Your Full Learning Potential!
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Choose the perfect plan to enhance your learning journey with our AI-powered study assistant.
          </p>
        </div>

        {/* Current Plan Display */}
        {user?.plan && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold dark:text-white">Current Plan</h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  You are currently on the <span className="font-medium text-blue-500 dark:text-blue-400">{user.plan}</span> plan
                </p>
              </div>
              <div className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-sm font-medium">
                Active
              </div>
            </div>
          </motion.div>
        )}

        {/* Pricing Toggle */}
        <div className="flex justify-center items-center gap-4 mb-12">
          <span className={`text-sm ${!isYearly ? 'text-blue-500 font-medium' : 'text-gray-500'}`}>
            Monthly
          </span>
          <button
            onClick={togglePricing}
            className="relative w-16 h-8 bg-gray-200 dark:bg-gray-700 rounded-full transition-colors"
          >
            <motion.div
              initial={false}
              animate={{ x: isYearly ? 32 : 0 }}
              className="absolute w-6 h-6 bg-white dark:bg-gray-300 rounded-full shadow-md top-1 left-1"
            />
          </button>
          <span className={`text-sm ${isYearly ? 'text-blue-500 font-medium' : 'text-gray-500'}`}>
            Yearly
            {isYearly && (
              <span className="ml-1 text-xs bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-2 py-0.5 rounded-full">
                Save 17%
              </span>
            )}
          </span>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg ${
                plan.isPopular ? 'ring-2 ring-purple-500' : ''
              } ${isCurrentPlan(plan.name) ? 'ring-2 ring-blue-500' : ''}`}
            >
              {plan.isPopular && !isCurrentPlan(plan.name) && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-purple-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Best Value
                  </span>
                </div>
              )}
              {isCurrentPlan(plan.name) && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Current Plan
                  </span>
                </div>
              )}
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center text-white mb-6`}>
                {plan.icon}
              </div>
              <h3 className="text-2xl font-bold mb-2 dark:text-white">{plan.name}</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">{plan.description}</p>
              <div className="mb-6">
                <span className="text-4xl font-bold dark:text-white">
                  {isYearly ? plan.price.yearly : plan.price.monthly}<span className='font-light text-sm'>ETB</span>
                </span>
                <span className="text-gray-600 dark:text-gray-400">/{isYearly ? 'year' : 'month'}</span>
              </div>
              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                    <FiCheck className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              {isCurrentPlan(plan.name) ? (
                <button
                  disabled
                  className="w-full py-3 px-6 rounded-lg font-medium bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed flex items-center justify-center gap-2"
                >
                  Current Plan
                </button>
              ) : (
                <button
                  onClick={() => handlePayment(isYearly ? plan.price.yearly : plan.price.monthly,plan.name)}
                  className={`w-full py-3 px-6 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                    plan.isPopular
                      ? 'bg-purple-500 hover:bg-purple-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200'
                  }`}
                >
                  Get Started
                  <FiArrowRight className="w-5 h-5" />
                </button>
              )}
            </motion.div>
          ))}
        </div>

        {/* Feature Comparison Table */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg overflow-x-auto">
          <h2 className="text-2xl font-bold mb-8 dark:text-white">Feature Comparison</h2>
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-4 px-6 text-gray-600 dark:text-gray-400">Features</th>
                <th className="text-center py-4 px-6 text-gray-600 dark:text-gray-400">Basic</th>
                <th className="text-center py-4 px-6 text-gray-600 dark:text-gray-400">Pro</th>
                <th className="text-center py-4 px-6 text-gray-600 dark:text-gray-400">Premium</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <td className="py-4 px-6 text-gray-700 dark:text-gray-300">AI File Summarization</td>
                <td className="text-center py-4 px-6">
                  <FiCheck className="w-5 h-5 text-green-500 mx-auto" />
                </td>
                <td className="text-center py-4 px-6">
                  <FiCheck className="w-5 h-5 text-green-500 mx-auto" />
                </td>
                <td className="text-center py-4 px-6">
                  <FiCheck className="w-5 h-5 text-green-500 mx-auto" />
                </td>
              </tr>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <td className="py-4 px-6 text-gray-700 dark:text-gray-300">Flashcard Generation</td>
                <td className="text-center py-4 px-6">
                  <span className="text-gray-500">Limited</span>
                </td>
                <td className="text-center py-4 px-6">
                  <FiCheck className="w-5 h-5 text-green-500 mx-auto" />
                </td>
                <td className="text-center py-4 px-6">
                  <FiCheck className="w-5 h-5 text-green-500 mx-auto" />
                </td>
              </tr>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <td className="py-4 px-6 text-gray-700 dark:text-gray-300">Monthly Quizzes</td>
                <td className="text-center py-4 px-6">
                  <span className="text-gray-500">5</span>
                </td>
                <td className="text-center py-4 px-6">
                  <span className="text-gray-500">50</span>
                </td>
                <td className="text-center py-4 px-6">
                  <span className="text-gray-500">Unlimited</span>
                </td>
              </tr>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <td className="py-4 px-6 text-gray-700 dark:text-gray-300">Monthly File Uploads</td>
                <td className="text-center py-4 px-6">
                  <span className="text-gray-500">5</span>
                </td>
                <td className="text-center py-4 px-6">
                  <span className="text-gray-500">40</span>
                </td>
                <td className="text-center py-4 px-6">
                  <span className="text-gray-500">100</span>
                </td>
              </tr>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <td className="py-4 px-6 text-gray-700 dark:text-gray-300">AI Explanations</td>
                <td className="text-center py-4 px-6">
                  <span className="text-gray-500">Limited</span>
                </td>
                <td className="text-center py-4 px-6">
                  <FiCheck className="w-5 h-5 text-green-500 mx-auto" />
                </td>
                <td className="text-center py-4 px-6">
                  <FiCheck className="w-5 h-5 text-green-500 mx-auto" />
                </td>
              </tr>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <td className="py-4 px-6 text-gray-700 dark:text-gray-300">Priority Support</td>
                <td className="text-center py-4 px-6">
                  <FiX className="w-5 h-5 text-red-500 mx-auto" />
                </td>
                <td className="text-center py-4 px-6">
                  <FiCheck className="w-5 h-5 text-green-500 mx-auto" />
                </td>
                <td className="text-center py-4 px-6">
                  <FiCheck className="w-5 h-5 text-green-500 mx-auto" />
                </td>
              </tr>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <td className="py-4 px-6 text-gray-700 dark:text-gray-300">Past Exam Questions</td>
                <td className="text-center py-4 px-6">
                  <FiX className="w-5 h-5 text-red-500 mx-auto" />
                </td>
                <td className="text-center py-4 px-6">
                  <FiX className="w-5 h-5 text-red-500 mx-auto" />
                </td>
                <td className="text-center py-4 px-6">
                  <FiCheck className="w-5 h-5 text-green-500 mx-auto" />
                </td>
              </tr>
              <tr>
                <td className="py-4 px-6 text-gray-700 dark:text-gray-300">Study Insights</td>
                <td className="text-center py-4 px-6">
                  <FiX className="w-5 h-5 text-red-500 mx-auto" />
                </td>
                <td className="text-center py-4 px-6">
                  <FiX className="w-5 h-5 text-red-500 mx-auto" />
                </td>
                <td className="text-center py-4 px-6">
                  <FiCheck className="w-5 h-5 text-green-500 mx-auto" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default PlansPage; 
