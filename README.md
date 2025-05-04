# Dot‑Navigation Genetic Algorithm

A small visual demo that shows how a **genetic algorithm** can teach a swarm of dots to learn a path to a goal point.
Everything is plain HTML + JavaScript; open the page in any modern browser and watch the evolution unfold.

> _The green dots are the current population, the red circle is the goal, and the blue dots are elite (best) performers carried over intact to the next generation._

---

## ✨ Features

- **Real‑time canvas visualisation** – see every frame of every generation.
- **Elitist GA** – top performers are preserved to speed up convergence.
- **Tweak‑friendly constants** – change speed caps, mutation rate, lifetime, population size, and more from a single section in the JS file.
- **Zero dependencies** – works offline, no build step.

---

## 📂 Project structure

| File                  | Purpose                                                             |
| --------------------- | ------------------------------------------------------------------- |
| `index.html`          | Minimal UI, canvas, and control buttons. Includes the script below. |
| `geneticAlgorithm.js` | Core simulation + GA logic (fixed/tuned version).                   |
| `README.md`           | You’re reading it.                                                  |

---

## 🚀 Running locally

1. **Clone / download** the repository.
2. Open _index.html_ directly in your browser **or** serve the folder with your favourite static‑file server, e.g.:

   ```bash
   npx serve .
   ```

3. Click **Start Evolution** and enjoy. Use **Reset** to spawn a fresh first generation.

That’s it – no libraries, no bundlers, no installs.

---

## 🛠️ Tuning parameters

Open the top of `geneticAlgorithm.js`; you’ll find:

```js
const FORCE_MAG = 0.3; // acceleration per gene
const MAX_SPEED = 6; // velocity clamp (px / frame)
const POPULATION = 250; // dots per generation
const MUTATION_RATE = 0.01; // gene‑level mutation probability
const GENE_LENGTH = 400; // life‑span in frames
const ELITE_COUNT = 4; // top performers copied untouched
```

Crank them up or down and hit **Reset** to see different behaviours (faster learners, wilder paths, etc.).

---

## 🧩 How it works – one‑screen overview

1. **Genes** are tiny acceleration vectors (size =`FORCE_MAG`), one per animation frame.
2. A **Brain** stores an ordered array of genes (`GENE_LENGTH` long).
3. A **Dot** has a brain; each frame it applies the next gene → updates velocity (clamped to `MAX_SPEED`) → moves.
4. **Fitness** is the inverse of final distance to the target, with a big bonus for actually hitting the target and doing so quickly.
5. At the end of a generation the population is ranked, elites are copied, the rest are picked probabilistically and mutated to fill the next generation.
6. Rinse + repeat – dots get a little better every generation.

For a deeper walk‑through of the code check the conversation in the repo’s Issues or refer to the extensive inline comments in `geneticAlgorithm.js`.

---

## 📋 Road‑map / ideas

- Obstacles and mazes.
- Multiple targets / way‑points.
- Speed up with Web Workers.
- Export fitness over time to CSV.

PRs and issue reports welcome!
