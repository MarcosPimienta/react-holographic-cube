import React, { useState, useRef, useEffect } from "react";
import "./styles.css";

const DEMO_ITEMS = [
  { content: "1", color: "#00f7ff" },
  { content: "2", color: "#00db46" },
  { content: "3", color: "#ff00e6" },
  { content: "4", color: "#ffbd00" },
];

const InfiniteCube = ({
  items = DEMO_ITEMS,
  onWinner,
  perspective = "1000px",
  initialSpeed = 30,
  friction = 0.98,
  showResult = true,
  resultStyle = {},
  cubeStyle = {},

  // --- ENVIRONMENT PROPS ---
  showPillar = true,
  pillarColor = "rgba(0, 247, 255, 0.1)", // Default cyan tint
  pillarSize = { width: "120px", height: "2000px" }, // Default massive beam
  rootStyle = {}, // Allows user to set background image here
}) => {
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

  // --- Helper: Normalize Item Data ---
  const getItemData = (index) => {
    const rawItem = items[index % items.length];
    if (typeof rawItem === "string") {
      return { content: rawItem, color: "#00db46" };
    }
    return {
      content: rawItem.content,
      color: rawItem.color || "#00db46",
    };
  };

  useEffect(() => {
    return () => cancelAnimationFrame(animationRef.current);
  }, []);

  useEffect(() => {
    updateFaceContent(0);
  }, [items]);

  // --- Random Float Logic (Drift) ---
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

      const nextMoveTime = 4000 + Math.random() * 1000;
      timeoutId = setTimeout(floatRandomly, nextMoveTime);
    };

    if (status === "idle") {
      floatRandomly();
    } else {
      clearTimeout(timeoutId);
      setDriftStyle({
        transform: "translate3d(0,0,0) rotateX(0) rotateY(0) rotateZ(0)",
      });
    }
    return () => clearTimeout(timeoutId);
  }, [status]);

  const handleStart = () => {
    if (statusRef.current !== "idle") return;
    setWinner(null);
    setStatus("spinning");
    statusRef.current = "spinning";
    speedRef.current = initialSpeed;
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

    // Treadmill Logic: Keep rotation between 0-90 visually, but swap content
    if (rotationRef.current >= 90) {
      rotationRef.current %= 90;
      listPointerRef.current = (listPointerRef.current + 1) % items.length;
      updateFaceContent(listPointerRef.current);
    }

    if (cubeRef.current) {
      cubeRef.current.style.transform = `rotateX(${rotationRef.current}deg)`;
    }

    // Physics Engine
    if (statusRef.current === "stopping") {
      speedRef.current *= friction;
      if (speedRef.current < MIN_CRAWL_SPEED)
        speedRef.current = MIN_CRAWL_SPEED;

      // Snap to stop
      if (speedRef.current <= MIN_CRAWL_SPEED && rotationRef.current < 1.0) {
        finishGame();
        return;
      }
    }
    animationRef.current = requestAnimationFrame(loop);
  };

  const updateFaceContent = (startIndex) => {
    for (let i = 0; i < 4; i++) {
      const itemIndex = (startIndex + i) % items.length;
      const data = getItemData(itemIndex);
      const el = faceRefs.current[i];

      if (el) {
        el.innerText = data.content;
        // Apply dynamic color from the item object
        el.style.borderColor = data.color;
        el.style.boxShadow = `0 0 15px ${data.color}4d, inset 0 0 30px ${data.color}1a`;
        el.style.textShadow = `0 0 20px ${data.color}`;
      }
    }
  };

  const finishGame = () => {
    if (cubeRef.current) cubeRef.current.style.transform = `rotateX(0deg)`;
    const winningData = getItemData(listPointerRef.current);
    setStatus("idle");
    statusRef.current = "idle";
    setWinner(winningData.content);
    if (onWinner) onWinner(winningData.content);
  };

  return (
    <div
      style={{
        position: "relative",
        zIndex: 10,
        width: "100%",
        height: "100%" /* Fills the parent container */,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        ...rootStyle,
      }}
    >
      <div className="scene" style={{ perspective }}>
        {/* Configurable Light Pillar */}
        {showPillar && (
          <div
            className="light-pillar"
            style={{
              width: pillarSize.width,
              height: pillarSize.height,
              background: `linear-gradient(to bottom, transparent 0%, ${pillarColor} 50%, transparent 100%)`,
            }}
          ></div>
        )}

        {/* Floating Wrapper */}
        <div
          className={`cube-wrapper ${status !== "idle" ? "locked" : ""}`}
          style={status === "idle" ? driftStyle : {}}
        >
          {/* Spinning Cube */}
          <div
            ref={cubeRef}
            className={`cube ${status !== "idle" ? "is-spinning" : ""}`}
            style={{ transition: "none" }}
          >
            {/* The 4 active faces */}
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={`face ${["front", "bottom", "back", "top"][i]}`}
                ref={(el) => (faceRefs.current[i] = el)}
                style={cubeStyle}
              ></div>
            ))}
            {/* The side caps */}
            <div className="face left" style={cubeStyle}></div>
            <div className="face right" style={cubeStyle}></div>
          </div>
        </div>

        <div className="cube-shadow"></div>
      </div>

      {/* UI Controls (Result + Buttons) */}
      <div className="controls-container">
        {showResult && (
          <div className="winner-text" style={resultStyle}>
            {winner ? `Result: ${winner}` : "..."}
          </div>
        )}

        <div className="controls">
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
  );
};

export default InfiniteCube;
