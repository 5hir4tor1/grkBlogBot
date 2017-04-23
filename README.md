# grkBlogBot / Check GRKB Blog Update

## About
気付いたら先代ごらくブログbot ([@gorakublog](https://twitter.com/gorakublog)) が動作を停止していたので作りました。

更新を検知するとタイトルとURLが ごらくブログbot v2 ([@grk_b_log_bot](https://twitter.com/grk_b_log_bot)) からツイートされます。

更新確認は3分毎です。

## Usage
1. [@grk_b_log_bot](https://twitter.com/grk_b_log_bot) をフォロー
1. ツイートが来たらアクセスする
1. 便利

## Dependencies
- node.js (- v7.4.0)
    - <s>[cheerio-httpcli](https://www.npmjs.com/package/cheerio-httpcli)</s>
    アーリーウィングブログにも RSS があったのでそっちを使うようにしました。Thx: [@dolciss](https://twitter.com/L_tan/status/826436855105097728)
    - [twitter](https://www.npmjs.com/package/twitter)
    - [confu](https://www.npmjs.com/package/confu)
    - [feedparser](https://www.npmjs.com/package/feedparser)
    - [request](https://www.npmjs.com/package/request)
    - [cron](https://github.com/kelektiv/node-cron)
    - [pm2](https://www.npmjs.com/package/pm2)

## Contact
[@albNo273](https://twitter.com/albNo273) までご連絡ください。