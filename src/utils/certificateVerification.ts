// Certificate verification utilities

export interface CertificateTemplate {
  id: string;
  name: string;
  templateText: string;
  institution: string;
  requiredFields: string[];
}

export interface OCRResult {
  extractedText: string;
  confidence: number;
  processingTime: number;
}

export interface ValidationResponse {
  certificateExists: boolean;
  studentDetailsMatch: boolean;
  issueDateVerified: boolean;
  institutionVerified: boolean;
  certificateId: string;
  studentName: string;
  institutionName: string;
}

// Sample certificate template for comparison
export const SAMPLE_TEMPLATE: CertificateTemplate = {
  id: "UNIV-TEMPLATE-001",
  name: "University Degree Template",
  templateText: `UNIVERSITY OF TECHNOLOGY
CERTIFICATE OF GRADUATION
This is to certify that
[STUDENT_NAME]
has successfully completed the requirements
for the degree of
[DEGREE_TYPE]
in
[FIELD_OF_STUDY]
Date of Graduation: [GRADUATION_DATE]
Certificate Number: [CERTIFICATE_NUMBER]
[UNIVERSITY_SEAL]
Registrar Signature
Dean Signature`,
  institution: "University of Technology",
  requiredFields: ["STUDENT_NAME", "DEGREE_TYPE", "FIELD_OF_STUDY", "GRADUATION_DATE", "CERTIFICATE_NUMBER"]
};

// Simulate OCR text extraction
export const simulateOCRExtraction = async (file: File): Promise<OCRResult> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Simulate OCR extraction with sample text
      const extractedText = `UNIVERSITY OF TECHNOLOGY
CERTIFICATE OF GRADUATION
This is to certify that
JOHN MICHAEL SMITH
has successfully completed the requirements
for the degree of
BACHELOR OF SCIENCE
in
COMPUTER SCIENCE
Date of Graduation: June 15, 2023
Certificate Number: UNIV2023-12345
[UNIVERSITY SEAL]
Registrar Signature
Dean Signature`;

      resolve({
        extractedText,
        confidence: 94.2,
        processingTime: 2.8
      });
    }, 3000); // Simulate processing time
  });
};

// Calculate text similarity using Levenshtein-like algorithm
export const calculateTextSimilarity = (text1: string, text2: string): number => {
  const normalize = (text: string) => 
    text.toLowerCase()
        .replace(/\s+/g, ' ')
        .replace(/[^\w\s]/g, '')
        .trim();

  const normalizedText1 = normalize(text1);
  const normalizedText2 = normalize(text2);

  if (normalizedText1 === normalizedText2) return 100;

  const words1 = normalizedText1.split(' ');
  const words2 = normalizedText2.split(' ');
  
  const commonWords = words1.filter(word => words2.includes(word));
  const totalWords = Math.max(words1.length, words2.length);
  
  const similarity = (commonWords.length / totalWords) * 100;
  
  // Add some randomness to simulate real OCR variations
  const variation = Math.random() * 10 - 5; // ±5%
  return Math.max(0, Math.min(100, similarity + variation));
};

// Simulate government API validation
export const simulateAPIValidation = async (certificateId: string): Promise<ValidationResponse> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Simulate API response
      const isValid = Math.random() > 0.2; // 80% chance of being valid for demo
      
      resolve({
        certificateExists: isValid,
        studentDetailsMatch: isValid,
        issueDateVerified: isValid,
        institutionVerified: true,
        certificateId: "UNIV2023-12345",
        studentName: "John Michael Smith",
        institutionName: "University of Technology"
      });
    }, 2000);
  });
};

// Detect suspicious changes in text
export const detectSuspiciousChanges = (originalText: string, extractedText: string): string[] => {
  const suspiciousChanges: string[] = [];
  
  // Simple detection logic - in real implementation, this would be more sophisticated
  if (originalText.includes("BACHELOR") && extractedText.includes("MASTER")) {
    suspiciousChanges.push("Degree type appears to have been altered");
  }
  
  if (originalText.includes("2023") && extractedText.includes("2024")) {
    suspiciousChanges.push("Graduation date may have been modified");
  }
  
  const originalGPA = originalText.match(/GPA[:\s]*([\d.]+)/i);
  const extractedGPA = extractedText.match(/GPA[:\s]*([\d.]+)/i);
  
  if (originalGPA && extractedGPA && originalGPA[1] !== extractedGPA[1]) {
    suspiciousChanges.push("GPA value shows potential tampering");
  }
  
  return suspiciousChanges;
};

// Generate verification report
export const generateVerificationReport = async (
  ocrResult: OCRResult,
  templateSimilarity: number,
  apiValidation: ValidationResponse,
  suspiciousChanges: string[]
) => {
  const overallScore = (templateSimilarity + ocrResult.confidence + 
    (apiValidation.certificateExists ? 100 : 0) + 
    (apiValidation.studentDetailsMatch ? 100 : 0)) / 4;

  let finalStatus: 'Valid' | 'Invalid' | 'Suspicious';
  
  if (suspiciousChanges.length > 0) {
    finalStatus = 'Suspicious';
  } else if (overallScore >= 80 && apiValidation.certificateExists) {
    finalStatus = 'Valid';
  } else {
    finalStatus = 'Invalid';
  }

  return {
    certificateId: apiValidation.certificateId,
    studentName: apiValidation.studentName,
    institutionName: apiValidation.institutionName,
    ocrSimilarity: Math.round(templateSimilarity * 10) / 10,
    apiValidation,
    textAnalysis: {
      extractedText: ocrResult.extractedText,
      templateMatchScore: Math.round(templateSimilarity * 10) / 10,
      suspiciousChanges
    },
    finalStatus,
    verificationTimestamp: new Date().toISOString(),
    processingTime: ocrResult.processingTime
  };
};