// data/subject_drop.ts

export type Topic = {
  id: string;
  name: string;
};

export type Subject = {
  name: string;
  topics: Topic[];
};

export const subjects: Subject[] = [
  // IGCSE Chemistry, 0620
  {
    name: "IGCSE Chemistry",
    topics: [
      { id: "ig_states_of_matter", name: "States of matter" },
      {
        id: "ig_atoms_elemens_compounds",
        name: "Atoms, elements, and compounds",
      },
      { id: "ig_stoichiometry", name: "Stoichiometry" },
      { id: "ig_electrochemistry", name: "Electrochemistry" },
      { id: "ig_chemical_energetics", name: "Chemical energetics" },
      { id: "ig_chemical_reactions", name: "Chemical reactions" },
      { id: "ig_acids_bases_salts", name: "Acids, bases, and salts" },
      { id: "ig_periodic_table", name: "The periodic table" },
      { id: "ig_metals", name: "Metals" },
      { id: "ig_chemistry_environment", name: "Chemistry of the environment" },
      { id: "ig_organic_chemistry", name: "Organic chemistry" },
      { id: "ig_practical", name: "Practical" },
    ],
  },

  // AS level Chemistry, 9701
  {
    name: "AS level Chemistry",
    topics: [
      { id: "as_atomic_structure", name: "Atomic Structure" },
      { id: "as_atoms_and_moles", name: "Atoms, molecules, and stoichiometry" },
      { id: "as_chemical_bonding", name: "Chemical Bonding" },
      { id: "as_states_of_matter", name: "States of Matter" },
      { id: "as_chemical_energetics", name: "Chemical Energetics" },
      { id: "as_electrochemistry", name: "Electrochemistry" },
      { id: "as_equilibria", name: "Equilibria" },
      { id: "as_reaction_kinetics", name: "Reaction Kinetics" },
      { id: "as_periodic_table", name: "Periodic Table" },
      { id: "as_group_two", name: "Group 2" },
      { id: "as_group_seventeen", name: "Group 17" },
      { id: "as_nitrogen_sulfur", name: "Nitrogen and Sulfur" },
      { id: "as_organic_intro", name: "AS Level Organic Introduction" },
      { id: "as_hydrocarbons", name: "Hydrocarbons" },
      { id: "as_halogen_compounds", name: "Halogen Compounds" },
      { id: "as_hydroxy_compounds", name: "Hydroxy Compounds" },
      { id: "as_carbonyl-compounds", name: "Carbonyl Compounds" },
      { id: "as_carboxylic_acids", name: "Carboxylic acids and derivatives" },
      { id: "as_nitrogen_compounds", name: "Nitrogen Compounds" },
      { id: "as_polymerisation", name: "Polymerisation" },
      { id: "as_organic_synthesis", name: "Organic Synthesis" },
      { id: "as_analytical", name: "Analytical Tenchiques" },
    ],
  },

  // A level Chemistry
  {
    name: "A level Chemistry",
    topics: [
      { id: "a_chemical_energetics", name: "Chemical Energetics" },
      { id: "a_electrochemistry", name: "Electrochemistry" },
      { id: "a_equilibria", name: "Equilibria" },
      { id: "a_reaction_kinetics", name: "Reaction Kinetics" },
      { id: "a_group_two", name: "Group 2" },
      {
        id: "a_chemistry_transistion",
        name: "Chemistry of Transistion Elements",
      },
      { id: "a_organic_intro", name: "A Level Organic Introduction" },
      { id: "a_hydrocarbons", name: "Hydrocarbons: arenes" },
      { id: "a_halogen_compounds", name: "Halogen Compounds" },
      { id: "a_hydroxy_compounds", name: "Hydroxy Compounds" },
      { id: "a_carboxylic_acids", name: "Carboxylic acids and derivatives" },
      { id: "a_nitrogen_compounds", name: "Nitrogen Compounds" },
      { id: "a_polymerisation", name: "Polymerisation" },
      { id: "a_organic_synthesis", name: "Organic Synthesis" },
      { id: "a_analytical", name: "Analytical Tenchiques" },
    ],
  },

  // AS level Mathematics, haven't done yet
  {
    name: "AS level Mathematics",
    topics: [
      { id: "algebra", name: "Algebra" },
      { id: "geometry", name: "Geometry" },
      { id: "trigonometry", name: "Trigonometry" },
      { id: "calculus", name: "Calculus" },
      { id: "statistics", name: "Statistics" },
      { id: "probability", name: "Probability" },
      { id: "linear_equations", name: "Linear Equations" },
    ],
  },

  // IGCSE Physics, 0625
  {
    name: "IGCSE Physics",
    topics: [
      { id: "ig_motion", name: "Motion, forces, and energy" },
      { id: "ig_thermal", name: "Thermal physics" },
      { id: "ig_waves", name: "Waves" },
      { id: "ig_electricity", name: "Electricity and magnetism" },
      { id: "ig_nuclear", name: "Nuclear physics" },
      { id: "ig_space", name: "Space physics" },
    ],
  },

  // AS level Physics, 9702
  {
    name: "AS level Physics",
    topics: [
      { id: "as_physical_quantities", name: "Physical quantities and units" },
      { id: "as_kinematics", name: "Kinematics" },
      { id: "as_dynamics", name: "Dynamics" },
      {
        id: "as_forces_density_pressure",
        name: "Forces, density, and pressure",
      },
      { id: "as_work_energy_power", name: "Work, energy, and power" },
      { id: "as_deformation_of_solids", name: "Deformation of solids" },
      { id: "as_waves", name: "Waves" },
      { id: "as_superposition", name: "Superposition" },
      { id: "as_electricity", name: "Electricity" },
      { id: "as_dc_circuits", name: "D.C circuits" },
      { id: "as_particle_physics", name: "Particle physics" },
      { id: "as_practical", name: "AS level Physics practical" },
    ],
  },

  // A level Physics
  {
    name: "A level Physics",
    topics: [
      { id: "a_motion_circle", name: "Motion in a circle" },
      { id: "a_gravitational_fields", name: "Gravitational fields" },
      { id: "a_temperature", name: "Temperature" },
      { id: "a_ideal_gases", name: "Ideal gases" },
      { id: "a_thermodynamics", name: "Thermodynamics" },
      { id: "a_oscillations", name: "Oscillations" },
      { id: "a_electric_fields", name: "Electric fields" },
      { id: "a_capacitance", name: "Capacitance" },
      { id: "a_magnetic_fields", name: "Magnetic fields" },
      { id: "a_alternating_currents", name: "Alternating currents" },
      { id: "a_quantum_physics", name: "Quantum physics" },
      { id: "a_nuclear_physics", name: "Nuclear physics" },
      { id: "a_medical_physics", name: "Medical physics" },
      { id: "a_astronomy", name: "Astronomy and cosmology" },
      { id: "a_practical", name: "A level Physics practical" },
    ],
  },

  // IGCSE Computer Science, 0478
  {
    name: "IGCSE Computer Science",
    topics: [
      { id: "ig_data_representation", name: "Data representation" },
      { id: "ig_data_transmission", name: "Data transimission" },
      { id: "ig_hardware", name: "Hardware" },
      { id: "ig_software", name: "Software" },
      { id: "ig_internet", name: "The internet and its uses" },
      { id: "ig_auto", name: "Automated and emerging technologies" },
      { id: "ig_algorithm", name: "Algorithm design and problem-solving" },
      { id: "ig_programming", name: "Programming" },
      { id: "ig_databases", name: "Databases" },
      { id: "ig_boolean_logic", name: "Boolean logic" },
    ],
  },

  // IGCSE ICT, 0417
  {
    name: "IGCSE ICT",
    topics: [
      { id: "ig_computer", name: "Types and components of computer systems" },
      { id: "ig_input_output", name: "Input and output devices" },
      { id: "ig_storage", name: "Storage devices and media" },
      { id: "ig_network", name: "Networks and the effects of using them" },
      { id: "ig_effects_of_it", name: "The effects of using IT" },
      { id: "ig_app", name: "ICT applications" },
      { id: "ig_systems_life_cycle", name: "The systems life cycle" },
      { id: "ig_safety", name: "Safety and security" },
      { id: "ig_audience", name: "Audience" },
      { id: "ig_communication", name: "Communication" },
      { id: "ig_file_management", name: "File management" },
      { id: "ig_images", name: "Images" },
      { id: "ig_layout", name: "Layout" },
      { id: "ig_styles", name: "Styles" },
      { id: "ig_proofing", name: "Proofing" },
      { id: "ig_graphs", name: "Graphs and charts" },
      { id: "ig_document", name: "Document production" },
      { id: "ig_ict_databases", name: "Databases" },
      { id: "ig_presentations", name: "Presentations" },
      { id: "ig_spreadsheets", name: "Spreadsheets" },
      { id: "ig_website", name: "Website authoring" },
    ],
  },
];
