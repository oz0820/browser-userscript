// ==UserScript==
// @name         Twitter subscribe button remover
// @namespace    https://twitter.com/oz0820
// @version      2024.05.17.0
// @description  Twitter for Web　で，トレンドの上に表示される課金ボタンを消します．
// @author       oz0820
// @match        https://x.com/*
// @match        https://twitter.com/*
// @updateURL    https://github.com/oz0820/browser-userscript/raw/main/twitter-subscribe-button-remover/twitter-subscribe-button-remover.user.js
// @icon         data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+DQogIDxwYXRoIGQ9Ik0yMy42NDMgNC45MzdjLS44MzUuMzctMS43MzIuNjItMi42NzUuNzMzLjk2Mi0uNTc2IDEuNy0xLjQ5IDIuMDQ4LTIuNTc4LS45LjUzNC0xLjg5Ny45MjItMi45NTggMS4xMy0uODUtLjkwNC0yLjA2LTEuNDctMy40LTEuNDctMi41NzIgMC00LjY1OCAyLjA4Ni00LjY1OCA0LjY2IDAgLjM2NC4wNDIuNzE4LjEyIDEuMDYtMy44NzMtLjE5NS03LjMwNC0yLjA1LTkuNjAyLTQuODY4LS40LjY5LS42MyAxLjQ5LS42MyAyLjM0MiAwIDEuNjE2LjgyMyAzLjA0MyAyLjA3MiAzLjg3OC0uNzY0LS4wMjUtMS40ODItLjIzNC0yLjExLS41ODN2LjA2YzAgMi4yNTcgMS42MDUgNC4xNCAzLjczNyA0LjU2OC0uMzkyLjEwNi0uODAzLjE2Mi0xLjIyNy4xNjItLjMgMC0uNTkzLS4wMjgtLjg3Ny0uMDgyLjU5MyAxLjg1IDIuMzEzIDMuMTk4IDQuMzUyIDMuMjM0LTEuNTk1IDEuMjUtMy42MDQgMS45OTUtNS43ODYgMS45OTUtLjM3NiAwLS43NDctLjAyMi0xLjExMi0uMDY1IDIuMDYyIDEuMzIzIDQuNTEgMi4wOTMgNy4xNCAyLjA5MyA4LjU3IDAgMTMuMjU1LTcuMDk4IDEzLjI1NS0xMy4yNTQgMC0uMi0uMDA1LS40MDItLjAxNC0uNjAyLjkxLS42NTggMS43LTEuNDc3IDIuMzIzLTIuNDF6IiBmaWxsPSIjMWRhMWYyIiAvPg0KPC9zdmc+
// ==/UserScript==

(function() {
    function remover() {
        let target_elm = document.querySelector('div[class="css-1dbjc4n r-g6ijar r-74htps r-1867qdf r-1phboty r-rs99b7 r-1ifxtd0 r-1udh08x"]');
        if (!target_elm) {
            return;
        }

        let ss_button = target_elm.querySelectorAll('a');
        ss_button.forEach((bt) => {
            if (bt.href.match(/^https?:\/\/[^/]+(\/[^?]*)/)[1] === '/i/verified-choose') {
                target_elm.parentNode.removeChild(target_elm);
            }
        })
    }

    setInterval(remover, 100);

})();