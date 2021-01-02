const {
    coordToString,
    stringToCoord,
    calculateBounds,
    countActiveNeighbors,
    countActive,
    friendlyPrint,
    parseInput
} = require('./simulationUtils.js');

let currentMode = '3d';
let world = new Map();
let cycle = 0;
let input = '';

const step3d = function() {
    let bounds = calculateBounds(world);
    let newWorld = new Map();
    for (let x = bounds.min.x; x <= bounds.max.x; x++) {
        for (let y = bounds.min.y; y <= bounds.max.y; y++) {
            for (let z = bounds.min.z; z <= bounds.max.z; z++) {
                let currentCoords = coordToString(x, y, z);
                let activeNeighs = countActiveNeighbors(world, x, y, z);
                let block = world.get(currentCoords);
                if (block === '#' || block === 'N') {
                    if (activeNeighs === 2 || activeNeighs === 3) {
                        newWorld.set(currentCoords, '#');
                    }
                } else {
                    if (activeNeighs === 3) {
                        newWorld.set(currentCoords, 'N');
                    }
                }
            }
        }
    }
    world = newWorld;
    cycle++;
    return { world, active: countActive(world), cycle, currentMode };
}

const step4d = function () {
    let bounds = calculateBounds(world);
    let newWorld = new Map();
    for (let w = bounds.min.w; w <= bounds.max.w; w++) {
        for (let z = bounds.min.z; z <= bounds.max.z; z++) {
            for (let y = bounds.min.y; y <= bounds.max.y; y++) {
                for (let x = bounds.min.x; x <= bounds.max.x; x++) {
                    let currentCoords = coordToString(x, y, z, w);
                    let activeNeighs = countActiveNeighbors(world, x, y, z, w);
                    let block = world.get(currentCoords);
                    if (block === '#' || block === 'N') {
                        if (activeNeighs === 2 || activeNeighs === 3) {
                            newWorld.set(currentCoords, '#');
                        }
                    } else {
                        if (activeNeighs === 3) {
                            newWorld.set(currentCoords, 'N');
                        }
                    }
                }
            }
        }
    }
    world = newWorld;
    cycle++;
    return { world, active: countActive(world), cycle, currentMode };
}

const reset = function() {
    world = parseInput(input);
    cycle = 0;
}

onmessage = function (e) {
    if (typeof e.data.cycle !== 'undefined') {
        postMessage({ working: true });
        var result;
        if (currentMode === '4d') {
            result = step4d();
        } else {
            result = step3d();
        }
        postMessage(result);
        return;
    }
    if (typeof e.data.reset !== 'undefined') {
        reset();
        postMessage({ world, active: countActive(world), cycle, currentMode })
        return;
    }
    if (typeof e.data.mode !== 'undefined') {
        currentMode = e.data.mode === '4d' ? '4d' : '3d';
        reset();
        postMessage({ world, active: countActive(world), cycle, currentMode });
        return;
    }
    if (typeof e.data.world !== 'undefined') {
        postMessage({ world, active: countActive(world), cycle, currentMode });
        return;
    }
    if (typeof e.data.input !== 'undefined') {
        input = e.data.input;
        reset();
        postMessage({ world, active: countActive(world), cycle, currentMode });
        return;
    }
}

onerror = function (e) {
    console.error(e);
}