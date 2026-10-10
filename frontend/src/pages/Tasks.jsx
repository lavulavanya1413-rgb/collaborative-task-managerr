
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Plus,
  Search,
  Filter,
  CalendarDays,
  Trash2,
  Edit3,
  History,
  RefreshCw,
} from 'lucide-react';
import Modal from '../components/Modal.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const STATUSES = [
  'Backlog',
  'To Do',
  'In Progress',
  'Code Review',
  'Ready for QA',
  'Rework',
  'Done',
  'Completed',
];

const empty = {
  title: '',
  description: '',
  assignee: '',
  status: 'To Do',
  priority: 'Medium',
  dueDate: '',
  startDate: '',
  estimateHours: 0,
  qaRequired: false,
};

export default function Tasks() {
  const { request, user } = useAuth();
  const [params, setParams] = useSearchParams();

  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [activity, setActivity] = useState(null);
  const [history, setHistory] = useState([]);

  const canManage = user.role === 'Manager';
  const canCreate = ['Manager', 'Developer', 'User'].includes(user.role);

  async function load() {
    setLoading(true);

    try {
      const d = await request('/tasks');
      setTasks(d.tasks || []);
      setError('');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();

    if (['Manager', 'Developer', 'QA Tester'].includes(user.role)) {
      request('/auth/users')
        .then((d) => setUsers(d.users || []))
        .catch(() => {});
    }
  }, []);

  useEffect(() => {
    if (params.get('new') === '1' && canCreate) {
      openNew();
      setParams({});
    }
  }, [params]);

  function openNew() {
    setEditing(null);
    setForm({
      ...empty,
      assignee: user.id || user._id || '',
    });
    setModal(true);
  }

  function openEdit(t) {
    setEditing(t);

    setForm({
      ...empty,
      ...t,
      assignee: t.assignee?._id || '',
      dueDate: t.dueDate ? t.dueDate.slice(0, 10) : '',
      startDate: t.startDate ? t.startDate.slice(0, 10) : '',
    });

    setModal(true);
  }

  async function save(e) {
    e.preventDefault();
    setSaving(true);

    try {
      const body = {
        ...form,
        estimateHours: Number(form.estimateHours) || 0,
      };

      if (!body.assignee) {
        delete body.assignee;
      }

      await request(
        editing ? `/tasks/${editing._id}` : '/tasks',
        {
          method: editing ? 'PATCH' : 'POST',
          body: JSON.stringify(body),
        }
      );

      setModal(false);
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function updateStatus(t, next) {
    try {
      await request(`/tasks/${t._id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: next }),
      });

      await load();
    } catch (e) {
      setError(e.message);
    }
  }

  async function remove(t) {
    if (!window.confirm(`Delete "${t.title}"? This cannot be undone.`)) {
      return;
    }

    try {
      await request(`/tasks/${t._id}`, {
        method: 'DELETE',
      });

      await load();
    } catch (e) {
      setError(e.message);
    }
  }

  async function showActivity(t) {
    setActivity(t);
    setHistory([]);

    try {
      const d = await request(`/tasks/${t._id}/activity`);
      setHistory(d.activities || []);
    } catch {
      setHistory([]);
    }
  }

  const filtered = tasks.filter(
    (t) =>
      (!status || t.status === status) &&
      `${t.title} ${t.description || ''} ${t.assignee?.name || ''}`
        .toLowerCase()
        .includes(search.toLowerCase())
  );

  const badge = (s) =>
    ({
      Done: 'bg-emerald-100 text-emerald-700',
      Completed: 'bg-emerald-100 text-emerald-700',
      'In Progress': 'bg-blue-100 text-blue-700',
      'Ready for QA': 'bg-violet-100 text-violet-700',
      Rework: 'bg-rose-100 text-rose-700',
      'To Do': 'bg-amber-100 text-amber-700',
      Backlog: 'bg-slate-100 text-slate-600',
      'Code Review': 'bg-cyan-100 text-cyan-700',
    })[s] || 'bg-slate-100 text-slate-600';

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm muted">
            Plan, assign and track work across your team.
          </p>

          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            <span className="badge">{filtered.length} tasks</span>

            <span className="badge bg-emerald-50 text-emerald-700">
              {
                filtered.filter((t) =>
                  ['Done', 'Completed'].includes(t.status)
                ).length
              }{' '}
              completed
            </span>
          </div>
        </div>

        {canCreate && (
          <button className="btn btn-primary" onClick={openNew}>
            <Plus size={17} /> New task
          </button>
        )}
      </div>

      {error && (
        <div
          role="alert"
          className="flex items-center justify-between rounded-xl bg-red-50 p-3 text-sm text-red-700"
        >
          {error}
          <button onClick={() => setError('')}>Dismiss</button>
        </div>
      )}

      <div className="card p-4">
        <div className="flex flex-col gap-3 md:flex-row">
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3 top-3 text-slate-400"
            />

            <input
              className="field pl-9"
              placeholder="Search tasks, descriptions, assignees…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="relative md:w-52">
            <Filter
              size={15}
              className="absolute left-3 top-3 text-slate-400"
            />

            <select
              className="field pl-9"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">All statuses</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <button className="btn btn-muted" onClick={load}>
            <RefreshCw size={15} /> Refresh
          </button>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Task details</th>
                <th>Assignee</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Due date</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center muted">
                    Loading tasks…
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-14 text-center">
                    <div className="font-bold">No tasks found</div>

                    <p className="mt-1 text-sm muted">
                      Try a different search or create a new task.
                    </p>

                    {canCreate && (
                      <button
                        className="btn btn-primary mt-4"
                        onClick={openNew}
                      >
                        <Plus size={15} /> Create task
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                filtered.map((t) => (
                  <tr key={t._id}>
                    <td className="min-w-[220px]">
                      <div className="font-bold">{t.title}</div>

                      <div className="mt-1 max-w-xs truncate text-xs muted">
                        {t.description || 'No description added'}
                      </div>

                      {t.qaRequired && (
                        <div className="mt-2 text-[10px] font-bold text-violet-600">
                          QA {t.qaSignedOff ? 'SIGNED OFF' : 'REQUIRED'}
                        </div>
                      )}
                    </td>

                    <td className="whitespace-nowrap">
                      {t.assignee?.name || (
                        <span className="muted">Unassigned</span>
                      )}
                    </td>

                    <td>
                      <span
                        className={`badge ${
                          t.priority === 'Critical'
                            ? 'bg-rose-100 text-rose-700'
                            : t.priority === 'High'
                              ? 'bg-orange-100 text-orange-700'
                              : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {t.priority}
                      </span>
                    </td>

                    <td>
                      {canManage ||
                      t.assignee?._id === user.id ||
                      t.assignee?._id === user._id ? (
                        <select
                          aria-label={`Status for ${t.title}`}
                          className={`rounded-full border-0 px-2 py-1 text-[11px] font-bold ${badge(
                            t.status
                          )}`}
                          value={t.status}
                          onChange={(e) =>
                            updateStatus(t, e.target.value)
                          }
                        >
                          {(canManage
                            ? STATUSES
                            : ['To Do', 'In Progress', 'Completed']
                          ).map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className={`badge ${badge(t.status)}`}>
                          {t.status}
                        </span>
                      )}
                    </td>

                    <td className="whitespace-nowrap">
                      {t.dueDate ? (
                        <span
                          className={`flex items-center gap-1 ${
                            new Date(t.dueDate) < new Date() &&
                            !['Done', 'Completed'].includes(t.status)
                              ? 'text-rose-600'
                              : ''
                          }`}
                        >
                          <CalendarDays size={13} />
                          {new Date(t.dueDate).toLocaleDateString()}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>

                    <td>
                      <div className="flex items-center gap-1">
                        <button
                          title="Activity history"
                          className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-indigo-600"
                          onClick={() => showActivity(t)}
                        >
                          <History size={15} />
                        </button>

                        {canManage && (
                          <button
                            title="Edit task"
                            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-indigo-600"
                            onClick={() => openEdit(t)}
                          >
                            <Edit3 size={15} />
                          </button>
                        )}

                        {canManage && (
                          <button
                            title="Delete task"
                            className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                            onClick={() => remove(t)}
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3 text-xs muted dark:border-slate-800">
          Showing {filtered.length} of {tasks.length} tasks
          <span>Sorted by recent update</span>
        </div>
      </div>

      {modal && (
        <Modal
          title={editing ? 'Edit task' : 'Create a task'}
          onClose={() => setModal(false)}
          wide
        >
          <form onSubmit={save} className="space-y-4">
            <div>
              <label className="label">Task title *</label>
              <input
                className="field"
                value={form.title}
                onChange={(e) =>
                  setForm({ ...form, title: e.target.value })
                }
                required
                maxLength={160}
                placeholder="e.g. Build login page"
              />
            </div>

            <div>
              <label className="label">Description</label>
              <textarea
                className="field min-h-24"
                value={form.description || ''}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                maxLength={5000}
                placeholder="What needs to be done?"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label">Assignee</label>
                <select
                  className="field"
                  value={form.assignee || ''}
                  onChange={(e) =>
                    setForm({ ...form, assignee: e.target.value })
                  }
                >
                  <option value="">Unassigned</option>

                  {users.map((u) => (
                    <option key={u._id || u.id} value={u._id || u.id}>
                      {u.name} · {u.role}
                    </option>
                  ))}
                </select>

                {users.length === 0 && (
                  <p className="mt-1 text-[11px] muted">
                    Create team accounts from the Team page first.
                  </p>
                )}
              </div>

              <div>
                <label className="label">Status</label>
                <select
                  className="field"
                  value={form.status}
                  onChange={(e) =>
                    setForm({ ...form, status: e.target.value })
                  }
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Priority</label>
                <select
                  className="field"
                  value={form.priority}
                  onChange={(e) =>
                    setForm({ ...form, priority: e.target.value })
                  }
                >
                  {['Low', 'Medium', 'High', 'Critical'].map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Estimate (hours)</label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  className="field"
                  value={form.estimateHours || 0}
                  onChange={(e) =>
                    setForm({ ...form, estimateHours: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="label">Start date</label>
                <input
                  type="date"
                  className="field"
                  value={form.startDate || ''}
                  onChange={(e) =>
                    setForm({ ...form, startDate: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="label">Due date</label>
                <input
                  type="date"
                  className="field"
                  value={form.dueDate || ''}
                  onChange={(e) =>
                    setForm({ ...form, dueDate: e.target.value })
                  }
                />
              </div>
            </div>

            {canManage && (
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={!!form.qaRequired}
                  onChange={(e) =>
                    setForm({ ...form, qaRequired: e.target.checked })
                  }
                />
                QA sign-off required before completion
              </label>
            )}

            <div className="flex justify-end gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
              <button
                type="button"
                className="btn btn-muted"
                onClick={() => setModal(false)}
              >
                Cancel
              </button>

              <button disabled={saving} className="btn btn-primary">
                {saving
                  ? 'Saving…'
                  : editing
                    ? 'Save changes'
                    : 'Create task'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {activity && (
        <Modal
          title="Task activity history"
          onClose={() => setActivity(null)}
        >
          <div className="mb-4 rounded-xl bg-slate-50 p-3 dark:bg-slate-800">
            <div className="font-bold">{activity.title}</div>
            <div className="mt-1 text-xs muted">
              {activity.status} · {activity.priority} priority
            </div>
          </div>

          {history.length === 0 ? (
            <p className="py-5 text-center text-sm muted">
              No activity recorded yet.
            </p>
          ) : (
            <div className="space-y-4">
              {history.map((a) => (
                <div className="flex gap-3" key={a._id}>
                  <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                    <History size={14} />
                  </div>

                  <div>
                    <div className="text-sm font-bold">
                      {a.action?.replaceAll('_', ' ')}
                    </div>

                    <div className="mt-1 text-sm muted">
                      {a.details}
                    </div>

                    <div className="mt-1 text-xs muted">
                      {a.actor?.name || 'System'} ·{' '}
                      {new Date(a.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}
