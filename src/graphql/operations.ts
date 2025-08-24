import { gql } from "@apollo/client";

export const MUTATION_SEND_CHAT = gql`
  mutation SendChat($text: String!, $goalId: ID) {
    sendChat(text: $text, goalId: $goalId) {
      id
      role
      text
      goalId
      planId
      createdAt
      effects { type payload }
    }
  }
`;



export const QUERY_CHAT_HISTORY = gql`
  query ChatHistory($goalId: ID, $limit: Int) {
    chatHistory(goalId: $goalId, limit: $limit) {
      id
      role
      text
      goalId
      planId
      createdAt
    }
  }
`;

export const QUERY_GOALS = gql`
  query Goals {
    goals {
      id
      title
      domain
      status
      createdAt
    }
  }
`;

export const MUTATION_UPSERT_GOAL = gql`
  mutation UpsertGoal($input: CreateGoalInput!) {
    upsertGoal(input: $input) {
      id
      title
      domain
      status
      createdAt
    }
  }
`;

export const MUTATION_GENERATE_PLAN = gql`
  mutation GeneratePlan($goalId: ID!) {
    generatePlan(goalId: $goalId) {
      id
      goalId
      summary
      recommendations
      weeklySchedule { day action }
      tasks { id title status dueAt scoreWeight }
    }
  }
`;

export const QUERY_TASKS_BY_GOAL = gql`
  query TasksByGoal($goalId: ID!) {
    tasksByGoal(goalId: $goalId) {
      id title status dueAt scoreWeight
    }
  }
`;

export const MUTATION_COMPLETE_TASK = gql`
  mutation CompleteTask($taskId: ID!) {
    completeTask(taskId: $taskId) {
      id title status updatedAt
    }
  }
`;

export const MUTATION_REPLAN = gql`
  mutation Replan($goalId: ID!) {
    replan(goalId: $goalId) {
      id
      goalId
      summary
      recommendations
      weeklySchedule { day action }
      tasks { id title status dueAt scoreWeight }
    }
  }
`;

export const QUERY_PLAN_BY_GOAL = gql`
  query PlanByGoal($goalId: ID!) {
    planByGoal(goalId: $goalId) {
      id
      goalId
      summary
      recommendations
      weeklySchedule { day action }
    }
  }
`;


export const MUTATION_LOGIN = gql`
  mutation Login($email: String!, $password: String!) {
    login(email:$email, password:$password) {
      accessToken
      user { id name email }
    }
  }
`;

export const MUTATION_REGISTER = gql`
  mutation Register($email: String!, $password: String!, $name: String) {
    register(email:$email, password:$password, name:$name) {
      accessToken
      user { id name email }
    }
  }
`;

export const QUERY_ME = gql`
  query Me { me { id name email } }
`;

export const MUTATION_UPSERT_MY_PROFILE = gql`
  mutation UpsertMyProfile($input: UpsertUserInput!) {
    upsertMyProfile(input: $input) {
      id email name avatarUrl timeZone locale
    }
  }
`;

export const QUERY_TASKS_TODAY = gql`
  query TasksToday {
    tasksToday {
      id title status dueAt scoreWeight planId
    }
  }
`;


export const QUERY_GOAL = gql`
  query Goal($id: ID!) {
    goal(id: $id) {
      id
      title
      domain
      status
      createdAt
    }
  }
`;


export const MUTATION_ADD_TASKS = gql`
  mutation AddTasks($input: AddTasksInput!) {
    addTasks(input: $input) {
      id title status dueAt scoreWeight planId
    }
  }
`;



export const MUTATION_DELETE_GOAL = gql`
  mutation DeleteGoal($goalId: ID!) {
    deleteGoal(goalId: $goalId)
  }
`;