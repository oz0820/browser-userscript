// ==UserScript==
// @name         DLSite title copy button
// @namespace    https://twitter.com/oz0820
// @version      2026.11.23.0
// @description  DLSiteの作品ページで，DOJINDBに飛ぶボタンと，タイトル(作品名)をコピーするボタンを追加する
// @author       oz0820
// @match        https://www.dlsite.com/*
// @updateURL    https://github.com/oz0820/browser-userscript/raw/main/dlsite-title-copy-button/dlsite-title-copy-button.user.js
// @icon         https://www.google.com/s2/favicons?sz=64&domain=dlsite.com
// ==/UserScript==

(function() {
    const productPath = /^\/[\w-]+\/work\/=\/product_id\/\w+\.html(?:\/|$)/;
    const listPath = /^\/[\w-]+\/(?:mypage\/wishlist|circle\/profile\/=\/maker_id)(?:\/|$)/;
    const titleSelector = 'h1#work_name, h1.headline__title';
    const controlsSelector = '[data-dlsite-title-copy-controls]';
    const linkSelector = 'a[data-dlsite-dojindb-link]';

    function dojindbUrl(workUrl) {
        return 'https://dojindb.net/rd?' + new URLSearchParams({u: workUrl});
    }

    function createDojindbLink(href, iconHeight) {
        const icon = document.createElement('img');
        icon.src = 'https://www.google.com/s2/favicons?sz=64&domain=dojindb.net';
        icon.alt = 'DOJINDB';
        icon.style.height = iconHeight;

        const link = document.createElement('a');
        link.href = href;
        link.target = '_blank';
        link.rel = 'noopener';
        link.title = 'DOJINDBに飛びます';
        link.setAttribute('data-dlsite-dojindb-link', '');
        link.appendChild(icon);
        return link;
    }

    function renderTitleButtons() {
        const heading = document.querySelector(titleSelector);
        if (!heading) return;

        const href = dojindbUrl(location.href);
        let controls = heading.parentElement.querySelector(':scope > ' + controlsSelector);
        if (!controls) {
            const copyButton = document.createElement('button');
            copyButton.type = 'button';
            copyButton.textContent = 'コピー';
            copyButton.addEventListener('click', () => {
                const title = document.querySelector(titleSelector)?.textContent.trim();
                if (title) copyToClipboard(title).catch(console.error);
            });

            controls = document.createElement('span');
            controls.setAttribute('data-dlsite-title-copy-controls', '');
            controls.style.display = 'inline-flex';
            controls.style.alignItems = 'center';
            controls.style.gap = '6px';
            controls.style.marginInlineStart = '10px';
            controls.append(copyButton, createDojindbLink(href, '26px'));
        }

        if (heading.nextElementSibling !== controls) heading.after(controls);
        const link = controls.querySelector(linkSelector);
        if (link.href !== href) link.href = href;
    }

    function renderListLinks() {
        document.querySelectorAll('dl > dd.work_price_wrap').forEach(price => {
            const links = price.parentElement.querySelectorAll('a[href*="/work/=/product_id/"]');
            const work = Array.from(links).find(link =>
                link.origin === location.origin && productPath.test(link.pathname)
            );
            if (!work) return;

            const href = dojindbUrl(work.href);
            const existing = price.querySelector(linkSelector);
            if (existing) {
                if (existing.href !== href) existing.href = href;
                return;
            }

            const link = createDojindbLink(href, '16px');
            link.style.marginInlineStart = '6px';
            price.appendChild(link);
        });
    }

    async function copyToClipboard(text) {
        if (navigator.clipboard) {
            try {
                await navigator.clipboard.writeText(text);
                return;
            } catch {
                // Clipboard API を使えない場合は従来の方法を試す。
            }
        }

        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        try {
            textarea.select();
            if (!document.execCommand('copy')) throw new Error('作品名をコピーできませんでした。');
        } finally {
            textarea.remove();
        }
    }

    function renderButtons() {
        if (productPath.test(location.pathname)) {
            renderTitleButtons();
        } else if (listPath.test(location.pathname)) {
            renderListLinks();
        }
    }

    // ページ内遷移や、後から描画・置換された要素にも対応する。
    let renderScheduled = false;
    function scheduleRender() {
        if (renderScheduled) return;
        renderScheduled = true;
        requestAnimationFrame(() => {
            renderScheduled = false;
            renderButtons();
        });
    }

    renderButtons();
    new MutationObserver(scheduleRender).observe(document.documentElement, {
        childList: true,
        characterData: true,
        subtree: true,
    });
    window.addEventListener('popstate', scheduleRender);
})();
