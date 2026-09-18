import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Task, TASK_STATUSES, TaskStatus } from '../models/task.model';

/**
 * Presentational component that renders a single to-do item.
 *
 * It is intentionally "dumb": it receives a Task via @Input and never
 * mutates it directly or talks to TaskService itself. All user actions
 * (status change, edit, delete) are surfaced as @Output events so the
 * parent (AppComponent) stays the single source of truth for data
 * changes. This keeps the component reusable and easy to test in
 * isolation.
 */
@Component({
  selector: 'app-task',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './task.component.html',
  styleUrl: './task.component.css'
})
export class TaskComponent {
  /** The task item to display. Required. */
  @Input({ required: true }) task!: Task;

  /** Emits the task's id when the user clicks "Edit". */
  @Output() edit = new EventEmitter<string>();

  /** Emits the task's id when the user clicks "Delete". */
  @Output() delete = new EventEmitter<string>();

  /** Emits { id, status } when the user changes the status dropdown. */
  @Output() statusChange = new EventEmitter<{ id: string; status: TaskStatus }>();

  readonly statuses = TASK_STATUSES;

  onEdit(): void {
    this.edit.emit(this.task.id);
  }

  onDelete(): void {
    this.delete.emit(this.task.id);
  }

  onStatusChange(newStatus: string): void {
    this.statusChange.emit({ id: this.task.id, status: newStatus as TaskStatus });
  }

  /** Maps a status to a CSS class suffix for the status badge color. */
  statusClass(status: TaskStatus): string {
    return 'status-' + status.toLowerCase().replace(/\s+/g, '-');
  }
}
