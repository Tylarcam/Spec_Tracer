
import React, { useState } from 'react';
import { X, Share2, Twitter, Linkedin, Gift, Sparkles } from 'lucide-react';
import { Button } from './ui/button';
import { useEnhancedCredits } from '@/hooks/useEnhancedCredits';
import { useToast } from '@/hooks/use-toast';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  isWelcome?: boolean;
}

const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, isWelcome = false }) => {
  const [isSharing, setIsSharing] = useState(false);
  const { awardShareCredits } = useEnhancedCredits();
  const { toast } = useToast();

  if (!isOpen) return null;

  const shareText = "🚀 Just discovered LogTrace - the AI-powered debugging tool that gives perfect context to ChatGPT! No more writing essays to describe bugs. Try it free: https://logtrace.com";

  const handleShare = async (platform: string) => {
    setIsSharing(true);
    
    try {
      let shareUrl = '';
      const encodedText = encodeURIComponent(shareText);
      
      switch (platform) {
        case 'twitter':
          shareUrl = `https://twitter.com/intent/tweet?text=${encodedText}`;
          break;
        case 'linkedin':
          shareUrl = `https://linkedin.com/sharing/share-offsite/?url=${encodeURIComponent('https://logtrace.com')}&summary=${encodedText}`;
          break;
        default:
          return;
      }

      // Open share window
      const shareWindow = window.open(shareUrl, '_blank', 'width=550,height=450');
      
      // Award credits after a delay (assuming user shared)
      setTimeout(async () => {
        if (shareWindow) {
          const awarded = await awardShareCredits(platform);
          if (awarded) {
            toast({
              title: "🎉 Bonus Credits Awarded!",
              description: "You earned +5 credits for sharing LogTrace!",
            });
          }
        }
      }, 3000);

    } catch (error) {
      console.error('Share error:', error);
    } finally {
      setIsSharing(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText('https://logtrace.com');
      toast({
        title: "Link Copied!",
        description: "Share link copied to clipboard",
      });
      
      const awarded = await awardShareCredits('copy');
      if (awarded) {
        toast({
          title: "🎉 Bonus Credits Awarded!",
          description: "You earned +5 credits for sharing LogTrace!",
        });
      }
    } catch (error) {
      console.error('Copy error:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-green-500/30 rounded-xl shadow-2xl w-full max-w-md mx-4 animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-green-500/20">
          <div className="flex items-center gap-2">
            {isWelcome ? <Sparkles className="h-6 w-6 text-green-400" /> : <Share2 className="h-6 w-6 text-green-400" />}
            <h2 className="text-xl font-bold text-white">
              {isWelcome ? 'Welcome to LogTrace!' : 'Share LogTrace'}
            </h2>
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6">
          {isWelcome && (
            <div className="bg-gradient-to-r from-green-500/10 to-cyan-500/10 border border-green-400/30 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Gift className="h-5 w-5 text-green-400" />
                <span className="text-green-400 font-semibold">Congratulations!</span>
              </div>
              <p className="text-gray-300 text-sm mb-3">
                You've successfully joined LogTrace! Share with your developer friends and earn bonus credits.
              </p>
              <div className="bg-green-500/20 border border-green-400/30 rounded p-3">
                <p className="text-green-400 text-sm font-medium">
                  🎁 Earn +5 credits for each share!
                </p>
                <p className="text-gray-400 text-xs mt-1">
                  Stack up to 40 total credits • Pro users get unlimited
                </p>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <h3 className="text-white font-semibold mb-3">Share on Social Media</h3>
              <div className="space-y-3">
                <Button
                  onClick={() => handleShare('twitter')}
                  disabled={isSharing}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12"
                >
                  <Twitter className="h-5 w-5 mr-3" />
                  Share on Twitter
                </Button>
                
                <Button
                  onClick={() => handleShare('linkedin')}
                  disabled={isSharing}
                  className="w-full bg-blue-800 hover:bg-blue-900 text-white h-12"
                >
                  <Linkedin className="h-5 w-5 mr-3" />
                  Share on LinkedIn
                </Button>
              </div>
            </div>

            <div className="border-t border-gray-700 pt-4">
              <h3 className="text-white font-semibold mb-3">Or Copy Link</h3>
              <Button
                onClick={handleCopyLink}
                variant="outline"
                className="w-full border-green-500/30 text-green-400 hover:bg-green-500/10 h-12"
              >
                <Share2 className="h-5 w-5 mr-3" />
                Copy Share Link
              </Button>
            </div>
          </div>

          {!isWelcome && (
            <div className="mt-6 text-center">
              <Button
                onClick={onClose}
                variant="ghost"
                className="text-gray-400 hover:text-white"
              >
                Maybe Later
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
