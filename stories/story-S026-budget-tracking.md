# Story S026 - Budget Tracking

## Feature
Budget tracking for trips - track spending across categories with totals and visual breakdown.

## User Story
As a traveler, I want to track my trip expenses so I can stay within budget and see where my money is going.

## Acceptance Criteria [x]
- [x] AC1: Add budget total to trip (set total budget amount)
- [x] AC2: Each activity can have cost + currency fields (already in model, wire to UI)
- [x] AC3: Display running total spent vs budget on trip dashboard
- [x] AC4: Category breakdown (food, transport, accommodation, activities, shopping, other)
- [x] AC5: Visual progress bar showing budget consumption

## Technical Notes
- Budget data lives in Trip model (add budgetTotal field)
- Activity cost already exists in model - ensure it's editable in forms
- Calculate totals on the fly from activities
- Use pie chart or bar for category breakdown
- Store currency per activity, default to USD

## Dependencies
- S017 (localStorage) - persistence
- S012 (hotel form) - cost field on hotels
- S011 (flight form) - cost field on flights

## Priority
Medium - adds real value for budget-conscious travelers