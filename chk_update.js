/* ごらくブログbotリバイバル */

const twitter = require('twitter'),
      confu = require('confu'),
      fs = require('fs'),
      FeedParser = require('feedparser'),
      request = require('request');

// bot の CK/CS 読み込み
const conf = confu('.', 'config', 'key.json');
// console.log(conf);

// token 設定
const bot = new twitter({
    consumer_key: conf.key.cons_key,
    consumer_secret: conf.key.cons_sec,
    access_token_key: conf.key.acc_token,
    access_token_secret: conf.key.acc_token_sec
});

// RSS の URL
const shiori_rss = 'http://feedblog.ameba.jp/rss/ameblo/mikami-shiori/rss20.xml',
      yuka_rss = 'http://www.earlywing.co.jp/category/blog/feed/',
      minami_rss = 'http://feedblog.ameba.jp/rss/ameblo/00dpd/rss20.xml',
      rumi_rss = 'http://feedblog.ameba.jp/rss/ameblo/rumiokubo/rss20.xml';

// 確認時のタイトルと URL
let shiori, yuka, minami, rumi;

exports.func = function () {

    Promise.resolve()
        // 1. 直近の記事タイトルを読み込む
        .then(function () {
            return new Promise(function (resolve, reject) {
                const text = fs.readFileSync('b_log.txt', { encoding: "utf8" });
                /** 
                 * 確認前の最新の記事タイトルを格納
                 * [0]: 三上枝織   shiori
                 * [1]: 大坪由佳     yuka
                 * [2]: 津田美波   minami
                 * [3]: 大久保瑠美   rumi    
                 */
                const title_arr = text.replace(/\r/g, "").split("\n");
                console.log('Recent titles loaded.');

                resolve(title_arr);
            });
        })
        // 2. RSSフィードを確認
        .then(function (title_arr) {
            return new Promise(function (resolve, reject) {
                Promise.all([
                    new Promise(function (resolve, reject) {
                        checkRSS(shiori_rss, function (err, result) {
                            if (!err) {
                                shiori = result;
                                // console.log(shiori);
                                console.log('shiori-recent: ' + title_arr[0]);
                                console.log('shiori-result: ' + shiori[0]);

                                if (title_arr[0] != shiori[0]) {
                                    tweetUpdate('三上枝織', shiori);
                                    resolve(true);
                                } else
                                    resolve(false);
                            }
                        });
                    }),
                    new Promise(function (resolve, reject) {
                        checkRSS(yuka_rss, function (err, result) {
                            if (!err) {
                                yuka = result;
                                // console.log(yuka);
                                console.log('yuka-recent:   ' + title_arr[1]);
                                console.log('yuka-result:   ' + yuka[0]);

                                if (title_arr[1] != yuka[0] && yuka[0].includes('大坪')) {
                                    tweetUpdate('大坪由佳', yuka);
                                    resolve(true);
                                } else
                                    resolve(false);
                            }
                        });
                    }),
                    new Promise(function (resolve, reject) {
                        checkRSS(minami_rss, function (err, result) {
                            if (!err) {
                                minami = result;
                                // console.log(minami);
                                console.log('minami-recent: ' + title_arr[2]);
                                console.log('minami-result: ' + minami[0]);

                                if (title_arr[2] != minami[0]) {
                                    tweetUpdate('津田美波', minami);
                                    resolve(true);
                                } else
                                    resolve(false);
                            }
                        });
                    }),
                    new Promise(function (resolve, reject) {
                        checkRSS(rumi_rss, function (err, result) {
                            if (!err) {
                                rumi = result;
                                // console.log(rumi);
                                console.log('rumi-recent:   ' + title_arr[3]);
                                console.log('rumi-result:   ' + rumi[0]);

                                if (title_arr[3] != rumi[0]) {
                                    tweetUpdate('大久保瑠美', rumi);
                                    resolve(true);
                                } else
                                    resolve(false);
                            }
                        });
                    })
                ]).then(
                    function (results) {
                        // console.log(results);
                        if (results.indexOf(true) >= 0)
                            resolve(true);
                        else
                            resolve(false);
                    });
            })
        })
        // 3. 記事タイトルログの更新
        .then(function (flg) {
            return new Promise(function (resolve, reject) {
                if (flg) {
                    const text = shiori[0] + '\n' + yuka[0] + '\n'
                            + minami[0] + '\n' + rumi[0];
                    fs.writeFileSync('b_log.txt', text, function (err) {
                        if (!err)
                            console.log('Log update succeeded.');
                        else {
                            console.log('Log update failed.');
                            console.log(err);
                        }
                    });
                    resolve(null);
                } else {
                    console.log('Log is not updated.');
                    resolve(null);
                }
            });
        })
        .then(function (value) {
            console.log('All processing is done.');
        })
        .catch(function (err) {
            console.log(err);
        });

}

/**
 * ツイートする
 * @param head カテゴリ
 * @param data 記事タイトルとリンク
 */
function tweetUpdate(head, data) {

    const tweet_body = '【ブログ更新】' + head + ': ' + data[0] + '\n' + data[1];
    console.log(tweet_body);
    
    bot.post(
        'statuses/update',
        { status: tweet_body },
        function (err, tweet, response) {
            if (!err) {
                console.log('Tweet succeeded.');
            } else {
                console.log('Tweet failed.');
                console.log(err);
            }
        }
    );
    
}

/**
 * RSSフィードの確認
 * @param url       RSS の URL
 * @param callback  array - [0]: 記事タイトル [1]: リンク
 */
function checkRSS(url, callback) {

    const fp_req = request(url),
          feedparser = new FeedParser();
    let result,
        items = [];

    fp_req.on('error', function (error) {
        // Request error
    });

    fp_req.on('response', function (res) {
        let stream = this;
        if (res.statusCode != 200) {
            return this.emit('error', new Error('Bad status code'));
        }
        stream.pipe(feedparser);
    });

    feedparser.on('error', function (error) {
        // Error
    });

    feedparser.on('readable', function () {
        item = this.read();
        items.push(item);
    });

    feedparser.on('end', function () {
        result = Array(items[0].title, items[0].link);
        // console.log(result);
        callback(null, result);
    });
}