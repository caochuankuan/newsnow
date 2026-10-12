import { useRouterState } from "@tanstack/react-router"

export function Footer() {
  const isBinary = useRouterState({ select: state => state.location.pathname === "/binary" })
  return (
    <>
      <a href={`${Homepage}/blob/main/LICENSE`} target="_blank">{isBinary ? toBinaryText("MIT LICENSE") : "MIT LICENSE"}</a>
      <span>
        <span>{isBinary ? toBinaryText("NewsNow © 2024 By ") : "NewsNow © 2024 By "}</span>
        <a href={Author.url} target="_blank">
          {isBinary ? toBinaryText(Author.name) : Author.name}
        </a>
      </span>
    </>
  )
}
