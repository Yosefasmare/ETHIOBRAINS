'use client';

import { FiX, FiGithub, FiInstagram, FiLinkedin, FiMail, FiPhone } from 'react-icons/fi';

interface ContactPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const ContactPopup = ({ isOpen, onClose }: ContactPopupProps) => {
  if (!isOpen) return null;

  const contacts = [
    {
      icon: FiGithub,
      label: 'GitHub',
      href: 'https://github.com/Yosefasmare/',
      color: 'hover:bg-gray-800',
    },
    {
      icon: FiInstagram,
      label: 'Instagram',
      href: 'https://www.instagram.com/josi_12260/',
      color: 'hover:bg-pink-600',
    } ,
    {
      icon: FiMail,
      label: 'Email',
      href: 'mailto:yosidev8@gmail.com',
      color: 'hover:bg-red-600',
    } 
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left shadow-xl transition-all">
        <div className="absolute right-4 top-4">
          <button
            onClick={onClose}
            className="rounded-full p-1 text-gray-400 hover:text-gray-500 focus:outline-none"
          >
            <FiX className="h-6 w-6" />
          </button>
        </div>

        <div className="mb-8">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Connect With Us
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            Choose your preferred way to connect with Ethiobrains
          </p>
        </div>

        <div className="grid gap-4">
          {contacts.map((contact, index) => (
            <a
              key={index}
              href={contact.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center space-x-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-700 
                ${contact.color} hover:text-white transition-all duration-300 group`}
            >
              <contact.icon className="h-6 w-6" />
              <span className="font-medium">{contact.label}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ContactPopup; 