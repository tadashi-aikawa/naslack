import { useMemo, useState } from "react"

import { groupBy, sorter } from "~collections"
import {
  SlackClient,
  toDisplayDateTime,
  toDisplayRelativeDateTime,
  type SlackResponse
} from "~slack"

import "./style.css"

import { DateTime } from "owlelia"

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
              {DateTime.of(Number(m.ts)).rfc3339}
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
            <span className="inline-flex items-center justify-center w-5 h-5 mr-2 text-sm font-semibold text-gray bg-green-200 rounded-full">
              {messages.length}
            </span>
            <span>{channelName}</span>
            <span className="bg-gray-100 text-gray-800 text-xss font-medium h-5 inline-flex items-center px-1 mx-2 rounded dark:bg-gray-700 dark:text-gray-400 border border-gray-200 ">
              <svg
                className="w-2.5 h-2.5 me-1.5"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 20 20">
                <path d="M10 0a10 10 0 1 0 10 10A10.011 10.011 0 0 0 10 0Zm3.982 13.982a1 1 0 0 1-1.414 0l-3.274-3.274A1.012 1.012 0 0 1 9 10V6a1 1 0 0 1 2 0v3.586l2.982 2.982a1 1 0 0 1 0 1.414Z" />
              </svg>
              {latestRelativeUpdated}
            </span>
          </summary>
          <div className="flex flex-col gap-4 p-6">{lists}</div>
        </details>
      )
    })

  return (
    <div className="w-192 p-3 flex flex-col gap-4">
      <div>
        <input
          placeholder="tokenを入力"
          className="rounded-lg border p-2 w-64"
          type="password"
          value={token}
          onChange={(e) => setToken(e.target.value)}></input>
      </div>

      <div>
        <input
          placeholder="クエリを入力"
          className="rounded-lg border p-2 w-96"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}></input>
        <button
          onClick={() => search(query)}
          type="button"
          disabled={searching}
          className="inline-flex items-center px-3 py-1.5 ml-2 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
          検索
        </button>
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
        <div>🌀検索中...</div>
      ) : (
        <div className="p-5">{channelElms}</div>
      )}
    </div>
  )
}

export default IndexSidePanel
