
# Hecho ✅

## Backend (NestJS + Firestore + GraphQL)

* [x] **Config Firestore** con credenciales y `.env` cargando.
* [x] **FirestoreModule** global y **LlmModule** global (DI resuelta).
* [x] **GoalsModule**: `upsertGoal`, `findById`, tipos GraphQL.
* [x] **PlansModule**: `PlansService` (create/findByGoal/findById), `Plan` model.
* [x] **TasksModule**: `TasksService` (bulkCreate/byGoal/complete), `Task` model + enum.
* [x] **Orchestrator** (Gemini + zod): `generatePlanForGoal`, persist Plan+Tasks; `replan(goalId)`.
* [x] **Resolvers**:

  * `generatePlan(goalId)`, `tasksByGoal(goalId)`, `completeTask(taskId)`, `replan(goalId)`.
  * `planByGoal(goalId)` para el dashboard.
* [x] **ChatModule (Ambient AI)**: `sendChat(text)` crea goal, genera plan y responde; `chatHistory`.
* [x] **Índices Firestore** (al menos creados los mínimos para chat; goals/tasks en proceso).

## Frontend (Next.js App Router + Apollo + styled-components + Zustand)

* [x] **Apollo v3** con `ApolloProvider`.
* [x] **Arquitectura** limpia: `app/`, `features/`, `graphql/`, `store/`, `lib/`.
* [x] **AppShell** mobile-first: header + drawer + tabs inferiores.
* [x] **ToastProvider** global (success/error/warning).
* [x] **Zustand**: `currentGoalId`, `navOpen` (persistente).
* [x] **Páginas**:

  * `/chat`: GoalSelector, enviar mensaje, **Ajustar plan (IA)**.
  * `/goals`: listar/crear goals + **Generar plan**.
  * `/plan/[goalId]`: **patrón server→client** (`PlanClient`), lista de tareas, **optimistic UI** en “Completar”.
  * `/dashboard`: resumen del plan + **tareas de hoy** + progreso.
  * `/`: links de navegación.
* [x] **UX**: mobile-first, estados de carga, toasts, skip de queries sin variables, empty states básicos.

---

# Faltante / Backlog

## P0 (antes de la demo) 🚨

* [ ] **Verificar y crear índices Firestore** necesarios:

  * `chat_logs`:

    * `userId (ASC)`, `createdAt (DESC)`
    * `userId (ASC)`, `goalId (ASC)`, `createdAt (DESC)`
  * `goals`:

    * `userId (ASC)`, `status (ASC)`
    * `userId (ASC)`, `createdAt (DESC)`
  * `tasks`:

    * `planId (ASC)`, `dueAt (ASC)`
* [ ] **Ordenar tareas por fecha** (si no lo hiciste): `orderBy('dueAt','asc')` en `TasksService.byGoal` → requerirá el índice anterior.
* [ ] **Plan visible también en la vista Plan**: traer `planByGoal` en `PlanClient` y mostrar `summary`/`recommendations`/`weeklySchedule`.
* [ ] **Mensajes de error amigables**: capturar `FAILED_PRECONDITION` (índices) en Chat/Goals/Plan y mostrar toast (“Construyendo índices…”).
* [ ] **Config rápida de “usuario actual”**: ahora es `demo-user`.

  * Backend: aceptar `x-user-id` en el contexto GraphQL.
  * Frontend: setearlo en `fetch` o `HttpLink` (header simple) desde `.env.local`.
* [ ] **Seed de demo**: script para crear 1–2 goals y plan con tareas (por si el LLM está lento).

## P1 (mejoras de experiencia) 🍰

* [ ] **Skeletons** reutilizables para listas/cards (carga suave).
* [ ] **Toggle claro/oscuro** en header (tema del `ThemeProvider`).
* [ ] **Persistir más UI**: último tab abierto, último filtro en Goals.
* [ ] **Replan contextual**: en `/plan/[goalId]` un botón “Ajustar plan”.
* [ ] **KPIs ligeros** en Dashboard: próximas 48h, streak de días cumplidos.
* [ ] **Validaciones de formulario** en `/goals` (título obligatorio, etc).
* [ ] **i18n sencillo** (si quieres mostrar “EN” en entrevista).

## P2 (siguiente iteración) 🚀

* [ ] **Auth real** (JWT o Clerk/NextAuth) y `userId` desde token.
* [ ] **Notificaciones** (email/push) para tareas próximas.
* [ ] **Logs/Metrics**: costos LLM, tiempos, errores; panel mínimo.
* [ ] **Roles/tenants** (si piensas multi-cliente).
* [ ] **Tests**: e2e (supertest en Nest), integración de servicios, tests de componentes.

---

# Aceptación rápida (P0)

* **Índices**: ninguna query GraphQL de `chatHistory`, `goals`, `tasksByGoal` falla con `FAILED_PRECONDITION`.
* **Orden**: `tasksByGoal` devuelve tareas en **orden ascendente por `dueAt`**.
* **Plan en vista Plan**: se ve `Resumen`, `Recomendaciones` y `Agenda semanal`.
* **Toasts**: se muestran en completar tarea, generar/ajustar plan y errores de índice.
* **User**: backend respeta `x-user-id`; frontend lo envía; UI muestra solo data del usuario.

---

# Snippets útiles para cerrar P0

## 1) Header con `x-user-id` en Apollo

```ts
// src/lib/apolloClient.ts
import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";

export const makeApolloClient = () =>
  new ApolloClient({
    link: new HttpLink({
      uri: process.env.NEXT_PUBLIC_GRAPHQL_URL,
      headers: () => ({
        "x-user-id": process.env.NEXT_PUBLIC_DEMO_USER_ID ?? "demo-user",
      })
    } as any),
    cache: new InMemoryCache(),
  });
```

`.env.local`

```
NEXT_PUBLIC_GRAPHQL_URL=http://localhost:7000/graphql
NEXT_PUBLIC_DEMO_USER_ID=demo-user
```

Backend (contexto):

```ts
GraphQLModule.forRoot({
  // ...
  context: ({ req }) => ({ userId: req.headers['x-user-id'] ?? 'demo-user' }),
});
```

Y úsalo en tus servicios en lugar del literal.

## 2) `TasksService.byGoal` con orden

```ts
const q = await this.db.collection('tasks')
  .where('planId','==',planId)
  .orderBy('dueAt','asc')  // ← requiere índice planId+dueAt
  .get();
```

## 3) Plan en `PlanClient`

```tsx
import { QUERY_PLAN_BY_GOAL } from "@/graphql/operations";

const { data: planData } = useQuery(QUERY_PLAN_BY_GOAL, {
  variables: { goalId },
  skip: !goalId,
});

{planData?.planByGoal && (
  <Card>
    <h3>Resumen</h3>
    <p>{planData.planByGoal.summary}</p>
    {/* recomendaciones y agenda semanal */}
  </Card>
)}
```

---

# Siguiente paso sugerido (orden)

1. Crear/validar **todos los índices** (5 min total).
2. Ordenar tareas por `dueAt` y mostrar plan en `/plan/[goalId]`.
3. Inyectar `x-user-id` para cerrar el loop multiusuario.
4. Añadir **skeletons** y **toggle de tema** (extra puntos en la entrevista).

