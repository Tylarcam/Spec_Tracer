
import React from 'react';
import { useSearchParams } from 'react-router-dom';
import LogTrace from '@/components/LogTrace';

const Index: React.FC = () => {
  const [searchParams] = useSearchParams();
  
  return (
    <div className="min-h-screen pt-14 md:pt-16">
      <LogTrace />
    </div>
  );
};

export default Index;
