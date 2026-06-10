import AuditLog from '../models/AuditLog.js';
import { emitAuditCreated } from '../sockets/index.js';

export async function writeAudit({ action, patient, tokenNumber, message, metadata = {} }) {
  const log = await AuditLog.create({ action, patient, tokenNumber, message, metadata });
  emitAuditCreated(log);
  return log;
}
