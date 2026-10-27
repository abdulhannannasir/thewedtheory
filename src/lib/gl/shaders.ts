/**
 * The GLSL behind the venue scenes.
 *
 * SCENE PASS (one full-screen quad)
 *   Each venue is a photograph plus a depth map. The shader moves every pixel by an amount that
 *   depends on its depth, as the camera pushes forward and as the pointer moves, so near things
 *   (flowers, plates, chairs) slide across far things (the back wall). Two refinement passes look
 *   the depth up again at the shifted position, which keeps edges from tearing.
 *   Between two venues a doorway shaped like the brand's arch opens: through it the next venue
 *   approaches from further back, and outside it the current one dims and keeps moving forward.
 *
 * PARTICLE PASS (points)
 *   Real 3D: each particle has a position in depth and is projected by a perspective camera, so near
 *   ones are large, soft and fast and far ones small and slow.
 *
 * Colours are mixed in the same encoding as the photographs (no colour-space conversion), so at
 * the start of the journey the canvas is pixel-for-pixel the plain hero photograph beneath it.
 */

export const QUAD_VERTEX = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

/** `DEPTH_PASSES` is substituted when the material is built (1 or 2). */
export const QUAD_FRAGMENT = /* glsl */ `
precision highp float;

uniform sampler2D uColA;
uniform sampler2D uDepA;
uniform sampler2D uColB;
uniform sampler2D uDepB;
uniform vec4 uCoverA;   // visible width, visible height, left offset, top offset (fractions of the picture)
uniform vec4 uCoverB;
uniform vec4 uMotionA;  // zoom, focal x, focal y, push 0..1
uniform vec4 uMotionB;
uniform vec4 uTintA;    // tint rgb, exposure
uniform vec4 uTintB;
uniform vec4 uToneA;    // contrast, saturation, vignette, unused
uniform vec4 uToneB;
uniform vec3 uLiftA;
uniform vec3 uLiftB;
uniform float uArch;    // 0 doorway shut .. 1 fully open
uniform vec2 uPointer;  // -1..1
uniform vec2 uRes;      // drawing buffer size in pixels
uniform float uTime;
uniform float uGrain;
uniform float uParallax; // 1 when the picture should follow the pointer, else 0

varying vec2 vUv;

vec2 coverUV(vec2 uv, vec4 c) {
  return vec2(c.z + uv.x * c.x, 1.0 - (c.w + (1.0 - uv.y) * c.y));
}

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

vec3 venue(sampler2D col, sampler2D dep, vec4 cover, vec4 motion, vec4 tint, vec4 tone, vec3 lift, vec2 uv) {
  float push = motion.w;
  vec2 focal = motion.yz;
  vec2 p = uv;
  float d = texture2D(dep, coverUV(uv, cover)).r;
  for (int i = 0; i < DEPTH_PASSES; i++) {
    // Near things (high depth) travel further than far things as the camera pushes in.
    float zoom = 1.0 + motion.x * push * (0.30 + 0.70 * d);
    p = focal + (uv - focal) / zoom;
    // Pointer and a faint idle sway shift near and far in opposite directions around mid-depth.
    p += uPointer * 0.016 * uParallax * (d - 0.35);
    p += vec2(sin(uTime * 0.23), cos(uTime * 0.19)) * 0.0022 * (d - 0.35);
    d = texture2D(dep, coverUV(p, cover)).r;
  }

  vec3 c = texture2D(col, coverUV(p, cover)).rgb;

  c *= tint.w;
  c = (c - 0.5) * tone.x + 0.5;
  float luma = dot(c, vec3(0.299, 0.587, 0.114));
  c = mix(vec3(luma), c, tone.y);
  c *= tint.rgb;
  c += lift * (1.0 - luma);

  float corner = smoothstep(0.30, 0.95, length((uv - 0.5) * vec2(1.0, 1.15)) * 1.35);
  c *= 1.0 - tone.z * min(1.0, push * 3.0) * corner;
  return c;
}

void main() {
  vec2 uv = vUv;
  vec3 color = venue(uColA, uDepA, uCoverA, uMotionA, uTintA, uToneA, uLiftA, uv);

  if (uArch > 0.0005) {
    // The doorway: an arch (straight sides, semicircular top) that grows from a small portal
    // standing on the floor to far larger than the screen.
    float minSide = min(uRes.x * 0.62, uRes.y * 0.42);
    float w0 = minSide * 0.55;
    float w1 = 3.0 * max(uRes.x, uRes.y / 1.55);
    float width = w0 * pow(w1 / w0, uArch);
    float height = 1.55 * width;
    float baseY = mix(uRes.y * 0.28, -uRes.y, uArch * uArch);

    vec2 q = vec2(abs(gl_FragCoord.x - 0.5 * uRes.x), gl_FragCoord.y - baseY);
    float r = 0.5 * width;
    float capY = height - r;
    float dist = q.y > capY ? length(vec2(q.x, q.y - capY)) - r : q.x - r;
    dist = max(dist, -q.y);
    float inside = 1.0 - smoothstep(-1.0, 1.0, dist);

    // The next venue starts further away and approaches as the doorway opens.
    float approach = mix(0.62, 1.0, uArch);
    vec2 uvB = (uv - 0.5) / approach + 0.5;
    vec3 next = venue(uColB, uDepB, uCoverB, uMotionB, uTintB, uToneB, uLiftB, uvB);

    vec3 rim = vec3(1.0, 0.86, 0.62) * (exp(-abs(dist) / 4.0) * 0.55 + exp(-max(dist, 0.0) / 46.0) * 0.14) * (1.0 - uArch);
    color = mix(color * (1.0 - 0.38 * uArch), next, inside) + rim;
  }

  color += (hash(gl_FragCoord.xy + fract(uTime) * 91.7) - 0.5) * uGrain;
  gl_FragColor = vec4(color, 1.0);
}
`;

export const PARTICLE_VERTEX = /* glsl */ `
attribute vec4 aSeed;
uniform float uTime;
uniform float uTravel;     // how far the camera has travelled, in world units
uniform float uPixelRatio;
uniform float uViewHeight; // drawing buffer height in pixels
uniform float uAspect;
uniform float uSize;
uniform float uMaxPoint;
uniform float uTwinkle;
uniform vec2 uDrift;
uniform vec2 uCamera;      // pointer parallax, world units
varying float vAlpha;
varying float vAngle;

const float RANGE = 26.0;
const float TAN_HALF_FOV = 0.4663; // tan(25 degrees): the camera's field of view is 50 degrees

void main() {
  // Depth: particles stream toward the camera as it travels, and wrap round at the far end.
  float z = -mod(aSeed.z * RANGE - uTravel, RANGE);
  float dist = max(-z, 0.4);

  // Spread across the whole view at every depth, so the screen is evenly filled.
  vec2 u = aSeed.xy * 2.0 - 1.0;
  u = fract((u * 0.5 + 0.5) + uDrift * uTime * (0.25 + aSeed.w)) * 2.0 - 1.0;
  u.x += sin(uTime * (0.25 + aSeed.w * 0.5) + aSeed.z * 40.0) * 0.04;
  vec3 pos = vec3(u * vec2(uAspect, 1.0) * TAN_HALF_FOV * dist * 1.15, z);
  pos.xy -= uCamera;

  vec4 mv = viewMatrix * modelMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mv;

  float world = (0.035 + 0.075 * aSeed.w) * uSize;
  float px = world * uViewHeight * 0.5 / (TAN_HALF_FOV * dist);
  gl_PointSize = clamp(px, 1.5 * uPixelRatio, min(uMaxPoint, 190.0 * uPixelRatio));

  float fade = smoothstep(0.7, 3.2, dist) * (1.0 - smoothstep(17.0, 25.0, dist));
  float twinkle = mix(1.0, 0.55 + 0.45 * sin(uTime * (1.1 + aSeed.w * 2.6) + aSeed.z * 60.0), uTwinkle);
  float soft = 0.4 + 0.6 * (1.0 - smoothstep(0.0, 1.0, px / (140.0 * uPixelRatio)));
  vAlpha = fade * twinkle * soft;
  vAngle = aSeed.w * 6.2831 + uTime * (aSeed.x - 0.5) * 0.9;
}
`;

export const PARTICLE_FRAGMENT = /* glsl */ `
precision highp float;
uniform vec3 uColor;
uniform float uAlpha;
uniform float uShape; // 0 round and soft, 1 elongated like a petal
varying float vAlpha;
varying float vAngle;

void main() {
  vec2 pc = gl_PointCoord - 0.5;
  float c = cos(vAngle);
  float s = sin(vAngle);
  pc = mat2(c, -s, s, c) * pc;
  pc.y *= 1.0 + uShape * 1.7;
  float r = length(pc) * 2.0;
  float body = smoothstep(1.0, 0.5, r);
  float rim = smoothstep(1.0, 0.88, r) * smoothstep(0.55, 0.88, r) * 0.32 * (1.0 - uShape);
  float a = (body * 0.55 + rim) * vAlpha * uAlpha;
  gl_FragColor = vec4(uColor, a);
}
`;
