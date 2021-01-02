import { UniformsUtils, ShaderMaterial, MathUtils, Vector2 } from "three";
import { Pass } from "three/examples/jsm/postprocessing/Pass";
import { BrownCRT } from '../shaders/BrownCRT';

/**
 * ブラウン管風シェーダー (Brown CRT Shader)
 * Author notargs
 * Ported from http://wordpress.notargs.com/blog/blog/2016/01/09/unity3dブラウン管風シェーダーを作った/
 * by Francesco Mazzella / https://mazzella.dev/
 */
class BrownCRTPass extends Pass {

    constructor () {

        super();

        if (BrownCRT === undefined) console.error('BrownCRTPass relies on BrownCRT');
        
        let shader = BrownCRT;
        this.uniforms = UniformsUtils.clone(shader.uniforms);

        this.material = new ShaderMaterial({
            uniforms: this.uniforms,
            vertexShader: shader.vertexShader,
            fragmentShader: shader.fragmentShader
        });

        this.fsQuad = new Pass.FullScreenQuad(this.material);

        this.totalTime = 1.0;
        this.time = 0.0;
        this.noisePower = 1.0;
        this.baseNoisePower = 0.0;
        this.noisyTime = 1.0;
        this.offset = new Vector2();
        this.baseOffset = new Vector2();

        this.glitch = true;
        this.glitchDelay = MathUtils.randFloat(.2, 2);
    }

    render(renderer, writeBuffer, readBuffer, deltaTime/*, maskActive*/) {

        this.uniforms.tDiffuse.value = readBuffer.texture;
        this.uniforms.time.value = this.time;

        let t = this.time / this.totalTime;
        let nt = MathUtils.clamp(t / this.noisyTime, 0, 1);
        let np = this.baseNoisePower + this.noisePower * (1 - nt);

        this.uniforms.noiseX.value = np * 0.5;
        this.uniforms.rgbNoise.value = np * 0.7;
        this.uniforms.sinNoiseScale.value = np * 0.8;
        this.uniforms.sinNoiseOffset.value += deltaTime * 2;
        const mul = (np + this.baseNoisePower/* * t * 4*/);
        this.uniforms.offset.value.x = this.baseOffset.x + this.offset.x * mul;
        this.uniforms.offset.value.y = this.baseOffset.y + this.offset.y * mul;
        this.time += deltaTime;

        if (this.glitch) {
            this.glitchDelay -= deltaTime;
            if (this.glitchDelay <= 0) {
                this.glitchDelay += MathUtils.randFloat(4, 8);

                this.totalTime = this.glitchDelay;
                this.time = 0;
                this.noisePower = MathUtils.randFloat(0.0, 1.0);
                this.baseNoisePower = MathUtils.randFloat(-0.01, 0.01);
                this.noisyTime = MathUtils.randFloat(0.1, 0.5);
                this.uniforms.sinNoiseWidth.value = MathUtils.randFloat(0.0, 30.0);
                // this.offset.x = MathUtils.randFloat(-5, 5);
                // this.offset.y = MathUtils.randFloat(-5, 5);
                this.baseOffset.x = MathUtils.randFloat(-1, 1);
                this.baseOffset.y = MathUtils.randFloat(-1, 1);
                this.baseOffset.multiplyScalar(0.05);
            }
        }
        
        if (this.renderToScreen) {
            renderer.setRenderTarget(null);
            this.fsQuad.render(renderer);
        } else {
            renderer.setRenderTarget(writeBuffer);
            if (this.clear) renderer.clear();
            this.fsQuad.render(renderer);
        }
    }

}

export { BrownCRTPass };