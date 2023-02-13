const ytdl = require('ytdl-core');
const youtube = require('@yimura/scraper');
const yt = new youtube.default('pt-br');

async function ytmp3(req, res, apikey) {
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
  async function init(querytext) {
    if (!querytext) throw new Error('text no defined');
    const data = await yt.search(querytext);
    const { shareLink } = data.videos[0];
    const { formats, videoDetails } = await ytdl.getInfo(shareLink);
    let video = [];
    let audio = [];
    formats.map(i => {
      if (i.videoCodec) {
        video.push(i.url);
      } else if (i.audioCodec) {
        audio.push(i.url);
      }
    });
    data.videos[0].channel.description = {
      text: videoDetails.description
    };
    return {
      title: videoDetails.title,
      source: shareLink,
      thumbnail: data.videos[0].thumbnail,
      duration: data.videos[0].duration_raw,
      uploaded: data.videos[0].uploaded,
      views: data.videos[0].views,
      channel: data.videos[0].channel,
      download: {
        audio: audio[audio.length -1],
        video: video[0]
      },
      category: videoDetails.category
    };
  }
  let response = await init(text);
  res.json({
    status: true,
    result: response
  });
}

module.exports = {
  ytmp3
};