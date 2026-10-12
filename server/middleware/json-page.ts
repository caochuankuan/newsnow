import type { NewsItem, SourceID } from "@shared/types"
import type { H3Event } from "h3"
import { send } from "h3"
import { getters } from "#/getters"
import { getCacheTable } from "#/database/cache"

function binaryText(value: string) {
  return Array.from(new TextEncoder().encode(value), byte => byte.toString(2).padStart(8, "0")).join(" ")
}

function binaryItems(items: NewsItem[]) {
  return items.map(item => ({
    ...item,
    title: binaryText(item.title),
    extra: item.extra
      ? {
          ...item.extra,
          hover: item.extra.hover ? binaryText(item.extra.hover) : undefined,
          info: typeof item.extra.info === "string" ? binaryText(item.extra.info) : item.extra.info,
        }
      : undefined,
  }))
}

export async function createPageJson(event: H3Event, binary: boolean) {
  const ids = metadata.hottest.sources
  const cacheTable = await getCacheTable()
  const now = Date.now()
  const rows = await Promise.all(ids.map(async (id: SourceID) => {
    const source = sources[id]
    const cached = await cacheTable?.get(id)
    let items = cached?.items
    let updatedTime = cached?.updated ?? 0
    let status: "success" | "cache" = "cache"
    let error: string | undefined

    if (!cached || now - cached.updated >= source.interval) {
      try {
        items = (await getters[id]()).slice(0, 30)
        updatedTime = now
        status = "success"
        if (items.length && cacheTable) {
          if (event.context.waitUntil) event.context.waitUntil(cacheTable.set(id, items))
          else await cacheTable.set(id, items)
        }
      } catch (cause) {
        error = cause instanceof Error ? cause.message : String(cause)
        if (!cached) items = []
      }
    }

    return {
      id,
      source: {
        name: binary ? binaryText(source.name) : source.name,
        title: source.title ? (binary ? binaryText(source.title) : source.title) : undefined,
        desc: source.desc ? (binary ? binaryText(source.desc) : source.desc) : undefined,
        home: source.home,
      },
      response: {
        status,
        id,
        updatedTime,
        items: binary ? binaryItems(items ?? []) : items ?? [],
      },
      ...(error ? { error } : {}),
    }
  }))

  return JSON.stringify({
    page: binary ? "binary" : "home",
    generatedAt: new Date(now).toISOString(),
    sources: rows,
  })
}

export default defineEventHandler(async (event) => {
  const url = getRequestURL(event)
  const json = url.searchParams.get("json")
  if (!["/", "/binary"].includes(url.pathname) || json === null || !["", "1", "true"].includes(json)) return
  return send(event, await createPageJson(event, url.pathname === "/binary"), "application/json; charset=utf-8")
})
