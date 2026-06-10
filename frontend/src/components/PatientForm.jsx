import { useState } from 'react';
import { AlertTriangle, UserPlus } from 'lucide-react';

const emptyForm = { name: '', phone: '', age: '', reason: '', emergency: false };

export default function PatientForm({ onSubmit, compact = false }) {
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    try {
      await onSubmit(form);
      setForm(emptyForm);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className={compact ? 'grid gap-3' : 'grid gap-3 md:grid-cols-2'}>
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Patient name</span>
          <input
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
            className="focus-ring mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2"
            placeholder="Asha Menon"
            required
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Phone</span>
          <input
            value={form.phone}
            onChange={(event) => setForm({ ...form, phone: event.target.value })}
            className="focus-ring mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2"
            placeholder="+91 98765 43210"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Age</span>
          <input
            type="number"
            min="0"
            max="130"
            value={form.age}
            onChange={(event) => setForm({ ...form, age: event.target.value })}
            className="focus-ring mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2"
            placeholder="42"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Visit reason</span>
          <input
            value={form.reason}
            onChange={(event) => setForm({ ...form, reason: event.target.value })}
            className="focus-ring mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2"
            placeholder="Fever, review, follow-up"
          />
        </label>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="inline-flex cursor-pointer items-center gap-3 rounded-md border border-slate-200 bg-white px-3 py-2">
          <input
            type="checkbox"
            checked={form.emergency}
            onChange={(event) => setForm({ ...form, emergency: event.target.checked })}
            className="h-4 w-4 rounded border-slate-300 text-clinic-red focus:ring-clinic-red"
          />
          <span className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <AlertTriangle className="h-4 w-4 text-clinic-red" />
            Emergency priority
          </span>
        </label>
        <button
          type="submit"
          disabled={saving}
          className="focus-ring inline-flex items-center justify-center gap-2 rounded-md bg-clinic-green px-4 py-2 font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-60"
        >
          <UserPlus className="h-4 w-4" />
          {saving ? 'Adding...' : 'Add patient'}
        </button>
      </div>
    </form>
  );
}
