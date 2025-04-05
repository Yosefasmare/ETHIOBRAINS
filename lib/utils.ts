import { collection, addDoc, query, where, getDocs } from "firebase/firestore"; 
import { db } from "./firebase";
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";
import mammoth from "mammoth";
import * as XLSX from "xlsx";

interface UserData {
    authId: string;
    name: string;
    email: string;
    profilePicUrl: string;
    plan: string;
    fileUploads: null;
    createdAt:Date;
    NoFileUploads: number;
}


export const AddUserToFirestore = async  ({userdata}:{userdata: UserData }) => {
    try {
      await addDoc(collection(db, "users"), userdata);
    } catch (e) {
      console.error("Error adding document: ", e);
    }
}

export const getUserByFirebaseId = async (firebaseId: string) => {

  try {
    const usersRef = collection(db, "users"); // Reference to "users" collection
    const q = query(usersRef, where("authId", "==", firebaseId)); // Query to match `numberofHost`

    const querySnapshot = await getDocs(q);
    if(!querySnapshot.empty){
        return querySnapshot

    }else{
        return null
    }

   
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
};
 


 

if (typeof window !== 'undefined') {
  GlobalWorkerOptions.workerSrc = '/pdf.worker.mjs';  // points to the file in the public folder
}

export const extractTextFromPDF = async (file: File) => {
  const reader = new FileReader();

  return new Promise<string>((resolve, reject) => {
    reader.onload = async function () {
      const typedArray = new Uint8Array(reader.result as ArrayBuffer);
      const pdf = await getDocument(typedArray).promise;
      let text = "";

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map((item: any) => item.str).join(" ") + "\n";
      }

      resolve(text);
    };

    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
};

export const extractTextFromDOCX = async (file: File): Promise<string> => {
  const reader = new FileReader();

  return new Promise<string>((resolve, reject) => {
    reader.onload = async function () {
      try {
        // Convert the file into an ArrayBuffer
        const arrayBuffer = reader.result as ArrayBuffer;
        
        // Use mammoth to extract text
        const { value } = await mammoth.extractRawText({ arrayBuffer });
        
        resolve(value); // Return the extracted text
      } catch (error) {
        reject("Error extracting text from DOCX: " + error);
      }
    };

    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
};


export  const extractDataFromExcel = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = e.target?.result;
      if (data) {
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0]; // Assuming you're reading the first sheet
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 }); // Convert sheet to JSON (array of arrays)
        const extractedData = JSON.stringify(jsonData, null, 2); // Convert it to string for display
        resolve(extractedData);
      } else {
        reject("Error reading Excel data");
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
};


export const downloadFile = () =>{
  
}