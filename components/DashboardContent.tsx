'use client';

import { IconType } from 'react-icons';
import { FiBook, FiPieChart, FiFileText, FiMessageSquare } from 'react-icons/fi';
import { useStore } from '@/app/store';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import AnimateDiv from '@/components/AnimateDiv';

interface InsightCardProps {
  title: string;
  value: string | number;
  icon: IconType;
  color: string;
}

// Components
const InsightCard: React.FC<InsightCardProps> = ({ title, value, icon: Icon, color }) => (
  <div
    className={`p-6 rounded-xl bg-opacity-10 ${color} backdrop-blur-lg hover:scale-[1.05] dark:border dark:border-gray-700/50`}
  >
    <div className="flex items-center justify-between">
      <h3 className="text-lg font-semibold dark:text-gray-200">{title}</h3>
      <Icon className="w-6 h-6 dark:text-gray-300" />
    </div>
    <p className="text-2xl font-bold mt-2 dark:text-white">{value}</p>
  </div>
);

const DashboardContent: React.FC = () => {
  const { user, userFirestoreID } = useStore();
  const [userData, setUserData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      if (userFirestoreID) {
        try {
          const userDoc = await getDoc(doc(db, 'users', userFirestoreID));
          if (userDoc.exists()) {
            setUserData(userDoc.data());
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchUserData();
  }, [userFirestoreID]);

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-100 to-gray-200 text-white dark:from-gray-900 dark:to-gray-800">
      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto dark:bg-gray-900/30">
        {/* Welcome Banner */}
        <AnimateDiv
          initial={{ opacity: 0, y: 20 }}
          className="bg-gradient-to-r from-blue-600/70 to-purple-600/70 rounded-2xl p-8 mb-8 backdrop-blur-lg dark:from-blue-700/50 dark:to-purple-700/50 dark:border dark:border-gray-800/50"
        >
          <h1 className="text-3xl font-bold mb-2 dark:text-white">Welcome back, {user?.name || 'User'}! 👋</h1>
          <p className="text-gray-300 dark:text-gray-400">Ready to enhance your learning journey with AI?</p>
        </AnimateDiv>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <InsightCard
            title="Flashcards Generated"
            value={isLoading ? '...' : userData?.NoFlashcardsGenerated || 0}
            icon={FiBook}
            color="bg-blue-500 dark:bg-blue-600/80"
          />
          <InsightCard
            title="Quizzes Generated"
            value={isLoading ? '...' : userData?.NoQuizzesGenerated || 0}
            icon={FiPieChart}
            color="bg-purple-500 dark:bg-purple-700/50"
          />
          <InsightCard
            title="Explanations Generated"
            value={isLoading ? '...' : userData?.NoExplanationsGenerated || 0}
            icon={FiMessageSquare}
            color="bg-green-500 dark:bg-green-700/50"
          />
          <InsightCard
            title="Summaries Generated"
            value={isLoading ? '...' : userData?.NoSummariesGenerated || 0}
            icon={FiFileText}
            color="bg-yellow-500 dark:bg-yellow-700/50"
          />
        </div>

        {/* Recent Activity */}
        <section className="bg-gray-700 rounded-xl p-6 backdrop-blur-lg dark:bg-gray-800/50 dark:border dark:border-gray-700/50">
          <h2 className="text-xl font-semibold mb-4 dark:text-gray-200">Recent Activity</h2>
          <div className="space-y-4">
            {isLoading ? (
              <div className="p-4 bg-white/5 rounded-lg dark:bg-gray-700/50">
                <p className="text-sm text-gray-300 dark:text-gray-400">Loading activity...</p>
              </div>
            ) : userData?.recentActivity?.length > 0 ? (
              userData.recentActivity.map((activity: any, index: number) => (
                <div key={index} className="p-4 bg-white/5 rounded-lg dark:bg-gray-700/50">
                  <p className="text-sm text-gray-300 dark:text-gray-400">{activity.message}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{activity.timestamp}</p>
                </div>
              ))
            ) : (
              <div className="p-4 bg-white/5 rounded-lg dark:bg-gray-700/50">
                <p className="text-sm text-gray-300 dark:text-gray-400">No recent activity</p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default DashboardContent; 