"use strict";

const taskInput = document.getElementById("taskInput");
const addTaskButton = document.getElementById("addTask");
const taskList = document.getElementById("taskList");

let editingIndex = -1;

function loadTasks() {
    const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    // Миграция старых задач (если они сохранены как строки)
    const migratedTasks = tasks.map(task => {
        if (typeof task === 'string') {
            return {
                text: task,
                created: 'Невідомо' // Для старых задач без времени создания
            };
        }
        return task;
    });
    
    // Сохраняем мигрированные задачи
    if (JSON.stringify(tasks) !== JSON.stringify(migratedTasks)) {
        localStorage.setItem("tasks", JSON.stringify(migratedTasks));
    }
    
    renderTasks(migratedTasks);
}

function renderTasks(tasks) {
    taskList.innerHTML = "";
    tasks.forEach((task, index) => {
        addTaskToDOM(task, index);
    });
}

function addTaskToDOM(task, index) {
    const li = document.createElement("li");
    const taskText = typeof task === 'string' ? task : task.text;

    if (editingIndex === index) {
        li.innerHTML = `
            <div class="editing-mode">
                <input type="text" class="edit-input" value="${taskText.replace(/"/g, '&quot;')}" id="editInput${index}">
                <div class="edit-buttons">
                    <button class="save-btn" onclick="saveTask(${index})">Зберегти</button>
                    <button class="cancel-btn" onclick="cancelEdit()">Скасувати</button>
                </div>
            </div>
        `;
    } else {
        li.innerHTML = `
            <div class="task-content" onclick="completeTask(${index})" title="Клік для завершення завдання">
                <div class="task-text">${taskText}</div>
            </div>
            <div class="task-actions">
                <button class="edit-btn" onclick="editTask(${index})" title="Редагувати"></button>
            </div>
        `;
    }

    taskList.appendChild(li);
}

addTaskButton.addEventListener("click", function() {
    const taskText = taskInput.value.trim();
    if (taskText) {
        const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
        // Создаем объект задачи с текстом и временем создания
        const newTask = {
            text: taskText,
            created: new Date().toLocaleDateString('uk-UA') + ' ' + new Date().toLocaleTimeString('uk-UA')
        };
        tasks.push(newTask);
        localStorage.setItem("tasks", JSON.stringify(tasks));
        renderTasks(tasks);
        taskInput.value = "";
    }
});

taskInput.addEventListener("keypress", function(e) {
    if (e.key === "Enter") {
        addTaskButton.click();
    }
});

function editTask(index) {
    editingIndex = index;
    const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    renderTasks(tasks);

    setTimeout(() => {
        const editInput = document.getElementById(`editInput${index}`);
        if (editInput) {
            editInput.focus();
            editInput.select();
        }
    }, 0);
}

function saveTask(index) {
    const editInput = document.getElementById(`editInput${index}`);
    const newText = editInput.value.trim();

    if (newText) {
        const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
        // Сохраняем оригинальное время создания при редактировании
        const originalCreated = typeof tasks[index] === 'string' ? 'Невідомо' : tasks[index].created;
        tasks[index] = {
            text: newText,
            created: originalCreated
        };
        localStorage.setItem("tasks", JSON.stringify(tasks));
        editingIndex = -1;
        renderTasks(tasks);
    }
}

function cancelEdit() {
    editingIndex = -1;
    const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    renderTasks(tasks);
}

function completeTask(index) {
    const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    const archivedTasks = JSON.parse(localStorage.getItem("archivedTasks")) || [];
    
    const currentTask = tasks[index];
    const taskText = typeof currentTask === 'string' ? currentTask : currentTask.text;
    const taskCreated = typeof currentTask === 'string' ? 'Невідомо' : currentTask.created;
    
    // Создаем объект с задачей, временем создания и датой архивирования
    const taskToArchive = {
        task: taskText,
        created: taskCreated,
        archived: new Date().toLocaleDateString('uk-UA') + ' ' + new Date().toLocaleTimeString('uk-UA')
    };
    
    // Добавляем в архив
    archivedTasks.push(taskToArchive);
    
    // Удаляем из активных задач
    tasks.splice(index, 1);
    
    // Сохраняем изменения
    localStorage.setItem("tasks", JSON.stringify(tasks));
    localStorage.setItem("archivedTasks", JSON.stringify(archivedTasks));
    
    editingIndex = -1;
    renderTasks(tasks);
    
    // Показываем уведомление
    showNotification("Завдання виконано!");
}

function showNotification(message) {
    // Создаем элемент уведомления
    const notification = document.createElement("div");
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background-color: #4a004a;
        color: white;
        padding: 10px 20px;
        border-radius: 5px;
        z-index: 9999;
        opacity: 0;
        transition: opacity 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Показываем уведомление
    setTimeout(() => {
        notification.style.opacity = "1";
    }, 100);
    
    // Скрываем через 3 секунды
    setTimeout(() => {
        notification.style.opacity = "0";
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

document.addEventListener("keypress", function(e) {
    if (e.key === "Enter" && e.target.classList.contains("edit-input")) {
        const index = parseInt(e.target.id.replace("editInput", ""));
        saveTask(index);
    }
});

document.addEventListener("keydown", function(e) {
    if (e.key === "Escape" && editingIndex !== -1) {
        cancelEdit();
    }
});

loadTasks();

// Настройки бокового меню
const settingsButton = document.getElementById("settingsButton");
const settingsMenu = document.getElementById("settingsMenu");
const closeSettings = document.getElementById("closeSettings");
const darkModeToggle = document.getElementById("darkModeToggle");
const bgUpload = document.getElementById("bgUpload");

settingsButton.addEventListener("click", () => {
    settingsMenu.classList.add("open");
});

closeSettings.addEventListener("click", () => {
    settingsMenu.classList.remove("open");
});

darkModeToggle.addEventListener("change", () => {
    if (darkModeToggle.checked) {
        document.body.classList.add("dark-mode");
        localStorage.setItem("darkMode", "enabled");
    } else {
        document.body.classList.remove("dark-mode");
        localStorage.setItem("darkMode", "disabled");
    }
});

bgUpload.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(evt) {
            document.body.style.backgroundImage = `url('${evt.target.result}')`;
            localStorage.setItem("backgroundImage", evt.target.result);
        }
        reader.readAsDataURL(file);
    }
});

window.addEventListener("load", () => {
    if (localStorage.getItem("darkMode") === "enabled") {
        document.body.classList.add("dark-mode");
        darkModeToggle.checked = true;
    }
    const bg = localStorage.getItem("backgroundImage");
    if (bg) {
        document.body.style.backgroundImage = `url('${bg}')`;
    }
});