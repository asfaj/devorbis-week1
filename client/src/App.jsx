import { useState, useEffect } from 'react';

function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:3000/api/tasks')
      .then((res) => res.json())
      .then((data) => {
        setTasks(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch tasks:', err);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading tasks...</p>;

  return (
    <div>
      <h1>My Tasks</h1>
      <ul>
        {tasks.map((task) => (
          <li key={task.id}>
            {task.title} — {task.done ? 'Done ✅' : 'Not done ❌'}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;