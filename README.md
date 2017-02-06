# grkBlogBot / Check GRKB Blog Update

## これなに
気付いたら先代ごらくブログbot ([@gorakublog](https://twitter.com/gorakublog)) が1年半前に死んでいたので作りました。  
更新を検知するとタイトルとURLが ごらくブログbot v2 ([@grk_b_log_bot](https://twitter.com/grk_b_log_bot)) からツイートされます。  
更新確認は3分毎です。

## つかいかた
1. [@grk_b_log_bot](https://twitter.com/grk_b_log_bot) をフォロー
1. ツイートが来たらアクセスする
1. 便利

## 使ってるもの

node.js (v7.4.0 で動作します)  
<s>
- [cheerio-httpcli](https://www.npmjs.com/package/cheerio-httpcli)  
アーリーウィング公式ブログの HTML スクレイピングに使用 <font color="Gray"><s> RSS フィードつけてくれ</s></font>
</s>  
アーリーウィングブログにも RSS があったのでそっちを使うようにしました。
(Thx: [@dolciss](https://twitter.com/L_tan/status/826436855105097728))
- [twitter](https://www.npmjs.com/package/twitter)  
ツイート用
- [confu](https://www.npmjs.com/package/confu)  
bot の CK/CS を読み込むのに使用  
- [feedparser](https://www.npmjs.com/package/feedparser)  
RSS フィードの読み込みに使用
- [request](https://www.npmjs.com/package/request)  
HTTP リクエストを送るやつ
- [cron](https://github.com/kelektiv/node-cron)  
定期実行用
- [pm2](https://www.npmjs.com/package/pm2)  
実行プロセスのデーモン化に使用  
  
AWS EC2  
- 自前のインスタンスで動いてます

## 問題点
- ちゃんと動くんですか  
たぶん

## なにかあったら
[@albNo273](https://twitter.com/albNo273) までご連絡ください。