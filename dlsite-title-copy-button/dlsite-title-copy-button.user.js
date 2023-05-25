// ==UserScript==
// @name         DLSite title copy button
// @namespace    https://twitter.com/oz0820
// @version      2023.05.26.1
// @description  DLSiteの作品ページで、タイトルをコピーするボタンを追加する
// @author       oz0820
// @match        https://twitter.com/home*
// @match        https://www.dlsite.com/*/work/=/product_id/*
// @updateURL    https://github.com/oz0820/browser-userscript/raw/main/dlsite-title-copy-button/dlsite-title-copy-button.user.js
// @icon         https://www.google.com/s2/favicons?sz=64&domain=dlsite.com
// ==/UserScript==

(function() {
    'use strict';

    // H1タグの取得
    let h1Tag = document.querySelector('h1');

    if (h1Tag) {
        // ボタンの作成
        let copyButton = document.createElement('button');
        copyButton.textContent = 'コピー';

        // ボタンがクリックされたときのイベントリスナーの追加
        copyButton.addEventListener('click', function() {
            // テキストをクリップボードにコピーする
            let textToCopy = h1Tag.textContent.slice(0, -3);
            copyToClipboard(textToCopy);

            // コピーが成功した場合、メッセージを出力する
            console.log('テキストがクリップボードにコピーされました。');
        });

        // H1タグの後ろにボタンを挿入する
        h1Tag.appendChild(copyButton);
    }

    // テキストをクリップボードにコピーする関数
    function copyToClipboard(text) {
        let textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.setAttribute('readonly', '');  // 読み取り専用に設定
        textarea.style.position = 'fixed';  // 絶対位置に配置
        textarea.style.opacity = 0;  // 見えないようにする
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
    }

})();