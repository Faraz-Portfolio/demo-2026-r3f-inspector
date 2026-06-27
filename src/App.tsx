import { Bounds, OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { Canvas, extend } from "@react-three/fiber";
import * as THREE from "three/webgpu";
import { Demo } from "./Demo";
import { Inspector } from "./Inspector";
import "./styles.css";

extend(THREE as any);

export default function App() {
  return (
    <>
      <Canvas
        shadows
        gl={async (props) => {
          const renderer = new THREE.WebGPURenderer(props as any);
          await renderer.init();
          return renderer;
        }}
      >
        <color attach="background" args={["#252525"]} />

        <OrbitControls makeDefault target={[0, 2, 0]} />
        <PerspectiveCamera position={[0, 2, 8]} makeDefault fov={35} />

        <Bounds fit clip observe margin={0.5}>
          <Demo />
        </Bounds>
        <Inspector />
      </Canvas>
    </>
  );
}
