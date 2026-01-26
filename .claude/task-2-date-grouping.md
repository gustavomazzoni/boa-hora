# Plan: Task 2 - Contraction Logs Grouped by Date

## Goal
Show the date above the first contraction logged on each date in the timeline's "Hora" column, using the same styling as the hour.

## Understanding

**Current State:**
- Timeline displays contractions in a FlatList with 3 columns: Hora (time), Duration (circle), Frequency
- The "Hora" column shows only `HH:mm` format via `formatTime()` helper (line 225)
- Contractions are sorted newest-first (most recent at top)
- Each row has fixed height of 70px (line 436)
- Time text style: `color: "#B2DFDB", fontSize: 14` (lines 445-448)

**Requirement:**
- Show the date at the "Hora" column on top of the last contraction logged on that date
- Use same styling as the hour text

## Implementation Approach

**Strategy:** Enhanced FlatList with conditional date rendering (minimal changes)

Rather than switching to SectionList or transforming data, we'll:
1. Add helper functions to extract/format dates
2. Add a function to check if a contraction is the first of its date
3. Modify `renderItem` to conditionally show the date above the time

## Files to Modify

### 1. `helpers/time.ts` - Add date helpers

```typescript
// Extract date portion for comparison (YYYY-MM-DD)
export const getDateKey = (dateString: string): string => {
  const d = new Date(dateString);
  return d.toISOString().split('T')[0];
};

// Format date for display (DD/MM)
export const formatDate = (dateString: string): string => {
  const d = new Date(dateString);
  const day = d.getDate();
  const month = d.getMonth() + 1;
  return `${day < 10 ? "0" : ""}${day}/${month < 10 ? "0" : ""}${month}`;
};
```

### 2. `app/index.tsx` - Modify timeline rendering

**Step 1:** Update import (line 14)
```typescript
import { formatDuration, formatTime, getDiffMinutes, getDateKey, formatDate } from "@/helpers/time";
```

**Step 2:** Add `isFirstOfDate` helper (after `getFrequencyText`, ~line 157)
```typescript
const isFirstOfDate = (index: number): boolean => {
  if (index === contractions.length - 1) return true; // Oldest item always shows date
  const current = contractions[index];
  const next = contractions[index + 1];
  return getDateKey(current.startTime) !== getDateKey(next.startTime);
};
```

**Step 3:** Modify `renderItem` time column (lines 223-226)
```typescript
{/* Time Column */}
<View style={styles.timeCol}>
  {isFirstOfDate(index) && (
    <Text style={styles.timeText}>{formatDate(item.startTime)}</Text>
  )}
  <Text style={styles.timeText}>{formatTime(item.startTime)}</Text>
</View>
```

**Step 4:** Adjust row height in styles (line 436)
Change from `height: 70` to `height: 85` to accommodate the optional date line

## Visual Result

```
Timeline (newest first):
┌─────────────────────────────────────────┐
│   Hora      │  Duração  │   Freq        │
├─────────────────────────────────────────┤
│   26/01     │           │               │  <- Date shown (first of 26/01)
│   14:30     │   (1:23)  │   4:30        │
├─────────────────────────────────────────┤
│   14:25     │   (0:58)  │   5:10        │  <- No date (same day)
├─────────────────────────────────────────┤
│   25/01     │           │               │  <- Date shown (first of 25/01)
│   23:45     │   (1:05)  │   --          │
└─────────────────────────────────────────┘
```

## Verification

1. Start the app with `npx expo start`
2. Log several contractions on the current date - only the first (most recent) should show the date
3. Manually add test contractions with different dates to AsyncStorage to verify date grouping
4. Verify styling matches the hour text (same color, font size, weight)
5. Verify date format is DD/MM (Brazilian standard)

## Edge Cases

- Single contraction: Should show date
- All contractions same day: Only first shows date
- Contractions spanning multiple days: Each day's first contraction shows date
- Gap > 60 min (break): Date should still show correctly regardless of break status
