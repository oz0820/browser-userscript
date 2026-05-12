// ==UserScript==
// @name         Abema URL Sender
// @version      2026.05.12.1
// @match        https://abema.tv/video/title/*
// @updateURL    https://github.com/oz0820/browser-userscript/raw/main/abema-url-sender/Abema URL Sender.user.js
// @icon         https://www.google.com/s2/favicons?sz=64&domain=abema.tv

// ==/UserScript==

(function() {
    // ボタン生成共通関数
    function createButton(text, onClick) {
        const btn = document.createElement("button");
        btn.textContent = text;
        btn.style.marginLeft = "8px";
        btn.style.color = "#fff";
        btn.onclick = onClick;
        return btn;
    }

    // 1秒待機してからボタン追加
    setTimeout(() => {
        const actionButtons = document.querySelector("div.com-pages-series-SeriesSection div.com-pages-series-SeriesSection__action-buttons");
        if (!actionButtons) return;

        // リスト保存ボタン
        const saveBtn = createButton("リスト保存", function() {
            // 画面をある程度スクロール
            window.scrollTo({ top: 4000});
            // 0.5秒待機してから処理
            setTimeout(function() {
                let episode_elm_list = document.querySelectorAll("div.com-contentlist-ContentlistContainer li.com-contentlist-ItemListForContentlistContent__item");
                let results = [];
                episode_elm_list.forEach(function (episode_elm) {
                    let url = episode_elm.querySelector("a").href;
                    let isPreBroadcast = !!episode_elm.querySelector("span.com-PreBroadcastTag");
                    let isPremium = episode_elm.querySelector("span.com-shared-viewing_type-ViewingTypeLabel > span").innerText === "プレミアム";

                    let expirationElm = episode_elm.querySelector("span.com-expiration_date-ExpiredDateText__text");
                    let vodExpiration = -1;
                    if (expirationElm && expirationElm.innerText) {
                        let text = expirationElm.innerText.trim();
                        let match;
                        if ((match = text.match(/^あと(\d+(?:\.\d+)?)日間$/))) {
                            vodExpiration = parseFloat(match[1]) * 24;
                        } else if ((match = text.match(/^あと(\d+(?:\.\d+)?)時間$/))) {
                            vodExpiration = parseFloat(match[1]);
                        } else if ((match = text.match(/^あと(\d+(?:\.\d+)?)分$/))) {
                            vodExpiration = parseFloat(match[1]) / 60;
                        }
                    }
                    if (!isPremium && vodExpiration === -1) {
                        vodExpiration = 999;
                    }
                    results.push({
                        url,
                        isPremium,
                        isPreBroadcast,
                        vodExpiration
                    });
                });

                const pathKey = location.pathname.split('/').filter(Boolean).pop();
                let abebe = {};
                try {
                    abebe = JSON.parse(localStorage.getItem("abebe")) || {};
                } catch(e) {
                    abebe = {};
                }

                // 1日以上前の情報を削除
                const now = Date.now();
                const oneDay = 24 * 60 * 60 * 1000;
                for (const key in abebe) {
                    if (abebe[key] && abebe[key].timestamp && now - abebe[key].timestamp > oneDay) {
                        delete abebe[key];
                    }
                }

                abebe[pathKey] = {
                    timestamp: now,
                    results: results
                };
                localStorage.setItem("abebe", JSON.stringify(abebe));
                alert(`${results.length}\nLocalStorageに保存しました（key: abebe, subkey: ${pathKey}）`);
                window.scrollTo({ top: 0});
                window.close();
            }, 500); // 0.5秒待機
        });

        // 無料期限順リストボタン
        const extractBtn = createButton("無料期限順リスト", function() {
            let abebe = {};
            try {
                abebe = JSON.parse(localStorage.getItem("abebe")) || {};
            } catch(e) {
                abebe = {};
            }
            let allItems = [];
            for (const key in abebe) {
                if (abebe[key] && Array.isArray(abebe[key].results)) {
                    // isPremium: false かつ isPreBroadcast: false のみ抽出
                    const filtered = abebe[key].results.filter(item => item.isPremium === false && item.isPreBroadcast === false);
                    // 後ろから2要素だけ取得（3つ未満ならそのまま）
                    let lastTwo = filtered.slice(-3);

                    // 1番と最終番だけ有効な場合は1番を除外
                    if (
                        lastTwo.length === 3 &&
                        filtered.length === 3 &&
                        abebe[key].results.length >= 3
                    ) {
                        // 1番目（最初）のエピソードか判定
                        const firstUrl = abebe[key].results[0]?.url;
                        const lastUrl = abebe[key].results[abebe[key].results.length - 1]?.url;
                        if (
                            lastTwo[0].url === firstUrl &&
                            lastTwo[1].url === lastUrl
                        ) {
                            // 1番目を除外して最終番だけ残す
                            lastTwo = [lastTwo[1]];
                        }
                    }

                    allItems = allItems.concat(lastTwo);
                }
            }
            // vodExpiration昇順でソート
            const sorted = allItems.sort((a, b) => a.vodExpiration - b.vodExpiration);
            const urlList = sorted.map(item => item.url);
            console.log("無料&期限順URLリスト:", urlList);
            alert(`抽出結果をconsole.logに出力しました（${urlList.length}件）\nOKを押すとクリップボードにコピーします。`);
            navigator.clipboard.writeText(urlList.join('\n')).catch(e => {
                alert('クリップボードへのコピーに失敗しました: ' + e);
            });
            // alert(`抽出結果をconsole.logに出力しました（${urlList.length}件）`);
        });

        // 全削除ボタン
        const clearBtn = createButton("全削除", function() {
            if (confirm("保存データを全て削除します。よろしいですか？")) {
                localStorage.removeItem("abebe");
                alert("保存データを全て削除しました。");
            }
        });

        // ボタンをまとめて挿入
        actionButtons.appendChild(saveBtn);
        saveBtn.after(extractBtn);
        extractBtn.after(clearBtn);
    }, 3000); // 1秒待
})();


