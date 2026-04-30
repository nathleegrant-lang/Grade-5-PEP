"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import {
  Clock, ChevronLeft, ChevronRight, Flag, CheckCircle, XCircle,
  FlaskConical, RotateCcw, Home, Lock, Crown, ArrowLeft, Printer
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/auth-context"

const FREE_QUESTION_LIMIT = 5

interface Question {
  id: number
  type: "living" | "physical" | "earth" | "technology"
  skill: string
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
}

const g5ScMix1Questions: Question[] = [
  {
    id: 1,
    type: "living",
    skill: "Classification",
    question: `An organism is multicellular, obtains nutrients by absorbing dead organic matter, and has a cell wall made of chitin. Which kingdom does it belong to?`,
    options: [
      "Plantae",
      "Animalia",
      "Fungi",
      "Protista",
    ],
    correctAnswer: 2,
    explanation: `This describes a fungus: multicellular (mostly), heterotrophic absorbers, chitin cell wall. The chitin cell wall distinguishes fungi from plants (cellulose) and animals (no cell wall).`
  },
  {
    id: 2,
    type: "living",
    skill: "Photosynthesis",
    question: `A plant is placed in bright light for 6 hours. Which measurement would MOST directly show that photosynthesis is occurring?`,
    options: [
      "The plant becomes taller",
      "The temperature near the plant rises",
      "Oxygen gas is produced and CO2 is consumed — measurable with gas sensors",
      "The leaves turn yellow",
    ],
    correctAnswer: 2,
    explanation: `Photosynthesis directly consumes CO2 and produces O2. Measuring gas exchange (rising O2, falling CO2) directly confirms the process. Height increase and temperature change are indirect and caused by other factors.`
  },
  {
    id: 3,
    type: "living",
    skill: "Ecosystems",
    question: `In a mangrove ecosystem, the roots of mangrove trees provide habitat for juvenile fish. The fish grow and are eaten by larger fish, which are caught by fishermen. If mangroves are removed, which consequence is MOST direct?`,
    options: [
      "Ocean temperatures rise",
      "Larger fish immediately disappear",
      "Juvenile fish lose shelter, their populations decline, which eventually reduces larger fish populations and fishing yields",
      "Only birds are affected",
    ],
    correctAnswer: 2,
    explanation: `Mangrove roots serve as nursery habitat. Remove them and juvenile fish survival plummets — reducing the adult fish populations that fishing communities depend on. This is a direct ecosystem service link from habitat to fishery.`
  },
  {
    id: 4,
    type: "living",
    skill: "Genetics",
    question: `A plant with genotype Tt (T = tall, dominant; t = short, recessive) is self-pollinated. What proportion of offspring will be SHORT?`,
    options: [
      "0%",
      "25%",
      "50%",
      "75%",
    ],
    correctAnswer: 1,
    explanation: `Tt × Tt cross: TT (25%), Tt (50%), tt (25%). Only tt plants are short. The probability is 25% or 1 in 4 offspring.`
  },
  {
    id: 5,
    type: "living",
    skill: "Adaptations",
    question: `A bird species on an island with only small seeds has small, pointed beaks. A drought kills all small plants, leaving only large, hard-shelled seeds. Predict what will happen to the bird population over several generations.`,
    options: [
      "Nothing changes",
      "All birds immediately die",
      "Birds with slightly larger, stronger beaks can eat the large seeds — they survive and reproduce more. The next generation will have a higher frequency of large-beaked birds. Natural selection drives beak size evolution",
      "Beaks cannot change",
    ],
    correctAnswer: 2,
    explanation: `This is natural selection in action: environmental change (food type shift) creates differential survival. Birds with existing variation toward larger beaks survive the shift; they reproduce; their offspring inherit the beak advantage. Over generations, the population's average beak size increases — precisely what Darwin observed with Galapagos finches.`
  },
  {
    id: 6,
    type: "living",
    skill: "Human Body",
    question: `Blood type O is sometimes called the 'universal donor' for red blood cell transfusions. WHY?`,
    options: [
      "Type O blood is the most common",
      "Type O clotted blood works for everyone",
      "Type O red blood cells lack the A and B antigens — so they are not attacked by any recipient's immune system (which only attacks antigens it doesn't recognise)",
      "Type O blood is the strongest",
    ],
    correctAnswer: 2,
    explanation: `ABO compatibility: the immune system attacks red blood cells displaying unfamiliar antigens. Type O cells have NEITHER A nor B antigens — so neither anti-A nor anti-B antibodies (present in types B, A, and O recipients) attack them. They are accepted by all ABO types.`
  },
  {
    id: 7,
    type: "living",
    skill: "Cause & Effect",
    question: `Scientists observe that the introduction of rabbits to Australia caused massive environmental damage. WHY?`,
    options: [
      "Rabbits are naturally destructive animals",
      "Australia's plants were too fragile",
      "Rabbits had no natural predators in Australia — their population exploded, overgrazing vegetation, causing soil erosion, destroying native plants, and competing with native animals for food and burrow sites",
      "Australian soil couldn't support rabbits",
    ],
    correctAnswer: 2,
    explanation: `This is the classic invasive species problem: rabbits evolved in Europe where predators, parasites, and competitors kept populations in check. In Australia, none of these regulatory factors existed — the population exploded, causing enormous ecological damage.`
  },
  {
    id: 8,
    type: "living",
    skill: "Evaluating Data",
    question: `In a study of 1,000 people, those who drink 2+ cups of coffee daily have 20% lower rates of Parkinson's disease. A journalist writes 'Coffee prevents Parkinson's disease.' Why is this conclusion premature?`,
    options: [
      "Coffee is well known to be healthy",
      "The study is too large",
      "This is an observational correlation — people who drink coffee may differ from non-drinkers in many other ways (diet, activity, genetics). Without a randomised trial, we cannot establish that coffee CAUSES lower Parkinson's risk, only that they are associated",
      "Coffee research is always reliable",
    ],
    correctAnswer: 2,
    explanation: `Correlation vs causation in observational epidemiology: coffee drinkers likely differ from non-drinkers in many ways that could explain the difference in Parkinson's rates. Without randomisation, confounding cannot be ruled out. The correct statement is 'associated with,' not 'prevents.'`
  },
  {
    id: 9,
    type: "living",
    skill: "Synthesis",
    question: `WHY is genetic BIODIVERSITY within a species important for its long-term survival?`,
    options: [
      "Diverse genes make organisms look different",
      "Only appearance diversity matters",
      "Genetic diversity means the species contains many different alleles — when environmental conditions change (disease, climate shift), some individuals carry alleles for resistance or adaptation. With no diversity, a single threat can eliminate the entire population",
      "Species with more diversity reproduce faster",
    ],
    correctAnswer: 2,
    explanation: `Evolutionary buffer: genetic diversity is a species' insurance policy. When a novel pathogen or environmental change threatens, a genetically diverse population likely contains some individuals with advantageous alleles. A genetically uniform population (like many crop varieties) has no such variation — a single adapted pathogen can devastate it entirely.`
  },
  {
    id: 10,
    type: "living",
    skill: "Critical Analysis",
    question: `A researcher claims: 'Exercise increases brain volume, proving exercise makes you smarter.' Identify TWO problems with this conclusion.`,
    options: [
      "The conclusion is valid",
      "Only one problem exists",
      "Problem 1: correlation ≠ causation — smarter people may exercise more (reverse causation), not exercise making them smarter. Problem 2: brain volume ≠ intelligence — volume is a crude proxy; intelligence is complex and not simply correlated with overall brain size",
      "Brain studies are always reliable",
    ],
    correctAnswer: 2,
    explanation: `Dual critique: (1) Causation: the association between exercise and brain volume could reflect reverse causation (more cognitively active people exercise more) or a third factor (higher socioeconomic status provides both exercise access and cognitive stimulation). (2) Measurement validity: brain volume is a poor proxy for intelligence — intelligence involves connectivity, processing efficiency, and many factors not captured by volume.`
  },
  {
    id: 11,
    type: "physical",
    skill: "States of Matter",
    question: `Water is unusual because in its solid state (ice), it is LESS DENSE than liquid water. WHY does this matter for aquatic life?`,
    options: [
      "It makes ice stronger",
      "It has no practical significance",
      "Ice floats on water, insulating the liquid below. Aquatic life can survive winter under an ice cap — if ice sank (like most solids), water bodies would freeze solid from the bottom, killing everything",
      "Ice melts faster because it floats",
    ],
    correctAnswer: 2,
    explanation: `Water's anomalous density: hydrogen bonding in ice creates a crystal structure less dense than liquid water. Ice floats — this is critical for aquatic ecosystems. The floating ice layer insulates the liquid below from freezing air, allowing fish and other organisms to survive winter in liquid water beneath the ice cap.`
  },
  {
    id: 12,
    type: "physical",
    skill: "Forces",
    question: `A rocket in space fires its engine, ejecting gas backward. The rocket moves forward. This is explained by:`,
    options: [
      "Engines pull the rocket through space",
      "Gravity pushes the rocket forward",
      "Newton's Third Law: the rocket exerts a backward force on the gas; the gas exerts an equal forward force on the rocket — action and reaction pairs act on different objects",
      "Space has no physics",
    ],
    correctAnswer: 2,
    explanation: `Newton's Third Law in practice: action (rocket pushes gas backward) = reaction (gas pushes rocket forward). The key is that action-reaction pairs act on DIFFERENT objects — the rocket is accelerated by the gas's push on it, not by anything else.`
  },
  {
    id: 13,
    type: "physical",
    skill: "Energy",
    question: `Which energy transformation occurs in a HYDROELECTRIC DAM?`,
    options: [
      "Chemical energy to electrical",
      "Light energy to electrical",
      "Gravitational potential energy of water converts to kinetic energy as it falls, which drives turbines converting kinetic to electrical energy",
      "Nuclear energy to electrical",
    ],
    correctAnswer: 2,
    explanation: `Hydroelectric energy chain: water behind a dam has gravitational PE (due to height). Water falls → PE converts to KE → flowing water spins turbines → kinetic energy converts to electrical energy through electromagnetic induction in the generator.`
  },
  {
    id: 14,
    type: "physical",
    skill: "Electricity",
    question: `A student connects three 6Ω resistors in PARALLEL to a 12V battery. What is the equivalent resistance of the parallel combination?`,
    options: [
      "18 Ω",
      "6 Ω",
      "3 Ω — for identical resistors in parallel: Req = R/n = 6/3 = 2Ω. Wait: 1/Req = 1/6 + 1/6 + 1/6 = 3/6 = 0.5. Req = 2Ω",
      "2 Ω",
    ],
    correctAnswer: 3,
    explanation: `Parallel resistance: 1/Req = 1/R1 + 1/R2 + 1/R3 = 1/6 + 1/6 + 1/6 = 3/6. Req = 6/3 = 2Ω. For identical resistors in parallel, divide single resistance by number: 6/3 = 2Ω. Total current = 12V/2Ω = 6A.`
  },
  {
    id: 15,
    type: "physical",
    skill: "Waves",
    question: `Light travels at 3×10⁸ m/s in a vacuum. If the frequency of red light is 4.3×10¹⁴ Hz, what is its wavelength?`,
    options: [
      "Approximately 700 nm",
      "Approximately 400 nm",
      "Approximately 1,500 nm",
      "Approximately 300 nm",
    ],
    correctAnswer: 0,
    explanation: `λ = v/f = (3×10⁸ m/s) / (4.3×10¹⁴ Hz) ≈ 7×10⁻⁷ m = 700 nm. Red light has the longest wavelength in the visible spectrum (~620-750 nm), consistent with this answer.`
  },
  {
    id: 16,
    type: "physical",
    skill: "Magnetism",
    question: `An electromagnet is wound with 100 turns and carries 2A. If the current is doubled to 4A (all else constant), how does the magnetic field strength change?`,
    options: [
      "It stays the same",
      "It halves",
      "It doubles — magnetic field strength is proportional to current in an electromagnet (B ∝ NI). Doubling current doubles field strength",
      "It quadruples",
    ],
    correctAnswer: 2,
    explanation: `Electromagnet field strength: B ∝ NI (number of turns × current). If N stays constant and I doubles, B doubles. This is why electromagnets can be tuned by adjusting current — a key advantage over permanent magnets.`
  },
  {
    id: 17,
    type: "physical",
    skill: "Thermodynamics",
    question: `WHY does a metal surface feel COLDER than a wooden surface at the same room temperature?`,
    options: [
      "Metal is actually at a lower temperature",
      "Metal reflects heat away",
      "Metal is a better thermal conductor — heat flows from your warm hand to metal more rapidly than to wood (even at the same temperature). Your hand loses heat faster to metal, making it feel colder",
      "You imagine the difference",
    ],
    correctAnswer: 2,
    explanation: `Temperature sensation depends on heat flow RATE, not temperature. Metal (good conductor) draws heat from your hand rapidly — you experience this fast heat loss as 'cold.' Wood (poor conductor, good insulator) draws heat slowly — same temperature, but feels warmer because your hand loses heat slowly.`
  },
  {
    id: 18,
    type: "physical",
    skill: "Simple Machines",
    question: `A bicycle is a complex machine combining several simple machines. Identify TWO simple machine types present.`,
    options: [
      "Only one simple machine",
      "Levers and screws only",
      "The wheel and axle (wheels and gears — gears are wheel-and-axle systems); the lever (handlebars, brake levers, pedal arms); and potentially screws (bolts, bike fittings) — bicycles are elegant combinations of multiple simple machines",
      "Bicycles use no simple machines",
    ],
    correctAnswer: 2,
    explanation: `Bicycle simple machines: the bicycle wheel is a wheel-and-axle that converts rotational force into linear movement; pedal cranks are levers (force arm = crank length, load arm = radius at chain ring); gears are compound wheel-and-axle systems that adjust the mechanical advantage; handlebars and brake levers are levers.`
  },
  {
    id: 19,
    type: "physical",
    skill: "Applied Physics",
    question: `A student measures the density of two liquids: Liquid A = 0.8 g/cm³, Liquid B = 1.3 g/cm³. When mixed gently, what happens?`,
    options: [
      "They mix completely and evenly",
      "Liquid A sinks below Liquid B",
      "Liquid A floats on Liquid B — less dense liquids float on denser ones (Archimedes' Principle). This is why oil floats on water",
      "They become a gas",
    ],
    correctAnswer: 2,
    explanation: `Density and buoyancy: the less dense liquid (A at 0.8 g/cm³) floats on the denser liquid (B at 1.3 g/cm³). This is why oil (density ~0.9 g/cm³) floats on water (1.0 g/cm³) — density differences determine layering in immiscible liquids.`
  },
  {
    id: 20,
    type: "physical",
    skill: "Evaluating Physics",
    question: `A student claims: 'A hammer and feather dropped on the Moon would hit the ground at the same time, but on Earth the hammer falls faster.' Evaluate this.`,
    options: [
      "The hammer always falls faster everywhere",
      "The feather always falls faster",
      "Correct: On the Moon (no atmosphere), only gravity acts — both fall with the same acceleration g=1.6 m/s². On Earth, air resistance acts on both but has a MUCH greater effect on the feather (high surface area-to-mass ratio) — the feather falls much more slowly. This was demonstrated by Apollo 15 Commander David Scott on the Moon",
      "Air resistance doesn't affect falling objects",
    ],
    correctAnswer: 2,
    explanation: `Air resistance and terminal velocity: air resistance depends on shape, size, and speed. The feather's large area and tiny mass mean air resistance is enormous relative to gravity. The hammer's small area and large mass mean air resistance is negligible relative to gravity. Without air (Moon), both fall identically — confirming gravity acts equally on all masses.`
  },
  {
    id: 21,
    type: "earth",
    skill: "Water Cycle",
    question: `GROUNDWATER forms when:`,
    options: [
      "Ocean water evaporates",
      "Water flows over the surface in rivers",
      "Rainfall infiltrates through soil and rock, accumulating in underground aquifers",
      "Water vapour condenses in clouds",
    ],
    correctAnswer: 2,
    explanation: `Groundwater forms through infiltration: rainwater soaks into the ground, percolating through soil and permeable rock until it reaches the saturated zone (aquifer). It is the source of well water and spring flow.`
  },
  {
    id: 22,
    type: "earth",
    skill: "Geology",
    question: `The PRINCIPLE OF SUPERPOSITION states that in an undisturbed sedimentary rock sequence:`,
    options: [
      "Older layers are on top",
      "All layers are the same age",
      "Older layers are on the bottom — each new layer is deposited on top of the previous one",
      "Age cannot be determined from layering",
    ],
    correctAnswer: 2,
    explanation: `Superposition: geological processes deposit new material on top of older material. In an undisturbed sequence, the bottom layer is oldest. This fundamental principle allows relative dating of rock formations.`
  },
  {
    id: 23,
    type: "earth",
    skill: "Solar System",
    question: `Why does VENUS appear so BRIGHT in the night sky?`,
    options: [
      "It is the largest planet",
      "Venus generates its own light",
      "Its thick cloud cover reflects approximately 70% of sunlight (highest albedo of any planet) AND it orbits relatively close to Earth, making it the brightest object in the night sky after the Moon",
      "It is the closest planet to Earth",
    ],
    correctAnswer: 2,
    explanation: `Venus's brightness results from two factors: proximity (second planet from the Sun and regularly comes relatively close to Earth) and albedo (its thick sulphuric acid clouds reflect 70% of incoming sunlight — far more than any other planet). These combine to make it the night sky's brightest planet.`
  },
  {
    id: 24,
    type: "earth",
    skill: "Climate",
    question: `PERMAFROST is permanently frozen ground found in the Arctic. As it thaws due to global warming, it releases:`,
    options: [
      "Oxygen",
      "Pure water",
      "Large amounts of methane and CO2 — previously frozen organic matter decomposes, releasing stored greenhouse gases and amplifying warming in a positive feedback loop",
      "Nitrogen",
    ],
    correctAnswer: 2,
    explanation: `Permafrost feedback: Arctic permafrost has stored frozen organic material for thousands of years. As it thaws, decomposition releases CO2 and methane (a much more potent greenhouse gas in the short term). This adds to atmospheric greenhouse gases, causing more warming, causing more thaw — a self-amplifying positive feedback loop.`
  },
  {
    id: 25,
    type: "earth",
    skill: "Natural Disasters",
    question: `WHY do earthquakes cause most of their damage in areas of LOOSE, SATURATED SOIL rather than solid bedrock?`,
    options: [
      "Loose soil is heavier",
      "Bedrock is easier to rebuild on",
      "Liquefaction: saturated loose soil loses its strength and behaves like a liquid during earthquake shaking — buildings sink, lean, or collapse. Solid bedrock transmits seismic waves but doesn't liquefy, so buildings on bedrock typically suffer less damage",
      "Soil absorbs earthquake energy completely",
    ],
    correctAnswer: 2,
    explanation: `Liquefaction: when saturated sandy or silty soil is subjected to earthquake shaking, the vibration increases water pressure between soil particles, reducing friction. The soil temporarily behaves like a fluid — buildings lose their foundations and sink or topple. The 1964 Alaska and 2011 Christchurch earthquakes showed dramatic liquefaction damage.`
  },
  {
    id: 26,
    type: "earth",
    skill: "Environment",
    question: `Describe the POSITIVE FEEDBACK LOOP between Arctic sea ice loss and further warming.`,
    options: [
      "Ice loss has no feedback effect",
      "Ice loss cools the Arctic",
      "As sea ice melts, dark ocean replaces white ice → dark ocean absorbs more solar radiation (lower albedo) than reflective ice → ocean warms more → more ice melts → more dark ocean exposed → further warming. Each step amplifies the next — a self-reinforcing cycle",
      "More ice forms as compensation",
    ],
    correctAnswer: 2,
    explanation: `Ice-albedo feedback is one of the most important amplifying mechanisms in Arctic climate: sea ice albedo ≈ 0.8 (reflects 80% of sunlight); open ocean albedo ≈ 0.06 (reflects only 6%). As ice area shrinks, more solar radiation is absorbed rather than reflected — warming the Arctic 3-4× faster than the global average.`
  },
  {
    id: 27,
    type: "earth",
    skill: "Geology",
    question: `Scientists use HALF-LIFE of radioactive isotopes to date ancient rocks. If the half-life of Carbon-14 is 5,730 years and a sample has 25% of its original C-14 remaining, how old is the sample?`,
    options: [
      "5,730 years",
      "11,460 years — two half-lives: after 5,730 years, 50% remains; after 11,460 years, 25% remains",
      "17,190 years",
      "2,865 years",
    ],
    correctAnswer: 1,
    explanation: `Half-life calculation: after 1 half-life (5,730 years) → 50% remains. After 2 half-lives (11,460 years) → 25% remains. The sample has 25% C-14 remaining → 2 half-lives have elapsed → age = 2 × 5,730 = 11,460 years.`
  },
  {
    id: 28,
    type: "earth",
    skill: "Astronomy",
    question: `PLANETARY RETROGRADE MOTION (when a planet appears to move backwards in the sky) occurs because:`,
    options: [
      "Planets actually reverse direction temporarily",
      "Planets stop moving briefly",
      "As Earth overtakes a slower outer planet in its orbit, the outer planet appears to reverse direction from our moving perspective — like a fast car overtaking a slow one on a highway",
      "The Sun pulls planets backward periodically",
    ],
    correctAnswer: 2,
    explanation: `Retrograde motion is an apparent motion caused by relative orbital speeds. Earth moves faster than outer planets (closer to Sun = faster orbit). As Earth 'passes' an outer planet, that planet appears to move backward relative to background stars — an illusion of perspective, not a real reversal of motion.`
  },
  {
    id: 29,
    type: "earth",
    skill: "Evaluating Environmental Science",
    question: `A community plans to develop a WETLAND for housing. A scientist argues the wetland should be protected. Using ECONOMIC ARGUMENTS (not just environmental), justify the scientist's position.`,
    options: [
      "Wetlands have no economic value",
      "Only environmental arguments matter",
      "Wetlands provide economically valuable services: water filtration (saving water treatment costs), flood control (preventing damage costs), fish nurseries (supporting fishing industries), carbon storage (contributing to climate change cost avoidance), and eco-tourism. These ecosystem services have real economic values that may exceed the value of housing development",
      "Only tourism justifies wetland protection",
    ],
    correctAnswer: 2,
    explanation: `Environmental economics values ecosystem services monetarily: wetland water filtration replaces expensive treatment infrastructure; flood buffering prevents damage that otherwise requires costly infrastructure or insurance payouts; fish nurseries support commercial fisheries; carbon storage has value in carbon markets. When properly accounted, wetland service values often exceed development values.`
  },
  {
    id: 30,
    type: "earth",
    skill: "Synthesis",
    question: `HOW does the discovery of identical fossil species on BOTH SIDES of the Atlantic Ocean (e.g., South America and Africa) support the theory of continental drift?`,
    options: [
      "Fossils on different continents prove the animals swam across",
      "The same animals always evolve independently on different continents",
      "If continents were once joined (Pangaea), these species lived as one population on one landmass. As Gondwana split and the Atlantic opened, the same fossil species were separated on now-distant continents — exactly what Wegener observed and used as evidence for continental drift",
      "The ocean was shallower in ancient times",
    ],
    correctAnswer: 2,
    explanation: `Biogeographic evidence for continental drift: Mesosaurus fossils (small freshwater reptile, couldn't have crossed an ocean) are found in both Brazil and West Africa. Glossopteris plant fossils appear across South America, Africa, India, Antarctica, and Australia. These distributions only make sense if these landmasses were once connected — exactly as Pangaea reconstruction predicts.`
  },
  {
    id: 31,
    type: "technology",
    skill: "Scientific Method",
    question: `A student tests whether music tempo affects plant growth. She plays fast music to Group A (20 plants) and slow music to Group B (20 plants), watering all identically. After 4 weeks, Group A grew on average 2 cm taller. She concludes: 'Fast music makes plants grow faster.' Identify the main flaw.`,
    options: [
      "The sample size is too small",
      "She needed more types of music",
      "There is no control group — a group receiving NO music. The difference between fast and slow music might be explained by sound in general, not tempo specifically. Without a no-music control, she cannot determine whether music itself (versus tempo) is the factor",
      "Her measuring technique was wrong",
    ],
    correctAnswer: 2,
    explanation: `Missing control: the experiment compares two levels of the independent variable (fast vs slow music) but lacks a control (no music). This means she can test whether TEMPO affects growth differently for fast vs slow, but cannot determine whether any effect of music itself (sound waves, vibration) explains the results.`
  },
  {
    id: 32,
    type: "technology",
    skill: "Health",
    question: `The IMMUNE SYSTEM'S memory cells recognise a pathogen they have encountered before and respond faster than during the first infection. This principle underlies:`,
    options: [
      "Antibiotic therapy",
      "Chemotherapy",
      "Vaccination — vaccines expose the immune system to harmless antigens, creating memory cells. On real exposure later, these memory cells respond rapidly, preventing full disease development",
      "Surgical treatment",
    ],
    correctAnswer: 2,
    explanation: `Immunological memory is the biological basis of vaccination: first exposure (vaccine) → slow primary immune response + creation of memory B and T cells → subsequent exposure (real pathogen) → rapid secondary response from memory cells → pathogen eliminated before causing disease.`
  },
  {
    id: 33,
    type: "technology",
    skill: "Environmental Technology",
    question: `Jamaica is investing in SOLAR ENERGY to reduce oil imports. A school installs a 10 kW solar array. On a sunny day (8 peak sun hours), how many kWh does it generate?`,
    options: [
      "10 kWh",
      "18 kWh",
      "80 kWh — Energy = Power × time = 10 kW × 8 h = 80 kWh",
      "800 kWh",
    ],
    correctAnswer: 2,
    explanation: `Energy = Power × time = 10 kW × 8 hours = 80 kWh. This output could power approximately 80 standard LED-lit classrooms for one hour, or contribute significantly to the school's daily electricity needs.`
  },
  {
    id: 34,
    type: "technology",
    skill: "Evaluating Research",
    question: `Two studies test the same new drug. Study 1 (funded by the drug company): 75% effective. Study 2 (funded independently): 45% effective. Which result should be treated as MORE RELIABLE and WHY?`,
    options: [
      "The drug company study — it has more resources",
      "They should be averaged",
      "Study 2 (independent) — research funded by companies with financial interest in positive outcomes is systematically more likely to report favourable results (funding bias). Independent research without financial conflict of interest is generally more reliable, though methodology quality must also be assessed",
      "Both studies are equally reliable",
    ],
    correctAnswer: 1,
    explanation: `Funding bias is well-documented in medical literature: industry-funded trials consistently show more favourable results than independent trials of the same interventions. Financial conflict of interest creates pressure (conscious or unconscious) on study design, analysis choices, and reporting. Independent replication is the standard for establishing reliable conclusions.`
  },
  {
    id: 35,
    type: "technology",
    skill: "Applied Technology",
    question: `A student wants to charge her phone using a portable solar panel. The panel produces 5V and 2A of current. What power does it deliver, and is this sufficient to charge a phone requiring at least 10W?`,
    options: [
      "No calculation possible",
      "10W is more than solar can provide",
      "Power = V × I = 5V × 2A = 10W — exactly the minimum required. In practice, some losses occur in the charger circuit, so slightly more would be better, but 10W is technically sufficient under ideal conditions",
      "Power = V/I = 2.5W — insufficient",
    ],
    correctAnswer: 2,
    explanation: `Electrical power: P = V × I = 5V × 2A = 10W. This equals the minimum charging power requirement. However, conversion losses in the charger circuit (typically 10-20%) mean effective charging power is 8-9W — slightly marginal. Real-world solar panels also rarely operate at peak specifications, so a 15-20W panel would be more practical.`
  },
  {
    id: 36,
    type: "technology",
    skill: "Applying Health Science",
    question: `A student reads that a 'superfood' reduces cancer risk by 30%. What additional information MOST helps evaluate this claim?`,
    options: [
      "The taste of the superfood",
      "The price of the superfood",
      "Study type, sample size, duration, and whether the 30% is relative or absolute risk reduction — a '30% reduction' from 1% to 0.7% is very different from 30% to 21% in absolute terms",
      "Whether other scientists like the food",
    ],
    correctAnswer: 2,
    explanation: `Statistical literacy in health: relative risk reduction (RRR) sounds impressive but is misleading without absolute risk context. 30% RRR from a baseline of 1% = only 0.3% absolute benefit. From a baseline of 40%, the same 30% = 12% absolute benefit — enormously different clinical significance. Always ask: what is the baseline risk, and how large is the absolute benefit?`
  },
  {
    id: 37,
    type: "technology",
    skill: "Evaluating Technology Ethics",
    question: `Self-driving cars use AI to make split-second decisions. In an unavoidable accident scenario, the AI must 'choose' between hitting one person or five people. What does this 'trolley problem' reveal about AI ethics?`,
    options: [
      "AI has no ethical component",
      "Only engineers should decide",
      "It reveals that designing AI requires embedding explicit ethical frameworks (utilitarian: minimise harm to most; rights-based: never use a person as a means; virtue ethics: what would a virtuous driver do?) — these choices are made by programmers, raising questions about whose values are built into the AI and who is accountable for outcomes",
      "The car should always brake",
    ],
    correctAnswer: 2,
    explanation: `The trolley problem applied to AI reveals that autonomous systems must implicitly or explicitly encode ethical frameworks. The programmer's choice of algorithm IS a moral choice. Different ethical theories give different answers: utilitarianism favours minimising total harm (hit one to save five); rights-based ethics may refuse to actively harm anyone. Who decides, and who is liable? These are urgent questions as autonomous vehicles become common.`
  },
  {
    id: 38,
    type: "technology",
    skill: "Environmental Science",
    question: `Jamaica's coral reefs face bleaching from warmer seas AND ocean acidification from increased dissolved CO2. WHY are these two separate threats that TOGETHER are worse than either alone?`,
    options: [
      "They are the same threat",
      "Only bleaching matters because it's visible",
      "Bleaching stresses corals by expelling their symbiotic algae — corals then need to rebuild. Acidification weakens coral skeletons by reducing carbonate ion concentration — making rebuilding harder and slower. Together: bleached corals trying to recover face impeded rebuilding, shorter recovery windows between bleaching events, and ongoing structural weakening — a synergistic compound effect worse than either alone",
      "Acidification only affects shellfish",
    ],
    correctAnswer: 2,
    explanation: `Synergistic stressors: thermal bleaching and acidification operate through different mechanisms but interact. Bleaching drives the need for rapid skeletal rebuilding; acidification impairs the carbonate chemistry needed for calcification — slowing recovery. More frequent bleaching events (from climate change) hit reefs before they recover, while the water chemistry makes recovery harder. The combination overwhelms coral biological resilience.`
  },
  {
    id: 39,
    type: "technology",
    skill: "Critical Analysis — Scientific Progress",
    question: `The discovery that stomach ulcers are caused by the bacterium H. pylori (not stress, as previously believed) was initially rejected by the medical community. Dr Barry Marshall even drank the bacteria to prove his hypothesis. What does this story illustrate about scientific progress?`,
    options: [
      "Scientific consensus is always right",
      "Doctors never accept new ideas",
      "Scientific progress sometimes requires extraordinary evidence to overturn established paradigms. Marshall self-experimented because conventional evidence was dismissed. The story illustrates both the resistance to paradigm shifts AND the self-correcting nature of science — the evidence eventually prevailed when it became overwhelming",
      "Self-experimentation is recommended for all scientists",
    ],
    correctAnswer: 2,
    explanation: `Thomas Kuhn's paradigm shift: established scientific consensus (ulcers = stress) can be very resistant to change, even with good evidence. Marshall's dramatic self-experiment was partly a response to institutional resistance to an evidence-based challenge to the dominant model. Eventually, the evidence (and a Nobel Prize in 2005) vindicated him — showing science as self-correcting over time, if sometimes frustratingly slowly.`
  },
  {
    id: 40,
    type: "technology",
    skill: "Scientific Method",
    question: `What is the purpose of a CONTROL GROUP in an experiment?`,
    options: [
      "To receive the strongest treatment",
      "To confuse the results",
      "To provide a baseline comparison — showing what happens WITHOUT the experimental treatment, so any difference can be attributed to the treatment",
      "To be measured last",
    ],
    correctAnswer: 2,
    explanation: `A control group receives no experimental treatment (or a standard/placebo treatment). It shows what would happen naturally without the treatment, allowing the scientist to determine whether any observed change is caused by the experimental variable.`
  }
]

const SECTION_CONFIG = [
  { type: "living" as const,     label: "Living Things",            note: "recall through evaluation — cells, ecosystems, genetics, adaptation, human biology" },
  { type: "physical" as const,   label: "Physical Science",         note: "definitions through calculations — forces, energy, waves, electricity, matter" },
  { type: "earth" as const,      label: "Earth Science",            note: "naming through analysis — weather, geology, solar system, environment, climate" },
  { type: "technology" as const, label: "Science & Technology",     note: "scientific method, health, environment, evaluating technology claims" },
]

export default function G5ScMix1MockTest() {
  const { isPremium } = useAuth()
  const [started, setStarted]                 = useState(false)
  const [showResults, setShowResults]         = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers]                 = useState<(number | null)[]>([])
  const [timeLeft, setTimeLeft]               = useState(60 * 60)

  const availableQuestions = isPremium ? g5ScMix1Questions : g5ScMix1Questions.slice(0, FREE_QUESTION_LIMIT)
  const totalQuestions = availableQuestions.length

  useEffect(() => {
    if (answers.length !== totalQuestions) setAnswers(new Array(totalQuestions).fill(null))
  }, [totalQuestions, answers.length])

  const formatTime = useCallback((s: number) => {
    const m = Math.floor(s / 60)
    return `${m.toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`
  }, [])

  useEffect(() => {
    if (!started || showResults) return
    const t = setInterval(() => setTimeLeft((p) => { if (p <= 1) { setShowResults(true); return 0 } return p - 1 }), 1000)
    return () => clearInterval(t)
  }, [started, showResults])

  const handleAnswer = (idx: number) => { const a = [...answers]; a[currentQuestion] = idx; setAnswers(a) }
  const calcScore = () => answers.reduce((c, a, i) => i < totalQuestions && a === availableQuestions[i].correctAnswer ? c + 1 : c, 0)
  const scorePct  = () => Math.round((calcScore() / totalQuestions) * 100)

  const getGrade = () => {
    const p = scorePct()
    if (p >= 85) return { grade: "Excellent",         color: "text-green-600" }
    if (p >= 70) return { grade: "Good",              color: "text-blue-600" }
    if (p >= 50) return { grade: "Fair",              color: "text-amber-600" }
    return              { grade: "Needs Improvement", color: "text-red-600" }
  }

  const getSectionStats = (type: Question["type"]) => {
    const sq = availableQuestions.filter((q) => q.type === type)
    const correct = sq.filter((q) => { const i = availableQuestions.findIndex((x) => x.id === q.id); return answers[i] === q.correctAnswer }).length
    const total = sq.length
    const pct = total === 0 ? 0 : Math.round((correct / total) * 100)
    const rating = pct >= 85 ? "Excellent" : pct >= 70 ? "Good" : pct >= 50 ? "Fair" : "Needs Improvement"
    const color  = pct >= 85 ? "text-green-600" : pct >= 70 ? "text-blue-600" : pct >= 50 ? "text-amber-600" : "text-red-600"
    return { correct, total, percentage: pct, rating, ratingColor: color }
  }

  const resetTest = () => {
    setStarted(false); setShowResults(false); setCurrentQuestion(0)
    setAnswers(new Array(totalQuestions).fill(null)); setTimeLeft(60 * 60)
  }

  const q = availableQuestions[currentQuestion]
  const answeredCount = answers.filter((a) => a !== null).length
  const secLabel = (t: Question["type"]) =>
    t === "living" ? "Living Things" : t === "physical" ? "Physical Science"
    : t === "earth" ? "Earth Science" : "Science & Technology"
  const secColor = (t: Question["type"]) =>
    t === "living" ? "bg-green-50 text-green-800" : t === "physical" ? "bg-blue-50 text-blue-800"
    : t === "earth" ? "bg-amber-50 text-amber-800" : "bg-purple-50 text-purple-800"

  if (!started) return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-slate-50">
      <Header />
      <main className="container mx-auto px-4 py-10">
        <Link href="/mock-tests/science"><Button variant="ghost" className="mb-6"><ArrowLeft className="mr-2 h-4 w-4" />Back to Science Mock Tests</Button></Link>
        <Card className="mx-auto max-w-3xl border-purple-200 shadow-lg">
          <CardHeader className="bg-purple-50 text-center">
            <FlaskConical className="mx-auto mb-4 h-14 w-14 text-purple-700" />
            <CardTitle className="text-2xl text-purple-800">Science Mixed 1</CardTitle>
            <p className="text-slate-600">Grade 5 PEP Science · Mixed Level Practice</p>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            {!isPremium && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                <div className="flex items-start gap-3">
                  <Lock className="mt-1 h-5 w-5 flex-shrink-0 text-amber-600" />
                  <div>
                    <p className="font-semibold text-amber-800">Free Preview Mode</p>
                    <p className="text-sm text-amber-700">Try {FREE_QUESTION_LIMIT} questions free. Upgrade to unlock all 40.</p>
                    <Link href="/pricing" className="mt-3 inline-block"><Button className="bg-amber-500 hover:bg-amber-600"><Crown className="mr-2 h-4 w-4" />Upgrade to Premium</Button></Link>
                  </div>
                </div>
              </div>
            )}
            <div className="rounded-lg border border-purple-200 bg-white p-4">
              <h3 className="mb-2 font-semibold text-slate-800">Mixed Level Overview</h3>
              <p className="text-slate-700">This test blends straightforward recall, applied reasoning, and critical analysis across Living Things, Physical Science, Earth Science, and Science & Technology — a comprehensive Grade 5 Science challenge.</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-green-50 p-3 text-center"><p className="text-sm font-semibold text-green-800">Living Things</p><p className="text-xs text-slate-600">10 Questions</p></div>
              <div className="rounded-lg bg-blue-50 p-3 text-center"><p className="text-sm font-semibold text-blue-800">Physical Science</p><p className="text-xs text-slate-600">10 Questions</p></div>
              <div className="rounded-lg bg-amber-50 p-3 text-center"><p className="text-sm font-semibold text-amber-800">Earth Science</p><p className="text-xs text-slate-600">10 Questions</p></div>
              <div className="rounded-lg bg-purple-50 p-3 text-center"><p className="text-sm font-semibold text-purple-800">Science & Technology</p><p className="text-xs text-slate-600">10 Questions</p></div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="rounded-lg bg-gray-50 p-4"><p className="text-2xl font-bold text-purple-700">{totalQuestions}</p><p className="text-sm text-slate-600">Questions {!isPremium && "(Preview)"}</p></div>
              <div className="rounded-lg bg-gray-50 p-4"><p className="text-2xl font-bold text-purple-700">60</p><p className="text-sm text-slate-600">Minutes</p></div>
            </div>
            <Button onClick={() => setStarted(true)} className="w-full bg-purple-700 py-6 text-lg hover:bg-purple-800">Start Test</Button>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  )

  if (showResults) {
    const sc = calcScore(); const pct = scorePct(); const { grade, color } = getGrade()
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-slate-50">
        <Header />
        <main className="container mx-auto px-4 py-10">
          <Card className="mx-auto max-w-4xl border-purple-200 shadow-lg">
            <CardHeader className="bg-purple-50 text-center">
              <CheckCircle className="mx-auto mb-4 h-14 w-14 text-purple-700" />
              <CardTitle className="text-2xl text-purple-800">Science Test Completed</CardTitle>
              <p className="text-slate-600">Science Mixed 1</p>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              <div className="rounded-lg bg-gray-50 p-6 text-center">
                <p className="text-5xl font-bold text-purple-700">{sc}/{totalQuestions}</p>
                <p className="mt-2 text-slate-600">Questions Correct</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                <div className="rounded-lg bg-gray-50 p-4"><p className="text-3xl font-bold text-purple-700">{pct}%</p><p className="text-sm text-slate-600">Score</p></div>
                <div className="rounded-lg bg-gray-50 p-4"><p className={cn("text-2xl font-bold", color)}>{grade}</p><p className="text-sm text-slate-600">Performance</p></div>
                <div className="rounded-lg bg-gray-50 p-4"><p className="text-sm font-semibold text-slate-700">{new Date().toLocaleDateString()}</p><p className="text-sm text-slate-600">Completed</p></div>
              </div>
              {!isPremium && (<div className="rounded-lg border border-amber-200 bg-amber-50 p-4"><p className="font-semibold text-amber-800">Upgrade to access all 40 questions.</p><Link href="/pricing" className="mt-2 inline-block"><Button className="bg-amber-500 hover:bg-amber-600"><Crown className="mr-2 h-4 w-4" />Upgrade</Button></Link></div>)}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {SECTION_CONFIG.map((s) => { const st = getSectionStats(s.type); return (
                  <div key={s.type} className="rounded-xl border border-purple-100 bg-purple-50 p-4">
                    <p className="font-semibold text-purple-800">{s.label}</p>
                    <p className="text-sm text-slate-500 mt-1">{s.note}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-sm text-slate-700">{st.correct}/{st.total} correct</span>
                      <span className={cn("text-sm font-semibold", st.ratingColor)}>{st.rating}</span>
                    </div>
                    <Progress value={st.percentage} className="h-2 mt-2" />
                    <p className="text-xs text-slate-500 mt-1">{st.percentage}%</p>
                  </div>
                )})}
              </div>
              <div className="space-y-4">
                {availableQuestions.map((q, i) => {
                  const correct = answers[i] === q.correctAnswer
                  return (
                    <div key={q.id} className={cn("rounded-lg border-2 p-4", correct ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50")}>
                      <div className="flex items-start gap-3">
                        {correct ? <CheckCircle className="mt-1 h-5 w-5 text-green-600" /> : <XCircle className="mt-1 h-5 w-5 text-red-600" />}
                        <div className="flex-1">
                          <p className="font-semibold text-slate-800">Q{i + 1} · <span className="text-purple-700">{q.skill}</span></p>
                          <p className="mt-1 text-slate-700 text-sm">{q.question}</p>
                          <p className="mt-2 text-sm text-slate-600">Your answer: <span className={correct ? "text-green-700 font-medium" : "text-red-700 font-medium"}>{answers[i] !== null ? q.options[answers[i]!] : "Not answered"}</span></p>
                          <p className="text-sm text-green-700">Correct: {q.options[q.correctAnswer]}</p>
                          <p className="mt-1 text-sm text-slate-700">Explanation: {q.explanation}</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button onClick={() => window.print()} className="flex-1 bg-purple-700 hover:bg-purple-800"><Printer className="mr-2 h-4 w-4" />Print / Save Report</Button>
                <Button onClick={resetTest} variant="outline" className="flex-1"><RotateCcw className="mr-2 h-4 w-4" />Try Again</Button>
                <Link href="/mock-tests/science" className="flex-1"><Button variant="outline" className="w-full"><Home className="mr-2 h-4 w-4" />Back to Science Tests</Button></Link>
              </div>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-slate-50">
      <Header />
      <header className="bg-purple-800 text-white sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/mock-tests/science" className="p-2 hover:bg-white/10 rounded-lg transition-colors"><ArrowLeft className="h-5 w-5" /></Link>
            <FlaskConical className="h-8 w-8" />
            <div><h1 className="text-lg font-bold">Science Mixed 1</h1><p className="text-purple-100 text-xs">Question {currentQuestion + 1} of {totalQuestions}</p></div>
          </div>
          <div className={cn("flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-lg", timeLeft <= 300 ? "bg-red-500" : "bg-purple-600")}>
            <Clock className="h-5 w-5" />{formatTime(timeLeft)}
          </div>
        </div>
      </header>
      <div className="bg-white border-b shadow-sm sticky top-[72px] z-10">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>Progress: {answeredCount}/{totalQuestions} answered</span>
            <span>{Math.round((answeredCount / totalQuestions) * 100)}% complete</span>
          </div>
          <Progress value={(answeredCount / totalQuestions) * 100} className="h-2" />
        </div>
      </div>
      <main className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          {!isPremium && (<div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-4"><p className="font-semibold text-amber-800">Free Preview: {FREE_QUESTION_LIMIT} of 40 questions</p><p className="text-sm text-amber-700">Upgrade to Premium for full access.</p></div>)}
          <Card className="mb-6 border-purple-100">
            <CardHeader className={cn("rounded-t-lg", secColor(q.type))}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold uppercase tracking-wide">{q.skill}</span>
                <span className="text-xs uppercase tracking-wide opacity-70">{secLabel(q.type)}</span>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-base font-medium text-slate-800 mb-6 leading-relaxed whitespace-pre-line">{q.question}</p>
              <div className="space-y-3">
                {q.options.map((opt, idx) => (
                  <button key={idx} onClick={() => handleAnswer(idx)}
                    className={cn("w-full p-4 text-left rounded-lg border-2 transition-all",
                      answers[currentQuestion] === idx ? "border-purple-700 bg-purple-50" : "border-gray-200 hover:border-purple-400 hover:bg-purple-50/50")}>
                    <span className="font-medium text-purple-800 mr-3">{String.fromCharCode(65 + idx)}.</span>{opt}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
          <div className="flex items-center justify-between mb-6">
            <Button variant="outline" onClick={() => setCurrentQuestion((p) => p - 1)} disabled={currentQuestion === 0}><ChevronLeft className="h-4 w-4 mr-2" />Previous</Button>
            {currentQuestion === totalQuestions - 1
              ? <Button onClick={() => setShowResults(true)} className="bg-purple-700 hover:bg-purple-800"><Flag className="h-4 w-4 mr-2" />Submit Test</Button>
              : <Button onClick={() => setCurrentQuestion((p) => p + 1)} className="bg-purple-700 hover:bg-purple-800">Next<ChevronRight className="h-4 w-4 ml-2" /></Button>}
          </div>
          <Card className="border-purple-100">
            <CardHeader className="py-3"><CardTitle className="text-sm text-purple-700">Question Navigator</CardTitle></CardHeader>
            <CardContent className="pb-4">
              <div className="grid grid-cols-10 gap-2">
                {availableQuestions.map((_, idx) => (
                  <button key={idx} onClick={() => setCurrentQuestion(idx)}
                    className={cn("w-8 h-8 rounded text-sm font-medium transition-colors",
                      currentQuestion === idx ? "bg-purple-700 text-white"
                      : answers[idx] !== null ? "bg-purple-100 text-purple-700"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200")}>
                    {idx + 1}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-4 mt-4 text-xs text-gray-500">
                <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-purple-700" /><span>Current</span></div>
                <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-purple-100" /><span>Answered</span></div>
                <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-gray-100" /><span>Unanswered</span></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  )
}
