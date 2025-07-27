import { useState, useCallback } from 'react';
import { screenshotService, ScreenshotOptions, ScreenshotResult, ScreenshotMode } from '@/shared/services/screenshotService';
import { useToast } from '@/hooks/use-toast';

export interface UseScreenshotOptions {
  onSuccess?: (result: ScreenshotResult) => void;
  onError?: (error: string) => void;
  autoDownload?: boolean;
  autoCopy?: boolean;
}

export const useScreenshot = (options: UseScreenshotOptions = {}) => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [lastResult, setLastResult] = useState<ScreenshotResult | null>(null);
  const { toast } = useToast();

  const captureScreenshot = useCallback(async (
    mode: ScreenshotMode,
    coordinates?: { x: number; y: number; width: number; height: number }
  ) => {
    setIsCapturing(true);
    
    try {
      const screenshotOptions: ScreenshotOptions = {
        mode,
        coordinates,
        filename: `logtrace-${mode}-${Date.now()}`,
        quality: 1.0,
        format: 'png'
      };

      const result = await screenshotService.captureScreenshot(screenshotOptions);

      if (result.success) {
        setLastResult(result);
        
        // Auto-download if enabled
        if (options.autoDownload) {
          screenshotService.downloadScreenshot(result);
          toast({
            title: 'Screenshot Saved',
            description: `Screenshot saved as ${result.filename}`,
            variant: 'success'
          });
        }

        // Auto-copy if enabled
        if (options.autoCopy) {
          const copied = await screenshotService.copyToClipboard(result);
          if (copied) {
            toast({
              title: 'Screenshot Copied',
              description: 'Screenshot copied to clipboard',
              variant: 'success'
            });
          }
        }

        options.onSuccess?.(result);
      } else {
        throw new Error(result.error || 'Screenshot capture failed');
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Screenshot capture failed:', error);
      
      toast({
        title: 'Screenshot Failed',
        description: errorMessage,
        variant: 'destructive'
      });

      options.onError?.(errorMessage);
    } finally {
      setIsCapturing(false);
    }
  }, [options, toast]);

  const downloadScreenshot = useCallback((result?: ScreenshotResult) => {
    const targetResult = result || lastResult;
    if (!targetResult) {
      toast({
        title: 'No Screenshot',
        description: 'No screenshot available to download',
        variant: 'destructive'
      });
      return;
    }

    try {
      screenshotService.downloadScreenshot(targetResult);
      toast({
        title: 'Screenshot Downloaded',
        description: `Screenshot saved as ${targetResult.filename}`,
        variant: 'success'
      });
    } catch (error) {
      toast({
        title: 'Download Failed',
        description: 'Failed to download screenshot',
        variant: 'destructive'
      });
    }
  }, [lastResult, toast]);

  const copyToClipboard = useCallback(async (result?: ScreenshotResult) => {
    const targetResult = result || lastResult;
    if (!targetResult) {
      toast({
        title: 'No Screenshot',
        description: 'No screenshot available to copy',
        variant: 'destructive'
      });
      return false;
    }

    try {
      const success = await screenshotService.copyToClipboard(targetResult);
      if (success) {
        toast({
          title: 'Screenshot Copied',
          description: 'Screenshot copied to clipboard',
          variant: 'success'
        });
      } else {
        toast({
          title: 'Copy Failed',
          description: 'Failed to copy screenshot to clipboard',
          variant: 'destructive'
        });
      }
      return success;
    } catch (error) {
      toast({
        title: 'Copy Failed',
        description: 'Failed to copy screenshot to clipboard',
        variant: 'destructive'
      });
      return false;
    }
  }, [lastResult, toast]);

  const getPreview = useCallback(async (result?: ScreenshotResult, maxWidth = 200, maxHeight = 200) => {
    const targetResult = result || lastResult;
    if (!targetResult) return '';

    try {
      return await screenshotService.getPreview(targetResult, maxWidth, maxHeight);
    } catch (error) {
      console.error('Failed to generate preview:', error);
      return '';
    }
  }, [lastResult]);

  // Convenience methods for each screenshot mode
  const captureRectangle = useCallback((coordinates: { x: number; y: number; width: number; height: number }) => {
    return captureScreenshot('rectangle', coordinates);
  }, [captureScreenshot]);

  const captureWindow = useCallback(() => {
    return captureScreenshot('window');
  }, [captureScreenshot]);

  const captureFullscreen = useCallback(() => {
    return captureScreenshot('fullscreen');
  }, [captureScreenshot]);

  const captureFreeform = useCallback((coordinates: { x: number; y: number; width: number; height: number }) => {
    return captureScreenshot('freeform', coordinates);
  }, [captureScreenshot]);

  return {
    // State
    isCapturing,
    lastResult,
    
    // Main capture method
    captureScreenshot,
    
    // Convenience methods
    captureRectangle,
    captureWindow,
    captureFullscreen,
    captureFreeform,
    
    // Utility methods
    downloadScreenshot,
    copyToClipboard,
    getPreview,
    
    // Service access
    screenshotService
  };
}; 