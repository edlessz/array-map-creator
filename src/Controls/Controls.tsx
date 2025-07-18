import { Button } from "primereact/button";
import "./Controls.css";
import {
	Brush,
	Download,
	Eraser,
	FilePlus,
	Hand,
	PaintBucket,
	Upload,
} from "lucide-react";

export type Tool = "pan" | "paint" | "erase" | "fill";

interface ControlsProps {
	selectedTool?: Tool;
	setSelectedTool?: (tool: Tool) => void;
}
function Controls({ selectedTool, setSelectedTool }: ControlsProps) {
	const toolButtons: {
		icon: React.ReactNode;
		tool: Tool;
	}[] = [
		{ icon: <Hand />, tool: "pan" },
		{ icon: <Brush />, tool: "paint" },
		{ icon: <Eraser />, tool: "erase" },
		{ icon: <PaintBucket />, tool: "fill" },
	];
	return (
		<div className="Controls">
			<div>
				<Button icon={<FilePlus />}></Button>
				<Button icon={<Upload />}></Button>
				<Button icon={<Download />}></Button>
			</div>
			<div>
				{toolButtons.map(({ icon, tool }) => (
					<Button
						key={tool}
						icon={icon}
						text={selectedTool !== tool}
						onClick={() => setSelectedTool?.(tool)}
					/>
				))}
			</div>
		</div>
	);
}

export default Controls;
