import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import { gaussianBlur } from "three/examples/jsm/tsl/display/GaussianBlurNode.js";
import { depth, float, texture, uniform, vec3 } from "three/tsl";
import * as THREE from "three/webgpu";

interface ContactShadowsProps {
  /** Side length of the (square) shadow plane. */
  size?: number;
  /** How far above the plane objects still cast a contact shadow. */
  height?: number;
  /** World-space Y position of the shadow plane. */
  y?: number;
  /** Gaussian blur amount. */
  blur?: number;
  /** Depth falloff strength. */
  darkness?: number;
  /** Final shadow opacity. */
  opacity?: number;
  /** Render target resolution. */
  resolution?: number;
}

/**
 * Contact shadows rendered with a TSL depth pass + Gaussian blur, ported from
 * the three.js `webgpu_shadow_contact` example to React Three Fiber / WebGPU.
 *
 * An orthographic camera looks straight down at the scene; the scene depth is
 * rendered into a render target with a custom depth material, blurred, and
 * projected back onto a ground plane.
 */
export function ContactShadows({
  size = 9,
  height = 1.5,
  y = 0.001,
  blur = 3.5,
  darkness = 1.0,
  opacity = 1.0,
  resolution = 512,
}: ContactShadowsProps) {
  const scene = useThree((s) => s.scene);
  const gl = useThree((s) => s.gl) as unknown as THREE.WebGPURenderer;

  const {
    group,
    shadowCamera,
    depthMaterial,
    renderTarget,
    uBlur,
    uDarkness,
    uShadowOpacity,
  } = useMemo(() => {
    const renderTarget = new THREE.RenderTarget(resolution, resolution, {
      depthBuffer: true,
    });
    renderTarget.texture.generateMipmaps = false;
    if (!renderTarget.texture.image) {
      renderTarget.texture.image = { width: resolution, height: resolution };
    }

    const uBlur = uniform(blur);
    const uDarkness = uniform(darkness);
    const uShadowOpacity = uniform(opacity);

    // Depth material: closer geometry -> more opaque shadow.
    const depthMaterial = new THREE.NodeMaterial();
    const alphaDepth = float(1).sub(depth).mul(uDarkness);
    depthMaterial.colorNode = vec3(0);
    depthMaterial.opacityNode = alphaDepth;
    depthMaterial.depthTest = false;
    depthMaterial.depthWrite = false;

    const planeGeometry = new THREE.PlaneGeometry(size, size).rotateX(
      Math.PI / 2,
    );

    // Shadow plane: samples the blurred depth render target.
    const shadowPlaneMaterial = new THREE.NodeMaterial();
    shadowPlaneMaterial.transparent = true;
    shadowPlaneMaterial.depthWrite = false;
    const blurredShadow = gaussianBlur(
      texture(renderTarget.texture),
      uBlur,
      4,
      {
        premultipliedAlpha: false,
      } as any,
    );
    shadowPlaneMaterial.colorNode = vec3(0);
    shadowPlaneMaterial.opacityNode = blurredShadow.a.mul(uShadowOpacity);

    const plane = new THREE.Mesh(planeGeometry, shadowPlaneMaterial);
    plane.renderOrder = 1;
    plane.scale.y = -1;
    plane.scale.z = -1;

    const group = new THREE.Group();
    group.position.y = y;
    group.add(plane);

    // Orthographic camera looking straight down over the plane.
    const shadowCamera = new THREE.OrthographicCamera(
      -size / 2,
      size / 2,
      size / 2,
      -size / 2,
      0,
      height,
    );
    shadowCamera.rotation.x = Math.PI / 2;
    group.add(shadowCamera);

    return {
      group,
      shadowCamera,
      depthMaterial,
      renderTarget,
      uBlur,
      uDarkness,
      uShadowOpacity,
    };
  }, [size, height, resolution]);

  // Keep uniforms in sync with props without rebuilding the graph.
  useEffect(() => {
    uBlur.value = blur;
    uDarkness.value = darkness;
    uShadowOpacity.value = opacity;
    group.position.y = y;
  }, [blur, darkness, opacity, y, uBlur, uDarkness, uShadowOpacity, group]);

  useEffect(() => {
    return () => {
      renderTarget.dispose();
    };
  }, [renderTarget]);

  // Render the depth pass into the render target before the main pass.
  useFrame(() => {
    const initialBackground = scene.background;
    const prevOverride = scene.overrideMaterial;
    const prevGroupVisible = group.visible;

    // Exclude the shadow plane itself from the depth capture.
    group.visible = false;
    scene.background = null;
    scene.overrideMaterial = depthMaterial;

    const initialClearAlpha = gl.getClearAlpha();
    gl.setClearAlpha(0);
    gl.setRenderTarget(renderTarget);
    gl.clear();
    gl.render(scene, shadowCamera);

    gl.setRenderTarget(null);
    gl.setClearAlpha(initialClearAlpha);
    scene.overrideMaterial = prevOverride;
    scene.background = initialBackground;
    group.visible = prevGroupVisible;
  }, -1);

  return <primitive object={group} />;
}
