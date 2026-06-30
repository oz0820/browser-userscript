// ==UserScript==
// @name         Abema URL Sender
// @version      2026.07.01.0
// @match        https://abema.tv/video/title/*
// @updateURL    https://github.com/oz0820/browser-userscript/raw/main/abebe/Abema-URL-Sender.user.js
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

    // 固定レイヤー作成関数
    function createButtonLayer() {
        let layer = document.getElementById("abema-button-layer");
        if (layer) return layer;

        layer = document.createElement("div");
        layer.id = "abema-button-layer";
        layer.style.position = "fixed";
        layer.style.top = "1em";
        layer.style.right = "250px";
        layer.style.zIndex = "999999";
        layer.style.display = "flex";
        layer.style.gap = "8px";
        layer.style.backgroundColor = "rgba(255, 0, 0, 0.8)";
        layer.style.padding = "10px";
        layer.style.borderRadius = "4px";
        document.body.appendChild(layer);
        return layer;
    }

    // 1秒待機してからボタン追加
    setTimeout(() => {
        const buttonLayer = createButtonLayer();

        // リスト保存ボタン
        const saveBtn = createButton("リスト保存", function() {
            // 画面をある程度スクロール
            window.scrollTo({ top: 4000});
            // 0.5秒待機してから処理
            setTimeout(function() {
                let episode_elm_list = document.querySelectorAll("div.com-contentlist-ContentlistContainer li.com-contentlist-ItemListForContentlistContent__item");
                let results = [];
                episode_elm_list.forEach(function (episode_elm) {
                    let url = episode_elm.querySelector("a")?.href || "";
                    let isPreBroadcast = (!!episode_elm.querySelector("span.com-PreBroadcastTag") || 
                                            !!episode_elm.querySelector("span.com-shared-premium_precedence-PremiumPrecedenceLabel__text"));
                    let isPremium = (episode_elm.querySelector("span.com-shared-viewing_type-ViewingTypeLabel > span")?.innerText === "プレミアム" ||
                                    episode_elm.querySelector("span.com-shared-premium_precedence-PremiumPrecedenceLabel__text")?.innerText === "プレミアム先行");

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
                window.scrollTo({ top: 0});

                const onlineVideoCount = results.filter(item => item.isPremium === false && item.isPreBroadcast === false).length;
                alert(`取得：${results.length}\n有効：${onlineVideoCount}\nLocalStorageに保存しました（key: abebe, subkey: ${pathKey}）`);
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
        buttonLayer.appendChild(saveBtn);
        buttonLayer.appendChild(extractBtn);
        buttonLayer.appendChild(clearBtn);
    }, 500); // 1秒待
})();


