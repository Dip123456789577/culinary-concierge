import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";

type Submission = {
  id: string;
  submission_type: string;
  name: string;
  email: string | null;
  phone: string | null;
  reservation_date: string | null;
  reservation_time: string | null;
  guests: number | null;
  message: string | null;
  status: string;
  created_at: string;
};

export const Route = createFileRoute("/_authenticated/submissions")({
  head: () => ({ meta: [{ title: "Restaurant Enquiries | Atelier Salon" }, { name: "description", content: "Review restaurant reservation and contact enquiries." }, { property: "og:title", content: "Restaurant Enquiries | Atelier Salon" }, { property: "og:description", content: "Review restaurant reservation and contact enquiries." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: Submissions,
});

function Submissions() {
  const [rows, setRows] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      const result = await supabase.from("restaurant_submissions").select("*").order("created_at", { ascending: false });
      if (result.error) setError("We couldn't load enquiries. Please try again.");
      else setRows((result.data ?? []) as Submission[]);
      setLoading(false);
    };
    void load();
  }, []);

  const signOut = async () => { await supabase.auth.signOut(); window.location.href = "/auth"; };

  return <main className="min-h-screen bg-background px-5 py-10 text-foreground lg:px-10"><div className="mx-auto max-w-7xl"><div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-6"><div><Link to="/" className="mb-4 inline-flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" /> Back to site</Link><p className="eyebrow">Private workspace</p><h1 className="section-title">Restaurant enquiries</h1></div><Button variant="outline" onClick={signOut}>Sign out <LogOut /></Button></div><div className="mt-8">{loading && <p className="text-sm text-muted-foreground">Loading enquiries…</p>}{error && <p className="text-sm text-destructive">{error}</p>}{!loading && !error && rows.length === 0 && <p className="text-sm text-muted-foreground">No enquiries yet. New concierge requests will appear here.</p>}{rows.length > 0 && <Table><TableHeader><TableRow><TableHead>Type</TableHead><TableHead>Guest</TableHead><TableHead>Contact</TableHead><TableHead>Request</TableHead><TableHead>Received</TableHead></TableRow></TableHeader><TableBody>{rows.map((row) => <TableRow key={row.id}><TableCell className="capitalize">{row.submission_type}</TableCell><TableCell><div className="font-medium">{row.name}</div><div className="text-xs text-muted-foreground">{row.guests ? `${row.guests} guests` : "Contact enquiry"}</div></TableCell><TableCell><div>{row.email ?? "—"}</div><div className="text-xs text-muted-foreground">{row.phone ?? "—"}</div></TableCell><TableCell><div>{row.reservation_date ? `${row.reservation_date} · ${row.reservation_time ?? ""}` : "—"}</div><div className="max-w-xs text-xs text-muted-foreground">{row.message ?? "—"}</div></TableCell><TableCell className="whitespace-nowrap text-xs text-muted-foreground">{new Date(row.created_at).toLocaleString()}</TableCell></TableRow>)}</TableBody></Table>}</div></div></main>;
}