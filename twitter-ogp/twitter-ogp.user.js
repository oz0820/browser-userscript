// ==UserScript==
// @name            Twitter OGP
// @namespace       https://twitter.com/oz0820
// @version         2023.10.05.1
// @description     TwitterのOGPタイトルなどを復活させます
// @author          oz0820
// @match           https://twitter.com/*
// @match           https://tweetdeck.twitter.com/*
// @updateURL       https://github.com/oz0820/browser-userscript/raw/main/twitter-ogp/twitter-ogp.user.js
// @icon            https://www.google.com/s2/favicons?sz=64&domain=twitter.com
// ==/UserScript==

(function () {

    if (window.location.href.startsWith('https://twitter.com')) {
        setInterval(add_ogp_twitter, 500);
    }

    if (window.location.href.startsWith('https://tweetdeck.twitter.com')) {
        setInterval(add_ogp_tweetdeck, 500);
    }


    function add_ogp_twitter() {
        document.querySelector('div[data-testid="primaryColumn"]')
            .querySelectorAll('a[rel="noopener noreferrer nofollow"][aria-label]').forEach(elm => {

                // 既に処理した要素は飛ばす
                if (elm.getAttribute('ogp') !== null) {
                    return;
                }
                // 別のタグが紛れ込むことがあったり無かったり……
                if (!elm.getAttribute('href').startsWith('https://t.co/')) {
                    return;
                }

                // 表示モードごとに色を変える
                let color_fqdn = '';
                let color_title = '';
                if (window.getComputedStyle(document.body).backgroundColor === 'rgb(255, 255, 255)') {
                    color_fqdn = 'color: rgb(83,100,113);';
                    color_title = 'color: rgb(15,20,25);';
                } else {
                    color_fqdn = 'color: rgb(127,131,138);';
                    color_title = 'color: rgb(217,217,217);';
                }


                let href = elm.getAttribute('href');
                let fqdn = elm.querySelector('span').innerText;
                let aria_label = elm.getAttribute('aria-label').slice(fqdn.length + 1);

                const insert_html =
`<a href="${href}" rel="noopener noreferrer nofollow" target="_blank" role="link" class="css-4rbku5 css-18t94o4 css-1dbjc4n r-1loqt21 r-18u37iz r-16y2uox r-1wtj0ep r-1ny4l3l r-o7ynqc r-6416eg">
    <div class="css-1dbjc4n r-16y2uox r-1wbh5a2 r-z5qs1h r-1777fci r-kzbkwu r-1e081e0 r-ttdzmv" data-testid="card.layoutLarge.detail">
        <div dir="auto" class="css-901oao css-1hf3ou5 r-14j79pv r-37j5jr r-a023e6 r-16dba41 r-rjixqe r-bcqeeo r-qvutc0" style="${color_fqdn}">
            <span class="css-901oao css-16my406 r-poiln3 r-bcqeeo r-qvutc0">${fqdn}</span>
        </div>
        <div dir="auto" class="css-901oao css-1hf3ou5 r-37j5jr r-a023e6 r-16dba41 r-rjixqe r-bcqeeo r-qvutc0" style="${color_title}">
            <span class="css-901oao css-16my406 r-poiln3 r-bcqeeo r-qvutc0" ">${aria_label}</span>
        </div>
    </div>
</a>`

                // 元々タイトルなどが埋め込まれていた場所はここらしい
                elm.parentElement.parentElement.children[1].insertAdjacentHTML('afterbegin', insert_html);

                // 画像内のfqdnを削除
                elm.querySelectorAll('div.css-1dbjc4n.r-rki7wi.r-161ttwi.r-u8s1d').forEach(del_elm => {del_elm.remove();});

                // 編集済みのフラグ
                elm.setAttribute('ogp', '');
                console.log('add OGP', elm);
            })
    }


    function add_ogp_tweetdeck() {
        document.querySelector('div[class="css-1dbjc4n r-18u37iz r-16y2uox"]').querySelectorAll('div[class="css-1dbjc4n r-cpa5s6"]').forEach(column => {
            column.querySelectorAll('a[rel="noopener noreferrer nofollow"][aria-label]').forEach(elm => {

                // 既に処理した要素は飛ばす
                if (elm.getAttribute('ogp') !== null) {
                    return;
                }
                // 別のタグが紛れ込むことがあったり無かったり……
                if (!elm.getAttribute('href').startsWith('https://t.co/')) {
                    return;
                }

                // 表示モードごとに色を変える
                let color_title = '';
                if (window.getComputedStyle(document.body).backgroundColor === 'rgb(255, 255, 255)') {
                    color_title = 'color: rgb(15,20,25);';
                } else {
                    color_title = 'color: rgb(217,217,217);';
                }


                let href = elm.getAttribute('href');
                let fqdn = elm.querySelector('span').innerText;
                let aria_label = elm.getAttribute('aria-label').slice(fqdn.length + 1);

                const insert_html =
`<a href="${href}" rel="noopener noreferrer nofollow" target="_blank" role="link" class="css-4rbku5 css-18t94o4 css-1dbjc4n r-1loqt21 r-18u37iz r-16y2uox r-1wtj0ep r-1ny4l3l r-o7ynqc r-6416eg">
    <div class="css-1dbjc4n r-16y2uox r-1wbh5a2 r-z5qs1h r-1777fci r-kzbkwu r-1e081e0 r-ttdzmv" data-testid="card.layoutLarge.detail">
        <div dir="auto" class="css-901oao css-1hf3ou5 r-37j5jr r-a023e6 r-16dba41 r-rjixqe r-bcqeeo r-qvutc0" style="${color_title}">
            <span class="css-901oao css-16my406 r-poiln3 r-bcqeeo r-qvutc0" ">${aria_label}</span>
        </div>
    </div>
</a>`
                // 元々タイトルなどが埋め込まれていた場所はここらしい
                elm.parentElement.parentElement.children[1].insertAdjacentHTML('afterbegin', insert_html);

                // 編集済みのフラグ
                elm.setAttribute('ogp', '');
                console.log('add OGP', elm);
            })

        })
    }

})();



