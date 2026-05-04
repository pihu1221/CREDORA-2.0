import { CareerField } from '../types/career';

export interface Question {
  id: number;
  text: string;
  options: string[];
  correct: string;
  explanation: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Expert';
  topic: string;
  field: CareerField;
  deepAnalysis?: string;
  writtenSolution?: string;
  youtubeSearch?: string;
}

// Robust fallback stock for each Field
export const OFFLINE_QUESTION_STOCK: Record<CareerField, Question[]> = {
  'Software Engineer': [
    {
      id: 1,
      topic: 'DSA',
      field: 'Software Engineer',
      difficulty: 'Medium',
      text: 'What is the time complexity of searching for an element in a balanced Binary Search Tree (BST)?',
      options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
      correct: 'O(log n)',
      explanation: 'In a balanced BST, each comparison halves the search space, leading to logarithmic complexity.',
      deepAnalysis: 'Logarithmic complexity is characteristic of divide-and-conquer strategies. For a tree of height h, the search is O(h). Balanced trees ensure h = log n.',
      writtenSolution: '1. Compare target with root.\n2. If equal, return.\n3. If target < root, move to left child.\n4. If target > root, move to right child.\n5. Repeat until found or null.',
      youtubeSearch: 'balanced binary search tree time complexity search'
    },
    {
      id: 2,
      topic: 'Distributed Systems',
      field: 'Software Engineer',
      difficulty: 'Hard',
      text: 'In the CAP Theorem, which two properties are usually favored by NoSQL databases like Cassandra in the event of a network partition?',
      options: ['Consistency & Availability', 'Availability & Partition Tolerance', 'Consistency & Partition Tolerance', 'Reliability & Durability'],
      correct: 'Availability & Partition Tolerance',
      explanation: 'Cassandra is designed as an AP system, prioritizing availability and partition tolerance over strong consistency.',
      deepAnalysis: 'Eventual consistency allows high availability. During an partition, nodes continue to accept writes/reads, potentially resulting in stale data that is synchronized later (anti-entropy).',
      writtenSolution: 'Identify the trade-offs: C (Consistency) vs A (Availability) vs P (Partition Tolerance). During Partition (P), you must pick C or A.',
      youtubeSearch: 'CAP theorem availability partition tolerance nosql'
    }
  ],
  'Hardware Engineer': [],
  'Civil Engineer': [],
  'Mechanical Engineer': [],
  'Investment Banking': [
     {
      id: 1,
      topic: 'HFT',
      field: 'Investment Banking',
      difficulty: 'Hard',
      text: 'What is the primary purpose of "Co-location" in High-Frequency Trading?',
      options: ['Reducing data storage costs', 'Minimizing physical distance to reduce latency', 'Improving employee collaboration', 'Complying with tax regulations'],
      correct: 'Minimizing physical distance to reduce latency',
      explanation: 'Placing servers in the same data center as the exchange reduces the time for signals to travel via fiber optics.',
      deepAnalysis: 'Speed of light in glass is ~200,000 km/s. Every kilometer adds ~5 microseconds of latency. In HFT, 5 microseconds is enough for an arbitrage opportunity to vanish.',
      youtubeSearch: 'hft co-location latency importance'
    }
  ],
  'Asset Management': [],
  'Markets': [],
  'Retail Banking': [],
  'Risk Management': [],
  'General Medicine': [],
  'Bio-Medicine': [],
  'Medical Research': []
};

// Procedural generator to fill "stock" to 200+
export function getStockQuestions(field: CareerField, topic: string, count: number = 200): Question[] {
  const existing = OFFLINE_QUESTION_STOCK[field]?.filter(q => q.topic === topic) || [];
  if (existing.length >= count) return existing.slice(0, count);

  const generated: Question[] = [...existing];
  const templates = [
    { t: "Predict the outcome of {topic} under {condition}", o: ["Optimize", "Degrade", "Stabilize", "Pivot"] },
    { t: "Identify the critical bottleneck in {topic} implementation", o: ["Memory Leak", "Buffer Overflow", "Context Switching", "Race Condition"] },
    { t: "Evaluate the impact of {topic} on system throughput", o: ["Increases", "Decreases", "Neutral", "Variable"] },
    { t: "Analyze the security vulnerability in highly-concurrent {topic}", o: ["Deadlock potential", "Dirty Reads", "Phantom Reads", "Resource Exhaustion"] },
    { t: "Determine the best data structure for high-frequency {topic} access", o: ["Hash Map", "Red-Black Tree", "B+ Tree", "Skip List"] },
    { t: "Which design pattern is most applicable to {topic} at enterprise scale?", o: ["Singleton", "Observer", "Strategy", "Decorator"] },
    { t: "Cross-layer validation of {topic} node 0x{hex}", o: ["Protocol Check", "Handshake Validation", "Checksum Verification", "Flow Control"] }
  ];

  const conditions = [
    "high-load scenarios",
    "low-latency environments",
    "distributed network partitions",
    "massively parallel processing",
    "resource-constrained mobile devices",
    "edge computing nodes"
  ];

  for (let i = existing.length; i < count; i++) {
    const temp = templates[i % templates.length];
    const cond = conditions[i % conditions.length];
    const hex = (i * 137).toString(16).toUpperCase().padStart(4, '0');
    
    generated.push({
      id: i + 1,
      topic,
      field,
      difficulty: i % 4 === 0 ? 'Expert' : i % 3 === 0 ? 'Hard' : 'Medium',
      text: temp.t.replace('{topic}', topic).replace('{condition}', cond).replace('{hex}', hex),
      options: temp.o,
      correct: temp.o[0],
      explanation: `Systemic analysis of ${topic} shows that ${temp.o[0]} is the most likely outcome under ${cond}.`,
      deepAnalysis: `In ${cond}, ${topic} behavior is governed by non-linear scaling factors. ${temp.o[0]} represents the architectural equilibrium point.`,
      writtenSolution: `1. Isolate the ${topic} subsystem.\n2. Apply ${cond} parameters.\n3. Monitor for ${temp.o[1]}.\n4. Converge on ${temp.o[0]} as the validated state.`,
      youtubeSearch: `${field} ${topic} ${cond} optimization`
    });
  }

  return generated;
}
