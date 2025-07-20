import { Button } from "primereact/button";
import "./Controls.css";
import {
	Brush,
	Check,
	Download,
	Edit,
	Eraser,
	FilePlus,
	Hand,
	PaintBucket,
	Plus,
	Upload,
} from "lucide-react";
import { type Dispatch, type SetStateAction, useRef, useState } from "react";
import { getContrastColor } from "../App";
import EditColorDialog, {
	type EditColorDialogRef,
} from "./EditColorDialog/EditColorDialog";

export type Tool = "pan" | "paint" | "erase" | "fill";

interface ControlsProps {
	selectedTool: Tool;
	setSelectedTool: Dispatch<SetStateAction<Tool>>;
	palette: Record<number, string>;
	setPalette: Dispatch<SetStateAction<Record<number, string>>>;
	selectedColor: number;
	setSelectedColor: Dispatch<SetStateAction<number>>;
}
function Controls({
	selectedTool,
	setSelectedTool,
	palette,
	setPalette,
	selectedColor,
	setSelectedColor,
}: ControlsProps) {
	const toolButtons: {
		icon: React.ReactNode;
		tool: Tool;
	}[] = [
		{ icon: <Hand />, tool: "pan" },
		{ icon: <Brush />, tool: "paint" },
		{ icon: <Eraser />, tool: "erase" },
		{ icon: <PaintBucket />, tool: "fill" },
	];

	const selectColor = (colorId: number) => {
		if (selectedColor === colorId) editColorDialogRef.current?.edit(colorId);
		else setSelectedColor(colorId);
	};
	const [hoveredColor, setHoveredColor] = useState<number | null>(null);

	const editColorDialogRef = useRef<EditColorDialogRef>(null);

	return (
		<>
			<div className="Controls">
				<div>
					<Button icon={<FilePlus />} />
					<Button icon={<Upload />} />
					<Button icon={<Download />} />
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
				<div>
					{Object.entries(palette).map(([colorId, color]) => (
						<Button
							key={colorId}
							style={{ backgroundColor: color, color: getContrastColor(color) }}
							onClick={() => selectColor(parseInt(colorId))}
							onMouseEnter={() => setHoveredColor(parseInt(colorId))}
							onMouseLeave={() => setHoveredColor(null)}
							icon={
								selectedColor === parseInt(colorId) ? (
									hoveredColor === parseInt(colorId) ? (
										<Edit />
									) : (
										<Check />
									)
								) : (
									<span>{colorId}</span>
								)
							}
						/>
					))}
					<Button
						icon={<Plus />}
						onClick={() => editColorDialogRef.current?.add()}
					/>
				</div>
			</div>
			<EditColorDialog
				ref={editColorDialogRef}
				palette={palette}
				setPalette={setPalette}
				setSelectedColor={setSelectedColor}
			/>
		</>
	);
}

export default Controls;
