# Video Production Asset: The "Suppose & Crash-Test" Logic Deduction Engine

> **Target Source System:** `logic-quest`  
> **Source Files:**  
> - [`logic-quest/source/src/engine/puzzles/knights.ts`](file:///Users/chiokebuckleymini/Desktop/Antigravity%20code/Apps/logic-quest/source/src/engine/puzzles/knights.ts)  
> - [`logic-quest/source/src/engine/grade.ts`](file:///Users/chiokebuckleymini/Desktop/Antigravity%20code/Apps/logic-quest/source/src/engine/grade.ts)  
> - [`logic-quest/source/src/engine/teach.ts`](file:///Users/chiokebuckleymini/Desktop/Antigravity%20code/Apps/logic-quest/source/src/engine/teach.ts)  
> **Core Functions:** `allKinds()`, `claimTrue()`, `speakerFits()`, `breakers()`, `solutions()`, `explainSolve()`, `syncWhyWrong()`

---

## 1. Technical Breakdown & Narration Script

### 1.1 Plain-English Technical Breakdown

The Knights and Knaves deduction engine in `Logic Quest` implements an automated constraint satisfaction solver and pedagogical proof generator based on Raymond Smullyan's formal logic puzzles. On the island, every inhabitant is either a **Knight** (who unconditionally tells the truth) or a **Knave** (who unconditionally lies). 

The algorithm executes in four primary phases:

1. **Combinatorial State Space Generation (`allKinds`)**:  
   Given $N$ islanders, there exist $2^N$ possible configurations of truth assignments ($\{\text{knight}, \text{knave}\}^N$). The function generates every possible universe as a dictionary mapping speaker IDs to identity types.
   
2. **Recursive Claim AST Evaluation (`claimTrue` & `speakerFits`)**:  
   Statements made by characters are structured Abstract Syntax Trees (`Claim`), supporting predicates like `is` (identity), `same` / `diff` (equivalence relations), `count` (cardinality constraints like "at least two of us are knights"), and logical operators (`not`, `and`, `or`, `if`).  
   The core consistency invariant is enforced by:
   ```typescript
   export function speakerFits(speaker: string, claim: Claim, kinds: Kinds): boolean {
     return (kinds[speaker] === 'knight') === claimTrue(claim, kinds);
   }
   ```
   If a Knight speaks, their claim MUST evaluate to `true`. If a Knave speaks, their claim MUST evaluate to `false`. Any mismatch is a logical impossibility.

3. **"Suppose and Crash-Test" Proof Synthesis (`explainSolve`)**:  
   Instead of simply finding an answer via brute-force filtering, `explainSolve()` synthesizes a human-readable proof following the formal mathematical technique of **Reductio ad Absurdum**:
   - **Direct Propagation:** The solver inspects known facts and follows direct implications.
   - **Hypothesis Injection:** When direct deduction stalls, it branches: "Suppose Ava is a Knight."
   - **Constraint Propagation:** It propagates what Ava's statement forces onto Ben and Cal.
   - **Crash-Testing (`breakers`):** If any islander's statement in that branch contradicts their assigned mask, a crash occurs. The contradiction proves the initial assumption is false, thereby permanently locking Ava as a Knave.

4. **Minimal Counterexample Generation (`syncWhyWrong`)**:  
   When a user makes a wrong guess, the engine evaluates the user's faulty hypothesis and dynamically constructs a minimal counter-world showing the exact speaker whose statement collapses under that assumption.

---

### 1.2 Full Narration Script (Voiceover & Screen Direction)

- **Total Runtime:** 90 Seconds  
- **Tone:** Cinematic, intellectually engaging, punchy, BBC Horizon / Kurzgesagt documentary style  
- **Music:** Low ambient synth pulse building into crystalline electronic arpeggios with crisp glass-shattering sub-bass impacts

```
[0:00 - 0:12] INTRO: THE PARADOX ISLAND
Voiceover (VO):
"Imagine an island where identity dictates reality. 
Every person you meet is either a Knight—bound to absolute truth—
or a Knave—cursed to speak only lies. 
When an islander says, 'At least one of us is a Knave,' 
how does a computer determine who they are without guessing?"

[Visual Cue: Shimmering floating island of geometric obsidian monoliths and glowing golden towers. Two figures stand before us.]

[0:12 - 0:28] PHASE 1: GENERATING PARALLEL UNIVERSES
Voiceover (VO):
"Inside the Logic Quest engine, the algorithm begins by splitting reality. 
With the function `allKinds()`, it spins up two to the power of N universes. 
For two speakers, Ava and Ben, four parallel timelines appear instantly: 
Knight-Knight, Knight-Knave, Knave-Knight, and Knave-Knave. 
Every possible reality exists simultaneously inside memory."

[Visual Cue: The screen fractures into four crystal chambers. Holographic tags glow above each speaker in each quadrant.]

[0:28 - 0:48] PHASE 2: THE TRUTH INVARIANT & RECURSIVE EVALUATION
Voiceover (VO):
"Next, the engine evaluates their words. 
Claims aren't raw text—they are recursive syntax trees. 
A statement like 'If I am a Knight, then Ben is a Knave' 
is parsed into conditional logic nodes. 
Then comes the iron rule: `speakerFits`. 
A Knight’s statement MUST equal True. 
A Knave’s statement MUST equal False. 
If an islander wearing a Knave mask speaks a truth, 
that entire universe is contaminated."

[Visual Cue: Luminous circuit lines pulse from Ava's mouth into a floating logic gate. Green pulses represent True, magenta pulses represent False. A Knave mask firing a green beam causes an alert beacon to flare red.]

[0:48 - 1:12] PHASE 3: THE "SUPPOSE & CRASH-TEST" SOLVER
Voiceover (VO):
"Now watch the masterstroke: `explainSolve()`. 
When direct deduction hits a wall, the engine doesn't guess. 
It performs a Crash Test. 
It enters an open timeline and injects an assumption: 
'Suppose Ava is a Knight.' 
Ava’s golden mask locks on. Her statement forces Ben to be a Knave. 
Ben’s obsidian mask snaps into place. 
Now Ben speaks: 'Ava and I are the same kind.' 
Wait. If Ben is a Knave, his statement must be a lie—
yet Ava and Ben are opposite kinds, which makes his statement... true! 
Contradiction! Reductio ad absurdum."

[Visual Cue: Camera zooms rapidly into one timeline. Red warning fissures splinter across the glass floor as Ben's logic gate sparks. An alarm sounds as the paradox reaches critical mass.]

[1:12 - 1:30] PHASE 4: COLLAPSE TO GROUND TRUTH
Voiceover (VO):
"The engine’s `breakers()` function flags the paradox. 
The entire hypothetical universe shatters into dust! 
Because Ava being a Knight broke the universe, 
Ava MUST be a Knave. 
Three timelines disintegrate. 
One single, mathematically airtight reality remains standing. 
Pure logic. Zero guessing."

[Visual Cue: Three parallel glass chambers shatter into crystalline sparks. The camera tracks smoothly into the sole surviving timeline, glowing with solid cyan light.]
```

---

## 2. Visual Analogy & Metaphor

### 2.1 The Creative Metaphor: The Multiverse Quantum Glass Chamber

- **The Islander Figures:** Stylized biomechanical humanoid statues holding ceremonial masks.
  - **Knight:** Polished radiant gold sun-mask emitting warm golden laser lines ($+1$).
  - **Knave:** Faceted obsidian shadow-mask emitting dark magenta laser lines ($0$).
- **The Statements as Fiber-Optic Waveguides:** Spoken words form translucent floating neon cables connecting speakers to a central **Universal Consistency Arbiter (The Axiom Core)**.
- **The Crash-Test as High-Voltage Paradox Overload:** When a Knave accidentally outputs a true signal, or a Knight outputs a false signal, high-voltage red feedback surges back through the fiber-optic waveguide, detonating the glass pod in which that universe is housed.

### 2.2 Component Mapping Table

| Code Construct (`knights.ts`) | Visual Metaphor | Physical Behavior |
| :--- | :--- | :--- |
| `allKinds(ids)` | Floating Glass Multiverse Pods | $2^N$ suspended translucent observation bubbles displaying every permutation. |
| `Claim` AST (`is`, `and`, `if`) | Intricate Floating Clockwork Logic Gate | Translucent crystalline geometric gears that route light based on inputs. |
| `speakerFits()` | Dual-Polarity Gate Filter | Compares mask color against light wavelength. (Gold mask requires Green beam; Obsidian requires Magenta). |
| `breakers()` | Structural Integrity Crack Detector | Scans for wavelength mismatch and triggers red fracture points across the glass pod. |
| `explainSolve()` | Quantum Divergence Drill | Injects a temporary gold mask onto a speaker, watching downstream dominoes tip. |
| `solutions()` | Surviving Quantum Reality | The solitary glass pod that remains whole, locking into solid physical reality. |

---

## 3. Frame-by-Frame AI Video Prompts (Copy & Paste Ready)

Use the following prompts directly in state-of-the-art AI video tools (e.g., Runway Gen-3, OpenAI Sora, Kling, Luma Dream Machine).

---

### Shot 01: The Multiverse Chamber Opening
- **Duration:** 6 seconds  
- **Aspect Ratio:** 16:9 (Cinematic Widescreen)  
- **Style:** Photorealistic cinematic sci-fi, Unreal Engine 5 render, volumetric mist, anamorphic lens flare.  
- **Camera:** Slow sweeping crane shot descending through an immense futuristic subterranean vault.

```text
Cinematic wide establishing shot of an enormous futuristic subterranean vault made of polished dark obsidian stone. Suspended in mid-air inside glowing holographic containment fields are four spherical glass chambers, each housing two crystalline mannequins standing on illuminated geometric pedestals. Warm golden ambient volumetric light cuts through dense blue atmospheric mist. Soft dust motes drift in foreground. 8k resolution, cinematic lighting, photorealistic, octane render, smooth slow crane-down camera motion, shallow depth of field, dramatic sci-fi atmosphere.
```

---

### Shot 02: The Binary Mask Assignment (`allKinds`)
- **Duration:** 6 seconds  
- **Aspect Ratio:** 16:9  
- **Camera:** Medium tracking shot gliding horizontally past the suspended glass spheres.

```text
Smooth tracking shot moving laterally across four transparent floating glass pods. Inside each pod, two humanoid figures stand facing each other. Floating ornate masks suddenly snap onto their faces with magnetic precision: in pod one, two radiant polished gold sun masks; in pod two, one gold sun mask and one dark faceted obsidian eclipse mask; in pod three, obsidian and gold; in pod four, two obsidian masks. Neon turquoise circuit lines light up beneath their feet across the reflective glass floors. Sleek high-tech aesthetics, volumetric god rays, hyper-detailed mechanical details, 8k.
```

---

### Shot 03: The Claim Waveguide & Logic Gate (`claimTrue`)
- **Duration:** 6 seconds  
- **Aspect Ratio:** 16:9  
- **Camera:** Macro close-up, rack focus from the golden mask to floating holographic symbols.

```text
Macro cinematic shot focusing on the golden face mask of a female crystalline figure. From the mouth slit of the mask, an intricate stream of bioluminescent golden light emerges, coalescing into a floating, spinning 3D holographic logic diagram made of delicate glowing glass prisms and interconnected glowing runes: 'IF KNIGHT THEN KNAVE'. The camera rack-focuses to the floating glowing glyphs as pulses of light travel through the branches of the crystalline logic tree. High tech sci-fi, bokeh particles, 8k resolution, hyper-detailed, ray-traced reflections.
```

---

### Shot 04: The Polarity Check (`speakerFits`)
- **Duration:** 6 seconds  
- **Aspect Ratio:** 16:9  
- **Camera:** Slow push-in towards a central floating polarity prism.

```text
Extreme close-up of a floating geometric crystal prism suspended between two figures. A beam of deep magenta laser light shoots from an obsidian-masked figure into the prism. On the prism surface, glowing cyan holographic text reads 'SPEAKER = KNAVE (LIE REQUIRED)'. Inside the prism, the light beam attempts to refract into emerald green (TRUE). A visual dissonance occurs: chaotic violet electrical arcs flare out from the prism edges as the system detects a logic violation. Sparks spray, dramatic tension, photorealistic sci-fi laboratory, 8k.
```

---

### Shot 05: The Supposition Branch (`explainSolve`)
- **Duration:** 6 seconds  
- **Aspect Ratio:** 16:9  
- **Camera:** Dynamic circular orbit around a single glass pod.

```text
Dynamic medium orbital shot rotating 360 degrees around a single suspended glass pod. A translucent holographic user-interface pointer descends from above and stamps a glowing gold emblem labeled 'SUPPOSE KNIGHT' onto the forehead of the first figure. Instantly, an intense golden surge of energy cascades down through the figure's body, shooting across the floor along a glowing fiber-optic vein directly to the second figure, forcing an obsidian knave mask to violently lock onto its face with a mechanical snap. Volumetric smoke, anamorphic lens flares, high drama, cinematic thriller pacing, 8k.
```

---

### Shot 06: The Crash Paradox & Glass Shatter (`breakers`)
- **Duration:** 6 seconds  
- **Aspect Ratio:** 16:9  
- **Camera:** Slow-motion high-speed camera (1000 fps feel), pushing rapidly into the failing pod.

```text
Dramatic slow-motion close-up of a floating glass chamber suffering catastrophic structural failure. Red warning sirens and flashing crimson laser grids illuminate the interior. An obsidian-masked statue emits contradictory bright emerald light, causing glowing red hairline stress fractures to violently spiderweb across the massive curved glass walls of the sphere. The glass explosively shatters into thousands of brilliant, crystalline refractive shards drifting through zero-gravity space. Intense sub-bass shockwave visualization, particle dispersion, hyper-realistic physics, 8k.
```

---

### Shot 07: The Singular Solution Emerges (`solutions`)
- **Duration:** 8 seconds  
- **Aspect Ratio:** 16:9  
- **Camera:** Wide hero pull-back revealing the serene surviving universe.

```text
Cinematic wide hero shot. The floating debris and dust of the shattered red pods slowly drift away into the dark chasm. In the center of the vast subterranean chamber, a single untouched glass sphere glows with an ethereal, harmonic cyan and gold luminescence. Inside, the two figures stand peacefully, their masks locked in verified equilibrium: Knight and Knave. A massive golden holographic checkmark and logical Q.E.D. sigil materialize above the sphere. Camera smoothly pulls backward into darkness, cinematic sci-fi masterpiece, clean composition, 8k.
```
