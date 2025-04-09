'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUpload,  FiX , FiAlertCircle, FiLoader,  FiCopy, FiDownload } from 'react-icons/fi';
import { doc, updateDoc  } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from 'react-hot-toast';
import { useStore } from '@/app/store';
import AnimateDiv from '@/components/AnimateDiv';
import { extractTextFromPDF, extractTextFromDOCX, extractDataFromExcel } from '@/lib/utils';

interface Flashcard {
  id: number;
  front: string;
  back: string;
}

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

const FlashcardsPage: React.FC = () => {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [numFlashcards, setNumFlashcards] = useState<number>(5);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user, userFirestoreID } = useStore();
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [flippedCards, setFlippedCards] = useState<Set<number>>(new Set());

  const getMaxFlashcards = () => {
    switch (user?.plan) {
      case 'premium':
        return 50; // 50 for premium
      case 'pro':
        return 10; // 10 for pro
      default:
        return 5; // 5 for basic
    }
  };

  const handleNumFlashcardsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    const maxFlashcards = getMaxFlashcards();
    if (!isNaN(value) && value > 0 && value <= maxFlashcards) {
      setNumFlashcards(value);
    }
  };

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

  const handleGenerateFlashcards = async () => {
    if (selectedFiles.length === 0) {
      setError('Please select at least one file to generate flashcards');
      toast.error('Please select at least one file to generate flashcards');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const selectedFileObjects = files.filter(file => selectedFiles.includes(file.id));
      let extractedText = '';

      // Extract text from each selected file
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

      // Call the API to generate flashcards with the specified number and difficulty
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: `Generate ${numFlashcards} flashcards with questions and answers based on the following text. The difficulty level should be ${difficulty}. Format each flashcard as a JSON object with "front" for the question and "back" for the answer. The questions should test understanding of key concepts, and answers should be clear and concise. For ${difficulty} difficulty, make the questions ${difficulty === 'easy' ? 'basic and straightforward' : difficulty === 'medium' ? 'moderately challenging' : 'complex and detailed'}. Text: ${extractedText}`,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate flashcards');
      }

      const data = await response.json();
      if (!data.genRes) {
        throw new Error('Invalid response from server');
      }
      let cleanedResponse = data.genRes.trim();
      
      // Remove surrounding triple backticks (```json ... ```)
      if (cleanedResponse.startsWith("```json")) {
        cleanedResponse = cleanedResponse.replace("```json", "").trim();
      }
      if (cleanedResponse.endsWith("```")) {
        cleanedResponse = cleanedResponse.slice(0, -3).trim();
      }

      try {
        const parsedFlashcards = JSON.parse(cleanedResponse);
        if (!Array.isArray(parsedFlashcards)) {
          throw new Error('Invalid flashcard format');
        }
        
        // Transform the flashcards to match our interface
        const formattedFlashcards = parsedFlashcards.map((card, index) => ({
          id: index + 1,
          front: card.front || card.question,
          back: card.back || card.answer
        }));
        
        setFlashcards(formattedFlashcards);
        toast.success('Flashcards generated successfully!');

        // Update user's flashcard count in Firestore
        if (userFirestoreID) {
          const userDocRef = doc(db, "users", userFirestoreID);
          await updateDoc(userDocRef, {
            NoFlashcardsGenerated: (user?.NoFlashcardsGenerated || 0) + 1
          });
        }
      } catch (parseError) {
        throw new Error('Failed to parse flashcard data');
      }
    } catch (err) {
      console.error('Error during flashcard generation:', err);
      setError('Failed to generate flashcards. Please try again.');
      toast.error('Failed to generate flashcards');
    } finally {
      setIsProcessing(false);
    }
  };

  const copyFlashcards = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(flashcards));
      toast.success('Flashcards copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy flashcards:', err);
      toast.error('Failed to copy flashcards');
    }
  };

  const downloadFlashcards = () => {
    try {
      const blob = new Blob([JSON.stringify(flashcards)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'flashcards.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download flashcards:', err);
      toast.error('Failed to download flashcards');
    }
  };

  const toggleCard = (cardId: number) => {
    setFlippedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(cardId)) {
        newSet.delete(cardId);
      } else {
        newSet.add(cardId);
      }
      return newSet;
    });
  };

  const handleCardInteraction = (cardId: number, event: React.MouseEvent | React.TouchEvent) => {
    event.preventDefault();
    toggleCard(cardId);
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
            AI-Powered Flashcards
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Upload your study materials and let our AI create effective flashcards for better learning.
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

        <div className="flex flex-col lg:flex-row gap-8 mb-8">
          {/* Left Column - Upload Zone */}
          <div className="lg:w-1/2">
            <div
              className={`relative border-2 border-dashed rounded-2xl p-8 transition-all duration-300 ease-in-out text-center h-[310px]
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
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 h-[310px]">
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
                                      {((file.fileSize) / (1024 * 1024)).toFixed(2)} MB
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

        {/* Flashcard Section - Full Width */}
        <div className="w-full">
          {isProcessing ? (
            <AnimateDiv className='bg-gray-100/50 dark:bg-gray-800/50 rounded-2xl p-6 shadow-sm'>
              <div className='flex p-4 justify-center items-center'>
                <h1 className='font-bold text-2xl animate-pulse text-gray-800 dark:text-gray-200'>Generating flashcards...</h1>
              </div>
            </AnimateDiv>
          ) : (
            <AnimatePresence>
              {flashcards.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm"
                >
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold dark:text-gray-200">Generated Flashcards</h2>
                    <div className="flex gap-2">
                      <button
                        onClick={copyFlashcards}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-lg transition-colors"
                      >
                        <FiCopy className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                      </button>
                      <button
                        onClick={downloadFlashcards}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-lg transition-colors"
                      >
                        <FiDownload className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {flashcards.map((card) => (
                      <div
                        key={card.id}
                        style={{ perspective: "1000px" }}
                        className="cursor-pointer"
                        onClick={(e) => handleCardInteraction(card.id, e)}
                        onTouchStart={(e) => handleCardInteraction(card.id, e)}
                      >
                        <motion.div
                          className="relative w-full h-[300px]"
                          animate={{ rotateY: flippedCards.has(card.id) ? 180 : 0 }}
                          transition={{ duration: 0.5 }}
                          style={{ 
                            transformStyle: "preserve-3d",
                            position: "relative"
                          }}
                        >
                          {/* Front of card */}
                          <motion.div
                            style={{ 
                              position: "absolute",
                              width: "100%",
                              height: "100%",
                              backfaceVisibility: "hidden",
                              WebkitBackfaceVisibility: "hidden"
                            }}
                          >
                            <div className="w-full h-full bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/50 dark:to-blue-800/50 rounded-xl p-6 flex flex-col shadow-md">
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Question</h3>
                              <div className="flex-1 overflow-hidden">
                                <p className="text-gray-700 dark:text-gray-300 break-words whitespace-pre-wrap line-clamp-6">{card.front}</p>
                              </div>
                              <p className="text-sm text-blue-500 dark:text-blue-400 mt-4">Click or tap to flip</p>
                            </div>
                          </motion.div>
                          {/* Back of card */}
                          <motion.div
                            style={{ 
                              position: "absolute",
                              width: "100%",
                              height: "100%",
                              backfaceVisibility: "hidden",
                              WebkitBackfaceVisibility: "hidden",
                              rotateY: 180
                            }}
                          >
                            <div className="w-full h-full bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/50 dark:to-green-800/50 rounded-xl p-6 flex flex-col shadow-md">
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Answer</h3>
                              <div className="flex-1 overflow-hidden">
                                <p className="text-gray-700 dark:text-gray-300 break-words whitespace-pre-wrap line-clamp-6">{card.back}</p>
                              </div>
                              <p className="text-sm text-green-500 dark:text-green-400 mt-4">Click or tap to flip back</p>
                            </div>
                          </motion.div>
                        </motion.div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}

          {/* Generate Flashcards Button */}
          {files.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="sticky bottom-0 pt-4 bg-gradient-to-t from-white dark:from-gray-900 to-transparent"
            >
              <div className="flex flex-col gap-4 mb-4">
                <div className="flex items-center gap-4">
                  <label htmlFor="numFlashcards" className="text-gray-700 dark:text-gray-300">
                    Number of Flashcards:
                  </label>
                  <input
                    type="number"
                    id="numFlashcards"
                    min="1"
                    max={getMaxFlashcards()}
                    value={numFlashcards}
                    onChange={handleNumFlashcardsChange}
                    className="w-20 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Max: {getMaxFlashcards()} ({user?.plan ? user.plan.charAt(0).toUpperCase() + user.plan.slice(1) : 'Basic'} Plan)
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <label htmlFor="difficulty" className="text-gray-700 dark:text-gray-300">
                    Difficulty:
                  </label>
                  <select
                    id="difficulty"
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as 'easy' | 'medium' | 'hard')}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
                <button
                  onClick={handleGenerateFlashcards}
                  disabled={isProcessing}
                  className="w-full px-8 py-4 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg shadow-lg hover:shadow-xl"
                >
                  {isProcessing ? (
                    <>
                      <FiLoader className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Generate Flashcards'
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default FlashcardsPage; 
