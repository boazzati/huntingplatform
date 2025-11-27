import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { huntsAPI } from '../services/api';

const huntFormSchema = z.object({
  subChannel: z.string().min(1, 'Sub-channel is required'),
  markets: z.string().min(1, 'At least one market is required'),
  focusBrands: z.string().min(1, 'At least one focus brand is required'),
  maxAccounts: z.coerce.number().min(1).max(50).default(10),
});

type HuntFormData = z.infer<typeof huntFormSchema>;

interface HuntFormProps {
  onSuccess?: (huntId: string) => void;
}

export function HuntForm({ onSuccess }: HuntFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<HuntFormData>({
    resolver: zodResolver(huntFormSchema),
    defaultValues: {
      maxAccounts: 10,
    },
  });

  const onSubmit = async (data: HuntFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const hunt = await huntsAPI.create({
        subChannel: data.subChannel,
        markets: data.markets.split(',').map((m) => m.trim()),
        focusBrands: data.focusBrands.split(',').map((b) => b.trim()),
        maxAccounts: data.maxAccounts,
      });

      reset();
      onSuccess?.(hunt.id || '');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create hunt');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-6 bg-card rounded-lg border">
      <h2 className="text-2xl font-bold">Create New Hunt</h2>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded text-red-700">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-2">Sub-Channel</label>
        <input
          {...register('subChannel')}
          type="text"
          placeholder="e.g., QSR, Convenience, Foodservice"
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
        />
        {errors.subChannel && (
          <p className="text-red-500 text-sm mt-1">{errors.subChannel.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Markets (comma-separated)</label>
        <input
          {...register('markets')}
          type="text"
          placeholder="e.g., North America, Europe, Asia"
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
        />
        {errors.markets && (
          <p className="text-red-500 text-sm mt-1">{errors.markets.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Focus Brands (comma-separated)</label>
        <input
          {...register('focusBrands')}
          type="text"
          placeholder="e.g., Pepsi, Tropicana, Gatorade"
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
        />
        {errors.focusBrands && (
          <p className="text-red-500 text-sm mt-1">{errors.focusBrands.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Max Accounts</label>
        <input
          {...register('maxAccounts')}
          type="number"
          min="1"
          max="50"
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
        />
        {errors.maxAccounts && (
          <p className="text-red-500 text-sm mt-1">{errors.maxAccounts.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
      >
        {isLoading ? 'Creating Hunt...' : 'Create Hunt'}
      </button>
    </form>
  );
}
