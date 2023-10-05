// ==UserScript==
// @name            Twitter OGP
// @namespace       https://twitter.com/oz0820
// @version         2023.10.05.0
// @description     TwitterのOGPタイトルなどを復活させます
// @author          oz0820
// @match           https://twitter.com/*
// @updateURL       https://github.com/oz0820/browser-userscript/raw/main/twitter-ogp/twitter-ogp.user.js
// @icon            https://www.google.com/s2/favicons?sz=64&domain=twitter.com
// ==/UserScript==

(function () {

    setInterval(add_ogp, 500);


    function add_ogp() {
        document.querySelector('div[data-testid="primaryColumn"]')
            .querySelectorAll('a[rel="noopener noreferrer nofollow"][aria-label]').forEach(elm => {

                // 既に処理した要素は飛ばす
                if (elm.getAttribute('ogp') !== null) {
                    return;
                }

                if (elm.getAttribute('href').startsWith('https://t.co/')) {
                    let href = elm.getAttribute('href');
                    let fqdn = elm.querySelector('span').innerText;
                    let aria_label = elm.getAttribute('aria-label').slice(fqdn.length + 1);

                    const insert_html =
                        `<a href="${href}" rel="noopener noreferrer nofollow" target="_blank" role="link" class="css-4rbku5 css-18t94o4 css-1dbjc4n r-1loqt21 r-18u37iz r-16y2uox r-1wtj0ep r-1ny4l3l r-o7ynqc r-6416eg">
        <div class="css-1dbjc4n r-16y2uox r-1wbh5a2 r-z5qs1h r-1777fci r-kzbkwu r-1e081e0 r-ttdzmv" data-testid="card.layoutLarge.detail">
            <div dir="auto" class="css-901oao css-1hf3ou5 r-14j79pv r-37j5jr r-a023e6 r-16dba41 r-rjixqe r-bcqeeo r-qvutc0" style="color: rgba(127,131,138,1.00);">
                <span class="css-901oao css-16my406 r-poiln3 r-bcqeeo r-qvutc0">${fqdn}</span>
            </div>
            <div dir="auto" class="css-901oao css-1hf3ou5 r-37j5jr r-a023e6 r-16dba41 r-rjixqe r-bcqeeo r-qvutc0" style="color: rgba(217,217,217,1.00);">
                <span class="css-901oao css-16my406 r-poiln3 r-bcqeeo r-qvutc0" ">${aria_label}</span>
            </div>
        </div>
    </a>
    `
                    // 元々タイトルなどが埋め込まれていた場所はここらしい
                    elm.parentElement.parentElement.children[1].insertAdjacentHTML('afterbegin', insert_html);

                    // 編集済みのフラグ
                    elm.setAttribute('ogp', '');

                }
            })
    }




})();



