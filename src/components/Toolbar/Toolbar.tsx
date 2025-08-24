import { Button } from "primereact/button";
import "./Toolbar.css";
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
import { confirmDialog } from "primereact/confirmdialog";
import { type JSX, type RefObject, useRef, useState } from "react";
import { useTileMap } from "../../contexts/TileMapContext";
import type { TileMap, Tool } from "../../types";
import { getContrastColor } from "../../utils";
import EditColorDialog, {
	type EditColorDialogRef,
} from "./Dialogs/EditColorDialog";
import type { ExportDialogRef } from "./Dialogs/ExportDialog";
import ExportDialog from "./Dialogs/ExportDialog";
import ImportDialog, { type ImportDialogRef } from "./Dialogs/ImportDialog";

interface ToolbarProps {
	mapRef: RefObject<TileMap>;
}
function Toolbar({ mapRef }: ToolbarProps) {
	const {
		palette,
		selectedTool,
		setSelectedTool,
		selectedColor,
		setSelectedColor,
	} = useTileMap();

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
	const importDialogRef = useRef<ImportDialogRef>(null);
	const exportDialogRef = useRef<ExportDialogRef>(null);

	const newTileMap = () =>
		confirmDialog({
			message:
				"Are you sure you want to create a new map? This will overwrite the current map.",
			header: "Confirm",
			icon: "pi pi-exclamation-triangle",
			accept: () => {
				mapRef.current = {};
			},
		});

	const getPaletteIcon = (colorId: number): JSX.Element => {
		if (selectedColor === colorId)
			return hoveredColor === colorId ? <Edit /> : <Check />;
		return <span>{colorId}</span>;
	};

	return (
		<>
			<div className="Toolbar">
				<div>
					<Button icon={<FilePlus />} onClick={() => newTileMap()} />
					<Button
						icon={<Upload />}
						onClick={() => importDialogRef.current?.open()}
					/>
					<Button
						icon={<Download />}
						onClick={() => exportDialogRef.current?.open()}
					/>
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
							onClick={() => selectColor(parseInt(colorId, 10))}
							onMouseEnter={() => setHoveredColor(parseInt(colorId, 10))}
							onMouseLeave={() => setHoveredColor(null)}
							icon={getPaletteIcon(parseInt(colorId, 10))}
						/>
					))}
					<Button
						icon={<Plus />}
						onClick={() => editColorDialogRef.current?.add()}
					/>
				</div>
				<div className="author">
					<span style={{ marginRight: "auto", fontWeight: "bold" }}>
						Tile Mapster
					</span>
					<a
						href="https://edlessz.com"
						target="_blank"
						rel="noopener noreferrer"
					>
						{location.hostname.split(".")[0]}
					</a>
					•
					<a
						href="https://github.com/edlessz/tile-mapster"
						target="_blank"
						rel="noopener noreferrer"
					>
						GitHub
					</a>
				</div>
			</div>
			<EditColorDialog ref={editColorDialogRef} />
			<ImportDialog ref={importDialogRef} mapRef={mapRef} />
			<ExportDialog ref={exportDialogRef} mapRef={mapRef} />
		</>
	);
}

export default Toolbar;
