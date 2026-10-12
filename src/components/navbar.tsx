import { fixedColumnIds, metadata } from "@shared/metadata"
import { Link, useRouterState } from "@tanstack/react-router"
import { currentColumnIDAtom } from "~/atoms"

export function NavBar() {
  const currentId = useAtomValue(currentColumnIDAtom)
  const isBinary = useRouterState({ select: state => state.location.pathname === "/binary" })
  const { toggle } = useSearchBar()
  return (
    <span className={$([
      "flex p-3 rounded-2xl bg-primary/1 text-sm",
      "shadow shadow-primary/20 hover:shadow-primary/50 transition-shadow-500",
    ])}
    >
      <button
        type="button"
        onClick={() => toggle(true)}
        className={$(
          "px-2 hover:(bg-primary/10 rounded-md) op-70 dark:op-90",
          "cursor-pointer transition-all",
        )}
      >
        {isBinary ? toBinaryText("更多") : "更多"}
      </button>
      {fixedColumnIds.map(columnId => (
        <Link
          key={columnId}
          to="/c/$column"
          params={{ column: columnId }}
          className={$(
            "px-2 hover:(bg-primary/10 rounded-md) cursor-pointer transition-all",
            currentId === columnId ? "color-primary font-bold" : "op-70 dark:op-90",
          )}
        >
          {isBinary ? toBinaryText(metadata[columnId].name) : metadata[columnId].name}
        </Link>
      ))}
      <Link
        to="/binary"
        className={$("px-2 hover:(bg-primary/10 rounded-md) cursor-pointer transition-all", isBinary ? "color-primary font-bold" : "op-70 dark:op-90")}
      >
        {isBinary ? toBinaryText("01") : "01"}
      </Link>
    </span>
  )
}
