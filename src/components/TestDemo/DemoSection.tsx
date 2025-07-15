
import React from 'react';
import { Card } from '@/components/ui/card';

interface DemoSectionProps {
  id: string;
  title: string;
  description: string;
  children: React.ReactNode;
}

export const DemoSection: React.FC<DemoSectionProps> = ({
  id,
  title,
  description,
  children
}) => {
  return (
    <Card className="bg-slate-800 border-slate-700 p-6 hover:border-slate-600 transition-colors">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>  
        <p className="text-sm text-slate-400">{description}</p>
      </div>
      <div className="min-h-[120px] flex items-center justify-center">
        {children}
      </div>
    </Card>
  );
};
