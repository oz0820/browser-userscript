// ==UserScript==
// @name         Youtube chat mode changer
// @namespace    https://twitter.com/oz0820
// @version      2024.07.16.0
// @description  Youtubeのチャットのリプレイを常に全て表示します．
// @author       oz0820
// @grant        GM.setValue
// @grant        GM.getValue
// @match        https://www.youtube.com/*
// @updateURL    https://github.com/oz0820/browser-userscript/raw/main/youtube-chat-mode-changer/youtube-chat-mode-changer.user.js
// @icon         data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTU5IiBoZWlnaHQ9IjExMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4NCiAgPHBhdGggZD0ibTE1NCAxNy41Yy0xLjgyLTYuNzMtNy4wNy0xMi0xMy44LTEzLjgtOS4wNC0zLjQ5LTk2LjYtNS4yLTEyMiAwLjEtNi43MyAxLjgyLTEyIDcuMDctMTMuOCAxMy44LTQuMDggMTcuOS00LjM5IDU2LjYgMC4xIDc0LjkgMS44MiA2LjczIDcuMDcgMTIgMTMuOCAxMy44IDE3LjkgNC4xMiAxMDMgNC43IDEyMiAwIDYuNzMtMS44MiAxMi03LjA3IDEzLjgtMTMuOCA0LjM1LTE5LjUgNC42Ni01NS44LTAuMS03NXoiIGZpbGw9IiNmMDAiIC8+DQogIDxwYXRoIGQ9Im0xMDUgNTUtNDAuOC0yMy40djQ2Ljh6IiBmaWxsPSIjZmZmIiAvPg0KPC9zdmc+
// ==/UserScript==

(async function () {
    // チャット常時表示機能のON・OFF
    if (await GM.getValue('chat_replay_auto_open') === undefined) {
        await GM.setValue('chat_replay_auto_open', true)
        console.log('set', 'chat_replay_auto_open')
    }

    const chat_replay_auto_open = await GM.getValue('chat_replay_auto_open', true)

    const logger = function (message) {
        console.log('【YT-CmC】 ' + message);
    }

    let href = window.location.href;
    const observer = new MutationObserver(async function () {
        if (href !== window.location.href) {
            href = window.location.href;
            if (location.href.startsWith('https://www.youtube.com/watch') ||
                location.href.startsWith('https://www.youtube.com/live')) {
                await chat()
            }
        }
    })
    observer.observe(document, {childList: true, subtree: true});
    const sleep = async ms => new Promise(res => setTimeout(res, ms));

    function fuga() {
        let yt_live_chat_app = document.querySelector('yt-live-chat-app');

        if (null != yt_live_chat_app) {

            setTimeout(() => {
                yt_live_chat_app.querySelector('tp-yt-paper-listbox').children[1].click();
                logger('change LiveChat');

                if (getComputedStyle(document.querySelector('yt-live-chat-renderer')).getPropertyValue('--yt-live-chat-item-timestamp-display') === 'none') {
                    document.querySelector('yt-live-chat-renderer').removeAttribute('hide-timestamps');
                    logger('change TimeStamp')
                }
            }, 500);

        } else {
            const chat_open_button = document.querySelector("#show-hide-button > ytd-button-renderer > yt-button-shape > button")
            setTimeout(fuga, 500);
        }
    }

    // チャットを自動で表示する
    async function chat() {
        if (!chat_replay_auto_open) {
            return
        }
        for (let i = 0; i < 20; i++) {
            document.querySelector('div#chat-container yt-button-shape > button')?.click()
            await sleep(100)
            if (document.querySelector('div#chat-container yt-button-shape > button')?.clientHeight === 0) {
                // logger('chat')
                break
            }
        }
    }


    if (window.location.pathname.startsWith('/live_chat')) {
        fuga();
    }
    if (location.href.startsWith('https://www.youtube.com/watch') ||
        location.href.startsWith('https://www.youtube.com/live')) {
        await chat()
    }
})();