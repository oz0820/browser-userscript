// ==UserScript==
// @name            Akizuki tools
// @namespace       https://twitter.com/oz0820
// @version         2023.08.31.0
// @description     秋月電子通商の商品ページをカスタマイズします。店頭在庫を常に表示する機能と、商品詳細をGoogle Todoに貼り付けやすい形式のテキストを提供します。
// @author          oz0820
// @match           https://akizukidenshi.com/catalog/*
// @updateURL       https://github.com/oz0820/browser-userscript/raw/main/akizuki-tools/akizuki-tools.user.js
// @icon            https://www.google.com/s2/favicons?sz=64&domain=akizukidenshi.com
// ==/UserScript==


(function() {
    set_notification_container();

    const item_id = document.querySelector('img[name="goods_l"]').src.split('/')[6].split('.')[0];
    const html =
        `<div class="akizuki_tools">
            <div style="margin: 3px">
                <button class="akizuki_tools" data-type="title">製品名</button>
                <button class="akizuki_tools" data-type="description">詳細</button>
            </div>
            <iframe class="akizuki_tools" src="https://akizukidenshi.com/catalog/goods/warehouseinfo.aspx?goods=${item_id}" scrolling="no"></iframe>
        </div>`

    document.querySelector('div[class="detail_stocktitle_"]').insertAdjacentHTML('afterend', html);

    document.querySelector('iframe[class="akizuki_tools"]').onload = () => {
        const iframe = document.querySelector('iframe[class="akizuki_tools"]');
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        iframeDoc.querySelector('p').remove();
        iframeDoc.querySelector('th[style]').removeAttribute('style');
        iframeDoc.querySelector('table').querySelector('div').setAttribute('style', 'margin: 2px; width: 50px;')
        const table_height = iframeDoc.querySelector('table').clientHeight;
        document.querySelector('iframe[class="akizuki_tools"]').setAttribute('style', `height: ${table_height+2}px;border: none;`);
    }



    const buttons = document.querySelectorAll('button[class="akizuki_tools"]');
    buttons.forEach(button => {
        button.addEventListener('click', function() {
            const type = this.getAttribute('data-type');
            akizuki_tools(type).then();
        });
    });
})();



async function akizuki_tools(type) {
    if ("title" === type) {
        const item_name = document.querySelector('img[name="goods_l"]').getAttribute('alt');

        const out = convert_full_width_to_half_width(item_name);
        copy_to_clipboard(out);
    } else if ('description' === type) {
        const item_id = document.querySelector('img[name="goods_l"]').src.split('/')[6].split('.')[0];
        const sales_floor = await get_sales_floor(item_id);
        const item_url = document.location.href;

        const out = `${item_id}\n${sales_floor}\n${item_url}`;
        copy_to_clipboard(out);
    }
    create_notification('コピーされました');
}


function convert_full_width_to_half_width(input) {
    return input.replace(/[Ａ-Ｚａ-ｚ０-９！＂＃＄％＆＇（）＊＋，－．／：；＜＝＞？＠［＼］＾＿｀｛｜｝]/g, function(match) {
        return String.fromCharCode(match.charCodeAt(0) - 0xFEE0);
    })
        .replace(/　/g, ' ')       //全角スペース
        .replace(/[‐－―]/g, '-')  //ハイフンいくつか
        .replace(/[～〜]/g, '~');  // チルダいくつか
}

function copy_to_clipboard(text) {
    // 新しいテキストエリアを作成してテキストを設定
    const textarea = document.createElement('textarea');
    textarea.value = text;

    // テキストエリアをDOMに追加（非表示にする）
    document.body.appendChild(textarea);

    // テキストエリアの選択範囲を選択
    textarea.select();

    // クリップボードにコピー
    document.execCommand('copy');

    // テキストエリアを削除
    document.body.removeChild(textarea);
}


async function get_sales_floor(item_id) {
    const timeoutMillis = 500;
    try {
        const url = 'https://akizukidenshi.com/catalog/goods/warehouseinfo.aspx?goods=' + item_id;

        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Timeout')), timeoutMillis)
        );

        const fetchPromise = fetch(url);

        const response = await Promise.race([fetchPromise, timeoutPromise]);

        if (!response) {
            throw new Error('Fetch error');
        }

        const arrayBuffer = await response.arrayBuffer();

        // Shift_JISでデコード
        const decoder = new TextDecoder('shift_jis');
        const html = decoder.decode(arrayBuffer);

        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        // ここで解析したい要素を選択して操作します
        return doc.querySelector('#detail_stockinfo > table > tbody > tr:nth-child(3) > td.storelist_.textleft_ > div').textContent.trim();

    } catch (error) {
        console.error('Error:', error.message);
        return 'ERROR get_sales_floor';
    }
}



// ここから下は通知ポップアップ用のコード

function create_notification(message, is_error=false) {
    let container = document.getElementById('notification-container');

    let notification = document.createElement('div');
    notification.className = is_error ? 'notification-error' : 'notification';
    notification.textContent = message;

    container.appendChild(notification);

    const timeout = is_error ? 10000 : 5000;
    setTimeout(function() {
        notification.classList.remove('show');
        setTimeout(function() {
            notification.remove();
        }, 300);
    }, timeout);

    setTimeout(function() {
        notification.classList.add('show');
    }, 100);
}


function set_notification_container() {
    let overlay = document.createElement("div");
    overlay.id = "notification-container";
    overlay.className = "akizuki_tools";
    document.body.appendChild(overlay);

    const css = `
            #notification-container {
                position: fixed;
                bottom: 20px;
                right: 20px;
                z-index: 9999;
            }
            
            .notification {
                background-color: #fff;
                border-radius: 4px;
                box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
                padding: 10px;
                margin-bottom: 10px;
                opacity: 0;
                transition: opacity 0.3s ease-in-out;
                transform: scale(1.2);
                transform-origin: bottom right;
            }
            
            .notification-error {
                background-color: #f88;
                border-radius: 4px;
                box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
                padding: 10px;
                margin-bottom: 10px;
                opacity: 0;
                transition: opacity 0.3s ease-in-out;
                transform: scale(1.2);
                transform-origin: bottom right;
            }
            
            .notification.show {
                opacity: 1;
            }
            
            .notification-error.show {
                opacity: 1;
            }`;

    let styleElement = document.createElement("style");
    styleElement.className = "akizuki_tools";
    styleElement.type = "text/css";
    styleElement.appendChild(document.createTextNode(css));
    let head = document.head || document.getElementsByTagName('head')[0];
    head.appendChild(styleElement);
}