import React, { useState, useEffect } from "react";
import { Todo } from "@/types/Todo";

const MinimizeIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M5 10h10v1H5v-1z" clipRule="evenodd" />
  </svg>
);
const MaximizeIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path
      fillRule="evenodd"
      d="M3 3h14v14H3V3zm2 2v10h10V5H5z"
      clipRule="evenodd"
    />
  </svg>
);

// A simple square, Electron usually handles the actual maximize icon states
const CloseIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path
      fillRule="evenodd"
      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
      clipRule="evenodd"
    />
  </svg>
);

export const Home: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState({ title: "", description: "" });

  useEffect(() => {
    loadTodos();
  }, []);

  const loadTodos = async () => {
    const todos = await window.electronAPI.getTodos();
    setTodos(todos);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.title.trim()) return;

    await window.electronAPI.createTodo({
      ...newTodo,
      completed: false,
    });
    setNewTodo({ title: "", description: "" });
    loadTodos();
  };

  const toggleTodo = async (todo: Todo) => {
    await window.electronAPI.updateTodo(todo.id, {
      completed: !todo.completed,
    });
    loadTodos();
  };

  const deleteTodo = async (id: number) => {
    await window.electronAPI.deleteTodo(id);
    loadTodos();
  };

  return (
    <div className="flex-grow">
      {/* AppBar */}
      <header className="bg-blue-600 text-white">
        <nav className="flex items-center px-4 h-16">
          <h1 className="text-xl font-semibold flex-grow">
            Antares v23 janvier ui 22
          </h1>
          <button
            onClick={() => window.electronAPI?.minimize()}
            className="p-2 hover:bg-blue-700 rounded"
            aria-label="Minimize"
          >
            <MinimizeIcon />
          </button>
          <button
            onClick={() => window.electronAPI?.maximize()}
            className="p-2 hover:bg-blue-700 rounded"
            aria-label="Maximize"
          >
            <MaximizeIcon />
          </button>
          <button
            onClick={() => window.electronAPI?.close()}
            className="p-2 hover:bg-blue-700 rounded"
            aria-label="Close"
          >
            <CloseIcon />
          </button>
        </nav>
      </header>

      {/* Container */}
      <main className="max-w-sm mx-auto mt-4 px-4">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Title
            </label>
            <input
              type="text"
              id="title"
              className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              value={newTodo.title}
              onChange={(e) =>
                setNewTodo({ ...newTodo, title: e.target.value })
              }
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Description
            </label>
            <textarea
              id="description"
              className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              value={newTodo.description}
              onChange={(e) =>
                setNewTodo({ ...newTodo, description: e.target.value })
              }
              rows={2}
            />
          </div>

          <button
            type="submit"
            className="mt-2 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Add Todo
          </button>
        </form>

        {/* List */}
        <ul className="mt-8 space-y-3">
          {todos.map((todo) => (
            <li
              key={todo.id}
              className="flex items-center justify-between p-3 bg-white shadow rounded-md"
            >
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id={`todo-${todo.id}`}
                  className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-3"
                  checked={todo.completed}
                  onChange={() => toggleTodo(todo)}
                />
                <div>
                  <label
                    htmlFor={`todo-${todo.id}`}
                    className={`block text-lg font-medium text-gray-900 cursor-pointer ${
                      todo.completed ? "line-through text-gray-500" : ""
                    }`}
                  >
                    {todo.title}
                  </label>
                  {todo.description && (
                    <p
                      className={`text-sm text-gray-600 ${
                        todo.completed ? "line-through text-gray-400" : ""
                      }`}
                    >
                      {todo.description}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={() => deleteTodo(todo.id)}
                className="ml-4 px-3 py-1 text-sm font-medium text-red-600 hover:text-red-800 hover:bg-red-100 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-red-500"
                aria-label={`Delete todo: ${todo.title}`}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
};
