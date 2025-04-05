import { FiUpload, FiBook, FiHelpCircle, FiCheck, FiStar, FiArrowRight, FiBookOpen, FiTarget, FiMessageSquare, FiUsers, FiSun, FiMoon } from 'react-icons/fi';
import Image from 'next/image';
import Page from '../public/page.png'
import AnimateDiv from '@/components/AnimateDiv';
import ThemeToggleBtn from '@/components/ThemeToggleBtn';
import Testimony from '@/components/Testimony';
import Link from 'next/link';
import { div } from 'framer-motion/client';

const features = [
  {
    icon: FiBook,
    title: 'Smart Summaries',
    description: 'Get concise, accurate summaries of your study materials in seconds.',
  },
  {
    icon: FiBookOpen,
    title: 'Flashcard Generation',
    description: 'Create effective flashcards automatically from your study content.',
  },
  {
    icon: FiMessageSquare,
    title: 'Detailed Explanations',
    description: 'Get in-depth explanations for any topic or concept you need help with.',
  },
  {
    icon: FiTarget,
    title: 'Quiz Generation',
    description: 'Generate personalized quizzes to test your knowledge and track progress.',
  },
];


const steps = [
  {
    icon: FiUpload,
    title: 'Upload',
    description: 'Drag & drop your files or choose from your computer.',
  },
  {
    icon: FiBook,
    title: 'Process',
    description: 'Let our AI analyze and generate study materials.',
  },
  {
    icon: FiCheck,
    title: 'Learn',
    description: 'Access your personalized study materials and track progress.',
  },
];
const testimony: never[] = [

]

const LandingPage: React.FC = () => {
 

  return (
    <div className={`min-h-screen`}>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-green-50 to-yellow-50 dark:from-gray-900 dark:to-gray-800">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="container mx-auto px-4 py-16 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <AnimateDiv
              initial={{ opacity: 0, y: 20 }}
              className="flex-1 text-center lg:text-left"
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-yellow-500 dark:from-green-400 dark:to-yellow-300">
                Learn Smarter, Not Harder!
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto lg:mx-0">
                Transform your study experience with AI-powered learning tools. Get instant summaries, flashcards, and quizzes from your study materials.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link href={'/dashboard'} className="px-8 py-4 bg-gradient-to-r from-green-500 to-yellow-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all transform hover:-translate-y-1">
                  Get Started Free
                </Link>
                <button className="px-8 py-4 bg-white dark:bg-gray-800 text-gray-800 dark:text-white rounded-lg font-semibold hover:shadow-lg transition-all transform hover:-translate-y-1">
                  Learn More
                </button>
              </div>
            </AnimateDiv>
            <AnimateDiv
              initial={{ opacity: 0, scale: 0.8 }}
              className="flex-1 relative"
            >
              <div className="relative w-full h-[400px] lg:h-[500px]">
                <Image
                  src={Page}
                  alt="AI Learning Illustration"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </AnimateDiv>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <AnimateDiv
            initial={{ opacity: 0, y: 20 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 dark:text-white">
              Powerful Features for Better Learning
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Our AI-powered tools help you study more effectively and efficiently.
            </p>
          </AnimateDiv>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <AnimateDiv
                key={index}
                initial={{ opacity: 0, y: 20 }}
                className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
              >
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-yellow-500 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2 dark:text-white">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
              </AnimateDiv>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <AnimateDiv
            initial={{ opacity: 0, y: 20 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 dark:text-white">
              How Ethiobrain Works
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Three simple steps to transform your study experience
            </p>
          </AnimateDiv>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
            <AnimateDiv
                key={index}
                initial={{ opacity: 0, y: 20 }}
                className="relative"
              >
                <div className="p-6 bg-white dark:bg-gray-900 rounded-xl shadow-lg">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-yellow-500 rounded-lg flex items-center justify-center mb-4">
                    <step.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 dark:text-white">{step.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <FiArrowRight className="w-8 h-8 text-gray-400" />
                  </div>
                )}
              </AnimateDiv>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      {testimony.length > 0 &&
        <div>
             <Testimony name={''} role={''} content={''} rating={0} image={''} />
        </div>}
        
     

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-green-500 to-yellow-500">
        <div className="container mx-auto px-4 text-center">
          <AnimateDiv
            initial={{ opacity: 0, y: 20 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
              Ready to Transform Your Learning?
            </h2>
            <p className="text-white/90 text-xl mb-8 max-w-2xl mx-auto">
              Join thousands of students who are already learning smarter with Ethiobrain
            </p>
            <Link href={'/dashboard'} className="px-8 py-4 bg-white text-gray-900 rounded-lg font-semibold hover:shadow-lg transition-all transform hover:-translate-y-1">
              Get Started Free
            </Link>
          </AnimateDiv>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-900 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4 dark:text-white">Ethiobrain</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Transform your study experience with AI-powered learning tools.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 dark:text-white">Quick Links</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-green-500">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-green-500">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-green-500">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 dark:text-white">Support</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-green-500">
                    FAQ
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-green-500">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-green-500">
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 dark:text-white">Connect</h4>
              <div className="flex gap-4">
                <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-green-500">
                  <FiUsers className="w-6 h-6" />
                </a>
                <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-green-500">
                  <FiHelpCircle className="w-6 h-6" />
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-800 mt-8 pt-8 text-center text-gray-600 dark:text-gray-400">
            <p>&copy; {new Date().getFullYear()} Ethiobrain. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Theme Toggle Button */}
     <ThemeToggleBtn />
    </div>
  );
};

export default LandingPage;
