const branchData = {
  cs: {
    name: "Computer Science & Engineering",
    subjects: [
      {
        id: "ds",
        name: "Data Structures & Algorithms",
        notes: [
          {
            title: "Linear vs Non-Linear Data Structures",
            content: "Linear structures (Arrays, Linked Lists, Stacks, Queues) store elements sequentially. Non-linear structures (Trees, Graphs) store elements in hierarchical or interconnected relationships, where elements can have multiple paths."
          },
          {
            title: "Stack Operations & Applications",
            content: "A Stack follows Last-In-First-Out (LIFO). Primary operations are push() (insert) and pop() (remove). Common applications include function call management, expression evaluation (Infix to Postfix), and undo/redo operations."
          },
          {
            title: "Time Complexity & Big O Notation",
            content: "Big O notation describes the upper bound of execution time or space requirement. Common complexities are O(1) Constant, O(log n) Logarithmic (binary search), O(n) Linear (linear search), and O(n log n) Log-linear (merge sort)."
          }
        ],
        questions: [
          {
            q: "What is a Linked List and how does it differ from an Array?",
            a: "A Linked List is a linear data structure where elements (nodes) are stored dynamically in memory, and each node points to the next node using pointers. Unlike arrays, linked lists do not require contiguous memory allocation, allowing for efficient insertions and deletions at O(1) time without resizing, but elements cannot be accessed randomly."
          },
          {
            q: "Explain Stack Overflow and Stack Underflow conditions.",
            a: "Stack Overflow occurs when an application tries to push an element onto a stack that is already full, exceeding its maximum pre-allocated memory size. Stack Underflow occurs when an application tries to pop or access an element from a stack that is empty."
          },
          {
            q: "Explain Binary Search and its time complexity.",
            a: "Binary Search is a divide-and-conquer algorithm to find an item in a sorted list. It compares the target with the middle element, discarding half the list at each step. Its time complexity is O(log n) because the search space is halved every iteration."
          }
        ]
      },
      {
        id: "se",
        name: "Software Engineering",
        notes: [
          {
            title: "Software Development Life Cycle (SDLC)",
            content: "SDLC is a structured process used to design, develop, and test high-quality software. Stages include Requirement Analysis, Feasibility Study, Design, Coding, Testing, and Deployment."
          },
          {
            title: "Agile Methodology",
            content: "Agile focuses on iterative development, collaboration, and adaptability. Work is broken into small, time-boxed units called sprints (typically 2-4 weeks), delivering functional software incrementally."
          }
        ],
        questions: [
          {
            q: "What is the difference between Waterfall and Agile models?",
            a: "Waterfall is a sequential, rigid model where each phase must finish before the next begins. It struggles with changing requirements. Agile is dynamic and iterative, welcoming feedback and changes throughout development, delivering features incrementally."
          },
          {
            q: "Explain Black Box and White Box Testing.",
            a: "Black Box testing evaluates software functionality without knowing its internal code structure (focusing strictly on inputs and outputs). White Box testing inspects the internal code, logic paths, and structures of the program to ensure paths are correct."
          }
        ]
      }
    ]
  },
  ee: {
    name: "Electrical & Electronics Engineering",
    subjects: [
      {
        id: "em",
        name: "Electrical Machines",
        notes: [
          {
            title: "Faraday's Law of Electromagnetic Induction",
            content: "States that a change in magnetic flux passing through a loop of wire induces an electromotive force (EMF) in it. It forms the foundational working principle of electrical generators, motors, and transformers."
          },
          {
            title: "Transformers working principle",
            content: "A transformer transfers electrical energy between circuits through electromagnetic induction without changing frequency. It consists of primary and secondary coils wound on a shared magnetic core."
          }
        ],
        questions: [
          {
            q: "Why is a transformer rating given in kVA and not in kW?",
            a: "Transformer losses depend on voltage (iron losses) and current (copper losses), independent of the load power factor. Since power factor depends on the connected load and not the transformer itself, transformers are rated in Apparent Power (kVA) rather than Active Power (kW)."
          },
          {
            q: "Explain the difference between DC generator and DC motor.",
            a: "A DC generator converts mechanical energy into electrical energy based on Faraday's Induction law. A DC motor converts electrical energy into mechanical torque based on the Lorentz force law (current-carrying conductor in a magnetic field)."
          }
        ]
      }
    ]
  },
  me: {
    name: "Mechanical Engineering",
    subjects: [
      {
        id: "td",
        name: "Thermodynamics",
        notes: [
          {
            title: "First Law of Thermodynamics",
            content: "Essentially the Law of Conservation of Energy: Energy cannot be created or destroyed, only transformed. For a closed system, net heat added equals change in internal energy plus work done (Q = ΔU + W)."
          },
          {
            title: "Entropy and Second Law",
            content: "States that the total entropy (disorder) of an isolated system always increases over time. Heat cannot spontaneously flow from a cooler body to a warmer body without external work input."
          }
        ],
        questions: [
          {
            q: "What is the difference between open, closed, and isolated systems?",
            a: "An Open system can exchange both energy and mass with surroundings (e.g., turbine). A Closed system can exchange energy but not mass (e.g., piston cylinder). An Isolated system cannot exchange either energy or mass (e.g., thermos flask)."
          },
          {
            q: "Explain the working cycles of a 4-stroke petrol engine.",
            a: "It operates on the Otto cycle over four strokes: 1. Suction (intakes fuel-air mixture), 2. Compression (compresses mixture), 3. Power (spark ignition drives piston down), and 4. Exhaust (pushes burned gases out)."
          }
        ]
      }
    ]
  },
  ce: {
    name: "Civil Engineering",
    subjects: [
      {
        id: "ct",
        name: "Concrete Technology",
        notes: [
          {
            title: "Hydration of Cement",
            content: "A chemical reaction between cement and water that releases heat (exothermic). This reaction forms calcium silicate hydrate (C-S-H) gel, binding sand and gravel into hard concrete."
          },
          {
            title: "Workability of Concrete",
            content: "Indicates how easily concrete can be mixed, transported, placed, and compacted without segregation. It is commonly measured using the Slump Test."
          }
        ],
        questions: [
          {
            q: "Why is reinforcement steel placed in the tension zone of concrete beams?",
            a: "Concrete is strong in compression but very weak in tension. Steel has high tensile strength. Placing steel bars in the tension zone (usually the bottom of a simply supported beam) prevents cracking and structural failure under load."
          },
          {
            q: "What is curing of concrete and why is it essential?",
            a: "Curing is keeping concrete moist and warm enough after placement to sustain cement hydration. It ensures the concrete develops design strength, improves durability, and prevents shrinkage cracks."
          }
        ]
      }
    ]
  }
};

window.branchData = branchData;
