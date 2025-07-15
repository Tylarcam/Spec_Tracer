
import React from 'react';
import { Card } from '@/components/ui/card';
import { Code, Database, Eye } from 'lucide-react';

interface InteractiveCardsProps {
  onInteraction: (section: string) => void;
}

export const InteractiveCards: React.FC<InteractiveCardsProps> = ({ onInteraction }) => {
  const cards = [
    { title: 'Frontend', icon: Code, color: 'blue' },
    { title: 'Backend', icon: Database, color: 'green' },
    { title: 'Design', icon: Eye, color: 'purple' }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {cards.map((card, index) => (
        <Card 
          key={index}
          className="p-4 hover:shadow-lg transition-all cursor-pointer border-2 hover:border-opacity-60 group"
          onClick={() => onInteraction(card.title.toLowerCase())}
          data-card={card.title.toLowerCase()}
        >
          <div className="flex items-center space-x-3 group-hover:opacity-80">
            <card.icon className="w-6 h-6" />
            <div>
              <h3 className="font-semibold">{card.title}</h3>
              <p className="text-sm text-gray-500">Click to interact</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
