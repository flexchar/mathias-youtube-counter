import { Hono } from 'hono';
import { env } from 'hono/adapter';
import type { ChannelListResponse } from '../global';

const app = new Hono();

app.get('/', async (c) => {
    const { GOOGLE_API_KEY, YOUTUBE_CHANNEL_ID } = env(c) as {
        GOOGLE_API_KEY?: string;
        YOUTUBE_CHANNEL_ID?: string;
    };

    if (!GOOGLE_API_KEY || !YOUTUBE_CHANNEL_ID) {
        return c.json({ error: 'No Google API key provided' }, 500);
    }

    // See for docs: https://developers.google.com/youtube/v3/docs/channels/list
    const endpoint = 'https://content.googleapis.com/youtube/v3/channels';
    const params = new URLSearchParams({
        part: 'statistics',
        key: GOOGLE_API_KEY,
        id: YOUTUBE_CHANNEL_ID,
    });
    const url = `${endpoint}?${params.toString()}`;
    const res: ChannelListResponse = await fetch(url).then((r) => r.json());
    // return c.json(res);

    if (res.items.length === 0) {
        return c.json({ error: 'Channel not found' }, 404);
    }

    const { viewCount, subscriberCount, videoCount, hiddenSubscriberCount } =
        res.items[0].statistics;

    if (hiddenSubscriberCount) {
        return c.json({ error: 'Subscriber count is hidden' }, 403);
    }

    const smiirlResponse = {
        number: parseInt(subscriberCount),
        views: parseInt(viewCount),
        videos: parseInt(videoCount),
    };

    if (c.req.query('json')) {
        return c.json(smiirlResponse);
    }

    const template = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Counter</title>
<style>
  body {
    background-color: darkgrey;
    font-family: Arial, sans-serif;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    margin: 0;
  }
  .counter-container {
    background-color: #ffffff;
    padding: 20px;
    border: 2px solid #000000;
    box-shadow: 5px 5px 0px #000000;
  }
  .title {
    font-size: 20px;
    color: #333333;
    margin: 0 0 10px 0;
  }
  .number {
    font-size: 50px;
    color: #000000;
    margin: 0;
    text-align: right;
  }
</style>
</head>
<body>
<div class="counter-container">
  <p class="title">Subscribers</p>
  <p class="number">${smiirlResponse.number.toLocaleString('lt-LT')}</p>
  <p class="title">Views</p>
  <p class="number">${smiirlResponse.views.toLocaleString('lt-LT')}</p>
  <p class="title">Videos</p>
  <p class="number">${smiirlResponse.videos.toLocaleString('lt-LT')}</p>
</div>
</body>
</html>
`;

    return c.html(template);
});

export default app;
