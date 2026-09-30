import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { apiRequest } from "../api";
import TaskForm from "../components/TaskForm";

const STATUS_LABELS = {
  todo: "To do",
  "in-progress": "In progress",
  done: "Done",
};

export default function Tasks() {
  const { token, user, logout } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);

  const handleError = (err) => {
    if (err.status === 401) logout(); // token expired or invalid
    else setError(err.message);
  };

  useEffect(() => {
    apiRequest("/api/tasks", { token })
      .then(setTasks)
      .catch(handleError)
      .finally(() => setLoading(false));
  }, [token]);

  const createTask = async (data) => {
    const task = await apiRequest("/api/tasks", {
      method: "POST",
      body: data,
      token,
    });
    setTasks((prev) => [task, ...prev]);
  };

  const updateTask = async (id, data) => {
    const updated = await apiRequest(`/api/tasks/${id}`, {
      method: "PUT",
      body: data,
      token,
    });
    setTasks((prev) => prev.map((t) => (t._id === id ? updated : t)));
    setEditingId(null);
  };

  const deleteTask = async (id) => {
    if (!window.confirm("Delete this task?")) return;
    try {
      await apiRequest(`/api/tasks/${id}`, { method: "DELETE", token });
      setTasks((prev) => prev.filter((t) => t._id !== id));
    } catch (err) {
      handleError(err);
    }
  };

  let content;
  if (loading) {
    content = <p>Loading tasks...</p>;
  } else if (tasks.length === 0) {
    content = <p className="muted">No tasks yet. Add your first one above!</p>;
  } else {
    content = (
      <ul className="task-list">
        {tasks.map((task) => (
          <li key={task._id} className="card">
            {editingId === task._id ? (
              <TaskForm
                initial={task}
                onSubmit={(data) => updateTask(task._id, data)}
                onCancel={() => setEditingId(null)}
              />
            ) : (
              <>
                <div className="task-head">
                  <h3>{task.title}</h3>
                  <span className={`badge ${task.status}`}>
                    {STATUS_LABELS[task.status]}
                  </span>
                </div>
                {task.description && <p>{task.description}</p>}
                {task.dueDate && (
                  <p className="muted">
                    Due:{" "}
                    {new Date(task.dueDate).toLocaleDateString(undefined, {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      timeZone: "UTC",
                    })}
                  </p>
                )}
                <div className="actions">
                  {task.status !== "done" && (
                    <button
                      className="complete"
                      onClick={() =>
                        updateTask(task._id, { status: "done" }).catch(handleError)
                      }
                    >
                      Mark done
                    </button>
                  )}
                  <button
                    className="secondary"
                    onClick={() => setEditingId(task._id)}
                  >
                    Edit
                  </button>
                  <button
                    className="danger"
                    onClick={() => deleteTask(task._id)}
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div className="container">
      <header className="topbar">
        <h1>TaskTrack</h1>
        <div>
          <span>Hi, {user?.username}</span>
          <button className="secondary" onClick={logout}>
            Log out
          </button>
        </div>
      </header>

      <section className="card">
        <h2>Add a task</h2>
        <TaskForm onSubmit={createTask} />
      </section>

      {error && <p className="error">{error}</p>}
      {content}
    </div>
  );
}