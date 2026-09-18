import { TestBed } from '@angular/core/testing';
import { TaskService } from './task.service';
import { TaskStatus } from '../../models/task.model';

describe('TaskService', () => {
  let service: TaskService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(TaskService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start with an empty task list when storage is empty', () => {
    expect(service.tasks.length).toBe(0);
  });

  it('should add a new task with New status by default from form value', () => {
    const task = service.addTask({
      title: 'Write tests',
      description: 'Cover the service',
      status: TaskStatus.New
    });

    expect(service.tasks.length).toBe(1);
    expect(task.title).toBe('Write tests');
    expect(task.status).toBe(TaskStatus.New);
    expect(task.id).toBeTruthy();
  });

  it('should trim whitespace from title and description when adding', () => {
    const task = service.addTask({
      title: '  Padded title  ',
      description: '  padded desc  ',
      status: TaskStatus.New
    });

    expect(task.title).toBe('Padded title');
    expect(task.description).toBe('padded desc');
  });

  it('should update a task status', () => {
    const task = service.addTask({
      title: 'Task A',
      description: '',
      status: TaskStatus.New
    });

    service.updateStatus(task.id, TaskStatus.InProgress);

    const updated = service.getTaskById(task.id);
    expect(updated?.status).toBe(TaskStatus.InProgress);
  });

  it('should update task fields via updateTask', () => {
    const task = service.addTask({
      title: 'Old title',
      description: 'Old desc',
      status: TaskStatus.New
    });

    service.updateTask(task.id, { title: 'New title' });

    const updated = service.getTaskById(task.id);
    expect(updated?.title).toBe('New title');
    expect(updated?.description).toBe('Old desc');
  });

  it('should delete a task by id', () => {
    const task = service.addTask({
      title: 'Delete me',
      description: '',
      status: TaskStatus.New
    });
    expect(service.tasks.length).toBe(1);

    service.deleteTask(task.id);

    expect(service.tasks.length).toBe(0);
    expect(service.getTaskById(task.id)).toBeUndefined();
  });

  it('should persist tasks to localStorage', () => {
    service.addTask({ title: 'Persisted', description: '', status: TaskStatus.New });

    const raw = localStorage.getItem('todo-app.tasks');
    expect(raw).toBeTruthy();
    const parsed = JSON.parse(raw as string);
    expect(parsed.length).toBe(1);
    expect(parsed[0].title).toBe('Persisted');
  });

  it('should load existing tasks from localStorage on construction', () => {
    const seeded = [
      {
        id: 'abc',
        title: 'Seeded',
        description: '',
        status: TaskStatus.Completed,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
    localStorage.setItem('todo-app.tasks', JSON.stringify(seeded));

    // Re-create the service so it reads from the (now seeded) storage.
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    const freshService = TestBed.inject(TaskService);

    expect(freshService.tasks.length).toBe(1);
    expect(freshService.tasks[0].title).toBe('Seeded');
  });

  it('should emit updated lists through tasks$', done => {
    const emissions: number[] = [];
    service.tasks$.subscribe(tasks => {
      emissions.push(tasks.length);
      if (emissions.length === 2) {
        expect(emissions).toEqual([0, 1]);
        done();
      }
    });

    service.addTask({ title: 'Observed', description: '', status: TaskStatus.New });
  });
});
