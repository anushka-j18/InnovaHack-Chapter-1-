import { useState } from 'react';
import { AppLayout } from './components/layout/AppLayout';
import { HomeView } from './components/views/HomeView';
import { ResearchView } from './components/views/ResearchView';

function App() {
  const [currentQuery, setCurrentQuery] = useState<string | null>(null);

  const handleSearch = (query: string) => {
    setCurrentQuery(query);
  };

  return (
    <AppLayout>
      {!currentQuery ? (
        <HomeView onSearch={handleSearch} />
      ) : (
        <ResearchView query={currentQuery} />
      )}
    </AppLayout>
  );
}

export default App;
