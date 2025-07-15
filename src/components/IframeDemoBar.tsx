import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useNavigate, useLocation } from 'react-router-dom';

const IframeDemoBar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const [url, setUrl] = useState(params.get('site') ?? '');
  const { toast } = useToast();

  const handleOpen = () => {
    if (!url.trim()) {
      toast({ 
        title: 'Please enter a URL', 
        variant: 'destructive' 
      });
      return;
    }

    try {
      // Add https:// if no protocol specified
      let fullUrl = url.trim();
      if (!fullUrl.startsWith('http://') && !fullUrl.startsWith('https://')) {
        fullUrl = 'https://' + fullUrl;
      }
      
      const parsed = new URL(fullUrl);
      navigate(`/debug?site=${encodeURIComponent(parsed.href)}`);
    } catch {
      toast({ 
        title: 'Invalid URL', 
        description: 'Please enter a valid website URL',
        variant: 'destructive' 
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleOpen();
    }
  };

  return (
    <div className="w-full bg-slate-900 border-b border-slate-700 p-3 flex gap-2 z-40 sticky top-0">
      <div className="flex-1 flex gap-2">
        <input
          className="flex-1 bg-slate-800 border border-slate-600 px-3 py-2 rounded-md text-sm text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400"
          placeholder="Enter any website URL (e.g., github.com, reddit.com)"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <Button 
          onClick={handleOpen}
          className="bg-green-500 hover:bg-green-600 text-black font-semibold px-6"
        >
          Open
        </Button>
      </div>
      
      {params.get('site') && (
        <Button 
          variant="outline"
          onClick={() => navigate('/debug')}
          className="border-slate-600 text-slate-400 hover:bg-slate-800"
        >
          Clear
        </Button>
      )}
    </div>
  );
};

export default IframeDemoBar; 