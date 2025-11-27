import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { playbooksAPI, Playbook } from '../services/api';

interface PlaybookPageProps {
  subChannel: string;
}

export function PlaybookPage({ subChannel }: PlaybookPageProps) {
  const [playbook, setPlaybook] = useState<Playbook | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGeneratePlaybook = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await playbooksAPI.generate(subChannel);
      setPlaybook(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate playbook');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Playbook: {subChannel}</h2>
        <button
          onClick={handleGeneratePlaybook}
          disabled={isLoading}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {isLoading ? 'Generating...' : 'Generate Playbook'}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded text-red-700">
          {error}
        </div>
      )}

      {playbook && (
        <div className="p-6 bg-card border rounded-lg">
          <div className="mb-4 pb-4 border-b">
            <p className="text-sm text-muted-foreground">
              Version {playbook.version} • Updated{' '}
              {new Date(playbook.updatedAt || '').toLocaleDateString()}
            </p>
          </div>

          <div className="prose prose-sm max-w-none dark:prose-invert">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {playbook.contentMd}
            </ReactMarkdown>
          </div>
        </div>
      )}

      {!playbook && !isLoading && (
        <div className="p-6 bg-muted rounded-lg text-center text-muted-foreground">
          Click "Generate Playbook" to create a comprehensive playbook for this sub-channel
        </div>
      )}
    </div>
  );
}
