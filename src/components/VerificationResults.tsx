import { CheckCircle, XCircle, AlertTriangle, Download, Eye } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export interface VerificationResult {
  certificateId: string;
  studentName: string;
  institutionName: string;
  ocrSimilarity: number;
  apiValidation: {
    certificateExists: boolean;
    studentDetailsMatch: boolean;
    issueDateVerified: boolean;
    institutionVerified: boolean;
  };
  textAnalysis: {
    extractedText: string;
    templateMatchScore: number;
    suspiciousChanges: string[];
  };
  finalStatus: 'Valid' | 'Invalid' | 'Suspicious';
  verificationTimestamp: string;
  processingTime: number;
}

interface VerificationResultsProps {
  result: VerificationResult;
  onDownloadReport: () => void;
  onViewDetails: () => void;
}

export const VerificationResults = ({ result, onDownloadReport, onViewDetails }: VerificationResultsProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Valid':
        return 'text-success bg-success/10 border-success/20';
      case 'Invalid':
        return 'text-destructive bg-destructive/10 border-destructive/20';
      case 'Suspicious':
        return 'text-warning bg-warning/10 border-warning/20';
      default:
        return 'text-muted-foreground bg-muted/10 border-muted/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Valid':
        return <CheckCircle className="h-5 w-5 text-success" />;
      case 'Invalid':
        return <XCircle className="h-5 w-5 text-destructive" />;
      case 'Suspicious':
        return <AlertTriangle className="h-5 w-5 text-warning" />;
      default:
        return null;
    }
  };

  const validationChecks = [
    { label: 'Certificate Exists', value: result.apiValidation.certificateExists },
    { label: 'Student Details Match', value: result.apiValidation.studentDetailsMatch },
    { label: 'Issue Date Verified', value: result.apiValidation.issueDateVerified },
    { label: 'Institution Verified', value: result.apiValidation.institutionVerified },
  ];

  return (
    <Card className="p-6 bg-verification-card border-verification-border">
      <div className="space-y-6">
        {/* Status Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {getStatusIcon(result.finalStatus)}
            <div>
              <h3 className="text-xl font-bold text-foreground">
                Verification Complete
              </h3>
              <p className="text-muted-foreground">
                ID: {result.certificateId}
              </p>
            </div>
          </div>
          <Badge className={`px-4 py-2 text-sm font-semibold ${getStatusColor(result.finalStatus)}`}>
            {result.finalStatus}
          </Badge>
        </div>

        <Separator />

        {/* Certificate Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-foreground mb-3">Certificate Details</h4>
            <div className="space-y-2">
              <div>
                <span className="text-sm text-muted-foreground">Student Name:</span>
                <p className="font-medium text-foreground">{result.studentName}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Institution:</span>
                <p className="font-medium text-foreground">{result.institutionName}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Processing Time:</span>
                <p className="font-medium text-foreground">{result.processingTime}s</p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-3">Analysis Results</h4>
            <div className="space-y-2">
              <div>
                <span className="text-sm text-muted-foreground">OCR Similarity:</span>
                <div className="flex items-center space-x-2">
                  <p className="font-medium text-foreground">{result.ocrSimilarity}%</p>
                  <Badge variant={result.ocrSimilarity > 90 ? "default" : "destructive"}>
                    {result.ocrSimilarity > 90 ? "Excellent" : "Poor"}
                  </Badge>
                </div>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Template Match:</span>
                <div className="flex items-center space-x-2">
                  <p className="font-medium text-foreground">{result.textAnalysis.templateMatchScore}%</p>
                  <Badge variant={result.textAnalysis.templateMatchScore > 85 ? "default" : "destructive"}>
                    {result.textAnalysis.templateMatchScore > 85 ? "Match" : "Mismatch"}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* API Validation Results */}
        <div>
          <h4 className="font-semibold text-foreground mb-3">Official Database Validation</h4>
          <div className="grid grid-cols-2 gap-3">
            {validationChecks.map((check, index) => (
              <div key={index} className="flex items-center space-x-2">
                {check.value ? (
                  <CheckCircle className="h-4 w-4 text-success" />
                ) : (
                  <XCircle className="h-4 w-4 text-destructive" />
                )}
                <span className="text-sm text-foreground">{check.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Suspicious Changes */}
        {result.textAnalysis.suspiciousChanges.length > 0 && (
          <>
            <Separator />
            <div>
              <h4 className="font-semibold text-foreground mb-3 flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-warning" />
                <span>Suspicious Changes Detected</span>
              </h4>
              <ul className="space-y-1">
                {result.textAnalysis.suspiciousChanges.map((change, index) => (
                  <li key={index} className="text-sm text-warning flex items-center space-x-2">
                    <div className="w-1 h-1 bg-warning rounded-full" />
                    <span>{change}</span>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}

        <Separator />

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button onClick={onDownloadReport} className="flex items-center space-x-2">
            <Download className="h-4 w-4" />
            <span>Download Report</span>
          </Button>
          <Button variant="outline" onClick={onViewDetails} className="flex items-center space-x-2">
            <Eye className="h-4 w-4" />
            <span>View Detailed Analysis</span>
          </Button>
        </div>
      </div>
    </Card>
  );
};