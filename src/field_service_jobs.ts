import { z } from "zod";
import { captureFailure } from "./infrai_client.js";

export const jobSchema = z.object({
  jobId: z.string().min(1),
  technicianId: z.string().min(1),
  dispatchStatus: z.enum(["scheduled", "en_route", "complete", "failed"]),
  photos: z.array(z.string().min(1)),
  followUp: z.string().min(1).optional()
});

export type FieldServiceJob = z.infer<typeof jobSchema>;

export type JobDecision = {
  alert: boolean;
  reason: "dispatch_failed" | "missing_completion_photo" | "healthy";
};

export function decideJob(job: FieldServiceJob): JobDecision {
  if (job.dispatchStatus === "failed") return { alert: true, reason: "dispatch_failed" };
  if (job.dispatchStatus === "complete" && job.photos.length === 0) {
    return { alert: true, reason: "missing_completion_photo" };
  }
  return { alert: false, reason: "healthy" };
}

export async function inspectScheduledJob(input: unknown): Promise<JobDecision> {
  const job = jobSchema.parse(input);
  const decision = decideJob(job);
  if (decision.alert) {
    await captureFailure({
      name: "field_service_job_failure",
      message: decision.reason,
      job_id: job.jobId,
      technician_id: job.technicianId,
      dispatch_status: job.dispatchStatus,
      photos: job.photos,
      follow_up: job.followUp ?? null
    });
  }
  return decision;
}
