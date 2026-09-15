import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { saveContact, saveReservation } from "@/lib/submissions";
import heroImage from "@/assets/atelier-hero.jpg";
import dishImage from "@/assets/dish-hero.jpg";
import chefImage from "@/assets/chef-portrait.jpg";
import champagneImage from "@/assets/champagne-detail.jpg";
import {
  ArrowUpRight,
  CalendarDays,
  Check,
  ChevronDown,
  Clock3,
  Mail,
  MapPin,
  MessageCircle,
  Minus,
  Phone,
  Plus,
  Send,
  Sparkles,
  X,
} from "lucide-react";

type ChatMessage = { role: "assistant" | "user"; text: string };
type ChatMode = "home" | "reservation" | "contact";

const initialMessages: ChatMessage[] = [
  {
    role: "assistant",
    text: "Welcome to our dining room. I'm your restaurant concierge. How may I assist you today?",
  },
];

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Atelier Salon | London Dining" },
      { name: "description", content: "An intimate London dining experience shaped by exceptional taste, thoughtful hospitality, and timeless elegance." },
      { property: "og:title", content: "Atelier Salon | London Dining" },
      { property: "og:description", content: "Reserve an evening of exceptional taste and timeless hospitality in London." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMode, setChatMode] = useState<ChatMode>("home");
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [chatInput, setChatInput] = useState("");
  const [chatNotice, setChatNotice] = useState("");
  const [submitted, setSubmitted] = useState<"reservation" | "contact" | null>(null);
  const [saving, setSaving] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [reservation, setReservation] = useState({ name: "", email: "", phone: "", date: "", time: "", guests: "2", request: "" });
  const [contact, setContact] = useState({ name: "", email: "", phone: "", message: "" });

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("atelier-concierge-conversation");
      if (saved) setMessages(JSON.parse(saved) as ChatMessage[]);
    } catch {
      // A fresh conversation is a safe fallback when browser storage is unavailable.
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem("atelier-concierge-conversation", JSON.stringify(messages));
    } catch {
      // Conversation persistence is best effort.
    }
  }, [messages]);

  const today = useMemo(() => new Date().toISOString().split("T")[0], []);

  const addMessage = (role: ChatMessage["role"], text: string) => {
    setMessages((current) => [...current, { role, text }]);
  };

  const openChatAction = (mode: ChatMode, label: string) => {
    setChatOpen(true);
    setChatMode(mode);
    setChatNotice("");
    addMessage("user", label);
    if (mode === "reservation") addMessage("assistant", "I can take your request now. Please share the details below; our team will confirm availability personally.");
    if (mode === "contact") addMessage("assistant", "Of course. Leave your details and a note, and the restaurant team will get back to you.");
  };

  const submitReservation = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setChatNotice("");
    const { error } = await saveReservation({
      name: reservation.name,
      email: reservation.email,
      phone: reservation.phone,
      reservation_date: reservation.date,
      reservation_time: reservation.time,
      guests: Number(reservation.guests),
      message: reservation.request,
    });
    setSaving(false);
    if (error) {
      setChatNotice("We couldn't send that request. Please try again or call 7501453838.");
      return;
    }
    setSubmitted("reservation");
    addMessage("assistant", "Your reservation request has reached our team. It is not confirmed yet; we will contact you to confirm availability.");
  };

  const submitContact = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setChatNotice("");
    const { error } = await saveContact(contact);
    setSaving(false);
    if (error) {
      setChatNotice("We couldn't send that message. Please try again or call 7501453838.");
      return;
    }
    setSubmitted("contact");
    addMessage("assistant", "Thank you. Your message is with the restaurant team now, and someone will be in touch soon.");
  };

  const sendChatMessage = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const text = chatInput.trim();
    if (!text) return;
    addMessage("user", text);
    setChatInput("");
    const normalized = text.toLowerCase();
    if (normalized.includes("menu") || normalized.includes("dish")) {
      addMessage("assistant", "Our menu is built around seasonal produce, precise technique, and quiet confidence. Ask us about signature dishes or dietary requirements.");
    } else if (normalized.includes("hour") || normalized.includes("open")) {
      addMessage("assistant", "Opening hours are currently being finalised. Please contact the restaurant directly at 7501453838 before visiting.");
    } else if (normalized.includes("location") || normalized.includes("where")) {
      addMessage("assistant", "We are in England, London. For directions, use the contact options below; we do not publish a precise street address here.");
    } else {
      addMessage("assistant", "I'm here to assist with our menu, reservations, dining experience, events, and restaurant information. How can I help you?");
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="absolute inset-x-0 top-0 z-30 border-b border-primary-foreground/20 text-primary-foreground">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 lg:px-10">
          <a href="#home" className="font-serif text-xl tracking-wide">ATELIER <span className="text-accent">SALON</span></a>
          <nav className="hidden items-center gap-8 text-[10px] font-semibold uppercase tracking-[0.18em] md:flex">
            {[["About", "about"], ["Menu", "menu"], ["Experience", "experience"], ["Contact", "contact"]].map(([label, id]) => <a key={id} href={`#${id}`} className="transition-colors hover:text-accent">{label}</a>)}
          </nav>
          <div className="flex items-center gap-3">
            <Button onClick={() => openChatAction("reservation", "Book a table")} className="hidden border border-accent bg-accent px-5 text-[10px] font-semibold uppercase tracking-[0.16em] text-accent-foreground hover:bg-accent/90 sm:inline-flex">Book a table</Button>
            <Button aria-label="Open navigation" variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground md:hidden" onClick={() => setMobileMenu((value) => !value)}>{mobileMenu ? <X /> : <Plus />}</Button>
          </div>
        </div>
        {mobileMenu && <div className="border-t border-primary-foreground/20 bg-primary px-5 py-5 md:hidden"><div className="grid gap-4 text-xs uppercase tracking-[0.18em]">{["about", "menu", "experience", "contact"].map((id) => <a key={id} href={`#${id}`} onClick={() => setMobileMenu(false)}>{id}</a>)}<Button onClick={() => openChatAction("reservation", "Book a table")} className="mt-2 justify-center bg-accent text-accent-foreground">Book a table</Button></div></div>}
      </header>

      <section id="home" className="relative flex min-h-[700px] items-end overflow-hidden bg-primary pb-16 pt-36 text-primary-foreground lg:min-h-screen lg:pb-24">
        <img src={heroImage} alt="Candlelit dining room at Atelier Salon" className="absolute inset-0 h-full w-full object-cover opacity-70" width="1920" height="1080" />
        <div className="absolute inset-0 bg-primary/65" />
        <div className="relative mx-auto w-full max-w-7xl px-5 lg:px-10"><div className="max-w-4xl">
          <p className="mb-6 text-[10px] font-semibold uppercase tracking-[0.28em] text-accent">London · England · Since today</p>
          <h1 className="max-w-4xl font-serif text-5xl leading-[0.95] tracking-tight sm:text-7xl lg:text-8xl">Where exceptional taste meets timeless elegance.</h1>
          <p className="mt-8 max-w-xl text-sm leading-7 text-primary-foreground/80 sm:text-base">A considered dining room for beautifully prepared food, remarkable ingredients, and genuine hospitality.</p>
          <div className="mt-9 flex flex-wrap gap-3"><Button onClick={() => openChatAction("reservation", "Book a table")} className="bg-accent px-7 text-xs uppercase tracking-[0.16em] text-accent-foreground hover:bg-accent/90">Book a table <ArrowUpRight /></Button><Button asChild variant="outline" className="border-primary-foreground/60 bg-transparent px-7 text-xs uppercase tracking-[0.16em] text-primary-foreground hover:bg-primary-foreground hover:text-primary"><a href="#menu">Explore the menu</a></Button></div>
          <div className="mt-16 grid max-w-2xl grid-cols-3 border-t border-primary-foreground/30 pt-5 text-[10px] uppercase tracking-[0.15em]"><div><span className="mb-2 block text-accent">Location</span>London, England</div><div><span className="mb-2 block text-accent">Open today</span>Hours pending</div><div><span className="mb-2 block text-accent">Reservations</span>By request</div></div>
        </div></div>
      </section>

      <section id="about" className="mx-auto grid max-w-7xl gap-12 px-5 py-24 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:px-10 lg:py-32"><div className="relative"><img src={dishImage} alt="Plated seasonal dish" className="aspect-[4/5] w-full object-cover" width="1200" height="1500" /><span className="absolute -bottom-5 -right-3 bg-accent px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-accent-foreground">The house philosophy</span></div><div className="max-w-xl"><p className="eyebrow">Our story</p><h2 className="section-title">A room for the moments that deserve to linger.</h2><p className="mt-7 leading-8 text-muted-foreground">Atelier Salon is an intimate London dining experience shaped by restraint, warmth, and a deep respect for the ingredient. Every plate is composed with purpose. Every guest is welcomed as if expected.</p><p className="mt-5 leading-8 text-muted-foreground">The name and opening hours are being finalised for launch. Until then, our concierge is here to take your enquiry directly.</p><Button onClick={() => openChatAction("contact", "Contact us")} variant="outline" className="mt-8 uppercase tracking-[0.14em]">Discover the story <ArrowUpRight /></Button></div></section>

      <section id="menu" className="bg-secondary/50 px-5 py-24 lg:px-10 lg:py-32"><div className="mx-auto max-w-7xl"><div className="flex flex-wrap items-end justify-between gap-6"><div><p className="eyebrow">The menu</p><h2 className="section-title">Seasonal, precise, quietly expressive.</h2></div><p className="max-w-sm text-sm leading-7 text-muted-foreground">A short menu that changes with the market, guided by balance rather than spectacle.</p></div><div className="mt-14 grid gap-8 md:grid-cols-3"><MenuItem image={dishImage} label="Signature" title="The Salon Tasting" text="A sequence of considered plates shaped around the best of the season." /><MenuItem image={chefImage} label="Chef's choice" title="The Market Table" text="A generous expression of produce, fire, texture, and time." /><MenuItem image={champagneImage} label="Celebration" title="An Evening, Unhurried" text="Thoughtful pours and small rituals for the moments worth remembering." /></div></div></section>

      <section id="experience" className="grid bg-primary text-primary-foreground lg:grid-cols-2"><div className="flex items-center px-5 py-24 lg:px-16 lg:py-32"><div className="max-w-xl"><p className="eyebrow text-accent">The experience</p><h2 className="section-title">More than a meal. An experience.</h2><p className="mt-7 leading-8 text-primary-foreground/70">From the first pour to the final course, the evening is designed to feel effortless. Come for a celebration, a quiet conversation, or simply the pleasure of eating well.</p><Button onClick={() => openChatAction("reservation", "Plan an evening")} className="mt-9 bg-accent text-accent-foreground hover:bg-accent/90">Plan an evening <ArrowUpRight /></Button></div></div><img src={chefImage} alt="Chef preparing a dish" className="h-full min-h-[420px] w-full object-cover" width="1200" height="1500" /></section>

      <section id="contact" className="mx-auto grid max-w-7xl gap-14 px-5 py-24 lg:grid-cols-[1fr_0.8fr] lg:px-10 lg:py-32"><div><p className="eyebrow">Let's connect</p><h2 className="section-title">Your table, your occasion, your evening.</h2><p className="mt-7 max-w-lg leading-8 text-muted-foreground">For reservations, private dining, celebrations, or any question about the room, speak with our concierge.</p><div className="mt-10 grid gap-5 text-sm"><a href="tel:7501453838" className="flex items-center gap-4 hover:text-accent"><Phone className="size-4 text-accent" />7501453838</a><a href="mailto:diptanshudas920@gmail.com" className="flex items-center gap-4 hover:text-accent"><Mail className="size-4 text-accent" />diptanshudas920@gmail.com</a><span className="flex items-center gap-4"><MapPin className="size-4 text-accent" />England, London</span></div><div className="mt-8 flex flex-wrap gap-3"><Button onClick={() => openChatAction("reservation", "Book a table")} className="bg-primary text-primary-foreground">Book a table</Button><Button onClick={() => openChatAction("contact", "Contact us")} variant="outline">Contact us</Button></div></div><div className="border-t border-border pt-8 lg:border-l lg:border-t-0 lg:pl-12"><p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-accent">Direct lines</p><div className="mt-7 grid gap-6 text-sm"><a href="tel:7501453838" className="flex items-center justify-between border-b border-border pb-4">Call restaurant <ArrowUpRight className="size-4" /></a><a href="https://wa.me/7501453838" target="_blank" rel="noreferrer" className="flex items-center justify-between border-b border-border pb-4">WhatsApp <ArrowUpRight className="size-4" /></a><a href="mailto:diptanshudas920@gmail.com" className="flex items-center justify-between border-b border-border pb-4">Email us <ArrowUpRight className="size-4" /></a></div><div className="mt-10 text-xs leading-6 text-muted-foreground">Instagram · Diptanshu Das<br />Facebook · Diptanshu Das</div></div></section>

      <footer className="bg-primary px-5 py-10 text-primary-foreground lg:px-10"><div className="mx-auto flex max-w-7xl flex-col justify-between gap-6 text-xs text-primary-foreground/70 sm:flex-row sm:items-center"><span className="font-serif text-lg text-primary-foreground">ATELIER <span className="text-accent">SALON</span></span><span>England, London · 7501453838 · diptanshudas920@gmail.com</span><span>© 2026 All Rights Reserved</span></div></footer>

      <Button aria-label="Open restaurant concierge" onClick={() => setChatOpen(true)} className="fixed bottom-5 right-5 z-40 h-14 rounded-full bg-accent px-5 text-accent-foreground shadow-2xl hover:bg-accent/90"><Sparkles /> Concierge</Button>
      {chatOpen && <div className="fixed inset-0 z-50 flex items-end justify-end bg-primary/20 p-0 sm:p-5"><section className="flex h-[min(760px,100vh)] w-full flex-col overflow-hidden border border-accent/30 bg-primary text-primary-foreground shadow-2xl sm:h-[720px] sm:max-w-[450px]" aria-label="Restaurant Concierge"><div className="flex items-start justify-between border-b border-primary-foreground/15 px-5 py-5"><div><div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-accent"><span className="size-2 rounded-full bg-accent" />Online</div><h2 className="mt-2 font-serif text-2xl">Restaurant Concierge</h2><p className="mt-1 text-xs text-primary-foreground/60">Your dining assistant</p></div><Button aria-label="Close concierge" variant="ghost" size="icon" onClick={() => setChatOpen(false)} className="text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"><X /></Button></div><div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">{messages.map((message, index) => <div key={`${message.role}-${index}`} className={message.role === "user" ? "ml-auto max-w-[85%] bg-accent px-4 py-3 text-sm text-accent-foreground" : "max-w-[90%] border border-primary-foreground/15 bg-primary-foreground/10 px-4 py-3 text-sm leading-6 text-primary-foreground"}>{message.text}</div>)}{chatMode === "home" && <div className="grid grid-cols-2 gap-2"><QuickAction icon={<CalendarDays />} label="Book a table" onClick={() => openChatAction("reservation", "Book a table")} /><QuickAction icon={<MessageCircle />} label="Contact us" onClick={() => openChatAction("contact", "Contact us")} /><QuickAction icon={<Sparkles />} label="View menu" onClick={() => { addMessage("user", "View menu"); addMessage("assistant", "Ask us about the Salon Tasting, the Market Table, or an evening composed around the season."); }} /><QuickAction icon={<MapPin />} label="Location" onClick={() => { addMessage("user", "Location"); addMessage("assistant", "England, London. Contact us for directions; we do not publish a precise street address here."); }} /></div>}{chatMode === "reservation" && !submitted && <form onSubmit={submitReservation} className="space-y-3 border-t border-primary-foreground/15 pt-4"><div className="grid grid-cols-2 gap-2"><ChatInput required placeholder="Full name" value={reservation.name} onChange={(event) => setReservation({ ...reservation, name: event.target.value })} /><ChatInput required type="email" placeholder="Email" value={reservation.email} onChange={(event) => setReservation({ ...reservation, email: event.target.value })} /></div><ChatInput required placeholder="Mobile number" value={reservation.phone} onChange={(event) => setReservation({ ...reservation, phone: event.target.value })} /><div className="grid grid-cols-2 gap-2"><ChatInput required type="date" min={today} value={reservation.date} onChange={(event) => setReservation({ ...reservation, date: event.target.value })} /><ChatInput required type="time" value={reservation.time} onChange={(event) => setReservation({ ...reservation, time: event.target.value })} /></div><div className="flex items-center gap-2"><label htmlFor="guests" className="text-xs text-primary-foreground/60">Guests</label><Input id="guests" required min="1" max="20" type="number" value={reservation.guests} onChange={(event) => setReservation({ ...reservation, guests: event.target.value })} className="h-9 border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground" /></div><Textarea placeholder="Special request (optional)" value={reservation.request} onChange={(event) => setReservation({ ...reservation, request: event.target.value })} className="border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground placeholder:text-primary-foreground/40" /><Button disabled={saving} type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90">{saving ? "Sending request…" : "Request a reservation"} <Send /></Button></form>}{chatMode === "contact" && !submitted && <form onSubmit={submitContact} className="space-y-3 border-t border-primary-foreground/15 pt-4"><ChatInput required placeholder="Full name" value={contact.name} onChange={(event) => setContact({ ...contact, name: event.target.value })} /><ChatInput required type="email" placeholder="Email" value={contact.email} onChange={(event) => setContact({ ...contact, email: event.target.value })} /><ChatInput placeholder="Mobile number" value={contact.phone} onChange={(event) => setContact({ ...contact, phone: event.target.value })} /><Textarea required placeholder="How can we help?" value={contact.message} onChange={(event) => setContact({ ...contact, message: event.target.value })} className="border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground placeholder:text-primary-foreground/40" /><Button disabled={saving} type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90">{saving ? "Sending message…" : "Send to the restaurant"} <Send /></Button></form>}{submitted && <div className="border border-accent/50 bg-accent/10 p-4 text-sm leading-6"><Check className="mb-2 size-5 text-accent" /><p>{submitted === "reservation" ? "Request received. It is not confirmed until our team contacts you." : "Message received. Our team will get back to you soon."}</p><Button variant="outline" onClick={() => { setSubmitted(null); setChatMode("home"); }} className="mt-4 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground">Back to concierge</Button></div>}{chatNotice && <p className="text-xs text-destructive-foreground">{chatNotice}</p>}</div><form onSubmit={sendChatMessage} className="flex gap-2 border-t border-primary-foreground/15 p-4"><Input aria-label="Ask the concierge" value={chatInput} onChange={(event) => setChatInput(event.target.value)} placeholder="Ask about dining…" className="border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground placeholder:text-primary-foreground/40" /><Button aria-label="Send message" type="submit" size="icon" className="shrink-0 bg-accent text-accent-foreground hover:bg-accent/90"><Send /></Button></form></section></div>}
    </main>
  );
}

function MenuItem({ image, label, title, text }: { image: string; label: string; title: string; text: string }) {
  return <article className="group"><div className="overflow-hidden"><img src={image} alt={title} className="aspect-[4/3] w-full object-cover transition-transform duration-700 group-hover:scale-105" width="1200" height="900" /></div><div className="border-b border-border py-5"><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-accent">{label}</p><h3 className="mt-2 font-serif text-2xl">{title}</h3><p className="mt-3 text-sm leading-6 text-muted-foreground">{text}</p></div></article>;
}

function QuickAction({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return <Button onClick={onClick} variant="outline" className="h-auto justify-start border-primary-foreground/20 bg-primary-foreground/5 px-3 py-3 text-left text-xs text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground"><span className="text-accent">{icon}</span>{label}</Button>;
}

function ChatInput(props: React.ComponentProps<typeof Input>) {
  return <Input {...props} className="h-9 border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground placeholder:text-primary-foreground/40" />;
}
