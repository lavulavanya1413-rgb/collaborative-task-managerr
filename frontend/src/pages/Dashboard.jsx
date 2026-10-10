import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  ArrowUpRight,
  BriefcaseBusiness,
  CheckCircle2,
  Clock3,
  ListTodo,
  Plus,
  ShieldCheck,
  Target,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

const colors = {
  Done: 'bg-emerald-100 text-emerald-700',
  Completed: 'bg-emerald-100 text-emerald-700',
  'In Progress': 'bg-blue-100 text-blue-700',
  'Ready for QA': 'bg-violet-100 text-violet-700',
  Rework: 'bg-rose-100 text-rose-700',
  'To Do': 'bg-amber-100 text-amber-700',
  Backlog: 'bg-slate-100 text-slate-600',
  'Code Review': 'bg-cyan-100 text-cyan-700',
};

export default function Dashboard() {
  const { request, user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const nav = useNavigate();

  useEffect(() => {
    request('/tasks')
      .then((d) => setTasks(d.tasks || []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const done = tasks.filter((t) => ['Done', 'Completed'].includes(t.status)).length;
  const active = tasks.filter((t) =>
    ['In Progress', 'Code Review', 'Ready for QA'].includes(t.status)
  ).length;
  const assignments = tasks.filter((t) => t.assignee).length;
  const overdue = tasks.filter(
    (t) =>
      t.dueDate &&
      new Date(t.dueDate) < new Date() &&
      !['Done', 'Completed'].includes(t.status)
  ).length;
  const readyForQa = tasks.filter((t) => t.status === 'Ready for QA').length;
  const rework = tasks.filter((t) => t.status === 'Rework').length;

  const assigneeSummary = useMemo(() => {
    const byAssignee = {};

    tasks.forEach((task) => {
      const name = task.assignee?.name || 'Unassigned';
      byAssignee[name] = (byAssignee[name] || 0) + 1;
    });

    return Object.entries(byAssignee)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 4);
  }, [tasks]);

  const myAssignments = useMemo(
    () =>
      tasks
        .filter((task) => task.assignee && task.assignee._id === user?._id)
        .slice(0, 4),
    [tasks, user]
  );

  const completionRate = tasks.length ? Math.round((done / tasks.length) * 100) : 0;

  const stats = [
    ['Visible tasks', tasks.length, ListTodo, 'bg-indigo-50 text-indigo-600'],
    ['Assignments', assignments, BriefcaseBusiness, 'bg-blue-50 text-blue-600'],
    ['In progress', active, Clock3, 'bg-sky-50 text-sky-600'],
    ['Completed', done, CheckCircle2, 'bg-emerald-50 text-emerald-600'],
    ['Overdue', overdue, AlertCircle, 'bg-rose-50 text-rose-600'],
  ];

  return (
    <div className="space-y-7">
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-700 via-indigo-600 to-violet-600 p-6 text-white md:p-8">
        <div className="absolute -right-8 -top-16 h-64 w-64 rounded-full border-[35px] border-white/10" />

        <div className="relative flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <div className="text-sm text-indigo-100">
              {new Date().toLocaleDateString(undefined, {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
            </div>

            <h2 className="mt-2 text-2xl font-extrabold md:text-3xl">
              Good to see you, {user?.name?.split(' ')[0] || 'there'} 👋
            </h2>

            <p className="mt-2 max-w-lg text-sm text-indigo-100">
              {user?.role === 'Manager'
                ? 'Here is your team’s latest progress. Let’s keep the momentum going.'
                : 'Track your work, priorities, and delivery health in one place.'}
            </p>
          </div>

          <button
            onClick={() => nav('/app/tasks?new=1')}
            className="btn shrink-0 bg-white text-indigo-700 hover:bg-indigo-50"
          >
            <Plus size={17} /> Create a task
          </button>
        </div>
      </section>

      {error && (
        <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {stats.map(([label, value, Icon, style]) => (
          <div className="card p-5" key={label}>
            <div className="flex items-center justify-between">
              <div className={`rounded-xl p-3 ${style}`}>
                <Icon size={19} />
              </div>
              <span className="text-xs text-slate-400">Live</span>
            </div>

            <div className="mt-4 text-3xl font-extrabold">
              {loading ? '—' : value}
            </div>

            <div className="mt-1 text-sm text-slate-500">{label}</div>
          </div>
        ))}
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.6fr_1fr]">
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between p-5">
            <div>
              <h3 className="font-extrabold">Recent tasks</h3>
              <p className="mt-1 text-xs text-slate-400">
                Latest updates across your workspace
              </p>
            </div>

            <button
              onClick={() => nav('/app/tasks')}
              className="flex items-center gap-1 text-xs font-bold text-indigo-600"
            >
              View all <ArrowUpRight size={15} />
            </button>
          </div>

          {loading ? (
            <div className="p-8 text-center text-sm muted">Loading tasks…</div>
          ) : tasks.length === 0 ? (
            <div className="p-10 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                <ListTodo />
              </div>

              <h4 className="mt-3 font-bold">Your workspace is ready</h4>
              <p className="mt-1 text-sm muted">
                Create a task or ask a manager to assign one.
              </p>

              <button
                className="btn btn-primary mt-4"
                onClick={() => nav('/app/tasks?new=1')}
              >
                Create task
              </button>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Task</th>
                    <th>Assignee</th>
                    <th>Status</th>
                    <th>Due date</th>
                  </tr>
                </thead>

                <tbody>
                  {tasks.slice(0, 6).map((t) => (
                    <tr key={t._id}>
                      <td>
                        <button
                          className="text-left font-bold hover:text-indigo-600"
                          onClick={() => nav('/app/tasks')}
                        >
                          {t.title}
                        </button>

                        <div className="mt-1 max-w-[260px] truncate text-xs muted">
                          {t.description || 'No description'}
                        </div>
                      </td>

                      <td>{t.assignee?.name || 'Unassigned'}</td>

                      <td>
                        <span className={`badge ${colors[t.status] || ''}`}>
                          {t.status}
                        </span>
                      </td>

                      <td className="whitespace-nowrap">
                        {t.dueDate ? new Date(t.dueDate).toLocaleDateString() : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="space-y-5">
          <div className="card p-5">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold">Task progress</h3>
              <TrendingUp size={18} className="text-indigo-600" />
            </div>

            <div className="mt-5 flex items-end justify-between">
              <div>
                <div className="text-3xl font-extrabold">{completionRate}%</div>
                <div className="mt-1 text-xs muted">Completion rate</div>
              </div>

              <div className="text-xs muted">
                {done} of {tasks.length} tasks
              </div>
            </div>

            <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
              <div
                className="h-full rounded-full bg-indigo-600 transition-all"
                style={{ width: `${completionRate}%` }}
              />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800">
                <div className="text-xs muted">Open</div>
                <div className="mt-1 text-xl font-bold">{tasks.length - done}</div>
              </div>

              <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800">
                <div className="text-xs muted">Finished</div>
                <div className="mt-1 text-xl font-bold">{done}</div>
              </div>
            </div>
          </div>

          <div className="card p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-violet-50 p-3 text-violet-600">
                <Users size={19} />
              </div>

              <div>
                <h3 className="font-extrabold">Team workspace</h3>
                <p className="mt-1 text-xs muted">Projects, requirements and quality</p>
              </div>
            </div>

            <p className="mt-4 text-sm leading-6 muted">
              Keep your delivery flow visible from planning through implementation,
              testing and sign-off.
            </p>

            <button
              onClick={() => nav('/app/projects')}
              className="btn btn-muted mt-4 w-full"
            >
              Explore workspace <ArrowUpRight size={15} />
            </button>
          </div>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-3">
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold">My assignments</h3>
            <Target size={18} className="text-indigo-600" />
          </div>

          <div className="mt-4 space-y-3">
            {myAssignments.length === 0 ? (
              <p className="text-sm muted">No tasks assigned to you right now.</p>
            ) : (
              myAssignments.map((task) => (
                <div key={task._id} className="rounded-xl border border-slate-200 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-bold text-slate-700">{task.title}</p>
                    <span className={`badge ${colors[task.status] || ''}`}>
                      {task.status}
                    </span>
                  </div>
                  <div className="mt-2 text-xs muted">
                    {task.dueDate
                      ? `Due ${new Date(task.dueDate).toLocaleDateString()}`
                      : 'No due date'}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold">Team workload</h3>
            <Users size={18} className="text-violet-600" />
          </div>

          <div className="mt-4 space-y-3">
            {assigneeSummary.map(({ name, count }) => (
              <div key={name}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-700">{name}</span>
                  <span className="text-slate-500">{count} tasks</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100">
                  <div
                    className="h-2 rounded-full bg-violet-500"
                    style={{ width: `${Math.max(18, (count / Math.max(tasks.length, 1)) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold">Quality</h3>
            <ShieldCheck size={18} className="text-emerald-600" />
          </div>

          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between rounded-xl bg-violet-50 p-3">
              <span className="text-sm text-slate-700">Ready for QA</span>
              <span className="font-bold text-violet-700">{readyForQa}</span>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-rose-50 p-3">
              <span className="text-sm text-slate-700">Rework</span>
              <span className="font-bold text-rose-700">{rework}</span>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-amber-50 p-3">
              <span className="text-sm text-slate-700">Overdue</span>
              <span className="font-bold text-amber-700">{overdue}</span>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-emerald-50 p-3">
              <span className="text-sm text-slate-700">Done</span>
              <span className="font-bold text-emerald-700">{done}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
              <Zap size={18} />
            </div>
            <div>
              <div className="text-xs text-slate-500">Delivery</div>
              <div className="font-extrabold">{completionRate}%</div>
            </div>
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-sky-50 p-3 text-sky-600">
              <Clock3 size={18} />
            </div>
            <div>
              <div className="text-xs text-slate-500">In progress</div>
              <div className="font-extrabold">{active}</div>
            </div>
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
              <CheckCircle2 size={18} />
            </div>
            <div>
              <div className="text-xs text-slate-500">Completed</div>
              <div className="font-extrabold">{done}</div>
            </div>
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-rose-50 p-3 text-rose-600">
              <AlertCircle size={18} />
            </div>
            <div>
              <div className="text-xs text-slate-500">Overdue</div>
              <div className="font-extrabold">{overdue}</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
