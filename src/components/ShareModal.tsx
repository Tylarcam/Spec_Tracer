
import React from 'react';
import { X, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose }) => {
  const shareText = "Check out LogTrace - the ultimate AI-powered debugging tool for web developers! 🚀";
  const shareUrl = "https://logtrace.dev";

  const handleShare = (platform: string) => {
    let url = '';
    
    switch (platform) {
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
        break;
      case 'linkedin':
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
        break;
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        break;
    }
    
    if (url) {
      window.open(url, '_blank', 'width=600,height=400');
    }
    
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Share2 className="h-5 w-5 text-cyan-400" />
            Share LogTrace
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-slate-300">
            Share LogTrace with your network and earn +5 bonus credits for each platform!
          </p>
          
          <div className="grid grid-cols-1 gap-3">
            <Button
              onClick={() => handleShare('twitter')}
              className="bg-cyan-600 hover:bg-cyan-700 text-white"
            >
              Share on X (Twitter)
            </Button>
            <Button
              onClick={() => handleShare('linkedin')}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Share on LinkedIn
            </Button>
            <Button
              onClick={() => handleShare('facebook')}
              className="bg-blue-800 hover:bg-blue-900 text-white"
            >
              Share on Facebook
            </Button>
          </div>
          
          <p className="text-xs text-slate-500">
            Credits are awarded once per platform per day.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareModal;
