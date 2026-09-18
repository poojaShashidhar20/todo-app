# Simple To-Do List Application (Angular Coding Exercise)

An Angular application for managing a personal to-do list: add tasks, edit them, change their status, and delete them. Data is persisted in the browser's `localStorage`, so the list survives page reloads without needing a backend or database.

Built with Angular 19 (standalone components, no NgModules).

## Requirements coverage

* **Angular** — Angular 19, standalone components, generated with the Angular CLI.
* **Storage** — `localStorage` (see `TaskService`), no database required.
* **Main component** — `AppComponent` (`src/app/app.component.ts`) is the entry point and the only component that talks to `TaskService`.
* **Reusable Task Component** — `TaskComponent` (`src/app/task/task.component.ts`) renders one task and is fully driven by `@Input`/`@Output`.
* **Task statuses** — `New`, `In Progress`, `Rejected`, `Verified`, `Completed` (see `src/app/models/task.model.ts`).
* **Features** — list, add, edit (including status), delete. A status filter is included as a small bonus.
* **Data binding** — property binding (`[task]`, `[value]`, `[disabled]`, `[ngClass]`, ...) and event binding (`(click)`, `(change)`, `(ngSubmit)`, custom `@Output`s) throughout.
* **Angular forms** — `TaskFormComponent` uses `ReactiveFormsModule` with validators (`required`, `maxLength`) and inline error messages.
* **Reusable components / `@Input` & `@Output`** — see "Architecture" below.
* **Unit tests** — 34 Jasmine/Karma specs across the service, both components, and the app shell (see "Testing").

## Architecture

```
src/app/
  models/
    task.model.ts          Task interface, TaskStatus enum, TaskFormValue
  core/services/
    task.service.ts         Owns the task list; reads/writes localStorage;
                             exposes tasks$ as an Observable<Task[]>
  task/
    task.component.ts       Reusable "dumb" component for one task card.
                             @Input task, @Output edit/delete/statusChange
  task-form/
    task-form.component.ts  Reactive form used for both add and edit.
                             @Input task (null = add mode), @Output save/cancel
  app.component.ts          Entry point / container. Injects TaskService,
                             renders the list + form, wires child events to
                             service calls.
```

Data flow is one-directional and easy to reason about:

1. `AppComponent` subscribes to `TaskService.tasks$` (via the `async` pipe) and passes each `Task` down to a `<app-task>` via property binding.
2. `TaskComponent` never mutates data or calls the service directly — user actions (Edit / Delete / status dropdown) are emitted as `@Output` events.
3. `AppComponent` handles those events and calls `TaskService` (`addTask`, `updateTask`, `updateStatus`, `deleteTask`), which updates its internal `BehaviorSubject` and persists the new list to `localStorage`. The updated list then flows back down automatically.
4. `TaskFormComponent` is reused for both "Add" and "Edit": passing it a `Task` via `[task]` pre-fills and switches it into edit mode; passing `null` clears it back to "add" mode. It only ever emits a `TaskFormValue` — it has no idea whether that becomes a new task or an update, which is `AppComponent`'s decision.

## Getting started

Requires Node.js (LTS) and npm.

```bash
npm install
npm start        # ng serve — open http://localhost:4200
```

### Build

```bash
npm run build     # outputs to dist/todo-app
```

### Unit tests

```bash
npm test
```

This runs the Karma/Jasmine suite in Chrome. In a headless/CI/container environment without a visible display, point `CHROME_BIN` at a Chromium/Chrome binary and Karma will run it headless with `--no-sandbox` via the `ChromeHeadlessNoSandbox` launcher configured in `karma.conf.js`, e.g.:

```bash
CHROME_BIN=$(which chromium) npm test
```

All 34 specs pass, covering:

* `TaskService` — add/update/delete/lookup, trimming, localStorage persistence and rehydration, and the `tasks$` observable stream.
* `TaskComponent` — property binding of task data, and each `@Output` (`edit`, `delete`, `statusChange`) firing with the right payload.
* `TaskFormComponent` — validation (required title), trimming on submit, switching between add/edit mode via `@Input`, and the `save`/`cancel` outputs.
* `AppComponent` — add/edit/delete/status-change flows end-to-end through the real `TaskService`, plus the status filter.

## Notes / possible extensions

* Storage is intentionally isolated inside `TaskService` behind an Observable API, so swapping `localStorage` for `sessionStorage`, an in-memory store, or a real backend later would only require changing that one file.
* A status filter dropdown was added as a small usability extra; it doesn't affect the core CRUD requirements.

