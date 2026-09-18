/**
 * The fixed set of statuses a task can be in.
 * Using a string enum keeps stored/serialized values human-readable
 * (e.g. in localStorage or JSON) while still giving compile-time safety.
 */
export enum TaskStatus {
  New = 'New',
  InProgress = 'In Progress',
  Rejected = 'Rejected',
  Verified = 'Verified',
  Completed = 'Completed'
}

/** Ordered list of all valid statuses, useful for populating <select> options. */
export const TASK_STATUSES: TaskStatus[] = [
  TaskStatus.New,
  TaskStatus.InProgress,
  TaskStatus.Rejected,
  TaskStatus.Verified,
  TaskStatus.Completed
];

/** Core to-do item shape used throughout the app. */
export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
}

/** Shape used by the form when creating or editing a task. */
export interface TaskFormValue {
  title: string;
  description: string;
  status: TaskStatus;
}
