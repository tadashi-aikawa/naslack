import { useMemo, useState } from "react"

import { groupBy, sorter } from "~collections"
import {
  SlackClient,
  toDisplayDateTime,
  toDisplayRelativeDateTime,
  type SlackResponse
} from "~slack"

import "./style.css"

import { Badge, Button, Spinner, TextInput } from "flowbite-react"
import { DateTime } from "owlelia"
import { HiClock } from "react-icons/hi"

function IndexSidePanel() {
  const [token, setToken] = useState<string>("")
  const [query, setQuery] = useState<string>("")
  const [searching, setSearching] = useState<boolean>(false)

  const [res, setRes] = useState<SlackResponse | undefined>()

  const search = async (query: string) => {
    setSearching(true)
    setRes(await new SlackClient(token).search(query))
    setSearching(false)
  }

  const messagesByChannelName = useMemo(() => {
    const matches = res?.messages.matches
    if (!matches) {
      return {}
    }

    return groupBy(matches, (x) => x.channel.name)
  }, [res])

  const channelElms = Object.entries(messagesByChannelName)
    .toSorted(sorter(([_, messages]) => messages.length, "desc"))
    .map(([channelName, messages]) => {
      const lists = messages.map((m) => (
        <div className="relative flex flex-col rounded-lg p-4 whitespace-break-spaces bg-gray-100 w-144">
          <a href={m.permalink} className="text-gray-500 text-sm">
            <span>👤</span>
            <b>{m.username}</b>
            <span className="text-xss text-gray-500 ml-2">
              {toDisplayDateTime(m.ts)}
            </span>
          </a>
          <hr className="my-2" />
          <span className="text-gray-500 my-2">{m.text}</span>
        </div>
      ))

      const latestRelativeUpdated = toDisplayRelativeDateTime(
        messages
          .map((x) => x.ts)
          .sort()
          .at(-1)
      )
      return (
        <details>
          <summary className="text-lg font-bold">
            <div className="inline-flex items-center">
              <Badge size="xs" color="success" className="mr-2 rounded-full">
                {messages.length}
              </Badge>
              <span>{channelName}</span>
              <Badge
                size="xs"
                color="gray"
                icon={HiClock}
                className="rounded-sm ml-2 h-5 text-gray-500">
                {latestRelativeUpdated}
              </Badge>
            </div>
          </summary>
          <div className="flex flex-col gap-4 p-6">{lists}</div>
        </details>
      )
    })

  return (
    <div className="w-192 p-3 flex flex-col gap-4">
      <div>
        <TextInput
          placeholder="tokenを入力"
          type="password"
          value={token}
          className="w-96"
          onChange={(e) => setToken(e.target.value)}></TextInput>
      </div>

      <div className="flex gap-3">
        <TextInput
          placeholder="クエリを入力"
          type="text"
          value={query}
          className="w-96"
          onChange={(e) => setQuery(e.target.value)}></TextInput>
        <Button onClick={() => search(query)} disabled={searching}>
          検索
        </Button>
      </div>

      <details>
        <summary>クエリのカンペ</summary>
        <ul>
          <li>
            <code>before:2024-02-10</code>
            <span className="ml-3 text-gray-500">
              2024/02/10より前(02/10は入らない)
            </span>
          </li>
          <li>
            <code>after:2024-02-10</code>
            <span className="ml-3 text-gray-500">
              2024/02/10より後(02/10は入らない)
            </span>
          </li>
          <li>
            <code>on:2024-02-10</code>
            <span className="ml-3 text-gray-500">2024/02/10</span>
          </li>
          <li>
            <code>is:thread with:tadashi-aikawa</code>
            <span className="ml-3 text-gray-500">
              tadashi-aikawaとやりとりしたスレッド
            </span>
          </li>
          <li>
            <code>-from:me</code>
            <span className="ml-3 text-gray-500">自分の投稿を除外</span>
          </li>
        </ul>
      </details>

      {searching ? (
        <div className="flex items-center">
          <Spinner size="xl" />
          <span className="text-xl text-gray-500 pl-3">検索中です...</span>
        </div>
      ) : (
        <div className="p-5">{channelElms}</div>
      )}
    </div>
  )
}

export default IndexSidePanel
