import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { CertificateUpload } from '@/components/CertificateUpload';
import { VerificationProgress, VerificationStep } from '@/components/VerificationProgress';
import { OCRTextExtraction } from '@/components/OCRTextExtraction';
import { VerificationResults, VerificationResult } from '@/components/VerificationResults';
import { 
  simulateOCRExtraction, 
  calculateTextSimilarity, 
  simulateAPIValidation,
  detectSuspiciousChanges,
  generateVerificationReport,
  SAMPLE_TEMPLATE,
  type OCRResult,
  type ValidationResponse
} from '@/utils/certificateVerification';
import { Shield, FileCheck, Database, Download } from 'lucide-react';

const CertificateVerification = () => {
  const { toast } = useToast();
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [overallProgress, setOverallProgress] = useState(0);
  const [ocrResult, setOcrResult] = useState<OCRResult | null>(null);
  const [templateSimilarity, setTemplateSimilarity] = useState(0);
  const [apiValidation, setApiValidation] = useState<ValidationResponse | null>(null);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const [verificationSteps, setVerificationSteps] = useState<VerificationStep[]>([
    {
      id: 'upload',
      title: 'Document Upload',
      description: 'Upload certificate image for verification',
      status: 'pending'
    },
    {
      id: 'ocr',
      title: 'OCR Text Extraction',
      description: 'Extract text content using advanced OCR',
      status: 'pending'
    },
    {
      id: 'template',
      title: 'Template Comparison',
      description: 'Compare against original certificate template',
      status: 'pending'
    },
    {
      id: 'api',
      title: 'Database Validation',
      description: 'Verify with government education database',
      status: 'pending'
    },
    {
      id: 'report',
      title: 'Generate Report',
      description: 'Compile comprehensive verification results',
      status: 'pending'
    }
  ]);

  const updateStepStatus = (stepId: string, status: VerificationStep['status'], progress?: number) => {
    setVerificationSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, status, progress } : step
    ));
  };

  const handleFileUpload = (file: File) => {
    setUploadedFile(file);
    updateStepStatus('upload', 'completed');
    setCurrentStep(1);
    setOverallProgress(20);
    
    toast({
      title: "File Uploaded Successfully",
      description: `${file.name} is ready for verification`,
    });
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setCurrentStep(0);
    setOverallProgress(0);
    setOcrResult(null);
    setTemplateSimilarity(0);
    setApiValidation(null);
    setVerificationResult(null);
    setVerificationSteps(prev => prev.map(step => ({ ...step, status: 'pending', progress: undefined })));
  };

  const startVerification = async () => {
    if (!uploadedFile) return;

    setIsProcessing(true);
    
    try {
      // Step 1: OCR Extraction
      updateStepStatus('ocr', 'processing', 0);
      setCurrentStep(1);
      
      // Simulate OCR progress
      for (let progress = 0; progress <= 100; progress += 20) {
        updateStepStatus('ocr', 'processing', progress);
        await new Promise(resolve => setTimeout(resolve, 300));
      }
      
      const ocrData = await simulateOCRExtraction(uploadedFile);
      setOcrResult(ocrData);
      updateStepStatus('ocr', 'completed');
      setOverallProgress(40);

      // Step 2: Template Comparison
      updateStepStatus('template', 'processing', 0);
      setCurrentStep(2);
      
      for (let progress = 0; progress <= 100; progress += 25) {
        updateStepStatus('template', 'processing', progress);
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
      const similarity = calculateTextSimilarity(SAMPLE_TEMPLATE.templateText, ocrData.extractedText);
      setTemplateSimilarity(similarity);
      updateStepStatus('template', 'completed');
      setOverallProgress(60);

      // Step 3: API Validation
      updateStepStatus('api', 'processing', 0);
      setCurrentStep(3);
      
      for (let progress = 0; progress <= 100; progress += 20) {
        updateStepStatus('api', 'processing', progress);
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
      const apiData = await simulateAPIValidation("UNIV2023-12345");
      setApiValidation(apiData);
      updateStepStatus('api', 'completed');
      setOverallProgress(80);

      // Step 4: Generate Report
      updateStepStatus('report', 'processing', 0);
      setCurrentStep(4);
      
      for (let progress = 0; progress <= 100; progress += 33) {
        updateStepStatus('report', 'processing', progress);
        await new Promise(resolve => setTimeout(resolve, 150));
      }
      
      const suspiciousChanges = detectSuspiciousChanges(SAMPLE_TEMPLATE.templateText, ocrData.extractedText);
      const finalResult = await generateVerificationReport(ocrData, similarity, apiData, suspiciousChanges);
      
      setVerificationResult(finalResult);
      updateStepStatus('report', 'completed');
      setOverallProgress(100);

      toast({
        title: "Verification Complete",
        description: `Certificate status: ${finalResult.finalStatus}`,
        variant: finalResult.finalStatus === 'Valid' ? 'default' : 'destructive'
      });

    } catch (error) {
      toast({
        title: "Verification Failed",
        description: "An error occurred during verification",
        variant: "destructive"
      });
      
      // Mark current step as error
      const errorStepId = verificationSteps[currentStep]?.id;
      if (errorStepId) {
        updateStepStatus(errorStepId, 'error');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTemplateCompare = async () => {
    if (!ocrResult) return;
    
    const similarity = calculateTextSimilarity(SAMPLE_TEMPLATE.templateText, ocrResult.extractedText);
    setTemplateSimilarity(similarity);
    
    toast({
      title: "Template Comparison Complete",
      description: `Similarity score: ${similarity.toFixed(1)}%`,
    });
  };

  const handleDownloadReport = () => {
    if (!verificationResult) return;
    
    const reportData = {
      ...verificationResult,
      generatedAt: new Date().toISOString(),
      reportVersion: "1.0",
      verificationSystem: "Certificate Verification System v2.0"
    };
    
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `verification-report-${verificationResult.certificateId}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Report Downloaded",
      description: "Verification report saved successfully",
    });
  };

  const handleViewDetails = () => {
    toast({
      title: "Detailed Analysis",
      description: "Opening detailed verification analysis",
    });
  };

  return (
    <div className="min-h-screen bg-verification-bg">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Shield className="h-10 w-10 text-primary" />
            <h1 className="text-4xl font-bold text-foreground">
              Certificate Verification System
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Advanced document authentication using OCR extraction, template comparison, 
            and government database validation
          </p>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Upload Section */}
          <CertificateUpload
            onFileUpload={handleFileUpload}
            uploadedFile={uploadedFile}
            onRemoveFile={handleRemoveFile}
          />

          {/* Start Verification Button */}
          {uploadedFile && !isProcessing && !verificationResult && (
            <div className="text-center">
              <Button
                onClick={startVerification}
                size="lg"
                className="px-8 py-3 text-lg"
              >
                <FileCheck className="h-5 w-5 mr-2" />
                Start Verification Process
              </Button>
            </div>
          )}

          {/* Progress Section */}
          {(isProcessing || verificationResult) && (
            <VerificationProgress
              steps={verificationSteps}
              currentStep={currentStep}
              overallProgress={overallProgress}
            />
          )}

          {/* OCR Results */}
          {ocrResult && (
            <OCRTextExtraction
              extractedText={ocrResult.extractedText}
              similarity={templateSimilarity}
              onTemplateCompare={handleTemplateCompare}
              isComparing={false}
            />
          )}

          {/* Final Results */}
          {verificationResult && (
            <VerificationResults
              result={verificationResult}
              onDownloadReport={handleDownloadReport}
              onViewDetails={handleViewDetails}
            />
          )}

          {/* Template Information */}
          <Card className="p-6 bg-verification-card border-verification-border">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Database className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold text-foreground">
                  Certificate Template Database
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium text-muted-foreground">Active Templates:</span>
                  <p className="text-foreground">1,247</p>
                </div>
                <div>
                  <span className="font-medium text-muted-foreground">Verified Institutions:</span>
                  <p className="text-foreground">456</p>
                </div>
                <div>
                  <span className="font-medium text-muted-foreground">Success Rate:</span>
                  <p className="text-foreground">99.2%</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CertificateVerification;