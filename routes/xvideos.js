const request = require('request');
const entities = require('entities');

function xvideos(req, res, apikey) {
  var ApiKey = req.query.apikey;
  var text = req.query.text;
  var option = req.query.option;
  if (!ApiKey) return res.send({
    status: false,
    message: 'apikey not defined'
  });
  if (ApiKey != apikey) return res.send({
    status: false,
    message: 'invalid apikey'
  });
  if (!text) return res.send({
    status: false,
    message: 'text is not defined'
  });
  if (!option) return res.send({
    status: false,
    message: 'parameter option not defined'
  });
  if (option != 'search' && option != 'download') return res.send({
    status: false,
    message: 'invalid option'
  });
  
  if (option == 'search') {
    const start = word => {
      var normalize = word.split(' ').join('+').split('%20').join('');
      var search = normalize.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      var url = `https://www.xvideos.com/?k=${search}`;

      var data = [];
      var xv = [];

      request(url, (err, req, body) => {
        if (err) return console.log(err);

        const regExp = /<\/div><div class=\".+?\"><p class=\".+?\"><a href=\".+?\" .+? <span class=\".+?\"><\/span>/g;

        const datas = body.match(regExp);
        data.push(...datas);

        var regExp2 = /\"\/.+?\"/g;
        var regExp3 = /title=\".+?\">/g;
       // var regExp4 = /\"duration\">.+?/g;
        for (let index of data) {
          var reg = index.match(regExp2);
          var reg2 = index.match(regExp3);
          var reg3 = reg2[0].split('title=').join('').split('>').join('');
          var obj = {
            title: entities.decodeHTML5(JSON.parse(reg3)),
            url: 'https://www.xvideos.com' + JSON.parse(reg[0]),
          };
          xv.push(obj);
        }
        res.send({
          status: true,
          result: xv
        });
      });
    };
    start(text);
  } else if (option == 'download') {
    const isUrlX = (url) => {
      var valid = url.startsWith('https://www.xvideos.com/');
      return !valid;
    };
    const start = (url) => {
      if (isUrlX(url)) return res.send({
        status: false,
        invalidUrl: url,
        message: 'this is not an url from xvideos'
      });
      const data = [];

      request(url, (err, req, body) => {
        if (err) return console.log(err);
        try {
          var regExp = /html5player\.setVideoTitle\(\'.+?\'\)/g;
          var _title = body.match(regExp)[0].split('html5player.setVideoTitle(\'').join('').split('\')').join('');
          var url_video = /html5player\.setVideoUrlHigh\(\'.+?\'\)/g;
          var _url_video_raw = body.match(url_video)[0].split('html5player.setVideoUrlHigh').join('').split('(').join('').split(')').join('').split('\'').join('');
          var duration1 = /class=\"duration\">.+?<\/span>/g;
          var duration = body.match(duration1)[0].split('class=\"duration\">').join('').split('<').join('').split('span>').join('').split('/').join('');
          var MinOurSec = duration.endsWith(' min') ? ' minutes': '' || duration.endsWith(' sec') ? ' seconds': '';
          var _duration = duration.split(' ')[0] + MinOurSec;
          var viewsV = /class=\"mobile-hide\">.+?<\/strong>/g;
          var _views = body.match(viewsV)[0].split('class=\"mobile-hide\">').join('').split('</strong>').join('');
          var _owner = /html5player\.setUploaderName\(\'.+?\'\)/g;
          var _ownerVideo = body.match(_owner)[0].split('html5player.setUploaderName(\'').join('').split('\')').join('');

          var obj = {
            owner: _ownerVideo,
            title: entities.decodeHTML5(_title),
            url: _url_video_raw,
            duration: _duration,
            views: _views
          };
          data.push(obj);
        } catch (a) {
          return res.send({
            status: false,
            message: 'video not found'
          });
        }
        res.send({
          status: true,
          result: data
        });
      });
    };
    start(text);
  }
}

module.exports = { xvideos };