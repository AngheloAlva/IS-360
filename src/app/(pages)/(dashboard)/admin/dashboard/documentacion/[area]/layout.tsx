import { DocumentTree } from "@/project/document/components/data/DocumentTree"
import {
	ResizablePanel,
	ResizableHandle,
	ResizablePanelGroup,
} from "@/shared/components/ui/resizable"

type Params = Promise<{ area: string }>

export default async function DocumentacionLayout({
	children,
	params,
}: {
	children: React.ReactNode
	params: Params
}) {
	const { area } = await params

	return (
		<ResizablePanelGroup direction="horizontal" className="h-full w-full">
			<ResizablePanel defaultSize={25} className="hidden lg:flex">
				<DocumentTree area={area} />
			</ResizablePanel>

			<ResizableHandle withHandle className="hidden lg:flex" />

			<ResizablePanel minSize={70} defaultSize={75} className="flex-1 overflow-y-auto lg:pl-4">
				{children}
			</ResizablePanel>
		</ResizablePanelGroup>
	)
}
