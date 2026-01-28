# React Holographic Cube 🎲

A high-performance, cyberpunk-styled 3D spinning cube for React. Features physics-based friction, holographic visuals, and a floating drift animation when idle.

Now supports **dynamic colors per item**, custom physics, full style overrides, and configurable environments!

![Holographic Cube Preview](https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExZTVyamF6bjlsYjB5ZmdmbnlrY2RpNGtsYm9oZW0zNGN4eDZ1YmZmNiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/IWt8NLETm6OLAnHE8C/giphy.gif)

## Features

- **🎨 Dynamic Item Colors:** Assign specific neon colors to individual items (e.g., Red for Fire, Blue for Water).
- **🕹️ Physics Control:** Adjust `friction` and `initialSpeed` to control how long the spin lasts.
- **🏗️ Configurable Environment:** Toggle the light pillar, change its size/color, or remove it entirely.
- **🖼️ Transparent Background:** The component is now transparent by default, allowing you to place it over any background image.
- **💨 Anti-Stutter:** Uses a "treadmill" logic to spin infinitely without visual glitches.
- **📱 Responsive:** Scales nicely within its container.

## Installation

```bash
npm install react-holographic-cube
```

## Usage

⚠️ Important: You must import the CSS file for the 3D styles to work!

```javascript
import React from "react";
import InfiniteCube from "react-holographic-cube";

// 1. IMPORT THE CSS
import "react-holographic-cube/dist/index.css";

// 2. IMPORT YOUR BACKGROUND (Optional)
import myBg from "./assets/space-bg.jpg";

const App = () => {
  const items = [
    { content: "🔥", color: "#ff4d4d" }, // Red
    { content: "💧", color: "#4d94ff" }, // Blue
    { content: "🌿", color: "#4dff88" }, // Green
    { content: "⚡", color: "#ffff4d" }, // Yellow
  ];

  const handleWin = (result) => {
    console.log("The cube stopped on:", result);
  };

  return (
    // Parent container controls the size and background
    <div
      style={{
        width: "100vw",
        height: "100vh",
        backgroundImage: `url(${myBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        overflow: "hidden",
      }}
    >
      <InfiniteCube
        items={items}
        onWinner={handleWin}
        perspective="1000px"
        // Physics
        initialSpeed={45}
        friction={0.99}
        // Environment Controls
        showPillar={true}
        pillarColor="rgba(255, 0, 0, 0.3)" // Red beam
        pillarSize={{ width: "100px", height: "800px" }}
        // Visuals
        showResult={true}
        cubeStyle={{ borderWidth: "4px" }}
      />
    </div>
  );
};

export default App;
```

## Props

| Prop           | Type       | Default                                | Description                                                                         |
| -------------- | ---------- | -------------------------------------- | ----------------------------------------------------------------------------------- |
| `items`        | `Array`    | `Demo Array`                           | Array of strings OR objects: `{ content: string, color: string }`.                  |
| `onWinner`     | `Function` | `null`                                 | Callback function triggered when spin finishes. Returns the winning item content.   |
| `initialSpeed` | `Number`   | `30`                                   | The starting rotation speed. Higher = faster.                                       |
| `friction`     | `Number`   | `0.98`                                 | Deceleration rate (0.0 - 0.99). Higher numbers mean the cube spins longer.          |
| `perspective`  | `String`   | `"1000px"`                             | CSS perspective. Higher = flatter look, Lower = more 3D distortion.                 |
| `showPillar`   | `Boolean`  | `true`                                 | Whether to show the background light beam.                                          |
| `pillarColor`  | `String`   | `"rgba(0, 247, 255, 0.1)"`             | The color of the light beam. Supports any CSS color string.                         |
| `pillarSize`   | `Object`   | `{ width: "120px", height: "2000px" }` | Dimensions of the light beam.                                                       |
| `showResult`   | `Boolean`  | `true`                                 | Whether to show the result text below the cube.                                     |
| `resultStyle`  | `Object`   | `{}`                                   | Custom CSS styles for the result text container.                                    |
| `cubeStyle`    | `Object`   | `{}`                                   | Custom CSS styles applied directly to the cube faces (e.g., override border width). |
| `rootStyle`    | `Object`   | `{}`                                   | Custom CSS styles applied to the root wrapper of the component.                     |

## License

MIT

## Author

Marcos Pimienta
