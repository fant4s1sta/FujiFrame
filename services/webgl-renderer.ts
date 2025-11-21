import { FilterPreset } from "../types";

const VS_SOURCE = `
  attribute vec2 a_position;
  attribute vec2 a_texCoord;
  varying vec2 v_texCoord;
  void main() {
    gl_Position = vec4(a_position, 0, 1);
    v_texCoord = a_texCoord;
  }
`;

const FS_SOURCE = `
  precision mediump float;
  
  varying vec2 v_texCoord;
  uniform sampler2D u_image;
  
  uniform float u_saturation;
  uniform float u_contrast;
  uniform float u_brightness;
  uniform float u_warmth;
  uniform float u_tint;
  uniform float u_vignette;
  uniform float u_grain;
  uniform float u_seed;
  uniform float u_is_grayscale;
  
  uniform mat3 u_channelMix;

  // Utility: RGB to HSL and back usually, but we'll use a simpler luminance mix here
  const vec3 W = vec3(0.2125, 0.7154, 0.0721);

  float rand(vec2 co) {
      return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
  }

  void main() {
    vec4 color = texture2D(u_image, v_texCoord);
    vec3 rgb = color.rgb;

    // 1. Channel Mixing (Film Stock Emulation base)
    rgb = u_channelMix * rgb;

    // 2. Brightness
    rgb += u_brightness;

    // 3. Contrast
    rgb = (rgb - 0.5) * u_contrast + 0.5;

    // 4. Saturation
    vec3 intensity = vec3(dot(rgb, W));
    rgb = mix(intensity, rgb, u_saturation);

    // 5. White Balance (Warmth/Tint)
    // Warmth adds orange (R+ Gish), Tint adds Magenta vs Green
    rgb.r += u_warmth * 0.1 + u_tint * 0.1;
    rgb.g += u_warmth * 0.05 - u_tint * 0.1;
    rgb.b -= u_warmth * 0.1;

    // 6. Grayscale override
    if (u_is_grayscale > 0.5) {
        float gray = dot(rgb, W);
        rgb = vec3(gray);
    }

    // 7. Vignette
    vec2 uv = v_texCoord * (1.0 - v_texCoord.yx);
    float vig = uv.x * uv.y * 15.0; // Multiply factor
    vig = pow(vig, u_vignette * 0.5); // Curve
    // Clamp vignette to be subtle
    vig = clamp(vig, 0.0, 1.0);
    // Mix: if vignette param is 0, we want result to be 1.0 (no darkening)
    // If vignette param is high, we want darkening at edges.
    // Simplified:
    float vignetteAmt = 1.0 - (distance(v_texCoord, vec2(0.5)) * u_vignette * 1.5);
    rgb *= clamp(vignetteAmt, 0.2, 1.0);

    // 8. Film Grain
    if (u_grain > 0.0) {
        float noise = rand(v_texCoord + u_seed);
        // Overlay blending for grain
        vec3 grainColor = vec3(noise);
        // Soft light blend approximation for grain
        rgb = mix(rgb, rgb + (grainColor - 0.5) * u_grain, 0.5);
    }

    gl_FragColor = vec4(rgb, color.a);
  }
`;

function createShader(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('Shader compilation error:', gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function createProgram(gl: WebGLRenderingContext, vs: string, fs: string) {
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vs);
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fs);
  if (!vertexShader || !fragmentShader) return null;

  const program = gl.createProgram();
  if (!program) return null;
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('Program link error:', gl.getProgramInfoLog(program));
    return null;
  }
  return program;
}

export class WebGLRenderer {
  private gl: WebGLRenderingContext | null = null;
  private program: WebGLProgram | null = null;
  private texture: WebGLTexture | null = null;

  // Locations
  private positionLocation: number = 0;
  private texCoordLocation: number = 0;
  
  constructor(canvas: HTMLCanvasElement) {
    this.gl = canvas.getContext('webgl', { preserveDrawingBuffer: true });
    if (!this.gl) {
      console.error("WebGL not supported");
      return;
    }
    this.init();
  }

  private init() {
    if (!this.gl) return;
    const program = createProgram(this.gl, VS_SOURCE, FS_SOURCE);
    if (!program) return;
    this.program = program;

    this.positionLocation = this.gl.getAttribLocation(program, "a_position");
    this.texCoordLocation = this.gl.getAttribLocation(program, "a_texCoord");

    // Setup buffers
    const positionBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer);
    // Two triangles covering the whole clip space
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array([
      -1, -1,
       1, -1,
      -1,  1,
      -1,  1,
       1, -1,
       1,  1,
    ]), this.gl.STATIC_DRAW);

    const texCoordBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, texCoordBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array([
      0, 1,
      1, 1,
      0, 0,
      0, 0,
      1, 1,
      1, 0,
    ]), this.gl.STATIC_DRAW);
  }

  public setImage(image: HTMLImageElement) {
    if (!this.gl) return;
    
    if (this.texture) {
      this.gl.deleteTexture(this.texture);
    }

    this.texture = this.gl.createTexture();
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
    
    // Parameters for non-power-of-2 images
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
    
    this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, image);
  }

  public render(preset: FilterPreset, intensity: number = 1.0) {
    if (!this.gl || !this.program || !this.texture) return;

    this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
    this.gl.useProgram(this.program);

    // Bind position
    const positionBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array([ -1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), this.gl.STATIC_DRAW);
    this.gl.enableVertexAttribArray(this.positionLocation);
    this.gl.vertexAttribPointer(this.positionLocation, 2, this.gl.FLOAT, false, 0, 0);

    const texCoordBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, texCoordBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array([ 0, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 0]), this.gl.STATIC_DRAW);
    this.gl.enableVertexAttribArray(this.texCoordLocation);
    this.gl.vertexAttribPointer(this.texCoordLocation, 2, this.gl.FLOAT, false, 0, 0);

    // Uniforms
    const uSat = this.gl.getUniformLocation(this.program, "u_saturation");
    const uCon = this.gl.getUniformLocation(this.program, "u_contrast");
    const uBri = this.gl.getUniformLocation(this.program, "u_brightness");
    const uWar = this.gl.getUniformLocation(this.program, "u_warmth");
    const uTin = this.gl.getUniformLocation(this.program, "u_tint");
    const uVig = this.gl.getUniformLocation(this.program, "u_vignette");
    const uGrn = this.gl.getUniformLocation(this.program, "u_grain");
    const uSeed = this.gl.getUniformLocation(this.program, "u_seed");
    const uIsGray = this.gl.getUniformLocation(this.program, "u_is_grayscale");
    const uMatrix = this.gl.getUniformLocation(this.program, "u_channelMix");

    // Interpolate values based on intensity
    const lerp = (start: number, end: number, t: number) => start * (1 - t) + end * t;

    this.gl.uniform1f(uSat, lerp(1.0, preset.saturation, intensity));
    this.gl.uniform1f(uCon, lerp(1.0, preset.contrast, intensity));
    this.gl.uniform1f(uBri, lerp(0.0, preset.brightness, intensity));
    this.gl.uniform1f(uWar, lerp(0.0, preset.warmth, intensity));
    this.gl.uniform1f(uTin, lerp(0.0, preset.tint, intensity));
    this.gl.uniform1f(uVig, lerp(0.0, preset.vignette, intensity));
    this.gl.uniform1f(uGrn, lerp(0.0, preset.grain, intensity));
    this.gl.uniform1f(uSeed, Math.random());
    this.gl.uniform1f(uIsGray, preset.grayscale && intensity > 0.5 ? 1.0 : 0.0);

    // Channel Mix Matrix
    // Note: WebGL matrices are column-major.
    // If we have Row vectors R, G, B in constants (defining Output R, Output G, Output B),
    // We must map them to columns: Col0=[r0,g0,b0], Col1=[r1,g1,b1], Col2=[r2,g2,b2].
    const flatMatrix = new Float32Array([
      preset.channelMix.r[0], preset.channelMix.g[0], preset.channelMix.b[0],
      preset.channelMix.r[1], preset.channelMix.g[1], preset.channelMix.b[1],
      preset.channelMix.r[2], preset.channelMix.g[2], preset.channelMix.b[2],
    ]);
    this.gl.uniformMatrix3fv(uMatrix, false, flatMatrix);

    // Draw
    this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
  }
}