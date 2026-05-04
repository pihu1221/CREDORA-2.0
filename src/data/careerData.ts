import { CareerPath } from '../types/career';

// Helper mapping for categories to base paths
const baseDoctor = {
  field: 'Medical',
  description: 'Advance in diagnostic accuracy, clinical research, and specialized care.',
  topics: [
    {
      id: 'med-1',
      title: 'Genomic Medicine',
      description: 'Personalized treatment through genetic sequencing.',
      lectures: [
        { id: 'm-l1', title: 'CRISPR Applications', duration: '40m', type: 'video', youtubeVideoId: '6tw_JVz_IEc' },
        { id: 'm-l2', title: 'Pharmacogenomics', duration: '25m', type: 'interactive', youtubeVideoId: 'S-7A6xZbeM0' }
      ],
      subtopics: [
        { id: 'm-st1', title: 'DNA Sequencing Tech', questions: [] },
        { id: 'm-st2', title: 'Epigenetic Markers', questions: [] }
      ]
    },
    {
      id: 'med-2',
      title: 'Emergency Diagnostics',
      description: 'Rapid decision making in critical care environments.',
      lectures: [
        { id: 'm-l3', title: 'Point-of-Care Ultrasound', duration: '30m', type: 'video' },
        { id: 'm-l4', title: 'Trauma Management 101', duration: '45m', type: 'video' }
      ],
      subtopics: [
        { id: 'm-st3', title: 'Shock Response Paths', questions: [] },
        { id: 'm-st4', title: 'Respiratory Failure', questions: [] }
      ]
    }
  ]
};

const baseEngineer = {
  field: 'Engineer',
  description: 'Master the art of building scalable, secure, and intelligent systems.',
  topics: [
    {
      id: 'eng-0',
      title: 'Data Structures & Algorithms (DSA)',
      description: 'The fundamental building blocks of all software engineering at scale.',
      lectures: [
        { id: 'dsa-l1', title: 'Big O & Arrays', duration: '45m', type: 'video', youtubeVideoId: 'RBSGKlAvoiM' },
        { id: 'dsa-l2', title: 'Linked Lists & Stacks', duration: '38m', type: 'video', youtubeVideoId: 'Wwfb6P882jY' }
      ],
      subtopics: [
        { id: 'dsa-st1', title: 'Time Complexity Analysis', questions: [] },
        { id: 'dsa-st2', title: 'Recursion & Backtracking', questions: [] }
      ]
    },
    {
      id: 'eng-sys',
      title: 'Advanced System Design',
      description: 'Architecting high-availability systems with millions of TPS.',
      lectures: [
        { id: 'sys-l1', title: 'Load Balancing & Proxies', duration: '55m', type: 'video', youtubeVideoId: 'i53Gi_K397I' },
        { id: 'sys-l2', title: 'Sharding & Replication', duration: '42m', type: 'video', youtubeVideoId: 'S-7A6xZbeM0' }
      ],
      subtopics: [
        { id: 'sys-st1', title: 'Database Scalability', questions: [] },
        { id: 'sys-st2', title: 'Consistent Hashing', questions: [] }
      ]
    },
    {
      id: 'eng-1',
      title: 'System Design & Architecture',
      description: 'Designing for millions of users with high availability.',
      lectures: [
        { id: 'l1', title: 'Distributed Systems', duration: '25m', type: 'video', youtubeVideoId: 'ySExwhuwwao' },
        { id: 'l2', title: 'Microservices Strategy', duration: '18m', type: 'video', youtubeVideoId: 'S-7A6xZbeM0' }
      ],
      subtopics: [
        { id: 'st1', title: 'Availability vs Consistency', questions: [] },
        { id: 'st2', title: 'Database Sharding', questions: [] }
      ]
    }
  ]
};

const baseFinance = {
  field: 'Finance',
  description: 'Master global markets, risk modeling, and strategic asset management.',
  topics: [
    {
      id: 'fin-1',
      title: 'Quantiative Analysis',
      description: 'Advanced statistical models for financial risk.',
      lectures: [
        { id: 'f-l1', title: 'Monte Carlo Simulations', duration: '35m', type: 'video', youtubeVideoId: '7ESK5SaP-bc' },
        { id: 'f-l2', title: 'Value at Risk (VaR)', duration: '25m', type: 'reading', youtubeVideoId: 'r53m159DCOm' }
      ],
      subtopics: [
        { id: 'f-st1', title: 'Stochastic Calculus', questions: [] },
        { id: 'f-st2', title: 'Market Volatility', questions: [] }
      ]
    }
  ]
};

const baseBank = {
  field: 'Bank',
  description: 'Lead digital transformation and strategic lending in modern banking.',
  topics: [
    {
      id: 'bank-1',
      title: 'Digital Asset Banking',
      description: 'Integrating CBDCs and digital tokens into traditional banking.',
      lectures: [
        { id: 'b-l1', title: 'Introduction to CBDCs', duration: '20m', type: 'video', youtubeVideoId: '8JKjvY4et6Y' },
        { id: 'b-l2', title: 'Smart Contract Audits', duration: '35m', type: 'reading' }
      ],
      subtopics: [
        { id: 'b-st1', title: 'Ledger Interoperability', questions: [] },
        { id: 'b-st2', title: 'Security Protocols', questions: [] }
      ]
    }
  ]
};

export const CAREER_PATHS: Record<string, any> = {
  // Software Engineer
  'Software Engineer': {
    ...baseEngineer,
    field: 'Software Engineer',
    description: 'Specialized in algorithmic efficiency, clean architecture, and AI integration.'
  },
  'Software Engineer (Data Analysis)': {
    ...baseEngineer,
    topics: [
      ...baseEngineer.topics,
      {
        id: 'da-1',
        title: 'Neural Data Synthesis',
        description: 'Advanced data mining and predictive modeling using AI.',
        lectures: [
          { id: 'da-l1', title: 'Pandas for Scale', duration: '50m', type: 'video', youtubeVideoId: 'S-7A6xZbeM0' }
        ],
        subtopics: [
          { id: 'da-st1', title: 'Feature Engineering', questions: [] }
        ]
      }
    ]
  },
  'Software Engineer (Cybersecurity)': {
    ...baseEngineer,
    topics: [
      ...baseEngineer.topics,
      {
        id: 'cs-1',
        title: 'Offensive Grid Protocols',
        description: 'Ethical hacking and breach simulation.',
        lectures: [
          { id: 'cs-l1', title: 'Kali Linux Mastery', duration: '60m', type: 'video', youtubeVideoId: 'S-7A6xZbeM0' }
        ],
        subtopics: [
          { id: 'cs-st1', title: 'Buffer Overflows', questions: [] }
        ]
      }
    ]
  },
  'Software Engineer (Cloud Computing)': {
    ...baseEngineer,
    topics: [
      ...baseEngineer.topics,
      {
        id: 'cc-1',
        title: 'Distributed Cloud Logic',
        description: 'Kubernetes, Docker, and Auto-scaling Architectures.',
        lectures: [
          { id: 'cc-l1', title: 'K8s Orchestration', duration: '55m', type: 'video', youtubeVideoId: 'S-7A6xZbeM0' }
        ],
        subtopics: [
          { id: 'cc-st1', title: 'Microservices Mesh', questions: [] }
        ]
      }
    ]
  },
  'Engineer (Data Analysis)': {
    ...baseEngineer,
    topics: [
      ...baseEngineer.topics,
      {
        id: 'da-1',
        title: 'Neural Data Synthesis',
        description: 'Advanced data mining and predictive modeling using AI.',
        lectures: [
          { id: 'da-l1', title: 'Pandas for Scale', duration: '50m', type: 'video', youtubeVideoId: 'S-7A6xZbeM0' }
        ],
        subtopics: [
          { id: 'da-st1', title: 'Feature Engineering', questions: [] }
        ]
      }
    ]
  },
  'Engineer (Cybersecurity)': {
    ...baseEngineer,
    topics: [
      ...baseEngineer.topics,
      {
        id: 'cs-1',
        title: 'Offensive Grid Protocols',
        description: 'Ethical hacking and breach simulation.',
        lectures: [
          { id: 'cs-l1', title: 'Kali Linux Mastery', duration: '60m', type: 'video', youtubeVideoId: 'S-7A6xZbeM0' }
        ],
        subtopics: [
          { id: 'cs-st1', title: 'Buffer Overflows', questions: [] }
        ]
      }
    ]
  },
  'Engineer (Cloud Computing)': {
    ...baseEngineer,
    topics: [
      ...baseEngineer.topics,
      {
        id: 'cc-1',
        title: 'Distributed Cloud Logic',
        description: 'Kubernetes, Docker, and Auto-scaling Architectures.',
        lectures: [
          { id: 'cc-l1', title: 'K8s Orchestration', duration: '55m', type: 'video', youtubeVideoId: 'S-7A6xZbeM0' }
        ],
        subtopics: [
          { id: 'cc-st1', title: 'Microservices Mesh', questions: [] }
        ]
      }
    ]
  },
  // Fallback / Base Aliases
  'Engineer': baseEngineer
};

