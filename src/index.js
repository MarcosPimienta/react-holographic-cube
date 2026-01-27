import React, { useState, useRef, useEffect } from "react";
import "./styles.css";

// Default items if user provides none
const DEMO_ITEMS = ["1", "2", "3", "4", "5", "6"];

const InfiniteCube = ({
  items = DEMO_ITEMS,
  onWinner,
  perspective = "1000px",
}) => {
  const [status, setStatus] = useState("idle");
  const [winner, setWinner] = useState(null);

  // Constants
  const START_SPEED = 30;
  const FRICTION = 0.98;
  const MIN_CRAWL_SPEED = 0.5;

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

  useEffect(() => {
    return () => cancelAnimationFrame(animationRef.current);
  }, []);

  useEffect(() => {
    updateFaceContent(0);
  }, [items]); // Re-run if items change

  // --- Random Float Logic ---
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
    speedRef.current = START_SPEED;
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

    // Treadmill Logic
    if (rotationRef.current >= 90) {
      rotationRef.current %= 90;
      listPointerRef.current = (listPointerRef.current + 1) % items.length;
      updateFaceContent(listPointerRef.current);
    }

    if (cubeRef.current) {
      cubeRef.current.style.transform = `rotateX(${rotationRef.current}deg)`;
    }

    // Physics
    if (statusRef.current === "stopping") {
      speedRef.current *= FRICTION;
      if (speedRef.current < MIN_CRAWL_SPEED)
        speedRef.current = MIN_CRAWL_SPEED;

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
      const el = faceRefs.current[i];
      if (el) el.innerText = items[itemIndex];
    }
  };

  const finishGame = () => {
    if (cubeRef.current) cubeRef.current.style.transform = `rotateX(0deg)`;

    const winningItem = items[listPointerRef.current % items.length];

    setStatus("idle");
    statusRef.current = "idle";
    setWinner(winningItem);

    // Call the user's callback function
    if (onWinner) onWinner(winningItem);
  };

  return (
    <div
      style={{
        position: "relative",
        zIndex: 10,
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <div className="scene" style={{ perspective }}>
        <div className="light-pillar"></div>

        <div
          className={`cube-wrapper ${status !== "idle" ? "locked" : ""}`}
          style={status === "idle" ? driftStyle : {}}
        >
          <div
            ref={cubeRef}
            className={`cube ${status !== "idle" ? "is-spinning" : ""}`}
            style={{ transition: "none" }}
          >
            <div
              className="face front"
              ref={(el) => (faceRefs.current[0] = el)}
            ></div>
            <div
              className="face bottom"
              ref={(el) => (faceRefs.current[1] = el)}
            ></div>
            <div
              className="face back"
              ref={(el) => (faceRefs.current[2] = el)}
            ></div>
            <div
              className="face top"
              ref={(el) => (faceRefs.current[3] = el)}
            ></div>
            <div className="face left"></div>
            <div className="face right"></div>
          </div>
        </div>

        <div className="cube-shadow"></div>
        <div className="hi-tech-floor"></div>
      </div>

      {/* Exposed Controls for the parent to style as they wish */}
      <div className="controls" style={{ marginTop: 40 }}>
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
  );
};

export default InfiniteCube;
