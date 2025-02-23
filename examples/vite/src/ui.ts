export function updateElement(element: Element, content: string) {
    element.innerHTML = content;
  }
  
  export function addEvent(element: HTMLElement, event: string, handler: () => void) {
    element.addEventListener(event, handler);
  }