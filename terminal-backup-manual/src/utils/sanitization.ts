
/**
 * Utilities for sanitizing user input and preventing XSS
 */

// Rate limiting for debug operations
class RateLimiter {
  private requests = new Map<string, number[]>();
  private maxRequests = 10;
  private windowMs = 60000; // 1 minute

  isAllowed(key: string): boolean {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    
    if (!this.requests.has(key)) {
      this.requests.set(key, []);
    }
    
    const keyRequests = this.requests.get(key)!;
    
    // Remove old requests outside the window
    while (keyRequests.length > 0 && keyRequests[0] < windowStart) {
      keyRequests.shift();
    }
    
    if (keyRequests.length >= this.maxRequests) {
      return false;
    }
    
    keyRequests.push(now);
    return true;
  }
}

export const debugRateLimiter = new RateLimiter();

export const sanitizeText = (text: string, maxLength = 500): string => {
  if (!text || typeof text !== 'string') return '';
  
  return text
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim()
    .slice(0, maxLength);
};

export const validatePrompt = (prompt: string): boolean => {
  if (!prompt || typeof prompt !== 'string') return false;
  if (prompt.length < 5 || prompt.length > 2000) return false;
  
  // Check for suspicious patterns
  const suspiciousPatterns = [
    /javascript:/i,
    /<script/i,
    /eval\(/i,
    /function\s*\(/i,
  ];
  
  return !suspiciousPatterns.some(pattern => pattern.test(prompt));
};

// --- AI Response Parsing & Formatting Utilities ---

export interface ParsedAIResponse {
  problemStatement?: string;
  elementDetails?: string;
  debuggingSteps?: string[];
  summary?: string;
  analysis?: string;
  issues?: string[];
  recommendations?: string[];
  codeSnippets?: {
    css?: string;
    javascript?: string;
    html?: string;
  };
  debugging_steps?: string[];
  rawText?: string;
}

export const parseAIResponse = (response: string): ParsedAIResponse => {
  if (!response || typeof response !== 'string') {
    return { rawText: 'Invalid response' };
  }

  // Try to parse as JSON first
  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        summary: parsed.summary,
        analysis: parsed.analysis,
        issues: parsed.issues,
        recommendations: parsed.recommendations,
        codeSnippets: parsed.codeSnippets,
        debugging_steps: parsed.debugging_steps,
        rawText: response
      };
    }
  } catch (error) {
    console.warn('Failed to parse JSON from AI response:', error);
  }

  // If not JSON, try to extract structured information from markdown/text
  const lines = response.split('\n');
  const result: ParsedAIResponse = { rawText: response };

  let currentSection = '';
  let currentContent: string[] = [];

  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // Detect section headers
    if (trimmedLine.startsWith('## ')) {
      // Save previous section
      if (currentSection && currentContent.length > 0) {
        const content = currentContent.join('\n').trim();
        switch (currentSection) {
          case 'Problem Statement':
            result.problemStatement = content;
            break;
          case 'Element Details':
            result.elementDetails = content;
            break;
          case 'Summary':
            result.summary = content;
            break;
          case 'Analysis':
            result.analysis = content;
            break;
        }
      }
      
      currentSection = trimmedLine.substring(3);
      currentContent = [];
    } else if (trimmedLine.startsWith('### ')) {
      // Handle subsections like "Debugging Steps"
      const subsection = trimmedLine.substring(4);
      if (subsection.toLowerCase().includes('debugging steps')) {
        result.debuggingSteps = [];
        currentSection = 'Debugging Steps';
        currentContent = [];
      }
    } else if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
      // Handle list items
      if (currentSection === 'Debugging Steps' && result.debuggingSteps) {
        result.debuggingSteps.push(trimmedLine.substring(2));
      }
    } else if (trimmedLine) {
      // Regular content
      currentContent.push(line);
    }
  }

  // Save the last section
  if (currentSection && currentContent.length > 0) {
    const content = currentContent.join('\n').trim();
    switch (currentSection) {
      case 'Problem Statement':
        result.problemStatement = content;
        break;
      case 'Element Details':
        result.elementDetails = content;
        break;
      case 'Summary':
        result.summary = content;
        break;
      case 'Analysis':
        result.analysis = content;
        break;
    }
  }

  return result;
};

export const formatAIResponseForDisplay = (parsed: ParsedAIResponse): string => {
  const sections: string[] = [];

  // Problem Statement
  if (parsed.problemStatement) {
    sections.push(`## Problem Statement\n\n${parsed.problemStatement}`);
  }

  // Element Details
  if (parsed.elementDetails) {
    sections.push(`## Element Details\n\n${parsed.elementDetails}`);
  }

  // Summary
  if (parsed.summary) {
    sections.push(`## Summary\n\n${parsed.summary}`);
  }

  // Analysis
  if (parsed.analysis) {
    sections.push(`## Analysis\n\n${parsed.analysis}`);
  }

  // Issues
  if (parsed.issues && parsed.issues.length > 0) {
    sections.push(`## Issues Found\n\n${parsed.issues.map(issue => `- ${issue}`).join('\n')}`);
  }

  // Recommendations
  if (parsed.recommendations && parsed.recommendations.length > 0) {
    sections.push(`## Recommendations\n\n${parsed.recommendations.map(rec => `- ${rec}`).join('\n')}`);
  }

  // Debugging Steps
  if (parsed.debugging_steps && parsed.debugging_steps.length > 0) {
    sections.push(`## Debugging Steps\n\n${parsed.debugging_steps.map((step, index) => `${index + 1}. ${step}`).join('\n')}`);
  } else if (parsed.debuggingSteps && parsed.debuggingSteps.length > 0) {
    sections.push(`## Debugging Steps\n\n${parsed.debuggingSteps.map((step, index) => `${index + 1}. ${step}`).join('\n')}`);
  }

  // Code Snippets
  if (parsed.codeSnippets) {
    const codeSections: string[] = [];
    if (parsed.codeSnippets.css) {
      codeSections.push(`**CSS:**\n\n\`\`\`css\n${parsed.codeSnippets.css}\`\`\`\n`);
    }
    if (parsed.codeSnippets.javascript) {
      codeSections.push(`**JavaScript:**\n\n\`\`\`javascript\n${parsed.codeSnippets.javascript}\`\`\`\n`);
    }
    if (parsed.codeSnippets.html) {
      codeSections.push(`**HTML:**\n\n\`\`\`html\n${parsed.codeSnippets.html}\`\`\`\n`);
    }
    if (codeSections.length > 0) {
      sections.push(`## Code Solutions\n\n${codeSections.join('\n\n')}`);
    }
  }

  // If no structured content was found, return the raw text
  if (sections.length === 0 && parsed.rawText) {
    return parsed.rawText;
  }

  return sections.join('\n\n');
};
