import Visualizer from './Visualizer.js';
import Worker from "worker-loader!./simulatorWorker.js";
import * as dat from 'dat.gui';

const worker = new Worker();

worker.postMessage({ input: document.getElementById('puzzle-input').innerText });

worker.addEventListener("message", function (e) {
    if (e.data.working) {
        document.getElementById('working-indicator').style.display = 'block';
        visualizer.crtPass.baseNoisePower = 0.5;
        visualizer.crtPass.totalTime = 1.0;
        visualizer.crtPass.noisyTime = 1.0;
        return;
    }

    if (e.data.world) {
        visualizer.showWorld(e.data.world, currentW);
    }
    if (e.data.active) {
        document.getElementById('currently-active').innerText = e.data.active.toString().padStart(6, '.');
    }
    if (typeof e.data.cycle !== 'undefined') {
        document.getElementById('current-cycle').innerText = e.data.cycle.toString().padStart(6, '.');
    }
    if (e.data.currentMode === '3d')
        document.getElementById('w-selector-container').style.display = 'none';
    else
        document.getElementById('w-selector-container').style.display = 'unset';

    document.getElementById('working-indicator').style.display = 'none';
    visualizer.crtPass.baseNoisePower = 0.0;
    visualizer.crtPass.totalTime = 0.0;
    visualizer.crtPass.noisyTime = 0.0;
});

const visualizer = new Visualizer();
visualizer.animating = true;

visualizer.crtPass.glitch = false;

let currentW = 0;
document.getElementById('w-selector').onchange = ({ currentTarget }) => {
    try {
        currentW = parseInt(currentTarget.value);
        worker.postMessage({ world: true });
    } catch (_) { }
};

document.getElementById('puzzle-input-send').onclick = () => {
    worker.postMessage({ input: document.getElementById('puzzle-input').innerText });
}

var controls = {
    grid: true,
    bloom: true,
    crt: true,
    randomGlitches: false,
};

const gui = new dat.GUI({ closeOnTop: true, closed: true });

gui.add(controls, 'grid').onChange(value => {
    visualizer.grid.visible = value;
});

const ppFolder = gui.addFolder('Post-processing');
ppFolder.open();
ppFolder.add(controls, 'bloom').onChange(value => {
    visualizer.bloomPass.enabled = value;
});
ppFolder.add(controls, 'crt').onChange(value => {
    visualizer.crtPass.enabled = value;
});
ppFolder.add(controls, 'randomGlitches').onChange(value => {
    visualizer.crtPass.glitch = value;
});

// let currentMode = '3d';

document.getElementById('mode-fieldset').onchange = ({ target }) => {
    worker.postMessage({ mode: target.value });
};

document.getElementById('step-button').onclick = () => {
    worker.postMessage({ cycle: 1 })
};

document.getElementById('reset-button').onclick = () => {
    worker.postMessage({ input: document.getElementById('puzzle-input').innerText })
};