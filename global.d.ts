export interface ChannelListResponse {
    kind: string;
    etag: string;
    pageInfo: PageInfo;
    items: Channel[];
}

export interface PageInfo {
    totalResults: number;
    resultsPerPage: number;
}

export interface Channel {
    kind: string;
    etag: string;
    id: string;
    statistics: ChannelStatistics;
}

export interface ChannelStatistics {
    viewCount: string;
    subscriberCount: string;
    hiddenSubscriberCount: boolean;
    videoCount: string;
}
