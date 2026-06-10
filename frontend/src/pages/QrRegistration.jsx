import { QRCodeSVG } from 'qrcode.react';
import { Check, ExternalLink, Eye } from 'lucide-react';
import { api, errorMessage } from '../services/api';
import PatientForm from '../components/PatientForm';

/**
 * QR Registration management for patients
 * @param {Object} props
 * @param {Object} props.queue - Current queue state
 * @param {Function} props.onError - Error callback
 * @param {Function} props.onViewPatientMode - Callback to view patient portal
 * @returns {JSX.Element}
 */
export default function QrRegistration({ queue, onError, onViewPatientMode }) {
  const registrationUrl = `${window.location.origin}?view=register`;
  const patientPortalUrl = `${window.location.origin}?view=patient`;

  async function register(form) {
    try {
      // Use /patient (authenticated, status: 'waiting') for receptionist quick-add.
      // /self-register is only for patients scanning the QR themselves (status: 'pending_approval').
      await api.post('/patient', form);
    } catch (error) {
      onError(errorMessage(error));
    }
  }

  async function approve(id) {
    try {
      await api.post(`/approve-registration/${id}`);
    } catch (error) {
      onError(errorMessage(error));
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-panel">
        <h2 className="text-xl font-semibold text-clinic-ink">Self registration QR</h2>
        <div className="mt-5 flex justify-center rounded-lg border border-slate-200 bg-slate-50 p-6">
          <QRCodeSVG value={registrationUrl} size={190} />
        </div>
        <p className="mt-4 text-xs text-slate-600 text-center">Patients scan this QR to register</p>
        
        {/* Links */}
        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:gap-2">
          <a 
            href={registrationUrl} 
            target="_blank"
            rel="noreferrer"
            className="focus-ring flex-1 inline-flex items-center justify-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <ExternalLink className="h-4 w-4" />
            Registration Link
          </a>
          <a 
            href={patientPortalUrl} 
            target="_blank"
            rel="noreferrer"
            className="focus-ring flex-1 inline-flex items-center justify-center gap-2 rounded-md border border-clinic-teal text-clinic-teal px-3 py-2 text-sm font-semibold hover:bg-cyan-50"
          >
            <Eye className="h-4 w-4" />
            Patient Portal
          </a>
        </div>

        <div className="mt-6 border-t border-slate-200 pt-5">
          <p className="mb-4 text-sm font-medium text-slate-600">Or add patient manually:</p>
          <PatientForm compact onSubmit={register} />
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-panel">
        <h2 className="text-xl font-semibold text-clinic-ink">Reception approvals</h2>
        <div className="mt-4 space-y-3">
          {queue.pendingApprovals.map((patient) => (
            <div key={patient._id} className="flex flex-col gap-3 rounded-lg border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-clinic-ink">Token {patient.tokenNumber} · {patient.name}</p>
                  {patient.emergency ? <span className="rounded-md bg-red-100 px-2 py-1 text-xs font-bold text-red-700">Priority</span> : null}
                </div>
                <p className="text-sm text-slate-500">{patient.reason || 'General consultation'}</p>
              </div>
              <button
                type="button"
                onClick={() => approve(patient._id)}
                className="focus-ring inline-flex items-center justify-center gap-2 rounded-md bg-clinic-green px-3 py-2 font-semibold text-white"
              >
                <Check className="h-4 w-4" />
                Approve
              </button>
            </div>
          ))}
          {!queue.pendingApprovals.length ? <div className="rounded-lg border border-dashed border-slate-300 p-8 text-center text-slate-500">No pending QR registrations</div> : null}
        </div>
      </section>
    </div>
  );
}
