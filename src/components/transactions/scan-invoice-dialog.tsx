"use client";

import { useState, useRef } from 'react';
import { scanReceipt } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Camera, Upload, Loader2, Sparkles, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Transaction } from '@/lib/types';
import { Badge } from '@/components/ui/badge';

type ScanInvoiceDialogProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (transaction: Omit<Transaction, 'id'>) => void;
};

export default function ScanInvoiceDialog({ isOpen, onOpenChange, onConfirm }: ScanInvoiceDialogProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setPreviewUrl(base64String);
      processImage(base64String);
    };
    reader.readAsDataURL(file);
  };

  const processImage = async (dataUri: string) => {
    setIsProcessing(true);
    setExtractedData(null);
    
    const result = await scanReceipt({ photoDataUri: dataUri });
    
    if (result.success && result.data) {
      setExtractedData(result.data);
      toast({
        title: "Scan Complete",
        description: "AI has extracted the transaction details.",
      });
    } else {
      toast({
        variant: "destructive",
        title: "Scan Failed",
        description: result.error || "Could not read the receipt. Please try another photo.",
      });
      setPreviewUrl(null);
    }
    setIsProcessing(false);
  };

  const handleConfirm = () => {
    if (!extractedData) return;
    
    onConfirm({
      type: extractedData.type,
      description: extractedData.description,
      amount: extractedData.amount,
      category: extractedData.category,
      date: extractedData.date,
    });
    
    onOpenChange(false);
    reset();
  };

  const reset = () => {
    setPreviewUrl(null);
    setExtractedData(null);
    setIsProcessing(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) reset();
      onOpenChange(open);
    }}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Receipt Scanner
          </DialogTitle>
          <DialogDescription>
            Snap a photo or upload a receipt to automatically log a transaction.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center gap-6 py-4">
          {!previewUrl ? (
            <div 
              className="flex flex-col items-center justify-center w-full aspect-video border-2 border-dashed rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="p-4 bg-background rounded-full shadow-sm mb-4">
                <Camera className="h-8 w-8 text-primary" />
              </div>
              <p className="text-sm font-medium">Click to capture or upload</p>
              <p className="text-xs text-muted-foreground mt-1">Supports JPG, PNG</p>
            </div>
          ) : (
            <div className="relative w-full aspect-video rounded-xl overflow-hidden border">
              <img src={previewUrl} alt="Receipt preview" className="w-full h-full object-cover" />
              {isProcessing && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center text-white p-6 text-center">
                  <Loader2 className="h-10 w-10 animate-spin mb-4" />
                  <p className="font-bold text-lg animate-pulse">Extracting Data...</p>
                  <p className="text-xs opacity-80 mt-2">Our AI is reading the receipt totals and vendor info.</p>
                </div>
              )}
            </div>
          )}

          {extractedData && (
            <div className="w-full space-y-4 animate-in fade-in slide-in-from-bottom-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground">Vendor</p>
                  <p className="font-semibold truncate">{extractedData.description}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground">Amount</p>
                  <p className="font-bold text-lg text-primary">${extractedData.amount.toFixed(2)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground">Category</p>
                  <Badge variant="outline">{extractedData.category}</Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground">Date</p>
                  <p className="text-sm">{extractedData.date}</p>
                </div>
              </div>
            </div>
          )}

          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*" 
            onChange={handleFileChange}
            capture="environment"
          />
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          {!extractedData ? (
            <Button variant="outline" className="w-full" onClick={() => fileInputRef.current?.click()}>
              <Upload className="mr-2 h-4 w-4" /> Upload Manually
            </Button>
          ) : (
            <>
              <Button variant="ghost" className="w-full" onClick={reset}>Retake</Button>
              <Button className="w-full" onClick={handleConfirm}>
                <CheckCircle2 className="mr-2 h-4 w-4" /> Log Transaction
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
