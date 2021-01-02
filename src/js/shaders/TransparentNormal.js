/**
 * Normal Shading w/ Dithered Transparency
 * By Francesco Mazzella / https://mazzella.dev/
 */
var DitheredTransparency = {
    uniforms: {
        normals: { value: true },
    },

    vertexShader: `
    varying vec2 vUv;
    varying vec3 relativePos;

    void main() {
        vUv = uv;
        vec4 pos = vec4(position, 1.0);
        gl_Position = projectionMatrix * modelViewMatrix * pos;
        relativePos = (modelViewMatrix * pos).xyz;
    }`,

    fragmentShader: `
    varying vec2 vUv;
    varying vec3 relativePos;

    uniform bool normals;

    void main() {
        vec2 t = gl_FragCoord.xy;
        if (mod(floor(t.x) + floor(t.y), 4.0) == 0.0 ||
            mod(floor(t.x) - floor(t.y), 4.0) == 0.0 ||
            mod(floor(t.x) + floor(t.y), 3.0) == 0.0 ||
            mod(floor(t.x) - floor(t.y), 3.0) == 0.0) {
            discard;
        }

        if (normals) {
            vec3 dFdxPos = dFdx(relativePos);
            vec3 dFdyPos = dFdy(relativePos);
            vec3 facenormal = normalize(cross(dFdxPos, dFdyPos));
            vec4 fragCol = vec4(facenormal * 0.5 + 0.5, 1.0);

            gl_FragColor = fragCol;
        } else {
            gl_FragColor = vec4(1, 1, 1, 1);
        }
    }`
}

export { DitheredTransparency };