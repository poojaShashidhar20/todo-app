import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Task, TaskFormValue, TaskStatus } from '../../models/task.model';

const STORAGE_KEY = 'todo-app.tasks';

/**
 * Owns the to-do list's data and persistence.
 *
 * Persistence uses the browser's localStorage so tasks survive page
 * reloads without needing a backend/database. All reads/writes go
 * through this service so components never touch storage directly.
 *
 * State is exposed as an Observable (tasks$) so components can react
 * to changes via the async pipe or subscriptions, keeping data flow
 * unidirectional and easy to reason about.
 */
@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private readonly tasksSubject = new BehaviorSubject<Task[]>(this.loadFromStorage());

  /** Observable stream of the current task list. */
  readonly tasks$: Observable<Task[]> = this.tasksSubject.asObservable();

  /** Snapshot accessor for the current tasks (synchronous convenience). */
  get tasks(): Task[] {
    return this.tasksSubject.value;
  }

  /** Adds a new task built from form input and persists the updated list. */
  addTask(value: TaskFormValue): Task {
    const now = new Date().toISOString();
    const newTask: Task = {
      id: this.generateId(),
      title: value.title.trim(),
      description: value.description.trim(),
      status: value.status,
      createdAt: now,
      updatedAt: now
    };

    this.setTasks([...this.tasks, newTask]);
    return newTask;
  }

  /** Updates an existing task (e.g. title, description, or status) by id. */
  updateTask(id: string, changes: Partial<TaskFormValue>): void {
    const updated = this.tasks.map(task =>
      task.id === id
        ? { ...task, ...changes, updatedAt: new Date().toISOString() }
        : task
    );
    this.setTasks(updated);
  }

  /** Convenience method for changing just a task's status. */
  updateStatus(id: string, status: TaskStatus): void {
    this.updateTask(id, { status });
  }

  /** Removes a task by id and persists the updated list. */
  deleteTask(id: string): void {
    this.setTasks(this.tasks.filter(task => task.id !== id));
  }

  /** Looks up a single task by id (used when opening the edit form). */
  getTaskById(id: string): Task | undefined {
    return this.tasks.find(task => task.id === id);
  }

  private setTasks(tasks: Task[]): void {
    this.tasksSubject.next(tasks);
    this.saveToStorage(tasks);
  }

  private loadFromStorage(): Task[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as Task[]) : [];
    } catch {
      // Corrupt or inaccessible storage shouldn't crash the app.
      return [];
    }
  }

  private saveToStorage(tasks: Task[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch {
      // Ignore write failures (e.g. storage full or disabled).
    }
  }

  private generateId(): string {
    return typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  }
}
