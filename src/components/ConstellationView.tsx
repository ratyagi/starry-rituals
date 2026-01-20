import { useMemo, useState } from 'react';
import { Habit, HabitData } from '@/types/habit';
import { HabitStar } from './HabitStar';
import { isHabitCompleted, calculateMomentum, getTodayKey } from '@/lib/storage';

interface ConstellationViewProps {
  data: HabitData;
  onToggleHabit: (habitId: string) => void;
  onEditHabit: (habit: Habit) => void;
}

/**
 * Deterministic string hash -> uint32
 */
function hashStringToInt(str: string) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/**
 * Deterministic PRNG (fast, stable)
 */
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

function distance(a: { x: number; y: number }, b: { x: number; y: number }) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

type Point = { x: number; y: number };
type Edge = { a: number; b: number };

export function ConstellationView({
  data,
  onToggleHabit,
  onEditHabit,
}: ConstellationViewProps) {
  const today = getTodayKey();
  const activeHabits = data.habits.filter((h) => !h.archived);

  /**
   * "Sky seed" reshuffles on refresh/remount.
   * Does NOT change habit data.
   */
  const [skySeed] = useState(() => Date.now());

  /**
   * IMPORTANT:
   * Positions must depend ONLY on:
   * - habit IDs (add/remove changes the set)
   * - skySeed (refresh changes the shape)
   *
   * Positions must NOT depend on completion state, momentum, or other data
   * that changes when you toggle a habit.
   */
  const positions: Point[] = useMemo(() => {
    const habits = activeHabits;
    const count = habits.length;
    if (count === 0) return [];

    // Safe layout bounds (percentage space)
    const PAD = 8;
    const MIN_X = PAD;
    const MAX_X = 100 - PAD;
    const MIN_Y = PAD;
    const MAX_Y = 100 - PAD;

    // Base min distance to avoid overlap; tighten as count grows
    const baseMinDist =
      count <= 6 ? 16 : count <= 10 ? 14 : count <= 16 ? 12 : 10;

    // Seed based on the set of habits + skySeed (reshuffles on refresh)
    const globalSeed = hashStringToInt(
      habits
        .map((h) => h.id)
        .slice()
        .sort()
        .join('|') + `|${skySeed}`
    );
    const rngGlobal = mulberry32(globalSeed);

    // 2–5 cluster centers
    const clusterCount = clamp(Math.round(2 + rngGlobal() * 3), 2, 5);

    const clusters = Array.from({ length: clusterCount }, () => {
      const cx = MIN_X + rngGlobal() * (MAX_X - MIN_X);
      const cy = MIN_Y + rngGlobal() * (MAX_Y - MIN_Y);
      // Spread controls how "tight" each constellation cluster is
      const spread = 10 + rngGlobal() * 12; // ~10–22
      return { cx, cy, spread };
    });

    // Deterministic placement order so results are stable within a refresh
    const habitsInOrder = habits
      .slice()
      .sort((a, b) => a.id.localeCompare(b.id));

    const placed: Point[] = [];
    const outById = new Map<string, Point>();

    for (const habit of habitsInOrder) {
      // IMPORTANT: seed depends only on habit.id + skySeed
      const seed = hashStringToInt(`${habit.id}|${skySeed}`);
      const rng = mulberry32(seed);

      const clusterIndex = seed % clusterCount;
      const { cx, cy, spread } = clusters[clusterIndex];

      // IMPORTANT: spacing must NOT depend on data that changes on toggle
      const minDist = baseMinDist;

      let point: Point | null = null;

      // Try around its cluster center first (gives grouped constellations)
      for (let attempt = 0; attempt < 70; attempt++) {
        const angle = rng() * Math.PI * 2;
        // Bias points toward the center for "natural" clusters
        const r = (rng() ** 0.7) * spread;
        const x = clamp(cx + Math.cos(angle) * r, MIN_X, MAX_X);
        const y = clamp(cy + Math.sin(angle) * r, MIN_Y, MAX_Y);
        const candidate = { x, y };

        const ok = placed.every((p) => distance(p, candidate) >= minDist);
        if (ok) {
          point = candidate;
          break;
        }
      }

      // Fallback: anywhere in the sky but still avoid overlaps
      if (!point) {
        for (let attempt = 0; attempt < 140; attempt++) {
          const x = MIN_X + rng() * (MAX_X - MIN_X);
          const y = MIN_Y + rng() * (MAX_Y - MIN_Y);
          const candidate = { x, y };

          const ok = placed.every((p) => distance(p, candidate) >= minDist);
          if (ok) {
            point = candidate;
            break;
          }
        }
      }

      // Last fallback: place near cluster even if close (ensures every habit shows)
      if (!point) {
        point = {
          x: clamp(cx + (rng() - 0.5) * spread, MIN_X, MAX_X),
          y: clamp(cy + (rng() - 0.5) * spread, MIN_Y, MAX_Y),
        };
      }

      placed.push(point);
      outById.set(habit.id, point);
    }

    // Return positions aligned with original activeHabits order (for rendering)
    return habits.map((h) => outById.get(h.id) ?? { x: 50, y: 50 });
  }, [activeHabits, skySeed]);

  /**
   * Connection lines:
   * Connect each star to its nearest neighbors (constellation-like).
   */
  const edges: Edge[] = useMemo(() => {
    const pts = positions;
    const n = pts.length;
    if (n <= 1) return [];

    const K = n <= 6 ? 2 : 1;

    const edgeSet = new Set<string>();
    const out: Edge[] = [];

    for (let i = 0; i < n; i++) {
      const dists: { j: number; d: number }[] = [];
      for (let j = 0; j < n; j++) {
        if (i === j) continue;
        dists.push({ j, d: distance(pts[i], pts[j]) });
      }
      dists.sort((a, b) => a.d - b.d);

      for (let k = 0; k < Math.min(K, dists.length); k++) {
        const j = dists[k].j;
        const a = Math.min(i, j);
        const b = Math.max(i, j);
        const key = `${a}-${b}`;
        if (!edgeSet.has(key)) {
          edgeSet.add(key);
          out.push({ a, b });
        }
      }
    }

    return out;
  }, [positions]);

  if (activeHabits.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <div className="text-4xl mb-4 animate-float">✦</div>
        <p className="text-muted-foreground text-lg">Your constellation awaits</p>
        <p className="text-muted-foreground/70 text-sm mt-2">
          Add your first habit to begin shaping your night sky
        </p>
      </div>
    );
  }

  const completedCount = activeHabits.filter((h) =>
    isHabitCompleted(data, h.id, today)
  ).length;

  return (
    <div className="relative w-full aspect-square max-w-lg mx-auto">
      {/* Connection lines between stars */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid meet"
      >
        {edges.map(({ a, b }) => {
          const posA = positions[a];
          const posB = positions[b];

          const completedA = isHabitCompleted(data, activeHabits[a].id, today);
          const completedB = isHabitCompleted(data, activeHabits[b].id, today);
          const isConnected = completedA && completedB;

          return (
            <line
              key={`${a}-${b}`}
              x1={`${posA.x}%`}
              y1={`${posA.y}%`}
              x2={`${posB.x}%`}
              y2={`${posB.y}%`}
              className={`transition-all duration-500 ${
                isConnected ? 'stroke-star/40' : 'stroke-border/25'
              }`}
              strokeWidth="0.3"
              strokeDasharray={isConnected ? '0' : '1 1'}
            />
          );
        })}
      </svg>

      {/* Stars */}
      {activeHabits.map((habit, index) => (
        <div
          key={habit.id}
          className="absolute transform -translate-x-1/2 -translate-y-1/2"
          style={{
            left: `${positions[index]?.x ?? 50}%`,
            top: `${positions[index]?.y ?? 50}%`,
          }}
        >
          <HabitStar
            habit={habit}
            isCompleted={isHabitCompleted(data, habit.id, today)}
            momentum={calculateMomentum(data, habit.id)}
            onToggle={() => onToggleHabit(habit.id)}
            onEdit={() => onEditHabit(habit)}
            delay={index * 50}
          />
        </div>
      ))}

      {/* Completion indicator */}
      {completedCount === activeHabits.length && activeHabits.length > 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-gradient-star-glow w-32 h-32 rounded-full animate-star-pulse opacity-30" />
        </div>
      )}
    </div>
  );
}
