import { useEffect, useState } from 'react';
import { huntsAPI, Hunt } from '../services/api';

interface HuntListProps {
  refreshTrigger?: number;
}

export function HuntList({ refreshTrigger }: HuntListProps) {
  const [hunts, setHunts] = useState<Hunt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

      <div className="grid gap-4">
        {hunts.map((hunt) => (
          <div key={hunt.id} className="p-6 bg-card border rounded-lg">
            <div className="flex justify-between items-start mb-4">
              <div>
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

            <div className="mb-4">
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
                <h4 className="font-semibold mb-3">Top 3 Accounts</h4>
                <div className="space-y-2">
                  {hunt.accounts.slice(0, 3).map((account, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-muted rounded flex justify-between items-start"
                    >
                      <div>
                        <p className="font-medium">{account.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Step {account.currentStep}/10 • {account.stage}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-primary">{account.score}/100</div>
                        <div className="w-12 h-2 bg-secondary rounded-full overflow-hidden mt-1">
                          <div
                            className="h-full bg-primary"
                            style={{ width: `${account.score}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
