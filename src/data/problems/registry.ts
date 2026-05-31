import type { InterviewProblem } from "@/lib/content/types";

export const PROBLEMS: InterviewProblem[] = [
  // CODING
  {
    id: "two-sum",
    category: "coding",
    title: "Two Sum",
    difficulty: "easy",
    description:
      "Given an array of integers and a target sum, find two numbers that add up to the target. Return their indices.\n\nExample: nums = [2, 7, 11, 15], target = 9 → [0, 1] because nums[0] + nums[1] = 2 + 7 = 9.\n\nYou may assume each input has exactly one solution, and you cannot use the same element twice.",
    hints: [
      "Think about what complement you need for each number",
      "A hash map can store numbers you've already seen",
      "For each number, check if target - number exists in your map",
    ],
    solution:
      "Use a hash map to store each number and its index as you iterate. For each number, compute complement = target - num. If complement exists in the map, return both indices. Time: O(n), Space: O(n).\n\ndef two_sum(nums, target):\n    seen = {}\n    for i, num in enumerate(nums):\n        complement = target - num\n        if complement in seen:\n            return [seen[complement], i]\n        seen[num] = i",
    xpReward: 25,
  },
  {
    id: "max-subarray",
    category: "coding",
    title: "Maximum Subarray",
    difficulty: "medium",
    description:
      "Given an integer array, find the contiguous subarray with the largest sum and return that sum.\n\nExample: [-2, 1, -3, 4, -1, 2, 1, -5, 4] → 6 (subarray [4, -1, 2, 1]).\n\nThis is known as Kadane's Algorithm and is a classic dynamic programming problem frequently asked at quant firms.",
    hints: [
      "At each position, decide: extend the current subarray or start a new one",
      "Track both the current sum and the maximum seen so far",
      "If current_sum becomes negative, reset it to 0",
    ],
    solution:
      "Kadane's Algorithm: Maintain current_sum and max_sum. At each element, current_sum = max(num, current_sum + num). Update max_sum = max(max_sum, current_sum). Time: O(n), Space: O(1).\n\ndef max_subarray(nums):\n    current = max_sum = nums[0]\n    for num in nums[1:]:\n        current = max(num, current + num)\n        max_sum = max(max_sum, current)\n    return max_sum",
    xpReward: 50,
  },
  {
    id: "merge-intervals",
    category: "coding",
    title: "Merge Intervals",
    difficulty: "medium",
    description:
      "Given a collection of intervals where intervals[i] = [start_i, end_i], merge all overlapping intervals and return an array of non-overlapping intervals that cover all the intervals.\n\nExample: [[1,3],[2,6],[8,10],[15,18]] → [[1,6],[8,10],[15,18]] because [1,3] and [2,6] overlap.\n\nThis problem tests your ability to handle edge cases with sorted data.",
    hints: [
      "Sort intervals by start time first",
      "Compare each interval's start with the previous interval's end",
      "If they overlap, merge by extending the end; otherwise, add a new interval",
    ],
    solution:
      "Sort by start time. Initialize result with the first interval. For each subsequent interval: if it overlaps with the last result interval (start <= last_end), merge by updating end = max(end, current_end). Otherwise, append the new interval. Time: O(n log n).\n\ndef merge(intervals):\n    intervals.sort()\n    merged = [intervals[0]]\n    for start, end in intervals[1:]:\n        if start <= merged[-1][1]:\n            merged[-1][1] = max(merged[-1][1], end)\n        else:\n            merged.append([start, end])\n    return merged",
    xpReward: 50,
  },
  {
    id: "lru-cache",
    category: "coding",
    title: "LRU Cache",
    difficulty: "hard",
    description:
      "Design a data structure that follows the constraints of a Least Recently Used (LRU) cache.\n\nImplement get(key) and put(key, value) operations, both in O(1) time. When the cache reaches capacity, evict the least recently used item before inserting a new one.\n\nThis is a common systems design question at trading firms where cache performance is critical.",
    hints: [
      "You need O(1) lookup AND O(1) removal of the least recently used item",
      "Combine a hash map with a doubly linked list",
      "The hash map gives O(1) lookup; the linked list maintains access order",
    ],
    solution:
      "Use a hash map + doubly linked list. The map stores key → node pointers. The linked list maintains access order (most recent at head, least recent at tail).\n\nget(key): Look up in map, move node to head, return value.\nput(key, value): If exists, update and move to head. If new, create node at head, add to map. If over capacity, remove tail node from both list and map.\n\nBoth operations are O(1).",
    xpReward: 100,
  },
  {
    id: "median-sorted-arrays",
    category: "coding",
    title: "Median of Two Sorted Arrays",
    difficulty: "hard",
    description:
      "Given two sorted arrays nums1 and nums2 of size m and n, return the median of the combined sorted array. The overall runtime should be O(log(m+n)).\n\nExample: nums1 = [1,3], nums2 = [2] → 2.0\nnums1 = [1,2], nums2 = [3,4] → 2.5\n\nThis tests binary search on two arrays simultaneously.",
    hints: [
      "Binary search on the smaller array",
      "Partition both arrays such that left halves have the same total count",
      "Check if the partition is valid: max(left) <= min(right)",
    ],
    solution:
      "Binary search on the shorter array. For a partition at position i in array A and j = (m+n+1)/2 - i in array B, check that A[i-1] <= B[j] and B[j-1] <= A[i]. If valid, median is found. If A[i-1] > B[j], search left; otherwise search right. Time: O(log(min(m,n))).",
    xpReward: 100,
  },

  // PROBABILITY
  {
    id: "coin-flip-ev",
    category: "probability",
    title: "Coin Flip Expected Value",
    difficulty: "easy",
    description:
      "You flip a fair coin repeatedly until you get heads. You receive $2^n where n is the number of flips it took. What is the expected payout?\n\nThis is related to the famous St. Petersburg Paradox. Think carefully about the infinite sum.",
    hints: [
      "List out the probabilities: P(1 flip) = 1/2, P(2 flips) = 1/4, ...",
      "Payout for n flips is 2^n",
      "E[payout] = sum of P(n) × 2^n for n = 1, 2, 3, ...",
    ],
    solution:
      "E[X] = Σ (1/2^n) × 2^n for n = 1 to ∞ = Σ 1 for n = 1 to ∞ = ∞\n\nThe expected value is infinite! Each term contributes exactly $1 to the expected value. Despite this, most people wouldn't pay more than $20 to play. This is the St. Petersburg Paradox, which led to the development of utility theory.",
    xpReward: 25,
  },
  {
    id: "birthday-problem",
    category: "probability",
    title: "Birthday Problem",
    difficulty: "medium",
    description:
      "In a room of n people, what is the probability that at least two share a birthday? Find the smallest n where the probability exceeds 50%.\n\nAssume 365 days in a year, uniform distribution, and independence.",
    hints: [
      "It's easier to compute P(no shared birthday) first",
      "P(no match) = 365/365 × 364/365 × 363/365 × ...",
      "P(at least one match) = 1 - P(no match)",
    ],
    solution:
      "P(no match for n people) = (365/365) × (364/365) × ... × ((365-n+1)/365) = 365! / (365^n × (365-n)!)\n\nP(at least one match) = 1 - P(no match)\n\nFor n = 23: P ≈ 50.7% — just 23 people gives you a >50% chance! This counterintuitive result comes from the quadratic growth of pairs: C(23,2) = 253 pairs.",
    xpReward: 50,
  },
  {
    id: "monty-hall",
    category: "probability",
    title: "Monty Hall Problem",
    difficulty: "medium",
    description:
      "You're on a game show with 3 doors. Behind one is a car; behind the others, goats. You pick door 1. The host (who knows what's behind each door) opens door 3, revealing a goat. Should you switch to door 2?\n\nThis classic problem trips up even experienced probabilists.",
    hints: [
      "What is the probability your initial choice was correct?",
      "If you initially picked wrong (2/3 chance), switching always wins",
      "The host's action gives you information — he never opens the car door",
    ],
    solution:
      "You should ALWAYS switch. Here's why:\n\nP(car behind door 1) = 1/3 (your pick)\nP(car NOT behind door 1) = 2/3\n\nWhen the host reveals a goat behind door 3, the 2/3 probability concentrates on door 2.\n\nSwitching wins 2/3 of the time. Staying wins 1/3.\n\nKey insight: The host's action is not random — he always reveals a goat. This asymmetric information is what makes switching beneficial.",
    xpReward: 50,
  },
  {
    id: "dice-game",
    category: "probability",
    title: "Dice Game",
    difficulty: "medium",
    description:
      "You roll a fair die. If you roll a 6, you win $36. If you roll a 5, you win $25. For any other roll, you win $0. How much would you pay to play this game?\n\nA trading firm asks this to test if you can quickly compute expected values and assess fair prices.",
    hints: [
      "Compute expected value: E[X] = Σ P(outcome) × value",
      "P(6) = 1/6, P(5) = 1/6, P(other) = 4/6",
      "Would you pay exactly the expected value, or less?",
    ],
    solution:
      "E[X] = P(6)×36 + P(5)×25 + P(other)×0\n= (1/6)(36) + (1/6)(25) + (4/6)(0)\n= 6 + 4.17 + 0\n= $10.17\n\nThe fair price is $10.17. A risk-neutral player pays exactly this. A risk-averse player pays less. In practice at a trading firm, you'd want edge, so you should pay strictly less than $10.17.",
    xpReward: 50,
  },
  {
    id: "random-walk",
    category: "probability",
    title: "Random Walk Return",
    difficulty: "hard",
    description:
      "A particle starts at position 0 on the integer number line. At each step, it moves +1 or -1 with equal probability. What is the probability it ever returns to 0?\n\nWhat about in 2D? 3D? This is fundamental to understanding market models.",
    hints: [
      "In 1D, think about what happens as the number of steps goes to infinity",
      "The Gambler's ruin problem is related",
      "Polya's recurrence theorem categorizes dimensions",
    ],
    solution:
      "In 1D: P(return to 0) = 1 (certain return)\nIn 2D: P(return to 0) = 1 (certain return)\nIn 3D: P(return to 0) ≈ 0.3405 (NOT certain)\n\nThis is Polya's Recurrence Theorem: A random walk on Z^d returns to the origin with probability 1 if and only if d ≤ 2.\n\nFor 1D, the expected number of returns is infinite, but the expected time to first return is also infinite. This has deep connections to stock price modeling — a random walk model implies prices will revisit any level eventually.",
    xpReward: 100,
  },

  // MATH
  {
    id: "quick-multiply",
    category: "math",
    title: "Quick Multiplication",
    difficulty: "easy",
    description:
      "Calculate 17 × 23 in your head in under 10 seconds.\n\nMental math speed is tested in quant interviews to evaluate your numerical fluency. Practice decomposing products into simpler components.",
    hints: [
      "Break 17 into 20 - 3",
      "So 17 × 23 = (20-3) × 23 = 20×23 - 3×23",
      "Or use 17 × 23 = 17 × 20 + 17 × 3",
    ],
    solution:
      "17 × 23 = 17 × (20 + 3) = 340 + 51 = 391\n\nAlternatively: (20-3) × 23 = 460 - 69 = 391\n\nOr: (20)(23) - 3(23) = 460 - 69 = 391\n\nTip: Always decompose into round numbers. Pick the decomposition that minimizes mental effort.",
    xpReward: 25,
  },
  {
    id: "compound-interest",
    category: "math",
    title: "Compound Interest",
    difficulty: "easy",
    description:
      "If you invest $10,000 at 8% annual return compounded annually, how much do you have after 9 years? Estimate without a calculator.\n\nHint: The Rule of 72 says money doubles in approximately 72/r years where r is the interest rate in percent.",
    hints: [
      "Rule of 72: 72/8 = 9 years to double",
      "So $10,000 roughly doubles in 9 years",
      "Exact answer: 10000 × 1.08^9",
    ],
    solution:
      "Using Rule of 72: 72/8 = 9 years to double\nSo approximately $20,000.\n\nExact: $10,000 × 1.08^9 = $10,000 × 1.999 = $19,990\n\nThe Rule of 72 is remarkably accurate! It works because ln(2) ≈ 0.693, and 0.693/r ≈ 72/(100r) when r is in percent.",
    xpReward: 25,
  },
  {
    id: "sqrt-estimation",
    category: "math",
    title: "Square Root Estimation",
    difficulty: "medium",
    description:
      "Estimate √150 to one decimal place without a calculator.\n\nThis tests your ability to quickly bracket numbers and interpolate, a skill used in options pricing and risk calculations.",
    hints: [
      "12² = 144 and 13² = 169",
      "So √150 is between 12 and 13, closer to 12",
      "150 - 144 = 6, 169 - 144 = 25, so about 6/25 of the way",
    ],
    solution:
      "12² = 144, 13² = 169\n150 is between 144 and 169.\n\nLinear interpolation: (150-144)/(169-144) = 6/25 = 0.24\n\n√150 ≈ 12 + 0.24 = 12.24\n\nActual: √150 = 12.247...\n\nNewton's method: Start with x₀ = 12. x₁ = (12 + 150/12)/2 = (12 + 12.5)/2 = 12.25. Already very accurate!",
    xpReward: 50,
  },
  {
    id: "geometric-series",
    category: "math",
    title: "Geometric Series",
    difficulty: "medium",
    description:
      "What is the sum: 1/2 + 1/4 + 1/8 + 1/16 + ... ?\n\nGeometric series appear everywhere in finance: discounted cash flows, option pricing, probability calculations.",
    hints: [
      "This is a geometric series with first term a = 1/2 and ratio r = 1/2",
      "The formula for infinite geometric series is a/(1-r) when |r| < 1",
      "Alternatively, think of it visually: half of what remains",
    ],
    solution:
      "This is a geometric series: Σ (1/2)^n for n = 1 to ∞\n\nUsing the formula S = a/(1-r) where a = 1/2, r = 1/2:\n\nS = (1/2)/(1 - 1/2) = (1/2)/(1/2) = 1\n\nVisual proof: Start with a square of area 1. Color half (1/2), then half of what remains (1/4), then half of what remains (1/8)... You approach but never exceed 1.\n\nIn finance: If a stock pays $1 dividend with 50% chance each year, expected total dividends = $1.",
    xpReward: 50,
  },
  {
    id: "combinations-problem",
    category: "math",
    title: "Combinatorics Problem",
    difficulty: "hard",
    description:
      "A portfolio manager must select 5 stocks from a universe of 20 for equal-weight allocation. How many possible portfolios exist? If she also has to pick 3 from a sector of 8 stocks and 2 from the remaining 12, how many ways now?\n\nCombinatorics is essential for understanding the size of strategy search spaces.",
    hints: [
      "C(n,k) = n! / (k! × (n-k)!)",
      "Part 1: C(20,5)",
      "Part 2: C(8,3) × C(12,2) since the selections are independent",
    ],
    solution:
      "Part 1: C(20,5) = 20!/(5!×15!) = (20×19×18×17×16)/(5×4×3×2×1) = 15,504\n\nPart 2: C(8,3) × C(12,2) = 56 × 66 = 3,696\n\nNotice: The constrained version (3,696) is much smaller than the unconstrained version (15,504). This is why universe constraints dramatically reduce the search space — important for avoiding overfitting in backtesting.",
    xpReward: 100,
  },

  // BRAINTEASERS
  {
    id: "two-egg",
    category: "brainteaser",
    title: "Two Egg Problem",
    difficulty: "medium",
    description:
      "You have 2 identical eggs and a 100-floor building. You need to find the highest floor from which an egg can be dropped without breaking. Eggs may or may not break from a given floor. If dropped from above that floor, they break; below, they don't. What is the minimum number of drops needed to guarantee finding the critical floor in the worst case?\n\nNote: If both eggs break, you still need to know the answer.",
    hints: [
      "With 1 egg, you must go floor by floor: 100 drops worst case",
      "With 2 eggs, your first egg lets you skip floors",
      "Think about what interval size your first drop should partition into",
    ],
    solution:
      "Answer: 14 drops.\n\nStrategy: Drop egg 1 from floors 14, 27, 39, 50, 60, 69, 77, 84, 90, 95, 99, 100.\n\nWhy decreasing intervals? If egg 1 breaks at floor 14, you have 13 floors to check with egg 2 (floors 1-13) → 13 + 1 = 14 drops total. If egg 1 survives, drop from 27. If it breaks, check 15-26 (12 floors) → 2 + 12 = 14 drops.\n\nMathematically: find n where n + (n-1) + (n-2) + ... + 1 ≥ 100. n(n+1)/2 ≥ 100 → n = 14.",
    xpReward: 50,
  },
  {
    id: "light-switches",
    category: "brainteaser",
    title: "Three Light Switches",
    difficulty: "easy",
    description:
      "You're in a room with 3 light switches. One controls a bulb in the next room (which you can't see from here). You can flip switches as many times as you want, but you can only go into the next room ONCE. How do you determine which switch controls the bulb?",
    hints: [
      "Think about what information besides on/off you can gather",
      "A lightbulb that has been on generates something besides light",
      "You have 3 switches and can create 3 distinct states",
    ],
    solution:
      "Turn switch 1 ON for 10 minutes, then turn it OFF.\nTurn switch 2 ON.\nWalk into the room.\n\n- If bulb is ON → Switch 2\n- If bulb is OFF and WARM → Switch 1\n- If bulb is OFF and COLD → Switch 3\n\nKey insight: Use heat as a second information channel. You have 3 switches but only 2 visual states (on/off). Adding temperature gives you the third state.",
    xpReward: 25,
  },
  {
    id: "water-jugs",
    category: "brainteaser",
    title: "Water Jug Problem",
    difficulty: "medium",
    description:
      "You have a 3-liter jug and a 5-liter jug. How can you measure exactly 4 liters?\n\nYou can fill either jug from a tap, pour from one jug to another, or empty a jug. There are no markings on the jugs.",
    hints: [
      "5 - 1 = 4, so if you can isolate 1 liter, you can get 4",
      "Fill the 3L jug and pour into the 5L jug. Repeat.",
      "When the 5L jug is full, what remains in the 3L jug?",
    ],
    solution:
      "1. Fill the 5L jug → (0, 5)\n2. Pour 5L into 3L → (3, 2)\n3. Empty 3L → (0, 2)\n4. Pour 2L from 5L into 3L → (2, 0)\n5. Fill 5L → (2, 5)\n6. Pour 5L into 3L (only 1L fits) → (3, 4)\n\nThe 5L jug now has exactly 4 liters.\n\nAlternative: This can be modeled as a graph/state-space search problem. The mathematical basis is Bezout's identity: since gcd(3,5) = 1, you can measure any integer volume.",
    xpReward: 50,
  },
  {
    id: "burning-rope",
    category: "brainteaser",
    title: "Burning Rope Timer",
    difficulty: "medium",
    description:
      "You have two ropes. Each takes exactly 60 minutes to burn completely, but they burn at non-uniform rates (so half the rope does NOT take 30 minutes). How do you measure exactly 45 minutes?",
    hints: [
      "If you light a rope from both ends, it takes 30 minutes",
      "You can light the second rope at a strategic time",
      "Combine 30 minutes from one rope with 15 from another",
    ],
    solution:
      "Light rope 1 from BOTH ends and rope 2 from ONE end simultaneously.\n\nAfter 30 minutes: Rope 1 is finished (burned from both ends = 60/2 = 30 min).\nRope 2 has 30 minutes of burn time left.\n\nNow light rope 2's other end.\nRope 2 will take 30/2 = 15 more minutes.\n\nTotal: 30 + 15 = 45 minutes.\n\nKey insight: Burning from both ends halves the time regardless of the burn rate distribution.",
    xpReward: 50,
  },
  {
    id: "pirates-gold",
    category: "brainteaser",
    title: "Pirates and Gold",
    difficulty: "hard",
    description:
      "Five pirates (A, B, C, D, E in seniority order) must divide 100 gold coins. Pirate A proposes a distribution. All pirates vote (including A). If at least 50% agree, the proposal passes. Otherwise, A is thrown overboard and B proposes next.\n\nAssume: Pirates are perfectly rational, want to maximize their gold, prefer survival, and given equal gold, prefer to throw someone overboard.\n\nWhat distribution does A propose?",
    hints: [
      "Work backwards from the last pirate",
      "If only D and E remain, D proposes 100-0 (D's own vote is 50%)",
      "Each pirate needs to offer just enough to buy votes",
    ],
    solution:
      "Work backwards:\n\nIf only E: gets 100.\nIf D,E: D proposes (100, 0). D votes yes (50% = passes).\nIf C,D,E: C needs 1 more vote. Offer E 1 coin (E gets 0 in D's plan). C: (99, 0, 1).\nIf B,C,D,E: B needs 1 more vote. Offer D 1 coin (D gets 0 in C's plan). B: (99, 0, 1, 0).\nIf A,B,C,D,E: A needs 2 more votes. Offer C and E 1 coin each. A: (98, 0, 1, 0, 1).\n\nA proposes: A=98, B=0, C=1, D=0, E=1.\nA, C, and E vote yes (3/5 = 60%).",
    xpReward: 100,
  },

  // SYSTEMS
  {
    id: "url-shortener",
    category: "systems",
    title: "URL Shortener Design",
    difficulty: "easy",
    description:
      "Design a URL shortener like bit.ly. Given a long URL, generate a short URL. Given a short URL, redirect to the original.\n\nConsider: How do you generate unique short codes? How do you handle billions of URLs? What about analytics?",
    hints: [
      "Base62 encoding (a-z, A-Z, 0-9) gives you 62^n possibilities",
      "With 7 characters: 62^7 = 3.5 trillion unique URLs",
      "Use a counter or hash + collision handling",
    ],
    solution:
      "Architecture:\n1. Encode: Take auto-incrementing ID, convert to base62 → short code\n2. Store: Key-value store mapping short_code → long_url\n3. Redirect: Look up short_code, return 301 redirect\n\nScale considerations:\n- Read-heavy (100:1 read/write) → cache popular URLs\n- Base62 with 7 chars handles 3.5T URLs\n- Distribute ID generation (e.g., range-based partitioning)\n- Add analytics: track clicks, referrers, geo\n\nDatabase: NoSQL (DynamoDB/Cassandra) for simple key-value lookups at scale.",
    xpReward: 25,
  },
  {
    id: "rate-limiter",
    category: "systems",
    title: "Rate Limiter Design",
    difficulty: "medium",
    description:
      "Design a rate limiter that restricts users to N requests per time window. This is crucial in trading systems to prevent excessive order submission.\n\nSupport multiple algorithms: fixed window, sliding window, token bucket. Handle distributed scenarios.",
    hints: [
      "Token bucket: tokens refill at a fixed rate, each request costs a token",
      "Sliding window: track timestamps of recent requests",
      "For distributed: use Redis with atomic operations",
    ],
    solution:
      "Token Bucket Algorithm:\n- Bucket has capacity N, refills at rate R tokens/second\n- Each request removes 1 token\n- If bucket empty → reject request\n\nSliding Window Counter:\n- Divide time into intervals\n- Count = prev_window_count × overlap_fraction + current_window_count\n- More accurate than fixed window, less memory than sliding log\n\nDistributed Implementation:\n- Redis: INCR + EXPIRE for fixed window\n- Redis + Lua script for atomic sliding window\n- Race condition handling: use Redis MULTI/EXEC\n\nTrading context: Order rate limits prevent fat-finger errors and comply with exchange limits.",
    xpReward: 50,
  },
  {
    id: "message-queue",
    category: "systems",
    title: "Message Queue Design",
    difficulty: "medium",
    description:
      "Design a distributed message queue like Kafka. Support: producers publishing messages, consumers subscribing, guaranteed delivery, ordering within partitions, and replay.\n\nTrading systems use message queues for order flow, market data distribution, and event sourcing.",
    hints: [
      "Partition messages by key for ordering guarantees",
      "Use append-only log for storage (like Kafka)",
      "Consumer offsets track position in the log",
    ],
    solution:
      "Core Design:\n1. Topics with partitions (ordered, append-only logs)\n2. Producers: hash message key → partition for ordering\n3. Consumers: consumer groups, each partition assigned to one consumer\n4. Offsets: consumers track their position, can replay\n\nStorage: Segment files with index. Retention by time or size.\nReplication: Leader-follower per partition. ISR (in-sync replicas) for durability.\n\nGuarantees:\n- At-most-once: commit offset before processing\n- At-least-once: commit offset after processing\n- Exactly-once: idempotent producers + transactional consumers\n\nTrading use: Market data feeds, order event sourcing, real-time risk aggregation.",
    xpReward: 50,
  },
  {
    id: "trading-system",
    category: "systems",
    title: "Low-Latency Trading System",
    difficulty: "hard",
    description:
      "Design a low-latency electronic trading system that processes market data, runs strategies, generates orders, and manages risk — all in microseconds.\n\nThis is the type of system HRT, Jump, and Citadel actually build. Think about every source of latency.",
    hints: [
      "Kernel bypass (DPDK/RDMA) for network IO",
      "Lock-free data structures, pre-allocated memory",
      "Co-located servers at exchange data centers",
    ],
    solution:
      "Architecture (tick-to-trade < 10μs):\n\n1. Market Data Handler: UDP multicast, kernel bypass (DPDK), parse directly into cache-aligned structs\n\n2. Strategy Engine: Pre-computed decision trees, branch-free code, SIMD operations, no allocations on hot path\n\n3. Order Management: Lock-free ring buffer, pre-built order templates, FIX/binary protocol\n\n4. Risk Engine: Inline risk checks (position limits, P&L limits), hardware-assisted bounds checking\n\nOptimizations:\n- CPU pinning, NUMA-aware allocation\n- Huge pages, mlock'd memory\n- Compiler intrinsics, PGO\n- FPGA for ultra-low latency paths\n- Co-location at exchange\n\nMonitoring: Timestamped at every stage for latency profiling.",
    xpReward: 100,
  },
  {
    id: "matching-engine",
    category: "systems",
    title: "Order Matching Engine",
    difficulty: "hard",
    description:
      "Design an exchange order matching engine. Support limit orders, market orders, cancel/replace. Implement price-time priority. Handle millions of orders per second.\n\nThis is the core of every exchange — NASDAQ, NSE, CME all have matching engines at their heart.",
    hints: [
      "Price-time priority: best price first, then earliest order",
      "Use a sorted data structure for the order book (balanced BST or sorted array)",
      "Consider memory layout for cache performance",
    ],
    solution:
      "Data Structures:\n- Order book per symbol: two sorted maps (bids desc, asks asc)\n- Each price level: FIFO queue of orders\n- Order lookup: hash map from order_id → order pointer\n\nMatching Algorithm:\n1. New buy limit order at price P:\n   - While best_ask <= P and order has remaining qty:\n     - Match against best ask, generate trade\n   - If remaining qty, add to bid side at price P\n\n2. Cancel: O(1) lookup + remove from price level queue\n\nPerformance:\n- O(1) for best bid/ask\n- O(log N) for new price levels (N = distinct prices)\n- O(1) for matching at existing price level\n\nScale: Partition by symbol, each symbol on dedicated core. Pre-allocate order pool. Lock-free single-producer design per symbol.",
    xpReward: 100,
  },
];
