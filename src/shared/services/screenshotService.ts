import html2canvas from 'html2canvas';

export type ScreenshotMode = 'rectangle' | 'window' | 'fullscreen' | 'freeform';

export interface ScreenshotOptions {
  mode: ScreenshotMode;
  coordinates?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  filename?: string;
  quality?: number;
  format?: 'png' | 'jpeg';
}

export interface ScreenshotResult {
  dataUrl: string;
  blob?: Blob;
  filename: string;
  success: boolean;
  error?: string;
}

class ScreenshotService {
  /**
   * Capture screenshot based on the specified mode
   */
  async captureScreenshot(options: ScreenshotOptions): Promise<ScreenshotResult> {
    try {
      let canvas: HTMLCanvasElement;
      let filename = options.filename || `screenshot-${Date.now()}`;

      switch (options.mode) {
        case 'rectangle':
          canvas = await this.captureRectangle(options.coordinates!);
          filename = `rectangle-${filename}`;
          break;
        
        case 'window':
          canvas = await this.captureWindow();
          filename = `window-${filename}`;
          break;
        
        case 'fullscreen':
          canvas = await this.captureFullscreen();
          filename = `fullscreen-${filename}`;
          break;
        
        case 'freeform':
          canvas = await this.captureFreeform(options.coordinates!);
          filename = `freeform-${filename}`;
          break;
        
        default:
          throw new Error(`Unknown screenshot mode: ${options.mode}`);
      }

      const dataUrl = canvas.toDataURL(`image/${options.format || 'png'}`, options.quality || 1.0);
      
      // Convert to blob for download
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => {
          resolve(blob!);
        }, `image/${options.format || 'png'}`, options.quality || 1.0);
      });

      return {
        dataUrl,
        blob,
        filename: `${filename}.${options.format || 'png'}`,
        success: true
      };

    } catch (error) {
      console.error('Screenshot capture failed:', error);
      return {
        dataUrl: '',
        filename: options.filename || `screenshot-${Date.now()}`,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }



  /**
   * Capture a rectangular area
   */
  private async captureRectangle(coordinates: { x: number; y: number; width: number; height: number }): Promise<HTMLCanvasElement> {
    const { x, y, width, height } = coordinates;

    if (width <= 0 || height <= 0) {
      throw new Error('Invalid rectangle dimensions');
    }

    const canvas = await html2canvas(document.body, {
      backgroundColor: null,
      scale: 1,
      useCORS: true,
      allowTaint: true,
      foreignObjectRendering: true,
      removeContainer: true,
      logging: false,
      x,
      y,
      width,
      height
    });

    return canvas;
  }

  /**
   * Capture the current viewport/window
   */
  private async captureWindow(): Promise<HTMLCanvasElement> {
    const canvas = await html2canvas(document.documentElement, {
      backgroundColor: null,
      scale: 1,
      useCORS: true,
      allowTaint: true,
      foreignObjectRendering: true,
      removeContainer: true,
      logging: false,
      width: window.innerWidth,
      height: window.innerHeight,
      scrollX: window.scrollX,
      scrollY: window.scrollY
    });

    return canvas;
  }

  /**
   * Capture the entire page (fullscreen)
   */
  private async captureFullscreen(): Promise<HTMLCanvasElement> {
    const canvas = await html2canvas(document.body, {
      backgroundColor: null,
      scale: 1,
      useCORS: true,
      allowTaint: true,
      foreignObjectRendering: true,
      removeContainer: true,
      logging: false,
      width: document.documentElement.scrollWidth,
      height: document.documentElement.scrollHeight,
      scrollX: 0,
      scrollY: 0
    });

    return canvas;
  }

  /**
   * Capture a freeform area (uses rectangle capture with calculated bounds)
   */
  private async captureFreeform(coordinates: { x: number; y: number; width: number; height: number }): Promise<HTMLCanvasElement> {
    // Freeform capture uses the same logic as rectangle capture
    // The coordinates should be calculated from the freeform drawing points
    return this.captureRectangle(coordinates);
  }

  /**
   * Download screenshot as file
   */
  downloadScreenshot(result: ScreenshotResult): void {
    if (!result.success || !result.blob) {
      throw new Error('Cannot download failed screenshot');
    }

    const url = URL.createObjectURL(result.blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = result.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Copy screenshot to clipboard
   */
  async copyToClipboard(result: ScreenshotResult): Promise<boolean> {
    if (!result.success || !result.blob) {
      return false;
    }

    try {
      // For modern browsers
      if (navigator.clipboard && navigator.clipboard.write) {
        const clipboardItem = new ClipboardItem({
          [result.blob.type]: result.blob
        });
        await navigator.clipboard.write([clipboardItem]);
        return true;
      }
      
      // Fallback for older browsers
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      return new Promise((resolve) => {
        img.onload = () => {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx?.drawImage(img, 0, 0);
          
          canvas.toBlob((blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = result.filename;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              URL.revokeObjectURL(url);
              resolve(true);
            } else {
              resolve(false);
            }
          });
        };
        img.src = result.dataUrl;
      });
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      return false;
    }
  }

  /**
   * Get screenshot preview (smaller version for UI)
   */
  async getPreview(result: ScreenshotResult, maxWidth: number = 200, maxHeight: number = 200): Promise<string> {
    if (!result.success) {
      return '';
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    return new Promise((resolve) => {
      img.onload = () => {
        const { width, height } = this.calculateAspectRatioFit(img.width, img.height, maxWidth, maxHeight);
        
        canvas.width = width;
        canvas.height = height;
        
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.src = result.dataUrl;
    });
  }

  /**
   * Calculate aspect ratio for preview
   */
  private calculateAspectRatioFit(srcWidth: number, srcHeight: number, maxWidth: number, maxHeight: number) {
    const ratio = Math.min(maxWidth / srcWidth, maxHeight / srcHeight);
    return {
      width: srcWidth * ratio,
      height: srcHeight * ratio
    };
  }
}

// Export singleton instance
export const screenshotService = new ScreenshotService();
export default screenshotService; 