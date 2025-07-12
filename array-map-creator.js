const $ = (selector) => document.querySelector(selector);
const canvas = $("canvas");
const g = canvas.getContext("2d");

const lsKey = "edscamera-arraymapcreator";
const set = (key, value) => {
  const data = JSON.parse(localStorage.getItem(lsKey) ?? "{}");
  data[key] = value;
  localStorage.setItem(lsKey, JSON.stringify(data));
};
const get = (key) => {
  const data = JSON.parse(localStorage.getItem(lsKey) ?? "{}");
  return data[key];
};

const colorMap = get("colorMap") ?? ["#ffffff", "#000000"];
let brush = 1;
let tileSize = 64;
let map = get("map") ?? null;
let grid = get("grid") ?? true;

if (grid) $("#btnGrid").classList.add("active");
else $("#btnGrid").classList.remove("active");

window.addEventListener("load", () => {
  updateCanvas();
  updatePalette();
});

const createCanvas = (width, height) => {
  map = new Array(height)
    .fill(0)
    .map((y) => new Array(width).fill(0).map((x) => null));
  updateCanvas();
  canvas.style.left = `${window.innerWidth / 2 - canvas.offsetWidth / 2}px`;
  canvas.style.top = `${window.innerHeight / 2 - canvas.offsetHeight / 2}px`;
};

// Update canvas
const updateCanvas = () => {
  canvas.style.display = map ? "block" : "none";
  if (!map) return;

  canvas.width = map[0].length * tileSize;
  canvas.height = map.length * tileSize;

  g.clearRect(0, 0, canvas.width, canvas.height);
  for (let y = 0; y < map.length; y++) {
    for (let x = 0; x < map[y].length; x++) {
      g.globalCompositeOperation = "source-over";
      if (map[y][x] !== null) {
        g.fillStyle = colorMap[map[y][x]];
        g.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
      } else {
        g.fillStyle = "#eee";
        g.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
        g.fillStyle = "#fff";
        g.fillRect(x * tileSize, y * tileSize, tileSize / 2, tileSize / 2);
        g.fillRect(
          (x + 0.5) * tileSize,
          (y + 0.5) * tileSize,
          tileSize / 2,
          tileSize / 2
        );
      }
      if (grid) {
        g.strokeStyle = "#fff";
        if (map[y][x] !== null) g.globalCompositeOperation = "difference";
        else g.strokeStyle = "#000";
        g.strokeRect(x * tileSize, y * tileSize, tileSize, tileSize);
      }
    }
  }

  set("map", map);
};
if (map) {
  updateCanvas();

  canvas.style.left = `${window.innerWidth / 2 - canvas.offsetWidth / 2}px`;
  canvas.style.top = `${window.innerHeight / 2 - canvas.offsetHeight / 2}px`;
}

// Update Palette
const updatePalette = () => {
  const palette = $("#palette");
  while (palette.children[0]) palette.children[0].remove();
  colorMap.forEach((color, i) => {
    const input = document.createElement("input");
    input.type = "radio";
    input.name = "color";
    input.id = `color_${i}`;
    if (brush === i) input.checked = true;

    const label = document.createElement("label");
    label.setAttribute("for", input.id);
    label.classList.add("btn");
    label.innerHTML = `<span>${i}</span>`;
    label.style.backgroundColor = color;
    label.addEventListener("click", () => (brush = i));

    const popup = document.createElement("div");
    popup.classList.add("popup");
    popup.innerHTML = `<i class="fa-solid fa-pen-to-square"></i>`;
    if (colorMap.length > 1)
      popup.innerHTML += `<i class="fa-solid fa-trash"></i>`;
    popup.children[0].addEventListener("click", () => editColor(i));
    if (colorMap.length > 1)
      popup.children[1].addEventListener("click", () => {
        modal("Arer you sure?", "Are you sure you want to delete this color?", {
          accept: () => {
            if (map)
              for (let y = 0; y < map.length; y++) {
                for (let x = 0; x < map[y].length; x++) {
                  if (map[y][x] === i) map[y][x] = null;
                }
              }
            colorMap.splice(i, 1);
            if (brush >= colorMap.length) brush = 0;
            updatePalette();
            updateCanvas();
          },
          autoHide: true,
        });
      });
    label.appendChild(popup);

    palette.append(input, label);
  });

  const addBtn = document.createElement("label");
  addBtn.innerHTML = `<i class="fa-solid fa-plus fa-2xl">`;
  addBtn.classList.add("btn");
  addBtn.addEventListener("click", () => {
    colorMap.push("#ffffff");
    updatePalette();
    editColor(colorMap.length - 1);
  });
  Array.from($("#palette").children)
    .filter((x) => x.tagName === "LABEL")
    [colorMap.length - 1].click();
  palette.append(addBtn);

  set("colorMap", colorMap);
};

// Get Selected Tool
const getSelectedTool = () => {
  return $("input[name=tool]:checked").id.substring(5).toUpperCase();
};

// Move canvas
window.addEventListener("mousedown", (mouseDownEvent) => {
  if ((getSelectedTool() !== "PAN" && mouseDownEvent.button !== 2) || !map)
    return;
  const mouseMove = (mouseMoveEvent) => {
    const canvasX = parseFloat(canvas.style.left);
    const canvasY = parseFloat(canvas.style.top);
    canvas.style.left = `${canvasX + mouseMoveEvent.movementX}px`;
    canvas.style.top = `${canvasY + mouseMoveEvent.movementY}px`;
  };
  window.addEventListener("mousemove", mouseMove);
  window.addEventListener(
    "mouseup",
    () => {
      window.removeEventListener("mousemove", mouseMove);
    },
    { once: true }
  );
});
window.addEventListener("contextmenu", (event) => event.preventDefault());

// Draw
canvas.addEventListener("mousedown", (mouseDownEvent) => {
  if (
    !["DRAW", "ERASE"].includes(getSelectedTool()) ||
    mouseDownEvent.button !== 0 ||
    !map
  )
    return;
  const mouseMove = (mouseMoveEvent) => {
    const X = Math.floor(mouseMoveEvent.layerX / tileSize);
    const Y = Math.floor(mouseMoveEvent.layerY / tileSize);
    map[Y][X] = getSelectedTool() === "DRAW" ? brush : null;
    updateCanvas();
  };
  mouseMove(mouseDownEvent);
  canvas.addEventListener("mousemove", mouseMove);
  window.addEventListener(
    "mouseup",
    () => {
      canvas.removeEventListener("mousemove", mouseMove);
    },
    { once: true }
  );
});

// Fill
canvas.addEventListener("mousedown", (mouseDownEvent) => {
  if (getSelectedTool() !== "FILL" || !map) return;
  const X = Math.floor(mouseDownEvent.layerX / tileSize);
  const Y = Math.floor(mouseDownEvent.layerY / tileSize);
  if (brush === map[Y][X]) return;
  const target = map[Y][X];
  const queue = [`${X},${Y}`];
  while (queue.length > 0) {
    const X = parseInt(queue[0].split(",")[0]);
    const Y = parseInt(queue[0].split(",")[1]);
    map[Y][X] = brush;
    queue.splice(0, 1);
    if (
      X + 1 < map[Y].length &&
      map[Y][X + 1] === target &&
      !queue.includes(`${X + 1},${Y}`)
    )
      queue.push(`${X + 1},${Y}`);
    if (
      X - 1 >= 0 &&
      map[Y][X - 1] === target &&
      !queue.includes(`${X - 1},${Y}`)
    )
      queue.push(`${X - 1},${Y}`);
    if (
      Y + 1 < map.length &&
      map[Y + 1][X] === target &&
      !queue.includes(`${X},${Y + 1}`)
    )
      queue.push(`${X},${Y + 1}`);
    if (
      Y - 1 >= 0 &&
      map[Y - 1][X] === target &&
      !queue.includes(`${X},${Y - 1}`)
    )
      queue.push(`${X},${Y - 1}`);
    console.log(queue.length);
  }
  updateCanvas();
});

// Edit color
const editColor = (i) => {
  modal(
    "Edit color",
    `
        <input type="color" id="modal_color_input" value="${colorMap[i]}" />
    `,
    {
      accept: () => {
        colorMap[i] = $("#modal_color_input").value;
        updatePalette();
        updateCanvas();
      },
      autoHide: true,
    }
  );
};

// New
$("#btnNew").addEventListener("click", () => {
  const doNew = () => {
    const width = Math.max(
      1,
      $("#modal_new_width").value.length === 0
        ? 1
        : parseInt($("#modal_new_width").value)
    );
    const height = Math.max(
      1,
      $("#modal_new_height").value.length === 0
        ? 1
        : parseInt($("#modal_new_height").value)
    );
    createCanvas(width, height);
    hideModal("new");
  };
  modal(
    "New",
    `
        <div class="form">
            <span>Width:</span>
            <input type="number" id="modal_new_width" placeholder="Width" min="1" />
            <span>Height:</span>
            <input type="number" id="modal_new_height" placeholder="Height" min="1" />
        </div>
    `,
    {
      accept: () => {
        if (map) {
          modal(
            "Are you sure?",
            "If you create a new canvas, it will replace the existing one.",
            {
              accept: doNew,
              autoHide: true,
            }
          );
        } else doNew();
      },
      reject: () => hideModal("new"),
      id: "new",
    }
  );
});

// Import
$("#btnImp").addEventListener("click", () => {
  const doNew = () => {
    try {
      const data = JSON.parse(
        $("#modal_imp_textarea").value.replace(/{/g, "[").replace(/}/g, "]")
      );
      const width = data[0].length;
      const height = data.length;
      createCanvas(width, height);
      map = data;

      let max = 0;
      for (let y = 0; y < map.length; y++) {
        for (let x = 0; x < map[y].length; x++) {
          if (max < map[y][x]) max = map[y][x];
        }
      }

      for (let i = colorMap.length; i <= max; i++) {
        colorMap.push(`hsl(${(360 / max) * i}, 100%, 50%)`);
      }

      updateCanvas();
      updatePalette();

      hideModal("new");
    } catch (e) {
      console.error(e);
    }
  };
  modal(
    "Import",
    `
        <textarea id="modal_imp_textarea"></textarea>
    `,
    {
      accept: () => {
        if ($("#modal_imp_textarea").style.backgroundColor.length > 0) return;
        if (map) {
          modal(
            "Are you sure?",
            "If you import a new canvas, it will replace the existing one.",
            {
              accept: doNew,
              autoHide: true,
            }
          );
        } else doNew();
      },
      reject: () => hideModal("new"),
      id: "new",
    }
  );

  $("#modal_imp_textarea").addEventListener("input", () => {
    try {
      const data = JSON.parse(
        $("#modal_imp_textarea").value.replace(/{/g, "[").replace(/}/g, "]")
      );
      $("#modal_imp_textarea").style.backgroundColor = "";
    } catch (e) {
      $("#modal_imp_textarea").style.backgroundColor = "#fee";
    }
  });
});

// Export
$("#btnExp").addEventListener("click", () => {
  const map2DToDict = (grid) =>
    grid.reduce((acc, row, y) => {
      row.map((val, x) => {
        if (Number.isInteger(val)) acc[`${x},${y}`] = val;
      });
      return acc;
    }, {});
  modal(
    "Export",
    `
        <textarea readonly id="modal_exp_map"></textarea><br />
        <textarea readonly id="modal_exp_map_dict"></textarea><br />
        <textarea readonly id="modal_exp_color"></textarea>
    `,
    { autoHide: true }
  );
  $("#modal_exp_map").value = JSON.stringify(map).replace(/],/g, "],\n");
  $("#modal_exp_map_dict").value = JSON.stringify(map2DToDict(map), null, 1);
  $("#modal_exp_color").value = JSON.stringify(colorMap, null, 1);
});

// Modal
const modal = (title, bodyHTML, options) => {
  const div = document.createElement("div");
  const id = options.id ?? Math.floor(Math.random() * 10 ** 6);
  div.classList.add("modal");
  div.id = `modal_${id}`;
  div.innerHTML = `
        <div>
            <h1>${title}</h1>
            <div class="modal-body">
                ${bodyHTML}
            </div>
            <div class="modal-footer">
                <label class="btn" id="modal_${id}_accept"><i class="fa-solid fa-check fa-2xl"></i></label>
                <label class="btn" id="modal_${id}_reject"><i class="fa-solid fa-xmark fa-2xl"></i></label>
            </div>
        </div>
    `;

  document.body.append(div);
  $(`#modal_${id}`).style.animation = "0.25s forwards fade-in";

  $(`#modal_${id}_accept`).addEventListener("click", () => {
    if (options.accept) options.accept();
    if (options.autoHide) hideModal(id);
  });
  $(`#modal_${id}_reject`).addEventListener("click", () => {
    if (options.reject) options.reject();
    if (options.autoHide) hideModal(id);
  });
};

const hideModal = (id) => {
  $(`#modal_${id}`).style.animation = "0.25s forwards fade-out";
  $(`#modal_${id}`).addEventListener(
    "animationend",
    () => {
      $(`#modal_${id}`).remove();
    },
    { once: true }
  );
};

const zoom = (amount) => {
  canvas.style.left = `${
    parseFloat(canvas.style.left) + canvas.offsetWidth / 2
  }px`;
  canvas.style.top = `${
    parseFloat(canvas.style.top) + canvas.offsetHeight / 2
  }px`;
  tileSize += amount;
  tileSize = Math.max(4, tileSize);
  updateCanvas();
  canvas.style.left = `${
    parseFloat(canvas.style.left) - canvas.offsetWidth / 2
  }px`;
  canvas.style.top = `${
    parseFloat(canvas.style.top) - canvas.offsetHeight / 2
  }px`;
  updateCanvas();
};
window.addEventListener("wheel", (wheelEvent) => {
  zoom(-2 * Math.sign(wheelEvent.deltaY));
});

const toggleGrid = () => {
  grid = !grid;
  if (grid) $("#btnGrid").classList.add("active");
  else $("#btnGrid").classList.remove("active");
  set("grid", grid);
  updateCanvas();
};

$("#btnDow").addEventListener("click", () => {
  const img = canvas.toDataURL("image/png");
  window.open(img, "_blank");
});
