const request = require('request');

function image(req, res, apikey) {
  var ApiKey = req.query.apikey;
  var text = req.query.text;
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

  const start = (word) => {
    var normalize = word.split(' ').join('');
    var search = normalize.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    var url = `https://www.google.com/search?q=${search}&tbm=isch&start=1`;
    var data = [];
    var data_2 = [];
    var data_3 = [];

    request(url, (err, req, body) => {
      if (err) return console.log(err);

      const regExp = /<img class=\".+?\" alt=\"\" src=\".+?\"\/>/g;
      const datas = body.match(regExp);
      data.push(...datas);

      const regExp1 = /src=\".+?\"/g;
      for (let i of data) {
        var regex = i.match(regExp1);
        var reg = regex[0].split('src=').join('');
        var obj = {
          url: JSON.parse(reg)
        };
        data_2.push(obj);
      }
      for (let y of data_2) {
        if (!y.url.startsWith('/images/branding/')) {
          data_3.push(y);
        } else {}
      }
      res.send({
        status: true,
        result: data_3
      });
    });
  };
  start(text);
}

module.exports = { image };