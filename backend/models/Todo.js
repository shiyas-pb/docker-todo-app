// Todo model (optional - using raw queries in routes for simplicity)
class Todo {
    constructor(id, text, completed, createdAt, updatedAt) {
        this.id = id;
        this.text = text;
        this.completed = completed;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    static fromDB(row) {
        return new Todo(
            row.id,
            row.text,
            row.completed,
            row.created_at,
            row.updated_at
        );
    }

    toJSON() {
        return {
            id: this.id,
            text: this.text,
            completed: this.completed,
            created_at: this.createdAt,
            updated_at: this.updatedAt
        };
    }
}

module.exports = Todo;
