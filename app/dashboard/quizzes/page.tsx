'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUpload,  FiX,  FiAlertCircle, FiLoader} from 'react-icons/fi';
import { doc, updateDoc  } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from 'react-hot-toast';
import { useStore } from '@/app/store';
import { extractDataFromExcel, extractTextFromDOCX, extractTextFromPDF } from '@/lib/utils';

interface Quiz {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  userAnswer?: number;
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

const QuizzesPage: React.FC = () => {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [numQuestions, setNumQuestions] = useState<number>(5);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user, userFirestoreID } = useStore();
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);

  const getMaxQuestions = () => {
    switch (user?.plan) {
      case 'premium':
        return 50; // Unlimited for premium
      case 'pro':
        return 10; // 10 for pro
      default:
        return 5; // 5 for basic
    }
  };

  const handleNumQuestionsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    const maxQuestions = getMaxQuestions();
    if (!isNaN(value) && value > 0 && value <= maxQuestions) {
      setNumQuestions(value);
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

  const handleGenerateQuizzes = async () => {
    if (selectedFiles.length === 0) {
      setError('Please select at least one file to generate quizzes');
      toast.error('Please select at least one file to generate quizzes');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setQuizCompleted(false);
    setCurrentQuestionIndex(0);
    setScore(0);

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

      // Call the API to generate quizzes with the specified number and difficulty
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: `Generate ${numQuestions} multiple-choice questions (MCQs) based on the following book text. The difficulty level should be ${difficulty}. Focus on the main ideas, important themes, and key concepts—not minor details. Each question should include 4 answer options. For ${difficulty} difficulty, make the questions ${difficulty === 'easy' ? 'basic and straightforward' : difficulty === 'medium' ? 'moderately challenging' : 'complex and detailed'}. Format the output as a JSON array, where each item is an object like: { "question": "...", "options": ["...", "...", "...", "..."], "correctAnswer": <index from 0 to 3> }. Text: ${extractedText}`,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate quizzes');
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
        const parsedQuizzes = JSON.parse(cleanedResponse);
        if (!Array.isArray(parsedQuizzes)) {
          throw new Error('Invalid quiz format');
        }
        
        // Transform the quizzes to match our interface
        const formattedQuizzes = parsedQuizzes.map((quiz, index) => ({
          id: index + 1,
          question: quiz.question,
          options: quiz.options,
          correctAnswer: quiz.correctAnswer
        }));
        
        setQuizzes(formattedQuizzes);
        toast.success('Quizzes generated successfully!');

        // Scroll to quiz section after a short delay
        setTimeout(() => {
          const quizSection = document.getElementById('quiz-section');
          if (quizSection) {
            quizSection.scrollIntoView({ behavior: 'smooth' });
          }
        }, 500);

        // Update user's quiz count in Firestore
        if (userFirestoreID) {
          const userDocRef = doc(db, "users", userFirestoreID);
          await updateDoc(userDocRef, {
            NoQuizzesGenerated: (user?.NoQuizzesGenerated || 0) + 1
          });
        }
      } catch (parseError) {
        throw new Error('Failed to parse quiz data');
      }
    } catch (err) {
      console.error('Error during quiz generation:', err);
      setError('Failed to generate quizzes. Please try again.');
      toast.error('Failed to generate quizzes');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAnswerSelect = (optionIndex: number) => {
    if (quizCompleted) return;

    const updatedQuizzes = [...quizzes];
    updatedQuizzes[currentQuestionIndex].userAnswer = optionIndex;
    setQuizzes(updatedQuizzes);

    if (optionIndex === quizzes[currentQuestionIndex].correctAnswer) {
      setScore(score + 1);
    }

    if (currentQuestionIndex < quizzes.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setQuizCompleted(true);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestionIndex(0);
    setScore(0);
    setQuizCompleted(false);
    setQuizzes(quizzes.map(quiz => ({ ...quiz, userAnswer: undefined })));
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
            AI-Powered Quizzes
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Upload your study materials and test your knowledge with AI-generated quizzes.
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
                accept=".pdf,.docx,.txt,.xlsx,.xls"
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
                  Supported formats: PDF, DOCX, TXT, XLSX (Max 50MB)
                </p>
              </motion.div>
            </div>
          </div>

          {/* Right Column - File List */}
          <div className="lg:w-1/2">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 h-[calc(100vh-32rem)]">
              <h2 className="text-xl font-semibold mb-4 dark:text-gray-200">Selected Files</h2>
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
                      <p>No files selected yet</p>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        {/* Quiz Section */}
        <div id="quiz-section" className="w-full">
          {isProcessing ? (
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-gray-100/50 dark:bg-gray-800/50 rounded-2xl p-6 shadow-sm"
              >
                <div className="flex p-4 justify-center items-center">
                  <h1 className="font-bold text-2xl animate-pulse text-gray-800 dark:text-gray-200">Generating quiz...</h1>
                </div>
              </motion.div>
            </AnimatePresence>
          ) : (
            <AnimatePresence>
              {quizzes.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm"
                >
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold dark:text-gray-200">Quiz</h2>
                    <button
                      onClick={resetQuiz}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      Reset Quiz
                    </button>
                  </div>

                  {!quizCompleted ? (
                    <div className="space-y-6">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={currentQuestionIndex}
                          initial={{ x: 300, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          exit={{ x: -300, opacity: 0 }}
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                          className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6"
                        >
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                              Question {currentQuestionIndex + 1} of {quizzes.length}
                            </h3>
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-24 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                                <motion.div
                                  className="h-full bg-blue-500"
                                  initial={{ width: 0 }}
                                  animate={{ width: `${((currentQuestionIndex + 1) / quizzes.length) * 100}%` }}
                                  transition={{ duration: 0.3 }}
                                />
                              </div>
                            </div>
                          </div>
                          <motion.p
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="text-gray-700 dark:text-gray-300 mb-6"
                          >
                            {quizzes[currentQuestionIndex].question}
                          </motion.p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {quizzes[currentQuestionIndex].options.map((option, index) => (
                              <motion.button
                                key={index}
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.3 + index * 0.1 }}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleAnswerSelect(index)}
                                className={`p-4 rounded-lg text-left transition-colors ${
                                  quizzes[currentQuestionIndex].userAnswer === index
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <span className="font-medium">{String.fromCharCode(65 + index)}.</span>
                                  <span>{option}</span>
                                </div>
                              </motion.button>
                            ))}
                          </div>
                        </motion.div>
                      </AnimatePresence>
                    </div>
                  ) : (
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      className="space-y-6"
                    >
                      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 text-center">
                        <motion.h3
                          initial={{ y: -20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.2 }}
                          className="text-2xl font-bold text-gray-900 dark:text-white mb-4"
                        >
                          Quiz Completed!
                        </motion.h3>
                        <motion.div
                          initial={{ scale: 0.5, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.4, type: "spring", stiffness: 200, damping: 20 }}
                          className="mb-8"
                        >
                          <div className="text-4xl font-bold text-blue-500 dark:text-blue-400 mb-2">
                            {score}/{quizzes.length}
                          </div>
                          <div className="text-lg text-gray-600 dark:text-gray-400">
                            {Math.round((score / quizzes.length) * 100)}% Correct
                          </div>
                        </motion.div>
                        <div className="space-y-4">
                          {quizzes.map((quiz, index) => (
                            <motion.div
                              key={index}
                              initial={{ x: -20, opacity: 0 }}
                              animate={{ x: 0, opacity: 1 }}
                              transition={{ delay: 0.5 + index * 0.1 }}
                              className={`p-4 rounded-lg ${
                                quiz.userAnswer === quiz.correctAnswer
                                  ? 'bg-green-50 dark:bg-green-900/30'
                                  : 'bg-red-50 dark:bg-red-900/30'
                              }`}
                            >
                              <p className="font-medium text-gray-900 dark:text-white mb-2">
                                {quiz.question}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Your answer: {quiz.options[quiz.userAnswer || 0]}
                              </p>
                              {quiz.userAnswer !== quiz.correctAnswer && (
                                <motion.p
                                  initial={{ y: 10, opacity: 0 }}
                                  animate={{ y: 0, opacity: 1 }}
                                  transition={{ delay: 0.6 + index * 0.1 }}
                                  className="text-sm text-green-600 dark:text-green-400"
                                >
                                  Correct answer: {quiz.options[quiz.correctAnswer]}
                                </motion.p>
                              )}
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          )}

          {/* Generate Quiz Button */}
          {files.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="sticky bottom-0 pt-4 bg-gradient-to-t from-white dark:from-gray-900 to-transparent"
            >
              <div className="flex flex-col gap-4 mb-4">
                <div className="flex items-center gap-4">
                  <label htmlFor="numQuestions" className="text-gray-700 dark:text-gray-300">
                    Number of Questions:
                  </label>
                  <input
                    type="number"
                    id="numQuestions"
                    min="1"
                    max={getMaxQuestions()}
                    value={numQuestions}
                    onChange={handleNumQuestionsChange}
                    className="w-20 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Max: {getMaxQuestions()} ({user?.plan ? user.plan.charAt(0).toUpperCase() + user.plan.slice(1) : 'Basic'} Plan)
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
                  onClick={handleGenerateQuizzes}
                  disabled={isProcessing}
                  className="w-full px-8 py-4 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg shadow-lg hover:shadow-xl"
                >
                  {isProcessing ? (
                    <>
                      <FiLoader className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Generate Quiz'
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

export default QuizzesPage; 