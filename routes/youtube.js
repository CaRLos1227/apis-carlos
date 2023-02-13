const request = require('request');

function normalizeDate(date) {
  return date.split('-').reverse().join('/');
}

function gethtml(url) {
  return new Promise((resolve, reject) => {
    request(url, (err, req, body) => {
      if (err) reject(err);
      if (body) resolve(body);
    });
  });
}

async function youtube(req, res, apikey) {
  const ApiKey = req.query.apikey;
  const text = req.query.text;
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
  async function start(query) {
    const body = await gethtml(`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`);
    const infos = {
      titles: [],
      videoIds: [],
      thumbnails: [],
      channel_thumbnails: [],
      durations: [],
      views: []
    };
    JSON.parse(body.match(/var ytInitialData = {(.+?)};/gi)[0].replace(/var ytInitialData = |;/gi, '')).contents.twoColumnSearchResultsRenderer.primaryContents.sectionListRenderer.contents[0].itemSectionRenderer.contents.map(i => {
      if (Object.keys(i)[0] == 'videoRenderer') {
        if (i.videoRenderer.hasOwnProperty('lengthText')) {
          infos.videoIds.push(i.videoRenderer.videoId);
          infos.thumbnails.push(i.videoRenderer.thumbnail.thumbnails[0].url.split('?')[0]);
          infos.titles.push(i.videoRenderer.title.runs[0].text);
          infos.durations.push(i.videoRenderer.lengthText.simpleText);
          infos.views.push(i.videoRenderer.viewCountText.simpleText.replace(/visualizações| |views/gi, ''));
          infos.channel_thumbnails.push(i.videoRenderer.channelThumbnailSupportedRenderers.channelThumbnailWithLinkRenderer.thumbnail.thumbnails[0].url.split('=')[0]);
        } else if (!i.videoRenderer.hasOwnProperty('lengthText')) {
          infos.videoIds.push(i.videoRenderer.videoId);
          infos.thumbnails.push(i.videoRenderer.thumbnail.thumbnails[0].url.split('?')[0]);
          infos.titles.push(i.videoRenderer.title.runs[0].text);
          infos.durations.push('no duration - live');
          infos.views.push(i.videoRenderer.viewCountText.runs[0].text);
          infos.channel_thumbnails.push(i.videoRenderer.channelThumbnailSupportedRenderers.channelThumbnailWithLinkRenderer.thumbnail.thumbnails[0].url.split('=')[0]);
        }
      }
    });
    const body2 = await gethtml(`https://www.youtube.com/watch?v=${infos.videoIds[0]}`);
    const data = JSON.parse(body2.match(/var ytInitialPlayerResponse = {(.+?)};/gi)[0].replace(/var ytInitialPlayerResponse = |;/gi, ''));
    let reason;
    if (data.hasOwnProperty('playabilityStatus')) {
      reason = data.playabilityStatus.status == 'ERROR';
    }
    if (reason) return res.json({
      message: 'video indisponível'
    });

    const object = {
      videoId: infos.videoIds[0],
      title: infos.titles[0],
      source: 'https://youtu.be/' + infos.videoIds[0],
      thumbnail: infos.thumbnails[0],
      duration: infos.durations[0],
      views: infos.views[0],
      publicationDate: normalizeDate(data.microformat.playerMicroformatRenderer.publishDate),
      channel: {
        title: data.microformat.playerMicroformatRenderer.ownerChannelName,
        source: 'https://youtube.com/channel/' + data.microformat.playerMicroformatRenderer.externalChannelId,
        thumbnail: infos.channel_thumbnails[0],
        description: {
          text: data.microformat.playerMicroformatRenderer.description.simpleText
        }
      },
      category: data.microformat.playerMicroformatRenderer.category
    };

    res.json({
      status: true,
      result: object
    });
  }
  await start(text);
}

module.exports = {
  youtube
};