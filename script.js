// ➜ Pridať novú úlohu
function addTask() {
  const input = document.getElementById('taskInput');
  const text = input.value.trim();
  localStorage.removeItem('inputValue');

  if (text === '') return;

  const li = createTaskElement(text, false);
  document.getElementById('activeTasks').appendChild(li);

  saveTasks();

  input.value = '';
  input.focus();
}

// ➜ Vytvoriť HTML prvok úlohy
function createTaskElement(text, done) {
  const li = document.createElement('li');

  const taskLeft = document.createElement('div');
  taskLeft.className = 'task-left';

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.checked = done;

  const span = document.createElement('span');
  span.className = 'task-text';
  span.textContent = text;
  if (done) span.classList.add('done');

  // Označiť hotovo / nehotovo
  checkbox.onclick = () => {
    span.classList.toggle('done');
    if (checkbox.checked) {
      document.getElementById('doneTasks').appendChild(li);
    } else {
      document.getElementById('activeTasks').appendChild(li);
    }
    saveTasks();
  };

  taskLeft.appendChild(checkbox);
  taskLeft.appendChild(span);

  const actions = document.createElement('div');
  actions.className = 'actions';

  const editBtn = document.createElement('button');
  editBtn.textContent = '✏️';
  editBtn.onclick = () => {
    startInlineEdit(span);
  };

  const deleteBtn = document.createElement('button');
  deleteBtn.textContent = '🗑️';
  deleteBtn.onclick = () => {
    liToDelete = li;
    confirmModal.style.display = 'flex';
  };

  actions.appendChild(editBtn);
  actions.appendChild(deleteBtn);

  li.appendChild(taskLeft);
  li.appendChild(actions);

  return li;
}

// ➜ Inline editácia
function startInlineEdit(span) {
  const currentText = span.textContent;
  const input = document.createElement('input');
  input.type = 'text';
  input.value = currentText;
  input.className = 'inline-input';

  span.replaceWith(input);
  input.focus();

  input.onblur = () => finishInlineEdit(input, span);
  input.onkeydown = (e) => {
    if (e.key === 'Enter') input.blur();
  };
}

// ➜ Dokončenie inline editácie
function finishInlineEdit(input, span) {
  const newText = input.value.trim();
  if (newText !== '') span.textContent = newText;
  input.replaceWith(span);
  saveTasks();
}

// ➜ ENTER spustí pridanie úlohy
document.getElementById('taskInput').addEventListener('keydown', function (event) {
  if (event.key === 'Enter') addTask();
});

// ➜ Prepínač témy
function toggleTheme() {
  document.body.classList.toggle('dark');
}

// ➜ Export PDF
async function exportToPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  const today = new Date();
  const dateStr = today.toLocaleDateString() + " " + today.toLocaleTimeString();

  doc.setFontSize(24);
  doc.text("Môj To Do List", 20, 25);

  doc.setFontSize(10);
  doc.text(`Export: ${dateStr}`, 20, 32);

  let y = 45;

  doc.setFontSize(14);
  doc.text("Hotové úlohy:", 20, y);
  y += 10;

  const doneTasks = document.querySelectorAll('#doneTasks li .task-text');
  doneTasks.forEach((task, index) => {
    doc.text(`${index + 1}. ${task.textContent}`, 25, y);
    y += 8;
  });

  y += 10;
  doc.setFontSize(14);
  doc.text("Aktívne úlohy:", 20, y);
  y += 10;

  const activeTasks = document.querySelectorAll('#activeTasks li .task-text');
  activeTasks.forEach((task, index) => {
    doc.text(`${index + 1}. ${task.textContent}`, 25, y);
    y += 8;
  });

  doc.save(`ToDo-List-${today.toLocaleDateString()}.pdf`);
}

// ➜ Uložiť úlohy do localStorage
function saveTasks() {
  const active = [];
  const done = [];

  document.querySelectorAll('#activeTasks li').forEach(li => {
    const text = li.querySelector('.task-text');
    if (text) active.push(text.textContent);
  });

  document.querySelectorAll('#doneTasks li').forEach(li => {
    const text = li.querySelector('.task-text');
    if (text) done.push(text.textContent);
  });

  localStorage.setItem('tasks', JSON.stringify({ active, done }));
}

// ➜ Načítať úlohy zo storage
function loadTasks() {
  const saved = localStorage.getItem('tasks');
  if (!saved) return;

  const { active, done } = JSON.parse(saved);

  active.forEach(text => {
    document.getElementById('activeTasks').appendChild(createTaskElement(text, false));
  });

  done.forEach(text => {
    document.getElementById('doneTasks').appendChild(createTaskElement(text, true));
  });

  const savedInput = localStorage.getItem('inputValue');
  if (savedInput) taskInput.value = savedInput;
}

loadTasks();
const taskInput = document.getElementById('taskInput');
taskInput.addEventListener('input', () => {
  localStorage.setItem('inputValue', taskInput.value);
});

// ➜ MODAL logika
const confirmModal = document.getElementById('confirmModal');
const confirmDeleteBtn = document.getElementById('confirmDelete');
const cancelDeleteBtn = document.getElementById('cancelDelete');
let liToDelete = null;

cancelDeleteBtn.onclick = () => {
  confirmModal.style.display = 'none';
  liToDelete = null;
};

// ➜ FINÁLNE VYMAZANIE s fade-out a setTimeout
confirmDeleteBtn.onclick = () => {
  if (liToDelete) {
    liToDelete.classList.add('fade-out');
    // Garantuje odstránenie aj keď animationend zlyhá
    setTimeout(() => {
      liToDelete.remove();
      saveTasks();
      liToDelete = null;
    }, 300);
  }
  confirmModal.style.display = 'none';
};

// ➜ ESC zatvorí modal
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    confirmModal.style.display = 'none';
    liToDelete = null;
  }
});

// ➜ Klik mimo modal zatvorí modal
window.addEventListener('click', (e) => {
  if (e.target === confirmModal) {
    confirmModal.style.display = 'none';
    liToDelete = null;
  }
});

document.getElementById('searchInput').addEventListener('input', function() {
  const query = this.value.toLowerCase();

  document.querySelectorAll('.task-text').forEach(task => {
    const li = task.closest('li');
    if (task.textContent.toLowerCase().includes(query)) {
      li.style.display = '';
    } else {
      li.style.display = 'none';
    }
  });
});
