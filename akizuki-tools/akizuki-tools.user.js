// ==UserScript==
// @name            Akizuki tools
// @namespace       https://twitter.com/oz0820
// @version         2024.02.01.0
// @description     秋月電子通商の商品ページをカスタマイズします。店頭在庫を常に表示する機能と、商品詳細をGoogle Todoに貼り付けやすい形式のテキストを提供します。
// @author          oz0820
// @match           https://akizukidenshi.com/catalog/g/*
// @updateURL       https://github.com/oz0820/browser-userscript/raw/main/akizuki-tools/akizuki-tools.user.js
// @icon            https://www.google.com/s2/favicons?sz=64&domain=akizukidenshi.com
// ==/UserScript==


(function() {
    const dataBody = document.querySelector('div.block-goods-detail-store-stock-tbl tbody')
    const stockAkihabara = dataBody.querySelector('tr:nth-child(1) > td:nth-child(2)').innerText.trim().replace(/\D/g, '').replace(/[\n\t]+/g, '\n')
    const floorAkihabara = dataBody.querySelector('tr:nth-child(1) > td:nth-child(3)').innerText.trim().replace(/[\n\t]+/g, '\n')
    const stockYashio = dataBody.querySelector('tr:nth-child(2) > td:nth-child(2)').innerText.trim().replace(/\D/g, '').replace(/[\n\t]+/g, '\n')
    const floorYashio = dataBody.querySelector('tr:nth-child(2) > td:nth-child(3)').innerText.trim().replace(/[\n\t]+/g, '\n')

    const specGoods = document.querySelector('#spec_goods').innerText
    const goodsName = document.querySelector('h1.h1-goods-name').innerText

    setNotificationContainer()  // ポップアップ通知の初期化


    const copyAkihabara = () => {
        const message = `${specGoods}\n${floorAkihabara}\n${location.href}`
        copyToClipboard(message)
        createNotification('秋葉原店の情報をコピーしました')
    }

    const copyYashio = () => {
        const message = `${specGoods}\n${floorYashio}\n${location.href}`
        copyToClipboard(message)
        createNotification('八潮店の情報をコピーしました')
    }

    const showStocks = () => {
        const stockElm =
            `<table class="akizukiTools" style="margin-left: 10px;">
    <tbody>
    <tr>
        <td style="text-align: left;">
            <input type="button" id="copyButtonAkihabara" value="秋葉原" style="margin-top: 2px; margin-bottom: 2px; width:  60px;">
        </td>
        <td style="text-align: right;">
            ${stockAkihabara} 個
        </td>
    </tr>
    <tr>
        <td style="text-align: left;">
            <input type="button" id="copyButtonYashio" value="八潮" style="margin-top: 2px; margin-bottom: 2px; width:  60px; margin-right: 15px;"></td>
        <td style="text-align: right;">
            ${stockYashio} 個
        </td>
    </tr>
    </tbody>
</table>`

        document.querySelector("#SalesArea > div > div.block-goods-detail-store-stock")
            .insertAdjacentHTML('beforeend', stockElm)

        document.querySelector('#copyButtonAkihabara').addEventListener('click', function () {
            copyAkihabara()
        })
        document.querySelector('#copyButtonYashio').addEventListener('click', function () {
            copyYashio()
        })
    }
    showStocks()

    // 商品の入り数？をクリックすると挿入した要素が消える
    // そこで，要素の変更を監視して再表示する
    const observer = new MutationObserver(function () {
        showStocks()
    })
    observer.observe(document.querySelector('#SalesArea'), {childList: true})

    // 製品名をクリックしてコピーする
    // 200ms以内にクリックすれば押した判定、それ以外は型番などを選択中と判断
    document.querySelector('h1.h1-goods-name').style.cursor = 'pointer'
    let h1ClickTime // マウスを押した時刻を格納
    document.querySelector('h1.h1-goods-name').addEventListener('mousedown', function (e) {
        h1ClickTime = new Date().getTime()
    })
    document.querySelector('h1.h1-goods-name').addEventListener('mouseup', function (e) {
        const h1ReleaseTime = new Date().getTime()
        // マウスを押してから放すまでの時間が200msを超えているか判定
        const CLICK_THRESHOLD = 200
        if (h1ReleaseTime - h1ClickTime < CLICK_THRESHOLD) {
            copyToClipboard(e.target.innerText)
            createNotification('製品名をコピーしました')
        }
    })


function copyToClipboard(text) {
    const textarea = document.createElement('textarea')
    textarea.value = text
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
}

// ここから下は通知ポップアップ用のコード
function createNotification(message, is_error = false) {
    let container = document.getElementById('notification-container')

    let notification = document.createElement('div')
    notification.className = is_error ? 'notification-error' : 'notification'
    notification.textContent = message

    container.appendChild(notification)

    const timeout = is_error ? 10000 : 5000
    setTimeout(function () {
        notification.classList.remove('show')
        setTimeout(function () {
            notification.remove()
        }, 300)
    }, timeout)

    setTimeout(function () {
        notification.classList.add('show')
    }, 100)
}


function setNotificationContainer () {
    let overlay = document.createElement("div")
    overlay.id = "notification-container"
    overlay.className = "akizuki_tools"
    document.body.appendChild(overlay)

    const css =
`#notification-container {
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
}`

    let styleElement = document.createElement("style")
    styleElement.className = "akizukiTools"
    styleElement.type = "text/css"
    styleElement.appendChild(document.createTextNode(css))
    let head = document.head || document.getElementsByTagName('head')[0]
    head.appendChild(styleElement)
}
})();