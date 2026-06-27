import { useFrame, useThree } from "@react-three/fiber";
import { useLayoutEffect, useMemo } from "react";
import { bloom } from "three/examples/jsm/tsl/display/BloomNode.js";
import * as TSL from "three/tsl";
import * as THREE from "three/webgpu";

export function FX() {
  const scene = useThree((state) => state.scene);
  const camera = useThree((state) => state.camera);
  const gl = useThree((state) => state.gl) as any as THREE.WebGPURenderer;
  const pipeline = useMemo(
    () => new THREE.RenderPipeline(gl),
    [gl, scene, camera],
  );

  useLayoutEffect(() => {
    const scenePass = TSL.pass(scene, camera);

    scenePass.toInspector("Scene Pass");

    const bloomPass = bloom(scenePass, 0.1, 0.8, 1);
    const bloomedPass = scenePass.add(bloomPass);

    pipeline.outputNode = bloomedPass;

    const onResize = () => {
      const width = gl.domElement.clientWidth;
      const height = gl.domElement.clientHeight;
      scenePass.setSize(width, height);
    };

    onResize();
    window.addEventListener("resize", onResize);

    return () => {
      scenePass.dispose();
      pipeline.dispose();
      window.removeEventListener("resize", onResize);
    };
  }, [pipeline]);

  useFrame(() => {
    pipeline.render();
  }, 1);

  return null!;
}
