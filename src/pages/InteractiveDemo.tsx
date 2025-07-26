
import React, { useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import LogTrace from '@/components/LogTrace';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Play, Code, Smartphone, Monitor } from 'lucide-react';

const InteractiveDemo: React.FC = () => {
  const isMobile = useIsMobile();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const sampleComponents = [
    { id: 'form', label: 'Contact Form', icon: '📝' },
    { id: 'buttons', label: 'Action Buttons', icon: '🔘' },
    { id: 'cards', label: 'Content Cards', icon: '🃏' },
    { id: 'navigation', label: 'Navigation', icon: '🧭' },
  ];

  return (
    <div className="min-h-screen bg-slate-900">
      <LogTrace />
      
      {/* Mobile-optimized spacing */}
      <div className={`${isMobile ? 'pt-20 px-4 pb-20' : 'pt-4 px-6 pb-6'}`}>
        {/* Header */}
        <div className={`mb-6 ${isMobile ? 'text-center' : ''}`}>
          <div className="flex items-center gap-2 mb-4 justify-center md:justify-start">
            <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-cyan-500 rounded-lg flex items-center justify-center">
              <Play className="h-4 w-4 text-white" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">Interactive Demo</h1>
          </div>
          
          <p className={`text-slate-400 max-w-2xl ${isMobile ? 'text-sm mx-auto' : ''}`}>
            Try LogTrace on this interactive demo page. Use the debugging tools to inspect elements, 
            capture interactions, and analyze the page structure.
          </p>

          {/* Mobile device indicator */}
          {isMobile && (
            <div className="flex items-center justify-center gap-2 mt-4 px-3 py-2 bg-blue-500/20 border border-blue-500/30 rounded-full text-blue-400 text-xs font-medium">
              <Smartphone className="h-3 w-3" />
              Mobile Mode Active
            </div>
          )}
        </div>

        {/* Demo Components Grid */}
        <div className={`grid gap-4 mb-8 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
          {/* Contact Form Card */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className={`${isMobile ? 'pb-3' : 'pb-4'}`}>
              <CardTitle className={`flex items-center gap-2 ${isMobile ? 'text-lg' : 'text-xl'} text-green-400`}>
                📝 Contact Form
              </CardTitle>
              <CardDescription className={`${isMobile ? 'text-xs' : 'text-sm'} text-slate-400`}>
                Try interacting with form elements
              </CardDescription>
            </CardHeader>
            <CardContent className={`space-y-${isMobile ? '3' : '4'}`}>
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <Input
                    placeholder="Your name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className={`bg-slate-700 border-slate-600 text-white placeholder-slate-400 ${isMobile ? 'h-10 text-sm' : ''}`}
                  />
                </div>
                <div>
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className={`bg-slate-700 border-slate-600 text-white placeholder-slate-400 ${isMobile ? 'h-10 text-sm' : ''}`}
                  />
                </div>
                <div>
                  <Textarea
                    placeholder="Your message..."
                    value={formData.message}
                    onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                    className={`bg-slate-700 border-slate-600 text-white placeholder-slate-400 resize-none ${isMobile ? 'min-h-[80px] text-sm' : 'min-h-[100px]'}`}
                  />
                </div>
                <Button 
                  type="submit" 
                  className={`w-full bg-green-600 hover:bg-green-700 ${isMobile ? 'h-10' : ''}`}
                >
                  Send Message
                </Button>
              </form>
              
              {showSuccess && (
                <div className={`p-3 bg-green-500/20 border border-green-500/30 rounded-lg ${isMobile ? 'text-xs' : 'text-sm'}`}>
                  <span className="text-green-400">✅ Message sent successfully!</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Interactive Buttons Card */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className={`${isMobile ? 'pb-3' : 'pb-4'}`}>
              <CardTitle className={`flex items-center gap-2 ${isMobile ? 'text-lg' : 'text-xl'} text-green-400`}>
                🔘 Action Buttons
              </CardTitle>
              <CardDescription className={`${isMobile ? 'text-xs' : 'text-sm'} text-slate-400`}>
                Various button types to inspect
              </CardDescription>
            </CardHeader>
            <CardContent className={`space-y-${isMobile ? '2' : '3'}`}>
              <div className={`grid gap-2 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
                <Button variant="default" className={`${isMobile ? 'h-10 text-sm' : ''}`}>
                  Primary
                </Button>
                <Button variant="secondary" className={`${isMobile ? 'h-10 text-sm' : ''}`}>
                  Secondary
                </Button>
                <Button variant="outline" className={`${isMobile ? 'h-10 text-sm' : ''}`}>
                  Outline
                </Button>
                <Button variant="destructive" className={`${isMobile ? 'h-10 text-sm' : ''}`}>
                  Destructive
                </Button>
              </div>
              
              <div className={`flex flex-wrap gap-2 pt-${isMobile ? '2' : '3'}`}>
                <Badge variant="default" className={`${isMobile ? 'text-xs px-2 py-1' : ''}`}>Default</Badge>
                <Badge variant="secondary" className={`${isMobile ? 'text-xs px-2 py-1' : ''}`}>Secondary</Badge>
                <Badge variant="outline" className={`${isMobile ? 'text-xs px-2 py-1' : ''}`}>Outline</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Content Cards */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className={`${isMobile ? 'pb-3' : 'pb-4'}`}>
              <CardTitle className={`flex items-center gap-2 ${isMobile ? 'text-lg' : 'text-xl'} text-green-400`}>
                🃏 Sample Content
              </CardTitle>
              <CardDescription className={`${isMobile ? 'text-xs' : 'text-sm'} text-slate-400`}>
                Different content structures
              </CardDescription>
            </CardHeader>
            <CardContent className={`space-y-${isMobile ? '3' : '4'}`}>
              <div className={`space-y-${isMobile ? '2' : '3'}`}>
                <div className={`p-${isMobile ? '3' : '4'} bg-slate-700/50 rounded-lg`}>
                  <h3 className={`font-semibold text-white mb-2 ${isMobile ? 'text-sm' : ''}`}>
                    Card Title
                  </h3>
                  <p className={`text-slate-300 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                    This is a sample card with some content that you can inspect using LogTrace.
                  </p>
                </div>
                
                <div className={`p-${isMobile ? '3' : '4'} bg-cyan-500/10 border border-cyan-500/30 rounded-lg`}>
                  <h3 className={`font-semibold text-cyan-400 mb-2 ${isMobile ? 'text-sm' : ''}`}>
                    Highlighted Card
                  </h3>
                  <p className={`text-slate-300 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                    A card with different styling to test element detection.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Instructions for Mobile */}
        {isMobile && (
          <Card className="bg-slate-800/50 border-slate-700/50 mb-4">
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  <Code className="h-4 w-4 text-green-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-green-400 mb-2 text-sm">
                    Mobile Debug Tips
                  </h3>
                  <ul className="text-xs text-slate-300 space-y-1">
                    <li>• Tap any element to inspect it</li>
                    <li>• Use the floating action button for quick tools</li>
                    <li>• Long press for context menu (if available)</li>
                    <li>• Check the terminal for real-time logs</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Sample Navigation */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className={`${isMobile ? 'pb-3' : 'pb-4'}`}>
            <CardTitle className={`flex items-center gap-2 ${isMobile ? 'text-lg' : 'text-xl'} text-green-400`}>
              🧭 Navigation Elements
            </CardTitle>
            <CardDescription className={`${isMobile ? 'text-xs' : 'text-sm'} text-slate-400`}>
              Test navigation and link interactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className={`flex flex-wrap gap-${isMobile ? '2' : '4'} ${isMobile ? 'justify-center' : ''}`}>
              <a 
                href="#home" 
                className={`px-${isMobile ? '3' : '4'} py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors ${isMobile ? 'text-sm' : ''}`}
                onClick={(e) => e.preventDefault()}
              >
                Home
              </a>
              <a 
                href="#about" 
                className={`px-${isMobile ? '3' : '4'} py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors ${isMobile ? 'text-sm' : ''}`}
                onClick={(e) => e.preventDefault()}
              >
                About
              </a>
              <a 
                href="#services" 
                className={`px-${isMobile ? '3' : '4'} py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors ${isMobile ? 'text-sm' : ''}`}
                onClick={(e) => e.preventDefault()}
              >
                Services
              </a>
              <a 
                href="#contact" 
                className={`px-${isMobile ? '3' : '4'} py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors ${isMobile ? 'text-sm' : ''}`}
                onClick={(e) => e.preventDefault()}
              >
                Contact
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InteractiveDemo;
