// === Tunable parameters ===
const FORCE_MAG = 0.3; // acceleration vector magnitude per gene
const MAX_SPEED = 6; // velocity clamp (pixels / frame)
const POPULATION = 250; // agents per generation
const MUTATION_RATE = 0.01; // per-gene mutation chance
const GENE_LENGTH = 400; // life-time (frames) of an agent
const NODE_RADIUS = 4; // pixel radius when rendering
const ELITE_COUNT = 4; // # of best agents copied unchanged

// === Target ===
const TARGET_X = 300; // center horizontally (600-px canvas)
const TARGET_Y = 40; // near top

// === Simulation globals ===
let canvas, ctx;
let population;
let generationCount = 1;
let animationId;
let running = false;

// === Helper ===
function vec(x, y) {
  return { x, y };
}
function dist(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}
function mag(v) {
  return Math.hypot(v.x, v.y);
}
function limit(v, max) {
  const m = mag(v);
  if (m > max) {
    v.x = (v.x / m) * max;
    v.y = (v.y / m) * max;
  }
}

function randomForce() {
  const a = Math.random() * Math.PI * 2;
  return vec(Math.cos(a) * FORCE_MAG, Math.sin(a) * FORCE_MAG);
}

// === Brain ===
class Brain {
  constructor(size = GENE_LENGTH) {
    this.genes = Array.from({ length: size }, randomForce);
  }
  clone() {
    const b = new Brain(0);
    b.genes = this.genes.map((g) => vec(g.x, g.y));
    return b;
  }
  mutate() {
    this.genes = this.genes.map((g) =>
      Math.random() < MUTATION_RATE ? randomForce() : g
    );
  }
}

// === Dot ===
class Dot {
  constructor(brain = new Brain()) {
    this.start();
    this.brain = brain;
  }

  start() {
    this.pos = vec(canvas.width / 2, canvas.height - NODE_RADIUS * 2);
    this.vel = vec(0, 0);
    this.acc = vec(0, 0);
    this.step = 0;
    this.dead = false;
    this.reached = false;
    this.fitness = 0;
  }

  applyGene() {
    if (this.step < this.brain.genes.length) {
      this.acc = this.brain.genes[this.step++];
    } else {
      this.dead = true; // out of moves
    }
  }

  update() {
    if (this.dead || this.reached) return;

    this.applyGene();

    // physics
    this.vel.x += this.acc.x;
    this.vel.y += this.acc.y;
    limit(this.vel, MAX_SPEED);

    this.pos.x += this.vel.x;
    this.pos.y += this.vel.y;

    // boundaries kill
    if (
      this.pos.x < 0 ||
      this.pos.x > canvas.width ||
      this.pos.y < 0 ||
      this.pos.y > canvas.height
    )
      this.dead = true;

    // target reached?
    if (dist(this.pos, { x: TARGET_X, y: TARGET_Y }) < NODE_RADIUS * 2) {
      this.reached = true;
    }
  }

  calcFitness() {
    const d = dist(this.pos, { x: TARGET_X, y: TARGET_Y });
    // base fitness – inverse of distance (always > 0)
    this.fitness = 1 / (d + 1);
    // reward reaching & reaching faster
    if (this.reached) {
      this.fitness += 1 + (GENE_LENGTH - this.step) / GENE_LENGTH;
    }
  }

  clone() {
    return new Dot(this.brain.clone());
  }

  mutate() {
    this.brain.mutate();
  }

  draw() {
    ctx.fillStyle = this.reached ? "dodgerblue" : "seagreen";
    ctx.beginPath();
    ctx.arc(this.pos.x, this.pos.y, NODE_RADIUS, 0, Math.PI * 2);
    ctx.fill();
  }
}

// === Population ===
class Population {
  constructor(size) {
    this.generation = 1;
    this.dots = Array.from({ length: size }, () => new Dot());
  }

  update() {
    this.dots.forEach((d) => d.update());
  }
  draw() {
    this.dots.forEach((d) => d.draw());
  }

  allDone() {
    return this.dots.every((d) => d.dead || d.reached);
  }

  evaluate() {
    this.dots.forEach((d) => d.calcFitness());
  }

  naturalSelection() {
    this.evaluate();

    // sort best->worst once – helps with elitism and performance
    this.dots.sort((a, b) => b.fitness - a.fitness);

    const newDots = [];
    // — Elitism: carry top ELITE_COUNT clones unchanged
    for (let i = 0; i < ELITE_COUNT; i++) {
      newDots.push(this.dots[i].clone());
    }

    // build mating pool proportional to fitness
    const maxFit = this.dots[0].fitness;
    const pool = [];
    this.dots.forEach((d) => {
      const n = Math.floor((d.fitness / maxFit) * 100);
      for (let i = 0; i < n; i++) pool.push(d);
    });

    // fill the rest of the generation
    while (newDots.length < this.dots.length) {
      const parent = pool[Math.floor(Math.random() * pool.length)];
      const child = parent.clone();
      child.mutate();
      newDots.push(child);
    }

    this.dots = newDots;
    this.generation++;
  }
}

// === Draw helpers ===
function drawTarget() {
  ctx.fillStyle = "crimson";
  ctx.beginPath();
  ctx.arc(TARGET_X, TARGET_Y, NODE_RADIUS * 2, 0, Math.PI * 2);
  ctx.fill();
}

function drawHUD() {
  ctx.fillStyle = "#000";
  ctx.fillText(`Generation: ${population.generation}`, 10, canvas.height - 10);
}

function drawFrame() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawTarget();
  population.draw();
  drawHUD();
}

// === Animation loop ===
function animate() {
  drawFrame();
  population.update();

  if (population.allDone()) {
    population.naturalSelection();
  }

  animationId = requestAnimationFrame(animate);
}

// === UI ===
function disableButtons(dis) {
  document.getElementById("start-btn").disabled = dis;
  document.getElementById("reset-btn").disabled = dis;
}

function startEvolution() {
  if (running) return;
  running = true;
  disableButtons(true);
  animationId && cancelAnimationFrame(animationId);
  animationId = requestAnimationFrame(animate);
}

function resetEvolution() {
  running = false;
  disableButtons(false);
  cancelAnimationFrame(animationId);
  population = new Population(POPULATION);
  drawFrame();
}

// === Bootstrap ===
function init() {
  canvas = document.getElementById("canvas");
  canvas.width = 600;
  canvas.height = 600;
  ctx = canvas.getContext("2d");
  ctx.font = "16px Arial";

  population = new Population(POPULATION);
  drawFrame();

  document
    .getElementById("start-btn")
    .addEventListener("click", startEvolution);
  document
    .getElementById("reset-btn")
    .addEventListener("click", resetEvolution);
}

window.onload = init;
