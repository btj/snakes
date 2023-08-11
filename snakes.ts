class Point {
    constructor(public readonly x: number, public readonly y: number) {}
    plus(other: Point) {
        return new Point(this.x + other.x, this.y + other.y);
    }
    scaled(factor: number) {
        return new Point(this.x * factor, this.y * factor);
    }
    minus(other: Point) {
        return this.plus(other.scaled(-1));
    }
    size() {
        return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
    }
    distanceTo(other: Point) {
        return this.minus(other).size();
    }
    angle() {
        return Math.atan2(this.y, this.x);
    }
    normalized() {
        return this.scaled(1/this.size());
    }
}

const radius = 15;
const segmentDistance = 15;
const initialNbSegments = 6;
const initialEdgeSize = 0.0001;
const speed = 50; // pixels per second
const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const ctxt = canvas.getContext('2d')!;
ctxt.fillStyle = 'blue';
const vertices = [new Point(0, canvas.height/2), new Point(canvas.width/2, canvas.height/2)];
const edgeLengths = [vertices[0].distanceTo(vertices[1])];
let nbSegments = 6;
function drawSnake() {
    // First, compute each segment's location
    let edgeIndex = edgeLengths.length - 1;
    let offset = 0;
    const segmentLocations = [vertices.at(-1)];
    while (segmentLocations.length < nbSegments) {
        offset += segmentDistance;
        while (offset > edgeLengths[edgeIndex]) {
            offset -= edgeLengths[edgeIndex];
            edgeIndex--;
        }
        const edgeFraction = offset / edgeLengths[edgeIndex];
        segmentLocations.push(vertices[edgeIndex].scaled(edgeFraction).plus(vertices[edgeIndex + 1].scaled(1 - edgeFraction)));
    }
    // Next, draw the segments
    for (let i = segmentLocations.length - 1; 0 <= i; i--) {
        const loc = segmentLocations[i];
        if (i == 0) {
            // Draw head
            const angle = vertices.at(-1).minus(vertices.at(-2)).angle();
            ctxt.beginPath();
            ctxt.ellipse(loc.x, loc.y, radius, radius, 0, angle + 2*Math.PI * 1/10, angle - 2*Math.PI * 1/10);
            ctxt.lineTo(loc.x, loc.y);
            ctxt.fill();
        } else {
            ctxt.beginPath();
            ctxt.ellipse(loc.x, loc.y, radius, radius, 0, 0, 2*Math.PI);
            ctxt.fill();
        }
    }
}
function redrawCanvas() {
    ctxt.clearRect(0, 0, canvas.width, canvas.height);
    drawSnake();
}
redrawCanvas();
const dt = 1/60;
function update() {
    const distanceMoved = dt * speed;
    const directionUnitVector = vertices.at(-1).minus(vertices.at(-2)).normalized();
    // Enlarge the final edge by the distance moved
    vertices[vertices.length - 1] = vertices.at(-1).plus(directionUnitVector.scaled(distanceMoved));
    edgeLengths[edgeLengths.length - 1] += distanceMoved;
    redrawCanvas();
}
function setDirection(direction: Point) {
    // Add a tiny edge
    vertices.push(vertices.at(-1).plus(direction.scaled(initialEdgeSize)));
    edgeLengths.push(initialEdgeSize);
    redrawCanvas();
}
setInterval(update, 1000*dt);
canvas.tabIndex = 0;
canvas.focus();
canvas.onkeydown = event => {
    switch (event.key) {
        case "ArrowDown": setDirection(new Point(0, 1)); break;
        case "ArrowUp": setDirection(new Point(0, -1)); break;
        case "ArrowLeft": setDirection(new Point(-1, 0)); break;
        case "ArrowRight": setDirection(new Point(1, 0)); break;
    }
};