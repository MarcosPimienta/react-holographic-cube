# React Holographic Cube 🎲

A high-performance, cyberpunk-styled 3D spinning cube for React. Features physics-based friction, holographic visuals, and a floating drift animation when idle.

![Holographic Cube Preview](https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExZTVyamF6bjlsYjB5ZmdmbnlrY2RpNGtsYm9oZW0zNGN4eDZ1YmZmNiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/IWt8NLETm6OLAnHE8C/giphy.gif)

## Features

- **🕹️ Physics-Based:** Real momentum and friction (no pre-baked animations).
- **🔮 Holographic Styling:** Glassy textures, neon borders, and "light pillar" effects.
- **💨 Anti-Stutter:** Uses a "treadmill" logic to spin infinitely without visual glitches.
- **🧊 Closed Geometry:** Fully 3D closed cube (including side caps).
- **📱 Responsive:** Scales nicely within its container.

## Installation

```bash
npm create vite@latest . -- --template react
npm install react-holographic-cube
```

## Usage

⚠️ Important: You must import the CSS file for the 3D styles to work!

```javascript
import React from "react";
import InfiniteCube from "react-holographic-cube";

// 1. IMPORT THE CSS
import "react-holographic-cube/dist/index.css";

const App = () => {
  // Define the items to show on the faces
  const items = ["🔥", "💧", "🌿", "⚡", "🔮", "🌙"];

  const handleWin = (result) => {
    console.log("The cube stopped on:", result);
  };

  return (
    <div
      style={{
        background: "#050510",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
      }}
    >
      {/* 2. RENDER THE COMPONENT */}
      <InfiniteCube items={items} onWinner={handleWin} perspective="1000px" />
    </div>
  );
};

export default App;
```

## Props

| Prop          | Type            | Default       | Description                                                                   |
| ------------- | --------------- | ------------- | ----------------------------------------------------------------------------- |
| `items`       | `Array<string>` | `['1'...'6']` | An array of strings or emojis to display on the cube faces.                   |
| `onWinner`    | `Function`      | `null`        | Callback function triggered when the spin finishes. Returns the winning item. |
| `perspective` | `String`        | `"1000px"`    | CSS perspective value. Higher = flatter look, Lower = more 3D distortion.     |

## License

MIT

## Author

Marcos Pimienta
