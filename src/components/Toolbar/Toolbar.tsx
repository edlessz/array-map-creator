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
import NewTileMapDialog, {
	type NewTileMapDialogRef,
} from "./Dialogs/NewTileMapDialog";

interface ToolbarProps {
	mapRef: RefObject<TileMap>;
	recenterFn: () => void;
}
function Toolbar({ mapRef, recenterFn }: ToolbarProps) {
	const {
		palette,
		selectedTool,
		setSelectedTool,
		selectedColor,
		setSelectedColor,
	} = useTileMap();
	const [hasMap, setHasMap] = useState(!!mapRef.current);
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
	const newTileMapDialogRef = useRef<NewTileMapDialogRef>(null);
	const importDialogRef = useRef<ImportDialogRef>(null);
	const exportDialogRef = useRef<ExportDialogRef>(null);

	const getPaletteIcon = (colorId: number): JSX.Element => {
		if (selectedColor === colorId)
			return hoveredColor === colorId ? <Edit /> : <Check />;
		return <span>{colorId}</span>;
	};

	return (
		<>
			<div className="Toolbar">
				<div>
					<Button
						icon={<FilePlus />}
						onClick={() => newTileMapDialogRef.current?.open()}
					/>
					<Button
						icon={<Upload />}
						onClick={() => importDialogRef.current?.open()}
					/>
					<Button
						icon={<Download />}
						disabled={!hasMap}
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
							onClick={() => selectColor(parseInt(colorId))}
							onMouseEnter={() => setHoveredColor(parseInt(colorId))}
							onMouseLeave={() => setHoveredColor(null)}
							icon={getPaletteIcon(parseInt(colorId))}
						/>
					))}
					<Button
						icon={<Plus />}
						onClick={() => editColorDialogRef.current?.add()}
					/>
				</div>
				<div className="author">
					<span style={{ marginRight: "auto", fontWeight: "bold" }}>
						TileMapster
					</span>
					<a href="/" target="_blank" rel="noopener noreferrer">
						{location.hostname.split(".")[0]}
					</a>
					•
					<a
						href="https://github.com/edlessz/TileMapster"
						target="_blank"
						rel="noopener noreferrer"
					>
						GitHub
					</a>
				</div>
			</div>
			<EditColorDialog ref={editColorDialogRef} />
			<NewTileMapDialog
				ref={newTileMapDialogRef}
				mapRef={mapRef}
				onMapCreated={() => {
					setHasMap(true);
					recenterFn();
				}}
			/>
			<ImportDialog
				ref={importDialogRef}
				mapRef={mapRef}
				onImportSuccess={() => {
					setHasMap(true);
					recenterFn();
				}}
			/>
			<ExportDialog ref={exportDialogRef} mapRef={mapRef} />
		</>
	);
}

export default Toolbar;
