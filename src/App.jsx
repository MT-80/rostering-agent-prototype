import { useState, useEffect, useCallback } from "react";

const CLIENTS = [
  { id: 1, name: "Barro Group", sites: [
    { id: "barro-wv", name: "Windham Vale Quarry", address: "450 Greens Rd, Windham Vale VIC 3025", contact: "Jason Barrett", contactPhone: "0412 345 678", induction: "Barro Group Site Induction", parking: "Enter via Gate 3, park in contractor bay", ppe: "Steel caps, hard hat, hi-vis, safety glasses, long sleeves" },
    { id: "barro-bp", name: "Bacchus Marsh Quarry", address: "Western Fwy, Bacchus Marsh VIC 3340", contact: "Tony Russo", contactPhone: "0413 456 789", induction: "Barro Group Site Induction", parking: "Main gate, sign in at office", ppe: "Steel caps, hard hat, hi-vis, safety glasses" }
  ]},
  { id: 2, name: "Boral", sites: [
    { id: "boral-dp", name: "Deer Park Quarry", address: "Western Fwy, Ravenhall VIC 3023", contact: "Steve Mitchell", contactPhone: "0414 567 890", induction: "Boral Site Induction + Deer Park Specific", parking: "Contractor parking off main road, Gate B", ppe: "Steel caps, hard hat, hi-vis, safety glasses, hearing protection" },
    { id: "boral-ly", name: "Lysterfield Quarry", address: "Wellington Rd, Lysterfield VIC 3156", contact: "Mark Thompson", contactPhone: "0415 678 901", induction: "Boral Site Induction", parking: "Follow signs to contractor area", ppe: "Steel caps, hard hat, hi-vis, long sleeves" }
  ]},
  { id: 3, name: "Hanson", sites: [
    { id: "hanson-wn", name: "Wyndham North Plant", address: "100 Industry Rd, Wyndham VIC 3024", contact: "Lisa Chen", contactPhone: "0416 789 012", induction: "Hanson General Induction", parking: "Visitor bay at front office", ppe: "Steel caps, hard hat, hi-vis" }
  ]}
];

const WORKERS = [
  { id: 1, name: "Mick Flanagan", phone: "0421 111 222", role: "Boilermaker", certs: ["White Card","Confined Space","Working at Heights"], sites: ["barro-wv","barro-bp","boral-dp"], available: true },
  { id: 2, name: "Davo Jenkins", phone: "0421 222 333", role: "Boilermaker", certs: ["White Card","Working at Heights"], sites: ["barro-wv","boral-dp","boral-ly"], available: true },
  { id: 3, name: "Shane Cross", phone: "0421 333 444", role: "Fitter", certs: ["White Card","Confined Space","Working at Heights","EWP"], sites: ["barro-wv","barro-bp"], available: true },
  { id: 4, name: "Tom Reilly", phone: "0421 444 555", role: "Boilermaker", certs: ["White Card","Confined Space"], sites: ["barro-wv","boral-dp","hanson-wn"], available: true },
  { id: 5, name: "Jake Moreno", phone: "0421 555 666", role: "Fitter", certs: ["White Card","Working at Heights","EWP"], sites: ["barro-wv","barro-bp","boral-ly"], available: true },
  { id: 6, name: "Ben Cooper", phone: "0421 666 777", role: "Boilermaker", certs: ["White Card","Working at Heights","Confined Space"], sites: ["barro-wv","barro-bp","boral-dp","boral-ly"], available: true },
  { id: 7, name: "Richo Palmer", phone: "0421 777 888", role: "Boilermaker", certs: ["White Card"], sites: ["boral-dp","boral-ly"], available: false },
  { id: 8, name: "Cam Wheeler", phone: "0421 888 999", role: "Fitter", certs: ["White Card","Confined Space","Working at Heights"], sites: ["barro-wv","hanson-wn"], available: true },
  { id: 9, name: "Pete Lawson", phone: "0421 999 000", role: "Boilermaker", certs: ["White Card","Working at Heights","Confined Space","EWP"], sites: ["barro-wv","barro-bp","boral-dp","boral-ly","hanson-wn"], available: true },
  { id: 10, name: "Dan Novak", phone: "0421 000 111", role: "Fitter", certs: ["White Card","Working at Heights"], sites: ["barro-bp","boral-ly","hanson-wn"], available: true },
  { id: 11, name: "Robbo Taylor", phone: "0421 112 223", role: "Boilermaker", certs: ["White Card","Confined Space","Working at Heights"], sites: ["barro-wv","barro-bp"], available: true },
  { id: 12, name: "Chris Ange", phone: "0421 334 445", role: "Fitter", certs: ["White Card","EWP","Confined Space"], sites: ["barro-wv","boral-dp"], available: true },
];

const ROLES = ["Boilermaker", "Fitter", "Electrician", "Rigger", "Plumber", "Labourer"];

const sleep = ms => new Promise(r => setTimeout(r, ms));

export default function RosteringPrototype() {
  const [step, setStep] = useState(0);
  const [client, setClient] = useState(null);
  const [site, setSite] = useState(null);
  const [date, setDate] = useState("2026-03-29");
  const [shiftStart, setShiftStart] = useState("06:00");
  const [shiftEnd, setShiftEnd] = useState("18:00");
  const [roles, setRoles] = useState([{ role: "Boilermaker", qty: 4 }, { role: "Fitter", qty: 2 }]);
  const [matched, setMatched] = useState([]);
  const [smsLog, setSmsLog] = useState([]);
  const [responses, setResponses] = useState({});
  const [allocated, setAllocated] = useState([]);
  const [confirmed, setConfirmed] = useState(false);
  const [clientEmailSent, setClientEmailSent] = useState(false);
  const [iqEmailSent, setIqEmailSent] = useState(false);
  const [simRunning, setSimRunning] = useState(false);

  const selectedClient = CLIENTS.find(c => c.id === client);
  const selectedSite = selectedClient?.sites.find(s => s.id === site);
  const totalNeeded = roles.reduce((s, r) => s + r.qty, 0);

  const doMatch = useCallback(() => {
    const results = [];
    for (const w of WORKERS) {
      if (!w.available) continue;
      const matchesRole = roles.some(r => r.role === w.role);
      if (!matchesRole) continue;
      if (site && !w.sites.includes(site)) continue;
      results.push({ ...w, matchedRole: w.role });
    }
    setMatched(results);
    setSmsLog([]);
    setResponses({});
    setAllocated([]);
    setConfirmed(false);
    setClientEmailSent(false);
    setIqEmailSent(false);
    setStep(2);
  }, [roles, site]);

  const sendSms = useCallback(async () => {
    setSimRunning(true);
    setSmsLog([]);
    for (let i = 0; i < matched.length; i++) {
      await sleep(300);
      setSmsLog(prev => [...prev, { workerId: matched[i].id, name: matched[i].name, phone: matched[i].phone, sent: true, time: new Date().toLocaleTimeString() }]);
    }
    setSimRunning(false);
    setStep(3);
  }, [matched]);

  const simulateResponses = useCallback(async () => {
    setSimRunning(true);
    const shuffled = [...matched].sort(() => Math.random() - 0.5);
    const roleSlots = {};
    for (const r of roles) roleSlots[r.role] = r.qty;
    const newAllocated = [];
    const newResponses = {};

    for (let i = 0; i < shuffled.length; i++) {
      await sleep(600 + Math.random() * 800);
      const w = shuffled[i];
      const saysYes = Math.random() > 0.25;
      if (saysYes && roleSlots[w.matchedRole] > 0) {
        roleSlots[w.matchedRole]--;
        newAllocated.push(w);
        newResponses[w.id] = "allocated";
      } else if (saysYes) {
        newResponses[w.id] = "yes-full";
      } else {
        newResponses[w.id] = "no";
      }
      setResponses({ ...newResponses });
      setAllocated([...newAllocated]);
    }
    setSimRunning(false);
    setStep(4);
  }, [matched, roles]);

  const sendConfirmations = useCallback(async () => {
    setSimRunning(true);
    await sleep(800);
    setConfirmed(true);
    setStep(5);
    setSimRunning(false);
  }, []);

  const sendClientEmail = useCallback(async () => {
    setSimRunning(true);
    await sleep(600);
    setClientEmailSent(true);
    setStep(6);
    setSimRunning(false);
  }, []);

  const sendIqEmail = useCallback(async () => {
    setSimRunning(true);
    await sleep(600);
    setIqEmailSent(true);
    setStep(7);
    setSimRunning(false);
  }, []);

  const addRole = () => setRoles([...roles, { role: "Fitter", qty: 1 }]);
  const removeRole = i => setRoles(roles.filter((_, idx) => idx !== i));
  const updateRole = (i, field, val) => {
    const nr = [...roles];
    nr[i] = { ...nr[i], [field]: field === "qty" ? parseInt(val) || 0 : val };
    setRoles(nr);
  };

  const formatDate = d => {
    const dt = new Date(d + "T00:00:00");
    return dt.toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  };

  const stepLabels = [
    "Client request",
    "Review request",
    "Match workers",
    "SMS & responses",
    "Allocate & confirm",
    "Confirm workers",
    "Email client",
    "Email IQ/ops"
  ];

  const statusColor = s => {
    if (s === "allocated") return "#059669";
    if (s === "no") return "#DC2626";
    if (s === "yes-full") return "#D97706";
    return "#6B7280";
  };
  const statusLabel = s => {
    if (s === "allocated") return "YES - ALLOCATED";
    if (s === "no") return "NO";
    if (s === "yes-full") return "YES - ROSTER FULL";
    return "Waiting...";
  };

  return (
    <div style={{ fontFamily: "'DM Sans', 'Nunito Sans', system-ui, sans-serif", minHeight: "100vh", background: "#0B1120", color: "#E2E8F0" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "24px 20px" }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: "linear-gradient(135deg, #3B82F6, #8B5CF6)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 18, color: "#fff" }}>R</div>
            <div>
              <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#F1F5F9", letterSpacing: "-0.02em" }}>Workforce rostering agent</h1>
              <p style={{ margin: 0, fontSize: 13, color: "#64748B" }}>Interactive prototype</p>
            </div>
          </div>
        </div>

        {/* Step indicator */}
        <div style={{ display: "flex", gap: 4, marginBottom: 32, overflowX: "auto", paddingBottom: 4 }}>
          {stepLabels.map((label, i) => (
            <div key={i} style={{
              flex: "0 0 auto",
              padding: "6px 14px",
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 600,
              background: i === step ? "linear-gradient(135deg, #3B82F6, #8B5CF6)" : i < step ? "#1E293B" : "transparent",
              color: i === step ? "#fff" : i < step ? "#3B82F6" : "#475569",
              border: i < step ? "1px solid #1E3A5F" : i === step ? "none" : "1px solid #1E293B",
              transition: "all 0.3s ease",
              whiteSpace: "nowrap",
              cursor: i < step ? "pointer" : "default"
            }} onClick={() => { if (i < step) setStep(i); }}>
              {label}
            </div>
          ))}
        </div>

        {/* STEP 0: Client Request Form */}
        {step === 0 && (
          <div style={{ animation: "fadeIn 0.3s ease" }}>
            <div style={{ background: "#111827", border: "1px solid #1E293B", borderRadius: 16, padding: 28 }}>
              <h2 style={{ margin: "0 0 20px", fontSize: 18, fontWeight: 600, color: "#F1F5F9" }}>New staffing request</h2>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#94A3B8", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>Client</label>
                  <select value={client || ""} onChange={e => { setClient(parseInt(e.target.value)); setSite(null); }}
                    style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #334155", background: "#0F172A", color: "#E2E8F0", fontSize: 14, outline: "none" }}>
                    <option value="">Select client...</option>
                    {CLIENTS.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#94A3B8", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>Site</label>
                  <select value={site || ""} onChange={e => setSite(e.target.value)}
                    style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #334155", background: "#0F172A", color: "#E2E8F0", fontSize: 14, outline: "none" }}>
                    <option value="">Select site...</option>
                    {selectedClient?.sites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 20 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#94A3B8", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>Date</label>
                  <input type="date" value={date} onChange={e => setDate(e.target.value)}
                    style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #334155", background: "#0F172A", color: "#E2E8F0", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#94A3B8", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>Shift start</label>
                  <input type="time" value={shiftStart} onChange={e => setShiftStart(e.target.value)}
                    style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #334155", background: "#0F172A", color: "#E2E8F0", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#94A3B8", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>Shift end</label>
                  <input type="time" value={shiftEnd} onChange={e => setShiftEnd(e.target.value)}
                    style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #334155", background: "#0F172A", color: "#E2E8F0", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
                </div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.05em" }}>Roles required</label>
                  <button onClick={addRole} style={{ padding: "4px 12px", borderRadius: 6, border: "1px solid #334155", background: "transparent", color: "#3B82F6", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>+ Add role</button>
                </div>
                {roles.map((r, i) => (
                  <div key={i} style={{ display: "flex", gap: 12, marginBottom: 8, alignItems: "center" }}>
                    <select value={r.role} onChange={e => updateRole(i, "role", e.target.value)}
                      style={{ flex: 1, padding: "8px 12px", borderRadius: 8, border: "1px solid #334155", background: "#0F172A", color: "#E2E8F0", fontSize: 14, outline: "none" }}>
                      {ROLES.map(ro => <option key={ro} value={ro}>{ro}</option>)}
                    </select>
                    <input type="number" min="1" max="20" value={r.qty} onChange={e => updateRole(i, "qty", e.target.value)}
                      style={{ width: 70, padding: "8px 12px", borderRadius: 8, border: "1px solid #334155", background: "#0F172A", color: "#E2E8F0", fontSize: 14, textAlign: "center", outline: "none" }} />
                    <span style={{ fontSize: 12, color: "#64748B", minWidth: 40 }}>staff</span>
                    {roles.length > 1 && <button onClick={() => removeRole(i)} style={{ padding: "4px 8px", borderRadius: 6, border: "none", background: "#7F1D1D", color: "#FCA5A5", fontSize: 12, cursor: "pointer" }}>x</button>}
                  </div>
                ))}
              </div>

              <button onClick={() => setStep(1)} disabled={!client || !site || !date}
                style={{ width: "100%", padding: "12px 20px", borderRadius: 10, border: "none", background: (!client || !site || !date) ? "#1E293B" : "linear-gradient(135deg, #3B82F6, #8B5CF6)", color: (!client || !site || !date) ? "#475569" : "#fff", fontSize: 15, fontWeight: 600, cursor: (!client || !site || !date) ? "default" : "pointer", transition: "all 0.2s" }}>
                Submit request
              </button>
            </div>
          </div>
        )}

        {/* STEP 1: Review */}
        {step === 1 && (
          <div style={{ animation: "fadeIn 0.3s ease" }}>
            <div style={{ background: "#111827", border: "1px solid #1E293B", borderRadius: 16, padding: 28, marginBottom: 16 }}>
              <h2 style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 600, color: "#F1F5F9" }}>Request summary</h2>
              <p style={{ margin: "0 0 20px", fontSize: 13, color: "#64748B" }}>Review before matching workers</p>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, background: "#1E293B", borderRadius: 12, overflow: "hidden", marginBottom: 20 }}>
                {[
                  ["Client", selectedClient?.name],
                  ["Site", selectedSite?.name],
                  ["Date", formatDate(date)],
                  ["Shift", `${shiftStart} - ${shiftEnd}`],
                  ["Site contact", `${selectedSite?.contact} (${selectedSite?.contactPhone})`],
                  ["Total staff", `${totalNeeded} workers`],
                ].map(([k,v], i) => (
                  <div key={i} style={{ padding: "12px 16px", background: "#0F172A" }}>
                    <div style={{ fontSize: 11, color: "#64748B", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 2 }}>{k}</div>
                    <div style={{ fontSize: 14, color: "#E2E8F0", fontWeight: 500 }}>{v}</div>
                  </div>
                ))}
              </div>

              <div style={{ background: "#0F172A", borderRadius: 10, padding: 14, marginBottom: 20 }}>
                <div style={{ fontSize: 11, color: "#64748B", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>Roles breakdown</div>
                <div style={{ display: "flex", gap: 8 }}>
                  {roles.map((r, i) => (
                    <div key={i} style={{ padding: "6px 14px", borderRadius: 8, background: "#1E293B", border: "1px solid #334155" }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: "#3B82F6" }}>{r.qty}x </span>
                      <span style={{ fontSize: 14, color: "#E2E8F0" }}>{r.role}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: "flex", gap: 12 }}>
                <button onClick={() => setStep(0)} style={{ flex: 1, padding: "12px 20px", borderRadius: 10, border: "1px solid #334155", background: "transparent", color: "#94A3B8", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Edit request</button>
                <button onClick={doMatch} style={{ flex: 2, padding: "12px 20px", borderRadius: 10, border: "none", background: "linear-gradient(135deg, #3B82F6, #8B5CF6)", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Find matching workers</button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Matched workers */}
        {step === 2 && (
          <div style={{ animation: "fadeIn 0.3s ease" }}>
            <div style={{ background: "#111827", border: "1px solid #1E293B", borderRadius: 16, padding: 28, marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <div>
                  <h2 style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 600, color: "#F1F5F9" }}>Matched workers</h2>
                  <p style={{ margin: 0, fontSize: 13, color: "#64748B" }}>Filtered by role, certifications, site induction, and availability</p>
                </div>
                <div style={{ padding: "6px 16px", borderRadius: 20, background: matched.length >= totalNeeded ? "#052E16" : "#7F1D1D", border: `1px solid ${matched.length >= totalNeeded ? "#166534" : "#991B1B"}`, fontSize: 13, fontWeight: 600, color: matched.length >= totalNeeded ? "#4ADE80" : "#FCA5A5" }}>
                  {matched.length} matched / {totalNeeded} needed
                </div>
              </div>

              <div style={{ borderRadius: 12, overflow: "hidden", border: "1px solid #1E293B" }}>
                <div style={{ display: "grid", gridTemplateColumns: "2fr 1.5fr 2fr 1.5fr", gap: 0, padding: "10px 16px", background: "#1E293B" }}>
                  {["Name", "Role", "Certifications", "Site induction"].map(h => (
                    <div key={h} style={{ fontSize: 11, fontWeight: 600, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</div>
                  ))}
                </div>
                {matched.map((w, i) => (
                  <div key={w.id} style={{ display: "grid", gridTemplateColumns: "2fr 1.5fr 2fr 1.5fr", gap: 0, padding: "10px 16px", background: i % 2 === 0 ? "#0F172A" : "#111827", borderTop: "1px solid #1E293B" }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 500, color: "#E2E8F0" }}>{w.name}</div>
                      <div style={{ fontSize: 12, color: "#64748B" }}>{w.phone}</div>
                    </div>
                    <div style={{ fontSize: 13, color: "#93C5FD", fontWeight: 500, display: "flex", alignItems: "center" }}>{w.role}</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4, alignItems: "center" }}>
                      {w.certs.map(c => (
                        <span key={c} style={{ padding: "2px 8px", borderRadius: 4, background: "#1E293B", fontSize: 11, color: "#94A3B8" }}>{c}</span>
                      ))}
                    </div>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <span style={{ padding: "3px 10px", borderRadius: 4, background: "#052E16", border: "1px solid #166534", fontSize: 11, color: "#4ADE80", fontWeight: 500 }}>Inducted</span>
                    </div>
                  </div>
                ))}
              </div>

              <button onClick={sendSms} disabled={simRunning || matched.length === 0}
                style={{ width: "100%", marginTop: 20, padding: "12px 20px", borderRadius: 10, border: "none", background: "linear-gradient(135deg, #3B82F6, #8B5CF6)", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
                Send SMS to all {matched.length} workers
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: SMS sent + responses */}
        {step === 3 && (
          <div style={{ animation: "fadeIn 0.3s ease" }}>
            <div style={{ background: "#111827", border: "1px solid #1E293B", borderRadius: 16, padding: 28, marginBottom: 16 }}>
              <h2 style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 600, color: "#F1F5F9" }}>SMS sent. Waiting for responses.</h2>
              <p style={{ margin: "0 0 20px", fontSize: 13, color: "#64748B" }}>Workers receive a link to a simple YES/NO form. First in, best dressed.</p>

              {/* SMS preview */}
              <div style={{ background: "#0F172A", borderRadius: 12, padding: 16, marginBottom: 20, border: "1px solid #1E293B" }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>SMS preview</div>
                <div style={{ background: "#1E293B", borderRadius: 10, padding: 14, fontSize: 13, color: "#CBD5E1", lineHeight: 1.6, fontFamily: "monospace" }}>
                  Hi [Name], shift available: {selectedClient?.name} {selectedSite?.name}, {formatDate(date)}, {shiftStart}-{shiftEnd}. [Role] work. Tap to accept or decline: <span style={{ color: "#3B82F6", textDecoration: "underline" }}>https://roster.iq/f/abc123</span>
                </div>
              </div>

              <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                <div style={{ flex: 1, padding: "10px 14px", borderRadius: 10, background: "#0F172A", textAlign: "center" }}>
                  <div style={{ fontSize: 22, fontWeight: 700, color: "#3B82F6" }}>{smsLog.length}</div>
                  <div style={{ fontSize: 11, color: "#64748B", fontWeight: 600 }}>SMS SENT</div>
                </div>
                <div style={{ flex: 1, padding: "10px 14px", borderRadius: 10, background: "#0F172A", textAlign: "center" }}>
                  <div style={{ fontSize: 22, fontWeight: 700, color: "#4ADE80" }}>{Object.values(responses).filter(r => r === "allocated").length}</div>
                  <div style={{ fontSize: 11, color: "#64748B", fontWeight: 600 }}>ALLOCATED</div>
                </div>
                <div style={{ flex: 1, padding: "10px 14px", borderRadius: 10, background: "#0F172A", textAlign: "center" }}>
                  <div style={{ fontSize: 22, fontWeight: 700, color: "#F1F5F9" }}>{totalNeeded - Object.values(responses).filter(r => r === "allocated").length}</div>
                  <div style={{ fontSize: 11, color: "#64748B", fontWeight: 600 }}>REMAINING</div>
                </div>
              </div>

              {/* Response list */}
              {matched.map(w => (
                <div key={w.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", borderBottom: "1px solid #1E293B" }}>
                  <div>
                    <span style={{ fontSize: 14, fontWeight: 500, color: "#E2E8F0" }}>{w.name}</span>
                    <span style={{ fontSize: 12, color: "#64748B", marginLeft: 8 }}>{w.role}</span>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 600, color: statusColor(responses[w.id]), padding: "3px 10px", borderRadius: 6, background: responses[w.id] ? `${statusColor(responses[w.id])}15` : "#1E293B" }}>
                    {statusLabel(responses[w.id])}
                  </span>
                </div>
              ))}

              <button onClick={simulateResponses} disabled={simRunning}
                style={{ width: "100%", marginTop: 20, padding: "12px 20px", borderRadius: 10, border: "none", background: simRunning ? "#1E293B" : "linear-gradient(135deg, #3B82F6, #8B5CF6)", color: simRunning ? "#475569" : "#fff", fontSize: 14, fontWeight: 600, cursor: simRunning ? "default" : "pointer" }}>
                {simRunning ? "Simulating responses..." : "Simulate worker responses"}
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Allocation result */}
        {step === 4 && (
          <div style={{ animation: "fadeIn 0.3s ease" }}>
            <div style={{ background: "#111827", border: "1px solid #1E293B", borderRadius: 16, padding: 28, marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: "#F1F5F9" }}>Roster allocated</h2>
                <div style={{ padding: "6px 16px", borderRadius: 20, background: allocated.length >= totalNeeded ? "#052E16" : "#7F1D1D", border: `1px solid ${allocated.length >= totalNeeded ? "#166534" : "#991B1B"}`, fontSize: 13, fontWeight: 600, color: allocated.length >= totalNeeded ? "#4ADE80" : "#FCA5A5" }}>
                  {allocated.length} / {totalNeeded} filled
                </div>
              </div>

              {roles.map(r => {
                const roleWorkers = allocated.filter(w => w.matchedRole === r.role);
                return (
                  <div key={r.role} style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "#94A3B8", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>{r.role} ({roleWorkers.length}/{r.qty})</div>
                    {roleWorkers.map(w => (
                      <div key={w.id} style={{ display: "flex", justifyContent: "space-between", padding: "10px 14px", background: "#0F172A", borderRadius: 8, marginBottom: 4, alignItems: "center" }}>
                        <div>
                          <span style={{ fontSize: 14, fontWeight: 500, color: "#E2E8F0" }}>{w.name}</span>
                          <span style={{ fontSize: 12, color: "#64748B", marginLeft: 8 }}>{w.phone}</span>
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 600, color: "#4ADE80" }}>ALLOCATED</span>
                      </div>
                    ))}
                    {roleWorkers.length < r.qty && (
                      <div style={{ padding: "10px 14px", background: "#1C1117", borderRadius: 8, marginBottom: 4, border: "1px dashed #991B1B" }}>
                        <span style={{ fontSize: 13, color: "#FCA5A5" }}>{r.qty - roleWorkers.length} position(s) unfilled - requires human escalation</span>
                      </div>
                    )}
                  </div>
                );
              })}

              <button onClick={sendConfirmations} disabled={simRunning}
                style={{ width: "100%", marginTop: 12, padding: "12px 20px", borderRadius: 10, border: "none", background: "linear-gradient(135deg, #3B82F6, #8B5CF6)", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
                Send confirmation SMS to allocated workers
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: Worker confirmations sent */}
        {step === 5 && (
          <div style={{ animation: "fadeIn 0.3s ease" }}>
            <div style={{ background: "#111827", border: "1px solid #1E293B", borderRadius: 16, padding: 28, marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#052E16", border: "2px solid #166534", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>
                  <span style={{ color: "#4ADE80" }}>&#10003;</span>
                </div>
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: "#F1F5F9" }}>Confirmation SMS sent to all allocated workers</h2>
              </div>

              <div style={{ background: "#0F172A", borderRadius: 12, padding: 16, marginBottom: 20, border: "1px solid #1E293B" }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>Confirmation SMS preview</div>
                <div style={{ background: "#1E293B", borderRadius: 10, padding: 14, fontSize: 13, color: "#CBD5E1", lineHeight: 1.7, fontFamily: "monospace" }}>
                  <p style={{ margin: "0 0 8px" }}>Hi [Name], you are CONFIRMED for:</p>
                  <p style={{ margin: "0 0 4px" }}>{selectedClient?.name} - {selectedSite?.name}</p>
                  <p style={{ margin: "0 0 4px" }}>{formatDate(date)}, {shiftStart} - {shiftEnd}</p>
                  <p style={{ margin: "0 0 4px" }}>Role: [Boilermaker/Fitter]</p>
                  <p style={{ margin: "0 0 4px" }}>Site manager: {selectedSite?.contact} ({selectedSite?.contactPhone})</p>
                  <p style={{ margin: "0 0 4px" }}>Address: {selectedSite?.address}</p>
                  <p style={{ margin: "0 0 4px" }}>Parking: {selectedSite?.parking}</p>
                  <p style={{ margin: "0 0 4px" }}>PPE: {selectedSite?.ppe}</p>
                  <p style={{ margin: "0 0 4px" }}>Induction: {selectedSite?.induction}</p>
                  <p style={{ margin: "8px 0 0" }}>Add to calendar: <span style={{ color: "#3B82F6", textDecoration: "underline" }}>https://roster.iq/cal/xyz</span></p>
                </div>
              </div>

              {allocated.map(w => (
                <div key={w.id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 14px", borderBottom: "1px solid #1E293B", alignItems: "center" }}>
                  <div>
                    <span style={{ fontSize: 14, fontWeight: 500, color: "#E2E8F0" }}>{w.name}</span>
                    <span style={{ fontSize: 12, color: "#64748B", marginLeft: 8 }}>{w.role}</span>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#4ADE80" }}>SMS SENT</span>
                </div>
              ))}

              <button onClick={sendClientEmail}
                style={{ width: "100%", marginTop: 20, padding: "12px 20px", borderRadius: 10, border: "none", background: "linear-gradient(135deg, #3B82F6, #8B5CF6)", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
                Send confirmation email to client
              </button>
            </div>
          </div>
        )}

        {/* STEP 6: Client email */}
        {step === 6 && (
          <div style={{ animation: "fadeIn 0.3s ease" }}>
            <div style={{ background: "#111827", border: "1px solid #1E293B", borderRadius: 16, padding: 28, marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#052E16", border: "2px solid #166534", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>
                  <span style={{ color: "#4ADE80" }}>&#10003;</span>
                </div>
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: "#F1F5F9" }}>Confirmation email sent to {selectedClient?.name}</h2>
              </div>

              <div style={{ background: "#0F172A", borderRadius: 12, border: "1px solid #1E293B", overflow: "hidden" }}>
                <div style={{ padding: "12px 16px", background: "#1E293B", borderBottom: "1px solid #334155" }}>
                  <div style={{ fontSize: 11, color: "#64748B", fontWeight: 600 }}>TO: {selectedSite?.contact} &lt;{selectedSite?.contact.toLowerCase().replace(" ",".")}@{selectedClient?.name.toLowerCase().replace(" ","")}.com.au&gt;</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#E2E8F0", marginTop: 4 }}>Staffing Confirmation: {selectedSite?.name} - {formatDate(date)}</div>
                </div>
                <div style={{ padding: 16, fontSize: 13, color: "#CBD5E1", lineHeight: 1.7 }}>
                  <p style={{ margin: "0 0 12px" }}>Hi {selectedSite?.contact.split(" ")[0]},</p>
                  <p style={{ margin: "0 0 12px" }}>Please find below the confirmed roster for your staffing request at {selectedSite?.name} on {formatDate(date)}, {shiftStart} to {shiftEnd}.</p>

                  <div style={{ borderRadius: 8, overflow: "hidden", border: "1px solid #334155", marginBottom: 12 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "2fr 1.5fr 2fr", padding: "8px 12px", background: "#1E293B" }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: "#64748B" }}>NAME</div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: "#64748B" }}>ROLE</div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: "#64748B" }}>QUALIFICATIONS</div>
                    </div>
                    {allocated.map((w, i) => (
                      <div key={w.id} style={{ display: "grid", gridTemplateColumns: "2fr 1.5fr 2fr", padding: "8px 12px", background: i % 2 === 0 ? "#0F172A" : "#111827", borderTop: "1px solid #1E293B" }}>
                        <div style={{ fontSize: 13, color: "#E2E8F0" }}>{w.name}</div>
                        <div style={{ fontSize: 13, color: "#93C5FD" }}>{w.role}</div>
                        <div style={{ fontSize: 12, color: "#94A3B8" }}>{w.certs.join(", ")}</div>
                      </div>
                    ))}
                  </div>

                  <p style={{ margin: "0 0 8px" }}><strong style={{ color: "#E2E8F0" }}>Positions filled:</strong> {allocated.length} of {totalNeeded}</p>
                  {allocated.length < totalNeeded && <p style={{ margin: "0 0 8px", color: "#FCA5A5" }}>{totalNeeded - allocated.length} position(s) remain unfilled. Our team is working on this and will provide an update.</p>}
                  <p style={{ margin: "12px 0 0" }}>If you have any questions or changes, please contact us on 03 9XXX XXXX.</p>
                  <p style={{ margin: "8px 0 0", color: "#64748B" }}>IQ Maintenance Services</p>
                </div>
              </div>

              <button onClick={sendIqEmail}
                style={{ width: "100%", marginTop: 20, padding: "12px 20px", borderRadius: 10, border: "none", background: "linear-gradient(135deg, #3B82F6, #8B5CF6)", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
                Send confirmation email to IQ / ops team
              </button>
            </div>
          </div>
        )}

        {/* STEP 7: IQ email */}
        {step === 7 && (
          <div style={{ animation: "fadeIn 0.3s ease" }}>
            <div style={{ background: "#111827", border: "1px solid #1E293B", borderRadius: 16, padding: 28, marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#052E16", border: "2px solid #166534", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>
                  <span style={{ color: "#4ADE80" }}>&#10003;</span>
                </div>
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: "#F1F5F9" }}>Confirmation email sent to IQ Maintenance ops team</h2>
              </div>

              <div style={{ background: "#0F172A", borderRadius: 12, border: "1px solid #1E293B", overflow: "hidden" }}>
                <div style={{ padding: "12px 16px", background: "#1E293B", borderBottom: "1px solid #334155" }}>
                  <div style={{ fontSize: 11, color: "#64748B", fontWeight: 600 }}>TO: IQ Maintenance Operations &lt;ops@iqmaintenance.com.au&gt;</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#E2E8F0", marginTop: 4 }}>Roster Confirmed: {selectedClient?.name} {selectedSite?.name} - {formatDate(date)}</div>
                </div>
                <div style={{ padding: 16, fontSize: 13, color: "#CBD5E1", lineHeight: 1.7 }}>
                  <p style={{ margin: "0 0 16px", fontWeight: 600, color: "#E2E8F0" }}>Internal roster confirmation</p>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, background: "#1E293B", borderRadius: 8, overflow: "hidden", marginBottom: 16 }}>
                    {[
                      ["Client", selectedClient?.name],
                      ["Site", selectedSite?.name],
                      ["Date", formatDate(date)],
                      ["Shift", `${shiftStart} - ${shiftEnd}`],
                      ["Site contact", `${selectedSite?.contact} (${selectedSite?.contactPhone})`],
                      ["Filled", `${allocated.length} of ${totalNeeded}`],
                    ].map(([k,v], i) => (
                      <div key={i} style={{ padding: "8px 12px", background: "#0F172A" }}>
                        <div style={{ fontSize: 10, color: "#64748B", fontWeight: 600, textTransform: "uppercase" }}>{k}</div>
                        <div style={{ fontSize: 13, color: "#E2E8F0", fontWeight: 500 }}>{v}</div>
                      </div>
                    ))}
                  </div>

                  <div style={{ borderRadius: 8, overflow: "hidden", border: "1px solid #334155", marginBottom: 16 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1.5fr 1.5fr", padding: "8px 12px", background: "#1E293B" }}>
                      {["NAME", "ROLE", "PHONE", "CERTS"].map(h => (
                        <div key={h} style={{ fontSize: 10, fontWeight: 600, color: "#64748B" }}>{h}</div>
                      ))}
                    </div>
                    {allocated.map((w, i) => (
                      <div key={w.id} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1.5fr 1.5fr", padding: "8px 12px", background: i % 2 === 0 ? "#0F172A" : "#111827", borderTop: "1px solid #1E293B" }}>
                        <div style={{ fontSize: 13, color: "#E2E8F0" }}>{w.name}</div>
                        <div style={{ fontSize: 13, color: "#93C5FD" }}>{w.role}</div>
                        <div style={{ fontSize: 12, color: "#94A3B8" }}>{w.phone}</div>
                        <div style={{ fontSize: 11, color: "#94A3B8" }}>{w.certs.join(", ")}</div>
                      </div>
                    ))}
                  </div>

                  {allocated.length < totalNeeded && (
                    <div style={{ padding: 12, borderRadius: 8, background: "#1C1117", border: "1px solid #991B1B", marginBottom: 12 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "#FCA5A5" }}>UNFILLED POSITIONS: {totalNeeded - allocated.length}</div>
                      <div style={{ fontSize: 12, color: "#FCA5A5", marginTop: 4 }}>{matched.length} workers were contacted. {Object.values(responses).filter(r => r === "no").length} declined. {matched.length - Object.keys(responses).length} did not respond. Manual follow-up required.</div>
                    </div>
                  )}

                  <div style={{ padding: 12, borderRadius: 8, background: "#0F172A", border: "1px solid #1E293B" }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: "#64748B", textTransform: "uppercase", marginBottom: 6 }}>Financial summary (estimate)</div>
                    <div style={{ fontSize: 13, color: "#E2E8F0" }}>
                      Worker cost: {allocated.length} x 12hrs x $65/hr = <strong>${(allocated.length * 12 * 65).toLocaleString()}</strong>
                    </div>
                    <div style={{ fontSize: 13, color: "#E2E8F0" }}>
                      Client charge: {allocated.length} x 12hrs x $95/hr = <strong>${(allocated.length * 12 * 95).toLocaleString()}</strong>
                    </div>
                    <div style={{ fontSize: 13, color: "#4ADE80", fontWeight: 600, marginTop: 4 }}>
                      Estimated margin: ${((allocated.length * 12 * 95) - (allocated.length * 12 * 65)).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: 24, padding: 20, background: "#052E16", border: "1px solid #166534", borderRadius: 12, textAlign: "center" }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: "#4ADE80", marginBottom: 4 }}>Roster complete</div>
                <div style={{ fontSize: 13, color: "#86EFAC" }}>Workers confirmed. Client notified. IQ ops notified. Job is locked in.</div>
              </div>

              <button onClick={() => { setStep(0); setClient(null); setSite(null); setRoles([{role:"Boilermaker",qty:4},{role:"Fitter",qty:2}]); setMatched([]); setSmsLog([]); setResponses({}); setAllocated([]); setConfirmed(false); setClientEmailSent(false); setIqEmailSent(false); }}
                style={{ width: "100%", marginTop: 16, padding: "12px 20px", borderRadius: 10, border: "1px solid #334155", background: "transparent", color: "#94A3B8", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
                Start new roster request
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        select, input { font-family: 'DM Sans', system-ui, sans-serif; }
        select:focus, input:focus { border-color: #3B82F6 !important; }
        button:hover { opacity: 0.92; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #334155; border-radius: 3px; }
      `}</style>
    </div>
  );
}
