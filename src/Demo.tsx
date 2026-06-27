import { Center, Environment, Lightformer, Text3D } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three/webgpu";
import { ContactShadows } from "./Extras/ContactShadows";
import { FX } from "./Extras/FX";
import { useControls } from "./Inspector";

export function Demo() {
  const meshRef = useRef<THREE.Mesh>(null!);

  const controls = useControls(
    {
      text: { value: "Hello, world!" },
      spin: { value: true },
      speed: { value: 0.0005, min: 0, max: 0.01, step: 0.0001 },
      material: {
        label: "Material",
        schema: {
          transmission: { value: 1, min: 0, max: 1, step: 0.01 },
          roughness: { value: 0.5, min: 0, max: 1, step: 0.01 },
          thickness: { value: 0.2, min: 0, max: 2, step: 0.01 },
        },
      },
      textColor: { value: "#ff0000", color: true, label: "Text color" },
    },
    { title: "Demo" },
  );

  useFrame((_, dt) => {
    if (controls.spin) meshRef.current.rotation.z += dt * controls.speed;
  });

  return (
    <>
      <mesh ref={meshRef} position={[0, 2, 0]}>
        <torusKnotGeometry args={[1, 0.4, 512, 128]} />
        <meshPhysicalMaterial
          transmission={controls.material.transmission}
          roughness={controls.material.roughness}
          thickness={controls.material.thickness}
        />
      </mesh>

      <group position={[0, 2, -2]}>
        <Center key={controls.text}>
          <Text3D font="/Roboto Condensed_Regular.json" castShadow>
            {controls.text}
            <meshStandardMaterial
              emissive={new THREE.Color(controls.textColor).multiplyScalar(10)}
              color={controls.textColor}
            />
          </Text3D>
        </Center>
      </group>

      <ContactShadows blur={10} opacity={0.9} darkness={1} resolution={2048} />

      <Environment>
        <Lightformer
          form="rect"
          intensity={5}
          color={controls.textColor}
          scale={[10, 5]}
          target={[0, 0, 0]}
          position={[0, 5, -10]}
        />
        <Lightformer
          form="rect"
          intensity={2}
          color="white"
          scale={[10, 5]}
          target={[0, 0, 0]}
          position={[5, 0, 0]}
        />

        <Lightformer
          form="rect"
          intensity={2}
          color="white"
          scale={[10, 5]}
          target={[0, 0, 0]}
          position={[-5, 0, 0]}
        />
      </Environment>

      <FX />
    </>
  );
}
