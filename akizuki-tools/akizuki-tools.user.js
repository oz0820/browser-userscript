// ==UserScript==
// @name            Akizuki tools
// @namespace       https://twitter.com/oz0820
// @version         2023.12.29.0
// @description     秋月電子通商の商品ページをカスタマイズします。店頭在庫を常に表示する機能と、商品詳細をGoogle Todoに貼り付けやすい形式のテキストを提供します。
// @author          oz0820
// @match           https://akizukidenshi.com/catalog/g/*
// @updateURL       https://github.com/oz0820/browser-userscript/raw/main/akizuki-tools/akizuki-tools.user.js
// @icon            https://www.google.com/s2/favicons?sz=64&domain=akizukidenshi.com
// ==/UserScript==


(function() {

    const stop_date = new Date('2024-01-25')
    if (new Date() > stop_date) {
        if (get_store('akizuki_tools_stop') === 'true') {
            console.log('[Akizuki tools] 新サイト対応前です．コードを終了します．')
            return;
        }

        const date = new Date();
        date.setTime(date.getTime() + (30 * 24 * 60 * 60 * 1000));
        if (confirm('サイトリニューアルに対応するまでAkizuki toolsの動作を停止します．')) {
            set_store('akizuki_tools_stop', 'true', date);
            console.log('[Akizuki tools] 新サイト対応前です．コード終了用のCookieを書き込みました．')
        }
        console.log('[Akizuki tools] 新サイト対応前です．コードを終了します．')
        return;
    }


    // 店舗指定のデフォルト値を設定
    if (get_store('akizuki_tools_store') === '') {
        const date = new Date();
        date.setTime(date.getTime() + (30 * 24 * 60 * 60 * 1000));
        set_store('akizuki_tools_stop', 'akihabara', date);
    }


    set_notification_container();

    if (!document.querySelector('h6')) {
        console.log('item not found.');
        let insert_html = `<table class="notice_">
    <tbody><tr>
      <td>
        <p style="text-align: center;"><a href="https://web.archive.org/web/*/${location.href}" target="_blank">Web Archiveへ</a></p><a href="https://web.archive.org/web/*/${location.href}" target="_blank">
      </a></td>
    </tr>
  </tbody>
</table>`
        document.querySelector('td.mainframe_ > table').insertAdjacentHTML('afterend', insert_html);

        return;
    }

    const item_id = document.querySelector('img[name="goods_l"]').src.split('/')[6].split('.')[0];
    const html =
        `<div class="akizuki_tools" id="akizuki_tools">
            <div style="margin: 3px">
                <button class="akizuki_tools" data-type="title">製品名</button>
                <button class="akizuki_tools" data-type="description">詳細</button>
                <select name="akizuki_store_select" id="akizuki_store_select" style="margin: 3px;">
                    <option value="yashio">八潮店</option>
                    <option value="akihabara">秋葉原店</option>
                </select>
            </div>
            <iframe class="akizuki_tools" src="https://akizukidenshi.com/catalog/goods/warehouseinfo.aspx?goods=${item_id}" scrolling="no"></iframe>
        </div>`

    document.querySelector('div[class="detail_stocktitle_"]').insertAdjacentHTML('afterend', html);

    // デフォルトの店舗を変更する
    const store_number = get_store('akizuki_tools_store') === 'yashio' ? 0 : get_store('akizuki_tools_store') === 'akihabara' ? 1 : 1;
    document.querySelector('select[id="akizuki_store_select"]').selectedIndex = store_number;

    document.querySelector('iframe[class="akizuki_tools"]').onload = () => {
        const iframe = document.querySelector('iframe[class="akizuki_tools"]');
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        iframeDoc.querySelector('p').remove();
        iframeDoc.querySelector('div').removeAttribute('style');
        iframeDoc.querySelector('th[style]').removeAttribute('style');
        iframeDoc.querySelector('table').querySelector('div').setAttribute('style', 'margin: 2px; width: 50px;')
        const table_height = iframeDoc.querySelector('table').clientHeight;
        document.querySelector('iframe[class="akizuki_tools"]').setAttribute('style', `height: ${table_height+20}px;border: none;`);
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

    let store = document.querySelector('select[id="akizuki_store_select"]').value;

    const date = new Date();
    date.setTime(date.getTime() + (365 * 24 * 60 * 60 * 1000));
    set_store('akizuki_tools_store', store, date);

    if ("title" === type) {
        const item_name = document.querySelector('img[name="goods_l"]').getAttribute('alt');

        const out = convert_full_width_to_half_width(item_name);
        copy_to_clipboard(out);
    } else if ('description' === type) {
        const item_id = document.querySelector('img[name="goods_l"]').src.split('/')[6].split('.')[0];
        const sales_floor = await get_sales_floor(item_id);
        const item_url = document.location.href;

        switch (document.querySelector('select[name="akizuki_store_select"]').value) {
            case "yashio":
                console.log('yashio');
                break
            case 'akihabara':
                console.log('akihabara');
                break
            default:
                console.log('akihabara');
        }


        const out = `${item_id}\n${sales_floor}\n${item_url}`;
        copy_to_clipboard(out);
    }
    create_notification('コピーしました');
}

function convert_full_width_to_half_width(input) {
    return input.replace(/[Ａ-Ｚａ-ｚ０-９！＂＃＄％＆＇（）＊＋，－．／：；＜＝＞？＠［＼］＾＿｀｛｜｝]/g, function(match) {
        return String.fromCharCode(match.charCodeAt(0) - 0xFEE0);
    })
        .replace(/　/g, ' ')
        .replace(/[‐－―]/g, '-')
        .replace(/[～〜]/g, '~');
}


async function get_sales_floor(item_id) {
    const iframe = document.querySelector('iframe[class="akizuki_tools"]');
    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;

    const store = get_store();
    const store_select_num = store === 'yashio' ? 2 : store === 'akihabara' ? 3 : 3;
    // 埋め込んだiframe内から読み出し
    try {
        return iframeDoc.querySelector(`#detail_stockinfo > table > tbody > tr:nth-child(${store_select_num}) > td.storelist_.textleft_ > div`).textContent.trim();

    // 失敗したら、ページをfetchして取り出す。
    } catch (e) {
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

            const decoder = new TextDecoder('shift_jis');
            const html = decoder.decode(arrayBuffer);

            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');

            return doc.querySelector(`#detail_stockinfo > table > tbody > tr:nth-child(${store_select_num}) > td.storelist_.textleft_ > div`).textContent.trim();

        } catch (error) {
            console.error('Error:', e.message);
            create_notification('売り場の取得に失敗しました。', true);
            create_notification(e.message, true);
            return 'ERROR get_sales_floor'
        }
    }
}



function copy_to_clipboard(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
}


function set_store(name, store, expires) {
    document.cookie = name + "=" + store + "; " + "expires=" + expires.toUTCString(); + "; path=/";
}

function get_store(store_name) {
    const cookieName = store_name + '=';
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
        let cookie = cookies[i];
        while (cookie.charAt(0) === ' ') {
            cookie = cookie.substring(1);
        }
        if (cookie.indexOf(cookieName) === 0) {
            return cookie.substring(cookieName.length, cookie.length);
        }
    }
    return '';
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