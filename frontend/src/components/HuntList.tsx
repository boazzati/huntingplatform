import { useEffect, useState } from 'react';
import { huntsAPI, Hunt } from '../services/api';

interface HuntListProps {
  refreshTrigger?: number;
  onHuntSelect?: (huntId: string) => void;
}

const HUNTING_STEPS = [
  'Define Opportunity',
  'Scan Universe',
  'Prioritise & Score',
  'Insight & Hypothesis',
  'PepsiCo Value Proposition',
  'Internal Alignment',
  'Approach Plan',
  'Discovery & Qualification',
  'Proposal & Negotiation',
  'Pilot & Learn'
];

export function HuntList({ refreshTrigger, onHuntSelect }: HuntListProps) {
  const [hunts, setHunts] = useState<Hunt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadHunts();
  }, [refreshTrigger]);

  const loadHunts = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await huntsAPI.list();
      setHunts(response.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load hunts');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteHunt = async (huntId: string, huntName: string) => {
    if (!window.confirm(`Are you sure you want to delete the hunt "${huntName}"? This action cannot be undone.`)) {
      return;
    }

    setDeletingId(huntId);
    try {
      await huntsAPI.delete(huntId);
      setHunts(hunts.filter(h => h.id !== huntId));
    } catch (err) {
      alert(`Failed to delete hunt: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading) {
    return <div className="p-6 text-center">Loading hunts...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-600">Error: {error}</div>;
  }

  if (hunts.length === 0) {
    return <div className="p-6 text-center text-muted-foreground">No hunts yet. Create one to get started!</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Recent Hunts</h2>

      <div className="grid gap-4 md:grid-cols-2">
        {hunts.map((hunt) => {
          const currentStep = hunt.currentStep || 1;
          const stepName = HUNTING_STEPS[currentStep - 1];
          const isDeleting = deletingId === hunt.id;
          
          return (
            <div
              key={hunt.id}
              className={`p-6 bg-card border rounded-lg hover:shadow-lg transition-all ${
                isDeleting ? 'opacity-50 pointer-events-none' : 'hover:border-primary'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div
                  onClick={() => !isDeleting && onHuntSelect?.(hunt.id || '')}
                  className="flex-1 cursor-pointer"
                >
                  <h3 className="text-lg font-semibold">{hunt.subChannel}</h3>
                  <p className="text-sm text-muted-foreground">
                    {new Date(hunt.createdAt || '').toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">
                    {hunt.huntResult.totalAccounts}
                  </div>
                  <p className="text-sm text-muted-foreground">Accounts</p>
                </div>
              </div>

              {/* 10-Step Progress */}
              <div
                onClick={() => !isDeleting && onHuntSelect?.(hunt.id || '')}
                className="mb-4 p-3 bg-primary/5 rounded-lg cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-primary">Step {currentStep}/10</span>
                  <span className="text-xs font-medium">{stepName}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${(currentStep / 10) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div
                onClick={() => !isDeleting && onHuntSelect?.(hunt.id || '')}
                className="mb-4 cursor-pointer"
              >
                <p className="text-sm mb-2">
                  <strong>Markets:</strong> {hunt.markets.join(', ')}
                </p>
                <p className="text-sm mb-2">
                  <strong>Brands:</strong> {hunt.focusBrands.join(', ')}
                </p>
                <p className="text-sm text-muted-foreground">{hunt.huntResult.summary}</p>
              </div>

              {hunt.accounts.length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <h4 className="font-semibold mb-3 text-sm">Top 3 Accounts</h4>
                  <div className="space-y-2">
                    {hunt.accounts.slice(0, 3).map((account, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-muted rounded flex justify-between items-start"
                      >
                        <div>
                          <p className="font-medium text-sm">{account.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Step {account.step || 1}/10
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-primary text-sm">{account.score || 0}/100</div>
                          <div className="w-12 h-2 bg-secondary rounded-full overflow-hidden mt-1">
                            <div
                              className="h-full bg-primary"
                              style={{ width: `${(account.score || 0) / 100 * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => !isDeleting && onHuntSelect?.(hunt.id || '')}
                  className="flex-1 px-3 py-2 bg-primary/10 text-primary rounded text-sm font-medium hover:bg-primary/20 transition-colors disabled:opacity-50"
                  disabled={isDeleting}
                >
                  View Details →
                </button>
                <button
                  onClick={() => handleDeleteHunt(hunt.id || '', hunt.subChannel)}
                  className="px-3 py-2 bg-red-50 text-red-600 rounded text-sm font-medium hover:bg-red-100 transition-colors disabled:opacity-50"
                  disabled={isDeleting}
                  title="Delete this hunt"
                >
                  {isDeleting ? '...' : '🗑️'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
