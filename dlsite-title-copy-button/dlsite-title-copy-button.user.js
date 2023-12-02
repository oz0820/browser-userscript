// ==UserScript==
// @name         DLSite title copy button
// @namespace    https://twitter.com/oz0820
// @version      2023.12.03.0
// @description  DLSiteの作品ページで，DOJINDBに飛ぶボタンと，タイトル(作品名)をコピーするボタンを追加する
// @author       oz0820
// @match        https://www.dlsite.com/*
// @updateURL    https://github.com/oz0820/browser-userscript/raw/main/dlsite-title-copy-button/dlsite-title-copy-button.user.js
// @icon         https://www.google.com/s2/favicons?sz=64&domain=dlsite.com
// ==/UserScript==

(function() {
     const product_page = () => {
         window.onload = () => {
             let h1_tag = document.querySelector('h1')

             /*
             DOJINDBに飛ぶボタンを追加する
              */

             // タイトルと同じ行の右側の要素のうち，一番左側の要素
             const h1_right_elm = document.querySelector('h1').nextElementSibling

             const computed_style = window.getComputedStyle(h1_right_elm)
             const h1_right_right = Number(computed_style.getPropertyValue('right').replace(/[^0-9]/g, '')) // 要素の右からのオフセット
             const h1_right_width = h1_right_elm.clientWidth // 横幅
             const my_div_offset = h1_right_right + h1_right_width + 10

             const dojindb_img = document.createElement('img')
             dojindb_img.src = 'https://www.google.com/s2/favicons?sz=64&domain=dojindb.net'
             dojindb_img.style.marginLeft = '6px'
             dojindb_img.style.height = '26px'

             const dojindb_elm = document.createElement('a')
             dojindb_elm.href = `https://dojindb.net/rd?u=${window.location.href}`
             dojindb_elm.target = '_blank'
             dojindb_elm.title = 'DOJINDBに飛びます'
             dojindb_elm.appendChild(dojindb_img)

             const my_div = document.createElement('div')
             my_div.style.position = 'absolute'
             my_div.style.right = `${my_div_offset}px`
             my_div.style.bottom = '10px'
             my_div.style.marginRight = '0'
             my_div.style.textAlign = 'right'
             my_div.appendChild(dojindb_elm)

             h1_tag.insertAdjacentElement('afterend', my_div)


             /*
             タイトルをコピーするボタンを追加
              */

             let copyButton = document.createElement('button');
             copyButton.textContent = 'コピー';
             copyButton.style.marginLeft = '10px'
             copyButton.style.verticalAlign = 'top'

             // ボタンがクリックされたときのイベントリスナーの追加
             copyButton.addEventListener('click', function() {
                 // テキストをクリップボードにコピーする
                 let textToCopy = h1_tag.textContent.slice(0, -3);
                 _copy_to_clipboard(textToCopy);

                 // コピーが成功した場合、メッセージを出力する
                 console.log('テキストがクリップボードにコピーされました。');
             });

             // H1タグの後ろにボタンを挿入する
             h1_tag.appendChild(copyButton);
         }
     }

     const wishlist_page = () => {
         window.onload = () => {
             document.querySelectorAll('table.n_worklist > tbody tr._favorite_item').forEach(item => {
                 const item_url = item.querySelector('dt.work_name > a').href

                 const dojindb_img = document.createElement('img')
                 dojindb_img.src = 'https://www.google.com/s2/favicons?sz=64&domain=dojindb.net'
                 dojindb_img.style.marginLeft = '6px'
                 dojindb_img.style.height = '18px'

                 const dojindb_elm = document.createElement('a')
                 dojindb_elm.href = `https://dojindb.net/rd?u=${item_url}`
                 dojindb_elm.target = '_blank'
                 dojindb_elm.title = 'DOJINDBに飛びます'
                 dojindb_elm.appendChild(dojindb_img)

                 const price_elm = item.querySelector('dd.work_price_wrap')
                 price_elm.insertAdjacentElement('beforeend', dojindb_elm)
             })
         }
     }



    if (location.href.match(/https:\/\/www.dlsite.com\/\w+\/work\/=\/product_id\/\w+.html/)) {
        product_page()
    }

    if (location.href.startsWith('https://www.dlsite.com/home/mypage/wishlist/')) {
        wishlist_page()
    }





    function _copy_to_clipboard(text) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
    }
})
();