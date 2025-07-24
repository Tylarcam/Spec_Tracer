
import React from 'react';
import { ElementInfo } from '@/shared/types';
import { Badge } from '@/components/ui/badge';

interface ElementDetailsProps {
  element: ElementInfo;
}

const ElementDetails: React.FC<ElementDetailsProps> = ({ element }) => {
  return (
    <div className="space-y-3">
      <div>
        <h4 className="text-sm font-medium text-green-400 mb-1">Element</h4>
        <p className="text-sm text-gray-300">&lt;{element.tag}&gt;</p>
      </div>
      
      {element.id && (
        <div>
          <h4 className="text-sm font-medium text-green-400 mb-1">ID</h4>
          <p className="text-sm text-gray-300">{element.id}</p>
        </div>
      )}
      
      {element.classes.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-green-400 mb-1">Classes</h4>
          <div className="flex flex-wrap gap-1">
            {element.classes.map((cls, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {cls}
              </Badge>
            ))}
          </div>
        </div>
      )}
      
      {element.text && (
        <div>
          <h4 className="text-sm font-medium text-green-400 mb-1">Text</h4>
          <p className="text-sm text-gray-300 break-words">{element.text}</p>
        </div>
      )}
      
      {element.parentPath && (
        <div>
          <h4 className="text-sm font-medium text-green-400 mb-1">Path</h4>
          <p className="text-xs text-gray-400 break-all">{element.parentPath}</p>
        </div>
      )}
    </div>
  );
};

export default ElementDetails;
