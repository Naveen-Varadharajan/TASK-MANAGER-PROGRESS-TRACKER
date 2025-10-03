const taskForm = document.getElementById('taskForm');
const taskText = document.getElementById('taskText');
const taskDue = document.getElementById('taskDue');
const taskPriority = document.getElementById('taskPriority');
const taskList = document.getElementById('taskList');
const filter = document.getElementById('filter');
const sort = document.getElementById('sort');
const clearCompleted = document.getElementById('clearCompleted');
const taskTpl = document.getElementById('taskTpl');
const taskCount = document.getElementById('taskCount');
const statActive = document.getElementById('statActive');
const statCompleted = document.getElementById('statCompleted');
const statOverdue = document.getElementById('statOverdue');
const progressFill = document.getElementById('progressFill');

let tasks = JSON.parse(localStorage.getItem('tm_tasks_v1') || '[]');

function saveTasks() {
  localStorage.setItem('tm_tasks_v1', JSON.stringify(tasks));
}

function renderTasks() {
  taskList.innerHTML = '';
  let filtered = tasks;

  if (filter.value === 'active') {
    filtered = tasks.filter(t => !t.completed);
  }
  if (filter.value === 'completed') {
    filtered = tasks.filter(t => t.completed);
  }

  if (sort.value === 'due') {
    filtered.sort((a, b) => (a.due || '') > (b.due || '') ? 1 : -1);
  }
  if (sort.value === 'priority') {
    filtered.sort((a, b) => b.priority.localeCompare(a.priority));
  }
  if (sort.value === 'created') {
    filtered.sort((a, b) => b.created - a.created);
  }

  filtered.forEach(task => {
    const node = taskTpl.content.cloneNode(true);
    const el = node.querySelector('.task');
    el.querySelector('.title').textContent = task.text;
    el.querySelector('.chk').checked = task.completed;
    el.querySelector('.meta').textContent = `${task.priority} priority ${task.due ? '| Due: ' + task.due : ''}`;

    el.querySelector('.chk').addEventListener('change', () => {
      task.completed = !task.completed;
      saveTasks();
      updateStats();
      renderTasks();
    });

    el.querySelector('.edit').addEventListener('click', () => {
      const newText = prompt('Edit task:', task.text);
      if (newText) {
        task.text = newText;
        saveTasks();
        renderTasks();
      }
    });

    el.querySelector('.del').addEventListener('click', () => {
      tasks = tasks.filter(t => t !== task);
      saveTasks();
      updateStats();
      renderTasks();
    });

    taskList.appendChild(node);
  });
  updateStats();
}

function updateStats() {
  const total = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  const active = total - completed;
  const overdue = tasks.filter(t => !t.completed && t.due && new Date(t.due) < new Date()).length;

  taskCount.textContent = `${total} tasks`;
  statActive.textContent = active;
  statCompleted.textContent = completed;
  statOverdue.textContent = overdue;

  const percent = total ? (completed / total) * 100 : 0;
  progressFill.style.width = percent + '%';
}

taskForm.addEventListener('submit', e => {
  e.preventDefault();
  const text = taskText.value.trim();
  if (!text) return;

  tasks.push({
    text,
    due: taskDue.value,
    priority: taskPriority.value,
    completed: false,
    created: Date.now()
  });
  saveTasks();
  taskText.value = '';
  taskDue.value = '';
  renderTasks();
});

filter.addEventListener('change', renderTasks);
sort.addEventListener('change', renderTasks);

clearCompleted.addEventListener('click', () => {
  tasks = tasks.filter(t => !t.completed);
  saveTasks();
  renderTasks();
});

renderTasks();
