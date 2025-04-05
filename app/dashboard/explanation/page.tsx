'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUpload, FiFileText, FiVideo, FiImage, FiX, FiCheckCircle, FiAlertCircle, FiLoader, FiTrash2, FiCopy, FiDownload, FiMessageSquare } from 'react-icons/fi';
import { doc, updateDoc, arrayUnion, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from 'react-hot-toast';
import { useStore } from '@/app/store';
import { extractDataFromExcel, extractTextFromDOCX, extractTextFromPDF } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import ChatInterface from '@/components/ChatInterface';

interface UploadFile {
  id: string;
  file: File;
  fileName: string;
  fileSize: number;
  selected?: boolean;
}

const MAX_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_TYPES = {
  'application/pdf': ['.pdf'],
  'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'application/vnd.ms-excel': ['.xls'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
  'text/plain': ['.txt'],
};

const ExplanationPage: React.FC = () => {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [explanation, setExplanation] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [topic, setTopic] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const explanationRef = useRef<HTMLDivElement>(null);
  const { user, userFirestoreID } = useStore();
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [extractedText, setExtractedText] = useState<string>('');
  const [extractionLoading, setExtractionLoading] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatButtonPosition, setChatButtonPosition] = useState({ x: 0, y: 0 });

  const validateFile = (file: File): string | undefined => {
    if (!file) {
      return 'Invalid file';
    }

    if (file.size > MAX_SIZE) {
      return 'File size exceeds 50MB limit';
    }

    const fileType = file.type;
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();

    if (!extension) {
      return 'Invalid file type';
    }

    const allowedExtensions = ALLOWED_TYPES[fileType as keyof typeof ALLOWED_TYPES];
    if (!allowedExtensions?.includes(extension)) {
      return 'File type not supported';
    }

    return undefined;
  };

  const handleFiles = useCallback((newFiles: FileList | File[]) => {
    try {
      const validFiles = Array.from(newFiles).map((file) => {
        const error = validateFile(file);
        
        // Check if file with same name and size already exists
        const isDuplicate = files.some(existingFile => 
          existingFile.fileName === file.name && 
          existingFile.fileSize === file.size
        );

        if (isDuplicate) {
          toast.error(`File "${file.name}" has already been added`);
          return null;
        }

        const uploadFile: UploadFile = {
          id: Math.random().toString(36).substr(2, 9),
          file,
          fileName: file.name,
          fileSize: file.size
        };

        return uploadFile;
      }).filter((file): file is UploadFile => file !== null);

      if (validFiles.length === 0) {
        return;
      }

      setFiles((prev) => [...prev, ...validFiles]);
    } catch (err) {
      console.error('Error processing files:', err);
      setError('Failed to process files. Please try again.');
      toast.error('Failed to process files');
    }
  }, [files]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget.contains(e.relatedTarget as Node)) {
      return;
    }
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  const removeFile = (fileId: string) => {
    setFiles(files.filter(f => f.id !== fileId));
    setError(null);
  };

  const toggleFileSelection = (fileId: string) => {
    setSelectedFiles(prev => 
      prev.includes(fileId) 
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    );
  };

  const handleGenerateExplanation = async () => {
    if (selectedFiles.length === 0) {
      setError('Please select at least one file to generate explanation');
      toast.error('Please select at least one file to generate explanation');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const selectedFileObjects = files.filter(file => selectedFiles.includes(file.id));
      let extractedText = '';

      // Process each file for text extraction
      for (const file of selectedFileObjects) {
        try {
          if (file.file.type === 'application/pdf') {
            const text = await extractTextFromPDF(file.file);
            extractedText += text + '\n\n';
          } else if (file.file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
                    file.file.type === 'application/msword') {
            const text = await extractTextFromDOCX(file.file);
            extractedText += text + '\n\n';
          } else if (file.file.type === 'text/plain') {
            const text = await file.file.text();
            extractedText += text + '\n\n';
          } else if (file.file.type === 'application/vnd.ms-excel' || 
                    file.file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
            const text = await extractDataFromExcel(file.file);
            extractedText += text + '\n\n';
          }
        } catch (error) {
          console.error(`Error extracting text from ${file.fileName}:`, error);
          toast.error(`Failed to extract text from ${file.fileName}`);
          throw error;
        }
      }

      // Call the API to generate explanation
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: `Please explain the topic: "${topic}" based on the provided text. Highlight the main ideas, clarify important concepts, and offer detailed, easy-to-understand explanations: ${extractedText}`,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate explanation');
      }

      const data = await response.json();
      if (!data.genRes) {
        throw new Error('Invalid response from server');
      }

      setExplanation(data.genRes);
      setExtractedText(extractedText);
      toast.success('Explanation generated successfully!');

      // Update user's explanation count in Firestore
      if (userFirestoreID) {
        const userDocRef = doc(db, "users", userFirestoreID);
        await updateDoc(userDocRef, {
          NoExplanationsGenerated: (user?.NoExplanationsGenerated || 0) + 1
        });
      }
    } catch (err) {
      console.error('Error during explanation generation:', err);
      setError('Failed to generate explanation. Please try again.');
      toast.error('Failed to generate explanation');
    } finally {
      setIsProcessing(false);
    }
  };

  const copyExplanation = async () => {
    try {
      await navigator.clipboard.writeText(explanation);
      toast.success('Explanation copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy explanation:', err);
      toast.error('Failed to copy explanation');
    }
  };

  const downloadExplanation = () => {
    try {
      const blob = new Blob([explanation], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'explanation.txt';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download explanation:', err);
      toast.error('Failed to download explanation');
    }
  };

  return (
    <div className="min-h-screen p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 dark:text-white">
            AI-Powered Explanations
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Upload your study materials and let our AI create detailed explanations to help you understand better.
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-6 py-4 rounded-xl shadow-lg backdrop-blur-sm flex items-center gap-3 max-w-2xl mx-auto"
          >
            <FiAlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm font-medium">{error}</p>
            <button 
              onClick={() => setError(null)}
              className="ml-auto p-1 hover:bg-red-100 dark:hover:bg-red-800/50 rounded-lg transition-colors"
            >
              <FiX className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {/* Topic Input Section */}
        <div className="mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4 dark:text-gray-200">What would you like to understand? (Optional)</h2>
            <div className="relative">
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Enter a topic or concept you want to understand (optional)..."
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
              />
            </div>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Optionally enter a specific topic or concept you want to understand better from your uploaded materials.
            </p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 mb-8">
          {/* Left Column - Upload Zone */}
          <div className="lg:w-1/2">
            <div
              className={`relative border-2 border-dashed rounded-2xl p-8 transition-all duration-300 ease-in-out text-center h-[calc(100vh-32rem)]
                ${isDragging
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 bg-white dark:bg-gray-800/50'
                }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileSelect}
                accept=".pdf,.docx,.txt"
                className="hidden"
              />

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="flex flex-col items-center justify-center h-full"
              >
                <div className="w-24 h-24 rounded-full bg-blue-500/10 flex items-center justify-center mb-6">
                  <FiUpload className="w-12 h-12 text-blue-500" />
                </div>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-8 py-4 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors flex items-center gap-2 text-lg shadow-lg hover:shadow-xl"
                >
                  <FiUpload className="w-6 h-6" />
                  Choose Files
                </button>

                <p className="text-base text-gray-600 dark:text-gray-400 mt-4">
                  Drag and drop files here or click to browse
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Supported formats: PDF, DOCX, TXT (Max 50MB)
                </p>
              </motion.div>
            </div>
          </div>

          {/* Right Column - File List */}
          <div className="lg:w-1/2">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 h-[calc(100vh-32rem)]">
              <h2 className="text-xl font-semibold mb-4 dark:text-gray-200">Uploaded Files</h2>
              <div className="space-y-6 h-[calc(100%-4rem)] overflow-y-auto">
                <AnimatePresence>
                  {files.length > 0 ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="space-y-6"
                    >
                      <div className="space-y-4">
                        {files.map((file, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4"
                          >
                            <div className="flex items-start gap-4">
                              <div className="flex-shrink-0 pt-1">
                                <input
                                  type="checkbox"
                                  checked={selectedFiles.includes(file.id)}
                                  onChange={() => toggleFileSelection(file.id)}
                                  className="w-4 h-4 text-blue-500 rounded border-gray-300 focus:ring-blue-500"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <div className="min-w-0">
                                    <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                                      {file.fileName}
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                      {(file.fileSize / (1024 * 1024)).toFixed(2)} MB
                                    </p>
                                  </div>
                                  <button
                                    onClick={() => removeFile(file.id)}
                                    className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                                  >
                                    <FiX className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  ) : (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <FiUpload className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No files uploaded yet</p>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        {/* Chat and Explanation Section */}
        {explanation && (
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Chat Section */}
            {showChat && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="lg:w-1/2"
              >
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg h-[600px] overflow-hidden">
                  <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
                    <h2 className="text-xl font-semibold dark:text-white">Chat with Document</h2>
                    <button
                      onClick={() => setShowChat(false)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-lg transition-colors"
                    >
                      <FiX className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                    </button>
                  </div>
                  <ChatInterface fileContent={extractedText} />
                </div>
              </motion.div>
            )}

            {/* Explanation Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={showChat ? "lg:w-1/2" : "w-full"}
            >
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg h-[600px] overflow-hidden flex flex-col">
                <div className="p-4 border-b dark:border-gray-700 flex items-center justify-between">
                  <h2 className="text-xl font-semibold dark:text-white">Generated Explanation</h2>
                  <div className="flex gap-2">
                    {!showChat && (
                      <button
                        onClick={() => setShowChat(true)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-lg transition-colors"
                        title="Open Chat"
                      >
                        <FiMessageSquare className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                      </button>
                    )}
                    <button
                      onClick={copyExplanation}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-lg transition-colors"
                      title="Copy Explanation"
                    >
                      <FiCopy className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                    </button>
                    <button
                      onClick={downloadExplanation}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-lg transition-colors"
                      title="Download Explanation"
                    >
                      <FiDownload className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                    </button>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-6">
                  {isProcessing ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <FiLoader className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
                        <p className="text-gray-600 dark:text-gray-400">Generating explanation...</p>
                      </div>
                    </div>
                  ) : explanation ? (
                    <div className="prose dark:prose-invert max-w-none">
                      <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: explanation }} />
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 dark:text-gray-400 h-full flex items-center justify-center">
                      <div className="space-y-4">
                        <FiFileText className="w-12 h-12 mx-auto text-gray-400" />
                        <p className="text-lg">Upload a file and enter a topic to generate an explanation</p>
                        <p className="text-sm text-gray-400">The explanation will appear here</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Generate Explanation Button */}
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="sticky bottom-0 pt-4 bg-gradient-to-t from-white dark:from-gray-900 to-transparent"
          >
            <button
              onClick={handleGenerateExplanation}
              disabled={isProcessing}
              className="w-full px-8 py-4 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg shadow-lg hover:shadow-xl"
            >
              {isProcessing ? (
                <>
                  <FiLoader className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                'Generate Explanation'
              )}
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default ExplanationPage; 