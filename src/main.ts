import { inspectScheduledJob } from "./field_service_jobs.js";

const sample = {
  jobId: "WO-1042",
  technicianId: "tech-17",
  dispatchStatus: "failed",
  photos: [],
  followUp: "Call the customer before rescheduling"
};

const decision = await inspectScheduledJob(sample);
console.log(JSON.stringify({ jobId: sample.jobId, decision }, null, 2));
