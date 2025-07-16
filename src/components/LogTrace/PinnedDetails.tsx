
import React from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { X } from 'lucide-react';
import { ElementInfo } from '@/shared/types';
import { sanitizeText } from '@/utils/sanitization';
import { useToast } from '@/hooks/use-toast';

interface MoreDetailsModalProps {
  element: ElementInfo | null;
  open: boolean;
  onClose: () => void;
  terminalHeight?: number;
}

const MoreDetailsModal: React.FC<MoreDetailsModalProps> = ({ element, open, onClose, terminalHeight = 0 }) => {
  const { toast } = useToast();
  if (!open || !element) return null;

  // Find primary value from data-lov-id
  const lovIdAttr = element.attributes?.find(attr => attr.name === 'data-lov-id');
  const primaryValue = lovIdAttr ? lovIdAttr.value : undefined;

  // Find source attribution details
  const sourceAttr = element.attributes?.find(attr => attr.name === 'data-source' || attr.name === 'data-attribution');
  const sourceAttribution = sourceAttr ? `${sourceAttr.name}: ${sourceAttr.value}` : undefined;

  // Check if element is interactive
  const isInteractive = ['button', 'a', 'input', 'select', 'textarea'].includes(element.tag) || element.element?.onclick != null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      style={{ bottom: terminalHeight }}
    >
      <Card
        className="bg-slate-900/95 border-purple-500/50 w-full max-w-2xl overflow-y-auto shadow-xl shadow-purple-500/20"
        style={{ maxHeight: `calc(90vh - ${terminalHeight}px)` }}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-purple-500/20 text-purple-400">
                {element.tag.toUpperCase()}
              </Badge>
              <span className="text-lg text-purple-300 font-bold">More Details</span>
              {isInteractive && (
                <Badge variant="outline" className="border-green-500/30 text-green-400 text-xs ml-2">
                  Interactive
                </Badge>
              )}
            </div>
            <Button onClick={onClose} size="sm" variant="ghost" className="h-6 w-6 p-0 text-gray-400 hover:text-white">
              <X className="w-4 h-4" />
            </Button>
          </div>
          {/* Expanded/advanced details here */}
          <div className="space-y-4 text-xs">
            {/* Basic Info Section */}
            <div className="space-y-2">
              <div className="font-semibold text-purple-400 mb-1">Basic Info</div>
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
            </div>
            {/* Primary Value Section */}
            {primaryValue && (
              <div className="space-y-1">
                <div className="font-semibold text-purple-400 mb-1">Primary Value</div>
                <div className="flex justify-between">
                  <span className="text-gray-400">data-lov-id:</span>
                  <span className="text-blue-300 font-mono">{primaryValue}</span>
                </div>
              </div>
            )}
            {/* Source Attribution Section */}
            {sourceAttribution && (
              <div className="space-y-1">
                <div className="font-semibold text-purple-400 mb-1">Source Attribution</div>
                <div className="flex justify-between">
                  <span className="text-gray-400">{sourceAttr?.name}:</span>
                  <span className="text-orange-300 font-mono">{sourceAttr?.value}</span>
                </div>
              </div>
            )}
            {/* Attributes Section */}
            {element.attributes && element.attributes.length > 0 && (
              <div className="space-y-1">
                <div className="font-semibold text-purple-400 mb-1">All Attributes</div>
                <div className="max-h-48 overflow-y-auto border border-purple-500/10 rounded bg-slate-800/40">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-left text-purple-300">
                        <th className="py-1 px-2 font-semibold">attribute</th>
                        <th className="py-1 px-2 font-semibold">value</th>
                        <th className="py-1 px-2 font-semibold">actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {element.attributes.map(attr => (
                        <tr key={attr.name} className="border-t border-purple-500/5">
                          <td className="py-1 px-2 text-gray-400 align-top whitespace-nowrap">{attr.name}</td>
                          <td className="py-1 px-2 text-orange-300 font-mono align-top break-all whitespace-pre-wrap max-w-[320px]">
                            {sanitizeText(attr.value)}
                          </td>
                          <td className="py-1 px-2 align-top">
                            <button
                              className="text-cyan-400 hover:text-cyan-200 px-1"
                              onClick={() => {
                                navigator.clipboard.writeText(attr.value);
                                toast({ title: 'Copied', description: `Copied value for ${attr.name}`, variant: 'success' });
                              }}
                              title="Copy value"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="inline w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default MoreDetailsModal;
