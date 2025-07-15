
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Layers, Database, Code } from 'lucide-react';

export const NestedStructure: React.FC = () => {
  return (
    <div className="border-2 border-purple-300 p-4 rounded-lg bg-purple-50" data-level="parent">
      <div className="flex items-center justify-between mb-3">
        <span className="text-purple-700 font-semibold flex items-center">
          <Layers className="w-4 h-4 mr-2" />
          Parent Container
        </span>
        <Badge variant="outline" className="border-purple-400 text-purple-600">Level 1</Badge>
      </div>
      <div className="bg-white p-3 rounded border shadow-sm" data-level="child">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-700 flex items-center">
            <Database className="w-4 h-4 mr-2" />
            Child Element
          </span>
          <Badge variant="secondary">Level 2</Badge>
        </div>
        <div className="bg-gray-100 p-2 rounded border" data-level="grandchild">
          <div className="flex items-center justify-between">
            <span className="text-gray-600 text-sm flex items-center">
              <Code className="w-3 h-3 mr-1" />
              Grandchild Element
            </span>
            <Badge variant="outline" className="text-xs">Level 3</Badge>
          </div>
          <div className="mt-2 bg-white p-1 rounded text-xs border" data-level="great-grandchild">
            <span className="text-gray-500">Great-grandchild (Level 4)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
