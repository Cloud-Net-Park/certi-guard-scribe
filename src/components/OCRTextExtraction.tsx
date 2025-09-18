import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, EyeOff, Copy, Check } from 'lucide-react';

interface OCRTextExtractionProps {
  extractedText: string;
  similarity: number;
  onTemplateCompare: () => void;
  isComparing: boolean;
}

export const OCRTextExtraction = ({ 
  extractedText, 
  similarity, 
  onTemplateCompare, 
  isComparing 
}: OCRTextExtractionProps) => {
  const [showFullText, setShowFullText] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(extractedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const truncatedText = extractedText.length > 200 
    ? extractedText.substring(0, 200) + "..." 
    : extractedText;

  const getSimilarityColor = (score: number) => {
    if (score >= 90) return 'text-success bg-success/10 border-success/20';
    if (score >= 70) return 'text-warning bg-warning/10 border-warning/20';
    return 'text-destructive bg-destructive/10 border-destructive/20';
  };

  return (
    <Card className="p-6 bg-verification-card border-verification-border">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">
            OCR Text Extraction
          </h3>
          <div className="flex items-center space-x-2">
            {similarity > 0 && (
              <Badge className={`px-3 py-1 ${getSimilarityColor(similarity)}`}>
                {similarity}% Match
              </Badge>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">
              Extracted Text ({extractedText.length} characters)
            </span>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFullText(!showFullText)}
                className="text-muted-foreground hover:text-foreground"
              >
                {showFullText ? (
                  <>
                    <EyeOff className="h-4 w-4 mr-1" />
                    Collapse
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4 mr-1" />
                    Expand
                  </>
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                className="text-muted-foreground hover:text-foreground"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 mr-1" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-1" />
                    Copy
                  </>
                )}
              </Button>
            </div>
          </div>

          <Textarea
            value={showFullText ? extractedText : truncatedText}
            readOnly
            className="min-h-[120px] bg-muted/20 border-muted font-mono text-sm resize-none"
            placeholder="Extracted text will appear here..."
          />
        </div>

        <div className="flex justify-between items-center pt-2">
          <div className="text-sm text-muted-foreground">
            Text extraction completed using advanced OCR processing
          </div>
          <Button
            onClick={onTemplateCompare}
            disabled={isComparing}
            variant="outline"
            size="sm"
          >
            {isComparing ? 'Comparing...' : 'Compare with Template'}
          </Button>
        </div>
      </div>
    </Card>
  );
};