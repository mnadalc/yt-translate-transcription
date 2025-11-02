/**
 * Helper function to get an element with type checking.
 *
 * @param {string} selector - The selector to get the element from.
 * @param {new () => T} type - The type of the element to get given the constructor.
 *
 * @returns {T} The element.
 */
export function getElement<T extends HTMLElement>(
  selector: string,
  type: new () => T
): T {
  const element = document.querySelector<T>(selector);

  if (!element) {
    throw new Error(`Element not found: ${selector}`);
  }

  if (!(element instanceof type)) {
    throw new Error(`Element ${selector} is not of type ${type.name}`);
  }

  return element;
}

/**
 * Helper function to set the message status for what the user is doing.
 *
 * @param {"info" | "error" | "success"} type - The type of the status to set.
 * @param {string} message - The message to set the status to.
 */
export function setStatus(
  element: HTMLDivElement,
  type: "info" | "error" | "success",
  message: string
) {
  element.textContent = message;
  element.className = `status ${type}`;
  element.classList.remove("hidden");
}
