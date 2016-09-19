/*
* @Author: caiyou
* @Date:   2016-09-13 12:08:12
* @Last Modified by:   caiyou
* @Last Modified time: 2016-09-19 14:09:30
*/

'use strict';

const co = require('co'),
      app = require('koa')(),
      iconv = require('iconv-lite'),
      request = require('co-request'),
      fs = require('co-fs'),
      views = require('co-views');

// let prodId = 1164570;//瓦尔塔
let prodId = 2520353;
let commentFile = '';
let commentArr = [];

let render = views(__dirname + '/views', {ext: 'ejs'});

function onerror(err) {
  console.error(err.stack);
  console.log(err);
}

function convertScoreToStars(score) {
  let starArr = [], starStr;
  for(let i = 0; i < score; i++) {
    starArr.push('★');
  }
  starStr = starArr.toString();
  starStr = starStr.replace(/,/g, ' ');

  return starStr;
}

co(function* () {

  app.use(function* (next) {
    let start = +new Date();
    yield next;
    let end = +new Date();
    console.log('耗时' + (end-start) + 'ms');
  });

  app.use(function* (next) {
    let page = 0;
    yield fs.open('./content.txt', 'w');

    for(page = 0; page < 10; page++) {
      let commentPerPage = [];
      console.log('正在读取SKU: ' + prodId + '第' +(page + 1)+ '页');
      commentFile += '>>>>>>>>>>>>>>第'+(page + 1)+'页<<<<<<<<<<<<<<' + '\n\n';
      let res = yield request({
        uri: 'http://sclub.jd.com/productpage/p-' + prodId + '-s-0-t-3-p-'+page+'.html?callback=',
        encoding: null
      });
      if(res) {
        let resData = JSON.parse(iconv.decode(res.body, 'GBK'));
        let comm = resData.comments;
        if(comm.length > 0) {
          comm.forEach((el)=> {
            var starStr = convertScoreToStars(el.score);
            let fileContent = '【' + el.nickname + '】【' + el.referenceTime + '】 ' + starStr + el.score +'星' + '\n' + el.content + '\n\n'
            commentFile += fileContent;
            commentPerPage.push({
              nickname: el.nickname,
              referenceTime: el.referenceTime,
              starStr: starStr,
              score: el.score,
              content: el.content
            });
          });
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
      commentArr.push({
        page: page + 1,
        commentList: commentPerPage
      });
    }
    if(commentFile) {
      yield fs.writeFile('content.txt', commentFile, {
        flag: 'a+'
      });
      commentFile = '';
    }
    yield fs.writeFile('content.txt', '[该页没有数据]', {
      flag: 'a+'
    });

    console.log('共爬取' + (page + 1) + '页评论数据');
    yield next;
  });

  app.use(function* () {
    this.body = yield render('comments', {comments: commentArr});
  });



  app.listen(3000);
  console.log('crawler is listening at PORT 3000...');
}).catch(onerror);

