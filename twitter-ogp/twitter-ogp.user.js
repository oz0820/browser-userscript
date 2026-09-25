// ==UserScript==
// @name            Twitter OGP
// @namespace       https://twitter.com/oz0820
// @version         2026.09.25.0
// @description     TwitterのOGPタイトルなどを復活させます
// @author          oz0820
// @match           https://x.com/*
// @match           https://twitter.com/*
// @match           https://pro.twitter.com/*
// @updateURL       https://github.com/oz0820/browser-userscript/raw/main/twitter-ogp/twitter-ogp.user.js
// @icon            https://www.google.com/s2/favicons?sz=64&domain=twitter.com
// ==/UserScript==

(function () {
    'use strict';

    const CARD_MARKER = 'twitterOgpRestored';
    const CARD_HREF = 'twitterOgpHref';
    const CARD_TITLE = 'twitterOgpTitle';
    const CARD_DOMAIN = 'twitterOgpDomain';
    const DETAIL_CLASS = 'twitter-ogp-detail-link';
    const NATIVE_DOMAIN_MARKER = 'twitterOgpNativeDomain';
    const FRAME_MARKER = 'twitterOgpCardFrame';
    const OVERLAY_MARKER = 'twitterOgpNativeOverlay';

    let updateScheduled = false;

    const style = document.createElement('style');
    style.textContent = `
        a[data-twitter-ogp-restored="true"],
        [data-twitter-ogp-card-frame="true"] {
            border-bottom-left-radius: 0 !important;
            border-bottom-right-radius: 0 !important;
        }

        .${DETAIL_CLASS} {
            display: block;
            min-width: 0;
            margin-top: -0.25rem;
            padding: 12px;
            box-sizing: border-box;
            color: inherit;
            background-color: color-mix(in srgb, currentColor 4%, transparent);
            border: 1px solid color-mix(in srgb, currentColor 14%, transparent);
            border-top: 0;
            border-radius: 0 0 0.75rem 0.75rem;
            text-decoration: none;
        }

        .${DETAIL_CLASS}:hover {
            text-decoration: none;
        }

        .twitter-ogp-detail {
            display: flex;
            flex-direction: column;
            flex: 1 1 auto;
            min-width: 0;
            gap: 2px;
            justify-content: center;
        }

        .twitter-ogp-detail-domain,
        .twitter-ogp-detail-title {
            max-width: 100%;
            overflow: hidden;
            font-family: TwitterChirp, -apple-system, BlinkMacSystemFont,
                "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            font-size: 15px;
            font-weight: 400;
            line-height: 20px;
            text-overflow: ellipsis;
            white-space: nowrap;
            overflow-wrap: normal;
        }

        .twitter-ogp-detail-domain {
            color: inherit;
            opacity: 0.6;
        }

        .twitter-ogp-detail-title {
            color: inherit;
        }

        [data-twitter-ogp-native-overlay="true"],
        [data-twitter-ogp-native-domain="true"] {
            display: none !important;
        }
    `;
    (document.head || document.documentElement).appendChild(style);

    /**
     * 装飾用のdivが増減しても、既存テキストだけを書き換えられるように
     * 単一の子要素をたどって最も内側の要素を取得する。
     */
    function findTextElement(element) {
        let current = element;

        while (current && current.children.length === 1) {
            const child = current.firstElementChild;

            if (!child || child.tagName === 'IMG') {
                break;
            }

            current = child;
        }

        return current;
    }

    function getText(element) {
        return element?.textContent?.trim() ?? '';
    }

    function getComparableHref(anchor) {
        try {
            return new URL(anchor.getAttribute('href'), location.href).href;
        } catch (_) {
            return '';
        }
    }

    function setTextIfChanged(element, text) {
        if (!element) {
            return;
        }

        if (getText(element) !== text) {
            element.textContent = text;
        }
    }

    function setAttributeIfChanged(element, name, value) {
        if (!element) {
            return;
        }

        if (element.getAttribute(name) !== value) {
            element.setAttribute(name, value);
        }
    }

    function setDataIfChanged(element, key, value) {
        if (element.dataset[key] !== value) {
            element.dataset[key] = value;
        }
    }

    /**
     * 未ログイン画面ではカードリンクとドメインリンクが直兄弟、
     * ログイン後画面ではカード枠とドメイン枠が兄弟になっている。
     * 直兄弟の既存検索を最初に行い、見つからなければ祖先を最大4段だけ上がる。
     */
    function findDomainPlacement(cardLink, cardHref) {
        let frameElement = cardLink;

        for (let depth = 0; depth <= 4 && frameElement; depth += 1) {
            let sibling = frameElement.nextElementSibling;
            let existingDetail = null;

            if (sibling?.classList.contains(DETAIL_CLASS)) {
                existingDetail = sibling;
                sibling = sibling.nextElementSibling;
            }

            if (sibling) {
                const candidates = sibling.matches('a[href]')
                    ? [sibling]
                    : Array.from(sibling.querySelectorAll('a[href]'));
                const nativeDomainLink = candidates.find(anchor =>
                    getComparableHref(anchor) === cardHref && getText(anchor));

                if (nativeDomainLink) {
                    return {
                        nativeDomainLink,
                        nativeDomainHost: sibling,
                        insertionReference: sibling,
                        existingDetail,
                        frameElement,
                    };
                }
            }

            frameElement = frameElement.parentElement;
        }

        return null;
    }

    /**
     * 現行Xのリンクカードは、画像とタイトルを持つリンクの直後に、
     * 同じURLを指すドメイン表示用リンクが配置されている。
     * X固有のdata-testidや難読化されたclass名には依存しない。
     */
    function getCardParts(cardLink) {
        if (!(cardLink instanceof HTMLAnchorElement)) {
            return null;
        }

        const imageContainer = Array.from(cardLink.children)
            .find(child => child.querySelector('img'));
        const overlayContainer = Array.from(cardLink.children)
            .find(child => child !== imageContainer && getText(child));

        if (!imageContainer || !overlayContainer) {
            return null;
        }

        const cardHref = getComparableHref(cardLink);
        const placement = findDomainPlacement(cardLink, cardHref);

        if (!cardHref || !placement) {
            return null;
        }

        const overlayTextElement = findTextElement(overlayContainer);

        if (!getText(overlayTextElement) ||
            !getText(placement.nativeDomainLink)) {
            return null;
        }

        return {
            cardHref,
            overlayContainer,
            overlayTextElement,
            ...placement,
        };
    }

    function createDetailLink(cardLink, insertionReference) {
        const detailLink = document.createElement('a');
        detailLink.className = DETAIL_CLASS;
        detailLink.href = cardLink.href;
        detailLink.target = cardLink.target || '_blank';
        detailLink.rel = cardLink.rel || 'noopener noreferrer';

        const detail = document.createElement('div');
        detail.className = 'twitter-ogp-detail';
        detail.dataset.testid = 'card.layoutLarge.detail';

        const domain = document.createElement('div');
        domain.className = 'twitter-ogp-detail-domain';
        domain.dir = 'auto';

        const title = document.createElement('div');
        title.className = 'twitter-ogp-detail-title';
        title.dir = 'auto';

        detail.append(domain, title);
        detailLink.appendChild(detail);
        insertionReference.before(detailLink);

        return detailLink;
    }

    function updateDetailLink(detailLink, href, domainText, titleText) {
        setAttributeIfChanged(detailLink, 'href', href);
        setAttributeIfChanged(
            detailLink,
            'aria-label',
            `${domainText} ${titleText}`,
        );
        let domainElement = detailLink.querySelector(
            '.twitter-ogp-detail-domain',
        );
        const titleElement = detailLink.querySelector(
            '.twitter-ogp-detail-title',
        );

        if (!domainElement) {
            domainElement = document.createElement('div');
            domainElement.className = 'twitter-ogp-detail-domain';
            domainElement.dir = 'auto';
            titleElement?.before(domainElement);
        }

        setTextIfChanged(domainElement, domainText);
        setTextIfChanged(
            titleElement,
            titleText,
        );
    }

    function restoreCard(cardLink) {
        const parts = getCardParts(cardLink);

        if (!parts) {
            return;
        }

        const overlayText = getText(parts.overlayTextElement);
        const domainText = getText(parts.nativeDomainLink);
        const isSameCard = cardLink.dataset[CARD_MARKER] === 'true' &&
            cardLink.dataset[CARD_HREF] === parts.cardHref;
        let titleText = cardLink.dataset[CARD_TITLE];

        // 初回処理、またはタイムラインの仮想化で別カードに再利用された場合。
        if (!isSameCard) {
            titleText = overlayText;
            setDataIfChanged(cardLink, CARD_MARKER, 'true');
            setDataIfChanged(cardLink, CARD_HREF, parts.cardHref);
            setDataIfChanged(cardLink, CARD_TITLE, titleText);
            setDataIfChanged(cardLink, CARD_DOMAIN, domainText);
        } else if (overlayText !== cardLink.dataset[CARD_DOMAIN] &&
            overlayText !== domainText) {
            // X側が同じ要素へ新しいOGPタイトルを再描画した場合。
            titleText = overlayText;
            setDataIfChanged(cardLink, CARD_TITLE, titleText);
        }

        setDataIfChanged(cardLink, CARD_DOMAIN, domainText);
        setDataIfChanged(
            parts.overlayContainer,
            OVERLAY_MARKER,
            'true',
        );

        let detailLink = parts.existingDetail;

        if (!detailLink) {
            detailLink = createDetailLink(
                cardLink,
                parts.insertionReference,
            );
        }

        updateDetailLink(
            detailLink,
            parts.cardHref,
            domainText,
            titleText,
        );

        setDataIfChanged(
            parts.nativeDomainHost,
            NATIVE_DOMAIN_MARKER,
            'true',
        );
        setDataIfChanged(parts.frameElement, FRAME_MARKER, 'true');
    }

    function updateCards() {
        updateScheduled = false;

        // 対象を特定のポスト画面へ限定せず、現在DOMに存在するリンクを
        // 構造から判定するため、個別ページ・タイムライン・引用ポストで動作する。
        document.querySelectorAll('a[href]').forEach(restoreCard);
    }

    function scheduleUpdate() {
        if (updateScheduled) {
            return;
        }

        updateScheduled = true;
        requestAnimationFrame(updateCards);
    }

    const observer = new MutationObserver(scheduleUpdate);
    observer.observe(document.documentElement, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['href'],
    });

    scheduleUpdate();
})();
