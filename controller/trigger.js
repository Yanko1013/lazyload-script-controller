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
    document.addEventListener = function (type, listener, options) {
      if (type === 'DOMContentLoaded') {
        if (document.readyState === 'complete' || document.readyState === 'interactive') {
          setTimeout(() => listener.call(this, new Event('DOMContentLoaded')), 0);
        } else {
          originalDocAddEventListener(type, listener, options);
        }
        return;
      }
      if (type === 'readystatechange') {
        if (document.readyState === 'interactive' || document.readyState === 'complete') {
          setTimeout(() => listener.call(this, new Event('readystatechange')), 0);
        } else {
          originalDocAddEventListener(type, listener, options);
        }
        return;
      }
      originalDocAddEventListener(type, listener, options);
    };

    const originalWinAddEventListener = window.addEventListener.bind(window);

    window.addEventListener = function (type, listener, options) {
      if (type === 'load') {
        if (document.readyState === 'complete') {
          setTimeout(() => listener.call(window, new Event('load')), 0);
        } else {
          originalWinAddEventListener(type, listener, options);
        }
        return;
      }
      if (type === 'DOMContentLoaded') {
        if (document.readyState === 'complete' || document.readyState === 'interactive') {
          setTimeout(() => listener.call(window, new Event('DOMContentLoaded')), 0);
        } else {
          originalWinAddEventListener(type, listener, options);
        }
        return;
      }
      if (type === 'pageshow') {
        if (document.readyState === 'complete') {
          setTimeout(() => {
            if (typeof PageTransitionEvent === 'function') {
              listener.call(window, new PageTransitionEvent('pageshow', { persisted: false }));
            } else {
              listener.call(window, new Event('pageshow'));
            }
          }, 0);
        } else {
          originalWinAddEventListener(type, listener, options);
        }
        return;
      }
      originalWinAddEventListener(type, listener, options);
    };


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
}, setTimeoutTiming);
