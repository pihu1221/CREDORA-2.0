/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
}

export interface Topic {
  id: string;
  title: string;
  youtubeId: string;
  description: string;
  questions: Question[];
}

export const learningData: Topic[] = [
  {
    id: 'dsa-mastery',
    title: 'Data Structures & Algorithms',
    youtubeId: '8hly31xKli0', // freeCodeCamp - Algorithms and Data Structures Full Course
    description: 'Master the fundamental building blocks of efficient software engineering.',
    questions: [
      { id: 'ds1', difficulty: 'easy', text: 'What is the time complexity of searching in a Hash Map (average case)?', options: ['O(1)', 'O(log n)', 'O(n)', 'O(n^2)'], correctAnswer: 'O(1)' },
      { id: 'ds2', difficulty: 'easy', text: 'Which data structure follows LIFO (Last In First Out)?', options: ['Queue', 'Stack', 'Linked List', 'Tree'], correctAnswer: 'Stack' },
      { id: 'ds3', difficulty: 'medium', text: 'What is the worst-case time complexity of Quick Sort?', options: ['O(n log n)', 'O(n)', 'O(n^2)', 'O(log n)'], correctAnswer: 'O(n^2)' },
      { id: 'ds4', difficulty: 'medium', text: 'Which traversal method visits the root after its subtrees?', options: ['Pre-order', 'In-order', 'Post-order', 'Level-order'], correctAnswer: 'Post-order' },
      { id: 'ds5', difficulty: 'hard', text: 'How do you detect a cycle in a Linked List efficiently?', options: ['Hash Map', 'Two Pointers (Floyd\'s)', 'Recursion', 'Double traversal'], correctAnswer: 'Two Pointers (Floyd\'s)' },
      { id: 'ds6', difficulty: 'hard', text: 'What is the time complexity of building a heap from an array of size n?', options: ['O(n log n)', 'O(n)', 'O(log n)', 'O(n^2)'], correctAnswer: 'O(n)' },
      { id: 'ds7', difficulty: 'expert', text: 'Which algorithm finds the shortest path in a graph with negative edge weights?', options: ['Dijkstra', 'Bellman-Ford', 'Prim', 'Kruskal'], correctAnswer: 'Bellman-Ford' },
      { id: 'ds8', difficulty: 'expert', text: 'The "Knapsack Problem" is typically solved using:', options: ['Greedy Approach', 'Divide and Conquer', 'Dynamic Programming', 'Linear Search'], correctAnswer: 'Dynamic Programming' },
      { id: 'ds9', difficulty: 'medium', text: 'What is the height of a balanced Binary Search Tree with n nodes?', options: ['O(log n)', 'O(n)', 'O(sqrt(n))', 'O(1)'], correctAnswer: 'O(log n)' },
      { id: 'ds10', difficulty: 'hard', text: 'Which data structure is best suited for implementing a BFS traversal?', options: ['Stack', 'Queue', 'Priority Queue', 'Set'], correctAnswer: 'Queue' },
    ]
  },
  {
    id: 'web-perf',
    title: 'Web Performance & Engineering',
    youtubeId: '09_LlHjoEiY', // graph theory is also good, but let's find a web one
    description: 'Optimize high-scale web applications for maximum velocity and reliability.',
    questions: [
      { id: 'wp1', difficulty: 'easy', text: 'What does "DOM" stand for?', options: ['Document Object Model', 'Data Object Management', 'Digital Online Media', 'Distributed Object Mode'], correctAnswer: 'Document Object Model' },
      { id: 'wp2', difficulty: 'easy', text: 'Which HTTP method is idempotent?', options: ['POST', 'GET', 'PATCH', 'DELETE'], correctAnswer: 'GET' },
      { id: 'wp3', difficulty: 'medium', text: 'What is the "Critical Rendering Path"?', options: ['The order of JS execution', 'The sequence of steps to render a page', 'A security layer', 'Network route optimization'], correctAnswer: 'The sequence of steps to render a page' },
      { id: 'wp4', difficulty: 'medium', text: 'What is the difference between debounce and throttle?', options: ['No difference', 'Debounce waits for silence; Throttle limits execution frequency', 'Throttle waits for silence; Debounce limits frequency', 'Only apply to mouse events'], correctAnswer: 'Debounce waits for silence; Throttle limits execution frequency' },
      { id: 'wp5', difficulty: 'hard', text: 'Explain the "Hydration" process in SSR.', options: ['Injecting CSS into HTML', 'Attaching event listeners to static HTML', 'Database sync', 'Image compression'], correctAnswer: 'Attaching event listeners to static HTML' },
    ]
  },
  {
    id: 'cloud-native',
    title: 'Cloud Native Systems',
    youtubeId: 'mGe670aB4u0', // AWS Certified Cloud Practitioner
    description: 'Architecting resilient, distributed systems using modern cloud primitives.',
    questions: [
      { id: 'cn1', difficulty: 'easy', text: 'What is "Serverless" computing?', options: ['No servers involved', 'User doesn\'t manage servers', 'Physical servers don\'t exist', 'Offline computing'], correctAnswer: 'User doesn\'t manage servers' },
      { id: 'cn2', difficulty: 'medium', text: 'Which property ensures a transaction leaves a database in a valid state?', options: ['Atomicity', 'Consistency', 'Isolation', 'Durability'], correctAnswer: 'Consistency' },
      { id: 'cn3', difficulty: 'hard', text: 'Describe "Circuit Breaker" pattern in microservices.', options: ['Voltage control', 'Failing fast to save system resources', 'Network isolation', 'Model training'], correctAnswer: 'Failing fast to save system resources' },
    ]
  },
  {
    id: 'ai-engineering',
    title: 'AI & Neural Networks',
    youtubeId: 'aircAruvnKk', // But what is a neural network?
    description: 'Designing and deploying sophisticated neural architectures.',
    questions: [
      { id: 'ai1', difficulty: 'medium', text: 'What is the purpose of "Softmax" function?', options: ['Binary classification', 'Regressing values', 'Converting scores to probabilities', 'Image filtering'], correctAnswer: 'Converting scores to probabilities' },
      { id: 'ai2', difficulty: 'hard', text: 'What prevents vanishing gradients?', options: ['ReLU activation', 'Sigmoid activation', 'Linear activation', 'Normal distribution'], correctAnswer: 'ReLU activation' },
    ]
  }
];
