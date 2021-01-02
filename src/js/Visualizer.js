import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial';
import { Line2 } from 'three/examples/jsm/lines/Line2';

import { DitheredTransparency } from './shaders/TransparentNormal';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import { BrownCRTPass } from './postprocessing/BrownCRTPass';
import { GridGeometry } from './GridGeometry';

import { calculateBounds, stringToCoord } from './simulationUtils';
import { Vector2 } from 'three';

class Visualizer {

    constructor() {
        
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);

        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.minDistance = 10;
        this.controls.maxDistance = 50;

        this.camera.position.set(1, 1, 1).normalize().multiplyScalar(12);
        this.controls.autoRotate = true;
        this.controls.autoRotateSpeed = 2;

        this.clock = new THREE.Clock();

        // Post-processing
        this.effectComposer = new EffectComposer(this.renderer);
        this.renderPass = new RenderPass(this.scene, this.camera);
        this.crtPass = new BrownCRTPass();
        this.bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
        this.bloomPass.threshold = .35;
        this.bloomPass.strength = .4;
        this.bloomPass.radius = 0;

        this.effectComposer.addPass(this.renderPass);
        this.effectComposer.addPass(this.crtPass);
        this.effectComposer.addPass(this.bloomPass);

        const resolution = new Vector2();
        this.renderer.getSize(resolution);

        // Common Materials
        this.lineMaterial = new LineMaterial({

            color: 0xffffff,
            transparent: true,
            opacity: .15,
            linewidth: 1,
            vertexColors: false,
            resolution: resolution,

            defines: { USE_DASH: "" },
            dashed: true,
            dashScale: 5,
            dashSize: 1,
            gapSize: 1,
            dashOffset: .5,
        });

        this.boxGlitchMaterial = new THREE.ShaderMaterial({
            uniforms: DitheredTransparency.uniforms,
            vertexShader: DitheredTransparency.vertexShader,
            fragmentShader: DitheredTransparency.fragmentShader,
        });

        this.boxMaterial = new THREE.MeshNormalMaterial();

        // Common Geometries
        this.boxGeometry = new THREE.BoxGeometry(1);

        // Lights on!
        this.sun = new THREE.DirectionalLight(0xffffff, .5);
        this.sun.position.set(3, 5, 1).normalize();
        this.ambient = new THREE.AmbientLight(0xffffff, .7);
        
        this.scene.add(this.sun);
        this.scene.add(this.ambient);

        // Grid
        this.gridGeometry = new GridGeometry(24);

        this.grid = new Line2(this.gridGeometry, this.lineMaterial);
        this.grid.computeLineDistances();
        this.grid.scale.set(1, 1, 1);
        
        this.scene.add(this.grid);

        this.boxPool = [];
        this.boxes = new THREE.Group();
        this.boxes.position.set(.5, .5, .5);
        this.scene.add(this.boxes);

        this.animate = this.animate.bind(this);
    }

    get animating() {
        return this._animating;
    }
    set animating(animating) {
        this._animating = animating;
        animating && this.animate();
    }

    set gridSize(size) {
        this.gridGeometry.setSize(size);
    }

    animate() {
        this._animating && requestAnimationFrame(this.animate);
        let deltaTime = this.clock.getDelta();
    
    
        this.controls.update();
    
        this.camera.updateProjectionMatrix();
        this.effectComposer.render(deltaTime);
    }

    createBox(material, position) {
        let box;
        if (!this.boxPool.length) {
            box = new THREE.Mesh(this.boxGeometry, material);
        } else {
            box = this.boxPool.pop();
            box.material = material;
        }
        box.position.set(position.x, position.y, position.z);
        this.boxes.add(box);
        return box;
    }
    removeBox(...box) {
        this.boxes.remove(...box);
        this.boxPool.push(...box);
    }
    removeAllBoxes() {
        this.boxes.children.length && this.removeBox(...this.boxes.children);
    }

    /**
     * 
     * @param {Map<String, String>} world 
     * @param {number} w 
     */
    async showWorld(world, w = 0) {
        let ww = w;
        this.removeAllBoxes();
        world.forEach((block, coord) => {
            let { x, y, z, w } = stringToCoord(coord);
            if ((typeof w !== 'undefined' && w != ww) || (block !== '#' && block !== 'N')) return;
            this.createBox(block === 'N' ? this.boxGlitchMaterial : this.boxMaterial, new THREE.Vector3(x, z, y));
        });
        const bounds = calculateBounds(world);
        const size = Math.abs(Math.min(bounds.min.x, bounds.min.y, bounds.min.z)) + Math.abs(Math.max(bounds.max.x, bounds.max.y, bounds.max.z));
        this.gridGeometry.size = size;

        this.controls.maxDistance = size * 2;
    }

}

export default Visualizer;