import React, { useMemo } from 'react';
import { ElementInfo } from '@/shared/types';
import { Lightbulb, Code, Palette, MousePointer, Layout, Type, Zap } from 'lucide-react';

interface LearningAssistantBubbleProps {
  isActive: boolean;
  currentElement: ElementInfo | null;
  mousePosition: { x: number; y: number };
}

interface LearningTip {
  icon: React.ElementType;
  title: string;
  tip: string;
  codeHint?: string;
}

/**
 * Generate educational tips based on the element being hovered
 */
function generateLearningTip(element: ElementInfo | null): LearningTip {
  if (!element) {
    return {
      icon: MousePointer,
      title: "Hover to Learn!",
      tip: "Move your cursor over any element to learn about HTML tags and CSS styling.",
    };
  }

  const tag = element.tag.toLowerCase();
  const classes = element.classes;
  const hasFlexbox = classes.some(c => c.includes('flex'));
  const hasGrid = classes.some(c => c.includes('grid'));
  const hasButton = tag === 'button' || classes.some(c => c.includes('btn') || c.includes('button'));
  const hasInput = ['input', 'textarea', 'select'].includes(tag);
  const hasHeading = /^h[1-6]$/.test(tag);
  const hasImage = tag === 'img' || tag === 'svg';
  const hasLink = tag === 'a';

  // Provide contextual learning tips
  if (hasButton) {
    return {
      icon: MousePointer,
      title: "Button Element",
      tip: "Buttons trigger actions! Use <button> for clickable actions and style with hover states for better UX.",
      codeHint: "onClick={() => handleAction()}"
    };
  }

  if (hasInput) {
    return {
      icon: Type,
      title: "Form Input",
      tip: "Inputs collect user data. Always add labels for accessibility and validate input before submission.",
      codeHint: "<input type='text' placeholder='...' />"
    };
  }

  if (hasHeading) {
    const level = tag.charAt(1);
    return {
      icon: Type,
      title: `Heading Level ${level}`,
      tip: `<${tag}> defines document structure. Use only one <h1> per page, then nest h2-h6 hierarchically for SEO.`,
      codeHint: `<${tag}>Page Title</${tag}>`
    };
  }

  if (hasFlexbox) {
    return {
      icon: Layout,
      title: "Flexbox Layout",
      tip: "Flexbox aligns items in one dimension. Use 'justify-content' for main axis and 'align-items' for cross axis.",
      codeHint: "display: flex; gap: 1rem;"
    };
  }

  if (hasGrid) {
    return {
      icon: Layout,
      title: "CSS Grid Layout",
      tip: "Grid creates 2D layouts. Define rows/columns with 'grid-template' and place items precisely.",
      codeHint: "display: grid; grid-cols-3;"
    };
  }

  if (hasImage) {
    return {
      icon: Palette,
      title: "Image/SVG",
      tip: "Always add 'alt' text for accessibility. Use SVGs for icons (scalable) and optimize images for performance.",
      codeHint: "<img src='...' alt='description' />"
    };
  }

  if (hasLink) {
    return {
      icon: Zap,
      title: "Anchor Link",
      tip: "Links navigate users. Use descriptive text (not 'click here') and add target='_blank' for external links.",
      codeHint: "<a href='/page'>Link Text</a>"
    };
  }

  if (tag === 'div') {
    return {
      icon: Layout,
      title: "Div Container",
      tip: "Divs are generic containers. Consider using semantic HTML like <section>, <article>, or <nav> for better structure.",
      codeHint: "<div className='container'>...</div>"
    };
  }

  if (tag === 'span') {
    return {
      icon: Type,
      title: "Inline Span",
      tip: "Spans style inline text without breaking flow. Use for highlighting or wrapping text with specific styles.",
      codeHint: "<span className='highlight'>text</span>"
    };
  }

  if (tag === 'p') {
    return {
      icon: Type,
      title: "Paragraph",
      tip: "Paragraphs group text content. Use CSS line-height and max-width for optimal readability.",
      codeHint: "<p className='text-base'>Content</p>"
    };
  }

  // Default tip based on element info
  return {
    icon: Code,
    title: `<${element.tag}> Element`,
    tip: `This is a ${element.tag} element${element.id ? ` with id "${element.id}"` : ''}. Explore its classes to understand its styling!`,
    codeHint: element.classes.length > 0 ? `class="${element.classes.slice(0, 2).join(' ')}"` : undefined
  };
}

const LearningAssistantBubble: React.FC<LearningAssistantBubbleProps> = ({
  isActive,
  currentElement,
  mousePosition,
}) => {
  const tip = useMemo(() => generateLearningTip(currentElement), [currentElement]);
  const IconComponent = tip.icon;

  if (!isActive) return null;

  // Position bubble to the right of cursor, avoiding screen edges
  const bubbleX = Math.min(mousePosition.x + 30, window.innerWidth - 320);
  const bubbleY = Math.max(mousePosition.y - 60, 20);

  return (
    <>
      {/* Animated mascot cursor */}
      <div
        className="fixed pointer-events-none z-[60] transition-all duration-150 ease-out"
        style={{
          left: mousePosition.x,
          top: mousePosition.y,
          transform: 'translate(-50%, -50%)',
        }}
      >
        {/* Glowing assistant orb */}
        <div className="relative">
          {/* Outer glow */}
          <div className="absolute -inset-2 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full blur-md opacity-60 animate-pulse" />
          
          {/* Main orb */}
          <div className="relative w-8 h-8 bg-gradient-to-br from-violet-400 to-fuchsia-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white/30">
            <Lightbulb className="w-4 h-4 text-white animate-pulse" />
          </div>
          
          {/* Sparkle effects */}
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-300 rounded-full animate-ping" />
          <div className="absolute -bottom-1 -left-1 w-1.5 h-1.5 bg-cyan-300 rounded-full animate-ping animation-delay-300" />
        </div>
      </div>

      {/* Thought bubble */}
      <div
        className="fixed pointer-events-none z-[59] transition-all duration-200 ease-out"
        style={{
          left: bubbleX,
          top: bubbleY,
        }}
      >
        {/* Bubble connector dots */}
        <div className="absolute -left-6 top-1/2 -translate-y-1/2 flex gap-1">
          <div className="w-2 h-2 bg-white/90 rounded-full" />
          <div className="w-3 h-3 bg-white/90 rounded-full -mt-0.5" />
        </div>

        {/* Main thought bubble */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-violet-200 p-4 max-w-[280px] animate-fade-in">
          {/* Header */}
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-lg">
              <IconComponent className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-slate-800 text-sm">{tip.title}</span>
          </div>

          {/* Tip content */}
          <p className="text-slate-600 text-xs leading-relaxed mb-2">
            {tip.tip}
          </p>

          {/* Code hint */}
          {tip.codeHint && (
            <div className="bg-slate-900 rounded-lg px-3 py-2 font-mono text-[10px] text-green-400 overflow-x-auto">
              {tip.codeHint}
            </div>
          )}

          {/* Learning badge */}
          <div className="flex items-center justify-between mt-3 pt-2 border-t border-violet-100">
            <span className="text-[10px] text-violet-500 font-medium">🎓 Learning Mode</span>
            <span className="text-[10px] text-slate-400">Click to inspect</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default LearningAssistantBubble;
