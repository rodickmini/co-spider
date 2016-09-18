/*
* @Author: caiyou
* @Date:   2016-09-13 12:08:12
* @Last Modified by:   caiyou
* @Last Modified time: 2016-09-18 17:09:07
*/

'use strict';

const co = require('co'),
      iconv = require('iconv-lite'),
      request = require('co-request'),
      colors = require('colors'),
      fs = require('co-fs');

co(function* () {
  yield fs.unlink('content.txt');
  for(let i = 0;; i++) {
    yield fs.writeFile('content.txt', '\n\n\n' + '>>>>>>>>>>>>>>第'+(i + 1)+'页<<<<<<<<<<<<<<' + '\n\n', {
      flag: 'a+'
    });
    console.log(colors.inverse('>>>>>>>>>>>>>>第'+(i + 1)+'页<<<<<<<<<<<<<<'));
    let res = yield request({
      uri: 'http://sclub.jd.com/productpage/p-1164570-s-0-t-3-p-'+i+'.html?callback=',
      encoding: null
    });
    if(res) {
      let resData = JSON.parse(iconv.decode(res.body, 'GBK'));
      let comm = resData.comments;
      if(comm.length > 0) {
        
        comm.forEach(co.wrap(function* (el) {
          var starArr = [], starStr;
          for(var i = 0; i < el.score; i++) {
            starArr.push('★');
          }
          starStr = starArr.toString();
          starStr = starStr.replace(/,/g, ' ');
          let content = '【' + el.nickname.cyan + '】【' + el.referenceTime.red + '】 ' + starStr.yellow + '\n' + el.content + '\n';
          yield fs.writeFile('content.txt', '【' + el.nickname + '】【' + el.referenceTime + '】 ' + starStr + '\n' + el.content + '\n\n', {
            flag: 'a+'
          });
          console.log(content);
        }));
      }else {
        break;
      }
    }
  }
}).catch(err => {
  console.log(err);
});