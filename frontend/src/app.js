// Docker To-Do App - Frontend JavaScript
const API_URL = process.env.API_URL || 'http://localhost:3000';

class TodoApp {
    constructor() {
        this.todos = [];
        this.currentFilter = 'all';
        this.init();
    }

    async init() {
        // Check API and DB status
        await this.checkServices();
        
        // Load initial todos
        await this.loadTodos();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Update UI
        this.updateStats();
        
        // Start periodic health checks
        setInterval(() => this.checkServices(), 30000);
    }

    async checkServices() {
        try {
            // Check API
            const apiResponse = await fetch(`${API_URL}/health`);
            if (apiResponse.ok) {
                const data = await apiResponse.json();
                this.updateStatus('api-status', 'API Connected', true);
                this.updateStatus('db-status', data.database === 'connected' ? 'DB Connected' : 'DB Error', data.database === 'connected');
            } else {
                this.updateStatus('api-status', 'API Error', false);
                this.updateStatus('db-status', 'DB Unknown', false);
            }
        } catch (error) {
            this.updateStatus('api-status', 'API Offline', false);
            this.updateStatus('db-status', 'DB Unknown', false);
        }
    }

    updateStatus(elementId, text, isConnected) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = text;
            element.classList.toggle('connected', isConnected);
        }
    }

    async loadTodos() {
        try {
            const response = await fetch(`${API_URL}/api/todos`);
            if (response.ok) {
                this.todos = await response.json();
                this.renderTodos();
                this.updateStats();
            }
        } catch (error) {
            console.error('Failed to load todos:', error);
        }
    }

    async addTodo(text) {
        if (!text.trim()) return;

        try {
            const response = await fetch(`${API_URL}/api/todos`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text, completed: false })
            });

            if (response.ok) {
                const newTodo = await response.json();
                this.todos.push(newTodo);
                this.renderTodos();
                this.updateStats();
                this.clearInput();
            }
        } catch (error) {
            console.error('Failed to add todo:', error);
        }
    }

    async updateTodo(id, updates) {
        try {
            const response = await fetch(`${API_URL}/api/todos/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updates)
            });

            if (response.ok) {
                const updatedTodo = await response.json();
                const index = this.todos.findIndex(todo => todo.id === id);
                if (index !== -1) {
                    this.todos[index] = updatedTodo;
                    this.renderTodos();
                    this.updateStats();
                }
            }
        } catch (error) {
            console.error('Failed to update todo:', error);
        }
    }

    async deleteTodo(id) {
        try {
            const response = await fetch(`${API_URL}/api/todos/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                this.todos = this.todos.filter(todo => todo.id !== id);
                this.renderTodos();
                this.updateStats();
            }
        } catch (error) {
            console.error('Failed to delete todo:', error);
        }
    }

    renderTodos() {
        const container = document.getElementById('todo-items');
        const template = document.getElementById('todo-template');
        
        // Clear container
        container.innerHTML = '';

        // Filter todos based on current filter
        const filteredTodos = this.todos.filter(todo => {
            if (this.currentFilter === 'completed') return todo.completed;
            if (this.currentFilter === 'pending') return !todo.completed;
            return true;
        });

        if (filteredTodos.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-clipboard-list"></i>
                    <p>No ${this.currentFilter === 'all' ? '' : this.currentFilter} tasks found.</p>
                </div>
            `;
            return;
        }

        // Create todo items
        filteredTodos.forEach(todo => {
            const clone = template.content.cloneNode(true);
            const todoItem = clone.querySelector('.todo-item');
            const checkbox = clone.querySelector('.todo-checkbox');
            const todoText = clone.querySelector('.todo-text');
            const editInput = clone.querySelector('.todo-edit-input');
            const editBtn = clone.querySelector('.edit-btn');
            const deleteBtn = clone.querySelector('.delete-btn');

            // Set data
            todoItem.dataset.id = todo.id;
            checkbox.checked = todo.completed;
            todoText.textContent = todo.text;
            editInput.value = todo.text;

            // Set completed state
            if (todo.completed) {
                todoItem.classList.add('completed');
            }

            // Checkbox change event
            checkbox.addEventListener('change', () => {
                this.updateTodo(todo.id, { completed: checkbox.checked });
            });

            // Edit button event
            editBtn.addEventListener('click', () => {
                if (editInput.style.display === 'none') {
                    // Start editing
                    todoText.style.display = 'none';
                    editInput.style.display = 'block';
                    editInput.focus();
                    editBtn.innerHTML = '<i class="fas fa-save"></i>';
                } else {
                    // Save edit
                    const newText = editInput.value.trim();
                    if (newText && newText !== todo.text) {
                        this.updateTodo(todo.id, { text: newText });
                    }
                    todoText.style.display = 'block';
                    editInput.style.display = 'none';
                    editBtn.innerHTML = '<i class="fas fa-edit"></i>';
                }
            });

            // Delete button event
            deleteBtn.addEventListener('click', () => {
                if (confirm('Are you sure you want to delete this task?')) {
                    this.deleteTodo(todo.id);
                }
            });

            // Enter key in edit input
            editInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    editBtn.click();
                }
            });

            container.appendChild(clone);
        });
    }

    updateStats() {
        const total = this.todos.length;
        const completed = this.todos.filter(todo => todo.completed).length;
        const pending = total - completed;

        document.getElementById('total-tasks').textContent = total;
        document.getElementById('completed-tasks').textContent = completed;
        document.getElementById('pending-tasks').textContent = pending;

        // Update Docker info
        document.getElementById('frontend-id').textContent = 'nginx:alpine';
        document.getElementById('backend-url').textContent = API_URL;
        document.getElementById('db-info').textContent = 'postgres:15-alpine';
    }

    clearInput() {
        document.getElementById('todo-input').value = '';
    }

    setupEventListeners() {
        // Add todo button
        document.getElementById('add-todo').addEventListener('click', () => {
            const input = document.getElementById('todo-input');
            this.addTodo(input.value);
        });

        // Enter key in input
        document.getElementById('todo-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addTodo(e.target.value);
            }
        });

        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                // Update active state
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                
                // Update filter and re-render
                this.currentFilter = e.target.dataset.filter;
                this.renderTodos();
            });
        });

        // Simulate container info
        this.simulateContainerInfo();
    }

    simulateContainerInfo() {
        const containers = [
            { name: 'Frontend', status: 'Running', id: 'nginx-container' },
            { name: 'Backend', status: 'Running', id: 'node-api' },
            { name: 'Database', status: 'Running', id: 'postgres-db' }
        ];
        
        // This would be populated from Docker API in a real scenario
        console.log('Docker containers simulated:', containers);
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.todoApp = new TodoApp();
});
