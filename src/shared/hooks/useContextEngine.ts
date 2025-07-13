export interface ContextEngineInputs {
  elementInfo: {
    tag: string;
    id?: string;
    classes?: string[];
    text?: string;
    parentPath?: string;
  };
  computedStyles: Record<string, string>;
  eventListeners: string[];
  consoleLogs: Array<{
    type: 'error' | 'warn';
    message: string;
    timestamp: string;
    stack?: string;
    associatedElement?: string;
  }>;
  userIntent: string;
}

export function useContextEngine(inputs: ContextEngineInputs) {
  // Generates a markdown/code block prompt with all context and user intent
  function generatePrompt(): string {
    const { elementInfo, computedStyles, eventListeners, consoleLogs, userIntent } = inputs;

    // Format key styles
    const stylesString = Object.entries(computedStyles)
      .map(([k, v]) => `${k}: ${v}`)
      .join('; ');

    // Format event listeners
    const listenersString = eventListeners.length > 0 ? eventListeners.join(', ') : 'None';

    // Format console logs (only for this element)
    const logsString = consoleLogs.length > 0
      ? consoleLogs.map(log =>
          `[${log.timestamp}] ${log.type.toUpperCase()}: ${log.message}${log.stack ? `\n${log.stack}` : ''}`
        ).join('\n')
      : 'None';

    // Format classes
    const classesString = elementInfo.classes && elementInfo.classes.length > 0
      ? '.' + elementInfo.classes.join('.')
      : '';

    // Markdown block
    return [
      '## UI Element Context',
      '',
      `- **Tag:** ${elementInfo.tag}`,
      elementInfo.id ? `- **ID:** #${elementInfo.id}` : '',
      elementInfo.classes && elementInfo.classes.length > 0 ? `- **Classes:** ${classesString}` : '',
      elementInfo.parentPath ? `- **Hierarchy:** ${elementInfo.parentPath}` : '',
      elementInfo.text ? `- **Text:** "${elementInfo.text}"` : '',
      stylesString ? `- **Key Styles:** ${stylesString}` : '',
      `- **Event Listeners:** ${listenersString}`,
      `- **Console Errors:** ${logsString}`,
      userIntent ? `- **User Intent:** ${userIntent}` : '',
      '',
      '---',
      'Please provide a fix or suggestion for this element.'
    ].filter(Boolean).join('\n');
  }

  return { generatePrompt };
} 