// ==UserScript==
// @name         Yodobashi real price
// @namespace    https://twitter.com/oz0820
// @version      2023.01.05.0
// @description  ヨドバシカメラの販売額からポイントを差し引いた"実質価格"を表示します。
// @author       oz0820
// @match        https://www.yodobashi.com/product/*
// @updateURL    https://github.com/oz0820/browser-userscript/raw/main/yodobashi-real-price/yodobashi-real-price.user.js
// @icon         https://www.google.com/s2/favicons?sz=64&domain=www.yodobashi.com
// ==/UserScript==

(function () {
    const regex = /[^0-9]/g;
    let normal_price, point, add_target;
    try {
        normal_price = parseInt(document.getElementsByClassName('productPrice')[0].innerHTML.replace(regex, ''));
        point = parseInt(document.getElementById('js_scl_pointPrice').innerHTML.replace(regex, ''));
        add_target = document.getElementById('js_kakaku');
    } catch (e) {
        return;
    }
    let real_price = normal_price - point;

    let html = '' +
        '<tr id="realPrice" class="realPrice">' +
            '<th id="realPriceTitle" style="font-weight: bold">実質価格：</th>' +
            '<td id="realPriceKakaku" style="color: red; font-weight: bold; font-size: 16px">' +
                '<span>&yen; ' + real_price.toLocaleString() + '</span>' +
            '</td>' +
        '</tr>'

    add_target.insertAdjacentHTML('beforebegin', html);

    // 元の価格の文字を黒くします
    try {
        document.getElementById('js_scl_unitPrice').setAttribute('style', 'font-weight: normal; color: black;');
        document.getElementsByClassName('taxInfo')[0].setAttribute('style', 'font-weight: normal; color: black;');
    } catch (e) {
        // しらん
    }

})();
