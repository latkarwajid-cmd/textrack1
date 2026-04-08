import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import AdminNavbar from "../../components/AdminNavbar";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

function Parties() {
  const token = localStorage.getItem("token");

  const api = useMemo(() => {
    return axios.create({
      baseURL: API_BASE_URL,
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  }, [token]);

  const [parties, setParties] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const [createForm, setCreateForm] = useState({
    party_name: "",
    name: "",
    email: "",
    password: "",
    role: "partyOwner"
  });

  const [editingId, setEditingId] = useState(null);

  const [editForm, setEditForm] = useState({
    party_name: "",
    name: "",
    email: ""
  });

  const fetchParties = async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/admin/parties");
      setParties(response?.data?.data || []);
    } catch (error) {
      toast.error(
        error?.response?.data?.error || "Failed to fetch parties"
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchParties();
  }, []);

  const onCreateChange = (e) => {
    const { name, value } = e.target;
    setCreateForm((prev) => ({ ...prev, [name]: value }));
  };

  const onEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();

    if (
      !createForm.party_name.trim() ||
      !createForm.name.trim() ||
      !createForm.email.trim()
    ) {
      toast.warning("party_name, name and email are required");
      return;
    }

    try {
      await api.post("/admin/parties", {
        ...createForm,
        party_name: createForm.party_name.trim(),
        name: createForm.name.trim(),
        email: createForm.email.trim()
      });

      toast.success("Party created successfully");

      setCreateForm({
        party_name: "",
        name: "",
        email: "",
        password: "",
        role: "partyOwner"
      });

      fetchParties();
    } catch (error) {
      toast.error(
        error?.response?.data?.error || "Failed to create party"
      );
    }
  };

  const startEdit = (party) => {
    setEditingId(party.id);

    setEditForm({
      party_name: party.party_name || "",
      name: party.name || "",
      email: party.email || ""
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!editingId) return;

    if (
      !editForm.party_name.trim() ||
      !editForm.name.trim() ||
      !editForm.email.trim()
    ) {
      toast.warning("party_name, name and email required");
      return;
    }

    try {
      await api.put(`/admin/parties/${editingId}`, {
        party_name: editForm.party_name.trim(),
        name: editForm.name.trim(),
        email: editForm.email.trim()
      });

      toast.success("Party updated successfully");

      setEditingId(null);

      fetchParties();
    } catch (error) {
      toast.error(
        error?.response?.data?.error || "Failed to update party"
      );
    }
  };

  const handleDelete = async (id) => {
    const ok = window.confirm("Mark this party as inactive?");
    if (!ok) return;

    try {
      await api.delete(`/admin/parties/${id}`);
      toast.success("Party marked inactive");
      fetchParties();
    } catch (error) {
      toast.error(
        error?.response?.data?.error || "Failed to delete party"
      );
    }
  };

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-title">Admin Panel</div>
        <AdminNavbar />
      </aside>

      <main className="admin-main">
        <h2>Party Management</h2>

        {/* CREATE PARTY */}
        <section className="admin-card">
          <h3>Add Party</h3>

          <form className="grid-form" onSubmit={handleCreate}>
            <input
              name="party_name"
              placeholder="Party Name *"
              value={createForm.party_name}
              onChange={onCreateChange}
            />

            <input
              name="name"
              placeholder="Owner Name *"
              value={createForm.name}
              onChange={onCreateChange}
            />

            <input
              name="email"
              placeholder="Email *"
              value={createForm.email}
              onChange={onCreateChange}
            />

            <input
              name="password"
              placeholder="Password (optional)"
              value={createForm.password}
              onChange={onCreateChange}
            />

            <select
              name="role"
              value={createForm.role}
              onChange={onCreateChange}
            >
              <option value="partyOwner">Party Owner</option>
              <option value="staff">Staff</option>
            </select>

            <button type="submit">Create</button>
          </form>
        </section>

        {/* LIST PARTIES */}
        <section className="admin-card">
          <h3>Parties</h3>

          {isLoading ? (
            <p>Loading...</p>
          ) : parties.length === 0 ? (
            <p>No active parties found.</p>
          ) : (
            <div className="table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Party Name</th>
                    <th>Owner</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {parties.map((p) => {
                    const isEditing = editingId === p.id;

                    return (
                      <tr key={p.id}>
                        <td>{p.id}</td>
                        <td>{p.party_name}</td>
                        <td>{p.name}</td>
                        <td>{p.email}</td>
                        <td>{p.role}</td>

                        <td className="actions">
                          <button
                            type="button"
                            onClick={() => startEdit(p)}
                          >
                            Update
                          </button>

                          <button
                            type="button"
                            className="danger"
                            onClick={() => handleDelete(p.id)}
                          >
                            Delete
                          </button>

                          {isEditing && (
                            <span className="editing-hint">
                              Editing below
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* UPDATE PARTY */}
        {editingId && (
          <section className="admin-card">
            <h3>Update Party (ID: {editingId})</h3>

            <form className="grid-form" onSubmit={handleUpdate}>
              <input
                name="party_name"
                placeholder="Party Name *"
                value={editForm.party_name}
                onChange={onEditChange}
              />

              <input
                name="name"
                placeholder="Owner Name *"
                value={editForm.name}
                onChange={onEditChange}
              />

              <input
                name="email"
                placeholder="Email *"
                value={editForm.email}
                onChange={onEditChange}
              />

              <button type="submit">Save</button>

              <button
                type="button"
                className="secondary"
                onClick={cancelEdit}
              >
                Cancel
              </button>
            </form>
          </section>
        )}
      </main>
    </div>
  );
}

export default Parties;