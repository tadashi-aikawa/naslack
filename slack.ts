import { DateTime } from "owlelia"

const BASE_URL = "https://slack.com/api"

type UserId = string
type ChannelId = string
type TimeStamp = `${string}.${string}`

export interface SlackResponse {
  ok: boolean
  query: string
  messages: {
    total: number
    pagination: {
      total_count: number
      page: number
      per_page: number
      first: number
      last: number
    }
    paging: {
      count: number
      total: number
      page: number
      pages: number
    }
    matches: MatchedResult[]
  }
}

interface MatchedResult {
  iid: string
  team: string
  score: number
  channel: Channel
  type: "message"
  user: UserId
  username: string
  ts: TimeStamp
  // attachments: リッチな表現したければいつか
  // blocks: リッチな表現したければいつか
  text: string
  permalink: string
}

export function toDisplayDateTime(ts: TimeStamp): string {
  return DateTime.of(Number(ts)).displayDateTime
}

/**
 * 現在日時から1日以内の場合は相対的な時間差を日本語で返す
 * 1日以上経っている場合は通常の日時表記で返す
 */
export function toDisplayRelativeDateTime(ts: TimeStamp): string {
  const d = DateTime.of(Number(ts))
  const diffSeconds = d.diffSecondsFromNow()
  if (diffSeconds > 24 * 60 * 60) {
    return d.displayDateTime
  }

  const hour = (diffSeconds / (60 * 60)) | 0
  const min = ((diffSeconds % (60 * 60)) / 60) | 0
  const sec = diffSeconds % 60

  const relative = [
    hour && `${hour}時間`,
    min && `${min}分`,
    hour === 0 && min === 0 && `${sec}秒`
  ]
    .filter((x) => x)
    .join("")

  return `${relative}前`
}

/**
 * 必要なものだけ
 */
interface Channel {
  id: ChannelId
  name: string
  is_private: boolean
}

export class SlackClient {
  constructor(private token: string) { }

  async search(query: string): Promise<SlackResponse> {
    const url = `${BASE_URL}/search.messages?query=${query}&count=100&sort=timestamp`
    const res = await fetch(url, {
      headers: {
        authorization: `Bearer ${this.token}`
      }
    })
    return (await res.json()) as SlackResponse
  }
}
