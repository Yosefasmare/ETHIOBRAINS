'use client';

import { FiBook, FiUsers, FiTarget, FiAward, FiGlobe, FiHeart } from 'react-icons/fi';
import Link from 'next/link';

const AboutUs = () => {
  const values = [
    {
      icon: FiBook,
      title: 'Quality Education',
      description: 'We believe in making high-quality education accessible to every student in Ethiopia and beyond.',
    },
    {
      icon: FiUsers,
      title: 'Student-Centered',
      description: 'Our platform is designed with students needs at heart, focusing on personalized learning experiences.',
    },
    {
      icon: FiTarget,
      title: 'Innovation',
      description: 'We leverage cutting-edge AI technology to revolutionize how students learn and study.',
    },
    {
      icon: FiAward,
      title: 'Excellence',
      description: 'We strive for excellence in every aspect of our service, from content quality to user experience.',
    },
    {
      icon: FiGlobe,
      title: 'Accessibility',
      description: 'We are committed to making education accessible to students regardless of their location.',
    },
    {
      icon: FiHeart,
      title: 'Community',
      description: 'We foster a supportive learning community where students can grow together.',
    },
  ];

  const team = [
    {
      name: 'Yosef Asmare',
      role: 'Founder & CEO',
      description: 'A passionate, enthusiastic, and mindful developer dedicated to creating thoughtful, user-focused solutions through clean code and continuous learning.',
      icon: FiUsers,
    },
    {
      name: 'Yonas Damte',
      role: 'Cybersecurity Expert',
      description: 'Great with security and infrastructure, ensuring safe and reliable digital learning environments.',
      icon: FiBook,
    },
    {
      name: 'Kenean Zeleke',
      role: 'Social Expert',
      description: 'Focused on user behavior and building engaging learning communities.',
      icon: FiTarget,
    },
    
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-green-50 to-yellow-50 dark:from-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-green-600 to-yellow-500 bg-clip-text text-transparent">
              About Ethiobrains
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
              We're on a mission to transform education in Ethiopia through innovative AI-powered learning tools, making quality education accessible to every student.
            </p>
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white text-center">Our Story</h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-sm">
            <div className="space-y-4 text-gray-600 dark:text-gray-300">
              <p>
                Founded in 2023, Ethiobrains emerged from a simple yet powerful idea: to make quality education accessible to every Ethiopian student through technology.
              </p>
              <p>
                We recognized the challenges students face in accessing quality study materials and personalized learning resources. This inspired us to develop an AI-powered platform that transforms how students learn and study.
              </p>
              <p>
                Today, we're proud to serve thousands of students across Ethiopia, helping them achieve their academic goals through innovative learning tools and personalized study experiences.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values Section */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl font-bold mb-12 text-center text-gray-900 dark:text-white">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <div
                key={index}
                className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-yellow-500 rounded-lg flex items-center justify-center mb-4">
                  <value.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">{value.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Team Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl font-bold mb-12 text-center text-gray-900 dark:text-white">Our Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-yellow-500 rounded-full flex items-center justify-center mb-6 mx-auto">
                  <member.icon className="w-8 h-8 text-white" />
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-semibold mb-1 text-gray-900 dark:text-white">{member.name}</h3>
                  <p className="text-green-600 dark:text-green-400 mb-3">{member.role}</p>
                  <p className="text-gray-600 dark:text-gray-300">{member.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Join Us Section */}
      <section className="py-20 bg-gradient-to-r from-green-500 to-yellow-500">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-6 text-white">Join Our Mission</h2>
          <p className="text-xl text-white/90 mb-8">
            Be part of the educational revolution in Ethiopia. Start your learning journey with Ethiobrains today.
          </p>
          <Link
            href="/dashboard"
            className="inline-block px-8 py-4 bg-white text-gray-900 rounded-lg font-semibold hover:shadow-lg transition-all transform hover:-translate-y-1"
          >
            Get Started Free
          </Link>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Get in Touch</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Have questions? We'd love to hear from you.
          </p>
          <div className="space-y-4">
            <p className="text-gray-600 dark:text-gray-300">
              Email: contact@ethiobrains.com
            </p>
            <p className="text-gray-600 dark:text-gray-300">
              Address: Addis Ababa, Ethiopia
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUs; 