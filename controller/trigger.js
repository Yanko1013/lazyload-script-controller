const interactions = [
  'pointerdown',
  'scroll',
  'wheel',
  'keydown',
  'mousemove'
];

let loadFlag = false;

function lazyload() {
  if (loadFlag) return;
  loadFlag = true;

  if (typeof scopeObserver !== 'undefined' && scopeObserver) {
    scopeObserver.disconnect();
  }

  const lazyScripts = document.querySelectorAll("script[type='text/lazyload']");
  let currentIndex = 0;

  function restoreListener(ori, object) {
    if(object == document) {
      document.addEventListener = ori;
    } else if(object == window) {
      window.addEventListener = ori;
    }
  };

  function removeTempStyles() {
    document.querySelectorAll('.temp').forEach(i => {
      setTimeout(() => i.remove(), 1000);
    });
  }

  function loadNextScript() {

    if (currentIndex >= lazyScripts.length) {
      removeTempStyles();
      return;
    }
    const originalScript = lazyScripts[currentIndex];
    const newScript = document.createElement('script');

    const originalDocAddEventListener = document.addEventListener.bind(document);
    const originalWinAddEventListener = window.addEventListener.bind(window);

    const scheduleCall = (fn) => setTimeout(fn, 0);
    const readyState = () => document.readyState;

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

    if (originalScript.dataset.src) {
      newScript.onload = () => {
        restoreListener(originalDocAddEventListener, document);
        restoreListener(originalWinAddEventListener, window);
        loadNextScript();
      };
      newScript.onerror = () => {
        restoreListener(originalDocAddEventListener, document);
        restoreListener(originalWinAddEventListener, window);
        loadNextScript();
      };
    } else {
      setTimeout(() => {
        restoreListener(originalDocAddEventListener, document);
        restoreListener(originalWinAddEventListener, window);
        loadNextScript();
      }, 0);
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
