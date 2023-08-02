// ==UserScript==
// @name         TweetDeck version changer
// @namespace    https://twitter.com/oz0820
// @version      2023.08.02.0
// @description  TweetDeckのバージョンをサクッと切り替えたいです．
// @author       oz0820
// @match        https://tweetdeck.twitter.com/
// @updateURL    https://github.com/oz0820/browser-userscript/raw/main/tweetdeck-version-changer/tweetdeck-version-changer.user.js
// @icon         data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNiAyNiI+PHBhdGggZD0iTTIyLjIsMC4ySDMuOUMyLDAuMiwwLjUsMS43LDAuNSwzLjZ2MTUuNWMwLDEuOSwxLjUsMy40LDMuNCwzLjRoNS43bDMuNCwzLjRsMy40LTMuNGg1LjdjMS45LDAsMy40LTEuNSwzLjQtMy40VjMuNkMyNS43LDEuNywyNC4xLDAuMiwyMi4yLDAuMnoiIGZpbGw9IiMxREExRjIiLz48cGF0aCBkPSJNOS44LDE4LjZjNi4zLDAsOS44LTUuMiw5LjgtOS44VjguNGMwLjctMC41LDEuMy0xLjEsMS43LTEuOGMtMC42LDAuMy0xLjMsMC41LTIsMC41YzAuNy0wLjQsMS4zLTEuMSwxLjUtMS45Yy0wLjYsMC40LTEuNCwwLjctMi4yLDAuOGMtMC42LTAuNi0xLjUtMS0yLjUtMWMtMS45LDAtMy40LDEuNS0zLjQsMy40YzAsMC4zLDAsMC41LDAuMSwwLjhDOS45LDksNy40LDcuNyw1LjcsNS42QzUuNCw2LjEsNS4yLDYuNyw1LjIsNy4zYzAsMS4yLDAuNiwyLjIsMS41LDIuOWMtMC41LDAtMS4xLTAuMi0xLjUtMC41YzAsMS43LDEuMiwzLjEsMi44LDMuNGMtMC4zLDAuMS0wLjYsMC4xLTAuOSwwLjFjLTAuMiwwLTAuNCwwLTAuNi0wLjFjMC40LDEuNCwxLjcsMi40LDMuMiwyLjRDOC41LDE2LjQsNywxNyw1LjQsMTdINC42QzYsMTgsNy44LDE4LjYsOS44LDE4LjYiIGZpbGw9IiNGRkZGRkYiLz48L3N2Zz4=
// ==/UserScript==

(function() {

    const beta_run = function () {
        let bro = null;
        while (bro === null) {
            bro = document.querySelector('div[class="css-1dbjc4n r-1awozwy r-23eiwj"]');
        }

        let ad = `
<div class="css-1dbjc4n r-1awozwy r-23eiwj">
  <div class="css-1dbjc4n r-1g94qm0" id="td_rollback_btn">
    <div style="visibility: hidden; width: 0px; height: 0px;"></div>
    <div aria-expanded="false" aria-haspopup="menu" aria-label="ロールバック" role="button" tabindex="0" class="css-18t94o4 css-1dbjc4n r-1awozwy r-sdzlij r-18u37iz r-1777fci r-1qgeeu r-v4egcq r-1pl7oy7 r-1v6e3re r-1ny4l3l r-t60dpp r-o7ynqc r-6416eg">
      <svg viewBox="0 0 512 512" aria-hidden="true" class="r-vlxjld r-4qtqp9 r-yyyyoo r-1kyft7q r-ywje51 r-dnmrzs r-bnwqim r-1plcrui r-o7ynqc r-clp7b1 r-lrvibr">
        <g>
          <path d="M256.709 0L80.744 256l175.965 256h174.547L255.294 256L367.42 92.867l63.836-92.711h-0.11L431.256 0H256.709z M317.858 400.152l56.062 81.723H272.533L117.279 255.992h101.496L317.858 400.152z"></path>
        </g>
      </svg>
    </div>
  </div>
</div>`;

        bro.insertAdjacentHTML('beforebegin', ad);
        const rollback = function () {
            const ans = confirm("ロールバックを実行しますか？");
            if (ans) {
                document.cookie = 'tweetdeck_version=legacy; domain=.twitter.com; path=/;';
                alert("Cookie tweetdeck_version=legacy に書き換えました．");
                location.reload();
            }
        }

        document.getElementById('td_rollback_btn')
            .addEventListener('click', rollback);
    }


    const legacy_run = function () {
        let bro = null;
        while (bro === null) {
            bro = document.querySelector('a[data-action="change-sidebar-width"]');
        }

        let ad = `
<a id="td_rollforward_btn" class="js-header-action link-clean cf app-nav-link padding-h--16 padding-v--2" data-title="rollforward">
  <div>
    <svg viewBox="0 0 512 512" class="r-4qtqp9 r-yyyyoo r-dnmrzs">
      <g>
        <path d="M255.292 512l175.932-255.953L255.292 0.094H143.577L80.909 0l0.058 0.094h-0.191l175.929 255.954 L144.702 418.994l-63.926 92.842h0.11L80.776 512H255.292z M293.218 256.039h65.262l36.158 0.09L239.47 481.881h-65.094 l-36.326-0.09L293.218 256.039z"></path>
      </g>
    </svg>
  </div>
</a>`
// document.cookie = 'tweetdeck_version=; max-age=0;'
        bro.insertAdjacentHTML('beforebegin', ad);
        const rollforward = function () {
            const ans = confirm("ロールフォワードを実行しますか？");
            if (ans) {
                document.cookie = 'tweetdeck_version=beta; domain=.twitter.com; path=/;';
                alert("Cookie tweetdeck_version=beta に書き換えました．");
                location.reload();
            }
        }

        document.getElementById('td_rollforward_btn')
            .addEventListener('click', rollforward);
    }


    const deck_ver = document.cookie
        .split(';')
        .find(row => row.trim().startsWith('tweetdeck_version'))
        .split('=')[1];

    if (deck_ver === 'beta') {
        beta_run();
    }
    if (deck_ver === 'legacy') {
        legacy_run();
    }

})();