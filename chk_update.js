/* ごらくブログbotリバイバル */

var twitter = require('twitter');
var confu = require('confu');
var fs = require('fs');
var async = require('async');
var FeedParser = require('feedparser');
var request = require('request');

// bot の CK/CS 読み込み
var conf = confu('.', 'config', 'key.json');
// console.log(conf);

// token 設定
var bot = new twitter({
    consumer_key: conf.key.cons_key,
    consumer_secret: conf.key.cons_sec,
    access_token_key: conf.key.acc_token,
    access_token_secret: conf.key.acc_token_sec
});

var shiori_rss = 'http://feedblog.ameba.jp/rss/ameblo/mikami-shiori/rss20.xml';
var yuka_rss = 'http://www.earlywing.co.jp/category/blog/feed/';
var minami_rss = 'http://feedblog.ameba.jp/rss/ameblo/00dpd/rss20.xml';
var rumi_rss = 'http://feedblog.ameba.jp/rss/ameblo/rumiokubo/rss20.xml';

exports.func = function () {

    /** 
     * 確認前の最新のエントリタイトルを格納
     * [0]: 三上枝織   shiori
     * [1]: 大坪由佳     yuka
     * [2]: 津田美波   minami
     * [3]: 大久保瑠美   rumi    
     */
    var title_arr = new Array(4);

    /**
     * 確認時の記事タイトルとリンクを格納
     * [0]: 記事タイトル(整形後)
     * [1]: 記事リンク
     */
    var shiori = new Array(2);
    var yuka = new Array(2);
    var minami = new Array(2);
    var rumi = new Array(2);

    // 更新の有無フラグ
    var flg = false;

    // 非同期処理
    async.waterfall([
        readRecentTitle,
        checkAmebloUpdate,
        updateLog,
    ], function (err) {
        if (err)
            throw err;
        else
            console.log('All processing is completed.');
    });

    // 1. 直近の記事タイトルを読み込む
    function readRecentTitle(callback) {
        setTimeout(function () {
            var text = fs.readFileSync('b_log.txt', { encoding: "utf8" });
            // \r を除去し、\n で配列に分割
            title_arr = text.replace(/\r/g, "").split("\n");
            console.log('Recent titles loaded.');

            callback(null);
        }, 100);
    }

    // 2. アメブロ組のRSSフィードを確認
    function checkAmebloUpdate(callback) {
        setTimeout(function () {
            checkRSS(shiori_rss, function (err, result) {
                if (!err) {
                    shiori = result;
                    // console.log(shiori);
                    console.log('shiori-recent: ' + title_arr[0]);
                    console.log('shiori-result: ' + shiori[0]);

                    if (title_arr[0] != shiori[0]) {
                        tweetUpdate('三上枝織', shiori);
                        flg = true;
                    }
                }
            });

            checkRSS(yuka_rss, function (err, result) {
                if (!err) {
                    yuka = result;
                    // console.log(yuka);
                    console.log('yuka-recent:   ' + title_arr[1]);
                    console.log('yuka-result:   ' + yuka[0]);

                    if (title_arr[1] != yuka[0] && yuka[0].match(/大坪/)) {
                        tweetUpdate('大坪由佳', yuka);
                        flg = true;
                    }
                }
            });

            checkRSS(minami_rss, function (err, result) {
                if (!err) {
                    minami = result;
                    // console.log(minami);

                    console.log('minami-recent: ' + title_arr[2]);
                    console.log('minami-result: ' + minami[0]);

                    if (title_arr[2] != minami[0]) {
                        tweetUpdate('津田美波', minami);
                        flg = true;
                    }
                }
            });

            checkRSS(rumi_rss, function (err, result) {
                if (!err) {
                    rumi = result;
                    // console.log(rumi);

                    console.log('rumi-recent:   ' + title_arr[3]);
                    console.log('rumi-result:   ' + rumi[0]);

                    if (title_arr[3] != rumi[0]) {
                        tweetUpdate('大久保瑠美', rumi);
                        flg = true;
                    }
                }
            });

            callback(null);
        }, 500);
    }

    // 4. 記事タイトルログの更新
    function updateLog(callback) {
        setTimeout(function () {
            if (flg) {
                var text = shiori[0] + '\n' + yuka[0] + '\n'
                    + minami[0] + '\n' + rumi[0];
                fs.writeFileSync('b_log.txt', text, function (err) {
                    if (!err)
                        console.log('Log update succeeded.');
                    else {
                        console.log('Log update failed.');
                        console.log(err);
                    }
                });
            } else {
                console.log('Log is not updated.');
            }

            callback(null);
        }, 2500);
    }

}

/**
 * ツイートする
 * @param head カテゴリ
 * @param data 記事タイトルとリンク
 */
function tweetUpdate(head, data) {

    var tweet_body = '【ブログ更新】' + head + ': ' + data[0] + '\n' + data[1];
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
 * @param callback  コールバック(第2引数にタイトルとリンクが入る)
 */
function checkRSS(url, callback) {

    var fp_req = request(url);
    var feedparser = new FeedParser();
    var result;
    var items = [];

    fp_req.on('error', function (error) {
        // Request error
    });

    fp_req.on('response', function (res) {
        var stream = this;
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