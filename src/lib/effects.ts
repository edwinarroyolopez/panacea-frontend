import { ApolloCache } from '@apollo/client';
import { QUERY_TASKS_TODAY, QUERY_PLAN_BY_GOAL, QUERY_TASKS_BY_GOAL } from '@/graphql/operations';
import { useUI } from '@/store/ui';

export function applyAssistantEffects(cache: ApolloCache<any>, effects: Array<{type:string; payload?:any}>) {
  const { setGoalId } = useUI.getState(); // leer fuera de react

  for (const fx of effects ?? []) {
    if (fx.type === 'SET_CURRENT_GOAL' && fx.payload?.goalId) {
      setGoalId(fx.payload.goalId);
    }
    if (fx.type === 'PLAN_CREATED' && fx.payload) {
      const { goalId } = fx.payload;
      // opcional: podrías escribir un plan mínimo al cache si lo devuelve el backend
      // cache.writeQuery({ query: QUERY_PLAN_BY_GOAL, variables: { goalId }, data: { planByGoal: {...} } });
    }
    if (fx.type === 'REFRESH_SECTIONS') {
      const s: string[] = fx.payload?.sections ?? [];
      if (s.includes('PLAN') && fx.payload?.goalId) {
        try { cache.evict({ fieldName: 'planByGoal', args: { goalId: fx.payload.goalId } }); } catch {}
      }
      if (s.includes('TASKS_TODAY')) {
        try { cache.evict({ fieldName: 'tasksToday' }); } catch {}
      }
      cache.gc?.();
    }
    // Future: ADD_TASKS, UPDATE_PLAN, etc: escribe en cache sin refetch
  }
}
