// ==UserScript==
// @name            Twitter OGP
// @namespace       https://twitter.com/oz0820
// @version         2023.11.21.0
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
        window.onload = () => {
            const css = `<style>article[data-testid="tweet"] a[rel="noopener noreferrer nofollow"] { text-decoration: none; }</style>`;
            const head = document.head || document.querySelector('head');
            head.insertAdjacentHTML('beforeend', css);

        }
        document.querySelectorAll('a[rel="noopener noreferrer nofollow"][aria-label]').forEach(elm => {
            try {

                // 既に処理した要素は飛ばす
                if (elm.getAttribute('ogp') !== null) {
                    return;
                }

                // 広告のhrefにはクエリが付いているので除外
                if (elm.getAttribute('href').indexOf('?') !== -1) {
                    return;
                }

                // 表示モードごとに色を変える
                let color = get_text_color();

                let href = elm.getAttribute('href');
                let fqdn = elm.querySelector('span').innerText;
                let aria_label = elm.getAttribute('aria-label').slice(fqdn.length + 1);

                const insert_html =
`<a href="${href}" rel="noopener noreferrer nofollow" target="_blank" role="link" class="css-4rbku5 css-18t94o4 css-1dbjc4n r-1loqt21 r-18u37iz r-16y2uox r-1wtj0ep r-1ny4l3l r-o7ynqc r-6416eg">
    <div class="css-1dbjc4n r-16y2uox r-1wbh5a2 r-z5qs1h r-1777fci" data-testid="card.layoutLarge.detail">
        <div dir="auto" class="css-901oao css-1hf3ou5 r-14j79pv r-37j5jr r-a023e6 r-16dba41 r-rjixqe r-bcqeeo r-qvutc0" style="${color.fqdn}">
            <span class="css-901oao css-16my406 r-poiln3 r-bcqeeo r-qvutc0">${fqdn}</span>
        </div>
        <div dir="auto" class="css-901oao css-1hf3ou5 r-37j5jr r-a023e6 r-16dba41 r-rjixqe r-bcqeeo r-qvutc0" style="${color.title}">
            <span class="css-901oao css-16my406 r-poiln3 r-bcqeeo r-qvutc0" ">${aria_label}</span>
        </div>
    </div>
</a>`

                // 元々タイトルなどが埋め込まれていた場所はここらしい
                elm.parentElement.parentElement.children[1].insertAdjacentHTML('afterbegin', insert_html);

                // スタイルが変わってpaddingが効かなくなったので追加
                elm.parentElement.parentElement.children[1].setAttribute('style', 'padding: 12px');

                // 画像内のfqdnを削除
                // elm.querySelectorAll('div.css-1dbjc4n.r-rki7wi.r-161ttwi.r-u8s1d').forEach(del_elm => {del_elm.remove();});

                // 編集済みのフラグ
                elm.setAttribute('ogp', '');
                // console.log('add OGP', elm);

            } catch (e) {
                // 一度エラーなら二度目もエラーなので、対象外に指定する
                console.log('error OGP', e, elm);
                elm.setAttribute('ogp', '');
            }
        })
    }


    function add_ogp_tweetdeck() {
        const deck_work = (column) => {
            column.querySelectorAll('a[rel="noopener noreferrer nofollow"][aria-label]').forEach(elm => {
                try {

                    // 既に処理した要素は飛ばす
                    if (elm.getAttribute('ogp') !== null) {
                        return;
                    }
                    // 別のタグが紛れ込むことがあったり無かったり……
                    if (!elm.getAttribute('href').startsWith('https://t.co/')) {
                        return;
                    }

                    // 表示モードごとに色を変える
                    let color = get_text_color();

                    let href = elm.getAttribute('href');
                    let fqdn = elm.querySelector('span').innerText;
                    let aria_label = elm.getAttribute('aria-label').slice(fqdn.length + 1);

                    const insert_html =
`<a href="${href}" rel="noopener noreferrer nofollow" target="_blank" role="link" class="css-4rbku5 css-18t94o4 css-1dbjc4n r-1loqt21 r-18u37iz r-16y2uox r-1wtj0ep r-1ny4l3l r-o7ynqc r-6416eg">
    <div class="css-1dbjc4n r-16y2uox r-1wbh5a2 r-z5qs1h r-1777fci" data-testid="card.layoutLarge.detail">
        <div dir="auto" class="css-901oao css-1hf3ou5 r-37j5jr r-a023e6 r-16dba41 r-rjixqe r-bcqeeo r-qvutc0" style="${color.title}">
            <span class="css-901oao css-16my406 r-poiln3 r-bcqeeo r-qvutc0" ">${aria_label}</span>
        </div>
    </div>
</a>`
                    // 元々タイトルなどが埋め込まれていた場所はここらしい
                    elm.parentElement.parentElement.children[1].insertAdjacentHTML('afterbegin', insert_html);

                    // スタイルが変わってpaddingが効かなくなったので追加
                    elm.parentElement.parentElement.children[1].setAttribute('style', 'padding: 12px');

                    // 編集済みのフラグ
                    elm.setAttribute('ogp', '');
                    // console.log('add OGP', elm);

                } catch (e) {
                    // 一度エラーなら二度目もエラーなので、対象外に指定する
                    console.log('error OGP', e, elm);
                    elm.setAttribute('ogp', '');
                }
            })
        }

        // 画像などを拡大表示したときのツイートとリプライ
        document.querySelectorAll('div[class="css-1dbjc4n r-kemksi r-1kqtdi0 r-1ljd8xs r-1phboty r-1dqxon3 r-1hycxz"]')
            .forEach(column => deck_work(column));
        // deck本体のカラム
        document.querySelector('div[class="css-1dbjc4n r-18u37iz r-16y2uox"]')
            .querySelectorAll('div[class="css-1dbjc4n r-cpa5s6"]')
            .forEach(column => deck_work(column));
    }

    function get_text_color() {
        let result = {};

        switch (window.getComputedStyle(document.body).backgroundColor) {
            // ダークブルー
            case 'rgb(21, 32, 43)':

                result.fqdn = 'color: rgb(139, 152, 165);';
                result.title = 'color: rgb(247, 249, 249);';
                break;

            // ブラック
            case 'rgb(0, 0, 0)':
                result.fqdn = 'color: rgb(113, 118, 123);';
                result.title = 'color: rgba(231,233,234,1.00);';
                break;

            // デフォルト
            case 'rgb(255, 255, 255)':
            default:
                result.fqdn = 'color: rgb(83, 100, 113);';
                result.title = 'color: rgb(15, 20, 25);';
                break;
        }

        return result;
    }


})();


// そのうち必要になるかもしれないCSS
`
.r-kzbkwu {
    padding-bottom: 12px;
}


.css-1hf3ou5 {
    max-width: 100%;
    overflow-x: hidden;
    overflow-y: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    word-wrap: normal;
}


.r-18u37iz {
    -ms-flex-direction: row;
    -webkit-box-direction: normal;
    -webkit-box-orient: horizontal;
    -webkit-flex-direction: row;
    flex-direction: row;
}


.r-z5qs1h {
    gap: 2px;
}


.css-901oao {
    border: 0 solid black;
    box-sizing: border-box;
    color: rgba(0,0,0,1.00);
    display: inline;
    font: 14px -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;
    margin-bottom: 0px;
    margin-left: 0px;
    margin-right: 0px;
    margin-top: 0px;
    padding-bottom: 0px;
    padding-left: 0px;
    padding-right: 0px;
    padding-top: 0px;
    white-space: pre-wrap;
    word-wrap: break-word;
}


.r-16y2uox {
    -ms-flex-positive: 1;
    -webkit-box-flex: 1;
    -webkit-flex-grow: 1;
    flex-grow: 1;
}


.r-1ny4l3l {
    outline-style: none;
}


.r-1777fci {
    -ms-flex-pack: center;
    -webkit-box-pack: center;
    -webkit-justify-content: center;
    justify-content: center;
}


.r-16dba41 {
    font-weight: 400;
}


.r-rjixqe {
    line-height: 20px;
}


.r-6416eg {
    -moz-transition-property: background-color, box-shadow;
    -webkit-transition-property: background-color, box-shadow;
    transition-property: background-color, box-shadow;
}


r-14j79pv {
    color: rgba(83,100,113,1.00);
}


.r-1wbh5a2 {
    flex-shrink: 1;
}


.r-a023e6 {
    font-size: 15px;
}


.css-4rbku5 {
    background-color: rgba(0, 0, 0, 0);
    color: inherit;
    font: inherit;
    list-style: none;
    margin: 0px;
    text-align: inherit;
    text-decoration: none;
}


.r-1e081e0 {
    padding-left: 12px;
    padding-right: 12px;
}


.css-16my406 {
    color: inherit;
    font: inherit;
    white-space: inherit;
}


.r-bcqeeo {
    min-width: 0px;
}


.css-1dbjc4n {
    -ms-flex-align: stretch;
    -ms-flex-direction: column;
    -ms-flex-negative: 0;
    -ms-flex-preferred-size: auto;
    -webkit-align-items: stretch;
    -webkit-box-align: stretch;
    -webkit-box-direction: normal;
    -webkit-box-orient: vertical;
    -webkit-flex-basis: auto;
    -webkit-flex-direction: column;
    -webkit-flex-shrink: 0;
    align-items: stretch;
    border: 0 solid black;
    box-sizing: border-box;
    display: -webkit-box;
    display: -moz-box;
    display: -ms-flexbox;
    display: -webkit-flex;
    display: flex;
    flex-basis: auto;
    flex-direction: column;
    flex-shrink: 0;
    margin-bottom: 0px;
    margin-left: 0px;
    margin-right: 0px;
    margin-top: 0px;
    min-height: 0px;
    min-width: 0px;
    padding-bottom: 0px;
    padding-left: 0px;
    padding-right: 0px;
    padding-top: 0px;
    position: relative;
    z-index: 0;
}


.r-1loqt21 {
    cursor: pointer;
}


.r-poiln3 {
    font-family: inherit;
}


.r-o7ynqc {
    -webkit-transition-duration: 0.2s;
    transition-duration: 0.2s;
}


.r-ttdzmv {
    padding-top: 12px;
}


.r-37j5jr {
    font-family: TwitterChirp, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}


.css-18t94o4 {
    cursor: pointer;
}


.r-1wtj0ep {
    -webkit-box-pack: justify;
    justify-content: space-between;
}


.r-qvutc0 {
    word-wrap: break-word;
}
`


