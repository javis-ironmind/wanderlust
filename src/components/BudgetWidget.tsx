'use client';

import { useState, useEffect, useMemo } from 'react';

// Helper to calculate budget totals from a trip
interface BudgetSummary {
  totalBudget: number;
  totalSpent: number;
  remaining: number;
  percentUsed: number;
  byCategory: Record<string, number>;
}

interface BudgetWidgetProps {
  trip: any;
  onUpdateBudget: (budget: number) => void;
}

export function BudgetWidget({ trip, onUpdateBudget }: BudgetWidgetProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [budgetInput, setBudgetInput] = useState('');
  
  // Calculate totals from all activities, flights, and hotels
  const budget: BudgetSummary = useMemo(() => {
    let totalSpent = 0;
    const byCategory: Record<string, number> = {};
    
    // Helper to convert any currency to USD (simplified)
    const toUSD = (amount: number, currency: string) => {
      // For now, assume 1:1 for simplicity - can add real conversion later
      return amount;
    };
    
    // Sum activities
    if (trip.days) {
      trip.days.forEach((day: any) => {
        if (day.activities) {
          day.activities.forEach((activity: any) => {
            if (activity.cost) {
              const usd = toUSD(activity.cost, activity.currency || 'USD');
              totalSpent += usd;
              const cat = activity.category || 'other';
              byCategory[cat] = (byCategory[cat] || 0) + usd;
            }
          });
        }
      });
    }
    
    // Sum flights
    if (trip.flights) {
      trip.flights.forEach((flight: any) => {
        if (flight.cost) {
          const usd = toUSD(flight.cost, flight.currency || 'USD');
          totalSpent += usd;
          byCategory['transport'] = (byCategory['transport'] || 0) + usd;
        }
      });
    }
    
    // Sum hotels
    if (trip.hotels) {
      trip.hotels.forEach((hotel: any) => {
        if (hotel.cost) {
          const usd = toUSD(hotel.cost, hotel.currency || 'USD');
          totalSpent += usd;
          byCategory['accommodation'] = (byCategory['accommodation'] || 0) + usd;
        }
      });
    }
    
    const totalBudget = trip.budgetTotal || 0;
    const remaining = totalBudget - totalSpent;
    const percentUsed = totalBudget > 0 ? Math.min((totalSpent / totalBudget) * 100, 100) : 0;
    
    return { totalBudget, totalSpent, remaining, percentUsed, byCategory };
  }, [trip]);
  
  const handleSaveBudget = () => {
    const amount = parseFloat(budgetInput) || 0;
    onUpdateBudget(amount);
    setIsEditing(false);
  };
  
  const categoryColors: Record<string, string> = {
    restaurant: '#f97316',
    attraction: '#8b5cf6',
    activity: '#3b82f6',
    transport: '#06b6d4',
    hotel: '#10b981',
    shopping: '#ec4899',
    entertainment: '#f59e0b',
    other: '#64748b',
  };
  
  const categoryLabels: Record<string, string> = {
    restaurant: '🍽️ Food',
    attraction: '🏛️ Attractions',
    activity: '🎯 Activities',
    transport: '✈️ Transport',
    hotel: '🏨 Hotels',
    shopping: '🛍️ Shopping',
    entertainment: '🎭 Entertainment',
    other: '📦 Other',
  };
  
  if (budget.totalBudget === 0) {
    return (
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '1rem',
        marginBottom: '1rem',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '0.875rem', color: '#64748b' }}>💰 Budget</span>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.875rem', color: '#94a3b8' }}>
              Set a budget to track spending
            </p>
          </div>
          <button
            onClick={() => {
              setBudgetInput('');
              setIsEditing(true);
            }}
            style={{
              background: '#3b82f6',
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              border: 'none',
              fontSize: '0.875rem',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            Set Budget
          </button>
        </div>
        
        {isEditing && (
          <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
            <input
              type="number"
              value={budgetInput}
              onChange={(e) => setBudgetInput(e.target.value)}
              placeholder="Enter budget amount"
              style={{
                flex: 1,
                padding: '0.5rem',
                borderRadius: '6px',
                border: '2px solid #e2e8f0',
                fontSize: '0.875rem',
              }}
            />
            <button
              onClick={handleSaveBudget}
              style={{
                background: '#10b981',
                color: 'white',
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                border: 'none',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              Save
            </button>
            <button
              onClick={() => setIsEditing(false)}
              style={{
                background: '#e2e8f0',
                color: '#64748b',
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                border: 'none',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    );
  }
  
  return (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      padding: '1rem',
      marginBottom: '1rem',
    }}>
      {/* Header with budget */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <div>
          <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Budget
          </span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.25rem' }}>
            <span style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1e3a5f' }}>
              ${budget.totalSpent.toLocaleString()}
            </span>
            <span style={{ fontSize: '0.875rem', color: '#64748b' }}>
              / ${budget.totalBudget.toLocaleString()}
            </span>
          </div>
          <p style={{ 
            margin: '0.25rem 0 0', 
            fontSize: '0.875rem',
            color: budget.remaining >= 0 ? '#10b981' : '#ef4444',
          }}>
            {budget.remaining >= 0 
              ? `$${budget.remaining.toLocaleString()} remaining`
              : `$${Math.abs(budget.remaining).toLocaleString()} over budget`
            }
          </p>
        </div>
        <button
          onClick={() => {
            setBudgetInput(budget.totalBudget.toString());
            setIsEditing(true);
          }}
          style={{
            background: '#f1f5f9',
            color: '#64748b',
            padding: '0.375rem 0.75rem',
            borderRadius: '6px',
            border: 'none',
            fontSize: '0.75rem',
            fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          Edit
        </button>
      </div>
      
      {/* Progress bar */}
      <div style={{ 
        height: '8px', 
        background: '#e2e8f0', 
        borderRadius: '4px', 
        overflow: 'hidden',
        marginBottom: '1rem',
      }}>
        <div style={{
          width: `${budget.percentUsed}%`,
          height: '100%',
          background: budget.percentUsed > 90 ? '#ef4444' : budget.percentUsed > 70 ? '#f59e0b' : '#10b981',
          borderRadius: '4px',
          transition: 'width 0.3s ease',
        }} />
      </div>
      
      {/* Category breakdown */}
      {Object.keys(budget.byCategory).length > 0 && (
        <div>
          <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            By Category
          </span>
          <div style={{ marginTop: '0.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {Object.entries(budget.byCategory).map(([cat, amount]) => (
              <div
                key={cat}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '6px',
                  background: `${categoryColors[cat] || '#64748b'}15`,
                  fontSize: '0.75rem',
                  color: categoryColors[cat] || '#64748b',
                }}
              >
                {categoryLabels[cat] || cat}: ${amount.toLocaleString()}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Edit modal */}
      {isEditing && (
        <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
          <input
            type="number"
            value={budgetInput}
            onChange={(e) => setBudgetInput(e.target.value)}
            placeholder="Enter budget amount"
            style={{
              flex: 1,
              padding: '0.5rem',
              borderRadius: '6px',
              border: '2px solid #e2e8f0',
              fontSize: '0.875rem',
            }}
          />
          <button
            onClick={handleSaveBudget}
            style={{
              background: '#10b981',
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              border: 'none',
              fontSize: '0.875rem',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            Save
          </button>
          <button
            onClick={() => setIsEditing(false)}
            style={{
              background: '#e2e8f0',
              color: '#64748b',
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              border: 'none',
              fontSize: '0.875rem',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}