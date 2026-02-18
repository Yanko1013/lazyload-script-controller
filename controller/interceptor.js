const blockLoading = [
  'jquery-3.7.1.min.js',
  'slick.min.js',
  'klaviyo.js',
  'js/app.js'
];

const blockExec = [
  '.slick-carousel',
  'new Swiper'
];

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


const shouldBlock = (node) => {
  if (node.src) {
    return blockLoading.some(k => node.src.includes(k));
  }
  return blockExec.some(k => node.textContent.includes(k));
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