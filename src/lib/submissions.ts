import { supabase } from "@/integrations/supabase/client";

export type ReservationSubmission = {
  name: string;
  email: string;
  phone: string;
  reservation_date: string;
  reservation_time: string;
  guests: number;
  message: string;
};

export type ContactSubmission = {
  name: string;
  email: string;
  phone: string;
  message: string;
};

export async function saveReservation(data: ReservationSubmission) {
  return supabase.from("restaurant_submissions").insert({
    submission_type: "reservation",
    ...data,
  });
}

export async function saveContact(data: ContactSubmission) {
  return supabase.from("restaurant_submissions").insert({
    submission_type: "contact",
    ...data,
  });
}