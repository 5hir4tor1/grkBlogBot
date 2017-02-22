/* 定期起動用(3分毎発火)) */

const cu = require('./chk_update.js');
let CronJob = require('cron').CronJob; 

// check update
new CronJob('0 1-58/3 * * * *', function() {
    const ctime = Date();
    console.log('\n=== ' + ctime + ' ===');
    cu.func();
}, null, true, "Asia/Tokyo");