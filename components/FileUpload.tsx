'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiUpload,
  FiFileText,
  FiVideo,
  FiImage,
  FiX,
  FiCheckCircle,
  FiAlertCircle,
} from 'react-icons/fi';
import { arrayUnion, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useStore } from '@/app/store';
import { ID, storage } from '@/lib/appwrite';
import { toast } from 'react-toastify';

interface UploadFile {
  id: string;
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
}

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_FILE_TYPES = {
  'application/pdf': ['.pdf'],
  'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'application/vnd.ms-excel': ['.xls'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
  'text/plain': ['.txt'],
};

const FileUpload = () => {


    const [files, setFiles] = useState<UploadFile[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const {user,userFirestoreID} = useStore()
  
    const validateFile = (file: File): string | undefined => {
      if (file.size > MAX_FILE_SIZE) {
        return 'File size exceeds 50MB limit';
      }
  
      const fileType = file.type;
      const extension = '.' + file.name.split('.').pop()?.toLowerCase();
  
      if (!extension) {
        return 'Invalid file type';
      }
  
      const allowedExtensions = ALLOWED_FILE_TYPES[fileType as keyof typeof ALLOWED_FILE_TYPES];
      if (!allowedExtensions?.includes(extension)) {
        return 'File type not supported';
      }
  
      return undefined;
    };
  
    const handleFiles = useCallback((newFiles: FileList | File[]) => {
      const validFiles: UploadFile[] = Array.from(newFiles).map((file) => {
        const error = validateFile(file);
        return {
          id: Math.random().toString(36).substr(2, 9),
          file,
          progress: 0,
          status: error ? 'error' : 'pending',
          error,
        };
      });
  
      setFiles((prev) => [...prev, ...validFiles]);
  
      // Simulate upload for valid files
      validFiles.forEach((file) => {
        if (file.status === 'pending') {
          simulateUpload(file.id);
        }
      });
    }, []);
  
    const simulateUpload = (fileId: string) => {
      setFiles((prev) =>
        prev.map((file) =>
          file.id === fileId ? { ...file, status: 'uploading' } : file
        )
      );
  
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 30;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          setFiles((prev) =>
            prev.map((file) =>
              file.id === fileId
                ? { ...file, progress: 100, status: 'completed' }
                : file
            )
          );
        } else {
          setFiles((prev) =>
            prev.map((file) =>
              file.id === fileId ? { ...file, progress } : file
            )
          );
        }
      }, 500);
    };
  
    const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(true);
    };
  
    const handleDragLeave = (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
    };
  
    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      handleFiles(e.dataTransfer.files);
    };
  
    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        handleFiles(e.target.files);
      }
    };
  
    const removeFile = (fileId: string) => {
      setFiles((prev) => prev.filter((file) => file.id !== fileId));
    };
  
    const formatFileSize = (bytes: number) => {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };
  
    const handleUpload = async () => {
      const uploadedFilesID: string[] = [];
     
      try {

        const uploadPromises = files.map(async (file) => {
          const data = await storage.createFile(
            '67e2b1810025c19fe63b', // Your storage bucket ID
            ID.unique(), // Unique ID for the file
            file.file
          );

          uploadedFilesID.push(data.$id)

          return data
        });
        
        const uploadedFiles = await Promise.all(uploadPromises);
        setFiles([]);
  
        
        const addFilesToUser = async () => {
          try {
            if (!user?.id) {
              console.error("Error: userFirestoreId is undefined.");
              return;
            }
            if (!uploadedFilesID || uploadedFilesID.length === 0) {
              console.error("Error: No files to upload.");
              return;
            }
        
            if(userFirestoreID){
              const userDocRef = doc(db, "users", userFirestoreID); 
              await updateDoc(userDocRef, {
                fileUploads: arrayUnion(...uploadedFilesID),
                NoFileUploads:  user?.NoFileUploads + uploadedFiles.length
              });
            } else{
              console.log('fireStore id is no found')
              toast.error('failed to update user data')
            }

            toast.success('Files Uploaded Successfully!')
        
          } catch (error) {
            console.error("Error adding file URLs:", error);
          }
        };
  
        addFilesToUser()
      
      } catch (error) {
        console.log('error while uploading th file' , error)
        toast.error('couldnot uploade file' )
      } 
    };

  return (
    <>
         {/* Upload Area */}
      <div
          className={`relative border-2 border-dashed rounded-2xl p-12 transition-all flex flex-col justify-center items-center duration-300 ease-in-out text-center
            ${isDragging
              ? 'border-blue-500 bg-blue-500/10'
              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 bg-white dark:bg-gray-800/50'
            }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          multiple
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          onChange={handleFileInput}
        />
             <div className="w-20 h-20 rounded-full bg-blue-500/10 flex items-center justify-center mb-4">
              <FiUpload className="w-10 h-10 text-blue-500" />
            </div>

        <div className="mt-4">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Drag and drop your files here, or{' '}
            <span className="text-teal-500 hover:text-teal-600 dark:hover:text-teal-400">
              browse
            </span>
          </p>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Supported formats: PDF, DOC, DOCX, XLS, XLSX, TXT, PNG, JPG, GIF
          </p>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Maximum file size: 50MB
          </p>
        </div>
      </div>

      {/* File List */}
      <div className="mt-8 space-y-4">
        <AnimatePresence>
          {files.map((file) => (
            <motion.div
              key={file.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {file.file.type.startsWith('image/') ? (
                    <FiImage className="h-8 w-8 text-blue-500" />
                  ) : file.file.type.startsWith('video/') ? (
                    <FiVideo className="h-8 w-8 text-purple-500" />
                  ) : (
                    <FiFileText className="h-8 w-8 text-gray-500" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {file.file.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatFileSize(file.file.size)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => removeFile(file.id)}
                  className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <FiX className="h-5 w-5 text-gray-400" />
                </button>
              </div>

              {file.status === 'error' && (
                <div className="mt-2 flex items-center text-sm text-red-600 dark:text-red-400">
                  <FiAlertCircle className="h-4 w-4 mr-1" />
                  {file.error}
                </div>
              )}

              {file.status === 'uploading' && (
                <div className="mt-2">
                  <div className="h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-teal-500 transition-all duration-300"
                      style={{ width: `${file.progress}%` }}
                    />
                  </div>
                  <div className="mt-1 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>Uploading...</span>
                    <span>{Math.round(file.progress)}%</span>
                  </div>
                </div>
              )}

              {file.status === 'completed' && (
                <div className="mt-2 flex items-center text-sm text-green-600 dark:text-green-400">
                  <FiCheckCircle className="h-4 w-4 mr-1" />
                  Upload completed
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Upload Button */}
      {files.length > 0 && (
        <div className="mt-8 flex justify-end">
          <button
            onClick={handleUpload}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
          >
            Upload All Files
          </button>
        </div>
      )}
    </>
  )
}

export default FileUpload