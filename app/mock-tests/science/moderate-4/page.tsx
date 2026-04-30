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

const g5ScMod4Questions: Question[] = [
  {
    id: 1,
    type: "living",
    skill: "Cause & Effect",
    question: `A tropical island's only freshwater lake dries up during a severe drought. Which organisms are MOST IMMEDIATELY affected?`,
    options: [
      "Only land plants",
      "Only birds",
      "Aquatic organisms (fish, amphibians, aquatic insects) — they lose their habitat and water source first; terrestrial animals and plants are affected more slowly as groundwater also declines",
      "Only mammals that drink from the lake",
    ],
    correctAnswer: 2,
    explanation: `Aquatic organisms have no alternative habitat — when their water disappears, they face immediate extinction locally. Terrestrial animals that drink from the lake lose a water source but may find alternatives. Aquatic species are most immediately at risk.`
  },
  {
    id: 2,
    type: "living",
    skill: "Applying Human Biology",
    question: `A patient's blood test shows very LOW RED BLOOD CELL count. Which symptom would the doctor EXPECT?`,
    options: [
      "Fever and infection",
      "Increased energy levels",
      "Fatigue and breathlessness — fewer red blood cells means less oxygen transported to tissues, leaving the person constantly short of energy and breath",
      "Digestive problems only",
    ],
    correctAnswer: 2,
    explanation: `Red blood cells carry haemoglobin, which binds and transports oxygen. Low RBC count = anaemia: insufficient oxygen delivery to muscles and organs causes fatigue (muscles can't work efficiently) and breathlessness (body tries to compensate by breathing more).`
  },
  {
    id: 3,
    type: "living",
    skill: "Applying Adaptation",
    question: `A plant living in a waterlogged swamp has AIR SPACES in its stems and roots. This adaptation helps by:`,
    options: [
      "Making the plant lighter so it floats",
      "Storing food for winter",
      "Supplying oxygen to roots in waterlogged soil where normal gas exchange is blocked — roots cannot get oxygen from saturated soil, so internal air channels supply it",
      "Absorbing more water",
    ],
    correctAnswer: 2,
    explanation: `Waterlogged soil is oxygen-poor (anaerobic) — roots cannot respire aerobically. Aerenchyma (internal air spaces, like in mangroves) create internal airways that channel oxygen from leaves above water down to submerged roots.`
  },
  {
    id: 4,
    type: "living",
    skill: "Data Interpretation",
    question: `A student counts the number of different bird species in a forest before and after partial logging. Before: 45 species. After: 28 species. What does this data suggest?`,
    options: [
      "Logging improved bird habitat",
      "Bird species naturally decline in forests",
      "Logging reduced habitat diversity and complexity — fewer tree species and structures means fewer ecological niches, supporting fewer bird species",
      "The birds migrated due to the time of year",
    ],
    correctAnswer: 2,
    explanation: `Biodiversity typically declines after logging: fewer tree species and structural layers (canopy, understorey) mean fewer niches for specialist species. Forest specialists are lost first; generalists may persist. The 38% species reduction is a significant biodiversity impact.`
  },
  {
    id: 5,
    type: "living",
    skill: "Applying Genetics",
    question: `A woman who is a CARRIER for colour blindness (carries the gene but doesn't show the trait) has children with a man who has normal vision. What is the probability their SONS will be colour-blind?`,
    options: [
      "0%",
      "25%",
      "50% — sons receive a Y chromosome from father and X from mother; if they receive the X with the colour-blindness allele, they will be colour-blind",
      "100%",
    ],
    correctAnswer: 2,
    explanation: `Colour blindness is X-linked recessive. Sons get X from mother (either normal X or X with colour-blindness allele — 50/50 chance) and Y from father. If they get the colour-blind X, they express it (no second X to mask it). So 50% of sons will be colour-blind.`
  },
  {
    id: 6,
    type: "living",
    skill: "Cause & Effect",
    question: `WHY does a plant wilt on a hot, dry day even if watered in the morning?`,
    options: [
      "Plants don't need water in the morning",
      "Heat destroys chlorophyll quickly",
      "Transpiration (water loss from leaves) exceeds water uptake from roots on hot, dry days — more water leaves through stomata than is replaced, causing the plant to lose turgor pressure and wilt",
      "Plants dislike daylight",
    ],
    correctAnswer: 2,
    explanation: `Wilting results from a water deficit. On hot, dry, windy days, transpiration rate is very high. If the rate of water loss exceeds uptake from roots, cells lose turgor pressure and the plant wilts. In cooler/wetter conditions, uptake can match loss.`
  },
  {
    id: 7,
    type: "living",
    skill: "Applying Classification",
    question: `A marine biologist finds an organism that: has eight arms with suckers, no backbone, three hearts, blue blood (haemocyanin), and can change colour. It is a:`,
    options: [
      "Fish (vertebrate)",
      "Crustacean",
      "Cephalopod mollusc (octopus/squid) — eight arms, no backbone, and haemocyanin (blue copper-based blood) are distinctive cephalopod features",
      "Arachnid",
    ],
    correctAnswer: 2,
    explanation: `Octopuses are cephalopod molluscs: eight arms with suckers, no skeleton (or a vestigial internal shell), three hearts (one systemic, two branchial), blue haemocyanin blood, and chromatophore cells for colour change. All distinctive cephalopod features.`
  },
  {
    id: 8,
    type: "living",
    skill: "Applying Ecology",
    question: `A student observes that a pond near a farm has a sudden bloom of green algae. The farmer recently applied fertiliser to adjacent fields. What is the connection?`,
    options: [
      "Algae grow randomly",
      "The farm produced seed for the algae",
      "Fertiliser runoff (nitrates and phosphates) entered the pond, providing excess nutrients that triggered rapid algal growth (eutrophication) — a classic example of agricultural nutrient pollution",
      "Algae grew due to warm weather only",
    ],
    correctAnswer: 2,
    explanation: `Eutrophication: excess nutrients (especially nitrogen and phosphorus from fertilisers) enter water bodies through runoff, fuelling rapid algal growth. The algal bloom blocks light, depletes oxygen when decomposing, and kills aquatic life.`
  },
  {
    id: 9,
    type: "living",
    skill: "Cause & Effect",
    question: `WHAT HAPPENS to an ecosystem when an INVASIVE SPECIES is introduced?`,
    options: [
      "The ecosystem always improves",
      "Nothing significant happens",
      "Native species face new competition and predation they are not adapted to — often causing decline or extinction of native species, reducing biodiversity, and sometimes fundamentally restructuring the ecosystem",
      "Only plants are affected",
    ],
    correctAnswer: 2,
    explanation: `Invasive species disrupt established ecological balances: native species haven't co-evolved with the invader and may have no defences against its predation or competition. This often causes population crashes and ecosystem restructuring.`
  },
  {
    id: 10,
    type: "living",
    skill: "Interpreting Data",
    question: `A plant grows 2 cm per day in full sunlight, 1.5 cm per day in partial shade, and 0.2 cm per day in deep shade. If a student wants to maximise growth, what environment should she choose?`,
    options: [
      "Deep shade — cool temperatures are best",
      "Partial shade — balance is best",
      "Full sunlight — the data clearly shows maximum growth rate occurs with maximum light, consistent with photosynthesis providing more energy in more sunlight",
      "It makes no difference",
    ],
    correctAnswer: 2,
    explanation: `The data shows a clear positive relationship between light intensity and growth rate. More light = more photosynthesis = more energy and glucose for growth. Full sunlight maximises growth in this experiment.`
  },
  {
    id: 11,
    type: "physical",
    skill: "Applying Forces",
    question: `A student is asked to explain why a sharp knife cuts bread more easily than a blunt knife with the same force. The explanation involves:`,
    options: [
      "Sharp knives are lighter",
      "Blunt knives are harder",
      "Pressure = Force/Area. The sharp blade has a much smaller contact area — the same force creates much higher pressure at the blade edge, enabling it to cut through the bread. A blunt blade's larger area produces lower pressure",
      "Sharp knives have more friction",
    ],
    correctAnswer: 2,
    explanation: `Pressure concentration: a sharp edge has a tiny contact area. The same cutting force over a tiny area produces enormous pressure — enough to cut. A blunt edge spreads the force over a larger area, reducing pressure so much that it struggles to cut.`
  },
  {
    id: 12,
    type: "physical",
    skill: "Applying Thermodynamics",
    question: `A metal spoon left in hot soup gets hot. A plastic spoon in the same soup stays cool. This difference occurs because:`,
    options: [
      "Metal is heavier so it absorbs more heat",
      "Plastic is waterproof",
      "Metal is a good thermal conductor — heat flows easily through its free electrons from the hot soup to the cooler handle. Plastic is a thermal insulator — it has no free electrons and heat does not flow readily through it",
      "Soup only heats metal objects",
    ],
    correctAnswer: 2,
    explanation: `Thermal conductivity: metals conduct heat well because their free electrons can carry thermal energy efficiently. Polymers (plastics) have tightly bonded electrons and no free charge carriers — heat energy can only be transferred slowly by molecular vibration.`
  },
  {
    id: 13,
    type: "physical",
    skill: "Applying Chemistry",
    question: `A student adds vinegar (an acid) to baking soda (a base, sodium bicarbonate). The mixture fizzes. This is a:`,
    options: [
      "Physical change — no new substance formed",
      "Burning reaction",
      "Chemical reaction — an acid-base neutralisation producing sodium acetate, water, and CO2 gas. The fizzing is CO2 escaping. New substances are formed — this is a chemical change",
      "Evaporation reaction",
    ],
    correctAnswer: 2,
    explanation: `Acid + carbonate → salt + water + CO2. This is a chemical change because new substances are produced (sodium acetate, water, CO2) — the products are fundamentally different from the reactants. The CO2 fizzing is the observable evidence of a chemical reaction.`
  },
  {
    id: 14,
    type: "physical",
    skill: "Data Interpretation",
    question: `A ball is dropped from 2m, 4m, and 6m heights. The time to hit the ground: 0.64s, 0.9s, and 1.1s. What relationship exists between height and time?`,
    options: [
      "Time is directly proportional to height (double height = double time)",
      "Time decreases as height increases",
      "Time increases with height but NOT proportionally — time is proportional to the square root of height (t ∝ √h), consistent with s = ½gt²",
      "Time is always 0.64 seconds",
    ],
    correctAnswer: 2,
    explanation: `Using s = ½gt²: rearranging gives t = √(2s/g). Time is proportional to the square root of height, not height itself. This is confirmed by the data: √2:√4:√6 ≈ 1.41:2:2.45, while 0.64:0.9:1.1 ≈ 1:1.4:1.7 — consistent with the square root relationship.`
  },
  {
    id: 15,
    type: "physical",
    skill: "Applying Waves",
    question: `Radio waves and visible light are both part of the ELECTROMAGNETIC SPECTRUM. What do they have in common?`,
    options: [
      "They both require a medium to travel",
      "Only visible light travels at the speed of light",
      "Both are electromagnetic waves that travel at the speed of light (3×10⁸ m/s) in a vacuum — they differ only in frequency and wavelength, not in the type of wave or speed",
      "Radio waves travel much slower than light",
    ],
    correctAnswer: 2,
    explanation: `All electromagnetic radiation — radio waves, microwaves, infrared, visible light, UV, X-rays, gamma rays — travels at the same speed in vacuum (c = 3×10⁸ m/s) and requires no medium. They differ only in frequency and wavelength.`
  },
  {
    id: 16,
    type: "physical",
    skill: "Applying Magnets",
    question: `A nail is placed near a strong magnet and becomes temporarily magnetic, attracting small paper clips. This demonstrates:`,
    options: [
      "The nail contains its own permanent magnetism",
      "Paper clips are made of aluminium",
      "Induced magnetism — the strong magnet aligns magnetic domains in the iron nail, temporarily making it a magnet. Domain alignment is lost when the external magnet is removed",
      "Gravity attracting metal objects",
    ],
    correctAnswer: 2,
    explanation: `Induced magnetism occurs when a ferromagnetic material (iron, steel, nickel, cobalt) is placed in a magnetic field — its magnetic domains align with the external field, creating temporary magnetism. Remove the field and most domains return to random alignment.`
  },
  {
    id: 17,
    type: "physical",
    skill: "Applying Physics",
    question: `A student notices that a glass of ice water has water droplets forming on its OUTSIDE surface. WHY?`,
    options: [
      "The glass is leaking",
      "Ice produces water on the outside",
      "Water vapour in the warm air near the cold glass cools below the dew point and condenses on the cold glass surface — the same process that forms dew on grass and clouds in the sky",
      "The glass sweats",
    ],
    correctAnswer: 2,
    explanation: `Condensation on cold surfaces: warm air containing water vapour cools when it contacts the cold glass surface. When the air cools below the dew point (the temperature at which it becomes saturated), water vapour condenses into liquid droplets on the glass.`
  },
  {
    id: 18,
    type: "physical",
    skill: "Applying Optics",
    question: `WHY does a SWIMMING POOL appear SHALLOWER than it really is?`,
    options: [
      "Water distorts vision like a mirror",
      "Light travels slower in water",
      "Refraction: light from the pool floor bends as it exits the water into air (from denser to less dense medium), making the pool floor appear higher (closer) than it really is — the classic optical illusion of shallow-looking water",
      "Pools are always shallow",
    ],
    correctAnswer: 2,
    explanation: `Refraction at the water-air interface: light bends away from the normal when leaving water (denser) to air (less dense). Our brain assumes light travels in straight lines — the bent rays make the pool floor appear at a higher position than it truly is, making the pool seem shallower.`
  },
  {
    id: 19,
    type: "physical",
    skill: "Data Interpretation",
    question: `A student tests whether temperature affects the rate of a chemical reaction by measuring time to dissolve the same tablet in water at 10°C, 20°C, 30°C, and 40°C: 120s, 60s, 30s, 15s. What pattern is shown?`,
    options: [
      "Reaction rate is unaffected by temperature",
      "Higher temperature slows reactions",
      "As temperature doubles (10→20→40), dissolution time halves — rate roughly doubles for every 10°C increase. This demonstrates that higher temperature provides more energy for molecular collisions, increasing reaction rate",
      "The pattern is random",
    ],
    correctAnswer: 2,
    explanation: `The Rule of Ten: many chemical reactions roughly double in rate for every 10°C temperature rise. Here: 10°C→20°C (120→60s, rate doubles), 20°C→30°C (60→30s, doubles again), 30°C→40°C (30→15s, doubles again) — a perfect demonstration of temperature's effect on reaction kinetics.`
  },
  {
    id: 20,
    type: "physical",
    skill: "Applying Physics",
    question: `A student fills one balloon with air and another identical balloon with water. Both balloons have the same mass. When dropped from the same height, which hits the ground FIRST?`,
    options: [
      "The air balloon, because it is lighter",
      "They hit at the same time",
      "The water balloon — it has less air resistance relative to its weight (higher density means gravity dominates over air resistance more than for the lighter air balloon)",
      "The air balloon, because air is faster",
    ],
    correctAnswer: 2,
    explanation: `This is a density and air resistance problem. The water balloon is denser — its weight-to-drag ratio is higher, so gravity dominates and it falls faster. The air balloon has significant air resistance relative to its small weight.`
  },
  {
    id: 21,
    type: "earth",
    skill: "Applying Climate",
    question: `WHY is the GREENHOUSE EFFECT both essential and problematic?`,
    options: [
      "It is always harmful",
      "It has no important role",
      "Without any greenhouse effect, Earth would average -18°C and be unable to support life. The natural effect maintains suitable temperatures. The ENHANCED greenhouse effect (from human emissions) traps excessive heat, causing dangerous global warming",
      "Only CO2 matters in climate",
    ],
    correctAnswer: 2,
    explanation: `The distinction is crucial: the natural greenhouse effect (water vapour, natural CO2, methane) makes Earth habitable — maintaining +15°C average instead of -18°C. Human emissions have enhanced this effect, trapping additional heat and driving climate change.`
  },
  {
    id: 22,
    type: "earth",
    skill: "Applying Soil",
    question: `A farmer converts forest to farmland. Five years later, crop yields are declining. WHY?`,
    options: [
      "Farming always improves soil",
      "Forest soil is bad for farming",
      "Clearing forest removes organic matter input; cultivation destroys soil structure; erosion removes topsoil; nutrients are removed with crops and not replaced — the initial high fertility of forest soil rapidly depletes without sustainable management",
      "Crops need less soil over time",
    ],
    correctAnswer: 2,
    explanation: `Forest soil is initially fertile (high organic matter from millennia of leaf litter). Clearing removes organic matter inputs; cultivation physically destroys soil structure; crops remove nutrients not naturally replaced; erosion removes topsoil. Without sustainable practices, tropical forest soils degrade within years.`
  },
  {
    id: 23,
    type: "earth",
    skill: "Data Interpretation",
    question: `Air temperature data from a Caribbean weather station shows: sea breezes occur when land is hotter than sea (daytime); land breezes occur when land is cooler than sea (nighttime). WHY do these patterns occur?`,
    options: [
      "Land is always hotter than the sea",
      "Sea temperature changes faster than land",
      "Land heats and cools faster than water (lower specific heat capacity). During the day, land is hotter — air rises over land, cooler sea air moves in (sea breeze). At night, land cools faster than sea — air rises over warmer sea, cooler land air moves out (land breeze)",
      "Breezes are random",
    ],
    correctAnswer: 2,
    explanation: `The land/sea breeze cycle demonstrates specific heat capacity: water has higher specific heat (stores more energy per degree). Land heats rapidly in daytime → lower pressure → sea breeze. Land cools rapidly at night → higher pressure → land breeze. This is the fundamental physics of coastal climate.`
  },
  {
    id: 24,
    type: "earth",
    skill: "Applying Geology",
    question: `Jamaica sits near the boundary between the Caribbean Plate and the North American Plate. This explains why Jamaica:`,
    options: [
      "Has no geological activity",
      "Only has beaches and no mountains",
      "Experiences earthquakes (plates moving past each other cause seismic stress) and has a complex geology including mountains formed by ancient tectonic activity",
      "Is far from any tectonic activity",
    ],
    correctAnswer: 2,
    explanation: `Jamaica's position near a major plate boundary — the Caribbean and North American plates — explains its seismic history. Relative plate movement builds stress that periodically releases as earthquakes. Jamaica experienced a major earthquake in 1907 and ongoing minor seismic activity.`
  },
  {
    id: 25,
    type: "earth",
    skill: "Applying Astronomy",
    question: `The INNER PLANETS of the Solar System (Mercury, Venus, Earth, Mars) differ from the OUTER PLANETS (Jupiter, Saturn, Uranus, Neptune) in that:`,
    options: [
      "Inner planets are larger",
      "Outer planets have solid surfaces",
      "Inner planets are small, rocky, and dense with thin atmospheres or none; outer planets are large, gaseous (or icy), with thick atmospheres — reflecting how the solar nebula differentiated during Solar System formation",
      "There is no systematic difference",
    ],
    correctAnswer: 2,
    explanation: `The dichotomy reflects Solar System formation: close to the young Sun, heat vaporised lighter elements, leaving only rocky/metallic material for the inner planets. Beyond the frost line, water ice and gases could condense, allowing giant planets to accumulate massive gas/ice envelopes.`
  },
  {
    id: 26,
    type: "earth",
    skill: "Applying Water Cycle",
    question: `A farmer in a rural Jamaican community installs a RAINWATER HARVESTING system. This benefits the community by:`,
    options: [
      "Increasing rainfall in the area",
      "Replacing the municipal water supply completely",
      "Collecting and storing rainfall during wet seasons for use during dry seasons — reducing dependence on piped water, improving water security, and reducing runoff that could cause erosion",
      "Only benefiting the farmer's crops",
    ],
    correctAnswer: 2,
    explanation: `Rainwater harvesting captures rainfall (often abundant during wet season) and stores it for dry season use. Benefits: improved water security (own supply), reduced demand on piped systems (lower costs), reduced surface runoff (less erosion and flooding), and water quality (if properly filtered).`
  },
  {
    id: 27,
    type: "earth",
    skill: "Cause & Effect",
    question: `As POLAR ICE CAPS MELT due to global warming, which CHAIN of consequences follows?`,
    options: [
      "Only sea levels change",
      "Nothing significant changes",
      "Meltwater flows to oceans → sea levels rise → coastal flooding → displacement of coastal communities → less white ice to reflect sunlight (ice-albedo feedback) → Earth absorbs more heat → more warming → more melting. A self-reinforcing cycle",
      "Ice melting only affects polar bears",
    ],
    correctAnswer: 2,
    explanation: `Climate feedback loops: ice reflects sunlight (high albedo). As ice melts, darker ocean/land is exposed (lower albedo), absorbing more heat → more warming → more melting. This positive feedback amplifies warming, and combined with sea level rise and community displacement, creates compounding consequences.`
  },
  {
    id: 28,
    type: "earth",
    skill: "Applying Environmental Science",
    question: `Jamaica designates a large area as a FOREST RESERVE. Which of the following BEST justifies this decision?`,
    options: [
      "Forests are only good for lumber",
      "Forests should be preserved for tourism only",
      "Forest reserves protect watersheds (ensuring clean water for communities), preserve biodiversity, sequester carbon (mitigating climate change), prevent soil erosion, and support the forestry and ecotourism industries — multiple simultaneous benefits",
      "Only governments benefit from forest reserves",
    ],
    correctAnswer: 2,
    explanation: `Forest reserve justification is multi-functional: watershed protection (perhaps the most critical in Jamaica), biodiversity conservation, carbon storage, erosion prevention, and sustainable forestry/ecotourism. One decision produces multiple simultaneous benefits — a compelling case for conservation.`
  },
  {
    id: 29,
    type: "earth",
    skill: "Data Interpretation",
    question: `A student compares the CO2 concentration in atmospheric air (400 ppm) with air from inside a sealed greenhouse with plants (280 ppm in daylight, 420 ppm at night). What explains the day/night pattern?`,
    options: [
      "CO2 randomly changes in greenhouses",
      "Plants produce CO2 during the day",
      "During daylight, plant photosynthesis consumes CO2 faster than respiration produces it — CO2 falls below ambient. At night, only respiration occurs, adding CO2 — levels rise above ambient",
      "Plants have no effect on CO2",
    ],
    correctAnswer: 2,
    explanation: `This perfectly illustrates the balance of metabolic processes: daytime net photosynthesis > respiration → CO2 consumed, concentration falls. Nighttime respiration only → CO2 produced, concentration rises. The magnitude of change shows the scale of plant metabolic activity.`
  },
  {
    id: 30,
    type: "earth",
    skill: "Applying Geology",
    question: `Scientists use RADIOMETRIC DATING to determine the age of rocks. This technique works because:`,
    options: [
      "Scientists can estimate age from colour",
      "Rocks have dates stamped on them",
      "Radioactive isotopes decay at known, constant rates — by measuring the ratio of original (parent) to decay product (daughter) isotopes in a rock sample, scientists can calculate how long the process has been occurring (the rock's age)",
      "All rocks form at the same time",
    ],
    correctAnswer: 2,
    explanation: `Radiometric dating exploits radioactive decay: an unstable parent isotope (e.g., uranium-238) decays at a constant half-life into a stable daughter (e.g., lead-206). Measuring the U:Pb ratio in a rock sample reveals how many half-lives have elapsed since the rock solidified — its age.`
  },
  {
    id: 31,
    type: "technology",
    skill: "Applying Scientific Method",
    question: `A student investigates whether fertiliser affects plant height. She grows 10 plants with fertiliser and 10 without. After 4 weeks: fertiliser group average = 25 cm; no fertiliser = 16 cm. She concludes fertiliser causes taller plants. Is this conclusion VALID?`,
    options: [
      "No — you need 1,000 plants",
      "No — you need 100 plants in each group",
      "The conclusion is reasonably supported: same conditions except fertiliser (fair test), multiple plants per group (reduces individual variation), and a clear difference (25 vs 16 cm, approximately 56% taller). The conclusion is valid given this experimental design",
      "The conclusion is invalid because plants vary",
    ],
    correctAnswer: 2,
    explanation: `Valid experimental conclusions require: fair test (one variable changed), sufficient sample size (10 per group is reasonable), and meaningful difference. This experiment meets these criteria — the conclusion that fertiliser increased growth is supported by the data.`
  },
  {
    id: 32,
    type: "technology",
    skill: "Evaluating Health Technology",
    question: `MRI SCANS are preferred over X-RAYS for imaging soft tissue (like brain tumours) because:`,
    options: [
      "MRI is always faster than X-ray",
      "X-rays are too expensive",
      "MRI uses magnetic fields and radio waves (no ionising radiation) and produces detailed images of soft tissue with high contrast — X-rays use ionising radiation and show bones clearly but soft tissue poorly",
      "MRI is available everywhere X-rays are",
    ],
    correctAnswer: 2,
    explanation: `MRI vs X-ray: X-rays are absorbed differentially by dense tissue (bone shows well; soft tissue is invisible). MRI uses nuclear magnetic resonance — it detects differences in water content and tissue types, producing excellent soft-tissue contrast with no ionising radiation risk.`
  },
  {
    id: 33,
    type: "technology",
    skill: "Applying Environmental Science",
    question: `A community group tests water quality from three sources: tap water pH=7.2, nearby river pH=6.1, and groundwater from a flooded mine pH=3.5. Which source is SAFEST for drinking?`,
    options: [
      "The groundwater — it has been underground",
      "The river — natural water is best",
      "The tap water — pH 7.2 is within the safe range (6.5-8.5) for drinking. The river (6.1) is moderately acidic; the mine water (3.5) is dangerously acidic and likely contaminated with heavy metals from mineral dissolution",
      "All sources are equally safe",
    ],
    correctAnswer: 0,
    explanation: `pH 7.2 is within the WHO safe range for drinking water (6.5-8.5). River water at pH 6.1 may indicate mild acid rain or organic acids — borderline but concerning. Mine water at pH 3.5 is very acidic — acid mine drainage contains dissolved heavy metals (iron, arsenic, lead) and is toxic.`
  },
  {
    id: 34,
    type: "technology",
    skill: "Applying Scientific Method",
    question: `A student tests whether caffeine affects reaction time. She tests 5 students before and after drinking coffee, recording the time to click a button when a light flashes. Her results show faster reaction times after coffee. What LIMITATION does her study have?`,
    options: [
      "5 students is too many",
      "The light was too bright",
      "The sample size (5) is small — results may not be representative; there is no control group (students not drinking coffee); the students know they drank coffee (expectation effect may improve performance independent of caffeine",
      "Her equipment was incorrect",
    ],
    correctAnswer: 2,
    explanation: `Study limitations: small sample (5 students — large random variation is likely); no control group (no way to know if improvement would have occurred without coffee); lack of blinding (students knowing they drank coffee could improve performance through expectation alone — the placebo effect).`
  },
  {
    id: 35,
    type: "technology",
    skill: "Applying Technology",
    question: `ARTIFICIAL INTELLIGENCE is now used to DIAGNOSE MEDICAL CONDITIONS from images (X-rays, scans). What is a POTENTIAL CONCERN with this application?`,
    options: [
      "AI diagnoses are always wrong",
      "There are no concerns with AI diagnosis",
      "AI may miss unusual cases it wasn't trained on; algorithmic biases may affect accuracy across different patient populations; accountability is unclear when AI makes an error; and over-reliance may reduce clinical skill in doctors",
      "AI is always better than humans",
    ],
    correctAnswer: 2,
    explanation: `AI diagnostic concerns are real: training data determines performance (if underrepresented groups are in training data, accuracy varies by population); unusual presentations may not match patterns; when AI errs, accountability is unclear; and clinical deskilling (over-reliance) is a genuine risk.`
  },
  {
    id: 36,
    type: "technology",
    skill: "Applying Environmental Technology",
    question: `Jamaica is developing more WIND FARMS to generate electricity. Which location assessment factors are MOST important?`,
    options: [
      "Wind farms should be built near schools",
      "Wind farms should be built underground",
      "Average wind speed and consistency (higher = more power), environmental impact assessment (bird migration routes, noise, visual impact), grid connectivity, and land tenure/community consent — multiple factors must be assessed simultaneously",
      "Only the cost of the turbines matters",
    ],
    correctAnswer: 2,
    explanation: `Wind farm siting is a multi-criteria problem: wind resource is the primary technical factor; environmental impact (birds, bats, noise, landscape) must be assessed; grid connection determines transmission costs; community and landowner engagement is essential for social licence. All must be satisfied.`
  },
  {
    id: 37,
    type: "technology",
    skill: "Applying Health Science",
    question: `ANTIBIOTIC RESISTANCE is one of the greatest global health threats. Which action MOST DIRECTLY contributes to resistance?`,
    options: [
      "Taking the full course of antibiotics as prescribed",
      "Using antibiotics only when prescribed by a doctor",
      "Stopping antibiotic treatment early when you feel better — surviving bacteria are those most resistant to the antibiotic; stopping early leaves these to multiply and develop full resistance",
      "Washing hands frequently",
    ],
    correctAnswer: 2,
    explanation: `Early termination of antibiotic courses is a key driver of resistance: when you feel better, most susceptible bacteria are dead, but a small number of more resistant bacteria remain. Stopping treatment allows these to survive and reproduce, creating a more resistant population in your body and potentially spreading resistant strains to others.`
  },
  {
    id: 38,
    type: "technology",
    skill: "Applying Data Analysis",
    question: `In a scientific study, the control group shows a 30% improvement in symptoms. The treatment group shows a 50% improvement. A newspaper reports the treatment as '50% effective.' Why is this report misleading?`,
    options: [
      "50% is an accurate description of effectiveness",
      "Newspapers always report science accurately",
      "The TRUE effect of the treatment is only 20% (50% − 30%) — the 30% improvement in the control group is the placebo/natural improvement. Reporting only the treatment group's improvement ignores what would have happened without treatment",
      "Control groups are irrelevant",
    ],
    correctAnswer: 2,
    explanation: `Without subtracting placebo/control group improvement, the treatment's ACTUAL benefit is overstated. The treatment provides 20% additional improvement above what would occur naturally or through placebo effect — a significant difference from the headline '50% effective.'`
  },
  {
    id: 39,
    type: "technology",
    skill: "Evaluating Technology",
    question: `GENETIC MODIFICATION of crops is controversial. Which argument FOR GM crops is scientifically STRONGEST?`,
    options: [
      "GM crops look more attractive",
      "GM companies always benefit communities",
      "Specific genetic modifications can provide concrete benefits: drought-resistant varieties reduce water use; pest-resistant varieties reduce pesticide use; nutritionally enhanced varieties (like Golden Rice with Vitamin A) address deficiency diseases — specific modifications with documented benefits",
      "GM crops always outperform conventional crops",
    ],
    correctAnswer: 2,
    explanation: `The pro-GM scientific case is most compelling when specific, targeted modifications address specific problems with documented evidence: drought resistance reduces water consumption; pest resistance reduces pesticide environmental impact; vitamin fortification addresses measurable nutritional deficits. The key is evaluating specific modifications on their evidence, not GM technology in general.`
  },
  {
    id: 40,
    type: "technology",
    skill: "Applying Scientific Method",
    question: `A student wants to test whether MUSIC TEMPO affects heart rate. Design the key elements of a FAIR TEST.`,
    options: [
      "Play random music and measure random things",
      "Only use one type of music",
      "Independent variable: music tempo (slow vs fast). Dependent variable: heart rate (beats per minute). Controls: same students tested for each, same listening volume, same time of day, same physical activity levels before testing. Multiple trials per student for reliability",
      "Only measure heart rate once",
    ],
    correctAnswer: 2,
    explanation: `Fair test design: identify the one variable to change (IV: tempo), what to measure (DV: heart rate), and what to keep constant (controls: all other factors). Multiple trials increase reliability. This design allows the conclusion to isolate tempo as the cause of any heart rate change.`
  }
]

const SECTION_CONFIG = [
  { type: "living" as const,     label: "Living Things",            note: "applying biology concepts, cause & effect in ecosystems, interpreting life processes" },
  { type: "physical" as const,   label: "Physical Science",         note: "applying physics and chemistry, interpreting data, problem-solving with forces and energy" },
  { type: "earth" as const,      label: "Earth Science",            note: "explaining earth processes, environmental cause & effect, interpreting weather and climate data" },
  { type: "technology" as const, label: "Science & Technology",     note: "applying scientific method, evaluating technology, health reasoning, environmental problem-solving" },
]

export default function G5ScMod4MockTest() {
  const { isPremium } = useAuth()
  const [started, setStarted]                 = useState(false)
  const [showResults, setShowResults]         = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers]                 = useState<(number | null)[]>([])
  const [timeLeft, setTimeLeft]               = useState(60 * 60)

  const availableQuestions = isPremium ? g5ScMod4Questions : g5ScMod4Questions.slice(0, FREE_QUESTION_LIMIT)
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
            <CardTitle className="text-2xl text-purple-800">Science Moderate 4</CardTitle>
            <p className="text-slate-600">Grade 5 PEP Science · Moderate Level</p>
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
              <h3 className="mb-2 font-semibold text-slate-800">Moderate Level Focus</h3>
              <p className="text-slate-700">This test requires applying scientific concepts — explaining cause and effect, interpreting data and observations, reasoning about processes, and connecting ideas across topics.</p>
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
              <p className="text-slate-600">Science Moderate 4</p>
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
            <div><h1 className="text-lg font-bold">Science Moderate 4</h1><p className="text-purple-100 text-xs">Question {currentQuestion + 1} of {totalQuestions}</p></div>
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
