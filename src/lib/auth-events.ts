export const notifyTokenChanged = (): void => {
  window.dispatchEvent(new Event('guitars:token-changed'));
};
