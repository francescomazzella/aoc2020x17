function coordToString(x, y, z, w = 0) {
    return `${x},${y},${z},${w}`;
}
function stringToCoord(coords) {
    const { x, y, z, w } = /(?<x>-?\d+),(?<y>-?\d+),(?<z>-?\d+),?(?<w>-?\d+)?/.exec(coords).groups;
    return { x: parseInt(x), y: parseInt(y), z: parseInt(z), w: w ? parseInt(w) : 0 };
}

/**
 * 
 * @param {Map<String, String>} world 
 * @param {boolean} padded 
 */
function calculateBounds(world, padded = true) {
    const bounds = { min: { x: 0, y: 0, z: 0, w: 0 }, max: { x: 0, y: 0, z: 0, w: 0 } };
    world.forEach((_, coords) => {
        let { x, y, z, w } = stringToCoord(coords);
        if (x < bounds.min.x) bounds.min.x = x;
        if (y < bounds.min.y) bounds.min.y = y;
        if (z < bounds.min.z) bounds.min.z = z;
        if (w < bounds.min.w) bounds.min.w = w;
        if (x > bounds.max.x) bounds.max.x = x;
        if (y > bounds.max.y) bounds.max.y = y;
        if (z > bounds.max.z) bounds.max.z = z;
        if (w > bounds.max.w) bounds.max.w = w;
    });
    if (padded) {
        bounds.min.x--;
        bounds.min.y--;
        bounds.min.z--;
        bounds.min.w--;
        bounds.max.x++;
        bounds.max.y++;
        bounds.max.z++;
        bounds.max.w++;
    }
    return bounds;
}

/**
 * 
 * @param {Map<String, String>} world 
 * @param {number} x 
 * @param {number} y 
 * @param {number} z 
 * @param {number} w 
 */
function countActiveNeighbors(world, x, y, z, w = 0) {
    let count = 0;
    for (let ww = w - 1; ww <= w + 1; ww++) {
        for (let zz = z - 1; zz <= z + 1; zz++) {
            for (let yy = y - 1; yy <= y + 1; yy++) {
                for (let xx = x - 1; xx <= x + 1; xx++) {
                    if (xx === x && yy === y && zz === z && ww === w) continue;
                    let block = world.get(coordToString(xx, yy, zz, ww));
                    if (block === '#' || block === 'N') count++;
                }
            }
        }
    }
    return count;
}

/**
 * 
 * @param {Map<String, String>} world 
 */
function countActive(world) {
    let count = 0;
    world.forEach((b, _) => { if (b === '#' || b === 'N') count++; });
    return count;
}

/**
 * 
 * @param {Map<String, String>} world 
 */
function friendlyPrint(world) {
    let bounds = calculateBounds(world, false);
    for (let w = bounds.min.w; w <= bounds.max.w; w++) {
        for (let z = bounds.min.z; z <= bounds.max.z; z++) {
            let layer = '';
            for (let y = bounds.min.y; y <= bounds.max.y; y++) {
                for (let x = bounds.min.x; x <= bounds.max.x; x++) {
                    layer += world.get(coordToString(x, y, z)) || '.';
                }
                layer += '\n';
            }
            console.log('z =', z, '| w =', w);
            console.log(layer);
        }
    }
}

function parseInput(input) {
    let world = new Map();
    input = input.trim();
    let hHeight = (((input.match(/\n/g) || []).length + 1) / 2) | 0;
    let hWidth = (input.split('\n')[0].split('').length / 2) | 0;
    input.split('\n').forEach((row, y) => {
        row.trim().split('').forEach((col, x) => {
            if (col === '.') return;
            world.set(`${x - hWidth},${y - hHeight},0,0`, col);
        });
    });
    // console.log(world);
    return world;
}

export { coordToString, stringToCoord, calculateBounds, countActiveNeighbors, countActive, friendlyPrint, parseInput }