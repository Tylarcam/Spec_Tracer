import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { ElementInfo, PinnedDetail } from '@/shared/types';
import { sanitizeText } from '@/utils/sanitization';

interface PinnedDetailsProps {
  pins: PinnedDetail[];
  onRemove: (id: string) => void;
}

const PinnedDetails: React.FC<PinnedDetailsProps> = ({ pins, onRemove }) => {
  if (!pins.length) return null;
  return (
    <div className="fixed z-[2147483649] top-24 right-4 flex flex-col gap-4 pointer-events-auto">
      {pins.map(pin => (
        <Card key={pin.id} className="bg-slate-900/95 border-cyan-500/50 shadow-xl w-80 relative">
          <Button onClick={() => onRemove(pin.id)} size="sm" variant="ghost" className="absolute top-2 right-2 h-6 w-6 p-0 text-gray-400 hover:text-white">
            <X className="w-4 h-4" />
          </Button>
          <div className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary" className="bg-cyan-500/20 text-cyan-400">
                {pin.element.tag.toUpperCase()}
              </Badge>
              {pin.element.id && (
                <Badge variant="outline" className="border-green-500/30 text-green-400 text-xs">
                  #{sanitizeText(pin.element.id)}
                </Badge>
              )}
            </div>
            {pin.element.classes.length > 0 && (
              <div className="text-green-300 mb-1 text-xs">
                .{pin.element.classes.map(c => sanitizeText(c)).join(' .')}
              </div>
            )}
            {pin.element.text && (
              <div className="text-gray-300 text-xs max-w-48 truncate mb-2">
                "{sanitizeText(pin.element.text)}"
              </div>
            )}
            {pin.element.attributes && pin.element.attributes.length > 0 && (
              <div className="max-h-24 overflow-y-auto border border-cyan-500/10 rounded bg-slate-800/40 mt-2">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-left text-cyan-300">
                      <th className="py-1 px-2 font-semibold">attribute</th>
                      <th className="py-1 px-2 font-semibold">value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pin.element.attributes.map(attr => (
                      <tr key={attr.name} className="border-t border-cyan-500/5">
                        <td className="py-1 px-2 text-gray-400 align-top whitespace-nowrap">{attr.name}</td>
                        <td className="py-1 px-2 text-cyan-300 font-mono align-top break-all whitespace-pre-wrap max-w-[180px]">
                          {sanitizeText(attr.value)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
};

export default PinnedDetails; 