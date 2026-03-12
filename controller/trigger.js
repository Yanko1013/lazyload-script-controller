const readyState = () => document.readyState;
const scheduleCall = (fn) => setTimeout(fn, 0);

const documentRules = {
  DOMContentLoaded: {
    shouldFire: () => readyState() === 'interactive' || readyState() === 'complete',
    createEvent: () => new Event('DOMContentLoaded')
  },
  readystatechange: {
    shouldFire: () => readyState() === 'interactive' || readyState() === 'complete',
    createEvent: () => new Event('readystatechange')
  }
};

const windowRules = {
  load: {
    shouldFire: () => readyState() === 'complete',
    createEvent: () => new Event('load')
  },
  DOMContentLoaded: {
    shouldFire: () => readyState() === 'interactive' || readyState() === 'complete',
    createEvent: () => new Event('DOMContentLoaded')
  },
  pageshow: {
    shouldFire: () => readyState() === 'complete',
    createEvent: () => {
      if (typeof PageTransitionEvent === 'function') {
        return new PageTransitionEvent('pageshow', { persisted: false });
      }
      return new Event('pageshow');
    }
  }
};

function createPatchedAddEventListener(target, original, rules) {
  return function (type, listener, options) {
    const rule = rules[type];
    if (!rule) {
      original(type, listener, options);
      return;
    }
    if (rule.shouldFire()) {
      scheduleCall(() => listener.call(target, rule.createEvent()));
    } else {
      original(type, listener, options);
    }
  };
}

function patchEventTargets() {
  const originalDocAddEventListener = document.addEventListener.bind(document);
  const originalWinAddEventListener = window.addEventListener.bind(window);

  document.addEventListener = createPatchedAddEventListener(
    document,
    originalDocAddEventListener,
    documentRules
  );
  window.addEventListener = createPatchedAddEventListener(
    window,
    originalWinAddEventListener,
    windowRules
  );

  return () => {
    document.addEventListener = originalDocAddEventListener;
    window.addEventListener = originalWinAddEventListener;
  };
}

function cloneLazyScript(originalScript) {
  const newScript = document.createElement('script');
  if (originalScript.dataset.src) {
    newScript.src = originalScript.dataset.src;
  }
  for (const attr of originalScript.attributes) {
    if (attr.name !== 'data-type' && attr.name !== 'data-src') {
      newScript.setAttribute(attr.name, attr.value);
    }
  }
  newScript.type = originalScript.dataset.type || 'text/javascript';
  if (originalScript.textContent.trim()) {
    newScript.textContent = originalScript.textContent;
  }
  return newScript;
}

function lazyload() {
  if (loadFlag) return;
  loadFlag = true;

  if (typeof scopeObserver !== 'undefined' && scopeObserver) {
    scopeObserver.disconnect();
  }

  const lazyScripts = Array.from(document.querySelectorAll("script[type='text/lazyload']"));
  let currentIndex = 0;

  function removeTempStyles() {
    document.querySelectorAll('.temp-style').forEach(i => {
      setTimeout(() => i.remove(), 1000);
    });
  }

  function loadNextScript() {
    if (currentIndex >= lazyScripts.length) {
      removeTempStyles();
      return;
    }
    const originalScript = lazyScripts[currentIndex];
    const newScript = cloneLazyScript(originalScript);
    const restoreListeners = patchEventTargets();

    const finalize = () => {
      restoreListeners();
      loadNextScript();
    };

    if (originalScript.dataset.src) {
      newScript.onload = finalize;
      newScript.onerror = finalize;
    } else {
      scheduleCall(finalize);
    }

    originalScript.parentNode.replaceChild(newScript, originalScript);
    currentIndex++;
  }

  loadNextScript();
}

document.addEventListener('DOMContentLoaded', () => {
  interactions.forEach(function (eventType) {
    window.addEventListener(eventType, lazyload, {
      passive: true,
      once: true
    });
  });
});

setTimeout(() => {
  lazyload();
}, maxDelayBeforeLazyloadMs);
