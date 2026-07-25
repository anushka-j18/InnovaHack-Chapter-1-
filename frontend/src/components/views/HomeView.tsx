import React, { useState } from 'react';
import { Search, ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface HomeViewProps {
  onSearch: (query: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onSearch }) => {
  const [query, setQuery] = useState('');

  const suggestions = [
    "Is intermittent fasting scientifically effective?",
    "Should startups use PostgreSQL or MongoDB?",
    "Is remote work more productive?",
    "Compare GPT-4 and Gemini for coding."
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 animate-fade-in">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-3xl mb-12"
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface border border-white/5 text-primary text-sm font-medium mb-8">
          <Sparkles size={16} />
          <span>Agentic Fact Verification System v2.0</span>
        </div>
        
        <h1 className="text-6xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-br from-white via-gray-200 to-gray-500">
          Research. Verify. Trust.
        </h1>
        
        <p className="text-xl text-gray-400 leading-relaxed max-w-2xl mx-auto">
          An AI-powered multi-agent research system that rigorously verifies information across the web before presenting validated conclusions.
        </p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="w-full max-w-3xl mb-12"
      >
        <form onSubmit={handleSubmit} className="relative group">
          <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
            <Search className="h-6 w-6 text-gray-400 group-focus-within:text-primary transition-colors" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask a research question..."
            className="block w-full pl-16 pr-24 py-6 bg-surface/50 backdrop-blur-xl border border-white/10 rounded-2xl text-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent focus:bg-surface shadow-glass transition-all"
          />
          <button 
            type="submit"
            disabled={!query.trim()}
            className="absolute right-3 top-3 bottom-3 px-6 rounded-xl bg-white text-black font-semibold hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
          >
            <span>Research</span>
            <ArrowRight size={18} />
          </button>
        </form>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        {suggestions.map((suggestion, i) => (
          <button
            key={i}
            onClick={() => {
              setQuery(suggestion);
              onSearch(suggestion);
            }}
            className="glass-panel p-4 text-left hover:bg-surfaceHover transition-colors flex items-start gap-3 group"
          >
            <div className="p-2 rounded-lg bg-surface/50 text-gray-400 group-hover:text-primary transition-colors">
              <Search size={16} />
            </div>
            <span className="text-sm text-gray-300 group-hover:text-white pt-1">{suggestion}</span>
          </button>
        ))}
      </motion.div>
    </div>
  );
};
