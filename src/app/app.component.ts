import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';

import { TaskService } from './core/services/task.service';
import { Task, TaskFormValue, TaskStatus } from './models/task.model';
import { TaskComponent } from './task/task.component';
import { TaskFormComponent } from './task-form/task-form.component';

/**
 * Application entry point / "smart" container component.
 *
 * AppComponent is the only place that talks to TaskService. It reads
 * the task list via the tasks$ observable (rendered with the async
 * pipe) and hands each task down to the reusable <app-task> component
 * via property binding. Events bubbling up from <app-task> and
 * <app-task-form> (edit / delete / statusChange / save / cancel) are
 * handled here and translated into TaskService calls, keeping the
 * child components free of storage/business logic.
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, TaskComponent, TaskFormComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  private readonly taskService = inject(TaskService);

  readonly tasks$: Observable<Task[]> = this.taskService.tasks$;

  /** The task currently being edited, or null when the form is in "add" mode. */
  editingTask: Task | null = null;

  /** Currently selected status filter; 'All' shows every task. */
  statusFilter: TaskStatus | 'All' = 'All';

  readonly filters: Array<TaskStatus | 'All'> = [
    'All',
    TaskStatus.New,
    TaskStatus.InProgress,
    TaskStatus.Rejected,
    TaskStatus.Verified,
    TaskStatus.Completed
  ];

  visibleTasks(tasks: Task[]): Task[] {
    return this.statusFilter === 'All'
      ? tasks
      : tasks.filter(task => task.status === this.statusFilter);
  }

  onFormSave(value: TaskFormValue): void {
    if (this.editingTask) {
      this.taskService.updateTask(this.editingTask.id, value);
      this.editingTask = null;
    } else {
      this.taskService.addTask(value);
    }
  }

  onFormCancel(): void {
    this.editingTask = null;
  }

  onEditRequested(taskId: string): void {
    this.editingTask = this.taskService.getTaskById(taskId) ?? null;
  }

  onDeleteRequested(taskId: string): void {
    if (this.editingTask?.id === taskId) {
      this.editingTask = null;
    }
    this.taskService.deleteTask(taskId);
  }

  onStatusChangeRequested(event: { id: string; status: TaskStatus }): void {
    this.taskService.updateStatus(event.id, event.status);
  }

  trackByTaskId(_index: number, task: Task): string {
    return task.id;
  }
}
