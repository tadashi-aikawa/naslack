const BASE_URL = "https://slack.com/api";

type UserId = string;
type ChannelId = string;
type TimeStamp = `${string}.${string}`;

export interface SlackResponse {
  ok: boolean;
  query: string;
  messages: {
    total: number;
    pagination: {
      total_count: number;
      page: number;
      per_page: number;
      first: number;
      last: number;
    };
    paging: {
      count: number;
      total: number;
      page: number;
      pages: number;
    };
    matches: MatchedResult[];
  };
}

interface MatchedResult {
  iid: string;
  team: string;
  score: number;
  channel: Channel;
  type: "message";
  user: UserId;
  username: string;
  ts: TimeStamp;
  // attachments: リッチな表現したければいつか
  // blocks: リッチな表現したければいつか
  text: string;
  permalink: string;
}

/**
 * 必要なものだけ
 */
interface Channel {
  id: ChannelId;
  name: string;
  is_private: boolean;
}

export class SlackClient {
  constructor(private token: string) {}

  async search(query: string): Promise<SlackResponse> {
    const url = `${BASE_URL}/search.messages?query=${query}&count=100&sort=timestamp`;
    const res = await fetch(url, {
      headers: {
        authorization: `Bearer ${this.token}`,
      },
    });
    return (await res.json()) as SlackResponse;
  }
}
