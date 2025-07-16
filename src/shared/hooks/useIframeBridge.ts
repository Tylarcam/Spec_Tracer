
/**
 * Hook for managing iframe communication and event bridging
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { ElementInfo } from '../types';

interface IframeElementInfo {
  tag: string;
  id: string;
  classes: string[];
  text: string;
  position: { x: number; y: number };
  rect: { left: number; top: number; width: number; height: number };
  attributes: { name: string; value: string }[];
  parentPath: string;
}

export const useIframeBridge = (iframeRef: React.RefObject<HTMLIFrameElement>) => {
  const [isIframeReady, setIsIframeReady] = useState(false);
  const [iframeElement, setIframeElement] = useState<ElementInfo | null>(null);
  const [iframeMousePosition, setIframeMousePosition] = useState({ x: 0, y: 0 });
  const [isSameOrigin, setIsSameOrigin] = useState(false);
  const contentScriptInjected = useRef(false);

  // Check if iframe is same-origin
  const checkSameOrigin = useCallback(() => {
    if (!iframeRef.current) return false;
    
    try {
      // Try to access iframe's document - will throw if cross-origin
      const iframeDoc = iframeRef.current.contentDocument;
      return !!iframeDoc;
    } catch (error) {
      return false;
    }
  }, [iframeRef]);

  // Inject content script for cross-origin iframes
  const injectContentScript = useCallback(() => {
    if (!iframeRef.current || contentScriptInjected.current) return;

    const isSameOriginCheck = checkSameOrigin();
    setIsSameOrigin(isSameOriginCheck);

    if (isSameOriginCheck) {
      // For same-origin, inject script directly
      try {
        const iframeDoc = iframeRef.current.contentDocument;
        if (iframeDoc) {
          const script = iframeDoc.createElement('script');
          script.type = 'module';
          script.textContent = `
            // Inline content script for same-origin iframe
            ${getContentScriptCode()}
          `;
          iframeDoc.head.appendChild(script);
          contentScriptInjected.current = true;
        }
      } catch (error) {
        console.error('Failed to inject same-origin content script:', error);
      }
    } else {
      // For cross-origin, we need to handle via postMessage only
      // The content script would need to be injected by the iframe itself
      console.log('Cross-origin iframe detected - content script injection not possible');
    }
  }, [iframeRef, checkSameOrigin]);

  // Handle messages from iframe
  const handleIframeMessage = useCallback((event: MessageEvent) => {
    if (!event.data?.type) return;

    switch (event.data.type) {
      case 'IFRAME_READY':
        setIsIframeReady(true);
        break;
      
      case 'IFRAME_MOUSE_MOVE':
        if (event.data.data) {
          const { position, element } = event.data.data;
          setIframeMousePosition(position);
          
          if (element) {
            // Convert iframe element info to ElementInfo format
            const elementInfo: ElementInfo = {
              tag: element.tag,
              id: element.id,
              classes: element.classes,
              text: element.text,
              element: null as any, // We can't access the actual element cross-origin
              parentPath: element.parentPath,
              attributes: element.attributes,
              size: { width: element.rect.width, height: element.rect.height }
            };
            setIframeElement(elementInfo);
          }
        }
        break;
      
      case 'IFRAME_MOUSE_CLICK':
        if (event.data.data) {
          const { position, element } = event.data.data;
          // Handle iframe click events
          console.log('Iframe click:', { position, element });
        }
        break;
    }
  }, []);

  // Activate/deactivate iframe tracking
  const activateIframe = useCallback(() => {
    if (iframeRef.current && isIframeReady) {
      iframeRef.current.contentWindow?.postMessage({ type: 'IFRAME_ACTIVATE' }, '*');
    }
  }, [iframeRef, isIframeReady]);

  const deactivateIframe = useCallback(() => {
    if (iframeRef.current && isIframeReady) {
      iframeRef.current.contentWindow?.postMessage({ type: 'IFRAME_DEACTIVATE' }, '*');
    }
  }, [iframeRef, isIframeReady]);

  // Setup message listener
  useEffect(() => {
    window.addEventListener('message', handleIframeMessage);
    return () => window.removeEventListener('message', handleIframeMessage);
  }, [handleIframeMessage]);

  // Inject content script when iframe loads
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const handleLoad = () => {
      // Small delay to ensure iframe is fully loaded
      setTimeout(() => {
        injectContentScript();
      }, 100);
    };

    iframe.addEventListener('load', handleLoad);
    return () => iframe.removeEventListener('load', handleLoad);
  }, [iframeRef, injectContentScript]);

  return {
    isIframeReady,
    isSameOrigin,
    iframeElement,
    iframeMousePosition,
    activateIframe,
    deactivateIframe
  };
};

// Get the content script code as a string
function getContentScriptCode(): string {
  return `
    class IframeContentScript {
      constructor() {
        this.isActive = false;
        this.currentElement = null;
        this.overlayElement = null;
        this.setupMessageListener();
        this.setupEventListeners();
        this.notifyParentReady();
        this.createOverlay();
      }

      setupMessageListener() {
        window.addEventListener('message', (event) => {
          if (event.data?.type === 'IFRAME_ACTIVATE') {
            this.isActive = true;
            this.showOverlay();
          } else if (event.data?.type === 'IFRAME_DEACTIVATE') {
            this.isActive = false;
            this.hideOverlay();
          }
        });
      }

      setupEventListeners() {
        document.addEventListener('mousemove', this.handleMouseMove.bind(this));
        document.addEventListener('click', this.handleClick.bind(this));
      }

      handleMouseMove(e) {
        if (!this.isActive) return;
        
        const target = e.target;
        if (target && target !== this.overlayElement) {
          this.currentElement = target;
          this.highlightElement(target);
          
          const elementInfo = this.extractElementInfo(target, e);
          this.sendMessageToParent({
            type: 'IFRAME_MOUSE_MOVE',
            data: {
              position: { x: e.clientX, y: e.clientY },
              element: elementInfo
            }
          });
        }
      }

      handleClick(e) {
        if (!this.isActive) return;
        
        e.preventDefault();
        e.stopPropagation();
        
        const target = e.target;
        if (target && target !== this.overlayElement) {
          const elementInfo = this.extractElementInfo(target, e);
          this.sendMessageToParent({
            type: 'IFRAME_MOUSE_CLICK',
            data: {
              position: { x: e.clientX, y: e.clientY },
              element: elementInfo
            }
          });
        }
      }

      extractElementInfo(element, event) {
        const rect = element.getBoundingClientRect();
        const text = element.textContent || element.innerText || '';
        
        let parentPath = '';
        let parent = element.parentElement;
        let levels = 0;
        while (parent && levels < 2) {
          const tag = parent.tagName.toLowerCase();
          const id = parent.id ? '#' + parent.id : '';
          const classes = parent.className ? '.' + parent.className.split(' ').join('.') : '';
          parentPath = tag + id + classes + (parentPath ? ' > ' + parentPath : '');
          parent = parent.parentElement;
          levels++;
        }

        return {
          tag: element.tagName.toLowerCase(),
          id: element.id || '',
          classes: Array.from(element.classList),
          text: text.slice(0, 100),
          position: { x: event.clientX, y: event.clientY },
          rect: { left: rect.left, top: rect.top, width: rect.width, height: rect.height },
          attributes: Array.from(element.attributes).map(attr => ({ name: attr.name, value: attr.value })),
          parentPath
        };
      }

      createOverlay() {
        this.overlayElement = document.createElement('div');
        this.overlayElement.id = 'logtrace-iframe-overlay';
        this.overlayElement.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 999999; display: none;';
        document.body.appendChild(this.overlayElement);
      }

      showOverlay() {
        if (this.overlayElement) {
          this.overlayElement.style.display = 'block';
        }
      }

      hideOverlay() {
        if (this.overlayElement) {
          this.overlayElement.style.display = 'none';
        }
        this.clearHighlight();
      }

      highlightElement(element) {
        this.clearHighlight();
        
        const rect = element.getBoundingClientRect();
        const highlight = document.createElement('div');
        highlight.className = 'logtrace-element-highlight';
        highlight.style.cssText = 'position: fixed; left: ' + rect.left + 'px; top: ' + rect.top + 'px; width: ' + rect.width + 'px; height: ' + rect.height + 'px; border: 2px solid #06b6d4; background: rgba(6, 182, 212, 0.1); box-shadow: 0 0 10px rgba(6, 182, 212, 0.5); pointer-events: none; z-index: 999998;';
        
        if (this.overlayElement) {
          this.overlayElement.appendChild(highlight);
        }
      }

      clearHighlight() {
        if (this.overlayElement) {
          const highlights = this.overlayElement.querySelectorAll('.logtrace-element-highlight');
          highlights.forEach(highlight => highlight.remove());
        }
      }

      sendMessageToParent(message) {
        window.parent.postMessage(message, '*');
      }

      notifyParentReady() {
        this.sendMessageToParent({ type: 'IFRAME_READY' });
      }
    }

    if (window.self !== window.top) {
      new IframeContentScript();
    }
  `;
}
