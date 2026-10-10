
import { useEffect, useState } from 'react';
import { History, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export default function Activity() {
  const { request } = useAuth();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);

    try {
      const d = await request('/tasks');

      const all = await Promise.all(
        (d.tasks || []).slice(0, 50).map((t) =>
          request(`/tasks/${t._id}/activity`)
            .then((x) => x.activities || [])
            .catch(() => [])
        )
      );

      setItems(
        all
          .flat()
          .sort(
            (a, b) =>
              new Date(b.createdAt) - new Date(a.createdAt)
          )
      );
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between">
        <p className="text-sm muted">
          A chronological audit trail of task changes.
        </p>

        <button className="btn btn-muted" onClick={load}>
          <RefreshCw size={15} /> Refresh
        </button>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="card p-5 md:p-7">
        {loading ? (
          <p className="py-8 text-center muted">
            Loading activity…
          </p>
        ) : items.length === 0 ? (
          <p className="py-10 text-center muted">
            No task activity has been recorded yet.
          </p>
        ) : (
          <div className="space-y-5">
            {items.map((a) => (
              <div className="flex gap-4" key={a._id}>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <History size={17} />
                </div>

                <div className="flex-1 border-b border-slate-100 pb-5 dark:border-slate-800">
                  <div className="flex flex-col justify-between gap-1 sm:flex-row">
                    <div className="font-bold capitalize">
                      {a.action?.replaceAll('_', ' ')}
                    </div>

                    <div className="text-xs muted">
                      {new Date(a.createdAt).toLocaleString()}
                    </div>
                  </div>

                  <p className="mt-1 text-sm muted">
                    {a.details}
                  </p>

                  <div className="mt-2 text-xs text-indigo-600">
                    {a.actor?.name || 'System'}{' '}
                    {a.actor?.role ? `· ${a.actor.role}` : ''}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
