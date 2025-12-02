import { useState } from 'react';
import './styles/globals.css';
import { HuntForm } from './components/HuntForm';
import { HuntList } from './components/HuntList';
import { PlaybookPage } from './components/PlaybookPage';

type Page = 'hunts' | 'playbook';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('hunts');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [selectedSubChannel, setSelectedSubChannel] = useState('');
  
  // Deployment trigger
  console.log('AFH Hunting Engine v1.0.0 - Deployed');

  const handleHuntSuccess = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-primary">🎯 AFH Hunting Engine</h1>
              <p className="text-xs text-muted-foreground mt-1">v1.0.0 - Live</p>
            </div>
            <p className="text-sm text-muted-foreground">
              10-Step Business Development Automation for PepsiCo
            </p>
          </div>

          {/* Navigation */}
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage('hunts')}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                currentPage === 'hunts'
                  ? 'bg-primary text-white'
                  : 'bg-muted hover:bg-muted/80'
              }`}
            >
              Hunts
            </button>
            <button
              onClick={() => setCurrentPage('playbook')}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                currentPage === 'playbook'
                  ? 'bg-primary text-white'
                  : 'bg-muted hover:bg-muted/80'
              }`}
            >
              Playbooks
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {currentPage === 'hunts' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <HuntForm onSuccess={handleHuntSuccess} />
            </div>
            <div className="lg:col-span-2">
              <HuntList refreshTrigger={refreshTrigger} />
            </div>
          </div>
        )}

        {currentPage === 'playbook' && (
          <div className="space-y-6">
            <div className="p-6 bg-card border rounded-lg">
              <label className="block text-sm font-medium mb-2">Select Sub-Channel</label>
              <input
                type="text"
                value={selectedSubChannel}
                onChange={(e) => setSelectedSubChannel(e.target.value)}
                placeholder="e.g., QSR, Convenience, Foodservice"
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {selectedSubChannel && (
              <PlaybookPage subChannel={selectedSubChannel} />
            )}

            {!selectedSubChannel && (
              <div className="p-6 bg-muted rounded-lg text-center text-muted-foreground">
                Enter a sub-channel name to generate or view its playbook
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t bg-card mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          <p>AFH Hunting Engine • Powered by AI & the 10-Step Hunting Model</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
