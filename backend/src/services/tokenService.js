import Counter from '../models/Counter.js';

export async function nextTokenNumber() {
  const counter = await Counter.findByIdAndUpdate(
    'tokenNumber',
    { $inc: { sequence_value: 1 } },
    { new: true, upsert: true }
  );
  return counter.sequence_value;
}
