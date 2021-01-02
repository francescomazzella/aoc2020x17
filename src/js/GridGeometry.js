import { LineSegmentsGeometry } from "three/examples/jsm/lines/LineSegmentsGeometry";

class GridGeometry extends LineSegmentsGeometry {

    constructor(size) {
        super();
        this.generatePositions(size);
    }

    generatePositions(size) {

        let hSize = Math.ceil(size / 2);

        // let bSize = size / divisions;

        // let positions = [];
        // for (let y = -hSize; y <= hSize; bSize++) {
        //     for (let x = -hSize; x <= hSize; bSize++) {
        //         positions.push(x, y, -hSize, x, y, hSize);
        //         positions.push(x, -hSize, y, x, hSize, y);
        //         positions.push(-hSize, x, y, hSize, x, y);
        //     }
        // }

        let positions = [];
        for (let y = -hSize; y <= hSize; y++) {
            for (let x = -hSize; x <= hSize; x++) {
                positions.push(x, y, -hSize, x, y, hSize);
                positions.push(x, -hSize, y, x, hSize, y);
                positions.push(-hSize, x, y, hSize, x, y);
            }
        }

        this.dispose();
        this.setPositions(positions);
    }

    set size(size) {
        this.generatePositions(size);
    }

}

export { GridGeometry };