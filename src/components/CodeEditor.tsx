import React, { useRef, useMemo } from 'react';
import Prism from '../lib/prism';

import 'prismjs/themes/prism-tomorrow.css';

interface CodeEditorProps {
  code: string;
  onChange: (value: string) => void;
  language?: string;
  className?: string;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({ 
  code, 
  onChange, 
  language = 'javascript',
  className = ""
}) => {
  const preRef = useRef<HTMLPreElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleScroll = () => {
    if (textareaRef.current && preRef.current) {
      preRef.current.scrollTop = textareaRef.current.scrollTop;
      preRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.currentTarget.selectionStart;
      const end = e.currentTarget.selectionEnd;
      const newValue = code.substring(0, start) + '  ' + code.substring(end);
      onChange(newValue);
      
      // Reset cursor position after React re-render
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 2;
        }
      }, 0);
    }
  };

  const highlightedCode = useMemo(() => {
    const lang = Prism.languages[language] || Prism.languages.javascript;
    // Prism.highlight returns an HTML string
    return Prism.highlight(code || "", lang, language);
  }, [code, language]);

  return (
    <div className={`relative w-full h-full group rounded-xl overflow-hidden border border-white/10 bg-black/60 ${className}`}>
      {/* Container for scroll synchronization */}
      <div className="relative w-full h-full overflow-auto" onScroll={handleScroll}>
        <div className="relative min-h-full" style={{ width: 'fit-content', minWidth: '100%' }}>
          {/* Background/Highlighter */}
          <pre
            ref={preRef}
            className={`m-0 p-8 md:p-10 pointer-events-none whitespace-pre-wrap break-all font-mono text-lg md:text-xl leading-relaxed language-${language}`}
            aria-hidden="true"
            dangerouslySetInnerHTML={{ __html: (highlightedCode || " ") + '\n' }}
            style={{ color: '#e2e8f0', minHeight: '100%' }}
          />
          
          {/* Top text area */}
          <textarea
            ref={textareaRef}
            value={code}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            className="absolute inset-0 w-full h-full p-8 md:p-10 bg-transparent text-transparent caret-blue-400 outline-none resize-none font-mono text-lg md:text-xl leading-relaxed whitespace-pre-wrap break-all border-none focus:ring-0 selection:bg-blue-500/30"
            spellCheck="false"
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
          />
        </div>
      </div>
    </div>
  );
};
