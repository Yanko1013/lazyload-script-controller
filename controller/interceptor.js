let originalOnload = window.onload;

Object.defineProperty(window, 'onload', {
  set(fn) {
    if (document.readyState === 'complete') {
      setTimeout(() => fn.call(window, new Event('load')), 0);
    } else {
      originalOnload = fn;
    }
  },
  get() {
    return originalOnload;
  }
});


const matchesAny = (patterns, value) => {
  if (!Array.isArray(patterns) || !value) return false;
  return patterns.some((pattern) => {
    if (pattern instanceof RegExp) return pattern.test(value);
    if (typeof pattern === 'string') return value.includes(pattern);
    return false;
  });
};

const getBlockLoading = () =>
  (typeof blockLoading !== 'undefined' && Array.isArray(blockLoading)) ? blockLoading : [];

const getBlockExec = () =>
  (typeof blockExec !== 'undefined' && Array.isArray(blockExec)) ? blockExec : [];

const shouldBlock = (node) => {
  const src = node.getAttribute('src');
  if (src) {
    return matchesAny(getBlockLoading(), src);
  }
  const text = node.textContent || '';
  return matchesAny(getBlockExec(), text);
};

const setLazy = (node) => {
  if (node.type === 'text/lazyload') return;
  node.dataset.type = node.type || 'text/javascript';
  node.type = 'text/lazyload';

  const src = node.getAttribute('src');
  if (src) {
    node.dataset.src = src;
    node.removeAttribute('src');
  }
};

const scopeObserver = new MutationObserver(mutations => {
  for (const { addedNodes } of mutations) {
    for (const node of addedNodes) {
      if (node.nodeType !== Node.ELEMENT_NODE || node.tagName !== 'SCRIPT') continue;
      if (!shouldBlock(node)) continue;
      setLazy(node);
    }
  }
});

scopeObserver.observe(document.documentElement, {
  childList: true,
  subtree: true
});
