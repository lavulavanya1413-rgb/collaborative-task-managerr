
import { useEffect, useState } from 'react';
import { Plus, ShieldCheck, Mail } from 'lucide-react';
import Modal from '../components/Modal.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function Team() {
  const { request, user } = useAuth();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'User',
  });

  async function load() {
    try {
      const data = await request('/auth/users');
      setUsers(data.users || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function create(e) {
    e.preventDefault();

    try {
      await request('/auth/users', {
        method: 'POST',
        body: JSON.stringify(form),
      });

      setOpen(false);
      setForm({
        name: '',
        email: '',
        password: '',
        role: 'User',
      });

      load();
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm muted">
            Manage workspace accounts and access roles.
          </p>

          <div className="mt-3 badge">
            {users.length} active members
          </div>
        </div>

        {user.role === 'Manager' && (
          <button
            className="btn btn-primary"
            onClick={() => setOpen(true)}
          >
            <Plus size={16} />
            Add member
          </button>
        )}
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {loading ? (
          <div className="card p-8 muted">
            Loading team…
          </div>
        ) : (
          users.map((u) => (
            <div className="card p-5" key={u._id || u.id}>
              <div className="flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100 text-lg font-extrabold text-indigo-700">
                  {u.name?.[0]}
                </div>

                <span className="badge">{u.role}</span>
              </div>

              <h3 className="mt-4 font-extrabold">
                {u.name}
              </h3>

              <div className="mt-2 flex items-center gap-2 text-sm muted">
                <Mail size={14} />
                {u.email}
              </div>

              <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-4 text-xs muted dark:border-slate-800">
                <ShieldCheck
                  size={14}
                  className="text-emerald-600"
                />
                Active workspace member
              </div>
            </div>
          ))
        )}
      </div>

      {open && (
        <Modal
          title="Add a team member"
          onClose={() => setOpen(false)}
        >
          <form onSubmit={create} className="space-y-4">
            <div>
              <label className="label">Full name *</label>
              <input
                className="field"
                value={form.name}
                onChange={(e) =>
                  setForm({ ...form, name: e.target.value })
                }
                required
              />
            </div>

            <div>
              <label className="label">Email *</label>
              <input
                className="field"
                type="email"
                value={form.email}
                onChange={(e) =>
                  setForm({ ...form, email: e.target.value })
                }
                required
              />
            </div>

            <div>
              <label className="label">
                Temporary password * (8+ characters)
              </label>
              <input
                className="field"
                type="password"
                minLength={8}
                value={form.password}
                onChange={(e) =>
                  setForm({ ...form, password: e.target.value })
                }
                required
              />
            </div>

            <div>
              <label className="label">Role</label>
              <select
                className="field"
                value={form.role}
                onChange={(e) =>
                  setForm({ ...form, role: e.target.value })
                }
              >
                {['Manager', 'User', 'Developer', 'QA Tester'].map(
                  (role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  )
                )}
              </select>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                className="btn btn-muted"
                onClick={() => setOpen(false)}
              >
                Cancel
              </button>

              <button className="btn btn-primary" type="submit">
                Create account
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
