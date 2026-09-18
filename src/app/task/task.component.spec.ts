import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { TaskComponent } from './task.component';
import { Task, TaskStatus } from '../models/task.model';

describe('TaskComponent', () => {
  let component: TaskComponent;
  let fixture: ComponentFixture<TaskComponent>;

  const sampleTask: Task = {
    id: 't1',
    title: 'Write unit tests',
    description: 'Cover the task component',
    status: TaskStatus.New,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TaskComponent);
    component = fixture.componentInstance;
    component.task = { ...sampleTask };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the task title and description via property binding', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.task-card__title')?.textContent).toContain('Write unit tests');
    expect(el.querySelector('.task-card__description')?.textContent).toContain(
      'Cover the task component'
    );
  });

  it('should render the current status in the badge', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.status-badge')?.textContent?.trim()).toBe(TaskStatus.New);
  });

  it('should emit edit with the task id when Edit is clicked', () => {
    spyOn(component.edit, 'emit');
    const editBtn = fixture.debugElement.query(By.css('.btn--secondary')).nativeElement;

    editBtn.click();

    expect(component.edit.emit).toHaveBeenCalledWith('t1');
  });

  it('should emit delete with the task id when Delete is clicked', () => {
    spyOn(component.delete, 'emit');
    const deleteBtn = fixture.debugElement.query(By.css('.btn--danger')).nativeElement;

    deleteBtn.click();

    expect(component.delete.emit).toHaveBeenCalledWith('t1');
  });

  it('should emit statusChange with id and new status when the select changes', () => {
    spyOn(component.statusChange, 'emit');

    component.onStatusChange(TaskStatus.Completed);

    expect(component.statusChange.emit).toHaveBeenCalledWith({
      id: 't1',
      status: TaskStatus.Completed
    });
  });

  it('should compute a CSS-friendly status class', () => {
    expect(component.statusClass(TaskStatus.InProgress)).toBe('status-in-progress');
    expect(component.statusClass(TaskStatus.New)).toBe('status-new');
  });
});
