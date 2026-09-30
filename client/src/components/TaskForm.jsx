import { useState } from "react";

const getToday = () => {
  const today = new Date();
  const offset = today.getTimezoneOffset();
  return new Date(today.getTime() - offset * 60 * 1000)
    .toISOString()
    .slice(0, 10);
};

export default function TaskForm({ initial, onSubmit, onCancel }) {
  const [title, setTitle] = useState(initial?.title || "");
  const [description, setDescription] = useState(initial?.description || "");
  const [status, setStatus] = useState(initial?.status || "todo");
  const [dueDate, setDueDate] = useState(
    initial?.dueDate ? initial.dueDate.slice(0, 10) : getToday()
  );
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Title is required");
      return;
    }
    setError("");
    setSaving(true);
    try {
      await onSubmit({
        title,
        description,
        status,
        dueDate: dueDate || null,
      });
      if (!initial) {
        setTitle("");
        setDescription("");
        setStatus("todo");
        setDueDate(getToday());
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <p className="error">{error}</p>}
      <input
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <textarea
        placeholder="Description (optional)"
        rows={2}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <div className="row">
        <div className="status-options" role="group" aria-label="Task status">
          {[
            ["todo", "To do"],
            ["in-progress", "In progress"],
            ["done", "Done"],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              className={`status-button ${value} ${status === value ? "selected" : ""}`}
              onClick={() => setStatus(value)}
              aria-pressed={status === value}
            >
              {label}
            </button>
          ))}
        </div>
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
      </div>
      <div className="actions">
        <button type="submit" disabled={saving}>
          {saving ? "Saving..." : initial ? "Save changes" : "Add task"}
        </button>
        {onCancel && (
          <button type="button" className="secondary" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}