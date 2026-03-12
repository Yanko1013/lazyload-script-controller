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
  if (!Array.isArray(patterns)) return false;
  return patterns.some((pattern) => {
    if (pattern instanceof RegExp) return pattern.test(value);
    if (typeof pattern === 'string') return value.includes(pattern);
    return false;
  });
};

const shouldBlock = (node) => {
  if (node.src) {
    return matchesAny(blockLoading, node.src);
  }
  const text = node.textContent || '';
  return matchesAny(blockExec, text);
};

const setLazy = (node) => {
  node.dataset.type = node.type || 'text/javascript';
  node.type = 'text/lazyload';

  if (node.src) {
    node.dataset.src = node.src;
    node.removeAttribute('src');
  }
};

const scopeObserver = new MutationObserver(mutations => {
  for (const { addedNodes } of mutations) {
    for (const node of addedNodes) {
      if (node.nodeType !== 1 || node.tagName !== 'SCRIPT') continue;
      if (!shouldBlock(node)) continue;
      setLazy(node);
    }
  }
});

scopeObserver.observe(document.documentElement, {
  childList: true,
  subtree: true
});
