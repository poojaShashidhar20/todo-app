import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Task, TASK_STATUSES, TaskFormValue, TaskStatus } from '../models/task.model';

/**
 * Reactive-forms based component used to both create a new task and
 * edit an existing one. Which mode it's in is driven entirely by the
 * `task` @Input: null/undefined means "add", a Task means "edit".
 *
 * On submit it emits a fully-formed TaskFormValue via @Output so the
 * parent decides whether to call TaskService.addTask or updateTask.
 * This keeps the form itself unaware of the service/storage layer.
 */
@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './task-form.component.html',
  styleUrl: './task-form.component.css'
})
export class TaskFormComponent implements OnChanges {
  /** When set, the form pre-fills with this task's data (edit mode). */
  @Input() task: Task | null = null;

  /** Emits the submitted form value (add or edit, caller decides which). */
  @Output() save = new EventEmitter<TaskFormValue>();

  /** Emits when the user cancels out of the form. */
  @Output() cancel = new EventEmitter<void>();

  private readonly fb = inject(FormBuilder);

  readonly statuses = TASK_STATUSES;

  readonly form = this.fb.group({
    title: this.fb.control('', [Validators.required, Validators.maxLength(80)]),
    description: this.fb.control('', [Validators.maxLength(500)]),
    status: this.fb.control<TaskStatus>(TaskStatus.New, [Validators.required])
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['task']) {
      this.resetFormFromTask(this.task);
    }
  }

  get isEditMode(): boolean {
    return this.task !== null;
  }

  get titleControl() {
    return this.form.controls.title;
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    this.save.emit({
      title: value.title!.trim(),
      description: (value.description ?? '').trim(),
      status: value.status!
    });

    if (!this.isEditMode) {
      this.resetFormFromTask(null);
    }
  }

  onCancel(): void {
    this.cancel.emit();
  }

  private resetFormFromTask(task: Task | null): void {
    this.form.reset({
      title: task?.title ?? '',
      description: task?.description ?? '',
      status: task?.status ?? TaskStatus.New
    });
  }
}
