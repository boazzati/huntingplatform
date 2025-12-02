import { useState, useEffect } from 'react';
import { huntsAPI, Hunt } from '../services/api';

interface HuntDetailProps {
  huntId: string;
  onBack: () => void;
}

const HUNTING_STEPS = [
  {
    step: 1,
    title: 'Define Opportunity',
    description: 'Clarify sub-channel, markets, target customer type, and AFH occasions.'
  },
  {
    step: 2,
    title: 'Scan Universe',
    description: 'Build a long-list of potential customers in those markets (real companies where possible).'
  },
  {
    step: 3,
    title: 'Prioritise & Score',
    description: 'Rank targets on scale, multi-market reach, AFH relevance, and ease/speed to pilot.'
  },
  {
    step: 4,
    title: 'Insight & Hypothesis',
    description: 'Form hypotheses on their shopper/consumer needs, current gaps, and decision-makers.'
  },
  {
    step: 5,
    title: 'PepsiCo Value Proposition',
    description: 'Design 1–2 platform ideas per top target (brands, occasions, commercial logic).'
  },
  {
    step: 6,
    title: 'Internal / Bottler Alignment',
    description: 'Identify which BU, bottler(s), and functions must be engaged and why.'
  },
  {
    step: 7,
    title: 'Approach Plan',
    description: 'Define the route in (RFP, C-suite, operator HQ), key messages, and meeting objectives.'
  },
  {
    step: 8,
    title: 'Discovery & Qualification',
    description: 'First contact, key questions, and signals to qualify or deprioritise the lead.'
  },
  {
    step: 9,
    title: 'Proposal & Negotiation',
    description: 'Shape of proposal, value drivers, investment asks, and potential trade-offs.'
  },
  {
    step: 10,
    title: 'Pilot & Learn',
    description: 'Recommended pilot design, simple KPIs, and how learning will feed the next wave of hunts.'
  }
];

export function HuntDetail({ huntId, onBack }: HuntDetailProps) {
  const [hunt, setHunt] = useState<Hunt | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [stepNotes, setStepNotes] = useState<Record<number, string>>({});

  useEffect(() => {
    const loadHunt = async () => {
      try {
        const data = await huntsAPI.getById(huntId);
        setHunt(data);
        setCurrentStep(data.currentStep || 1);
      } catch (error) {
        console.error('Error loading hunt:', error);
      } finally {
        setLoading(false);
      }
    };

    loadHunt();
  }, [huntId]);

  const handleStepChange = async (step: number) => {
    setCurrentStep(step);
    try {
      await huntsAPI.updateStep(huntId, step);
    } catch (error) {
      console.error('Error updating step:', error);
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-center">
        <p>Loading hunt details...</p>
      </div>
    );
  }

  if (!hunt) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-500">Hunt not found</p>
        <button
          onClick={onBack}
          className="mt-4 px-4 py-2 bg-primary text-white rounded-md"
        >
          Back
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={onBack}
            className="mb-4 px-4 py-2 text-sm bg-gray-200 rounded-md hover:bg-gray-300"
          >
            ← Back
          </button>
          <h2 className="text-3xl font-bold">{hunt.subChannel} Hunt</h2>
          <p className="text-gray-600 mt-2">
            Markets: {hunt.markets.join(', ')} | Brands: {hunt.focusBrands.join(', ')}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">Created</p>
          <p className="text-lg font-semibold">
            {new Date(hunt.createdAt || '').toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="bg-card rounded-lg border p-6">
        <h3 className="text-lg font-bold mb-4">Hunting Progress</h3>
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium">Current Step: {currentStep} / 10</span>
          <span className="text-sm text-gray-600">{Math.round((currentStep / 10) * 100)}% Complete</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-primary h-3 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / 10) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* 10-Step Timeline */}
      <div className="bg-card rounded-lg border p-6">
        <h3 className="text-lg font-bold mb-6">10-Step Hunting Model</h3>
        <div className="space-y-4">
          {HUNTING_STEPS.map((huntStep) => (
            <div
              key={huntStep.step}
              onClick={() => handleStepChange(huntStep.step)}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                currentStep === huntStep.step
                  ? 'border-primary bg-primary/5'
                  : currentStep > huntStep.step
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 bg-white hover:border-primary/50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${
                        currentStep > huntStep.step
                          ? 'bg-green-500 text-white'
                          : currentStep === huntStep.step
                          ? 'bg-primary text-white'
                          : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {currentStep > huntStep.step ? '✓' : huntStep.step}
                    </div>
                    <div>
                      <h4 className="font-semibold">{huntStep.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{huntStep.description}</p>
                    </div>
                  </div>
                </div>
                {currentStep === huntStep.step && (
                  <span className="ml-4 px-3 py-1 bg-primary text-white text-xs rounded-full font-medium">
                    Current
                  </span>
                )}
              </div>

              {/* Step Notes */}
              {currentStep === huntStep.step && (
                <div className="mt-4 ml-11">
                  <textarea
                    placeholder="Add notes for this step..."
                    value={stepNotes[huntStep.step] || ''}
                    onChange={(e) =>
                      setStepNotes({ ...stepNotes, [huntStep.step]: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    rows={3}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Accounts Section */}
      <div className="bg-card rounded-lg border p-6">
        <h3 className="text-lg font-bold mb-4">Accounts ({hunt.accounts.length})</h3>
        {hunt.accounts.length === 0 ? (
          <p className="text-gray-600 text-sm">No accounts added yet. Start adding companies to track.</p>
        ) : (
          <div className="space-y-3">
            {hunt.accounts.map((account, idx) => (
              <div key={idx} className="p-3 border rounded-md bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{account.name}</p>
                    <p className="text-xs text-gray-600">Step {account.step || 1}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-primary">{account.score || 0}/100</p>
                    <p className="text-xs text-gray-600">Score</p>
                  </div>
                </div>
                {account.notes && (
                  <p className="text-xs text-gray-600 mt-2">{account.notes}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 font-medium"
        >
          Back to Hunts
        </button>
        <button
          className="flex-1 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 font-medium"
        >
          Generate Playbook
        </button>
      </div>
    </div>
  );
}
