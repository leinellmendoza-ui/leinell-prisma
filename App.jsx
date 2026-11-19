import { useEffect, useState } from "react";
import "./App.css";

const API = "http://localhost:3000/api/students";

function App() {
  const [students, setStudents] = useState([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [course, setCourse] = useState("");
  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");

  async function loadStudents() {
    try {
      const response = await fetch(API);
      if (!response.ok) throw new Error("Unable to load students.");
      setStudents(await response.json());
    } catch {
      setMessage("Cannot connect to backend server.");
    }
  }

  useEffect(() => {
    loadStudents();
  }, []);

  async function saveStudent(event) {
    event.preventDefault();
    setMessage("");

    try {
      const isEditing = editingId !== null;

      const response = await fetch(
        isEditing ? `${API}/${editingId}` : API,
        {
          method: isEditing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, course })
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Operation failed.");
      }

      setMessage(
        isEditing
          ? "Student updated successfully!"
          : "Student registered successfully!"
      );

      clearForm();
      await loadStudents();
    } catch (error) {
      setMessage(error.message);
    }
  }

  function editStudent(student) {
    setEditingId(student.id);
    setName(student.name);
    setEmail(student.email);
    setCourse(student.course);
    setMessage("");
  }

  async function deleteStudent(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this student?"
    );
    if (!confirmed) return;

    try {
      const response = await fetch(`${API}/${id}`, { method: "DELETE" });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to delete student.");
      }

      if (editingId === id) clearForm();
      setMessage("Student deleted successfully!");
      await loadStudents();
    } catch (error) {
      setMessage(error.message);
    }
  }

  const filteredStudents = students.filter((student) =>
    student.name.toLowerCase().includes(search.toLowerCase()) ||
    student.email.toLowerCase().includes(search.toLowerCase()) ||
    student.course.toLowerCase().includes(search.toLowerCase())
  );

  function clearForm() {
    setName("");
    setEmail("");
    setCourse("");
    setEditingId(null);
  }

  return (
    <div className="app-container">
      {/* HEADER */}
      <header className="app-header">
        <h1>Student Information System</h1>
        <p className="subtitle">Manage and register student information</p>
      </header>

      {/* NOTIFICATION MESSAGE */}
      {message && (
        <div className="message-banner" role="status">
          <span>{message}</span>
        </div>
      )}

      {/* FORM CARD */}
      <section className="card">
        <div className="card-header">
          <h2 className="card-title">
            {editingId !== null ? `Edit Student (ID: ${editingId})` : "Register New Student"}
          </h2>
        </div>

        <form onSubmit={saveStudent}>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="fullName">FULL NAME</label>
              <input
                id="fullName"
                type="text"
                className="form-control"
                placeholder="e.g. Juan Dela Cruz"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="emailAddress">EMAIL ADDRESS</label>
              <input
                id="emailAddress"
                type="email"
                className="form-control"
                placeholder="e.g. juan@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="courseProgram">COURSE PROGRAM</label>
              <select
                id="courseProgram"
                className="form-control"
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                required
              >
                <option value="" disabled>Select course...</option>
                <option value="BSIT">BSIT</option>
                <option value="BSCS">BSCS</option>
                <option value="BSIS">BSIS</option>
              </select>
            </div>
          </div>

          <div className="btn-row">
            {editingId !== null && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={clearForm}
              >
                Cancel Editing
              </button>
            )}

            <button type="submit" className="btn btn-primary">
              {editingId !== null ? "Update Student" : "Save Student"}
            </button>
          </div>
        </form>
      </section>

      {/* RECORDS CARD */}
      <section className="card">
        <div className="card-header">
          <h2 className="card-title">Registered Students</h2>
          <span className="counter-badge">
            Total registered students: {students.length}
          </span>
        </div>

        <div className="search-input">
          <input
            type="text"
            className="form-control"
            placeholder="Search by name, email, or course..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {filteredStudents.length === 0 ? (
          <div className="empty-state">
            {students.length === 0
              ? "No registered students yet."
              : "No matching students found."}
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th style={{ width: "10%" }}>ID</th>
                  <th style={{ width: "30%" }}>NAME</th>
                  <th style={{ width: "32%" }}>EMAIL</th>
                  <th style={{ width: "14%" }}>COURSE</th>
                  <th style={{ width: "14%" }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => {
                  let badgeClass = "badge";
                  const upperCourse = student.course?.toUpperCase();
                  if (upperCourse === "BSIT") badgeClass += " badge-bsit";
                  else if (upperCourse === "BSCS") badgeClass += " badge-bscs";
                  else if (upperCourse === "BSIS") badgeClass += " badge-bsis";

                  return (
                    <tr key={student.id}>
                      <td className="font-mono">{student.id}</td>
                      <td style={{ fontWeight: 600 }}>{student.name}</td>
                      <td className="font-mono">{student.email}</td>
                      <td>
                        <span className={badgeClass}>{student.course}</span>
                      </td>
                      <td>
                        <div className="actions-cell">
                          <button
                            type="button"
                            className="btn-sm btn-action-edit"
                            onClick={() => editStudent(student)}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="btn-sm btn-action-delete"
                            onClick={() => deleteStudent(student.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default App;