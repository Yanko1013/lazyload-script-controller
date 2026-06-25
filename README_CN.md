# lazyload-script-controller

通过自定义控制器，延迟脚本加载和执行，实现优化 Web 性能（TBT、LCP、FCP 等）。

## 用法

1. 在页面 `head` 里先配置拦截规则与兜底时间：

    ```html
    <script>
      const blockSrc = [
        /jquery-3\.7\.1\.min\.js/,
        /slick\.min\.js/,
        /klaviyo\.js/,
        /\/js\/app\.js/
      ];

      const blockInline = [
        /\.slick-carousel/,
        /new\s+Swiper/
      ];

      // 兜底延迟（毫秒）
      const MAX_DELAY_TIME = 5000;
    </script>
    ```

2. 在 `head` 中引入拦截器（必须在目标脚本之前）：

    ```html
    <script src="./controller/interceptor.js"></script>
    ```

3. 页面底部引入触发器：

    ```html
    <script src="./controller/trigger.js"></script>
    ```

4. 需要被拦截的脚本：

    - 外链脚本：`src` 匹配 `blockSrc` 任一规则时会被转成懒加载。
    - 内联脚本：内容匹配 `blockInline` 任一规则时会被转成懒加载。

5. 懒加载触发时机：

    - 首次用户交互（`pointerdown/scroll/wheel/keydown/mousemove`）
    - 兜底超时 `MAX_DELAY_TIME`

## 原理

1. 拦截阶段（`controller/interceptor.js`）

    - 使用 `MutationObserver` 监听 DOM 中新增的 `script`。
    - 规则命中后，将脚本改为 `type="text/lazyload"`，并把 `src` 挪到 `data-src`，阻断浏览器默认加载与执行。

2. 触发阶段（`controller/trigger.js`）

    - 在用户交互或超时触发时，按顺序恢复所有 `type="text/lazyload"` 脚本。
    - 恢复时创建新 `script` 节点并替换原节点，保证加载与执行顺序。
    - 在恢复过程中临时补丁 `addEventListener`，如果 `DOMContentLoaded/readystatechange/load/pageshow` 已经过期则补发一次，保证监听器仍然生效。

3. 其他

    - 所有脚本恢复后移除 `data-temp-style` 样式（避免布局抖动）。

## 注意事项

1. 了解你要懒加载的脚本代码、功能。
2. `blockSrc` / `blockInline` 需要在 `interceptor.js` 之前定义。
3. 懒加载会改变事件触发时机，根据情况补发 `DOMContentLoaded/readystatechange/load/pageshow`。
