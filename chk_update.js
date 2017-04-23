'use strict';
/* ごらくブログbotリバイバル */

const twitter    = require('twitter'),
      confu      = require('confu'),
      fs         = require('fs'),
      FeedParser = require('feedparser'),
      request    = require('request');

// bot の CK/CS 読み込み
const conf = confu('.', 'config', 'key.json');

// token 設定
const bot = new twitter({
    consumer_key: conf.key.cons_key,
    consumer_secret: conf.key.cons_sec,
    access_token_key: conf.key.acc_token,
    access_token_secret: conf.key.acc_token_sec
});

// RSS の URL
const shioriRss = 'http://feedblog.ameba.jp/rss/ameblo/mikami-shiori/rss20.xml',
      yukaRss   = 'http://www.earlywing.co.jp/category/blog/feed/',
      minamiRss = 'http://feedblog.ameba.jp/rss/ameblo/00dpd/rss20.xml',
      rumiRss   = 'http://feedblog.ameba.jp/rss/ameblo/rumiokubo/rss20.xml';

exports.func = async () => {
    const text = await fs.readFileSync('b_log.txt', { encoding: "utf8" });
    /**
    * 確認前の最新の記事タイトルを格納
    * [0]: 三上枝織   shiori
    * [1]: 大坪由佳     yuka
    * [2]: 津田美波   minami
    * [3]: 大久保瑠美   rumi
    */
    const titleArr = await text.replace(/\r/g, "").split("\n");
    let flg = false;

    const shioriRes = await checkRSS(shioriRss);
    console.log('shiori-recent: ' + titleArr[0]);
    console.log('shiori-result: ' + shioriRes[0]);
    if (titleArr[0] != shioriRes[0]) {
        tweetUpdate('三上枝織', shioriRes);
        flg = true;
    }

    const yukaRes = await checkRSS(yukaRss);
    console.log('yuka-recent:   ' + titleArr[1]);
    console.log('yuka-result:   ' + yukaRes[0]);
    if (titleArr[1] != yukaRes[0] && yukaRes[0].match(/大坪由佳/g)) {
        tweetUpdate('大坪由佳', yukaRes);
        flg = true;
    }

    const minamiRes = await checkRSS(minamiRss);
    console.log('minami-recent: ' + titleArr[2]);
    console.log('minami-result: ' + minamiRes[0]);
    if (titleArr[2] != minamiRes[0]) {
        tweetUpdate('津田美波', minamiRes);
        flg = true;
    }

    const rumiRes = await checkRSS(rumiRss);
    console.log('rumi-recent:   ' + titleArr[3]);
    console.log('rumi-result:   ' + rumiRes[0]);
    if (titleArr[3] != rumiRes[0]) {
        tweetUpdate('大久保瑠美', rumiRes);
        flg = true;
    }

    if(flg) {
        await updateLog(shioriRes[0], yukaRes[0], minamiRes[0], rumiRes[0]);
    }
}

/**
 * ツイートする
 * @param head カテゴリ
 * @param data 記事タイトルとリンク
 */
function tweetUpdate(head, data) {
    const tweet_body = '【ブログ更新】' + head + ': ' + data[0] +
                       '\n' + data[1] + ' #yuruyuri';
    console.log(tweet_body);
    bot.post(
        'statuses/update', { status: tweet_body }, (err, tweet, response) => {
            if (!err) console.log('Tweet succeeded.');
            else      console.log('Tweet failed:', err);
        }
    );
}

/**
 * RSSフィードの確認
 * @param  url     RSS の URL
 */
function checkRSS(url) {
    return new Promise((resolve, reject) => {
        const fp_req      = request(url),
              feedparser  = new FeedParser();
        let items = [];

        fp_req.on('error', error => {
            reject(error);
        });

        fp_req.on('response', function (res) {
            let stream = this; // TODO: rewrite 'this' in arrow function
            if (res.statusCode != 200)
                reject(this.emit('error', new Error('Bad status code')));
            stream.pipe(feedparser);
        });

        feedparser.on('error', error => {
            reject(error);
        });

        feedparser.on('readable', function () {
            const item = this.read(); // TODO: rewrite 'this' in arrow function
            items.push(item);
        });

        feedparser.on('end', () => {
            resolve([items[0].title, items[0].link]);
        });
    })
    .catch(err => {
        console.log('checkRSS error:', err);
        return err;
    });
}

/**
 * ログファイルのアップデート
 */
function updateLog(shiori, yuka, minami, rumi) {
    return new Promise((resolve, reject) => {
        const text = shiori + '\n' + yuka + '\n' + minami + '\n' + rumi;
        fs.writeFileSync('b_log.txt', text, err => {
            if (!err) resolve();
            else      reject(err);
        });
    })
    .catch(err => {
        console.log('updateLog error:', err);
        return err;
    });
}