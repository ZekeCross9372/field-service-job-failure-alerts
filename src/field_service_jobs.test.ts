import assert from "node:assert/strict";
import { decideJob, jobSchema } from "./field_service_jobs.js";

const failed = jobSchema.parse({
  jobId: "WO-9",
  technicianId: "tech-2",
  dispatchStatus: "failed",
  photos: []
});
assert.deepEqual(decideJob(failed), { alert: true, reason: "dispatch_failed" });

const completeWithoutPhoto = jobSchema.parse({
  jobId: "WO-10",
  technicianId: "tech-2",
  dispatchStatus: "complete",
  photos: []
});
assert.deepEqual(decideJob(completeWithoutPhoto), { alert: true, reason: "missing_completion_photo" });

const healthy = jobSchema.parse({
  jobId: "WO-11",
  technicianId: "tech-2",
  dispatchStatus: "complete",
  photos: ["photo-1"]
});
assert.deepEqual(decideJob(healthy), { alert: false, reason: "healthy" });
console.log("field-service decision tests passed");
