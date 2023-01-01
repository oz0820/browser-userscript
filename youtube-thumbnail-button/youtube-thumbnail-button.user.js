// ==UserScript==
// @name         Youtube Thumbnail Button
// @namespace    https://twitter.com/oz0820
// @version      2023.01.01.0
// @description  Youtubeの再生ウィンドウにサムネイル直行ボタンを追加すると思います。
// @author       oz0820
// @match        https://www.youtube.com/*
// @updateURL    https://github.com/oz0820/browser-userscript/raw/main/youtube-thumbnail-button/youtube-thumbnail-button.user.js
// @icon         https://www.google.com/s2/favicons?sz=64&domain=youtube.com
// ==/UserScript==

(function () {
        // 雑にボタン追加して
        document.getElementsByClassName('ytp-right-controls')[0].insertAdjacentHTML('afterbegin', '<button class="ytp-controls" type="button" id="show_thumbnail_button" aria-label="サムネイルを表示する" title="サムネイルを表示する" style="background: none; fill: white; border: none; cursor: pointer; float: left; outline: none; overflow: visible; padding: 0px 0px 0em; width: 3em;"><svg viewBox="0 0 16 16" style="width: 60%;"><path d="M6.002 5.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"></path><path d="M2.002 1a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2h-12zm12 1a1 1 0 0 1 1 1v6.5l-3.777-1.947a.5.5 0 0 0-.577.093l-3.71 3.71-2.66-1.772a.5.5 0 0 0-.63.062L1.002 12V3a1 1 0 0 1 1-1h12z"></path></svg></button>');
        // 新しいタブでビデオIDをねじ込んだサムネURLを開きます
        document.getElementById('show_thumbnail_button').addEventListener('click', function () {
            let param_search = new URLSearchParams(window.location.search);
            let video_id = param_search.get('v');
            if (video_id == null) {
                console.log("【YoutubeThumbnailButton】ビデオIDが見つからないぞ")
                return;
            }

            let thumbnail_url = "https://i.ytimg.com/vi/" + video_id + "/maxresdefault.jpg";
            fetch(thumbnail_url)
                .then((response) => {
                    console.log(response.status)
                    if (response.status !== 200) {
                        thumbnail_url = "https://i.ytimg.com/vi/" + video_id + "/sddefault.jpg";
                    }
                    window.open(thumbnail_url);
                })
                .catch((error) => {
                    console.log("サムネURLを取得できません")
                });
        });
})();
