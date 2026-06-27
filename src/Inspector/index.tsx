import { useThree } from "@react-three/fiber";
import { useLayoutEffect } from "react";
import * as THREE from "three/webgpu";
import { inspector } from "./inspector";

export { useControls } from "./useControls";
export type {
  Control,
  ControlSchema,
  ControlValues,
  Folder,
  UseControlsOptions,
} from "./useControls";

export function Inspector() {
  const gl = useThree((s) => s.gl) as unknown as THREE.WebGPURenderer;
  const events = useThree((s) => s.events);
  const set = useThree((s) => s.set);
  const advance = useThree((s) => s.advance);
  const frameloop = useThree((s) => s.frameloop);

  useLayoutEffect(() => {
    set({ frameloop: "never" });

    gl.inspector = inspector;
    inspector.init();

    const prevEventTarget = events.connected;
    events.connect?.(gl.domElement);

    // Stop control events from bubbling to the canvas (R3F / OrbitControls).
    const dom = inspector.domElement as HTMLElement;
    const stop = (e: Event) => e.stopPropagation();
    const events_ = [
      "pointerdown",
      "pointermove",
      "pointerup",
      "wheel",
      "contextmenu",
      "click",
      "dblclick",
    ] as const;
    for (const name of events_) dom.addEventListener(name, stop);

    gl.setAnimationLoop((time) => advance(time));

    return () => {
      for (const name of events_) dom.removeEventListener(name, stop);
      set({ frameloop });
      gl.setAnimationLoop(null);
      events.connect?.(prevEventTarget);
    };
  }, [gl]);

  return null!;
}
