
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, RefreshCw, Home } from 'lucide-react';

const IframeDemoBar: React.FC = () => {
  const [url, setUrl] = React.useState('');

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url) {
      const currentUrl = new URL(window.location.href);
      currentUrl.searchParams.set('site', url);
      window.location.href = currentUrl.toString();
    }
  };

  const handleBack = () => {
    window.history.back();
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleHome = () => {
    window.location.href = '/';
  };

  return (
    <div className="bg-slate-800 border-b border-slate-700 p-4">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleBack}
            className="border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            className="border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleHome}
            className="border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            <Home className="h-4 w-4" />
          </Button>
        </div>
        
        <form onSubmit={handleSubmit} className="flex-1 flex gap-2">
          <Input
            type="url"
            placeholder="Enter website URL to test (e.g., https://example.com)"
            value={url}
            onChange={handleUrlChange}
            className="flex-1 bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-400"
          />
          <Button
            type="submit"
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            Load Site
          </Button>
        </form>
      </div>
    </div>
  );
};

export default IframeDemoBar;
