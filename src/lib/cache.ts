import { ApolloCache, DefaultContext } from "@apollo/client";
import { QUERY_TASKS_BY_GOAL } from "@/graphql/operations";

export function markTaskDoneInCache(
    cache: ApolloCache<DefaultContext>,
    taskId: string,
    goalId: string
) {
    const vars = { goalId };
    const data = cache.readQuery<any>({ query: QUERY_TASKS_BY_GOAL, variables: vars });
    if (!data?.tasksByGoal) return;

    const updated = data.tasksByGoal.map((t: any) =>
        t.id === taskId ? { ...t, status: "DONE", updatedAt: new Date().toISOString() } : t
    );

    cache.writeQuery({
        query: QUERY_TASKS_BY_GOAL,
        variables: vars,
        data: { tasksByGoal: updated },
    });
}
