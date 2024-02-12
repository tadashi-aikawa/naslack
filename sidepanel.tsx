import { useMemo, useState } from "react"

import { groupBy, sorter } from "~collections"
import { SlackClient, toDisplayDateTime, type SlackResponse } from "~slack"

import "./style.css"

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
      return (
        <details>
          <summary className="text-lg font-bold">
            {channelName}: {messages.length}件
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

      {searching && <div>🌀検索中...</div>}
      <div className="p-5">{channelElms}</div>
    </div>
  )
}

export default IndexSidePanel
