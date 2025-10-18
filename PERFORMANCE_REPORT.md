# Performance and Efficiency Analysis Report

## Overview
This report identifies several areas in the iwailist_web codebase where performance and efficiency can be improved. The analysis focuses on common React patterns, database operations, and data processing inefficiencies.

## Identified Inefficiencies

### 1. **Multiple Database Connections in Statistics Page** (HIGH PRIORITY)
**Location:** `src/pages/Statistics.tsx`

**Issue:** The Statistics page calls `getYearlyData()` multiple times (lines 151-156), which filters the entire gifts array repeatedly. Each call to `getYearlyData()` performs the same filtering operation on the gifts array.

```typescript
const yearGifts = getYearlyData();        // Line 151
const monthlyData = getMonthlyData();     // Line 152 - calls getYearlyData() again
const categoryData = getCategoryData();   // Line 153 - calls getYearlyData() again
const personData = getPersonData();       // Line 154 - calls getYearlyData() again
const returnStatusData = getReturnStatusData(); // Line 155 - calls getYearlyData() again
const totalStats = getTotalStats();       // Line 156 - calls getYearlyData() again
```

**Impact:** The same filtering operation is performed 6 times on every render, creating unnecessary computational overhead.

**Solution:** Memoize the `getYearlyData()` result using `useMemo` and pass it as a parameter to other functions.

**Estimated Performance Gain:** 5-6x reduction in filtering operations on the Statistics page.

---

### 2. **Inefficient Person Lookup in PersonList** (MEDIUM PRIORITY)
**Location:** `src/pages/PersonList.tsx:147-148`

**Issue:** The `getPersonGiftStats()` function is called for every person in the list during rendering. This function internally calls `getPersonGifts()` which filters the entire gifts array using `Array.filter()`.

```typescript
{persons.map((person) => {
  const stats = getPersonGiftStats(person.id); // Filters gifts array for each person
  // ...
})}
```

**Impact:** For N persons, this performs N filter operations on the gifts array during each render. With 100 persons and 1000 gifts, this means 100,000 comparisons.

**Solution:** Pre-compute a Map of personId to gift statistics once, then look up the stats in O(1) time during rendering.

**Estimated Performance Gain:** O(N*M) to O(N+M) complexity reduction, where N is persons and M is gifts.

---

### 3. **Repeated Repository Instantiation** (MEDIUM PRIORITY)
**Location:** Multiple files including `Dashboard.tsx`, `GiftList.tsx`, `PersonList.tsx`, etc.

**Issue:** Repository instances are created fresh on every function call:

```typescript
const loadDashboardData = async () => {
  const giftRepo = new GiftRepository();    // New instance
  const personRepo = new PersonRepository(); // New instance
  // ...
}
```

**Impact:** While the overhead is small, creating new repository instances repeatedly is unnecessary and adds to garbage collection pressure.

**Solution:** Use singleton pattern or create repository instances once at the component level using `useMemo`.

**Estimated Performance Gain:** Minor reduction in object allocation and GC pressure.

---

### 4. **Inefficient Person Name Lookup in GiftList** (MEDIUM PRIORITY)
**Location:** `src/pages/GiftList.tsx:63-66`

**Issue:** The `getPersonName()` function uses `Array.find()` for every gift card rendered:

```typescript
const getPersonName = (personId: string) => {
  const person = persons.find(p => p.id === personId); // O(N) lookup
  return person?.name || '不明な人物';
};
```

**Impact:** For M gifts, this performs M linear searches through the persons array. With 100 gifts and 50 persons, this means 5,000 comparisons.

**Solution:** Create a Map of personId to person name once, then use O(1) lookups.

**Estimated Performance Gain:** O(N*M) to O(N+M) complexity reduction.

---

### 5. **Sequential Gift Deletion in PersonDetail** (LOW PRIORITY)
**Location:** `src/pages/PersonDetail.tsx:56-58`

**Issue:** Gifts are deleted sequentially in a loop:

```typescript
for (const gift of gifts) {
  await giftRepo.delete(gift.id); // Sequential deletion
}
```

**Impact:** Each deletion waits for the previous one to complete, making the operation slower than necessary.

**Solution:** Use `Promise.all()` to delete all gifts in parallel.

**Estimated Performance Gain:** N times faster for N gifts (e.g., 10 gifts deleted in ~1 operation time instead of 10).

---

### 6. **Redundant Data Fetching in Dashboard** (LOW PRIORITY)
**Location:** `src/pages/Dashboard.tsx:32-33`

**Issue:** The dashboard fetches all gifts, then immediately slices to get only 5:

```typescript
const allGifts = await giftRepo.getAll(userId);
const recent = allGifts.slice(0, 5);
```

**Impact:** All gift records are fetched from IndexedDB even though only 5 are needed.

**Solution:** Add a `getRecent(userId, limit)` method to GiftRepository that uses IndexedDB cursor with limit.

**Estimated Performance Gain:** Reduces data transfer from IndexedDB, especially beneficial with large datasets.

---

### 7. **Missing Memoization for Expensive Calculations** (LOW PRIORITY)
**Location:** `src/pages/Statistics.tsx:232`

**Issue:** Complex inline calculations in JSX:

```typescript
style={{
  width: `${monthlyData.length > 0 ? (data.amount / Math.max(...monthlyData.map(d => d.amount))) * 100 : 0}%`
}}
```

**Impact:** `Math.max(...monthlyData.map(d => d.amount))` is recalculated for every month bar rendered.

**Solution:** Calculate the maximum value once before the map.

**Estimated Performance Gain:** Minor, but improves code readability and reduces redundant calculations.

---

## Priority Recommendations

1. **Fix #1 (Statistics Page Multiple Filtering)** - Highest impact, easiest to fix
2. **Fix #2 (PersonList Gift Stats)** - High impact on pages with many persons
3. **Fix #4 (GiftList Person Name Lookup)** - High impact on pages with many gifts
4. **Fix #5 (Sequential Deletion)** - Good user experience improvement
5. **Fix #3 (Repository Instantiation)** - Minor improvement, good practice
6. **Fix #6 (Dashboard Data Fetching)** - Beneficial for large datasets
7. **Fix #7 (Missing Memoization)** - Code quality improvement

## Conclusion

The most impactful improvements can be achieved by addressing inefficiencies #1, #2, and #4, which all involve reducing redundant array operations through memoization and pre-computed data structures. These changes would significantly improve performance, especially as the dataset grows larger.
