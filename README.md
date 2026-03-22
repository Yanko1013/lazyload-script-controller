# lazyload-script-controller

Customize the script loading & Optimize Web performance(TBT, LCP, FCP etc.)

## Usage

1. Configure interception rules and a fallback delay in the `head`:

    ```html
    <script>
      const blockLoading = [
        /jquery-3\.7\.1\.min\.js/,
        /slick\.min\.js/,
        /klaviyo\.js/,
        /\/js\/app\.js/
      ];

      const blockExec = [
        /\.slick-carousel/,
        /new\s+Swiper/
      ];

      // Fallback delay (milliseconds)
      const MAX_DELAY_TIME = 5000;
    </script>
    ```

2. Include the interceptor in the `head` (must be before target scripts):

    ```html
    <script src="./controller/interceptor.js"></script>
    ```

3. Include the trigger at the end of `body`:

    ```html
    <script src="./controller/trigger.js"></script>
    ```

4. Scripts to be intercepted:

    - External scripts: lazy-loaded when `src` matches any rule in `blockLoading`.
    - Inline scripts: lazy-loaded when content matches any rule in `blockExec`.

5. Lazy-load trigger timing:

    - First user interaction (`pointerdown/scroll/wheel/keydown/mousemove`)
    - Fallback timeout `MAX_DELAY_TIME`

## How It Works

1. Interception stage (`controller/interceptor.js`)

    - Use `MutationObserver` to watch for newly added `script` elements in the DOM.
    - When a rule matches, set `type="text/lazyload"` and move `src` to `data-src` to block default loading and execution.

2. Trigger stage (`controller/trigger.js`)

    - On user interaction or timeout, restore all `type="text/lazyload"` scripts in order.
    - Restore by creating new `script` nodes and replacing the originals to preserve load/execute order.
    - Temporarily patch `addEventListener`; if `DOMContentLoaded/readystatechange/load/pageshow` already passed, re-dispatch once so listeners still fire.

3. Other

    - Remove the `data-temp-style` styles after all scripts are restored (to avoid layout shifts).

## Notes

1. Understand the code and functionality of the scripts you want to lazy-load.
2. `blockLoading` / `blockExec` must be defined before `interceptor.js`.
3. Lazy-loading changes event timing; as needed, `DOMContentLoaded/readystatechange/load/pageshow` are re-dispatched.
