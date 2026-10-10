import React, { useCallback, useEffect, useState } from 'react';
import { api, ApiError } from '../lib/api';
import { PageId } from '../types';

type Json = Record<string, any>;
const WORKFLOW = ['draft', 'content-review', 'visual-review', 'approved', 'published'];
const LABEL: Record<string, string> = { draft: 'Draft', 'content-review': 'Tinjau Konten', 'visual-review': 'Tinjau Visual', approved: 'Disetujui', published: 'Published', archived: 'Diarsipkan' };

const inputCls = 'w-full border border-[#E7E0D4] rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#9d422a]/30';
const btn = 'text-xs font-semibold px-3 py-2 rounded-lg cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed';
const btnPrimary = `${btn} bg-[#0e2444] text-white hover:bg-[#1D2E49]`;
const btnAccent = `${btn} bg-[#9d422a] text-white hover:bg-[#b54f35]`;
const btnGhost = `${btn} border border-[#E7E0D4] bg-white text-[#0e2444] hover:bg-[#F3EFE7]`;

const Section: React.FC<{ title: string; children: React.ReactNode; testId?: string }> = ({ title, children, testId }) => (
  <section className="bg-white border border-[#E7E0D4] rounded-2xl p-5 mb-5" data-testid={testId}>
    <h3 className="text-sm font-extrabold text-[#0e2444] mb-3">{title}</h3>
    {children}
  </section>
);

export const AdminPage: React.FC<{ onNavigate: (p: PageId, id?: string) => void }> = ({ onNavigate }) => {
  const [me, setMe] = useState<Json | null | undefined>(undefined);
  useEffect(() => {
    api('/api/admin/me').then(setMe).catch(() => setMe(null));
  }, []);

  if (me === undefined) return <div className="pt-32 text-center text-[#667483]">Memeriksa sesi…</div>;
  if (!me) return <Login onDone={setMe} />;
  return <Dashboard me={me} onLogout={async () => { await api('/api/admin/logout', { method: 'POST', json: {} }); setMe(null); }} onNavigate={onNavigate} />;
};

const Login: React.FC<{ onDone: (m: Json) => void }> = ({ onDone }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setErr('');
    try {
      await api('/api/admin/login', { method: 'POST', json: { email, password } });
      onDone(await api('/api/admin/me'));
    } catch (x) { setErr((x as Error).message); } finally { setBusy(false); }
  };
  return (
    <div className="min-h-screen pt-32 px-4">
      <form onSubmit={submit} className="max-w-sm mx-auto bg-white border border-[#E7E0D4] rounded-2xl p-6 shadow-sm" data-testid="login-form">
        <h1 className="text-xl font-extrabold text-[#0e2444] mb-1">Masuk Admin NGM</h1>
        <p className="text-xs text-[#667483] mb-4">Hanya untuk kurator/admin. Pembaca publik tidak memerlukan akun.</p>
        <label className="block text-xs font-semibold text-[#344454] mb-1" htmlFor="email">Email</label>
        <input id="email" type="email" required autoComplete="username" className={`${inputCls} mb-3`} value={email} onChange={(e) => setEmail(e.target.value)} />
        <label className="block text-xs font-semibold text-[#344454] mb-1" htmlFor="password">Kata sandi</label>
        <input id="password" type="password" required autoComplete="current-password" className={`${inputCls} mb-3`} value={password} onChange={(e) => setPassword(e.target.value)} />
        {err && <div role="alert" className="text-xs text-[#9d422a] font-semibold mb-3" data-testid="login-error">{err}</div>}
        <button disabled={busy} className={`${btnPrimary} w-full py-2.5`}>{busy ? 'Memproses…' : 'Masuk'}</button>
      </form>
    </div>
  );
};

type Tab = 'stories' | 'sources' | 'pixel' | 'analytics';

const Dashboard: React.FC<{ me: Json; onLogout: () => void; onNavigate: (p: PageId, id?: string) => void }> = ({ me, onLogout, onNavigate }) => {
  const [tab, setTab] = useState<Tab>('stories');
  const [selected, setSelected] = useState<string | null>(null);
  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6" data-testid="admin-dashboard">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div>
            <h1 className="text-2xl font-extrabold text-[#0e2444]">CMS NGM</h1>
            <div className="text-xs text-[#667483]">Masuk sebagai {me.email} • Visual AI: {me.aiConfigured ? 'terkonfigurasi' : 'belum dikonfigurasi (GEMINI_API_KEY)'}</div>
          </div>
          <div className="flex gap-2">
            <button className={btnGhost} onClick={() => onNavigate('beranda')}>Situs publik</button>
            <button className={btnGhost} onClick={onLogout} data-testid="logout">Keluar</button>
          </div>
        </div>
        <div className="flex gap-1 mb-5 border-b border-[#E7E0D4]">
          {([['stories', 'Cerita'], ['sources', 'Sumber'], ['pixel', 'Aset 2D'], ['analytics', 'Analitik']] as [Tab, string][]).map(([k, l]) => (
            <button key={k} onClick={() => { setTab(k); setSelected(null); }} data-testid={`tab-${k}`} className={`px-4 py-2 text-sm font-semibold cursor-pointer border-b-2 -mb-px ${tab === k ? 'border-[#9d422a] text-[#9d422a]' : 'border-transparent text-[#667483]'}`}>{l}</button>
          ))}
        </div>
        {tab === 'stories' && (selected ? <StoryEditor id={selected} onBack={() => setSelected(null)} /> : <StoryList onOpen={setSelected} />)}
        {tab === 'sources' && <SourcesTab />}
        {tab === 'pixel' && <PixelTab />}
        {tab === 'analytics' && <AnalyticsTab />}
      </div>
    </div>
  );
};

// ---------------- stories list ----------------
const StoryList: React.FC<{ onOpen: (id: string) => void }> = ({ onOpen }) => {
  const [rows, setRows] = useState<Json[] | null>(null);
  const [err, setErr] = useState('');
  const [title, setTitle] = useState('');
  const [regionKey, setRegionKey] = useState('jawa');
  const load = useCallback(() => api<Json[]>('/api/admin/stories').then(setRows).catch((e) => setErr(e.message)), []);
  useEffect(() => { load(); }, [load]);
  const create = async (e: React.FormEvent) => {
    e.preventDefault(); setErr('');
    try { const d = await api<Json>('/api/admin/stories', { method: 'POST', json: { title, regionKey, summary: '' } }); setTitle(''); onOpen(d.story.id); } catch (x) { setErr((x as Error).message); }
  };
  return (
    <div>
      <Section title="Cerita baru">
        <form onSubmit={create} className="flex flex-wrap gap-2 items-end">
          <div className="flex-1 min-w-[200px]"><label className="text-xs font-semibold block mb-1" htmlFor="new-title">Judul</label><input id="new-title" className={inputCls} value={title} onChange={(e) => setTitle(e.target.value)} required /></div>
          <div><label className="text-xs font-semibold block mb-1" htmlFor="new-region">Wilayah</label>
            <select id="new-region" className={inputCls} value={regionKey} onChange={(e) => setRegionKey(e.target.value)}>
              {['sumatera', 'jawa', 'kalimantan', 'sulawesi', 'balinusra', 'maluku', 'papua'].map((r) => <option key={r}>{r}</option>)}
            </select></div>
          <button className={btnAccent} data-testid="create-story">Buat draft</button>
        </form>
        {err && <div role="alert" className="text-xs text-[#9d422a] mt-2">{err}</div>}
      </Section>
      <div className="bg-white border border-[#E7E0D4] rounded-2xl overflow-x-auto">
        <table className="w-full text-sm" data-testid="story-table">
          <thead className="bg-[#F3EFE7] text-left text-xs text-[#667483]"><tr><th className="p-3">Judul</th><th className="p-3">Wilayah</th><th className="p-3">Status</th><th className="p-3">Adegan</th><th className="p-3">2D</th><th className="p-3">Siap publish</th><th /></tr></thead>
          <tbody>
            {(rows ?? []).map((r) => (
              <tr key={r.id} className="border-t border-[#E7E0D4]" data-testid={`row-${r.id}`}>
                <td className="p-3 font-semibold text-[#0e2444]">{r.title}{r.legacyPublished && <span className="ml-2 text-[10px] bg-[#fff4d6] text-[#513400] px-1.5 py-0.5 rounded" title="Dari prototipe; sumber/lisensi belum terverifikasi">legacy</span>}</td>
                <td className="p-3">{r.region}</td>
                <td className="p-3"><span className="text-xs font-bold bg-[#F3EFE7] px-2 py-1 rounded">{LABEL[r.status] ?? r.status}</span></td>
                <td className="p-3">{r.sceneCount}</td>
                <td className="p-3">{r.interactive2DStatus}</td>
                <td className="p-3">{r.publishable ? '✓' : `✗ (${r.blockers})`}</td>
                <td className="p-3 text-right"><button className={btnPrimary} onClick={() => onOpen(r.id)} data-testid={`open-${r.id}`}>Kelola</button></td>
              </tr>
            ))}
            {!rows && <tr><td className="p-4 text-[#667483]" colSpan={7}>Memuat…</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ---------------- story editor ----------------
const StoryEditor: React.FC<{ id: string; onBack: () => void }> = ({ id, onBack }) => {
  const [d, setD] = useState<Json | null>(null);
  const [err, setErr] = useState<{ message: string; list?: Json[] } | null>(null);
  const [busy, setBusy] = useState(false);
  const load = useCallback(() => api<Json>(`/api/admin/stories/${id}`).then(setD).catch((e) => setErr({ message: e.message })), [id]);
  useEffect(() => { load(); }, [load]);

  const act = async (path: string, method = 'POST', json: unknown = {}) => {
    setBusy(true); setErr(null);
    try { const r = await api<Json>(path, { method, json }); if (r?.story) setD(r); else await load(); return r; }
    catch (x) { const e = x as ApiError; setErr({ message: e.message, list: e.body?.blockers ?? e.body?.errors }); }
    finally { setBusy(false); }
  };

  if (!d) return <div className="text-[#667483]">{err ? err.message : 'Memuat…'}</div>;
  const st = d.story;
  const locked = st.status === 'published';
  const idx = WORKFLOW.indexOf(st.status);

  return (
    <div data-testid="story-editor">
      <button className={`${btnGhost} mb-4`} onClick={onBack}>← Daftar cerita</button>
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <h2 className="text-xl font-extrabold text-[#0e2444]">{st.title}</h2>
        <span className="text-xs font-bold bg-[#F5DED6] text-[#74240e] px-2 py-1 rounded" data-testid="story-status">{LABEL[st.status] ?? st.status}</span>
      </div>
      {err && (
        <div role="alert" className="bg-[#fff4d6] border border-[#f9bb62] text-[#513400] text-sm rounded-xl p-3 mb-4" data-testid="admin-error">
          <div className="font-semibold">{err.message}</div>
          {err.list && <ul className="list-disc ml-5 mt-1 text-xs">{err.list.map((b, i) => <li key={i}>{b.message}</li>)}</ul>}
        </div>
      )}
      {locked && <div className="bg-[#eef4ff] border border-[#c7d6f0] text-[#263a5b] text-xs rounded-xl p-3 mb-4">Cerita sedang <strong>published</strong>: konten dikunci. Kembalikan ke draft untuk mengedit.</div>}

      <Section title="Alur publikasi" testId="workflow">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          {WORKFLOW.map((w, i) => (
            <span key={w} className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${i === idx ? 'bg-[#9d422a] text-white' : i < idx ? 'bg-[#0e2444] text-white' : 'bg-[#F3EFE7] text-[#667483]'}`}>{LABEL[w]}</span>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {idx >= 0 && idx < WORKFLOW.length - 1 && <button disabled={busy} className={btnAccent} data-testid={`to-${WORKFLOW[idx + 1]}`} onClick={() => act(`/api/admin/stories/${id}/status`, 'POST', { to: WORKFLOW[idx + 1] })}>Lanjut ke “{LABEL[WORKFLOW[idx + 1]]}”</button>}
          {st.status !== 'draft' && <button disabled={busy} className={btnGhost} data-testid="to-draft" onClick={() => act(`/api/admin/stories/${id}/status`, 'POST', { to: 'draft' })}>{locked ? 'Batalkan publikasi' : 'Kembali ke draft'}</button>}
          {st.status !== 'archived' && !locked && <button disabled={busy} className={btnGhost} onClick={() => act(`/api/admin/stories/${id}/status`, 'POST', { to: 'archived' })}>Arsipkan</button>}
        </div>
        <div className="mt-4 text-xs" data-testid="gate">
          <div className="font-bold mb-1">Syarat publikasi: {d.gate.ok ? <span className="text-green-700">terpenuhi ✓</span> : <span className="text-[#9d422a]">{d.gate.blockers.length} penghambat</span>}</div>
          {d.gate.blockers.length > 0 && <ul className="list-disc ml-5 text-[#9d422a]">{d.gate.blockers.map((b: Json, i: number) => <li key={i}>{b.message}</li>)}</ul>}
          {d.gate.warnings.length > 0 && <ul className="list-disc ml-5 text-[#667483] mt-1">{d.gate.warnings.map((b: Json, i: number) => <li key={i}>{b.message}</li>)}</ul>}
        </div>
      </Section>

      <MetaForm d={d} locked={locked} act={act} id={id} />
      <ScenesSection d={d} locked={locked} act={act} id={id} />
      <SourcesSection d={d} act={act} id={id} />
      <CulturalSection d={d} act={act} id={id} />
      <CharactersSection d={d} act={act} id={id} />
      <VisualsSection d={d} act={act} id={id} />
      <Interactive2DSection d={d} locked={locked} act={act} id={id} />
    </div>
  );
};

type ActFn = (path: string, method?: string, json?: unknown) => Promise<Json | undefined>;
interface SecProps { d: Json; act: ActFn; id: string; locked?: boolean }

const MetaForm: React.FC<SecProps> = ({ d, act, id, locked }) => {
  const s = d.story;
  const [f, setF] = useState({ title: s.title, summary: s.summary, region: s.region, regionKey: s.regionKey, locationDetail: s.locationDetail ?? '', category: s.category ?? '', tradition: s.tradition ?? '', keywords: (s.keywords ?? []).join(', '), theme: s.theme, targetReader: s.targetReader });
  useEffect(() => setF({ title: s.title, summary: s.summary, region: s.region, regionKey: s.regionKey, locationDetail: s.locationDetail ?? '', category: s.category ?? '', tradition: s.tradition ?? '', keywords: (s.keywords ?? []).join(', '), theme: s.theme, targetReader: s.targetReader }), [s]);
  const set = (k: string) => (e: React.ChangeEvent<any>) => setF({ ...f, [k]: e.target.value });
  return (
    <Section title="Metadata" testId="meta">
      <fieldset disabled={locked} className="grid sm:grid-cols-2 gap-3">
        <div className="sm:col-span-2"><label className="text-xs font-semibold" htmlFor="m-title">Judul</label><input id="m-title" className={inputCls} value={f.title} onChange={set('title')} /></div>
        <div className="sm:col-span-2"><label className="text-xs font-semibold" htmlFor="m-summary">Ringkasan</label><textarea id="m-summary" rows={3} className={inputCls} value={f.summary} onChange={set('summary')} /></div>
        <div><label className="text-xs font-semibold" htmlFor="m-region">Wilayah (label)</label><input id="m-region" className={inputCls} value={f.region} onChange={set('region')} /></div>
        <div><label className="text-xs font-semibold" htmlFor="m-regionKey">Kunci wilayah</label><select id="m-regionKey" className={inputCls} value={f.regionKey} onChange={set('regionKey')}>{(d.regions as string[]).map((r) => <option key={r}>{r}</option>)}</select></div>
        <div><label className="text-xs font-semibold" htmlFor="m-loc">Lokasi (detail)</label><input id="m-loc" className={inputCls} value={f.locationDetail} onChange={set('locationDetail')} /></div>
        <div><label className="text-xs font-semibold" htmlFor="m-cat">Kategori</label><input id="m-cat" className={inputCls} value={f.category} onChange={set('category')} /></div>
        <div><label className="text-xs font-semibold" htmlFor="m-trad">Tradisi</label><input id="m-trad" className={inputCls} value={f.tradition} onChange={set('tradition')} /></div>
        <div><label className="text-xs font-semibold" htmlFor="m-kw">Kata kunci pencarian (pisahkan koma)</label><input id="m-kw" className={inputCls} value={f.keywords} onChange={set('keywords')} /></div>
        <div className="sm:col-span-2"><button type="button" className={btnPrimary} data-testid="save-meta" onClick={() => act(`/api/admin/stories/${id}`, 'PATCH', { ...f, keywords: f.keywords.split(',').map((k: string) => k.trim()).filter(Boolean) })}>Simpan metadata</button></div>
      </fieldset>
    </Section>
  );
};

const ScenesSection: React.FC<SecProps> = ({ d, act, id, locked }) => {
  const scenes: Json[] = d.story.scenes;
  const [open, setOpen] = useState<number | null>(null);
  return (
    <Section title={`Adegan (${scenes.length})`} testId="scenes">
      <div className="space-y-2">
        {scenes.map((sc) => (
          <div key={sc.sceneNumber} className="border border-[#E7E0D4] rounded-xl p-3">
            <div className="flex items-center justify-between gap-2">
              <div className="text-sm"><strong>Adegan {sc.sceneNumber}:</strong> {sc.actTitle} <span className="text-[#667483]">— {sc.paragraphs.length} paragraf{sc.mode === 'interactive-2d' ? ' • 2D' : ''}</span></div>
              <div className="flex gap-2">
                <button className={btnGhost} onClick={() => setOpen(open === sc.sceneNumber ? null : sc.sceneNumber)}>{open === sc.sceneNumber ? 'Tutup' : 'Edit'}</button>
                {!locked && <button className={btnGhost} onClick={() => confirm(`Hapus adegan ${sc.sceneNumber}?`) && act(`/api/admin/stories/${id}/scenes/${sc.sceneNumber}`, 'DELETE')}>Hapus</button>}
              </div>
            </div>
            {open === sc.sceneNumber && <SceneForm sc={sc} locked={locked} onSave={(p) => act(`/api/admin/stories/${id}/scenes/${sc.sceneNumber}`, 'PUT', p)} />}
          </div>
        ))}
      </div>
      {!locked && <button className={`${btnAccent} mt-3`} data-testid="add-scene" onClick={() => act(`/api/admin/stories/${id}/scenes`, 'POST', {})}>+ Tambah adegan</button>}
    </Section>
  );
};

const SceneForm: React.FC<{ sc: Json; locked?: boolean; onSave: (p: Json) => void }> = ({ sc, locked, onSave }) => {
  const [f, setF] = useState({ actTitle: sc.actTitle, actSubtitle: sc.actSubtitle, partTitle: sc.partTitle, timeContext: sc.timeContext, text: sc.paragraphs.join('\n\n'), annTitle: sc.culturalAnnotation?.title ?? '', annDesc: sc.culturalAnnotation?.description ?? '', annSrc: sc.culturalAnnotation?.source ?? '' });
  const set = (k: string) => (e: React.ChangeEvent<any>) => setF({ ...f, [k]: e.target.value });
  return (
    <fieldset disabled={locked} className="mt-3 grid sm:grid-cols-2 gap-3" data-testid={`scene-form-${sc.sceneNumber}`}>
      <div><label className="text-xs font-semibold">Judul adegan</label><input className={inputCls} aria-label="Judul adegan" value={f.actTitle} onChange={set('actTitle')} /></div>
      <div><label className="text-xs font-semibold">Subjudul</label><input className={inputCls} aria-label="Subjudul" value={f.actSubtitle} onChange={set('actSubtitle')} /></div>
      <div><label className="text-xs font-semibold">Bagian</label><input className={inputCls} aria-label="Bagian" value={f.partTitle} onChange={set('partTitle')} /></div>
      <div><label className="text-xs font-semibold">Waktu/tempat</label><input className={inputCls} aria-label="Waktu" value={f.timeContext} onChange={set('timeContext')} /></div>
      <div className="sm:col-span-2"><label className="text-xs font-semibold">Narasi (pisahkan paragraf dengan baris kosong)</label><textarea rows={6} className={inputCls} aria-label="Narasi" value={f.text} onChange={set('text')} /></div>
      <div><label className="text-xs font-semibold">Anotasi budaya — judul</label><input className={inputCls} aria-label="Judul anotasi" value={f.annTitle} onChange={set('annTitle')} /></div>
      <div><label className="text-xs font-semibold">Anotasi budaya — sumber</label><input className={inputCls} aria-label="Sumber anotasi" value={f.annSrc} onChange={set('annSrc')} /></div>
      <div className="sm:col-span-2"><label className="text-xs font-semibold">Anotasi budaya — deskripsi</label><textarea rows={3} className={inputCls} aria-label="Deskripsi anotasi" value={f.annDesc} onChange={set('annDesc')} /></div>
      <div className="sm:col-span-2"><button type="button" className={btnPrimary} onClick={() => onSave({ actTitle: f.actTitle, actSubtitle: f.actSubtitle, partTitle: f.partTitle, timeContext: f.timeContext, paragraphs: f.text.split(/\n\s*\n/).map((p: string) => p.trim()).filter(Boolean), culturalAnnotation: { title: f.annTitle, description: f.annDesc, source: f.annSrc } })}>Simpan adegan</button></div>
    </fieldset>
  );
};

const SourcesSection: React.FC<SecProps> = ({ d, act, id }) => {
  const [all, setAll] = useState<Json[]>([]);
  const [pick, setPick] = useState('');
  const [nt, setNt] = useState('');
  useEffect(() => { api<Json[]>('/api/admin/sources').then(setAll).catch(() => undefined); }, [d]);
  const linked = new Set<string>(d.sources.map((s: Json) => s.id));
  return (
    <Section title={`Sumber cerita (${d.sources.length})`} testId="sources">
      {d.sources.length === 0 && <div className="text-xs text-[#9d422a] mb-2">Belum ada sumber — cerita tidak dapat dipublish.</div>}
      <ul className="space-y-1 mb-3">
        {d.sources.map((s: Json) => (
          <li key={s.id} className="text-sm flex flex-wrap items-center gap-2"><span className="font-semibold">{s.title}</span>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${s.verification_status === 'verified' ? 'bg-green-100 text-green-800' : 'bg-[#fff4d6] text-[#513400]'}`}>{s.verification_status}</span>
            <span className="text-[10px] text-[#667483]">hak: {s.rights_status}</span>
            <button className="text-xs underline cursor-pointer" onClick={() => act(`/api/admin/stories/${id}/sources/${s.id}`, 'DELETE')}>lepas</button></li>
        ))}
      </ul>
      <div className="flex flex-wrap gap-2">
        <select aria-label="Pilih sumber" className={`${inputCls} max-w-xs`} value={pick} onChange={(e) => setPick(e.target.value)}><option value="">— pilih sumber yang ada —</option>{all.filter((s) => !linked.has(s.id)).map((s) => <option key={s.id} value={s.id}>{s.title}</option>)}</select>
        <button className={btnPrimary} disabled={!pick} onClick={() => act(`/api/admin/stories/${id}/sources`, 'POST', { sourceId: pick })}>Kaitkan</button>
        <input aria-label="Judul sumber baru" className={`${inputCls} max-w-xs`} placeholder="Judul sumber baru" value={nt} onChange={(e) => setNt(e.target.value)} />
        <button className={btnAccent} disabled={!nt.trim()} data-testid="add-source" onClick={async () => { const r = await api<Json>('/api/admin/sources', { method: 'POST', json: { title: nt } }); setNt(''); await act(`/api/admin/stories/${id}/sources`, 'POST', { sourceId: r.id }); }}>Buat & kaitkan</button>
      </div>
      <p className="text-[11px] text-[#667483] mt-2">Verifikasi dan status hak diatur di tab “Sumber”.</p>
    </Section>
  );
};

const CulturalSection: React.FC<SecProps> = ({ d, act, id }) => {
  const [t, setT] = useState(''); const [desc, setDesc] = useState(''); const [src, setSrc] = useState('');
  return (
    <Section title={`Informasi budaya (${d.cultural.length})`} testId="cultural">
      <ul className="space-y-2 mb-3">
        {d.cultural.map((c: Json) => (
          <li key={c.id} className="border border-[#E7E0D4] rounded-lg p-2 text-sm">
            <div className="font-semibold">{c.title} <span className="text-[10px] text-[#667483]">({c.type})</span></div>
            <div className="text-xs text-[#667483] line-clamp-2">{c.description}</div>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <span className="text-[11px]">Sumber: {d.sources.find((s: Json) => s.id === c.source_id)?.title ?? <em className="text-[#9d422a]">belum ada</em>}</span>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${c.verification_status === 'verified' ? 'bg-green-100 text-green-800' : 'bg-[#fff4d6] text-[#513400]'}`}>{c.verification_status}</span>
              <select aria-label={`Sumber untuk ${c.title}`} className="text-xs border border-[#E7E0D4] rounded px-1 py-1" value={c.source_id ?? ''} onChange={(e) => act(`/api/admin/cultural/${c.id}`, 'PATCH', { sourceId: e.target.value })}><option value="">— tanpa sumber —</option>{d.sources.map((s: Json) => <option key={s.id} value={s.id}>{s.title}</option>)}</select>
              <button className="text-xs underline cursor-pointer" onClick={() => act(`/api/admin/cultural/${c.id}`, 'PATCH', { verificationStatus: c.verification_status === 'verified' ? 'unverified' : 'verified' })}>{c.verification_status === 'verified' ? 'cabut verifikasi' : 'tandai terverifikasi'}</button>
              <button className="text-xs underline cursor-pointer" onClick={() => act(`/api/admin/cultural/${c.id}`, 'DELETE')}>hapus</button>
            </div>
          </li>
        ))}
      </ul>
      <div className="grid sm:grid-cols-3 gap-2">
        <input aria-label="Judul budaya" className={inputCls} placeholder="Judul" value={t} onChange={(e) => setT(e.target.value)} />
        <input aria-label="Deskripsi budaya" className={inputCls} placeholder="Deskripsi" value={desc} onChange={(e) => setDesc(e.target.value)} />
        <select aria-label="Sumber budaya baru" className={inputCls} value={src} onChange={(e) => setSrc(e.target.value)}><option value="">— sumber —</option>{d.sources.map((s: Json) => <option key={s.id} value={s.id}>{s.title}</option>)}</select>
      </div>
      <button className={`${btnAccent} mt-2`} disabled={!t || !desc} onClick={async () => { await act(`/api/admin/stories/${id}/cultural`, 'POST', { title: t, description: desc, sourceId: src }); setT(''); setDesc(''); }}>+ Tambah informasi budaya</button>
    </Section>
  );
};

const CharactersSection: React.FC<SecProps> = ({ d, act, id }) => {
  const [n, setN] = useState(''); const [r, setR] = useState('');
  return (
    <Section title={`Tokoh (${d.characters.filter((c: Json) => !c.archived).length})`} testId="characters">
      <ul className="space-y-1 mb-3">
        {d.characters.map((c: Json) => (
          <li key={c.id} className={`text-sm flex items-center gap-2 ${c.archived ? 'opacity-50 line-through' : ''}`}>{c.icon} <strong>{c.name}</strong> <span className="text-[#667483]">{c.role}</span>
            <button className="text-xs underline cursor-pointer" onClick={() => act(`/api/admin/characters/${c.id}`, 'PATCH', { archived: !c.archived })}>{c.archived ? 'pulihkan' : 'arsipkan'}</button></li>
        ))}
      </ul>
      <div className="flex flex-wrap gap-2">
        <input aria-label="Nama tokoh" className={`${inputCls} max-w-xs`} placeholder="Nama" value={n} onChange={(e) => setN(e.target.value)} />
        <input aria-label="Peran tokoh" className={`${inputCls} max-w-xs`} placeholder="Peran dalam cerita" value={r} onChange={(e) => setR(e.target.value)} />
        <button className={btnAccent} disabled={!n} onClick={async () => { await act(`/api/admin/stories/${id}/characters`, 'POST', { name: n, role: r }); setN(''); setR(''); }}>+ Tambah tokoh</button>
      </div>
    </Section>
  );
};

const VisualsSection: React.FC<SecProps> = ({ d, act, id }) => {
  const [scene, setScene] = useState(0); const [url, setUrl] = useState(''); const [lic, setLic] = useState('unknown'); const [note, setNote] = useState('');
  const [license, setLicense] = useState<Record<string, string>>({});
  return (
    <Section title={`Visual (${d.visuals.length})`} testId="visuals">
      <p className="text-[11px] text-[#667483] mb-3">Hanya visual berstatus <strong>approved</strong> yang tampil di publik. Persetujuan memerlukan status lisensi yang jelas.</p>
      <div className="grid sm:grid-cols-2 gap-3 mb-4">
        {d.visuals.map((v: Json) => (
          <div key={v.id} className="border border-[#E7E0D4] rounded-xl p-2 text-xs" data-testid={`visual-${v.id}`}>
            <div className="aspect-video bg-[#F3EFE7] rounded overflow-hidden mb-2"><img src={v.asset_url} alt={v.alt || 'visual'} className="w-full h-full object-cover" onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')} /></div>
            <div><strong>{v.scene_number === 0 ? 'Sampul' : `Adegan ${v.scene_number}`}</strong> • {v.generation_method === 'ai' ? 'AI' : v.generation_method} • <span className="font-bold">{v.status}</span> • lisensi: {v.license_status}</div>
            {v.prompt && <details className="mt-1"><summary className="cursor-pointer">Prompt ({v.prompt_version})</summary><pre className="whitespace-pre-wrap text-[10px] mt-1">{v.prompt}</pre></details>}
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <select aria-label="Status lisensi" className="border border-[#E7E0D4] rounded px-1 py-1" value={license[v.id] ?? v.license_status} onChange={(e) => setLicense({ ...license, [v.id]: e.target.value })}>{['unknown', 'project-original', 'licensed', 'cc-by', 'public-domain'].map((l) => <option key={l}>{l}</option>)}</select>
              <button className={btnPrimary} data-testid={`approve-${v.id}`} onClick={() => act(`/api/admin/visuals/${v.id}/review`, 'POST', { status: 'approved', licenseStatus: license[v.id] ?? v.license_status })}>Setujui</button>
              <button className={btnGhost} data-testid={`reject-${v.id}`} onClick={() => act(`/api/admin/visuals/${v.id}/review`, 'POST', { status: 'rejected', note: 'Ditolak admin' })}>Tolak</button>
            </div>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-2 items-end">
        <div><label className="text-xs font-semibold block">Adegan (0=sampul)</label><input type="number" min={0} className={`${inputCls} w-24`} aria-label="Nomor adegan visual" value={scene} onChange={(e) => setScene(Number(e.target.value))} /></div>
        <div className="flex-1 min-w-[200px]"><label className="text-xs font-semibold block">URL gambar</label><input className={inputCls} aria-label="URL gambar" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://… atau /assets/…" /></div>
        <select aria-label="Lisensi visual baru" className={`${inputCls} w-40`} value={lic} onChange={(e) => setLic(e.target.value)}>{['unknown', 'project-original', 'licensed', 'cc-by', 'public-domain'].map((l) => <option key={l}>{l}</option>)}</select>
        <button className={btnPrimary} disabled={!url} onClick={async () => { await act(`/api/admin/stories/${id}/visuals`, 'POST', { sceneNumber: scene, assetUrl: url, licenseStatus: lic }); setUrl(''); }}>Tambah visual (manual)</button>
      </div>
      <div className="mt-4 border-t border-[#E7E0D4] pt-3">
        <div className="text-xs font-bold mb-2">Minta visual AI untuk adegan {Math.max(1, scene)}</div>
        <div className="flex flex-wrap gap-2">
          <input aria-label="Catatan prompt" className={`${inputCls} flex-1 min-w-[200px]`} placeholder="Catatan tambahan untuk prompt (opsional)" value={note} onChange={(e) => setNote(e.target.value)} />
          <button className={btnAccent} data-testid="generate-ai" onClick={() => act(`/api/admin/stories/${id}/scenes/${Math.max(1, scene)}/visuals/generate`, 'POST', { note })}>Buat visual AI</button>
        </div>
        <p className="text-[11px] text-[#667483] mt-1">Prompt dibuat hanya dari teks adegan & anotasi budaya terkurasi. Hasil berstatus pending sampai Anda menyetujuinya.</p>
      </div>
    </Section>
  );
};

const Interactive2DSection: React.FC<SecProps> = ({ d, act, id, locked }) => {
  const r = d.report2D;
  return (
    <Section title="Mode Interactive 2D" testId="section-2d">
      <div className="text-sm mb-2">Status: <strong data-testid="status-2d">{r.status}</strong> • Konfigurasi 2D: {r.configured ? 'ada' : 'tidak ada (cerita memakai pembaca standar)'}</div>
      {r.configured && (
        <>
          <div className="text-xs mb-2">Validasi: {r.errors.filter((e: Json) => e.code !== 'status-not-ready').length === 0 ? <span className="text-green-700 font-bold">lolos</span> : <span className="text-[#9d422a] font-bold">gagal</span>}</div>
          {r.errors.length > 0 && <ul className="list-disc ml-5 text-xs text-[#9d422a] mb-2">{r.errors.map((e: Json, i: number) => <li key={i}>{e.message}</li>)}</ul>}
          {r.warnings.length > 0 && <details className="text-xs text-[#667483] mb-2"><summary className="cursor-pointer font-semibold">{r.warnings.length} peringatan (mis. tinjauan budaya aset belum selesai)</summary><ul className="list-disc ml-5">{r.warnings.map((e: Json, i: number) => <li key={i}>{e.message}</li>)}</ul></details>}
          <div className="flex gap-2">
            <button className={btnPrimary} disabled={locked || r.status === 'ready'} data-testid="set-2d-ready" onClick={() => act(`/api/admin/stories/${id}/interactive2d`, 'PATCH', { status: 'ready' })}>Tandai siap 2D</button>
            <button className={btnGhost} disabled={locked || r.status !== 'ready'} data-testid="set-2d-notready" onClick={() => act(`/api/admin/stories/${id}/interactive2d`, 'PATCH', { status: 'not-ready' })}>Kembalikan ke pembaca standar</button>
          </div>
        </>
      )}
      <p className="text-[11px] text-[#667483] mt-2">Penyuntingan scene/target/event 2D penuh belum ada di CMS (konfigurasi berada di <code>src/data/interactive</code>; lihat README).</p>
    </Section>
  );
};

// ---------------- global tabs ----------------
const SourcesTab: React.FC = () => {
  const [rows, setRows] = useState<Json[]>([]);
  const [err, setErr] = useState('');
  const load = useCallback(() => api<Json[]>('/api/admin/sources').then(setRows).catch((e) => setErr(e.message)), []);
  useEffect(() => { load(); }, [load]);
  const patch = async (id: string, p: Json) => { setErr(''); try { await api(`/api/admin/sources/${id}`, { method: 'PATCH', json: p }); await load(); } catch (e) { setErr((e as Error).message); } };
  return (
    <div className="bg-white border border-[#E7E0D4] rounded-2xl overflow-x-auto" data-testid="sources-tab">
      {err && <div role="alert" className="text-xs text-[#9d422a] p-3">{err}</div>}
      <table className="w-full text-sm">
        <thead className="bg-[#F3EFE7] text-left text-xs text-[#667483]"><tr><th className="p-3">Judul</th><th className="p-3">Verifikasi</th><th className="p-3">Status hak</th></tr></thead>
        <tbody>
          {rows.map((s) => (
            <tr key={s.id} className="border-t border-[#E7E0D4]">
              <td className="p-3">{s.title}</td>
              <td className="p-3"><select aria-label={`Verifikasi ${s.title}`} className="border border-[#E7E0D4] rounded px-2 py-1 text-xs" value={s.verification_status} onChange={(e) => patch(s.id, { verificationStatus: e.target.value })}>{['unverified', 'verified', 'rejected'].map((v) => <option key={v}>{v}</option>)}</select></td>
              <td className="p-3"><select aria-label={`Hak ${s.title}`} className="border border-[#E7E0D4] rounded px-2 py-1 text-xs" value={s.rights_status} onChange={(e) => patch(s.id, { rightsStatus: e.target.value })}>{['unknown', 'public-domain', 'licensed', 'permission-granted', 'restricted'].map((v) => <option key={v}>{v}</option>)}</select></td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-[11px] text-[#667483] p-3">Sumber hasil impor prototipe berstatus <em>unverified</em> sampai kurator memeriksanya.</p>
    </div>
  );
};

const PixelTab: React.FC = () => {
  const [rows, setRows] = useState<Json[]>([]);
  const load = useCallback(() => api<Json[]>('/api/admin/pixel-assets').then(setRows), []);
  useEffect(() => { load(); }, [load]);
  const patch = async (id: string, p: Json) => { await api(`/api/admin/pixel-assets/${id}`, { method: 'PATCH', json: p }); await load(); };
  return (
    <div className="bg-white border border-[#E7E0D4] rounded-2xl overflow-x-auto" data-testid="pixel-tab">
      <table className="w-full text-sm">
        <thead className="bg-[#F3EFE7] text-left text-xs text-[#667483]"><tr><th className="p-3">Aset</th><th className="p-3">Metode</th><th className="p-3">Lisensi/hak</th><th className="p-3">Tinjauan budaya</th></tr></thead>
        <tbody>
          {rows.map((a) => (
            <tr key={a.id} className="border-t border-[#E7E0D4]">
              <td className="p-3 flex items-center gap-2"><img src={a.url} alt="" className="h-8 w-auto" style={{ imageRendering: 'pixelated' }} />{a.id}<span className="text-[10px] text-[#667483]">({a.kind})</span></td>
              <td className="p-3 text-xs">{a.generationMethod}</td>
              <td className="p-3"><select aria-label={`Lisensi ${a.id}`} className="border border-[#E7E0D4] rounded px-2 py-1 text-xs" value={a.licenseStatus} onChange={(e) => patch(a.id, { licenseStatus: e.target.value })}>{['unknown', 'project-original', 'licensed', 'cc-by', 'public-domain'].map((v) => <option key={v}>{v}</option>)}</select></td>
              <td className="p-3"><select aria-label={`Tinjauan ${a.id}`} className="border border-[#E7E0D4] rounded px-2 py-1 text-xs" value={a.culturalReviewStatus} onChange={(e) => patch(a.id, { culturalReviewStatus: e.target.value })}>{['pending', 'approved', 'rejected'].map((v) => <option key={v}>{v}</option>)}</select></td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-[11px] text-[#667483] p-3">Aset tanpa lisensi/hak yang jelas atau yang ditolak membuat cerita 2D otomatis kembali ke pembaca standar.</p>
    </div>
  );
};

const AnalyticsTab: React.FC = () => {
  const [rows, setRows] = useState<Json[]>([]);
  useEffect(() => { api<Json[]>('/api/admin/analytics/summary').then(setRows).catch(() => undefined); }, []);
  return (
    <div className="bg-white border border-[#E7E0D4] rounded-2xl p-5" data-testid="analytics-tab">
      <h3 className="text-sm font-extrabold mb-3">Jumlah event (sejak database dibuat)</h3>
      {rows.length === 0 ? <div className="text-sm text-[#667483]">Belum ada event.</div> : <ul className="text-sm">{rows.map((r) => <li key={r.name} className="flex justify-between border-b border-[#F3EFE7] py-1"><span>{r.name}</span><strong>{r.count}</strong></li>)}</ul>}
    </div>
  );
};
