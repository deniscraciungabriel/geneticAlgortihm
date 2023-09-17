const ACCELLERATION = 1;
const POPULATION = 1000;
const MUTATION_RATE = 0.01;
const GENERATIONS = 2;
const STEPS = 1000;
const nodeDim = 10;

const targetX = 600;
const targetY = 0;


class Node {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = "#006400";
        this.genes = [[0, 0]];
    }

    draw() {
        
    }

    update() {
        for (let i = 0; i < STEPS; i++) {
            const vector = [(Math.random() * 2 - 1) * ACCELLERATION, (Math.random() * 2 - 1) * ACCELLERATION]
            this.x = this.x + vector[0];
            this.y =  this.y + vector[1];
        
            this.genes.push(vector)
        }
        this.draw();
    }

    fitness() {
        const distance = Math.sqrt(Math.pow(this.x - targetX, 2) + Math.pow(this.y - targetY, 2));
        if (distance === 0) return 99999;
        return 1 / distance;
    }
}

const population = []

for (let i = 0; i < POPULATION; i++) {
    const node = new Node(600, 600, nodeDim, nodeDim);
    population.push(node);
    node.draw();
}

// let them go on their ways first generation
for (let node of population) {
    node.update();
}

// TODO: now add evolution + mutation
for (let i = 1; i < GENERATIONS; i++) {
    const bestNodes = population.sort((a, b) => b.fitness() - a.fitness()).slice(0, 100);
    console.log(bestNodes.map(node => node.fitness()))
    const newPopulation = [];
    for (let j = 0; j < POPULATION; j++) {
        const node = new Node(600, 600, nodeDim, nodeDim);
        // cross over technique + mutation
        node.genes = 
        newPopulation.push(node);
        node.draw();
    }
}
