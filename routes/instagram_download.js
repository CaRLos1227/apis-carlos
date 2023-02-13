const axios = require('axios');

async function download_instagram(req, res, apikey) {
  let ApiKey = req.query.apikey;
  let url = req.query.url;
  if (!ApiKey) return res.send({
    status: false,
    message: 'apikey not defined'
  });
  if (ApiKey != apikey) return res.send({
    status: false,
    message: 'invalid apikey'
  });
  if (!url) return res.send({
    status: false,
    message: 'url is not defined'
  });
  
  const start = async (uri) => {
  let body = await axios.get(uri, {headers: {cookie: 'csrftoken=Ey5xXoPdlwqeCfBisirixN2CS3o4WYfg; mid=YjSX4wABAAF5h0MEvmrKQQYn0Crq; ig_nrcb=1'}});
  let jsonObject = {};
  //try {
    let data = JSON.parse(body.data.match(/window\._sharedData = {(.+)}/gi)[0].replace(/window\._sharedData = /g, ''));
    data.entry_data.PostPage[0].graphql.shortcode_media.is_video ? data.entry_data.PostPage[0].graphql.shortcode_media.is_image = false: data.entry_data.PostPage[0].graphql.shortcode_media.is_image = true;
    if (data.entry_data.PostPage[0].graphql.shortcode_media.is_image) {
      let qualities = [];
      jsonObject.name_for_search = data.entry_data.PostPage[0].graphql.shortcode_media.owner.username;
      jsonObject.name = data.entry_data.PostPage[0].graphql.shortcode_media.owner.full_name;
      jsonObject.folowers = data.entry_data.PostPage[0].graphql.shortcode_media.owner.edge_followed_by.count;
      jsonObject.totalLikes = data.entry_data.PostPage[0].graphql.shortcode_media.edge_media_preview_like.count;
      jsonObject.totalComments = data.entry_data.PostPage[0].graphql.shortcode_media.edge_media_preview_comment.count;
      jsonObject.image_caption = data.entry_data.PostPage[0].graphql.shortcode_media.edge_media_to_caption.edges[0].node.text;
      data.entry_data.PostPage[0].graphql.shortcode_media.display_resources.map(i => {
        qualities.push(i.config_height);
        qualities.push(i.config_width);
      });
      let maxQuality = qualities.reduce((a, b) => {
        return Math.max(a, b);
      }, -Infinity);
      data.entry_data.PostPage[0].graphql.shortcode_media.display_resources.map(i => {
        if (i.config_width == maxQuality) {
          jsonObject.imgUrl = i.src;
        }
      });
    } else if (data.entry_data.PostPage[0].graphql.shortcode_media.is_video) {
      jsonObject.name_for_search = data.entry_data.PostPage[0].graphql.shortcode_media.owner.username;
      jsonObject.name = data.entry_data.PostPage[0].graphql.shortcode_media.owner.full_name;
      jsonObject.folowers = data.entry_data.PostPage[0].graphql.shortcode_media.owner.edge_followed_by.count;
      jsonObject.totalLikes = data.entry_data.PostPage[0].graphql.shortcode_media.edge_media_preview_like.count;
      jsonObject.totalComments = data.entry_data.PostPage[0].graphql.shortcode_media.edge_media_preview_comment.count;
      jsonObject.duration = String(data.entry_data.PostPage[0].graphql.shortcode_media.video_duration).split('.')[0] + ' seconds';
      jsonObject.videoUrl = data.entry_data.PostPage[0].graphql.shortcode_media.video_url;
    }
    res.json({
      status: true,
      result: jsonObject
    });
  };
  await start(url);
}

module.exports = { download_instagram };