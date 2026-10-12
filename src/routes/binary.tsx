import { createFileRoute } from "@tanstack/react-router"
import { focusSourcesAtom } from "~/atoms"
import { Column } from "~/components/column"

export const Route = createFileRoute("/binary")({
  component: BinaryComponent,
})

function BinaryComponent() {
  const focusSources = useAtomValue(focusSourcesAtom)
  const id = useMemo(() => focusSources.length ? "focus" : "hottest", [])
  return <Column id={id} binary />
}
