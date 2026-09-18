import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskFormComponent } from './task-form.component';
import { Task, TaskStatus } from '../models/task.model';

describe('TaskFormComponent', () => {
  let component: TaskFormComponent;
  let fixture: ComponentFixture<TaskFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskFormComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TaskFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should start in add mode with an empty, New-status form', () => {
    expect(component.isEditMode).toBeFalse();
    expect(component.form.value.title).toBe('');
    expect(component.form.value.status).toBe(TaskStatus.New);
  });

  it('should be invalid when title is empty, and valid once filled in', () => {
    expect(component.form.valid).toBeFalse();

    component.form.controls.title.setValue('A task title');

    expect(component.form.valid).toBeTrue();
  });

  it('should not emit save when submitted while invalid', () => {
    spyOn(component.save, 'emit');

    component.onSubmit();

    expect(component.save.emit).not.toHaveBeenCalled();
    expect(component.titleControl.touched).toBeTrue();
  });

  it('should emit save with trimmed values when submitted while valid', () => {
    spyOn(component.save, 'emit');
    component.form.setValue({
      title: '  New task  ',
      description: '  details  ',
      status: TaskStatus.InProgress
    });

    component.onSubmit();

    expect(component.save.emit).toHaveBeenCalledWith({
      title: 'New task',
      description: 'details',
      status: TaskStatus.InProgress
    });
  });

  it('should reset the form after a successful add-mode submit', () => {
    component.form.setValue({
      title: 'Task one',
      description: '',
      status: TaskStatus.New
    });

    component.onSubmit();

    expect(component.form.value.title).toBeFalsy();
  });

  it('should pre-fill the form and enter edit mode when a task input is set', () => {
    const task: Task = {
      id: 'abc',
      title: 'Existing task',
      description: 'Existing description',
      status: TaskStatus.Verified,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    component.task = task;
    component.ngOnChanges({
      task: {
        currentValue: task,
        previousValue: null,
        firstChange: true,
        isFirstChange: () => true
      }
    });

    expect(component.isEditMode).toBeTrue();
    expect(component.form.value.title).toBe('Existing task');
    expect(component.form.value.status).toBe(TaskStatus.Verified);
  });

  it('should emit cancel when onCancel is called', () => {
    spyOn(component.cancel, 'emit');

    component.onCancel();

    expect(component.cancel.emit).toHaveBeenCalled();
  });
});
