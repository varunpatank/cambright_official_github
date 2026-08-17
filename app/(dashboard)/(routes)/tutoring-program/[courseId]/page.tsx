"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { notFound, useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft, Video, FileText, Sparkles, Mail, ArrowRight,
  Star, ChevronLeft, ChevronRight, ZoomIn, X, Maximize2,
  Lightbulb, BookOpen, AlertCircle,
} from "lucide-react";
import { StarsBackground } from "@/components/ui/shooting-stars";
import { COURSES } from "../_data";

interface VideoLocal  { kind: "video-local"; label: string; src: string }
interface VideoDrive  { kind: "video-drive"; label: string; fileId: string }
interface PdfLocal    { kind: "pdf-local";   label: string; src: string;    desc?: string }
interface PdfDrive    { kind: "pdf-drive";   label: string; fileId: string; desc?: string }
interface FactCard    { color: string; title: string; body: string }
interface Formula     { label: string; expr: string }
interface ChapterContent {
  intro: string;
  facts: FactCard[];
  formulas?: Formula[];
  keyPoints: string[];
  examTips: string[];
}
interface ChapterMat {
  kind: "chapter"; num: string; title: string;
  img?: string; pdf?: string; content?: ChapterContent;
  video?: VideoLocal | VideoDrive;
}
type Material = VideoLocal | VideoDrive | PdfLocal | PdfDrive | ChapterMat;
interface CourseDetail {
  description: string; shoutout?: string;
  overviewVideo?: VideoLocal | VideoDrive;
  driveFolder?: string;
  materials: Material[];
}

const MATH_CHAPTERS: ChapterMat[] = [
  {
    kind: "chapter",
    num: "2.1",
    title: "Introduction to Algebra",
    content: {
      intro: "Algebra uses letters (variables) to represent unknown or changing quantities, letting us write general rules and solve any problem regardless of specific numbers.",
      facts: [
        { color: "#3b82f6", title: "Variables & Expressions", body: "A variable is a letter for an unknown. An expression combines variables, numbers and operations: 3x + 2y - 5. No equals sign." },
        { color: "#8b5cf6", title: "Substitution", body: "Replace each variable with its value and evaluate. If x=4 and y=2: 3x - y = 3(4) - 2 = 10." },
        { color: "#06b6d4", title: "Like Terms", body: "Terms with SAME variable AND power are like terms. 5x and 3x can add to 8x. But 5x and 3x^2 cannot." },
        { color: "#10b981", title: "Translating Words", body: "Five more than twice a number = 2n+5. Product of consecutive integers = n(n+1). Practice translating every day." },
      ],
      keyPoints: [
        "Collect like terms by adding/subtracting coefficients",
        "The coefficient of x in 7x is 7",
        "Constants have no variable",
        "BIDMAS: Brackets, Indices, Division, Multiplication, Addition, Subtraction",
      ],
      examTips: [
        "Always show substitution step by step",
        "Watch signs when subtracting expressions",
        "Re-read word problems to check your expression matches",
      ],
    },
  },
  {
    kind: "chapter",
    num: "2.2",
    title: "Algebraic Manipulation",
    content: {
      intro: "Expanding brackets and factorising are two sides of the same coin. Mastering both gives you the power to simplify and rearrange any algebraic expression.",
      facts: [
        { color: "#ef4444", title: "Expanding Single Brackets", body: "Multiply every term inside by what is outside. a(b+c) = ab+ac. Example: 3(2x-5) = 6x-15." },
        { color: "#f59e0b", title: "Expanding Double Brackets", body: "(a+b)(c+d) = ac+ad+bc+bd (FOIL). Example: (x+3)(x-2) = x^2 - 2x + 3x - 6 = x^2 + x - 6." },
        { color: "#8b5cf6", title: "Difference of Two Squares", body: "a^2 - b^2 = (a+b)(a-b). So x^2 - 25 = (x+5)(x-5). Recognise this pattern instantly." },
        { color: "#06b6d4", title: "Factorising", body: "Take out the HCF first: 6x^2 + 9x = 3x(2x+3). For quadratics: find two numbers multiplying to c and adding to b." },
      ],
      formulas: [
        { label: "Perfect square", expr: "(a+b)^2 = a^2 + 2ab + b^2" },
        { label: "Difference of squares", expr: "a^2 - b^2 = (a+b)(a-b)" },
        { label: "Factoring quadratic", expr: "x^2 + (p+q)x + pq = (x+p)(x+q)" },
      ],
      keyPoints: [
        "Always expand fully before collecting",
        "Check factorisation by re-expanding",
        "HCF of both coefficients AND variables",
        "Perfect squares appear often - memorise the pattern",
      ],
      examTips: [
        "Show every expansion step",
        "If stuck factorising use the product-sum method",
        "Perfect squares: when b^2 = 4ac in x^2+bx+c",
      ],
    },
  },
  {
    kind: "chapter",
    num: "2.3",
    title: "Indices",
    content: {
      intro: "Indices (powers/exponents) are shorthand for repeated multiplication. Six laws govern all index work - learn them and simplification becomes automatic.",
      facts: [
        { color: "#3b82f6", title: "Multiplication Law", body: "Same base: ADD the powers. a^m x a^n = a^(m+n). Example: x^3 x x^5 = x^8. The base must match." },
        { color: "#10b981", title: "Division Law", body: "Same base: SUBTRACT the powers. a^m / a^n = a^(m-n). Example: x^7 / x^2 = x^5." },
        { color: "#f59e0b", title: "Zero and Negative Powers", body: "Any base to power 0 = 1. Negative index means reciprocal: a^(-n) = 1/a^n. So 2^(-3) = 1/8." },
        { color: "#8b5cf6", title: "Fractional Indices", body: "a^(1/n) = nth root of a. a^(m/n) = (nth root of a)^m. So 8^(2/3) = (cube root 8)^2 = 4." },
        { color: "#ef4444", title: "Standard Form", body: "A x 10^n where 1 <= A < 10. 0.000043 = 4.3 x 10^(-5). 5,600,000 = 5.6 x 10^6." },
      ],
      formulas: [
        { label: "Power law", expr: "(a^m)^n = a^(mn)" },
        { label: "Product to power", expr: "(ab)^n = a^n b^n" },
        { label: "Fractional index", expr: "a^(m/n) = (n-th root of a)^m" },
      ],
      keyPoints: [
        "Laws only apply when the BASE is the same",
        "a^0 = 1 for any non-zero a",
        "To multiply standard form: multiply A values, add powers of 10",
        "Scientific calculators: use EXP or x10^x button",
      ],
      examTips: [
        "Write out the law before applying it",
        "Convert negative indices to fractions in final answer",
        "Standard form: power tells you decimal shift direction",
      ],
    },
  },
  {
    kind: "chapter",
    num: "2.4",
    title: "Equations",
    content: {
      intro: "An equation states two expressions are equal. Solving means finding the value(s) of the unknown that make the equation true - a fundamental skill for all of mathematics.",
      facts: [
        { color: "#06b6d4", title: "Linear Equations", body: "Highest power is 1. Isolate the unknown using inverse operations. 3x+7=22 gives 3x=15 so x=5. Always balance both sides." },
        { color: "#8b5cf6", title: "Quadratic Equations", body: "Highest power is 2. Three methods: factorising, completing the square, or the quadratic formula. Check discriminant first." },
        { color: "#10b981", title: "Simultaneous Equations", body: "Two equations, two unknowns. Elimination: add/subtract to remove one variable. Substitution: express one variable in terms of other." },
        { color: "#f59e0b", title: "Equations with Fractions", body: "Multiply both sides by LCM of denominators to clear fractions, then solve as a normal equation." },
      ],
      formulas: [
        { label: "Quadratic formula", expr: "x = (-b +/- sqrt(b^2 - 4ac)) / 2a" },
        { label: "Discriminant", expr: "Delta = b^2 - 4ac  (>0: two roots, =0: one root, <0: no real roots)" },
      ],
      keyPoints: [
        "Whatever you do to one side, do to the other",
        "Quadratic formula always works even when factorising is hard",
        "Label simultaneous equations (1) and (2)",
        "Always check solutions by substituting back in",
      ],
      examTips: [
        "Show all steps clearly - method marks available",
        "For simultaneous equations show which equation you subtract/add",
        "State final answer as x = ... not just a number",
      ],
    },
  },
  {
    kind: "chapter",
    num: "2.5",
    title: "Inequalities",
    content: {
      intro: "Inequalities express a range of values. They are solved like equations with one critical difference: the inequality sign flips when you multiply or divide by a negative number.",
      facts: [
        { color: "#ef4444", title: "The Golden Rule", body: "When multiplying or dividing BOTH sides by a NEGATIVE, flip the sign. -2x < 6 becomes x > -3 (sign flipped)." },
        { color: "#3b82f6", title: "Number Line Notation", body: "Open circle for strict < or >. Closed circle for <= or >=. Arrow points toward the solution set." },
        { color: "#10b981", title: "Double Inequalities", body: "Solve all three parts simultaneously. For 3 < 2x+1 <= 9: subtract 1 from all parts, then divide all by 2." },
        { color: "#f59e0b", title: "Integer Solutions", body: "List every whole number in the solution range. For 1 < x <= 4, the integers are 2, 3, 4." },
      ],
      keyPoints: [
        "Treat exactly like an equation EXCEPT the sign-flip rule",
        "Always check with a test value",
        "Quadratic inequalities: sketch parabola to find solution region",
        "Set notation: {x : x > 3}",
      ],
      examTips: [
        "Show explicitly when you flip the sign",
        "Substitute a test value to verify",
        "For integer solutions write as a list, not just the inequality",
      ],
    },
  },
  {
    kind: "chapter",
    num: "2.6",
    title: "Sequences",
    content: {
      intro: "A sequence is a list of numbers following a rule. IGCSE focuses on arithmetic (constant difference) and geometric (constant ratio) sequences, and finding the nth term formula.",
      facts: [
        { color: "#8b5cf6", title: "Arithmetic Sequences", body: "Constant difference d between terms. First term a. nth term = a + (n-1)d. Sum of n terms = n/2 x (2a + (n-1)d)." },
        { color: "#06b6d4", title: "Geometric Sequences", body: "Constant ratio r between terms. nth term = a x r^(n-1). Example: 2, 6, 18, 54... a=2, r=3, 5th term = 2x3^4 = 162." },
        { color: "#10b981", title: "Finding nth Term", body: "For linear pattern: nth term = dn+c. Find d (common difference), then substitute n=1 to find c. For 5, 8, 11, 14: d=3, 3(1)+c=5 so c=2, giving 3n+2." },
        { color: "#f59e0b", title: "Special Sequences", body: "Squares: 1,4,9,16... nth = n^2. Cubes: 1,8,27... nth = n^3. Triangular: 1,3,6,10... nth = n(n+1)/2." },
      ],
      formulas: [
        { label: "Arithmetic nth term", expr: "u_n = a + (n-1)d" },
        { label: "Geometric nth term", expr: "u_n = a x r^(n-1)" },
        { label: "Arithmetic sum", expr: "S_n = n/2 x (2a + (n-1)d)" },
      ],
      keyPoints: [
        "Always verify your formula for n=1, 2, 3",
        "Arithmetic: add/subtract. Geometric: multiply/divide",
        "For quadratic sequences check second differences",
        "Term number n always starts at 1",
      ],
      examTips: [
        "Write first differences to identify arithmetic sequences",
        "Common error: formula gives VALUE, not position",
        "If given a sum, rearrange to find n",
      ],
    },
  },
  {
    kind: "chapter",
    num: "2.7",
    title: "Graphs",
    content: {
      intro: "Coordinate geometry uses algebra to describe geometric shapes. Mastering straight-line graphs, gradients and distances is essential foundation for all curve work ahead.",
      facts: [
        { color: "#3b82f6", title: "Gradient", body: "Steepness = rise/run = (y2-y1)/(x2-x1). Positive: line goes up. Negative: goes down. Horizontal: gradient = 0. Vertical: undefined." },
        { color: "#8b5cf6", title: "Equation of a Line", body: "y = mx + c. m = gradient, c = y-intercept. Given two points: find m first, then substitute one point to find c." },
        { color: "#ef4444", title: "Parallel and Perpendicular", body: "Parallel: equal gradients. Perpendicular: m1 x m2 = -1. If m=3, perpendicular gradient = -1/3." },
        { color: "#10b981", title: "Distance and Midpoint", body: "Distance = sqrt((x2-x1)^2 + (y2-y1)^2). Midpoint = ((x1+x2)/2, (y1+y2)/2). Both from Pythagoras." },
      ],
      formulas: [
        { label: "Gradient", expr: "m = (y2 - y1) / (x2 - x1)" },
        { label: "Line equation", expr: "y - y1 = m(x - x1)" },
        { label: "Distance", expr: "d = sqrt((x2-x1)^2 + (y2-y1)^2)" },
        { label: "Midpoint", expr: "M = ((x1+x2)/2, (y1+y2)/2)" },
      ],
      keyPoints: [
        "Always simplify gradient as a fraction",
        "y-intercept found by setting x=0",
        "Two points uniquely define a straight line",
        "Read graph scales carefully",
      ],
      examTips: [
        "Show gradient calculation explicitly",
        "Write y=mx+c not just the gradient",
        "For perpendicular state m1*m2=-1 explicitly",
      ],
    },
  },
  {
    kind: "chapter",
    num: "2.8",
    title: "Graphs of Functions",
    content: {
      intro: "Beyond straight lines, IGCSE covers four key curve families. Recognising their shapes and key features - intercepts, turning points, asymptotes - is essential for exam success.",
      facts: [
        { color: "#f59e0b", title: "Quadratic y = ax^2 + bx + c", body: "U-shape (a>0) or arch (a<0). Vertex at x = -b/2a. Axis of symmetry: x = -b/2a. y-intercept: (0, c). Can have 0, 1 or 2 x-intercepts." },
        { color: "#8b5cf6", title: "Cubic y = ax^3", body: "S-shaped curve. a>0: bottom-left to top-right. Up to 2 turning points. Passes through origin if no constant term." },
        { color: "#06b6d4", title: "Reciprocal y = a/x", body: "Hyperbola with two branches. Never touches axes (asymptotes x=0 and y=0). a>0: quadrants 1 and 3. a<0: quadrants 2 and 4." },
        { color: "#10b981", title: "Exponential y = a^x", body: "Always positive, never crosses x-axis. y-intercept always (0,1). a>1: increasing. 0<a<1: decreasing. Horizontal asymptote y=0." },
      ],
      keyPoints: [
        "Sketch first, use table of values to confirm",
        "x-intercepts: let y=0 and solve",
        "y-intercept: let x=0",
        "Turning point of quadratic: complete the square or use vertex formula",
      ],
      examTips: [
        "Label all key features: intercepts, turning points, asymptotes",
        "For quadratics, find BOTH intercepts and the vertex",
        "Examiners check shape AND specific points",
      ],
    },
  },
  {
    kind: "chapter",
    num: "2.9",
    title: "Sketching Graphs",
    content: {
      intro: "Graph transformations let you sketch new curves from known ones without plotting points. Understanding the four transformations saves enormous time and is frequently tested.",
      facts: [
        { color: "#3b82f6", title: "Vertical Translation y = f(x) + a", body: "Shifts entire graph UP by a (if a>0) or DOWN (if a<0). y-values all increase by a. x-intercepts change." },
        { color: "#ef4444", title: "Horizontal Translation y = f(x+a)", body: "Shifts LEFT by a (if a>0) or RIGHT (if a<0). Counterintuitive! f(x+2) moves the graph 2 units LEFT." },
        { color: "#10b981", title: "Vertical Stretch y = af(x)", body: "Multiplies every y-value by a. a>1: stretches up. 0<a<1: compresses. a<0: also reflects in x-axis." },
        { color: "#8b5cf6", title: "Horizontal Stretch y = f(ax)", body: "Multiplies every x-value by 1/a. a>1: compresses toward y-axis. y-intercept stays fixed." },
        { color: "#f59e0b", title: "Reflections", body: "y = -f(x): reflection in x-axis. y = f(-x): reflection in y-axis. Both can be combined." },
      ],
      formulas: [
        { label: "Translation", expr: "f(x-a)+b translates by vector (a, b)" },
        { label: "Vertical stretch", expr: "af(x) — scale factor a parallel to y-axis" },
        { label: "Horizontal stretch", expr: "f(ax) — scale factor 1/a parallel to x-axis" },
      ],
      keyPoints: [
        "Apply transformations in the correct order for combined ones",
        "Mark what happens to key points: intercepts and turning points",
        "Domain and range both change under transformations",
      ],
      examTips: [
        "State which type of transformation explicitly",
        "For combined transformations apply one at a time",
        "Mark at least 3 key points on your sketch",
      ],
    },
  },
];

const BIO_CHAPTERS: ChapterMat[] = [
  {
    kind: "chapter",
    num: "1",
    title: "Cell Structure and Organisation",
    content: {
      intro: "The cell is the basic unit of all living things. Understanding cell structure reveals how every organism functions, from single-celled bacteria to complex multicellular animals and plants.",
      facts: [
        { color: "#3b82f6", title: "Animal Cells", body: "Nucleus (controls cell, contains DNA), cytoplasm (reactions occur here), cell membrane (controls entry and exit), mitochondria (produce energy). NO cell wall, vacuole or chloroplasts." },
        { color: "#10b981", title: "Plant Cells", body: "Have everything animal cells have PLUS: rigid cell wall (cellulose, gives shape), large central vacuole (cell sap), chloroplasts (for photosynthesis, contain chlorophyll)." },
        { color: "#8b5cf6", title: "Prokaryotes vs Eukaryotes", body: "Prokaryotes (bacteria): no membrane-bound nucleus, smaller ribosomes, may have plasmids. Eukaryotes (plants, animals, fungi): true nucleus with membrane, mitochondria present." },
        { color: "#f59e0b", title: "Levels of Organisation", body: "Cell -> Tissue -> Organ -> Organ System -> Organism. Specialised cells group into tissues. Tissues form organs. Organs work together in systems." },
      ],
      formulas: [
        { label: "Magnification", expr: "Image size = Actual size x Magnification" },
        { label: "Surface Area to Volume", expr: "SA:V decreases as size increases - limits max cell size" },
      ],
      keyPoints: [
        "Nucleus contains DNA on chromosomes",
        "Mitochondria produce ATP via aerobic respiration",
        "Cell membrane is a phospholipid bilayer - selectively permeable",
        "Root hair cells have no chloroplasts (underground, no light)",
      ],
      examTips: [
        "Always state function when naming an organelle",
        "Magnification: show formula then working",
        "Distinguish cell wall (plants only) from cell membrane (all cells)",
      ],
    },
  },
  {
    kind: "chapter",
    num: "2",
    title: "Biological Molecules",
    content: {
      intro: "All living organisms are built from the same four classes of molecules. Their structure determines their function, and understanding this connection is key to all of biology.",
      facts: [
        { color: "#ef4444", title: "Carbohydrates", body: "Made of C, H, O. Monosaccharides: glucose, fructose. Disaccharides: sucrose = glucose + fructose. Polysaccharides: starch (energy store in plants), glycogen (animals), cellulose (plant walls)." },
        { color: "#3b82f6", title: "Proteins", body: "Made of amino acids linked by peptide bonds. 20 different amino acids - sequence determines 3D shape and function. Enzymes, antibodies and haemoglobin are all proteins." },
        { color: "#10b981", title: "Lipids", body: "Glycerol + 3 fatty acids. More energy per gram than carbohydrates. Long-term energy store, insulation, component of cell membranes." },
        { color: "#8b5cf6", title: "Water", body: "High specific heat capacity, excellent solvent, involved in hydrolysis and condensation reactions. Blood plasma is mostly water. Essential for all life." },
      ],
      keyPoints: [
        "Starch test: iodine solution turns blue-black",
        "Glucose test: Benedicts reagent gives brick-red precipitate",
        "Protein test: Biuret reagent turns purple",
        "Fat test: ethanol emulsion test gives cloudy white",
      ],
      examTips: [
        "Learn all food tests: reagent AND colour change AND what it indicates",
        "Condensation joins molecules (releases water)",
        "Hydrolysis breaks molecules apart (uses water)",
      ],
    },
  },
  {
    kind: "chapter",
    num: "3",
    title: "Enzymes",
    content: {
      intro: "Enzymes are biological catalysts - proteins that speed up chemical reactions without being used up. Every metabolic reaction in your body depends on enzymes functioning correctly.",
      facts: [
        { color: "#8b5cf6", title: "Active Site", body: "Each enzyme has a unique active site complementary to its substrate. Lock-and-key: substrate fits exactly. Induced-fit: active site adjusts slightly when substrate binds." },
        { color: "#ef4444", title: "Effect of Temperature", body: "Rate increases up to optimum temperature (about 37 C in humans), then falls sharply. Above optimum the enzyme denatures - the active site shape changes permanently." },
        { color: "#3b82f6", title: "Effect of pH", body: "Each enzyme has an optimal pH. Deviating from this disrupts hydrogen bonds, changing active site shape. Pepsin works at pH 2 (stomach); amylase at pH 7 (mouth)." },
        { color: "#10b981", title: "Substrate Concentration", body: "More substrate = faster rate, up to a maximum when all active sites are occupied (saturated). Beyond this, adding more substrate has no effect." },
      ],
      formulas: [
        { label: "Reaction rate", expr: "Rate = 1 / time taken for reaction" },
        { label: "Q10 rule", expr: "Q10 = Rate at (T+10) / Rate at T (approx. 2 for most enzymes)" },
      ],
      keyPoints: [
        "Enzymes are specific: one enzyme, one substrate (or very similar)",
        "Denaturation is irreversible - the enzyme is not destroyed but cannot function",
        "Immobilised enzymes can be reused in industrial processes",
        "37 C is optimal for most human enzymes",
      ],
      examTips: [
        "Always explain denaturation: shape of active site changes, substrate no longer fits",
        "Temperature vs rate: mention optimum then sharp decline",
        "Draw clear annotated enzyme-substrate diagrams",
      ],
    },
  },
  {
    kind: "chapter",
    num: "8",
    title: "Transport in Plants",
    content: {
      intro: "Plants cannot move to find water or nutrients, so they evolved two transport systems. Xylem carries water and minerals upward; phloem transports sugars in all directions.",
      facts: [
        { color: "#06b6d4", title: "Xylem", body: "Hollow DEAD cells with lignified walls. Transports water and dissolved minerals from roots UP to leaves. One-directional. The transpiration stream creates a continuous pull." },
        { color: "#10b981", title: "Phloem", body: "LIVING cells with sieve plates. Transports sucrose and amino acids. Bidirectional - from leaves to roots AND to growing regions. This process is called translocation." },
        { color: "#f59e0b", title: "Transpiration", body: "Loss of water vapour from leaves mainly through stomata. Creates tension that pulls water up xylem (transpiration stream). Increased by: high temperature, low humidity, high light, wind." },
        { color: "#8b5cf6", title: "Stomata", body: "Guard cells control pore size by changing water content (turgor). Open in light (need CO2 for photosynthesis). Close when dehydrated to prevent wilting." },
        { color: "#ef4444", title: "Water Uptake by Roots", body: "Water enters root hair cells by OSMOSIS down the water potential gradient. Root hair cells have large SA. Water then crosses cortex cells into xylem by osmosis and active transport." },
      ],
      formulas: [
        { label: "Osmosis", expr: "Net movement of water molecules through a partially permeable membrane down a water potential gradient" },
        { label: "Water potential", expr: "Water moves from high to low water potential" },
      ],
      keyPoints: [
        "Xylem = dead cells, Phloem = living cells (key exam distinction)",
        "Wilting: cells lose turgor when too much water is lost",
        "More stomata on the UNDERSIDE of leaves (lower epidermis)",
        "Test for starch: iodine after photosynthesis experiment",
      ],
      examTips: [
        "State xylem OR phloem for each transport function",
        "Explain transpiration as evaporation and diffusion, not just movement",
        "For stomata: link guard cell turgor to opening and closing mechanism",
      ],
    },
  },
];

const CHEM_CHAPTERS: ChapterMat[] = [
  {
    kind: "chapter",
    num: "1",
    title: "Particles and States of Matter",
    content: {
      intro: "All matter consists of tiny particles in constant motion. The three states of matter - solid, liquid and gas - differ in particle arrangement, energy and movement.",
      facts: [
        { color: "#3b82f6", title: "Solid", body: "Closely packed particles in regular arrangement, vibrating in fixed positions. Strong forces. Fixed shape and volume. Cannot be compressed." },
        { color: "#8b5cf6", title: "Liquid", body: "Particles close but moving past each other. Weaker forces. No fixed shape (takes container shape) but fixed volume. Slightly compressible." },
        { color: "#10b981", title: "Gas", body: "Particles far apart, moving randomly at high speed. Very weak forces. No fixed shape or volume. Highly compressible. Exerts pressure on container walls." },
        { color: "#f59e0b", title: "Changes of State", body: "Melting (solid->liquid), Evaporation/Boiling (liquid->gas), Condensation (gas->liquid), Freezing (liquid->solid), Sublimation (solid->gas direct, e.g. iodine)." },
      ],
      formulas: [
        { label: "Kinetic theory", expr: "Higher temperature = faster particles = more energy" },
        { label: "Brownian motion", expr: "Random movement of particles = evidence for particle theory" },
      ],
      keyPoints: [
        "Energy ABSORBED during melting and boiling (endothermic)",
        "Energy RELEASED during freezing and condensing (exothermic)",
        "Diffusion: random movement from high to low concentration",
        "Diffusion faster in gas than liquid; faster at higher temperature",
      ],
      examTips: [
        "Name both particles when asked about diffusion",
        "State arrangement AND movement for each state",
        "Explain melting in terms of overcoming forces between particles",
      ],
    },
  },
  {
    kind: "chapter",
    num: "5",
    title: "Chemical Formulae and Equations",
    content: {
      intro: "Chemical equations are the language of chemistry. Balanced equations show exactly what reacts, what forms and in what ratios - the foundation of all quantitative chemistry.",
      facts: [
        { color: "#ef4444", title: "Balancing Equations", body: "Atoms are conserved - same number on each side. Balance one element at a time. Never change formulae, only coefficients. 2H2 + O2 -> 2H2O (balanced)." },
        { color: "#3b82f6", title: "State Symbols", body: "(s) solid, (l) liquid, (g) gas, (aq) aqueous. Always include. Examiners award marks for correct state symbols." },
        { color: "#8b5cf6", title: "Ionic Equations", body: "Show only the species that change. Cancel spectator ions. Ag+(aq) + Cl-(aq) -> AgCl(s). Reveals the essential chemistry." },
        { color: "#10b981", title: "Mole Concept", body: "1 mole = 6.02 x 10^23 particles. Molar mass = mass of 1 mole in grams = relative formula mass (Mr) in grams." },
      ],
      formulas: [
        { label: "Moles from mass", expr: "n = mass / molar mass (Mr)" },
        { label: "Molar volume at RTP", expr: "1 mole of any gas = 24 dm3 at room temperature and pressure" },
      ],
      keyPoints: [
        "Check atom count on both sides after balancing",
        "Mr = sum of all atomic masses in formula",
        "Percentage composition = (mass of element / Mr) x 100",
        "Empirical formula: simplest whole number ratio of atoms",
      ],
      examTips: [
        "Write state symbols in every equation",
        "Show balancing systematically - count each element",
        "For ionic equations state which ions are spectator ions",
      ],
    },
  },
  {
    kind: "chapter",
    num: "6",
    title: "Acids, Bases and pH",
    content: {
      intro: "Acids and bases are fundamental to chemistry and biology. Understanding their properties, the pH scale and how they react forms the basis for all salt preparation work.",
      facts: [
        { color: "#ef4444", title: "Acids", body: "pH below 7. Produce H+ ions in water. Turn litmus red, methyl orange red, phenolphthalein colourless. Strong acids fully ionise: HCl, H2SO4, HNO3. Weak acids partially: CH3COOH." },
        { color: "#3b82f6", title: "Bases and Alkalis", body: "Bases accept protons (H+ ions). Alkalis are bases that dissolve in water to produce OH- ions. pH above 7. Turn litmus blue. NaOH and KOH are strong alkalis." },
        { color: "#8b5cf6", title: "pH Scale", body: "0-14. pH 7 = neutral. Measures H+ ion concentration. Each whole number = 10-fold change. pH 1 is 10x more acidic than pH 2. Universal indicator shows spectrum of colours." },
        { color: "#10b981", title: "Neutralisation", body: "Acid + Base -> Salt + Water. H+ + OH- -> H2O. At the equivalence point all H+ and OH- have been consumed - solution becomes neutral." },
      ],
      formulas: [
        { label: "Neutralisation", expr: "Acid + Metal oxide/hydroxide -> Salt + Water" },
        { label: "With carbonate", expr: "Acid + Carbonate -> Salt + Water + CO2" },
        { label: "With metal", expr: "Acid + Metal -> Salt + Hydrogen" },
      ],
      keyPoints: [
        "Strong acid does NOT mean concentrated (these are different)",
        "Strength = degree of ionisation; Concentration = amount per volume",
        "Test for hydrogen: squeaky pop with lit splint",
        "Test for CO2: turns limewater milky white",
      ],
      examTips: [
        "Quote indicator colour AND pH range",
        "Explain neutralisation: H+ and OH- combine to form water",
        "Show balanced equation with state symbols",
      ],
    },
  },
  {
    kind: "chapter",
    num: "7",
    title: "Preparation of Salts",
    content: {
      intro: "Salts are ionic compounds where the hydrogen of an acid is replaced by a metal ion. The preparation method depends entirely on whether the desired salt is soluble or insoluble.",
      facts: [
        { color: "#8b5cf6", title: "Naming Salts", body: "Salt = metal + acid ion. HCl -> chloride. H2SO4 -> sulfate. HNO3 -> nitrate. NaOH + HCl -> NaCl + H2O (sodium chloride). Simple naming rule." },
        { color: "#10b981", title: "Soluble Salts Method", body: "Add EXCESS insoluble base/carbonate/metal to acid until no more reacts. Filter off excess solid. Evaporate filtrate to crystallise salt. Dry carefully." },
        { color: "#3b82f6", title: "Insoluble Salts: Precipitation", body: "Mix two aqueous solutions whose ions form the insoluble salt. BaCl2(aq) + Na2SO4(aq) -> BaSO4(s) + 2NaCl(aq). Filter, wash, dry." },
        { color: "#f59e0b", title: "Titration Method", body: "For soluble salts from strong acid + strong alkali. Use indicator to find exact volume. Repeat without indicator. Evaporate to get pure salt with no excess acid or alkali." },
        { color: "#ef4444", title: "Solubility Rules", body: "ALL nitrates soluble. ALL sodium/potassium/ammonium salts soluble. Most chlorides soluble (except AgCl, PbCl2). Most sulfates soluble (except BaSO4, PbSO4, CaSO4). Most carbonates insoluble." },
      ],
      formulas: [
        { label: "Soluble salt (excess base method)", expr: "acid + excess base -> filter -> evaporate -> crystallise" },
        { label: "Insoluble salt (precipitation)", expr: "solution 1 + solution 2 -> precipitate -> filter -> dry" },
      ],
      keyPoints: [
        "Always add EXCESS solid to acid - ensures all acid is used up",
        "Never evaporate to dryness - gently heat to form crystals then filter",
        "Titration: repeat WITHOUT indicator to get pure product",
        "Ionic equation for precipitation only shows ions forming precipitate",
      ],
      examTips: [
        "State which preparation method based on solubility of salt",
        "For titration explain WHY you repeat without indicator",
        "Show word equation AND symbol equation with state symbols",
      ],
    },
  },
];

const PHYSICS_CHAPTERS: ChapterMat[] = [
  {
    kind: "chapter",
    num: "1",
    title: "Geometric Optics",
    video: { kind: "video-drive", label: "Ch 1 — Geometric Optics", fileId: "1leM7iyiDra9ZRUnohMjnqK-njwNWvB5Z" },
    content: {
      intro: "Light travels in perfectly straight lines called rays. Geometric optics uses those rays to predict exactly where light goes when it bounces off mirrors or bends through glass, water and lenses — the physics hiding inside cameras, spectacles, periscopes and the fibre-optic cables that carry your internet.",
      facts: [
        { color: "#3b82f6", title: "The Law of Reflection", body: "Light bounces off a smooth surface so the angle of incidence = angle of reflection, both measured from the NORMAL (the dashed line at 90° to the surface). A plane mirror gives an image that is upright, the same size, laterally inverted and virtual — sitting as far behind the mirror as the object is in front." },
        { color: "#8b5cf6", title: "Refraction: Light Bends", body: "Crossing into a denser medium (air → glass) light slows down and bends TOWARDS the normal; going into a less dense medium it speeds up and bends AWAY. This is why a straw looks 'broken' at the water's surface and a swimming pool looks shallower than it really is." },
        { color: "#06b6d4", title: "Refractive Index & Snell's Law", body: "Refractive index n = speed in vacuum ÷ speed in medium (always ≥ 1). Snell's law n = sin i ÷ sin r links the two angles. Water n ≈ 1.33, glass n ≈ 1.5, diamond n ≈ 2.42 — the huge index is exactly why diamonds sparkle so much." },
        { color: "#10b981", title: "Total Internal Reflection", body: "Beyond a 'critical angle', light hitting a boundary from inside a dense medium reflects COMPLETELY instead of escaping. sin c = 1 ÷ n. This traps light inside optical fibres and reflecting prisms — the trick behind endoscopes, binoculars and high-speed broadband." },
        { color: "#f59e0b", title: "Converging & Diverging Lenses", body: "A converging (convex) lens bends parallel rays to a single focal point F; a diverging (concave) lens spreads them apart. Where the object sits decides the image: beyond F it's real and inverted (a camera), inside F it's magnified and virtual (a magnifying glass)." },
      ],
      formulas: [
        { label: "Law of reflection", expr: "angle of incidence (i) = angle of reflection (r)" },
        { label: "Refractive index", expr: "n = sin i / sin r = c(vacuum) / v(medium)" },
        { label: "Critical angle", expr: "sin c = 1 / n" },
        { label: "Magnification", expr: "m = image height / object height" },
      ],
      keyPoints: [
        "Always measure angles from the NORMAL — never from the surface itself",
        "Real images can be caught on a screen; virtual images cannot",
        "Denser medium → higher n → slower light → more bending",
        "Total internal reflection needs dense → less dense AND angle > critical angle",
        "White light splits (disperses) into a spectrum because each colour refracts by a slightly different amount",
      ],
      examTips: [
        "Draw the normal as a dashed line at every boundary before marking any angle",
        "Name the medium change to justify which way the ray bends (towards/away from the normal)",
        "For lens ray diagrams always draw the two standard rays: parallel-then-through-F, and straight-through-the-centre",
        "Label images with all three properties: real/virtual, upright/inverted, enlarged/diminished",
      ],
    },
  },
  {
    kind: "chapter",
    num: "2",
    title: "Electric Field and Charges",
    video: { kind: "video-drive", label: "Ch 2 — Electric Field and Charges", fileId: "1dl_CuFpvO9TASKTDYYx6e8DobIlnI1iO" },
    content: {
      intro: "Everything around you is built from charged particles — protons (+) locked in the nucleus and electrons (−) whizzing around them. When that charge gets unbalanced, objects attract, repel and wrap themselves in invisible force fields. This chapter runs from a balloon sticking to a wall all the way up to the spark of a lightning bolt.",
      facts: [
        { color: "#ef4444", title: "Two Kinds of Charge", body: "Charge is positive or negative, measured in coulombs (C). The golden rule: LIKE charges repel, OPPOSITE charges attract. In solids only electrons move — an object is positive because it LOST electrons and negative because it GAINED them. Protons never leave the nucleus." },
        { color: "#3b82f6", title: "Conductors vs Insulators", body: "Conductors (metals, graphite) contain free electrons that flow easily, so charge can't build up on them. Insulators (plastic, rubber, glass, hair) hold charge exactly where it lands — which is why you can create static electricity by rubbing them." },
        { color: "#8b5cf6", title: "Charging by Friction & Induction", body: "Friction transfers electrons: rub a balloon on your hair and the balloon GAINS electrons, becoming negative. Induction rearranges charge with no contact — a charged rod pushes like charges to the far side of a neutral object, so the near side is left with an opposite, attracting charge." },
        { color: "#10b981", title: "The Electric Field", body: "An electric field is any region where a charge feels a force. We draw it with field lines that point the way a POSITIVE test charge would move: AWAY from + charges and TOWARDS − charges. The closer the lines are packed, the stronger the field." },
        { color: "#f59e0b", title: "Field Patterns You Must Know", body: "Around a single point charge the field is radial — like spokes on a wheel. Between two parallel charged plates it is uniform — evenly spaced parallel lines. That uniform field is used to accelerate and deflect charged particles in oscilloscopes and inkjet printers." },
      ],
      formulas: [
        { label: "Electric field strength", expr: "E = F / Q   (force per unit charge, in N/C)" },
        { label: "Uniform field (parallel plates)", expr: "E = V / d" },
        { label: "Force between charges", expr: "F ∝ (Q1 × Q2) / r²   (bigger charges, weaker with distance²)" },
      ],
      keyPoints: [
        "Only electrons move — protons stay fixed in the nucleus",
        "Like charges repel, unlike charges attract: the golden rule of electrostatics",
        "Field lines never cross, and always start on + and end on −",
        "A neutral object can still be ATTRACTED to a charge, through induction",
        "Sharp points concentrate charge — the reason lightning conductors are pointed",
      ],
      examTips: [
        "When explaining charging, always say which way the ELECTRONS move — not vaguely 'the charge'",
        "Draw field arrows pointing away from positive and into negative, and mark the direction clearly",
        "Uniform field → equally spaced parallel lines; point charge → radial lines",
        "State the force direction (attract/repel) AND name the rule you're using",
      ],
    },
  },
];

const SC: ChapterMat[] = [
  { kind:"chapter", num:"1",  title:"Functions",                           img:"/spotlight_course/Ch%201%20-%20Functions.png",                                            pdf:"/spotlight_course/Ch%201%20-%20Functions.pdf" },
  { kind:"chapter", num:"2",  title:"Quadratic Functions",                  img:"/spotlight_course/Ch%202%20-%20Quadratic%20Functions.png",                                pdf:"/spotlight_course/Ch%202%20-%20Quadratic%20Functions.pdf",                                video:{ kind:"video-drive", label:"Ch 2 — Quadratic Functions", fileId:"1NqNdQ9aVgqOb6sFeoSf5IDvjP8Tnr3sV" } },
  { kind:"chapter", num:"3",  title:"Factors of Polynomials",               img:"/spotlight_course/Ch%203%20-%20Factors%20of%20Polynomials.png",                           pdf:"/spotlight_course/Ch%203%20-%20Factors%20of%20Polynomials.pdf",                           video:{ kind:"video-drive", label:"Ch 3 — Factors of Polynomials", fileId:"1jV0OjCxUyQgDTmg2vDy02rMDAWZeH-rC" } },
  { kind:"chapter", num:"4",  title:"Equations, Inequalities & Graphs",     img:"/spotlight_course/Ch%204%20-%20Equations%2C%20inequalities%20and%20graphs.png",           pdf:"/spotlight_course/Ch%204%20-%20Equations%2C%20Inequlities%20and%20Graphs.pdf",             video:{ kind:"video-drive", label:"Ch 4 — Equations, Inequalities & Graphs", fileId:"1-Yyc6LD8gNqiXkS0H4eZq9h4bM-w8K7N" } },
  { kind:"chapter", num:"5",  title:"Simultaneous Equations",               img:"/spotlight_course/Ch%205%20-%20Simulatneous%20Equations.png",                             pdf:"/spotlight_course/Ch%205%20-%20Simultaneous%20Equations.pdf",                             video:{ kind:"video-drive", label:"Ch 5 — Simultaneous Equations", fileId:"1ZryA67TwDDkWM0LQ4X9M1TwJtikQJUqz" } },
  { kind:"chapter", num:"6",  title:"Logarithmic & Exponential Functions",  img:"/spotlight_course/Ch%206%20-%20Logarithmic%20and%20exponential%20functions.png",          pdf:"/spotlight_course/Ch%206%20-%20Logarithmic%20and%20Exponential%20Functions.pdf",          video:{ kind:"video-drive", label:"Ch 6 — Logarithmic & Exponential Functions", fileId:"1yQuYmcRzqeqvCSX7pG92NPph_hoZjOcB" } },
  { kind:"chapter", num:"7",  title:"Straight-Line Graphs",                 img:"/spotlight_course/Ch%207%20-%20Straight-line%20graphs.png",                               pdf:"/spotlight_course/Ch%207%20-%20Straight-Line%20Graphs.pdf",                               video:{ kind:"video-drive", label:"Ch 7 — Straight-Line Graphs", fileId:"1ooweYFxVXHX73OYAD3hfSUYj3wRuwCdB" } },
  { kind:"chapter", num:"8",  title:"Coordinate Geometry of the Circle",    img:"/spotlight_course/Ch%208%20-%20Coordinate%20geometry%20of%20the%20circle.png",            pdf:"/spotlight_course/Ch%208%20-%20Coordinate%20Geometry%20of%20the%20Circle.pdf",            video:{ kind:"video-drive", label:"Ch 8 — Coordinate Geometry of the Circle", fileId:"1Fu1LZFmC94Z79Zs3hGCx92jJDvpKX7zo" } },
  { kind:"chapter", num:"9",  title:"Circular Measure",                     img:"/spotlight_course/Ch%209%20-%20Circular%20measure.png",                                   pdf:"/spotlight_course/Ch%209%20-%20Circular%20measure.pdf",                                   video:{ kind:"video-drive", label:"Ch 9 — Circular Measure", fileId:"1byWEdo-I_qaqrD8KCute5WyYPNbtpBvK" } },
  { kind:"chapter", num:"10", title:"Trigonometry",                         img:"/spotlight_course/Ch%2010%20-%20Trigonometry.png",                                        pdf:"/spotlight_course/Ch%2010%20-%20Trigonometry.pdf",                                        video:{ kind:"video-drive", label:"Ch 10 — Trigonometry", fileId:"1iTfQgod2J026O4XptDkNcQ6MOUDyLNTi" } },
  { kind:"chapter", num:"11", title:"Permutations & Combinations",          img:"/spotlight_course/Ch%2011%20-%20Permutations%20and%20combinations.png",                   pdf:"/spotlight_course/Ch%2011%20-%20Permutations%20and%20Combinations.pdf",                   video:{ kind:"video-drive", label:"Ch 11 — Permutations & Combinations", fileId:"1RTBb1JHR7lQUovX2cmYpDrCAEcmgfryO" } },
  { kind:"chapter", num:"12", title:"Series",                               img:"/spotlight_course/Ch%2012%20-%20Series.png",                                              pdf:"/spotlight_course/Ch%2012%20-%20Series.pdf",                                              video:{ kind:"video-drive", label:"Ch 12 — Series", fileId:"1ZK4Kw9A7sULuwaeKmo5aMVK70LiKIjXH" } },
  { kind:"chapter", num:"13", title:"Vectors in Two Dimensions",            img:"/spotlight_course/Ch%2013%20-%20Vectors%20in%20two%20dimensions.png",                     pdf:"/spotlight_course/Ch%2013%20-%20Vectors%20in%20two%20dimensions.pdf",                     video:{ kind:"video-drive", label:"Ch 13 — Vectors in Two Dimensions", fileId:"1w64wPtV_saodLMvor5DesP0aVg7njfwY" } },
  { kind:"chapter", num:"14", title:"Calculus",                             img:"/spotlight_course/Ch%2014%20-%20Calculus.png",                                            pdf:"/spotlight_course/Ch%2014%20-%20Calculus.pdf",                                            video:{ kind:"video-drive", label:"Ch 14 — Calculus", fileId:"13coaHTn5W7Zgp522U-RSZEAJPWVCZdHy" } },
];

const DETAILS: Record<string, CourseDetail> = {
  "addmaths-0606": {
    description: "CIE IGCSE Additional Mathematics 0606 by Ate. 14 chapters each with a whiteboard and PDF notes, plus 6 solved past papers.",
    overviewVideo: { kind: "video-drive", label: "Spotlight Preview", fileId: "1G-j-GZTQk-p4aNsUAfFXiQ-73MX9CJYH" },
    driveFolder: "1CkPFYQ62ncIyPm1xxQmTobyoa41n4-mw",
    materials: [
      ...SC,
      { kind:"pdf-local", label:"0606 s23 11 — Paper 1 V1 (Solved)", src:"/Solved%20past%20papers/Additional%20Mathematics%200606/2023/May%20June/0606%20s23%2011%20solved.pdf", desc:"2023 May/June" },
      { kind:"pdf-local", label:"0606 s23 12 — Paper 1 V2 (Solved)", src:"/Solved%20past%20papers/Additional%20Mathematics%200606/2023/May%20June/0606%20s23%2012%20solved.pdf", desc:"2023 May/June" },
      { kind:"pdf-local", label:"0606 s23 13 — Paper 1 V3 (Solved)", src:"/Solved%20past%20papers/Additional%20Mathematics%200606/2023/May%20June/0606%20s23%2013%20solved.pdf", desc:"2023 May/June" },
      { kind:"pdf-local", label:"0606 s23 21 — Paper 2 V1 (Solved)", src:"/Solved%20past%20papers/Additional%20Mathematics%200606/2023/May%20June/0606%20s23%2021%20solved.pdf", desc:"2023 May/June" },
      { kind:"pdf-local", label:"0606 s23 22 — Paper 2 V2 (Solved)", src:"/Solved%20past%20papers/Additional%20Mathematics%200606/2023/May%20June/0606%20s23%2022%20solved.pdf", desc:"2023 May/June" },
      { kind:"pdf-local", label:"0606 s23 23 — Paper 2 V3 (Solved)", src:"/Solved%20past%20papers/Additional%20Mathematics%200606/2023/May%20June/0606%20s23%2023%20solved.pdf", desc:"2023 May/June" },
    ],
  },
  "math-0580-unit-2": {
    description: "Cambridge IGCSE Mathematics 0580 Unit 2 by A.S. Full interactive notes for all 9 chapters with key facts, formulas, exam tips and solved past papers.",
    materials: [...MATH_CHAPTERS],
  },
  "physics-igcse": {
    description: "IGCSE Physics with Vaishnav Bourempeta — two practice FRQ (free-response) walkthroughs on Geometric Optics and Electric Field & Charges, each paired with full interactive revision notes covering the key facts, formulas and exam tips.",
    materials: [...PHYSICS_CHAPTERS],
  },
  "biology-igcse": {
    description: "Full IGCSE Biology notes by Miki — cells, molecules, enzymes, transport in plants and more. Everything you need to crush the biology exam!",
    shoutout: "Course by @MikiGoesBoom — 2nd member of the CamBright tutoring board",
    overviewVideo: { kind: "video-drive", label: "Unit 8: Transport In Plants", fileId: "1BW2YvuoStn5ePfDmTrlgfQZQ0XZbw7Oh" },
    materials: [
      ...BIO_CHAPTERS,
      { kind: "pdf-drive", label: "Biology Notes", fileId: "1ViJZyPKRCeXCZHHIHziBxt4zFI0c2p61" },
    ],
  },
  "chemistry-igcse": {
    description: "Full IGCSE Chemistry notes by Miki — particles, equations, acids, bases, salts and more. Together we will ace the chemistry exam!",
    shoutout: "Course by @MikiGoesBoom — 2nd member of the CamBright tutoring board",
    overviewVideo: { kind: "video-drive", label: "Unit 7: Acids, Bases and Salts", fileId: "1yGhT6VQFMkPM4-H9I46wfjOfQYcAB2xD" },
    materials: [
      ...CHEM_CHAPTERS,
      { kind: "pdf-drive", label: "Chemistry Notes", fileId: "1y5tgiYvulThUfLyduf_7A7XIN_zqE3fd" },
    ],
  },
};

function ZoomableImage({ src, alt }: { src: string; alt: string }) {
  const [open, setOpen] = useState(false);
  const [scale, setScale] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const dragging = useRef(false);
  const last = useRef({ x: 0, y: 0 });
  const onWheel = useCallback((e: React.WheelEvent) => { e.preventDefault(); setScale((s) => Math.min(8, Math.max(1, s - e.deltaY * 0.005))); }, []);
  const onMouseDown = useCallback((e: React.MouseEvent) => { dragging.current = true; last.current = { x: e.clientX, y: e.clientY }; }, []);
  const onMouseMove = useCallback((e: React.MouseEvent) => { if (!dragging.current) return; setPos((p) => ({ x: p.x + e.clientX - last.current.x, y: p.y + e.clientY - last.current.y })); last.current = { x: e.clientX, y: e.clientY }; }, []);
  const onMouseUp = useCallback(() => { dragging.current = false; }, []);
  const reset = () => { setScale(1); setPos({ x: 0, y: 0 }); };
  return (
    <>
      <div className="relative group cursor-zoom-in" onClick={() => { reset(); setOpen(true); }}>
        <div className="relative w-full bg-black border-b border-white/[0.07]" style={{ aspectRatio: "16/9" }}>
          <Image src={src} alt={alt} fill className="object-contain" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
          <div className="flex items-center gap-2 bg-black/70 text-white text-xs font-bold px-3 py-2 rounded-xl border border-white/20 backdrop-blur">
            <ZoomIn className="h-4 w-4" /> Click to zoom
          </div>
        </div>
      </div>
      {open && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex flex-col" onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp}>
          <div className="flex items-center justify-between px-5 py-3 border-b border-white/10 shrink-0">
            <span className="text-sm text-white/60 font-medium">{alt}</span>
            <div className="flex items-center gap-3">
              <span className="text-xs text-white/40">{Math.round(scale * 100)}%</span>
              <button onClick={reset} className="text-xs text-white/50 hover:text-white transition border border-white/15 rounded-lg px-3 py-1.5">Reset</button>
              <button onClick={() => setOpen(false)} className="h-8 w-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition"><X className="h-4 w-4 text-white" /></button>
            </div>
          </div>
          <p className="text-center text-xs text-white/25 py-2 shrink-0">Scroll to zoom &middot; Drag to pan</p>
          <div className="flex-1 overflow-hidden flex items-center justify-center" onWheel={onWheel} style={{ cursor: scale > 1 ? "grab" : "zoom-in" }}>
            <div onMouseDown={onMouseDown} style={{ transform: `translate(${pos.x}px, ${pos.y}px) scale(${scale})`, transformOrigin: "center center", transition: dragging.current ? "none" : "transform 0.1s ease", userSelect: "none", position: "relative", width: "min(90vw, 1200px)", aspectRatio: "16/9" }}>
              <Image src={src} alt={alt} fill className="object-contain" draggable={false} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function InteractiveContent({ c, accentFrom, accentTo }: { c: ChapterContent; accentFrom: string; accentTo: string }) {
  return (
    <div className="p-5 space-y-6">
      <p className="text-sm text-white/70 leading-relaxed border-l-2 pl-4" style={{ borderColor: accentFrom }}>{c.intro}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {c.facts.map((f, i) => (
          <div key={i} className="rounded-xl p-4 border" style={{ background: f.color + "18", borderColor: f.color + "44" }}>
            <p className="text-xs font-black mb-1.5" style={{ color: f.color }}>{f.title}</p>
            <p className="text-xs text-white/70 leading-relaxed">{f.body}</p>
          </div>
        ))}
      </div>
      {c.formulas && c.formulas.length > 0 && (
        <div className="rounded-xl border border-white/10 bg-black/40 p-4 space-y-2">
          <p className="text-xs font-black text-white/50 uppercase tracking-widest mb-3 flex items-center gap-2"><BookOpen className="h-3.5 w-3.5" /> Key Formulas</p>
          {c.formulas.map((f, i) => (
            <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-sm">
              <span className="text-white/40 text-xs sm:w-40 shrink-0">{f.label}</span>
              <code className="font-mono text-white bg-white/8 rounded-lg px-3 py-1.5 text-xs flex-1 break-words">{f.expr}</code>
            </div>
          ))}
        </div>
      )}
      <div className="rounded-xl border border-white/10 bg-black/30 p-4">
        <p className="text-xs font-black text-white/50 uppercase tracking-widest mb-3 flex items-center gap-2"><Lightbulb className="h-3.5 w-3.5" /> Key Points</p>
        <ul className="space-y-1.5">
          {c.keyPoints.map((kp, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-white/65">
              <span className="h-1.5 w-1.5 rounded-full mt-1.5 shrink-0" style={{ background: accentFrom }} />{kp}
            </li>
          ))}
        </ul>
      </div>
      <div className="rounded-xl border border-amber-400/20 bg-amber-400/8 p-4">
        <p className="text-xs font-black text-amber-300 uppercase tracking-widest mb-3 flex items-center gap-2"><AlertCircle className="h-3.5 w-3.5" /> Exam Tips</p>
        <ul className="space-y-1.5">
          {c.examTips.map((tip, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-amber-200/70">
              <span className="text-amber-400 shrink-0 mt-0.5">&#x2736;</span> {tip}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function ChapterSlider({ chapters, accentFrom, accentTo, glowRgb }: { chapters: ChapterMat[]; accentFrom: string; accentTo: string; glowRgb: string }) {
  const [active, setActive] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);
  const ch = chapters[active];
  const scroll = (dir: -1 | 1) => sliderRef.current?.scrollBy({ left: dir * 200, behavior: "smooth" });
  const progressPct = ((active + 1) / chapters.length) * 100;
  return (
    <div className="space-y-4">
      {/* progress row */}
      <div className="flex items-center gap-3">
        <button disabled={active===0} onClick={() => setActive(v => Math.max(0,v-1))} className="h-7 w-7 rounded-full border border-white/10 flex items-center justify-center shrink-0 disabled:opacity-20 hover:border-white/30 hover:bg-white/[0.04] transition">
          <ChevronLeft className="h-3.5 w-3.5 text-white/70" />
        </button>
        <div className="flex-1 flex items-center gap-2.5 min-w-0">
          <span className="text-xs font-bold shrink-0 tabular-nums" style={{ color: accentFrom }}>{active + 1}/{chapters.length}</span>
          <div className="flex-1 h-1.5 rounded-full bg-white/[0.07] overflow-hidden">
            <div className="h-full rounded-full transition-all duration-500 ease-out" style={{ width: `${progressPct}%`, background: `linear-gradient(90deg, ${accentFrom}, ${accentTo})` }} />
          </div>
        </div>
        <button disabled={active===chapters.length-1} onClick={() => setActive(v => Math.min(chapters.length-1,v+1))} className="h-7 w-7 rounded-full border border-white/10 flex items-center justify-center shrink-0 disabled:opacity-20 hover:border-white/30 hover:bg-white/[0.04] transition">
          <ChevronRight className="h-3.5 w-3.5 text-white/70" />
        </button>
      </div>

      <div className="relative">
        <button onClick={() => scroll(-1)} className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-black/80 border border-white/15 flex items-center justify-center hover:bg-white/10 transition shadow-lg">
          <ChevronLeft className="h-4 w-4 text-white" />
        </button>
        <div ref={sliderRef} className="flex gap-2 overflow-x-auto px-10 pb-1 scroll-smooth" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
          {chapters.map((c, i) => (
            <button key={i} onClick={() => setActive(i)} className="shrink-0 flex items-center gap-2.5 rounded-xl border px-3.5 py-2.5 transition-all duration-200 text-left min-w-[160px] max-w-[200px]"
              style={{ background: i===active ? `linear-gradient(135deg, ${accentFrom}33, ${accentTo}22)` : "rgba(0,0,0,0.3)", borderColor: i===active ? accentFrom : "rgba(255,255,255,0.1)", boxShadow: i===active ? `0 0 20px rgba(${glowRgb},0.25)` : "none" }}>
              <span className="h-6 w-6 rounded-full flex items-center justify-center text-[11px] font-black shrink-0" style={{ background: i===active ? `linear-gradient(135deg, ${accentFrom}, ${accentTo})` : "rgba(255,255,255,0.08)", color: i===active ? "#fff" : "rgba(255,255,255,0.4)" }}>{i + 1}</span>
              <span className="text-xs font-semibold leading-tight line-clamp-2" style={{ color: i===active ? "#fff" : "rgba(255,255,255,0.5)" }}>{c.title}</span>
            </button>
          ))}
        </div>
        <button onClick={() => scroll(1)} className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-black/80 border border-white/15 flex items-center justify-center hover:bg-white/10 transition shadow-lg">
          <ChevronRight className="h-4 w-4 text-white" />
        </button>
      </div>

      <div key={active} className="rounded-2xl border border-white/10 bg-black/30 overflow-hidden animate-in fade-in duration-300" style={{ boxShadow: `0 8px 40px rgba(${glowRgb},0.15)` }}>
        <div className="flex items-center gap-3 px-4 sm:px-5 py-4 border-b border-white/[0.07]" style={{ background: `linear-gradient(90deg, ${accentFrom}18, transparent)` }}>
          <span className="shrink-0 text-xs font-black px-3 py-1 rounded-lg text-white" style={{ background: `linear-gradient(135deg, ${accentFrom}, ${accentTo})` }}>Ch {active + 1}</span>
          <span className="font-bold text-white truncate">{ch.title}</span>
          {ch.img && <span className="ml-auto shrink-0 text-xs text-white/30 hidden sm:flex items-center gap-1"><Maximize2 className="h-3 w-3" /> click to zoom</span>}
        </div>
        {ch.img && <ZoomableImage src={ch.img} alt={`Ch ${active + 1} — ${ch.title}`} />}
        {ch.content && <InteractiveContent c={ch.content} accentFrom={accentFrom} accentTo={accentTo} />}
        {ch.pdf && (
          <div className="border-t border-white/[0.07]" style={{ height: "680px" }}>
            <iframe src={ch.pdf} className="w-full h-full" title={`Ch ${active + 1} notes`} />
          </div>
        )}
      </div>
    </div>
  );
}

interface VideoItem { label: string; video: VideoLocal | VideoDrive; badge?: string }

function VideoLoadingOverlay({ label = "Video loading…" }: { label?: string }) {
  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2.5 bg-black/80 backdrop-blur-sm">
      <div className="h-8 w-8 rounded-full border-2 border-white/15 border-t-white animate-spin" />
      <p className="text-sm font-bold text-white">{label}</p>
      <p className="text-xs text-white/40">This can take a few seconds</p>
    </div>
  );
}

function VideoBlock({ item, author, accentFrom, accentTo, glowRgb }: { item: VideoItem; author: string; accentFrom: string; accentTo: string; glowRgb: string }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 mb-2">
        <div className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0" style={{ background:`linear-gradient(135deg,${accentFrom},${accentTo})` }}><Video className="h-4 w-4 text-white" /></div>
        <div>
          <h2 className="font-bold text-white text-lg leading-none">{item.label}</h2>
          <p className="text-xs text-white/40 mt-0.5">by {author}</p>
        </div>
        {item.badge && <span className="ml-auto text-xs font-bold text-amber-300 border border-amber-400/30 bg-amber-400/10 rounded-full px-3 py-1">{item.badge}</span>}
      </div>
      {item.video.kind==="video-local" ? (
        <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-black" style={{ boxShadow:`0 0 60px rgba(${glowRgb},0.25)` }}>
          {!loaded && <VideoLoadingOverlay />}
          <video controls className="w-full" onLoadedData={() => setLoaded(true)}>
            <source src={(item.video as VideoLocal).src} type="video/mp4" />
          </video>
        </div>
      ) : (
        <div className="relative rounded-2xl overflow-hidden border border-white/10" style={{ paddingTop:"56.25%", boxShadow:`0 0 60px rgba(${glowRgb},0.25)` }}>
          {!loaded && <VideoLoadingOverlay />}
          <iframe
            src={`https://drive.google.com/file/d/${(item.video as VideoDrive).fileId}/preview`}
            className="absolute inset-0 w-full h-full"
            allow="autoplay"
            allowFullScreen
            title={item.label}
            loading="eager"
            // @ts-expect-error fetchPriority isn't in React's iframe typings yet
            fetchpriority="high"
            onLoad={() => setLoaded(true)}
          />
        </div>
      )}
    </div>
  );
}

function VideoChapterSlider({ items, author, accentFrom, accentTo, glowRgb }: { items: VideoItem[]; author: string; accentFrom: string; accentTo: string; glowRgb: string }) {
  const [active, setActive] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);
  const scroll = (dir: -1 | 1) => sliderRef.current?.scrollBy({ left: dir * 200, behavior: "smooth" });

  if (items.length === 1) {
    return <VideoBlock item={items[0]} author={author} accentFrom={accentFrom} accentTo={accentTo} glowRgb={glowRgb} />;
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <button onClick={() => scroll(-1)} className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-black/80 border border-white/15 flex items-center justify-center hover:bg-white/10 transition shadow-lg">
          <ChevronLeft className="h-4 w-4 text-white" />
        </button>
        <div ref={sliderRef} className="flex gap-2 overflow-x-auto px-10 pb-1 scroll-smooth" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
          {items.map((it, i) => (
            <button key={i} onClick={() => setActive(i)} className="shrink-0 flex items-center gap-2.5 rounded-xl border px-3.5 py-2.5 transition-all duration-200 text-left min-w-[160px] max-w-[200px]"
              style={{ background: i===active ? `linear-gradient(135deg, ${accentFrom}33, ${accentTo}22)` : "rgba(0,0,0,0.3)", borderColor: i===active ? accentFrom : "rgba(255,255,255,0.1)", boxShadow: i===active ? `0 0 20px rgba(${glowRgb},0.25)` : "none" }}>
              <span className="h-6 w-6 rounded-full flex items-center justify-center text-[11px] font-black shrink-0" style={{ background: i===active ? `linear-gradient(135deg, ${accentFrom}, ${accentTo})` : "rgba(255,255,255,0.08)", color: i===active ? "#fff" : "rgba(255,255,255,0.4)" }}>
                {it.badge ? <Sparkles className="h-3 w-3" /> : i + 1}
              </span>
              <span className="text-xs font-semibold leading-tight line-clamp-2" style={{ color: i===active ? "#fff" : "rgba(255,255,255,0.5)" }}>{it.label}</span>
            </button>
          ))}
        </div>
        <button onClick={() => scroll(1)} className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-black/80 border border-white/15 flex items-center justify-center hover:bg-white/10 transition shadow-lg">
          <ChevronRight className="h-4 w-4 text-white" />
        </button>
      </div>

      <div key={active} className="animate-in fade-in duration-300">
        <VideoBlock item={items[active]} author={author} accentFrom={accentFrom} accentTo={accentTo} glowRgb={glowRgb} />
      </div>
    </div>
  );
}

function PdfCard({ mat, accentFrom, accentTo, glowRgb }: { mat: PdfLocal|PdfDrive; accentFrom: string; accentTo: string; glowRgb: string }) {
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const src = mat.kind==="pdf-local" ? mat.src : `https://drive.google.com/file/d/${(mat as PdfDrive).fileId}/preview`;
  return (
    <div className="rounded-2xl border bg-black/30 overflow-hidden transition-all duration-300" style={{ borderColor: open ? `${accentFrom}55` : "rgba(255,255,255,0.1)", boxShadow: open ? `0 8px 40px rgba(${glowRgb},0.15)` : "none" }}>
      <button onClick={() => { setOpen(v => !v); if (open) setLoaded(false); }} className="w-full flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-4 hover:bg-white/[0.03] transition text-left">
        <div className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: `linear-gradient(135deg, ${accentFrom}, ${accentTo})`, boxShadow: `0 4px 16px ${accentFrom}44` }}><FileText className="h-4 w-4 text-white" /></div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-white text-sm truncate">{mat.label}</p>
          {"desc" in mat && mat.desc && <p className="text-xs text-white/40 mt-0.5 truncate">{mat.desc}</p>}
        </div>
        <span className="hidden sm:inline text-xs text-white/30 mr-1 shrink-0">{open ? "hide" : "view"}</span>
        <ChevronRight className="h-4 w-4 text-white/30 shrink-0 transition-transform" style={{ transform: open ? "rotate(90deg)" : "rotate(0)" }} />
      </button>
      {open && (
        <div className="relative border-t border-white/[0.07]" style={{ height:"min(680px, 75vh)" }}>
          {!loaded && <VideoLoadingOverlay label="Document loading…" />}
          <iframe src={src} className="w-full h-full" title={mat.label} onLoad={() => setLoaded(true)} />
        </div>
      )}
    </div>
  );
}

type Tab = "overview" | "materials";

export default function CourseDetailPage() {
  const { courseId } = (useParams() ?? {}) as { courseId: string };
  const base = COURSES.find((c) => c.id === courseId);
  const detail = DETAILS[courseId];

  const [tab, setTab] = useState<Tab>("overview");
  const [authorImg, setAuthorImg] = useState<string | null>(null);
  const chapters = (detail?.materials.filter(m => m.kind==="chapter") ?? []) as ChapterMat[];
  const pdfs = (detail?.materials.filter(m => m.kind==="pdf-local"||m.kind==="pdf-drive") ?? []) as (PdfLocal|PdfDrive)[];

  // Every video for this course — the overview/spotlight video first, then
  // any chapter that has its own video — browsed as one combined "Videos" tab.
  const videoItems: VideoItem[] = [
    ...(detail?.overviewVideo ? [{ label: detail.overviewVideo.label, video: detail.overviewVideo, badge: base?.isSpotlight ? "Spotlight" : undefined }] : []),
    ...chapters.filter((c): c is ChapterMat & { video: VideoLocal | VideoDrive } => !!c.video)
      .map((c) => ({ label: `Ch ${c.num} — ${c.title}`, video: c.video })),
  ];
  const hasVideo = videoItems.length > 0;

  useEffect(() => { window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior }); }, [courseId]);

  // Fetch Clerk profile picture if a clerkUserId is set
  useEffect(() => {
    if (!base?.clerkUserId) return;
    fetch(`/api/tutor-avatar/${base.clerkUserId}`)
      .then(r => r.json())
      .then(d => { if (d.imageUrl) setAuthorImg(d.imageUrl); })
      .catch(() => {});
  }, [base?.clerkUserId]);

  if (!base || !detail) return notFound();

  return (
    <div className="min-h-screen text-white">
      <StarsBackground />
      <div className="relative overflow-hidden" style={{ background: `linear-gradient(135deg, rgba(${base.glowRgb},0.12) 0%, rgba(0,0,0,0.95) 60%)` }}>
        <div className="absolute inset-0 pointer-events-none">
          <Image src={base.image} alt="" fill className="object-cover opacity-10 blur-2xl scale-110" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/70 to-black" />
        </div>
        <div className="relative z-10 max-w-5xl mx-auto px-5 sm:px-8 pt-10 pb-10">
          <Link href="/tutoring-program" className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white transition mb-6">
            <ArrowLeft className="h-4 w-4" /> All Courses
          </Link>

          {/* 3-column hero: thumbnail | info | author */}
          <div className="grid grid-cols-1 md:grid-cols-[220px_1fr_200px] gap-6 items-stretch">

            {/* Thumbnail */}
            <div className="relative rounded-2xl overflow-hidden border border-white/10 min-h-[180px]" style={{ boxShadow: `0 0 50px rgba(${base.glowRgb},0.3)` }}>
              <Image src={base.image} alt={base.title} fill className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              {base.isSpotlight && (
                <div className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-full border border-amber-400/40 bg-amber-400/15 px-2.5 py-1 text-[10px] font-black text-amber-300 backdrop-blur-sm">
                  <Sparkles className="h-3 w-3" /> SPOTLIGHT
                </div>
              )}
            </div>

            {/* Course info */}
            <div className="flex flex-col justify-center space-y-3">
              <div>
                <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight">{base.title}</h1>
                <p className="text-lg font-semibold mt-1" style={{ background: `linear-gradient(90deg, ${base.accentFrom}, ${base.accentTo})`, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>{base.subtitle}</p>
              </div>
              <p className="text-sm text-white/60 leading-relaxed">{detail.description}</p>
            </div>

            {/* Author card — right column, full height, centered */}
            <div
              className="flex flex-col items-center justify-center gap-4 rounded-2xl border p-5 text-center"
              style={{
                background: `linear-gradient(160deg, ${base.accentFrom}1a, rgba(0,0,0,0.5))`,
                borderColor: `${base.accentFrom}55`,
                boxShadow: `0 0 30px ${base.accentFrom}22`,
              }}
            >
              {/* Avatar */}
              <div className="relative">
                {authorImg ? (
                  <div
                    className="h-20 w-20 rounded-2xl overflow-hidden border-2"
                    style={{ borderColor: base.accentFrom, boxShadow: `0 0 28px ${base.accentFrom}77` }}
                  >
                    <Image src={authorImg} alt={base.author} width={80} height={80} className="object-cover w-full h-full" />
                  </div>
                ) : (
                  <div
                    className="h-20 w-20 rounded-2xl flex items-center justify-center text-white text-3xl font-black border-2"
                    style={{
                      background: `linear-gradient(135deg, ${base.accentFrom}, ${base.accentTo})`,
                      borderColor: `${base.accentFrom}99`,
                      boxShadow: `0 0 32px ${base.accentFrom}66`,
                    }}
                  >
                    {base.author.charAt(0).toUpperCase()}
                  </div>
                )}
                <span
                  className="absolute -bottom-1.5 -right-1.5 h-5 w-5 rounded-full border-2 border-black"
                  style={{ background: `linear-gradient(135deg, ${base.accentFrom}, ${base.accentTo})` }}
                />
              </div>

              {/* Name + role */}
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em]" style={{ color: base.accentFrom }}>Your Tutor</p>
                <p className="text-xl font-black text-white mt-0.5 leading-tight">{base.author}</p>
                {base.authorRole && <p className="text-xs text-white/45 mt-0.5">{base.authorRole}</p>}
                {base.authorTag && (
                  <span
                    className="inline-block text-[10px] font-bold mt-2 px-2.5 py-1 rounded-full"
                    style={{ background: `${base.accentFrom}22`, color: base.accentFrom, border: `1px solid ${base.accentFrom}44` }}
                  >
                    {base.authorTag}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Always-visible tabs */}
      <div className="border-b border-white/10 bg-black/40 backdrop-blur sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 flex gap-1">
          {(["overview","materials"] as Tab[]).map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`relative px-5 py-4 text-sm font-semibold capitalize transition-colors ${tab===t ? "text-white" : "text-white/40 hover:text-white/70"}`}>
              {t==="overview" ? (hasVideo ? "Videos" : "Overview") : t}
              {t==="overview" && videoItems.length > 0 && <span className="ml-1.5 text-[10px] rounded-full px-1.5 py-0.5 font-bold" style={{ background:`${base.accentFrom}33`, color:base.accentFrom }}>{videoItems.length}</span>}
              {t==="materials" && detail.materials.length > 0 && <span className="ml-1.5 text-[10px] rounded-full px-1.5 py-0.5 font-bold" style={{ background:`${base.accentFrom}33`, color:base.accentFrom }}>{detail.materials.length}</span>}
              {tab===t && <span className="absolute bottom-0 inset-x-0 h-0.5 rounded-full" style={{ background:`linear-gradient(90deg, ${base.accentFrom}, ${base.accentTo})` }} />}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-5 sm:px-8 py-10 space-y-10">

        {/* VIDEOS (was "Overview") — every video for the course, browsable by chapter */}
        {tab==="overview" && (
          videoItems.length > 0 ? (
            <div className="space-y-6">
              <VideoChapterSlider items={videoItems} author={base.author} accentFrom={base.accentFrom} accentTo={base.accentTo} glowRgb={base.glowRgb} />
              {detail.driveFolder && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-md flex items-center justify-center shrink-0" style={{ background:`linear-gradient(135deg,${base.accentFrom},${base.accentTo})` }}><Video className="h-3.5 w-3.5 text-white" /></div>
                    <p className="text-sm font-bold text-white">All Course Videos</p>
                    <span className="text-xs text-white/30">— full recorded archive</span>
                  </div>
                  <div className="rounded-2xl overflow-hidden border border-white/10" style={{ height:"420px", boxShadow:`0 4px 30px rgba(${base.glowRgb},0.12)` }}>
                    <iframe src={`https://drive.google.com/embeddedfolderview?id=${detail.driveFolder}#list`} className="w-full h-full bg-white" title="All Course Videos" />
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-2xl border border-white/10 bg-black/30 px-8 py-12 text-center">
              <Video className="h-8 w-8 text-white/20 mx-auto mb-3" />
              <p className="font-bold text-white">Video coming soon</p>
              <p className="text-sm text-white/40 mt-1">Head to the <button onClick={() => setTab("materials")} className="underline text-white/60 hover:text-white transition">Materials tab</button> for all notes and resources.</p>
            </div>
          )
        )}

        {/* MATERIALS — chapters + PDFs for every course */}
        {tab==="materials" && (
          detail.materials.length > 0 ? (
            <div className="space-y-8">
              {chapters.length > 0 && (
                <div>
                  <div className="flex items-center gap-2.5 mb-4">
                    <div className="h-7 w-7 rounded-lg flex items-center justify-center shrink-0" style={{ background:`linear-gradient(135deg,${base.accentFrom},${base.accentTo})` }}><BookOpen className="h-3.5 w-3.5 text-white" /></div>
                    <h3 className="text-sm font-bold text-white/70 uppercase tracking-widest">Chapter Notes</h3>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full" style={{ background:`${base.accentFrom}33`, color:base.accentFrom }}>{chapters.length}</span>
                  </div>
                  <ChapterSlider chapters={chapters} accentFrom={base.accentFrom} accentTo={base.accentTo} glowRgb={base.glowRgb} />
                </div>
              )}
              {pdfs.length > 0 && (
                <div>
                  <div className="flex items-center gap-2.5 mb-4">
                    <div className="h-7 w-7 rounded-lg flex items-center justify-center shrink-0" style={{ background:`linear-gradient(135deg,${base.accentFrom},${base.accentTo})` }}><FileText className="h-3.5 w-3.5 text-white" /></div>
                    <h3 className="text-sm font-bold text-white/70 uppercase tracking-widest">Resources &amp; Past Papers</h3>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full" style={{ background:`${base.accentFrom}33`, color:base.accentFrom }}>{pdfs.length}</span>
                  </div>
                  <div className="space-y-3">{pdfs.map((p,i) => <PdfCard key={i} mat={p} accentFrom={base.accentFrom} accentTo={base.accentTo} glowRgb={base.glowRgb} />)}</div>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-2xl border border-white/10 bg-black/30 px-8 py-12 text-center">
              <FileText className="h-8 w-8 text-white/20 mx-auto mb-3" />
              <p className="font-bold text-white">Materials coming soon</p>
              <p className="text-sm text-white/40 mt-1">Notes and resources will be uploaded here shortly.</p>
            </div>
          )
        )}

        <div className="rounded-2xl border border-white/[0.07] bg-black/30 px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Star className="h-4 w-4 text-amber-300 shrink-0" />
            <p className="text-sm text-white/70"><span className="font-semibold text-white">Want your own course listed?</span> Free &#x2014; seen by 2,000+ students daily.</p>
          </div>
          <a href="mailto:blazerrryt@gmail.com?subject=Tutoring%20Program%20Submission" className="inline-flex items-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-500 px-5 py-2.5 text-sm font-bold text-white shadow-[0_0_20px_rgba(139,92,246,0.4)] transition whitespace-nowrap">
            <Mail className="h-4 w-4" /> Feature My Course <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </div>
  );
}
