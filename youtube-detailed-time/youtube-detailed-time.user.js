// ==UserScript==
// @name         Youtube Detailed time
// @namespace    https://twitter.com/oz0820
// @version      b2023.09.13.0
// @description
// @author       oz0820
// @match        https://www.youtube.com/*
// @updateURL    https://github.com/oz0820/browser-userscript/raw/main/youtube-detailed-time/youtube-detailed-time.user.js
// @icon
// ==/UserScript==

(function() {
    let tar = document.querySelector('span[class="yt_detailed_time"]');
    if (tar) {
        console.log("既にある");
        return
    }

    // 特定の要素が読み込まれた後に実行したいコード
    waitForElementToLoad(function (){
        let title_elm = document.querySelector('h1 > yt-formatted-string');
        console.log("特定の要素が読み込まれました。");
        const html = `<span class="yt_detailed_time" style=" color: var(--yt-spec-text-secondary); font-size: 1.2rem; width: max-content; display: inline-block; margin-left: 10px;">dTime</span>`;
        title_elm.insertAdjacentHTML('afterend', html);
    });





})();


function logger_ydt(...message) {
    let out = "";
    for (let i = 0; i < message.length; i++) {
        out += String(message[i]);
        out += " ";
    }
    console.log("【YT-DetailedTime】", out);
}


function set_dtime_elm() {
    let title_elm = document.querySelector('h1 > yt-formatted-string');
    console.log("特定の要素が読み込まれました。");
    const html = `<span class="yt_detailed_time" style=" color: var(--yt-spec-text-secondary); font-size: 1.2rem; width: max-content; display: inline-block; margin-left: 10px;">dTime</span>`;
    title_elm.insertAdjacentHTML('afterend', html);
}


function dtime_update() {
    if (!document.URL.match("youtube.com/watch")) {
        return;
    }


    let tar = document.querySelector('span[class="yt_detailed_time"]');
    if (tar) {
        logger_ydt("既にある");
    } else {
        logger_ydt('まだ無い');
        set_dtime_elm();
    }

    let sp = new URLSearchParams(location.search)
    const vid = sp.get('v');
    logger_ydt('vid: ' + vid);
    document.querySelector('span[class="yt_detailed_time"]').innerHTML = vid;

    get_dtime_fromYT(vid)
        .then(resJson => {
            logger_ydt(resJson);
            let utcTime;
            if(resJson.items[0].liveStreamingDetails) {
                utcTime = resJson.items[0].liveStreamingDetails.actualStartTime;
            } else {
                utcTime = resJson.items[0].snippet.publishedAt;
            }

            // 待機所
            if(!utcTime) {
                return;
            }

            document.querySelector('span[class="yt_detailed_time"]').innerHTML += utcTime;
    });


}


const sleep = ms => new Promise(res => setTimeout(res, ms));
let href = window.location.href;
// ページ移動を検出します
const observer = new MutationObserver(function () {
    if (href !== window.location.href) {
        href = window.location.href;

        if (document.URL.match("youtube.com/watch")) {
            logger_ydt('dtime rul changed.');
            dtime_update();
        }

    }
})
observer.observe(document, { childList: true, subtree: true });


function waitForElementToLoad(callback) {
    if (!document.URL.match("youtube.com/watch")) {
        return;
    }
    let element = document.querySelector('h1 > yt-formatted-string');
    if (element) {
        // 要素が見つかった場合、コールバック関数を実行
        logger_ydt('// 要素が見つかった場合、コールバック関数を実行')
        callback();
    } else {
        // 要素が見つからない場合、一定間隔で再試行
        logger_ydt('// 要素が見つからない場合、一定間隔で再試行')
        setTimeout(function() {
            waitForElementToLoad(callback);
        }, 100); // 100ミリ秒ごとに再試行（調整可能）
    }
}

async function get_dtime_fromYT(vid) {
    const key = "";
    const url = `https://www.googleapis.com/youtube/v3/videos?id=${vid}&key=${key}&fields=items(snippet(publishedAt),liveStreamingDetails(actualStartTime))&part=snippet,liveStreamingDetails`;

    fetch(url)
        .then((res)=> {
            return res.json()
        })
        .then((resJson)=> {
            logger_ydt(resJson);
            return resJson;
        })
        .catch((error)=> {
            logger_ydt(error);
            return '{}';
        });
}

function conv_time(resJson) {

}


