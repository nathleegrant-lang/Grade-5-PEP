"use client"

import { useState, useEffect, useCallback } from "react"
import { saveStudentTestResult } from "@/lib/student-test-results"
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

const g5ScMod1Questions: Question[] = [
  {
    id: 1,
    type: "living",
    skill: "Cause & Effect",
    question: `A lake's population of frogs drops sharply. Which MOST LIKELY happens next in the food web?`,
    options: [
      "The lake becomes healthier",
      "Insects eaten by frogs increase dramatically, while birds and snakes that eat frogs decline",
      "Fish populations increase",
      "Plants die because frogs water them",
    ],
    correctAnswer: 1,
    explanation: `Removing a mid-chain consumer (frogs) causes a trophic cascade: their prey (insects) are released from predation and increase; their predators (birds, snakes) lose food and decline. Food webs are interconnected.`
  },
  {
    id: 2,
    type: "living",
    skill: "Applying Photosynthesis",
    question: `A plant is placed in a dark cupboard for a week. What happens to its chlorophyll content?`,
    options: [
      "It increases — plants make chlorophyll faster in the dark",
      "It stays exactly the same",
      "It decreases — without sunlight, plants cannot maintain chlorophyll production and leaves turn yellow",
      "It turns blue",
    ],
    correctAnswer: 2,
    explanation: `Without light, chlorophyll breaks down and is not replaced (it requires light to be synthesised). Leaves yellow (chlorosis) as chlorophyll degrades — a visible sign of light starvation.`
  },
  {
    id: 3,
    type: "living",
    skill: "Data Interpretation",
    question: `A student measures plant height every week for 6 weeks. In weeks 1-3, the plant grows 2 cm per week. In weeks 4-6, it grows only 0.5 cm per week. What is the MOST LIKELY explanation?`,
    options: [
      "The ruler broke",
      "The plant started disliking sunlight",
      "The plant may have run low on nutrients, water, or space — limiting factors slowing growth",
      "Plants always slow down after 3 weeks",
    ],
    correctAnswer: 2,
    explanation: `Growth rate depends on limiting factors — when any essential resource (light, water, nutrients, CO2) becomes scarce, growth slows. The change at week 4 suggests a resource became limiting.`
  },
  {
    id: 4,
    type: "living",
    skill: "Applying Genetics",
    question: `Two parents with brown eyes have a child with blue eyes. What does this tell us about the inheritance of eye colour?`,
    options: [
      "Brown eyes are always dominant",
      "This is impossible",
      "Blue eye colour can be inherited in a recessive pattern — both parents carried a hidden blue-eye gene (recessive allele) that the child received from both",
      "Parents can change their eye colour",
    ],
    correctAnswer: 2,
    explanation: `This classic genetics result demonstrates recessive inheritance: each parent has one dominant (brown) and one recessive (blue) allele. The child received the recessive allele from both parents, expressing blue eyes.`
  },
  {
    id: 5,
    type: "living",
    skill: "Applying Adaptation",
    question: `A scientist discovers a fish that lives in very deep, dark ocean water. Which adaptations would she EXPECT to find?`,
    options: [
      "Bright colours and small eyes",
      "No special adaptations",
      "Large eyes or bioluminescence (own light production), enhanced pressure tolerance, and slow metabolism — adaptations for a dark, cold, high-pressure, food-scarce environment",
      "Fast swimming speed and warm body temperature",
    ],
    correctAnswer: 2,
    explanation: `Deep-sea environments are dark, cold, high-pressure, and food-scarce. Fish adapted there typically have large light-sensitive eyes or generate their own bioluminescent light, tolerate extreme pressure, and have slow metabolisms to conserve energy.`
  },
  {
    id: 6,
    type: "living",
    skill: "Cause & Effect",
    question: `WHAT WOULD HAPPEN if all decomposers were removed from an ecosystem?`,
    options: [
      "Nothing would change",
      "Plants would grow faster",
      "Dead organic matter would accumulate and nutrients would NOT be returned to the soil — eventually plants would run out of nutrients and the ecosystem would collapse",
      "Animals would have more food",
    ],
    correctAnswer: 2,
    explanation: `Decomposers recycle nutrients. Without them: dead matter piles up undigested; nutrients are locked in dead tissue; soil becomes nutrient-poor; plants starve; the entire food chain collapses from the base.`
  },
  {
    id: 7,
    type: "living",
    skill: "Data Interpretation",
    question: `A student tests the effect of temperature on yeast fermentation by measuring CO2 produced in 10 minutes at 10°C, 20°C, 30°C, and 40°C. Results: 5 ml, 12 ml, 25 ml, 8 ml. What can she conclude?`,
    options: [
      "More CO2 is always produced at higher temperatures",
      "Temperature has no effect on fermentation",
      "Fermentation rate peaks around 30°C and decreases above that — enzyme activity increases with temperature up to an optimal point, then decreases as enzymes denature",
      "Yeast produce exactly the same CO2 at all temperatures",
    ],
    correctAnswer: 2,
    explanation: `This is a classic enzyme kinetics result. Rate increases with temperature to an optimum (30°C here) where enzyme shape is ideal. Above optimum, heat denatures enzymes, reducing activity. This is the bell-curve pattern.`
  },
  {
    id: 8,
    type: "living",
    skill: "Applying Ecology",
    question: `A farmer uses pesticides to kill insects on his crops. Why might bird populations near the farm ALSO decline?`,
    options: [
      "Birds eat only seeds",
      "Pesticides have no effect on birds",
      "Many birds eat insects as a food source — reducing insect populations reduces food availability for birds, leading to population decline through the food web",
      "Birds are directly killed by pesticides in all cases",
    ],
    correctAnswer: 2,
    explanation: `Biological magnification and food web effects: even if birds are not directly poisoned, eliminating their insect prey (either through direct poisoning or population reduction) depletes their food source, causing population decline.`
  },
  {
    id: 9,
    type: "living",
    skill: "Applying Human Biology",
    question: `A person runs a 400-metre race. During the race, their breathing rate and heart rate increase. WHY?`,
    options: [
      "To reduce carbon dioxide in the blood",
      "Because the race is exciting emotionally only",
      "Muscles working harder need more oxygen and produce more CO2 — faster breathing brings in more O2 and removes CO2; faster heart rate delivers oxygenated blood to muscles more quickly",
      "The person is afraid of the race",
    ],
    correctAnswer: 2,
    explanation: `Increased muscle activity demands more aerobic respiration — more O2 in, more CO2 out. The cardiovascular and respiratory systems respond together: heart beats faster to deliver oxygenated blood; lungs breathe faster to refresh oxygen and expel CO2.`
  },
  {
    id: 10,
    type: "living",
    skill: "Cause & Effect",
    question: `A coral reef ecosystem is struck by a bleaching event. Which cascade of effects is MOST LIKELY?`,
    options: [
      "The reef becomes more productive",
      "Nothing changes — coral reefs are very resilient",
      "Coral die → algae overgrow the reef → fish lose habitat and food → fish populations decline → fishing communities lose their livelihood",
      "Only the colour of the reef changes",
    ],
    correctAnswer: 2,
    explanation: `Bleaching kills the symbiotic algae that provide coral with nutrients and colour. Dead coral is colonised by algae, reducing habitat for reef fish. Fish decline harms the fishing communities and tourism that depend on healthy reefs.`
  },
  {
    id: 11,
    type: "physical",
    skill: "Applying Forces",
    question: `A heavy box rests on a table. A student pushes it horizontally but it doesn't move. Which statement is TRUE?`,
    options: [
      "No forces are acting on the box",
      "The pushing force is zero",
      "The pushing force is balanced by the friction force between the box and table — the net force is zero, so the box stays still",
      "Gravity is stronger than the push",
    ],
    correctAnswer: 2,
    explanation: `This demonstrates static friction: when a horizontal push doesn't move the box, static friction is equal and opposite to the applied force. Both forces balance (net force = 0), so the box remains stationary.`
  },
  {
    id: 12,
    type: "physical",
    skill: "Applying Energy",
    question: `A diver stands on a high platform, then jumps and hits the water. Describe the energy transformation.`,
    options: [
      "No energy transformation occurs",
      "All energy becomes sound",
      "Gravitational potential energy (from height) → kinetic energy (during fall) → sound and thermal energy (on hitting water, though much remains kinetic in water movement)",
      "Chemical energy converts to potential energy",
    ],
    correctAnswer: 2,
    explanation: `This is a multi-step energy transformation chain: height stores gravitational PE → falling converts PE to KE (increasing speed) → hitting water converts KE to sound waves, water movement, and heat. Energy is conserved — just transformed.`
  },
  {
    id: 13,
    type: "physical",
    skill: "Data Interpretation",
    question: `A student measures the extension of a spring when different weights are hung from it: 100g → 2cm, 200g → 4cm, 300g → 6cm, 400g → 8cm. What law does this illustrate and what would 500g produce?`,
    options: [
      "No pattern is visible — springs are unpredictable",
      "Springs always break under load",
      "Hooke's Law: extension is proportional to load. 500g would extend 10 cm (the pattern is 2cm per 100g)",
      "The extension would double at 500g to 16cm",
    ],
    correctAnswer: 2,
    explanation: `Hooke's Law: extension is directly proportional to force (within the elastic limit). The data shows a perfect 2cm per 100g relationship. Extrapolating: 500g → 10cm extension.`
  },
  {
    id: 14,
    type: "physical",
    skill: "Applying Electricity",
    question: `In a series circuit with three identical bulbs and a battery, one bulb burns out. What happens?`,
    options: [
      "Only that bulb goes dark",
      "The other two bulbs get brighter",
      "All three bulbs go out — there is only one current path in a series circuit; breaking it anywhere stops all current flow",
      "The battery is saved and the other bulbs last longer",
    ],
    correctAnswer: 2,
    explanation: `Series circuit topology: all components share one current path. If any component creates an open circuit (burns out), current cannot flow through ANY part of the circuit. All bulbs go dark.`
  },
  {
    id: 15,
    type: "physical",
    skill: "Applying Waves",
    question: `WHY does sound travel FASTER through STEEL than through AIR?`,
    options: [
      "Steel has more oxygen which helps sound",
      "Steel produces its own vibrations",
      "In steel, atoms are tightly bonded and closely packed — vibrations are transmitted from atom to atom very quickly. Air molecules are far apart and interact weakly, so vibrations transmit slowly",
      "Steel is heavier which slows airwaves",
    ],
    correctAnswer: 2,
    explanation: `Sound speed depends on the medium's elasticity and density. In solids like steel, atoms are closely bonded — vibrations pass very efficiently between atoms. In air, molecules are far apart and collisions (vibration transfer) are infrequent and inefficient.`
  },
  {
    id: 16,
    type: "physical",
    skill: "Applying Changes of State",
    question: `WHY does sweating cool the human body?`,
    options: [
      "Sweat is cold and cools the skin",
      "The salt in sweat absorbs heat",
      "Evaporation is an endothermic process — when sweat evaporates from skin, it absorbs heat energy from the skin's surface, cooling it",
      "Sweating removes excess body fat",
    ],
    correctAnswer: 2,
    explanation: `Evaporative cooling: converting liquid sweat to water vapour requires energy (latent heat of vaporisation). This energy comes from the skin surface, removing heat and lowering skin temperature — an efficient thermoregulation mechanism.`
  },
  {
    id: 17,
    type: "physical",
    skill: "Data Interpretation",
    question: `A student shines light through different materials and measures the light transmitted: clear glass — 90%, frosted glass — 45%, cardboard — 5%, black paint — 0%. What does this data show?`,
    options: [
      "All materials transmit the same amount of light",
      "Light cannot pass through any solid",
      "Materials differ in their transparency: clear glass is nearly transparent; frosted glass is translucent (scatters light); cardboard is nearly opaque; black paint is completely opaque (absorbs all light)",
      "The measurements are incorrect",
    ],
    correctAnswer: 2,
    explanation: `The data illustrates the spectrum of light transmission: transparent (clear glass — lets most light through), translucent (frosted glass — lets some through but scatters it), opaque (cardboard — absorbs/reflects most), and completely opaque (black paint — absorbs 100%).`
  },
  {
    id: 18,
    type: "physical",
    skill: "Applying Magnetism",
    question: `An electromagnet is created by wrapping wire around an iron nail and connecting to a battery. How can you INCREASE the strength of the electromagnet?`,
    options: [
      "Use a rubber nail instead of iron",
      "Reduce the number of wire coils",
      "Increase the number of wire coils OR increase the current — both increase the magnetic field strength",
      "Use thinner wire",
    ],
    correctAnswer: 2,
    explanation: `Electromagnet strength depends on: number of coils (more coils = stronger field), current strength (more current = stronger field), and core material (iron is much better than air). Increasing either coils or current strengthens the magnet.`
  },
  {
    id: 19,
    type: "physical",
    skill: "Applying Simple Machines",
    question: `A lever has a load of 200N located 1 m from the fulcrum. To balance it, where should a 100N effort force be placed?`,
    options: [
      "0.5 m from the fulcrum on the same side as the load",
      "1 m from the fulcrum on the load side",
      "2 m from the fulcrum on the effort side — using the principle of moments: load × load distance = effort × effort distance (200×1 = 100×2)",
      "Any position works",
    ],
    correctAnswer: 2,
    explanation: `Principle of Moments: clockwise moment = anticlockwise moment for equilibrium. 200N × 1m = 100N × d → d = 2m. The effort must be placed 2m from the fulcrum on the opposite side.`
  },
  {
    id: 20,
    type: "physical",
    skill: "Applying Physics",
    question: `A student pushes a shopping trolley with force F and it accelerates at rate a. If she pushes with twice the force (2F), what happens to the acceleration (assuming friction is constant)?`,
    options: [
      "The acceleration halves",
      "The acceleration stays the same",
      "The acceleration doubles (2a) — Newton's Second Law: acceleration is proportional to net force for a given mass",
      "The acceleration quadruples",
    ],
    correctAnswer: 2,
    explanation: `Newton's Second Law: F = ma, so a = F/m. If F doubles and m is constant, a doubles. This is the direct proportionality between force and acceleration at constant mass.`
  },
  {
    id: 21,
    type: "earth",
    skill: "Cause & Effect",
    question: `Scientists measure that average global sea surface temperatures have risen by 1°C over the past century. Which ecological consequence would this MOST DIRECTLY cause?`,
    options: [
      "Sea temperature has no biological effects",
      "Fish populations would all increase",
      "Coral bleaching — warmer waters cause corals to expel their symbiotic algae, turning white and starving. Continued warmth leads to coral death, destroying reef ecosystems and the marine biodiversity that depends on them",
      "All marine life benefits from warmer water",
    ],
    correctAnswer: 2,
    explanation: `Coral bleaching is directly triggered by water temperatures just 1-2°C above the seasonal maximum sustained for several weeks. This demonstrates how even small average temperature changes have devastating biological consequences for temperature-sensitive organisms.`
  },
  {
    id: 22,
    type: "earth",
    skill: "Applying Geology",
    question: `LIMESTONE CAVES (like the Green Grotto Caves in Jamaica) form through:`,
    options: [
      "Volcanic activity melting rock",
      "Earthquakes splitting the rock",
      "Dissolution of limestone by slightly acidic rainwater over thousands of years — rainwater absorbs CO2 forming carbonic acid, which slowly dissolves the calcium carbonate in limestone, creating underground cavities",
      "Rivers physically cutting through rock",
    ],
    correctAnswer: 2,
    explanation: `Karst landscape formation: rainwater + CO2 → carbonic acid (H2CO3). This weak acid dissolves calcium carbonate (CaCO3) in limestone, gradually creating underground channels, caverns, and caves over geological timescales.`
  },
  {
    id: 23,
    type: "earth",
    skill: "Data Interpretation",
    question: `A meteorologist records rainfall data for Kingston: Jan-Apr = 15mm, May = 98mm, Jun = 157mm, Jul = 91mm, Aug = 182mm, Sep = 168mm, Oct = 195mm, Nov = 148mm, Dec = 36mm. What pattern does this show?`,
    options: [
      "Rainfall is constant throughout the year",
      "Most rain falls in January",
      "A clear wet season (May-November) and dry season (December-April) — Jamaica's tropical climate with two annual rainfall peaks (May-June and August-November) typical of the Caribbean",
      "Rainfall peaks in winter months",
    ],
    correctAnswer: 2,
    explanation: `Jamaica has a bimodal tropical climate: two wet season peaks (May-June and September-November) with a dry season from December to April. This pattern is driven by the annual migration of the ITCZ (Intertropical Convergence Zone) and hurricane season.`
  },
  {
    id: 24,
    type: "earth",
    skill: "Applying Rock Cycle",
    question: `A geologist identifies rock that has large visible crystals of quartz, feldspar, and mica, with a coarse-grained texture. This is MOST LIKELY:`,
    options: [
      "Basalt (extrusive igneous)",
      "Limestone (sedimentary)",
      "Slate (metamorphic)",
      "Granite (intrusive igneous) — coarse crystals indicate slow cooling deep underground, giving crystals time to grow",
    ],
    correctAnswer: 3,
    explanation: `Crystal size indicates cooling rate: slow cooling (deep underground, intrusive) → large crystals (coarse-grained). Granite is the classic intrusive igneous rock. Basalt (extrusive, rapid cooling) has tiny crystals. This is how rock cooling history is read from crystal size.`
  },
  {
    id: 25,
    type: "earth",
    skill: "Applying Weather",
    question: `A pilot flying at high altitude notices the outside temperature is -50°C despite the ground temperature being 25°C. WHY does temperature decrease with altitude?`,
    options: [
      "The sun only heats the ground",
      "Cold air is heavier and falls to high altitudes",
      "The atmosphere is heated from below by Earth's surface (which absorbs solar radiation) rather than directly by the sun — so temperature decreases with distance from the surface heat source",
      "Air conditioners cool the upper atmosphere",
    ],
    correctAnswer: 2,
    explanation: `The troposphere is heated from the bottom: solar radiation passes through and heats Earth's surface; the surface radiates heat upward, warming the air above it. The farther from the surface, the less heating, so temperature decreases with altitude (the environmental lapse rate ≈ 6.5°C per 1000m).`
  },
  {
    id: 26,
    type: "earth",
    skill: "Applying Ocean Science",
    question: `Ocean CURRENTS are important to climate because they:`,
    options: [
      "Have no effect on climate",
      "Only affect ocean temperatures",
      "Transfer heat from equatorial regions (warm) to polar regions (cool) and vice versa, moderating temperatures in coastal regions and affecting weather patterns globally",
      "Only affect sailors",
    ],
    correctAnswer: 2,
    explanation: `Ocean currents are essentially a global heat redistribution system: warm equatorial currents carry heat poleward (moderating cold climates like northwest Europe); cold polar currents move equatorward (cooling tropical coastal regions). This fundamentally shapes regional climates.`
  },
  {
    id: 27,
    type: "earth",
    skill: "Data Interpretation",
    question: `A student measures soil temperature at different depths: surface = 35°C, 10cm depth = 28°C, 30cm depth = 22°C, 50cm depth = 18°C. What pattern is shown?`,
    options: [
      "Soil temperature increases with depth",
      "Temperature is constant at all depths",
      "Soil temperature decreases with depth — the surface is directly heated by solar radiation; deeper soil is insulated from surface temperature changes and is cooler and more stable",
      "Soil temperature is random",
    ],
    correctAnswer: 2,
    explanation: `Soil temperature follows the surface temperature but with increasing lag and damping with depth. The surface is directly affected by solar radiation; deeper layers are thermally insulated and reach lower equilibrium temperatures. This is why deep soil is cooler in summer.`
  },
  {
    id: 28,
    type: "earth",
    skill: "Applying Environmental Science",
    question: `Jamaica's north coast receives significantly more rainfall than its south coast despite similar latitudes. What is the GEOGRAPHICAL explanation?`,
    options: [
      "The north coast is closer to the sea",
      "The south coast has more trees",
      "The Blue Mountains act as a barrier to trade winds — moist air from the northeast is forced to rise, cooling and releasing rain on the windward (north) slopes. The leeward (south) side is in a rain shadow",
      "The north coast has more rivers",
    ],
    correctAnswer: 2,
    explanation: `Jamaica's main rain shadow: the Blue Mountains intercept northeast trade winds. Moist air rises, cools, and rains on north-facing slopes. After crossing the ridge, the air descends and warms (Foehn effect) — the south receives much less rainfall.`
  },
  {
    id: 29,
    type: "earth",
    skill: "Applying Geology",
    question: `Which sequence of events correctly describes the ROCK CYCLE from ocean sediment to mountain?`,
    options: [
      "Igneous → metamorphic → sedimentary",
      "Mountain formation is random and unrelated to rock type",
      "Sediment deposited in ocean → compressed into sedimentary rock → subducted under a plate boundary and subjected to heat and pressure → becomes metamorphic rock → if melted, becomes magma → igneous rock when it solidifies",
      "Only volcanic activity creates mountains",
    ],
    correctAnswer: 2,
    explanation: `The rock cycle: ocean sediment compresses → sedimentary rock → subduction carries it deep into the crust → heat and pressure metamorphose it → if melted, becomes magma → if erupted, becomes igneous. Over millions of years, tectonic collision can uplift these rocks into mountains.`
  },
  {
    id: 30,
    type: "earth",
    skill: "Cause & Effect",
    question: `A city replaces natural land with concrete and asphalt (urban development). Explain the hydrological consequences.`,
    options: [
      "Urban surfaces absorb more water than natural land",
      "Urban development has no effect on water flow",
      "Impermeable surfaces prevent infiltration — rainfall runs off quickly into drains and rivers rather than soaking into the ground. This increases flood risk (more water in rivers faster) and reduces groundwater recharge (less water soaking into aquifers)",
      "Only deserts have these problems",
    ],
    correctAnswer: 2,
    explanation: `Urban hydrology: concrete and asphalt are impermeable. Natural land allows infiltration (water soaks in), reducing runoff and recharging groundwater. Urban areas have higher runoff (faster flood response, higher peak flows) and lower groundwater recharge — altering the entire water balance.`
  },
  {
    id: 31,
    type: "technology",
    skill: "Applying Scientific Method",
    question: `A student hypothesises: 'Plants grow faster with music.' She plays classical music to Group A and no music to Group B, but accidentally waters Group A more. Her results show Group A grows taller. What is WRONG with her conclusion that 'music helps plants grow'?`,
    options: [
      "The conclusion is correct",
      "Only one group is enough for a valid test",
      "The experiment was not a fair test — two variables changed (music AND water). The improved growth could be due to the extra water, not the music. She cannot isolate the effect of music alone",
      "Music definitely helps plants grow",
    ],
    correctAnswer: 2,
    explanation: `Fair testing: only one variable should change (the independent variable) while all others are controlled. Changing two variables makes it impossible to determine which caused the effect. This is a fatal methodological flaw.`
  },
  {
    id: 32,
    type: "technology",
    skill: "Applying Health Science",
    question: `A patient is told her blood cholesterol level is dangerously high. Her doctor explains this increases her risk of cardiovascular disease. WHY does high cholesterol increase this risk?`,
    options: [
      "Cholesterol makes blood thicker only",
      "Cholesterol only affects the kidneys",
      "High LDL cholesterol deposits plaques in artery walls (atherosclerosis), narrowing them and reducing blood flow. This can lead to angina (chest pain), heart attacks (blocked coronary artery), or strokes (blocked brain artery)",
      "High cholesterol only affects diet",
    ],
    correctAnswer: 2,
    explanation: `Atherosclerosis mechanism: LDL ('bad') cholesterol infiltrates damaged artery walls and oxidises, triggering an inflammatory response that builds plaques. These narrow and harden arteries, restricting blood flow and creating clots that can completely block vessels — causing heart attacks and strokes.`
  },
  {
    id: 33,
    type: "technology",
    skill: "Evaluating Technology",
    question: `A student evaluates whether PLASTIC BAGS should be banned in Jamaica. Which argument MOST STRONGLY supports a ban?`,
    options: [
      "Plastic bags are inconvenient",
      "Most people dislike plastic bags",
      "Single-use plastic bags take hundreds of years to degrade — they break into microplastics that contaminate soil, water, and food chains, accumulate in marine animals, and block drains increasing flood risk. Their convenience is brief; their environmental harm is perpetual",
      "Plastic bags are expensive",
    ],
    correctAnswer: 2,
    explanation: `The cost-benefit case for plastic bag bans: one-time use for minutes; environmental persistence for hundreds of years. They block drains (causing flooding), harm marine wildlife, break into microplastics (entering food chains including human food), and are visible pollution. Alternatives (reusable bags) are widely available.`
  },
  {
    id: 34,
    type: "technology",
    skill: "Applying Data Analysis",
    question: `A scientist tests whether a new drug reduces blood pressure. Group A (100 patients) receives the drug; Group B (100 patients) receives a placebo. Blood pressure drops 15 mmHg in Group A and 5 mmHg in Group B. What is the drug's ACTUAL effect beyond placebo?`,
    options: [
      "15 mmHg — the full amount",
      "0 mmHg — placebos always explain results",
      "10 mmHg — the drug's effect is the difference between drug group and placebo group (15-5=10 mmHg). The placebo effect accounts for 5 mmHg",
      "5 mmHg",
    ],
    correctAnswer: 2,
    explanation: `Placebo-controlled trials: the placebo group shows how much improvement occurs without the drug (5 mmHg here — possibly due to expectation, regression to mean, or lifestyle changes). The drug's TRUE effect = drug group improvement − placebo group improvement = 15 − 5 = 10 mmHg.`
  },
  {
    id: 35,
    type: "technology",
    skill: "Applying Environmental Science",
    question: `A student researches which type of LIGHTBULB to recommend for a school. She compares three types based on energy use and lifespan: Incandescent: 60W, 1,000 hours; CFL: 14W, 8,000 hours; LED: 10W, 25,000 hours. Which BEST recommendation can she make?`,
    options: [
      "Incandescent — they are the brightest",
      "CFLs — middle option is always best",
      "LED bulbs — they use the least energy (10W vs 60W) AND last the longest (25,000 hours vs 1,000) — providing the lowest long-term cost and environmental impact despite higher purchase price",
      "All three are equally good",
    ],
    correctAnswer: 2,
    explanation: `Multi-variable decision analysis: LED bulbs use 83% less energy than incandescent and last 25× longer. Despite higher upfront cost, lifetime cost (purchase + energy) is dramatically lower. For institutional use (schools), LEDs provide the best return on investment and lowest environmental impact.`
  },
  {
    id: 36,
    type: "technology",
    skill: "Applying Scientific Method",
    question: `A scientist discovers that a new vaccine reduces disease X by 90% in clinical trials. Journalists report this as 'the cure for disease X.' What is WRONG with this characterisation?`,
    options: [
      "90% is not enough to report",
      "The journalists are approximately correct",
      "'Reducing cases by 90%' is not the same as a 'cure' — vaccines prevent disease in susceptible people; they cannot treat already-infected patients. Also, 10% of cases still occur. Precision in scientific language matters",
      "Vaccines and cures are identical things",
    ],
    correctAnswer: 2,
    explanation: `Scientific literacy: a vaccine is prophylactic (prevents disease in uninfected people); a cure treats already-infected patients. '90% reduction' means 10% of cases still occur — not eliminated. Journalistic imprecision in reporting scientific results misleads the public.`
  },
  {
    id: 37,
    type: "technology",
    skill: "Evaluating Technology",
    question: `Insulin used to be extracted from pig and cow pancreases for diabetic patients. Today, it is produced by genetically modified BACTERIA. What advantages does bacterial insulin production offer?`,
    options: [
      "Bacterial insulin is always cheaper",
      "Animal insulin is better",
      "Bacterial production can generate unlimited quantities without depending on animal slaughter; the human insulin gene produces insulin identical to the human version (reducing immune reactions); and large-scale fermentation is efficient and scalable",
      "There are no advantages to bacterial production",
    ],
    correctAnswer: 2,
    explanation: `Recombinant insulin (produced by E. coli with the human insulin gene) offers: unlimited supply (bacteria reproduce rapidly), human-identical sequence (reducing immune reactions that animal insulin sometimes caused), lower cost at scale, and elimination of ethical concerns about animal use.`
  },
  {
    id: 38,
    type: "technology",
    skill: "Applying Health Science",
    question: `During the COVID-19 pandemic, HANDWASHING, MASKS, and SOCIAL DISTANCING were recommended. WHY do these non-pharmaceutical measures reduce transmission?`,
    options: [
      "They are only psychological measures",
      "They only help immunocompromised people",
      "They physically interrupt transmission pathways: handwashing removes virus from hands before it can be transferred to mucous membranes; masks filter exhaled and inhaled respiratory droplets; social distancing reduces the probability of droplet contact between people",
      "Only vaccines can reduce COVID-19 transmission",
    ],
    correctAnswer: 2,
    explanation: `Non-pharmaceutical interventions work by interrupting the chain of transmission at multiple points: hand hygiene (contact transmission), masks (respiratory droplet transmission), and distancing (reducing droplet reach and concentration). Multiple simultaneous measures multiply effectiveness.`
  },
  {
    id: 39,
    type: "technology",
    skill: "Applying Environmental Technology",
    question: `A Jamaican school switches from fuel oil heating to SOLAR WATER HEATERS. Calculate the approximate annual CO2 saving if the school previously burned 2,000 litres of oil (burning 1 litre releases approximately 2.6 kg of CO2).`,
    options: [
      "200 kg CO2",
      "260 kg CO2",
      "5,200 kg CO2 (2,000 litres × 2.6 kg/litre) — solar water heating produces no direct CO2 emissions",
      "52,000 kg CO2",
    ],
    correctAnswer: 2,
    explanation: `Annual CO2 saving = fuel volume × emission factor = 2,000 L × 2.6 kg/L = 5,200 kg CO2 (5.2 tonnes). This calculation shows the meaningful climate benefit of switching from fossil fuel heating to solar — even for a single school building.`
  },
  {
    id: 40,
    type: "technology",
    skill: "Applying Scientific Method",
    question: `A scientist claims to have discovered a CURE for cancer. Before accepting this claim, which questions should other scientists ask?`,
    options: [
      "Nothing — scientists are always trustworthy",
      "Only whether the scientist is famous",
      "Was the study peer-reviewed? What was the sample size? Was there a control group? Can other labs replicate the results? What types of cancer were tested? What are the side effects?",
      "Only whether the drug is cheap",
    ],
    correctAnswer: 2,
    explanation: `Scientific scepticism requires multiple quality checks: peer review (independent expert evaluation), adequate sample size (statistical power), controlled comparison (without controls, no causal claim is valid), replication (independent confirmation), scope (which cancers?), and safety profile. A single study is never sufficient for a major medical claim.`
  }
]

const SECTION_CONFIG = [
  { type: "living" as const,     label: "Living Things",            note: "applying biology concepts, cause & effect in ecosystems, interpreting life processes" },
  { type: "physical" as const,   label: "Physical Science",         note: "applying physics and chemistry, interpreting data, problem-solving with forces and energy" },
  { type: "earth" as const,      label: "Earth Science",            note: "explaining earth processes, environmental cause & effect, interpreting weather and climate data" },
  { type: "technology" as const, label: "Science & Technology",     note: "applying scientific method, evaluating technology, health reasoning, environmental problem-solving" },
]

export default function G5ScMod1MockTest() {
  const { isPremium, user } = useAuth()
  const [started, setStarted]                 = useState(false)
  const [showResults, setShowResults]         = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers]                 = useState<(number | null)[]>([])
  const [timeLeft, setTimeLeft]               = useState(60 * 60)

  const availableQuestions = isPremium ? g5ScMod1Questions : g5ScMod1Questions.slice(0, FREE_QUESTION_LIMIT)
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

  const handleSubmit = async () => {
    setShowResults(true)

    if (!user?.id) return

    try {
      await saveStudentTestResult({
        parentId: user.id,
        studentName: user?.childName ?? "Student",
        grade: "grade5",
        subject: "Science",
        testName: "Moderate 1",
        difficulty: "Moderate",
        score: calcScore(),
        totalQuestions,
        percentage: scorePct(),
        completedAt: new Date().toISOString(),
      })
    } catch (error) {
      console.error("Failed to save test result:", error)
    }
  }

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
            <CardTitle className="text-2xl text-purple-800">Science Moderate 1</CardTitle>
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
              <p className="text-slate-600">Science Moderate 1</p>
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
            <div><h1 className="text-lg font-bold">Science Moderate 1</h1><p className="text-purple-100 text-xs">Question {currentQuestion + 1} of {totalQuestions}</p></div>
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
              ? <Button onClick={handleSubmit} className="bg-purple-700 hover:bg-purple-800"><Flag className="h-4 w-4 mr-2" />Submit Test</Button>
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
