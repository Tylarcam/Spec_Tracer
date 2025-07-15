
import React, { Suspense } from 'react';
const LogTrace = React.lazy(() => import('@/components/LogTrace'));
import Spinner from '@/components/ui/spinner';

const Index: React.FC = () => {
  return (
    <div className="min-h-screen">
      <Suspense fallback={<div className="flex justify-center items-center h-screen"><Spinner size={48} /></div>}>
        <LogTrace />
      </Suspense>
    </div>
  );
};

export default Index;
