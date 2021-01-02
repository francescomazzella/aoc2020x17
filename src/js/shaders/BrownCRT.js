import { Vector2 } from "three";

/**
 * ブラウン管風シェーダー (Brown CRT Shader)
 * Original author notargs
 * Ported from http://wordpress.notargs.com/blog/blog/2016/01/09/unity3dブラウン管風シェーダーを作った/
 * by Francesco Mazzella / https://mazzella.dev/
 */
var BrownCRT = {
    uniforms: {
        time: { value: 0.0 }, // Elapsed time
        tDiffuse: { value: null }, // Main texture
        noiseX: { value: 0 }, // 0,1
        offset: { value: new Vector2(0, 0) },
        rgbNoise: { value: 0 }, // 0,1
        sinNoiseWidth: { value: 1.0 }, // 0,10
        sinNoiseScale: { value: 1.0 }, // 0,1
        sinNoiseOffset: { value: 1.0 },
        scanLineTail: { value: 1.5 }, // 0,2
		scanLineSpeed: { value: 3.2 },
		bending: { value: .2 }, // 0,1
		vignetteSize: { value: .7 },
    },

    vertexShader: `
varying vec2 vUv;
void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`,

    fragmentShader: `
uniform float time;
uniform sampler2D tDiffuse;
uniform float noiseX;
uniform vec2 offset;
uniform float rgbNoise;
uniform float sinNoiseWidth;
uniform float sinNoiseScale;
uniform float sinNoiseOffset;
uniform float scanLineTail;
uniform float scanLineSpeed;
uniform float bending;
uniform float vignetteSize;

varying vec2 vUv;

float rand(vec2 co) {
    return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
}
float rand(float co) {
    return fract(sin(dot(vec2(co, 1), vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {
	vec2 uv = vUv - 0.5;
	
	// UV座標を再計算し、画面を歪ませる
	float vignet = length(uv);
	uv /= 1.0 - vignet * bending;

	vec2 texUV = uv + 0.5;
	
	// 画面外なら描画しない
	if (max(abs(uv.y) - 0.5, abs(uv.x) - 0.5) > 0.0) {
		gl_FragColor = vec4(0, 0, 0, 1);
		return;
	}

	// 色を計算
	vec3 col;
	
	// ノイズ、オフセットを適用
	texUV.x += sin(texUV.y * sinNoiseWidth + sinNoiseOffset) * sinNoiseScale;
	texUV += offset;
	texUV.x += (rand(floor(texUV.y * 500.0) + time) - 0.5) * noiseX;
	texUV = mod(texUV, vec2(1, 1));

	// 色を取得、RGBを少しずつずらす
	col.r = texture2D(tDiffuse, texUV).r;
	col.g = texture2D(tDiffuse, texUV - vec2(0.002, 0)).g;
	col.b = texture2D(tDiffuse, texUV - vec2(0.004, 0)).b;
	
	// RGBノイズ
	if (rand((rand(floor(texUV.y * 500.0) + time) - 0.5) + time) < rgbNoise)
	{
		col.r = rand(uv + vec2(123.0 + time, 0));
		col.g = rand(uv + vec2(123.0 + time, 1));
		col.b = rand(uv + vec2(123.0 + time, 2));
	}

	// ピクセルごとに描画するRGBを決める
	float floorX = fract(gl_FragCoord.x / 3.0);
	col.r *= (floorX > 0.3333) ? 1.0 : 0.0;
	col.g *= (floorX < 0.3333 || floorX > 0.6666) ? 1.0 : 0.0;
	col.b *= (floorX < 0.6666) ? 1.0 : 0.0;
	
	// スキャンラインを描画
	float scanLineColor = sin(time * 10.0 + uv.y * 500.0) / 2.0 + 0.5;
	col *= 0.5 + clamp(scanLineColor + 0.5, 0.0, 1.0) * 0.5;

	// スキャンラインの残像を描画
	float tail = clamp((fract(uv.y + time * scanLineSpeed) - 1.0 + scanLineTail) / min(scanLineTail, 1.0), 0.0, 1.0);
	col *= tail;

	// 画面端を暗くする
	col *= 1.0 - vignet * vignetteSize; // 1.3
	
    gl_FragColor = vec4 (col, 1);
}`
}

export { BrownCRT };