// ==UserScript==
// @name         Promo-tweet remover
// @namespace    https://twitter.com/oz0820
// @version      2022.12.16.0
// @description  ツイッターのプロモツイートを消します。
// @author       oz0820
// @match        https://twitter.com/home*
// @match        https://mobile.twitter.com/home*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=twitter.com
// ==/UserScript==

(function() {

    function promo_remove() {
        let sp = document.getElementsByTagName('span');

        // プロモーションと記載されてるspanタグ探して
        let target = [];
        for (let i=0; i<sp.length; i++) {
            if (sp[i].innerHTML === 'プロモーション') {
                target.push(sp[i]);
            }
        }

        // いっぱい要素遡ってツイートの大枠を取得、中身を空にします。
        for (let i=0; i<target.length; i++) {
            for (let j=0; j<17; j++) {
                let data_testid = target[i].getAttribute('data-testid');
                if (data_testid == null || data_testid !== 'cellInnerDiv') {
                    target[i] = target[i].parentNode;
                }
                if (data_testid === 'cellInnerDiv') {
                    target[i].innerHTML = "";
                    break;
                }
            }
        }
    }

    // 結構重いので最短500ms間隔の実行です。
    let target_time;
    window.addEventListener("scroll", () => {
        // トップに戻ったときは必ず実行したいです。
        if (window.scrollY === 0) {
            target_time = 0;
            promo_remove();
            return;
        }
        if (target_time) {
            return;
        }
        target_time = setTimeout(() => {
            target_time = 0;
            promo_remove();
        }, 500);
    });

})();