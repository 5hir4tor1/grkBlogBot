/* 定期起動用(5秒毎発火)) */

var cu = require('./chk_update.js');
let CronJob = require('cron').CronJob; 

// check update
new CronJob('0-55/5 * * * * *', function() {
    var ctime = Date();
    console.log('\n=== ' + ctime + ' ===');
    cu.func();
}, null, true, "Asia/Tokyo");