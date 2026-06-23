// Plain (non-server) module for action initial states. Importing from here
// keeps "use server" files free of non-async exports.

export interface InquiryActionState {
  ok: boolean;
  message?: string;
  errors?: Record<string, string>;
}

export const initialInquiryState: InquiryActionState = { ok: false };

export interface CarFormState {
  ok: boolean;
  message?: string;
  errors?: Record<string, string>;
}

export const initialCarFormState: CarFormState = { ok: false };
