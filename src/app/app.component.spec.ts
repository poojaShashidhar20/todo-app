import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { TaskStatus } from './models/task.model';

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;
  let component: AppComponent;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [AppComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it('should render the page heading', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('To-Do List');
  });

  it('should show the empty state when there are no tasks', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.empty-state')).toBeTruthy();
  });

  it('should add a task through onFormSave and render it in the list', () => {
    component.onFormSave({ title: 'Buy milk', description: '', status: TaskStatus.New });
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelectorAll('app-task').length).toBe(1);
    expect(compiled.textContent).toContain('Buy milk');
  });

  it('should enter edit mode when onEditRequested is called with a valid id', () => {
    component.onFormSave({ title: 'Task to edit', description: '', status: TaskStatus.New });
    const [task] = (component as any).taskService.tasks;

    component.onEditRequested(task.id);

    expect(component.editingTask?.id).toBe(task.id);
  });

  it('should update the existing task instead of adding a new one while editing', () => {
    component.onFormSave({ title: 'Original', description: '', status: TaskStatus.New });
    const [task] = (component as any).taskService.tasks;

    component.onEditRequested(task.id);
    component.onFormSave({ title: 'Updated', description: '', status: TaskStatus.InProgress });

    const tasks = (component as any).taskService.tasks;
    expect(tasks.length).toBe(1);
    expect(tasks[0].title).toBe('Updated');
    expect(tasks[0].status).toBe(TaskStatus.InProgress);
    expect(component.editingTask).toBeNull();
  });

  it('should delete a task when onDeleteRequested is called', () => {
    component.onFormSave({ title: 'Delete me', description: '', status: TaskStatus.New });
    const [task] = (component as any).taskService.tasks;

    component.onDeleteRequested(task.id);

    expect((component as any).taskService.tasks.length).toBe(0);
  });

  it('should filter visible tasks by status', () => {
    component.onFormSave({ title: 'New task', description: '', status: TaskStatus.New });
    component.onFormSave({ title: 'Done task', description: '', status: TaskStatus.Completed });
    const allTasks = (component as any).taskService.tasks;

    component.statusFilter = TaskStatus.Completed;

    expect(component.visibleTasks(allTasks).length).toBe(1);
    expect(component.visibleTasks(allTasks)[0].title).toBe('Done task');
  });

  it('should update a task status when onStatusChangeRequested is called', () => {
    component.onFormSave({ title: 'Status task', description: '', status: TaskStatus.New });
    const [task] = (component as any).taskService.tasks;

    component.onStatusChangeRequested({ id: task.id, status: TaskStatus.Verified });

    expect((component as any).taskService.tasks[0].status).toBe(TaskStatus.Verified);
  });
});
