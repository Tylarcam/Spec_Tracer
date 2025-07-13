
import React from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { X } from 'lucide-react';
import { ElementInfo } from '@/shared/types';
import { sanitizeText } from '@/utils/sanitization';

interface MoreDetailsModalProps {
  element: ElementInfo | null;
  open: boolean;
  onClose: () => void;
}

const MoreDetailsModal: React.FC<MoreDetailsModalProps> = ({ element, open, onClose }) => {
  if (!open || !element) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <Card className="bg-slate-900/95 border-purple-500/50 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl shadow-purple-500/20">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-purple-500/20 text-purple-400">
                {element.tag.toUpperCase()}
              </Badge>
              <span className="text-lg text-purple-300 font-bold">More Details</span>
            </div>
            <Button onClick={onClose} size="sm" variant="ghost" className="h-6 w-6 p-0 text-gray-400 hover:text-white">
              <X className="w-4 h-4" />
            </Button>
          </div>
          {/* Expanded/advanced details here */}
          <div className="space-y-2 text-xs">
            {element.id && (
              <div className="flex justify-between">
                <span className="text-gray-400">ID:</span>
                <span className="text-green-300 font-mono">#{sanitizeText(element.id)}</span>
              </div>
            )}
            {element.classes.length > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-400">Classes:</span>
                <span className="text-green-300 font-mono text-right">
                  .{element.classes.map(c => sanitizeText(c)).join(' .')}
                </span>
              </div>
            )}
            {element.text && (
              <div className="flex justify-between">
                <span className="text-gray-400">Text:</span>
                <span className="text-gray-300 text-right max-w-48 truncate">
                  "{sanitizeText(element.text)}"
                </span>
              </div>
            )}
            {/* Add more advanced/expanded info as needed */}
            {/* Example: raw attributes, computed styles, event listeners, etc. */}
            {/* ... */}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default MoreDetailsModal;
