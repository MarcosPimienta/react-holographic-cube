import React, { useState, useRef, useEffect } from "react";
import "./styles.css";

const DEMO_ITEMS = [
  { content: "🔥", color: "#ff4d4d" },
  { content: "💧", color: "#4d94ff" },
  { content: "🌿", color: "#4dff88" },
  { content: "⚡", color: "#ffff4d" },
];

const InfiniteCube = (props) => {
  // --- MASTER TOGGLE: Are we in "Panel Mode"? ---
  const { enablePanel = false } = props;

  // If panel is enabled, we use INTERNAL state.
  // If panel is disabled, we use PROPS.

  // Initialize internal state with props or defaults
  const [internalConfig, setInternalConfig] = useState({
    items: props.items || DEMO_ITEMS,
    initialSpeed: props.initialSpeed || 30,
    friction: props.friction || 0.98,
    perspective: props.perspective || "1000px",
    showPillar: props.showPillar !== false, // default true
    pillarColor: props.pillarColor || "rgba(0, 247, 255, 0.1)",
    showResult: props.showResult !== false, // default true
    cubeBorderWidth: 2,
    bgImage: null,
    pillarWidth: "120px",
  });

  const [isPanelOpen, setIsPanelOpen] = useState(true);

  // Decide which source of truth to use
  const activeItems = enablePanel
    ? internalConfig.items
    : props.items || DEMO_ITEMS;
  const activeSpeed = enablePanel
    ? internalConfig.initialSpeed
    : props.initialSpeed || 30;
  const activeFriction = enablePanel
    ? internalConfig.friction
    : props.friction || 0.98;
  const activePerspective = enablePanel
    ? internalConfig.perspective
    : props.perspective || "1000px";
  const activeShowPillar = enablePanel
    ? internalConfig.showPillar
    : props.showPillar !== false;

  const activePillarColor = enablePanel
    ? internalConfig.pillarColor
    : props.pillarColor || "rgba(0, 247, 255, 0.1)";
  const activePillarWidth = enablePanel
    ? internalConfig.pillarWidth
    : props.pillarSize?.width || "120px";
  const activeShowResult = enablePanel
    ? internalConfig.showResult
    : props.showResult !== false;

  // Styles
  const activeCubeStyle = enablePanel
    ? { borderWidth: `${internalConfig.cubeBorderWidth}px` }
    : props.cubeStyle || {};

  const activeBg =
    enablePanel && internalConfig.bgImage
      ? `url(${internalConfig.bgImage})`
      : undefined;

  // --- ENGINE STATE ---
  const [status, setStatus] = useState("idle");
  const [winner, setWinner] = useState(null);
  const [driftStyle, setDriftStyle] = useState({
    transform: "translate3d(0,0,0) rotateX(0) rotateY(0) rotateZ(0)",
  });

  const cubeRef = useRef(null);
  const faceRefs = useRef([]);
  const animationRef = useRef(null);
  const rotationRef = useRef(0);
  const speedRef = useRef(0);
  const listPointerRef = useRef(0);
  const statusRef = useRef("idle");
  const MIN_CRAWL_SPEED = 0.5;

  // --- LOGIC ---
  const getItemData = (index) => {
    const rawItem = activeItems[index % activeItems.length];
    if (typeof rawItem === "string")
      return { content: rawItem, color: "#00db46" };
    return {
      content: rawItem.content,
      color: rawItem.color || "#00db46",
      image: rawItem.image,
    };
  };

  useEffect(() => {
    return () => cancelAnimationFrame(animationRef.current);
  }, []);
  useEffect(() => {
    updateFaceContent(0);
  }, [activeItems]);

  useEffect(() => {
    let timeoutId;
    const floatRandomly = () => {
      if (statusRef.current !== "idle") return;
      const rX = (Math.random() - 0.5) * 30;
      const rY = (Math.random() - 0.5) * 30;
      const rZ = (Math.random() - 0.5) * 10;
      const tY = (Math.random() - 0.5) * 30 - 5;
      setDriftStyle({
        transform: `translate3d(0px, ${tY}px, 0px) rotateX(${rX}deg) rotateY(${rY}deg) rotateZ(${rZ}deg)`,
      });
      timeoutId = setTimeout(floatRandomly, 4000 + Math.random() * 1000);
    };
    if (status === "idle") floatRandomly();
    else clearTimeout(timeoutId);
    return () => clearTimeout(timeoutId);
  }, [status]);

  const handleStart = () => {
    if (statusRef.current !== "idle") return;
    setWinner(null);
    setStatus("spinning");
    statusRef.current = "spinning";
    speedRef.current = activeSpeed;
    listPointerRef.current = 0;
    rotationRef.current = 0;
    updateFaceContent(0);
    loop();
  };

  const handleStop = () => {
    if (statusRef.current === "spinning") {
      setStatus("stopping");
      statusRef.current = "stopping";
    }
  };

  const loop = () => {
    rotationRef.current += speedRef.current;
    if (rotationRef.current >= 90) {
      rotationRef.current %= 90;
      listPointerRef.current =
        (listPointerRef.current + 1) % activeItems.length;
      updateFaceContent(listPointerRef.current);
    }
    if (cubeRef.current)
      cubeRef.current.style.transform = `rotateX(${rotationRef.current}deg)`;
    if (statusRef.current === "stopping") {
      speedRef.current *= activeFriction;
      if (speedRef.current < MIN_CRAWL_SPEED)
        speedRef.current = MIN_CRAWL_SPEED;
      if (speedRef.current <= MIN_CRAWL_SPEED && rotationRef.current < 1.0) {
        finishGame();
        return;
      }
    }
    animationRef.current = requestAnimationFrame(loop);
  };

  // Helper to convert hex to rgb string for CSS vars
  const hexToRgb = (hex) => {
    let c;
    if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
      c = hex.substring(1).split("");
      if (c.length === 3) {
        c = [c[0], c[0], c[1], c[1], c[2], c[2]];
      }
      c = "0x" + c.join("");
      return [(c >> 16) & 255, (c >> 8) & 255, c & 255].join(",");
    }
    return "0, 219, 70"; // default fallback
  };

  const updateFaceContent = (startIndex) => {
    for (let i = 0; i < 4; i++) {
      const itemIndex = (startIndex + i) % activeItems.length;
      const data = getItemData(itemIndex);
      const el = faceRefs.current[i];
      if (el) {
        if (data.image) {
          el.innerText = "";
          el.style.backgroundImage = `url(${data.image})`;
          el.style.backgroundSize = "cover";
          el.style.backgroundPosition = "center";
          el.style.textShadow = "none";
        } else {
          el.innerText = data.content;
          el.style.backgroundImage = "none";
          el.style.textShadow = `0 0 20px ${data.color}`;
        }

        // standard static styles
        el.style.borderColor = data.color;
        el.style.boxShadow = `0 0 15px ${data.color}4d, inset 0 0 30px ${data.color}1a`;

        // CSS variable for the spinning animation
        const rgb = hexToRgb(data.color);
        el.style.setProperty("--face-color-rgb", rgb);
        el.style.setProperty("--face-color", data.color);
      }
    }
  };

  const finishGame = () => {
    if (cubeRef.current) cubeRef.current.style.transform = `rotateX(0deg)`;
    const winningData = getItemData(listPointerRef.current);
    setStatus("idle");
    statusRef.current = "idle";
    setWinner(winningData.content);
    if (props.onWinner) props.onWinner(winningData.content);
  };

  // --- PANEL HANDLERS ---
  const updateConfig = (key, val) =>
    setInternalConfig((prev) => ({ ...prev, [key]: val }));

  const handleBgUpload = (e) => {
    const file = e.target.files[0];
    if (file) updateConfig("bgImage", URL.createObjectURL(file));
  };

  const handleItemEdit = (idx, field, val) => {
    const newItems = [...internalConfig.items];
    newItems[idx] = { ...newItems[idx], [field]: val };
    updateConfig("items", newItems);
  };

  const handleItemImageUpload = (idx, e) => {
    const file = e.target.files[0];
    if (file) {
      handleItemEdit(idx, "image", URL.createObjectURL(file));
    }
  };

  const addItem = () =>
    updateConfig("items", [
      ...internalConfig.items,
      { content: "?", color: "#fff" },
    ]);
  const removeItem = () => {
    if (internalConfig.items.length > 2)
      updateConfig("items", internalConfig.items.slice(0, -1));
  };

  // --- RENDER ---
  return (
    <div className="rhc-container" style={props.rootStyle}>
      {/* 1. THE STAGE (Always Visible) */}
      <div className="rhc-stage" style={{ backgroundImage: activeBg }}>
        <div className="scene" style={{ perspective: activePerspective }}>
          {activeShowPillar && (
            <div
              className="light-pillar"
              style={{
                width: activePillarWidth,
                height: props.pillarSize?.height || "2000px",
                background: `linear-gradient(to bottom, transparent 0%, ${activePillarColor} 50%, transparent 100%)`,
              }}
            ></div>
          )}

          <div
            className={`cube-wrapper ${status !== "idle" ? "locked" : ""}`}
            style={status === "idle" ? driftStyle : {}}
          >
            <div
              ref={cubeRef}
              className={`cube ${status !== "idle" ? "is-spinning" : ""}`}
              style={{ transition: "none" }}
            >
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`face ${["front", "bottom", "back", "top"][i]}`}
                  ref={(el) => (faceRefs.current[i] = el)}
                  style={activeCubeStyle}
                ></div>
              ))}
              <div className="face left" style={activeCubeStyle}></div>
              <div className="face right" style={activeCubeStyle}></div>
            </div>
          </div>
          <div className="cube-shadow"></div>
        </div>

        <div className="rhc-overlay-controls">
          {activeShowResult && (
            <div className="winner-text" style={props.resultStyle}>
              {winner ? `Result: ${winner}` : "..."}
            </div>
          )}
          <div className="rhc-btn-group">
            <button
              className="cyber-button"
              onClick={handleStart}
              disabled={status !== "idle"}
            >
              Spin
            </button>
            <button
              className="cyber-button stop-btn"
              onClick={handleStop}
              disabled={status !== "spinning"}
            >
              Stop
            </button>
          </div>
        </div>
      </div>

      {/* 2.5 TOGGLE SWITCH (Only if panel is enabled) */}
      {enablePanel && (
        <div className="rhc-toggle-wrapper">
          <span className="rhc-toggle-label">
            {isPanelOpen ? "Hide" : "Edit"}
          </span>
          <label className="rhc-switch">
            <input
              type="checkbox"
              checked={isPanelOpen}
              onChange={(e) => setIsPanelOpen(e.target.checked)}
            />
            <span className="rhc-slider"></span>
          </label>
        </div>
      )}

      {/* 2. THE SIDEBAR (Only if enabled AND open) */}
      {enablePanel && isPanelOpen && (
        <div className="rhc-sidebar">
          <section>
            <h2>Environment</h2>
            <div className="rhc-control-group">
              <label className="rhc-upload-btn">
                {internalConfig.bgImage ? "Change Image" : "Upload Background"}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleBgUpload}
                  style={{ display: "none" }}
                />
              </label>
              <div className="rhc-row">
                <label>Perspective</label>
                <input
                  type="range"
                  min="500"
                  max="2000"
                  step="50"
                  value={parseInt(internalConfig.perspective)}
                  onChange={(e) =>
                    updateConfig("perspective", `${e.target.value}px`)
                  }
                />
              </div>

              <div className="rhc-row">
                <label>Show Pillar</label>
                <input
                  type="checkbox"
                  checked={internalConfig.showPillar}
                  onChange={(e) => updateConfig("showPillar", e.target.checked)}
                />
              </div>
              <div className="rhc-row">
                <label>Pillar Width</label>
                <input
                  type="range"
                  min="10"
                  max="500"
                  step="10"
                  value={parseInt(internalConfig.pillarWidth)}
                  onChange={(e) =>
                    updateConfig("pillarWidth", `${e.target.value}px`)
                  }
                />
              </div>
              <div className="rhc-row">
                <label>Pillar Color</label>
                <input
                  type="color"
                  value={internalConfig.pillarColor}
                  onChange={(e) => updateConfig("pillarColor", e.target.value)}
                />
              </div>
            </div>
          </section>

          <section>
            <h2>Physics</h2>
            <div className="rhc-control-group">
              <div className="rhc-row">
                <label>Speed ({internalConfig.initialSpeed})</label>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={internalConfig.initialSpeed}
                  onChange={(e) =>
                    updateConfig("initialSpeed", Number(e.target.value))
                  }
                />
              </div>
              <div className="rhc-row">
                <label>Friction ({internalConfig.friction})</label>
                <input
                  type="range"
                  min="0.90"
                  max="0.999"
                  step="0.001"
                  value={internalConfig.friction}
                  onChange={(e) =>
                    updateConfig("friction", Number(e.target.value))
                  }
                />
              </div>
            </div>
          </section>

          <section>
            <h2>Styling</h2>
            <div className="rhc-control-group">
              <div className="rhc-row">
                <label>Border Width</label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={internalConfig.cubeBorderWidth}
                  onChange={(e) =>
                    updateConfig("cubeBorderWidth", e.target.value)
                  }
                />
              </div>
            </div>
          </section>

          <section>
            <h2>Items</h2>
            <div className="rhc-control-group">
              {internalConfig.items.map((item, idx) => (
                <div key={idx} className="rhc-item-row">
                  {item.image ? (
                    <div
                      className="rhc-item-preview"
                      style={{ backgroundImage: `url(${item.image})` }}
                      onClick={() =>
                        document.getElementById(`item-upload-${idx}`).click()
                      }
                      title="Click to change image"
                    ></div>
                  ) : (
                    <button
                      className="rhc-mini-btn"
                      onClick={() =>
                        document.getElementById(`item-upload-${idx}`).click()
                      }
                    >
                      IMG
                    </button>
                  )}
                  <input
                    id={`item-upload-${idx}`}
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={(e) => handleItemImageUpload(idx, e)}
                  />

                  <input
                    type="text"
                    value={item.content}
                    placeholder="Text"
                    maxLength={4}
                    onChange={(e) =>
                      handleItemEdit(idx, "content", e.target.value)
                    }
                    style={{ width: "50px", textAlign: "center" }}
                  />
                  <input
                    type="color"
                    value={item.color}
                    onChange={(e) =>
                      handleItemEdit(idx, "color", e.target.value)
                    }
                  />
                </div>
              ))}
              <div style={{ display: "flex", gap: 10 }}>
                <button className="rhc-action-btn" onClick={addItem}>
                  +
                </button>
                <button className="rhc-action-btn" onClick={removeItem}>
                  -
                </button>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

export default InfiniteCube;
