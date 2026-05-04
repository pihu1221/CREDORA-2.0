import Prism from 'prismjs/components/prism-core';

// Assign to window for languages that expect global Prism
if (typeof window !== 'undefined') {
  (window as any).Prism = Prism;
}

// Load languages in correct dependency order
// Base languages (must be first)
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-json';

// Other languages
import 'prismjs/components/prism-markup-templating';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-go';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-bash';

export default Prism;
