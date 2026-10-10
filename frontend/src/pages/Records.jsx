
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  FolderKanban,
  BookOpen,
  Zap,
  ClipboardCheck,
  Activity,
  AlertTriangle,
  ShieldCheck,
  Download,
} from 'lucide-react';
import Modal from '../components/Modal.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const configs = {
  projects: {
    title: 'Projects',
    singular: 'Project',
    icon: FolderKanban,
    fields: [
      ['key', 'Project key', 'required'],
      ['name', 'Project name', 'required'],
      ['description', 'Description', 'textarea'],
      ['status', 'Status', 'select', 'Planning,Active,On Hold,Completed'],
      ['owner', 'Owner'],
    ],
  },
  requirements: {
    title: 'Requirements',
    singular: 'Requirement',
    icon: BookOpen,
    fields: [
      ['id', 'Requirement ID', 'required'],
      ['title', 'Title', 'required'],
      ['description', 'Description', 'textarea'],
      ['acceptanceCriteria', 'Acceptance criteria', 'textarea'],
      ['priority', 'Priority', 'select', 'Low,Medium,High,Critical'],
      ['owner', 'Owner'],
      [
        'status',
        'Status',
        'select',
        'Draft,Approved,In Development,In QA,Completed',
      ],
      ['projectId', 'Project ID'],
      ['taskId', 'Linked task ID'],
    ],
  },
  sprints: {
    title: 'Sprints',
    singular: 'Sprint',
    icon: Zap,
    fields: [
      ['id', 'Sprint ID', 'required'],
      ['title', 'Sprint name', 'required'],
      ['goal', 'Sprint goal', 'textarea'],
      ['startDate', 'Start date', 'date'],
      ['endDate', 'End date', 'date'],
      ['state', 'State', 'select', 'Planned,Active,Closed'],
    ],
  },
  testcases: {
    title: 'Test Cases',
    singular: 'Test Case',
    icon: ClipboardCheck,
    fields: [
      ['id', 'Test Case ID', 'required'],
      ['requirementId', 'Requirement ID', 'required'],
      ['title', 'Scenario', 'required'],
      ['preconditions', 'Preconditions', 'textarea'],
      ['steps', 'Steps', 'textarea'],
      ['testData', 'Test data', 'textarea'],
      ['expectedResult', 'Expected result', 'textarea'],
      ['priority', 'Priority', 'select', 'Low,Medium,High,Critical'],
    ],
  },
  testruns: {
    title: 'Test Runs',
    singular: 'Test Run',
    icon: Activity,
    fields: [
      ['testCaseId', 'Test Case ID', 'required'],
      ['taskId', 'Task ID'],
      ['tester', 'Tester'],
      ['environment', 'Build / environment'],
      ['executionDate', 'Execution date', 'date'],
      ['actualResult', 'Actual result', 'textarea'],
      ['evidenceUrl', 'Evidence URL'],
      ['status', 'Result', 'select', 'Not Run,Pass,Fail,Blocked'],
    ],
  },
  bugs: {
    title: 'Bug Tracker',
    singular: 'Bug',
    icon: AlertTriangle,
    fields: [
      ['id', 'Bug ID', 'required'],
      ['summary', 'Summary', 'required'],
      ['reproductionSteps', 'Reproduction steps', 'textarea'],
      ['expectedResult', 'Expected result', 'textarea'],
      ['actualResult', 'Actual result', 'textarea'],
      ['severity', 'Severity', 'select', 'Low,Medium,High,Critical'],
      ['priority', 'Priority', 'select', 'Low,Medium,High,Critical'],
      ['environment', 'Environment'],
      ['assignedDeveloper', 'Assigned developer'],
      ['evidenceUrl', 'Evidence URL'],
      [
        'status',
        'Status',
        'select',
        'Open,Assigned,In Progress,Fixed,Ready for Retest,Closed,Reopened',
      ],
      ['fixNotes', 'Fix notes', 'textarea'],
      ['retestResult', 'Retest result', 'select', 'Not Run,Pass,Fail,Blocked'],
      ['pullRequestUrl', 'PR link'],
    ],
  },
  releases: {
    title: 'Releases',
    singular: 'Release',
    icon: ShieldCheck,
    fields: [
      ['version', 'Release version', 'required'],
      ['title', 'Release name', 'required'],
      ['environment', 'Environment', 'select', 'Dev,QA,Production'],
      ['status', 'QA status', 'select', 'Pending QA,QA Passed,Signed Off,Blocked'],
      ['approvedBy', 'Approved by'],
      ['approvalNotes', 'Approval notes', 'textarea'],
    ],
  },
};

const initial = (fields) =>
  Object.fromEntries(fields.map(([key]) => [key, '']));

export default function Records({ type: forcedType }) {
  const location = useLocation();
  const type = forcedType || location.pathname.split('/').pop();
  const cfg = configs[type] || configs.projects;

  const { request, user } = useAuth();

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(initial(cfg.fields));
  const [saving, setSaving] = useState(false);

  const canCreate = ['projects', 'sprints', 'releases'].includes(type)
    ? user.role === 'Manager'
    : type === 'requirements'
      ? ['Manager', 'Developer'].includes(user.role)
      : ['testcases', 'testruns'].includes(type)
        ? ['Manager', 'QA Tester'].includes(user.role)
        : ['Manager', 'Developer', 'QA Tester'].includes(user.role);

  async function load() {
    setLoading(true);

    try {
      const d = await request(`/records/${type}`);
      setRecords(d.records || []);
      setError('');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [type]);

  function openNew() {
    setEditing(null);
    setForm(initial(cfg.fields));
    setModal(true);
  }

  function openEdit(record) {
    setEditing(record);
    setForm({ ...initial(cfg.fields), ...record.data });
    setModal(true);
  }

  async function save(e) {
    e.preventDefault();
    setSaving(true);

    try {
      await request(
        editing
          ? `/records/${type}/${editing._id}`
          : `/records/${type}`,
        {
          method: editing ? 'PATCH' : 'POST',
          body: JSON.stringify({ data: form }),
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

  async function remove(record) {
    if (!window.confirm(`Delete this ${cfg.singular.toLowerCase()}?`)) {
      return;
    }

    try {
      await request(`/records/${type}/${record._id}`, {
        method: 'DELETE',
      });

      await load();
    } catch (e) {
      setError(e.message);
    }
  }

  const filtered = records.filter((record) =>
    JSON.stringify(record.data)
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  function exportCsv() {
    const keys = cfg.fields.map((field) => field[0]);

    const csv = [
      keys.join(','),
      ...filtered.map((record) =>
        keys
          .map(
            (key) =>
              `"${String(record.data?.[key] ?? '').replaceAll('"', '""')}"`
          )
          .join(',')
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');

    a.href = url;
    a.download = `${type}.csv`;
    a.click();

    URL.revokeObjectURL(url);
  }

  const Icon = cfg.icon;

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm muted">
            Manage and track {cfg.title.toLowerCase()} across your workspace.
          </p>

          <div className="mt-3 flex gap-2">
            <span className="badge">{records.length} total</span>

            {type === 'requirements' && (
              <span className="badge bg-amber-50 text-amber-700">
                {records.filter((r) => !r.data.testCaseCount).length} may need
                test coverage
              </span>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <button className="btn btn-muted" onClick={exportCsv}>
            <Download size={15} /> Export CSV
          </button>

          {canCreate && (
            <button className="btn btn-primary" onClick={openNew}>
              <Plus size={16} /> New {cfg.singular}
            </button>
          )}
        </div>
      </div>

      {error && (
        <div role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="card p-4">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-3 text-slate-400" />

          <input
            className="field pl-9"
            placeholder={`Search ${cfg.title.toLowerCase()}…`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>{cfg.singular}</th>
                <th>Key details</th>
                <th>Status</th>
                <th>Updated</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center muted">
                    Loading {cfg.title.toLowerCase()}…
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-14 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                      <Icon />
                    </div>

                    <div className="mt-3 font-bold">
                      No {cfg.title.toLowerCase()} yet
                    </div>

                    <p className="mt-1 text-sm muted">
                      Create your first record to get started.
                    </p>

                    {canCreate && (
                      <button
                        className="btn btn-primary mt-4"
                        onClick={openNew}
                      >
                        <Plus size={15} /> New {cfg.singular}
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                filtered.map((record) => {
                  const d = record.data || {};
                  const title =
                    d.title ||
                    d.name ||
                    d.summary ||
                    d.version ||
                    d.id ||
                    d.key ||
                    cfg.singular;

                  const status = d.status || d.state || 'Draft';

                  return (
                    <tr key={record._id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600">
                            <Icon size={17} />
                          </div>

                          <div>
                            <div className="font-bold">{title}</div>
                            <div className="mt-1 text-xs muted">
                              {d.id ||
                                d.key ||
                                d.version ||
                                record._id.slice(-7).toUpperCase()}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td>
                        <div className="max-w-sm text-sm">
                          {d.description ||
                            d.goal ||
                            d.acceptanceCriteria ||
                            d.expectedResult ||
                            d.environment ||
                            '—'}
                        </div>

                        <div className="mt-1 text-xs muted">
                          {d.priority ? `Priority: ${d.priority}` : ''}
                          {d.owner ? ` · Owner: ${d.owner}` : ''}
                          {d.requirementId ? ` · ${d.requirementId}` : ''}
                        </div>
                      </td>

                      <td>
                        <span className="badge">{status}</span>
                      </td>

                      <td className="whitespace-nowrap text-xs muted">
                        {new Date(record.updatedAt).toLocaleDateString()}
                      </td>

                      <td>
                        <div className="flex gap-1">
                          <button
                            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-indigo-600"
                            title="Edit"
                            onClick={() => openEdit(record)}
                          >
                            <Edit3 size={15} />
                          </button>

                          {user.role === 'Manager' && (
                            <button
                              className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                              title="Delete"
                              onClick={() => remove(record)}
                            >
                              <Trash2 size={15} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {type === 'requirements' && (
        <div className="card p-5">
          <h3 className="font-extrabold">Requirement traceability</h3>

          <p className="mt-1 text-sm muted">
            Link requirements to task IDs and test cases using the fields
            above. Keep coverage visible as your work progresses.
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {[
              ['Total requirements', records.length],
              [
                'Approved / active',
                records.filter((r) =>
                  ['Approved', 'In Development', 'In QA'].includes(
                    r.data?.status
                  )
                ).length,
              ],
              [
                'Completed',
                records.filter((r) => r.data?.status === 'Completed').length,
              ],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800"
              >
                <div className="text-xs muted">{label}</div>
                <div className="mt-1 text-2xl font-extrabold">{value}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {modal && (
        <Modal
          title={`${editing ? 'Edit' : 'Create'} ${cfg.singular}`}
          onClose={() => setModal(false)}
          wide
        >
          <form className="space-y-4" onSubmit={save}>
            <div className="grid gap-4 sm:grid-cols-2">
              {cfg.fields.map(([key, label, kind, options]) => (
                <div
                  className={kind === 'textarea' ? 'sm:col-span-2' : ''}
                  key={key}
                >
                  <label className="label">
                    {label}
                    {kind === 'required' ? ' *' : ''}
                  </label>

                  {kind === 'textarea' ? (
                    <textarea
                      className="field min-h-20"
                      value={form[key] || ''}
                      onChange={(e) =>
                        setForm({ ...form, [key]: e.target.value })
                      }
                      maxLength={5000}
                    />
                  ) : kind === 'select' ? (
                    <select
                      className="field"
                      value={form[key] || ''}
                      onChange={(e) =>
                        setForm({ ...form, [key]: e.target.value })
                      }
                    >
                      <option value="">Select…</option>
                      {options.split(',').map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      className="field"
                      type={kind === 'date' ? 'date' : 'text'}
                      value={form[key] || ''}
                      onChange={(e) =>
                        setForm({ ...form, [key]: e.target.value })
                      }
                      required={kind === 'required'}
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
              <button
                type="button"
                className="btn btn-muted"
                onClick={() => setModal(false)}
              >
                Cancel
              </button>

              <button className="btn btn-primary" disabled={saving}>
                {saving ? 'Saving…' : 'Save record'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
