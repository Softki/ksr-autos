"use server";

import { revalidatePath } from "next/cache";
import { isAuthenticatedAdmin } from "@/lib/auth/session";
import { updateInquiryStatus } from "@/lib/data/inquiries";
import type { InquiryStatus } from "@/lib/types";

const STATUS: InquiryStatus[] = ["new", "contacted", "closed", "spam"];

export async function updateInquiryStatusAction(formData: FormData): Promise<void> {
  if (!(await isAuthenticatedAdmin())) return;
  const id = formData.get("id") as string;
  const status = formData.get("status") as InquiryStatus;
  if (!id || !STATUS.includes(status)) return;
  await updateInquiryStatus(id, status);
  revalidatePath("/admin/inquiries");
}
