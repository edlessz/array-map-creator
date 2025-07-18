import { useEffect, useRef, useState } from "react";
import "./TileMap.css";

interface MapProps {
  map: (number | null)[][];
  palette: Record<number, string>;
}

function TileMap({ map, palette }: MapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ppu, setPpu] = useState(32);
  const [position, setPosition] = useState({
    x: window.innerWidth / 2 - ((map[0]?.length ?? 0) * ppu) / 2,
    y: window.innerHeight / 2 - (map.length * ppu) / 2,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = (map[0]?.length ?? 0) * ppu;
    const height = map.length * ppu;

    canvas.width = width;
    canvas.height = height;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    canvas.style.left = `${position.x}px`;
    canvas.style.top = `${position.y}px`;

    ctx.clearRect(0, 0, width, height);
    for (let y = 0; y < map.length; y++) {
      for (let x = 0; x < map[y].length; x++) {
        const tile = map[y][x];
        if (tile !== null) {
          ctx.fillStyle = palette[tile] ?? "#000";
          ctx.fillRect(x * ppu, y * ppu, ppu, ppu);
        }
      }
    }
  }, [map, palette, ppu, position]);

  useEffect(() => {
    const handleMove = (mouseDownEvent: MouseEvent) => {
      const mouseMove = (moveEvent: MouseEvent) => {
        if (mouseDownEvent.button === 2) {
          setPosition((prev) => ({
            x: prev.x + moveEvent.movementX,
            y: prev.y + moveEvent.movementY,
          }));
        }
      };
      window.addEventListener("mousemove", mouseMove);
      window.addEventListener(
        "mouseup",
        () => {
          window.removeEventListener("mousemove", mouseMove);
        },
        { once: true }
      );
    };
    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      setPosition((prev) => ({
        x: prev.x - mouseX * (zoomFactor - 1),
        y: prev.y - mouseY * (zoomFactor - 1),
      }));

      setPpu((prev) => Math.round(Math.max(1, prev * zoomFactor)));
    };
    window.addEventListener("mousedown", handleMove);
    window.addEventListener("contextmenu", handleContextMenu);
    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      window.removeEventListener("mousedown", handleMove);
      window.removeEventListener("contextmenu", handleContextMenu);
      window.removeEventListener("wheel", handleWheel);
    };
  });

  return (
    <div className="TileMap">
      <canvas ref={canvasRef} className="TileMap" />
    </div>
  );
}

export default TileMap;
