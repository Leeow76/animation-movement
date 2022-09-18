import { OrbitControls } from "@react-three/drei";
import React from "react";
import Player from "./components/Player";

const App = () => {
  return (
    <>
      <OrbitControls />
      <Player />
    </>
  );
};

export default App;
