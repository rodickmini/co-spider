/*
* @Author: caiyou
* @Date:   2016-09-13 12:08:12
* @Last Modified by:   caiyou
* @Last Modified time: 2016-09-18 18:52:51
*/

'use strict';

const co = require('co'),
      iconv = require('iconv-lite'),
      request = require('co-request'),
      colors = require('colors'),
      fs = require('co-fs');

let prodId = 1164570;
// let prodId = 1333697;
let commentFile = '';

co(function* () {

  let start = +new Date();
  let page = 0;

  yield fs.open('./content.txt', 'w');

  for(page = 0;; page++) {
    console.log('正在读取SKU: ' + prodId + '第' +(page + 1)+ '页');
    commentFile += '>>>>>>>>>>>>>>第'+(page + 1)+'页<<<<<<<<<<<<<<' + '\n\n';
    // console.log(colors.inverse('>>>>>>>>>>>>>>第'+(page + 1)+'页<<<<<<<<<<<<<<'));
    let res = yield request({
      uri: 'http://sclub.jd.com/productpage/p-' + prodId + '-s-0-t-3-p-'+page+'.html?callback=',
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
          let fileContent = '【' + el.nickname + '】【' + el.referenceTime + '】 ' + starStr + '\n' + el.content + '\n\n'
          commentFile += fileContent;
          // let content = '【' + el.nickname.cyan + '】【' + el.referenceTime.red + '】 ' + starStr.yellow + '\n' + el.content + '\n';
          // console.log(content);
        }));
      }else {
        break;
      }
    }
    if(page % 10 === 0) {
      yield fs.writeFile('content.txt', commentFile, {
        flag: 'a+'
      });
      commentFile = '';
    }
  }
  if(commentFile) {
    yield fs.writeFile('content.txt', commentFile, {
      flag: 'a+'
    });
    commentFile = '';
  }

  let end = +new Date();

  console.log('共爬取' + (page + 1) + '页评论数据');
  console.log('耗时' + (end-start) + 'ms');

}).catch(err => {
  console.log(err);
});