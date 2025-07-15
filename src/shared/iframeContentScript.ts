
/**
 * Content script that runs inside the iframe to capture events and communicate with parent
 */

interface IframeMessage {
  type: 'IFRAME_MOUSE_MOVE' | 'IFRAME_MOUSE_CLICK' | 'IFRAME_ELEMENT_INFO' | 'IFRAME_READY' | 'IFRAME_ACTIVATE' | 'IFRAME_DEACTIVATE';
  data?: any;
}

interface ElementInfo {
  tag: string;
  id: string;
  classes: string[];
  text: string;
  position: { x: number; y: number };
  rect: { left: number; top: number; width: number; height: number };
  attributes: { name: string; value: string }[];
  parentPath: string;
}

class IframeContentScript {
  private isActive = false;
  private currentElement: HTMLElement | null = null;
  private overlayElement: HTMLElement | null = null;

  constructor() {
    this.setupMessageListener();
    this.setupEventListeners();
    this.notifyParentReady();
    this.createOverlay();
  }

  private setupMessageListener() {
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

  private setupEventListeners() {
    document.addEventListener('mousemove', this.handleMouseMove.bind(this));
    document.addEventListener('click', this.handleClick.bind(this));
  }

  private handleMouseMove(e: MouseEvent) {
    if (!this.isActive) return;

    const target = e.target as HTMLElement;
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

  private handleClick(e: MouseEvent) {
    if (!this.isActive) return;

    e.preventDefault();
    e.stopPropagation();

    const target = e.target as HTMLElement;
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

  private extractElementInfo(element: HTMLElement, event: MouseEvent): ElementInfo {
    const rect = element.getBoundingClientRect();
    const text = element.textContent || element.innerText || '';
    
    // Build parent path
    let parentPath = '';
    let parent = element.parentElement;
    let levels = 0;
    while (parent && levels < 2) {
      const tag = parent.tagName.toLowerCase();
      const id = parent.id ? `#${parent.id}` : '';
      const classes = parent.className ? `.${parent.className.split(' ').join('.')}` : '';
      parentPath = `${tag}${id}${classes}` + (parentPath ? ' > ' + parentPath : '');
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

  private createOverlay() {
    this.overlayElement = document.createElement('div');
    this.overlayElement.id = 'logtrace-iframe-overlay';
    this.overlayElement.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 999999;
      display: none;
    `;
    document.body.appendChild(this.overlayElement);
  }

  private showOverlay() {
    if (this.overlayElement) {
      this.overlayElement.style.display = 'block';
    }
  }

  private hideOverlay() {
    if (this.overlayElement) {
      this.overlayElement.style.display = 'none';
    }
    this.clearHighlight();
  }

  private highlightElement(element: HTMLElement) {
    this.clearHighlight();
    
    const rect = element.getBoundingClientRect();
    const highlight = document.createElement('div');
    highlight.className = 'logtrace-element-highlight';
    highlight.style.cssText = `
      position: fixed;
      left: ${rect.left}px;
      top: ${rect.top}px;
      width: ${rect.width}px;
      height: ${rect.height}px;
      border: 2px solid #06b6d4;
      background: rgba(6, 182, 212, 0.1);
      box-shadow: 0 0 10px rgba(6, 182, 212, 0.5);
      pointer-events: none;
      z-index: 999998;
    `;
    
    if (this.overlayElement) {
      this.overlayElement.appendChild(highlight);
    }
  }

  private clearHighlight() {
    if (this.overlayElement) {
      const highlights = this.overlayElement.querySelectorAll('.logtrace-element-highlight');
      highlights.forEach(highlight => highlight.remove());
    }
  }

  private sendMessageToParent(message: IframeMessage) {
    window.parent.postMessage(message, '*');
  }

  private notifyParentReady() {
    this.sendMessageToParent({ type: 'IFRAME_READY' });
  }
}

// Initialize the content script
if (window.self !== window.top) {
  new IframeContentScript();
}

export default IframeContentScript;
