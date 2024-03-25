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

    return c.json(smiirlResponse);
});

export default app;
