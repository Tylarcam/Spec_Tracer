import { ElementInfo } from '@/shared/types';
import { sanitizeText } from './sanitization';

/**
 * Formats element data for clean, organized clipboard copying
 * Extracts and formats identifying data points for debugging and development
 */
export const formatElementDataForCopy = (element: ElementInfo, position?: { x: number; y: number }): string => {
  const parts: string[] = [];
  
  // Basic element info
  parts.push(`Element: <${element.tag}>`);
  
  // ID if present
  if (element.id && element.id.trim()) {
    parts.push(`ID: #${sanitizeText(element.id)}`);
  }
  
  // Classes if present
  if (element.classes.length > 0) {
    const sanitizedClasses = element.classes.map(c => sanitizeText(c)).filter(c => c.trim());
    if (sanitizedClasses.length > 0) {
      parts.push(`Classes: .${sanitizedClasses.join('.')}`);
    }
  }
  
  // Text content if present
  if (element.text && element.text.trim()) {
    const sanitizedText = sanitizeText(element.text.trim(), 200);
    parts.push(`Text: "${sanitizedText}"`);
  }
  
  // Parent path if present
  if (element.parentPath && element.parentPath.trim()) {
    parts.push(`Path: ${sanitizeText(element.parentPath)}`);
  }
  
  // Size if present
  if (element.size && element.size.width > 0 && element.size.height > 0) {
    parts.push(`Size: ${element.size.width}×${element.size.height}px`);
  }
  
  // Position if provided
  if (position) {
    parts.push(`Position: (${Math.round(position.x)}, ${Math.round(position.y)})`);
  }
  
  // Key attributes (data-*, aria-*, role, etc.)
  if (element.attributes && element.attributes.length > 0) {
    const keyAttributes = element.attributes.filter(attr => 
      attr.name.startsWith('data-') || 
      attr.name.startsWith('aria-') || 
      ['role', 'type', 'name', 'value', 'href', 'src', 'alt', 'title'].includes(attr.name)
    );
    
    if (keyAttributes.length > 0) {
      const attrStrings = keyAttributes.map(attr => 
        `${attr.name}="${sanitizeText(attr.value, 100)}"`
      );
      parts.push(`Attributes: ${attrStrings.join(', ')}`);
    }
  }
  
  return parts.join('\n');
};

/**
 * Alternative format: CSS selector style
 */
export const formatElementDataAsSelector = (element: ElementInfo): string => {
  const parts: string[] = [];
  
  // Start with tag
  parts.push(element.tag);
  
  // Add ID if present
  if (element.id && element.id.trim()) {
    parts.push(`#${sanitizeText(element.id)}`);
  }
  
  // Add classes if present
  if (element.classes.length > 0) {
    const sanitizedClasses = element.classes.map(c => sanitizeText(c)).filter(c => c.trim());
    if (sanitizedClasses.length > 0) {
      parts.push(`.${sanitizedClasses.join('.')}`);
    }
  }
  
  return parts.join('');
};

/**
 * Alternative format: JSON structure
 */
export const formatElementDataAsJSON = (element: ElementInfo, position?: { x: number; y: number }): string => {
  const data = {
    tag: element.tag,
    id: element.id || null,
    classes: element.classes.filter(c => c.trim()),
    text: element.text?.trim() || null,
    parentPath: element.parentPath || null,
    size: element.size || null,
    position: position || null,
    attributes: element.attributes?.reduce((acc, attr) => {
      if (attr.name.startsWith('data-') || attr.name.startsWith('aria-') || 
          ['role', 'type', 'name', 'value', 'href', 'src', 'alt', 'title'].includes(attr.name)) {
        acc[attr.name] = attr.value;
      }
      return acc;
    }, {} as Record<string, string>) || null
  };
  
  return JSON.stringify(data, null, 2);
}; 