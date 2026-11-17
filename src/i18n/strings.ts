import type { Category, Claim, Factor, Hospital, Status } from '../types';
import type { Page } from '../components/Sidebar';
import { CLAIMS_TH } from './claimsTh';

export type Lang = 'th' | 'en';

type Pair = { en: string; th: string };

/** Interface strings. Use {name} placeholders; fill them with the second arg of t(). */
export const UI: Record<string, Pair> = {
  // Brand / sidebar
  brandSub: { en: 'Claims Workspace', th: 'ระบบพิจารณาเคลม' },
  officerRole: { en: 'Claims officer', th: 'เจ้าหน้าที่พิจารณาเคลม' },
  closeMenu: { en: 'Close menu', th: 'ปิดเมนู' },

  // Page titles
  'page.overview': { en: 'Overview', th: 'ภาพรวม' },
  'page.triage': { en: 'Triage queue', th: 'คิวจัดลำดับเคลม' },
  'page.mine': { en: 'My claims', th: 'เคลมของฉัน' },
  'page.investigations': { en: 'Investigations', th: 'หน่วยสืบสวน' },
  'page.completed': { en: 'Completed', th: 'เสร็จสิ้น' },
  'page.performance': { en: 'Performance', th: 'ประสิทธิภาพ' },
  'page.audit': { en: 'Audit log', th: 'บันทึกการตรวจสอบ' },
  'page.rules': { en: 'AI rules & thresholds', th: 'กฎและเกณฑ์ของ AI' },

  // TopBar
  breadcrumb: { en: 'Claims', th: 'เคลม' },
  openMenu: { en: 'Open menu', th: 'เปิดเมนู' },
  searchPlaceholder: { en: 'Search claim ID, client, policy no.', th: 'ค้นหาเลขเคลม ชื่อผู้เอาประกัน เลขกรมธรรม์' },
  aiModelTag: { en: 'AI model: Triage v0.3 · demo data', th: 'โมเดล AI: Triage v0.3 · ข้อมูลตัวอย่าง' },
  notifications: { en: 'Notifications', th: 'การแจ้งเตือน' },
  langSwitch: { en: 'Language', th: 'ภาษา' },

  // KPIs
  kpiWaiting: { en: 'Waiting for review', th: 'รอการพิจารณา' },
  kpiWaitingSub: { en: '{n} high priority · needs an officer', th: '{n} ความสำคัญสูง · ต้องมีเจ้าหน้าที่ตรวจ' },
  kpiAuto: { en: 'Auto-approved (simple)', th: 'อนุมัติอัตโนมัติ (เคลมง่าย)' },
  kpiAutoSub: { en: 'Sent straight to auto-pay', th: 'ส่งจ่ายอัตโนมัติทันที' },
  kpiTime: { en: 'Avg. time to sort a claim', th: 'เวลาเฉลี่ยในการจัดการเคลม' },
  kpiTimeValue: { en: '3m 40s', th: '3 น. 40 ว.' },
  kpiTimeSub: { en: '▼ from 15m doing it by hand', th: '▼ ลดจาก 15 นาทีเมื่อทำด้วยมือ' },
  kpiOverride: { en: 'Officer override rate', th: 'อัตราที่เจ้าหน้าที่ปรับแก้' },
  kpiOverrideSub0: { en: 'How often officers change the AI’s call', th: 'ความถี่ที่เจ้าหน้าที่เปลี่ยนคำแนะนำของ AI' },
  kpiOverrideSub: { en: 'Officers changed the AI’s call {fixes} of {total} times', th: 'เจ้าหน้าที่ปรับคำแนะนำของ AI {fixes} จาก {total} ครั้ง' },
  pilotTarget: { en: 'Pilot target', th: 'เป้าหมายนำร่อง' },
  pilotTitle: { en: 'Illustrative pilot target, not a measured result', th: 'ค่าประมาณการของโครงการนำร่อง ไม่ใช่ผลที่วัดได้จริง' },

  // Filters
  'tab.all': { en: 'All', th: 'ทั้งหมด' },
  'tab.high': { en: 'High', th: 'สูง' },
  'tab.medium': { en: 'Medium', th: 'กลาง' },
  'tab.low': { en: 'Low', th: 'ต่ำ' },
  'tab.missing': { en: 'Missing docs', th: 'เอกสารไม่ครบ' },
  filterSort: { en: 'Sort', th: 'เรียงตาม' },
  'sort.score': { en: 'AI priority score', th: 'คะแนนความสำคัญ AI' },
  'sort.received': { en: 'Newest received', th: 'ได้รับล่าสุด' },
  filterCategory: { en: 'Category', th: 'ประเภท' },
  filterHospital: { en: 'Hospital', th: 'โรงพยาบาล' },
  filterReceived: { en: 'Received', th: 'ได้รับเมื่อ' },
  filterStatus: { en: 'Status', th: 'สถานะ' },
  filterAll: { en: 'All', th: 'ทั้งหมด' },
  'range.all': { en: 'Any time', th: 'ทุกช่วงเวลา' },
  'range.today': { en: 'Today', th: 'วันนี้' },
  'range.7d': { en: 'Last 7 days', th: '7 วันล่าสุด' },
  'range.30d': { en: 'Last 30 days', th: '30 วันล่าสุด' },
  nSelected: { en: '{n} selected', th: 'เลือก {n} รายการ' },
  clearCategories: { en: 'Clear categories', th: 'ล้างประเภท' },
  clearFilters: { en: 'Clear filters', th: 'ล้างตัวกรอง' },

  // Table
  noMatch: { en: 'No claims match these filters', th: 'ไม่มีเคลมที่ตรงกับตัวกรอง' },
  'col.priority': { en: 'AI priority', th: 'ความสำคัญ AI' },
  'col.client': { en: 'Client', th: 'ผู้เอาประกัน' },
  'col.received': { en: 'Received', th: 'ได้รับเมื่อ' },
  'col.tags': { en: 'Tags', th: 'ประเภท' },
  'col.description': { en: 'Description', th: 'รายละเอียด' },
  'col.files': { en: 'Files', th: 'ไฟล์' },
  'col.recommends': { en: 'AI recommends', th: 'AI แนะนำ' },
  lowConfidence: { en: 'Low confidence', th: 'ความเชื่อมั่นต่ำ' },
  showingClaims: { en: 'Showing {n} of {total} claims', th: 'แสดง {n} จาก {total} เคลม' },
  openClaimAria: { en: 'Open claim {id}, {client}, AI score {score}', th: 'เปิดเคลม {id}, {client}, คะแนน AI {score}' },

  // Triage page
  triageSubtitle: {
    en: 'The AI has scored and routed each new claim. Review its suggestion and approve, change the route, or reject.',
    th: 'AI ได้ให้คะแนนและจัดเส้นทางของเคลมใหม่แต่ละรายการ ตรวจสอบคำแนะนำแล้วอนุมัติ เปลี่ยนเส้นทาง หรือปฏิเสธ',
  },
  toastApproved: { en: '{id} approved → {route}', th: '{id} อนุมัติแล้ว → {route}' },
  toastRerouted: { en: '{id} re-routed → {route}', th: '{id} เปลี่ยนเส้นทาง → {route}' },
  toastRejected: { en: '{id} rejected', th: '{id} ปฏิเสธแล้ว' },

  // Drawer
  claimAria: { en: 'Claim {id}, {client}', th: 'เคลม {id}, {client}' },
  prevClaim: { en: 'Previous claim', th: 'เคลมก่อนหน้า' },
  nextClaim: { en: 'Next claim', th: 'เคลมถัดไป' },
  close: { en: 'Close', th: 'ปิด' },
  aiAssistant: { en: 'AI assistant', th: 'ผู้ช่วย AI' },
  assistant: { en: 'Assistant', th: 'ผู้ช่วย' },
  ofTotal: { en: '{i} of {total}', th: '{i} จาก {total}' },
  dashOfTotal: { en: '— of {total}', th: '— จาก {total}' },
  receivedFrom: { en: 'Received {date} · from {hospital}', th: 'ได้รับเมื่อ {date} · จาก {hospital}' },
  verdictPriority: { en: '{band} priority.', th: 'ความสำคัญ{band}' },
  verdictReason: { en: 'Main reason: {reason}.', th: 'เหตุผลหลัก: {reason}' },
  verdictSuggest: { en: 'The AI suggests sending it to', th: 'AI แนะนำให้ส่งไปที่' },
  lowConfTitle: { en: "The AI isn't sure, so this needs your judgement.", th: 'AI ยังไม่แน่ใจ เคลมนี้จึงต้องใช้ดุลยพินิจของคุณ' },
  lowConfBody: {
    en: "Its confidence of {c}% is below the {low}% threshold, so this claim can't be fast-tracked without review.",
    th: 'ความเชื่อมั่น {c}% ต่ำกว่าเกณฑ์ {low}% เคลมนี้จึงจ่ายทางด่วนไม่ได้หากไม่ผ่านการตรวจ',
  },
  secDescription: { en: 'Claim description', th: 'รายละเอียดเคลม' },
  secWhyScore: { en: 'Why the AI scored {score}', th: 'ทำไม AI ให้คะแนน {score}' },
  secRoute: { en: 'AI suggested route', th: 'เส้นทางที่ AI แนะนำ' },
  secFiles: { en: 'Files ({n})', th: 'ไฟล์ ({n})' },
  secContact: { en: 'Contact / verify the source', th: 'ติดต่อ / ตรวจสอบกับต้นทาง' },
  confidence: { en: 'Confidence', th: 'ความเชื่อมั่น' },
  verifyFlag: {
    en: 'The AI flagged something that doesn’t line up. You may want to confirm with the hospital before deciding.',
    th: 'AI พบข้อมูลที่ไม่สอดคล้องกัน คุณอาจต้องการยืนยันกับโรงพยาบาลก่อนตัดสินใจ',
  },
  submittingHospital: { en: 'Submitting hospital', th: 'โรงพยาบาลที่ยื่นเคลม' },
  coordinatorRef: { en: '{coordinator} · Patient ref {ref}', th: '{coordinator} · เลขอ้างอิงผู้ป่วย {ref}' },
  'role.Policyholder': { en: 'Policyholder', th: 'ผู้ถือกรมธรรม์' },
  'role.Beneficiary': { en: 'Beneficiary', th: 'ผู้รับผลประโยชน์' },
  beneficiaryOnFile: { en: 'Beneficiary on file', th: 'ผู้รับผลประโยชน์ตามกรมธรรม์' },
  syntheticContact: { en: 'Contact details are synthetic demo data.', th: 'ข้อมูลติดต่อเป็นข้อมูลตัวอย่างสำหรับสาธิต' },
  fileView: { en: 'View', th: 'ดู' },
  footerRejected: { en: 'Rejected. Reason: “{reason}”', th: 'ปฏิเสธแล้ว เหตุผล: “{reason}”' },
  footerApproved: { en: 'Approved → {route}', th: 'อนุมัติแล้ว → {route}' },
  footerRerouted: { en: 'Re-routed → {route}', th: 'เปลี่ยนเส้นทาง → {route}' },
  editSendTo: { en: 'Send this claim to', th: 'ส่งเคลมนี้ไปที่' },
  aiSuggestionTag: { en: ' (AI suggestion)', th: ' (AI แนะนำ)' },
  cancel: { en: 'Cancel', th: 'ยกเลิก' },
  confirmNewRoute: { en: 'Confirm new route', th: 'ยืนยันเส้นทางใหม่' },
  rejectReasonLabel: { en: 'Reason for rejecting the AI suggestion', th: 'เหตุผลที่ปฏิเสธคำแนะนำของ AI' },
  rejectPlaceholder: { en: 'e.g. Exclusion applies: pre-existing condition', th: 'เช่น เข้าข้อยกเว้น: โรคที่เป็นมาก่อน' },
  confirmReject: { en: 'Confirm reject', th: 'ยืนยันการปฏิเสธ' },
  officerFinalSay: { en: 'The officer has the final say', th: 'เจ้าหน้าที่เป็นผู้ตัดสินใจสุดท้าย' },
  reject: { en: 'Reject', th: 'ปฏิเสธ' },
  editRoute: { en: 'Edit route', th: 'เปลี่ยนเส้นทาง' },
  approveSend: { en: 'Approve & send', th: 'อนุมัติและส่ง' },

  // File preview
  backToClaim: { en: 'Back to claim', th: 'กลับไปที่เคลม' },
  syntheticDoc: { en: 'Synthetic document · for demo only', th: 'เอกสารตัวอย่าง · สำหรับสาธิตเท่านั้น' },
  docName: { en: 'Name', th: 'ชื่อ' },
  docCategory: { en: 'Category', th: 'ประเภท' },
  imagePreview: { en: 'image preview', th: 'ตัวอย่างรูปภาพ' },
  download: { en: 'Download', th: 'ดาวน์โหลด' },

  // Audit log
  auditSubtitle: {
    en: 'Every AI suggestion and officer decision is recorded, showing who decided, when, and what the AI proposed.',
    th: 'ทุกคำแนะนำของ AI และการตัดสินใจของเจ้าหน้าที่ถูกบันทึกไว้ แสดงว่าใครตัดสินใจ เมื่อใด และ AI เสนออะไร',
  },
  auditEmpty: { en: 'No decisions yet', th: 'ยังไม่มีการตัดสินใจ' },
  auditEmptySub: { en: 'Approve, edit or reject a claim in the Triage queue to see it here.', th: 'อนุมัติ แก้ไข หรือปฏิเสธเคลมในคิวจัดลำดับเพื่อให้แสดงที่นี่' },
  'auditCol.time': { en: 'Time', th: 'เวลา' },
  'auditCol.claim': { en: 'Claim', th: 'เคลม' },
  'auditCol.client': { en: 'Client', th: 'ผู้เอาประกัน' },
  'auditCol.score': { en: 'AI score', th: 'คะแนน AI' },
  'auditCol.aiRoute': { en: 'AI suggested route', th: 'เส้นทางที่ AI แนะนำ' },
  'auditCol.decision': { en: 'Officer decision', th: 'การตัดสินใจของเจ้าหน้าที่' },
  'auditCol.final': { en: 'Final route / reason', th: 'เส้นทางสุดท้าย / เหตุผล' },
  'auditCol.officer': { en: 'Officer', th: 'เจ้าหน้าที่' },
  'action.approved': { en: 'Approved AI route', th: 'อนุมัติตาม AI' },
  'action.edited': { en: 'Changed route', th: 'เปลี่ยนเส้นทาง' },
  'action.rejected': { en: 'Rejected', th: 'ปฏิเสธ' },

  // Placeholder
  placeholderBody: { en: "This page isn't part of this prototype. The demo focuses on the AI-assisted triage queue.", th: 'หน้านี้ไม่ได้อยู่ในต้นแบบนี้ การสาธิตมุ่งเน้นที่คิวจัดลำดับเคลมด้วย AI' },
  goToTriage: { en: 'Go to Triage queue', th: 'ไปที่คิวจัดลำดับเคลม' },

  // Status labels
  'status.ai_suggested': { en: 'Needs review', th: 'รอพิจารณา' },
  'status.approved': { en: 'Approved', th: 'อนุมัติแล้ว' },
  'status.edited': { en: 'Re-routed', th: 'เปลี่ยนเส้นทาง' },
  'status.rejected': { en: 'Rejected', th: 'ปฏิเสธ' },
  rejectedShort: { en: 'Rejected', th: 'ปฏิเสธ' },

  // Score bands
  'band.high': { en: 'High', th: 'สูง' },
  'band.medium': { en: 'Medium', th: 'กลาง' },
  'band.low': { en: 'Low', th: 'ต่ำ' },

  // Chat
  chatHeader: { en: 'AI assistant', th: 'ผู้ช่วย AI' },
  chatSubhead: { en: 'Staged · asks about this claim', th: 'ตัวอย่าง · ถาม-ตอบเกี่ยวกับเคลมนี้' },
  closeAssistant: { en: 'Close assistant', th: 'ปิดผู้ช่วย' },
  chatIntro: { en: 'Hi — I’m the triage assistant for this claim. Tap a question below, or type your own.', th: 'สวัสดีค่ะ ฉันเป็นผู้ช่วยจัดลำดับสำหรับเคลมนี้ เลือกคำถามด้านล่าง หรือพิมพ์คำถามของคุณได้เลย' },
  'quick.summary': { en: 'Summarize this claim', th: 'สรุปเคลมนี้' },
  'quick.checks': { en: 'What should I double-check?', th: 'ควรตรวจสอบอะไรเพิ่ม?' },
  'quick.route': { en: 'Why this route?', th: 'ทำไมเลือกเส้นทางนี้?' },
  'quick.score': { en: 'Explain the score', th: 'อธิบายคะแนน' },
  chatInputPlaceholder: { en: 'Ask about this claim…', th: 'ถามเกี่ยวกับเคลมนี้…' },
  send: { en: 'Send', th: 'ส่ง' },
};

const TAGS: Record<Category, Pair> = {
  Life: { en: 'Life', th: 'ประกันชีวิต' },
  Death: { en: 'Death', th: 'เสียชีวิต' },
  Hospital: { en: 'Hospital', th: 'ผู้ป่วยใน' },
  ICU: { en: 'ICU', th: 'ไอซียู' },
  OPD: { en: 'OPD', th: 'ผู้ป่วยนอก' },
  'Critical illness': { en: 'Critical illness', th: 'โรคร้ายแรง' },
  Accident: { en: 'Accident', th: 'อุบัติเหตุ' },
  'Missing doc': { en: 'Missing doc', th: 'เอกสารไม่ครบ' },
};

const ROUTES_T: Record<string, Pair> = {
  'Fast-track auto-pay': { en: 'Fast-track auto-pay', th: 'จ่ายอัตโนมัติ (ทางด่วน)' },
  'Standard assessor — Health': { en: 'Standard assessor — Health', th: 'ผู้พิจารณาทั่วไป — สุขภาพ' },
  'Senior adjuster — Health': { en: 'Senior adjuster — Health', th: 'ผู้พิจารณาอาวุโส — สุขภาพ' },
  'Senior adjuster — Death claims': { en: 'Senior adjuster — Death claims', th: 'ผู้พิจารณาอาวุโส — เคลมเสียชีวิต' },
  'Investigation unit': { en: 'Investigation unit', th: 'หน่วยสืบสวน' },
  'Request missing documents': { en: 'Request missing documents', th: 'ขอเอกสารเพิ่มเติม' },
};

const ROUTES_SHORT_T: Record<string, Pair> = {
  'Fast-track auto-pay': { en: 'Fast-track', th: 'ทางด่วน' },
  'Standard assessor — Health': { en: 'Standard assessor', th: 'ผู้พิจารณาทั่วไป' },
  'Senior adjuster — Health': { en: 'Senior adjuster', th: 'ผู้พิจารณาอาวุโส' },
  'Senior adjuster — Death claims': { en: 'Senior adjuster (death)', th: 'ผู้พิจารณาอาวุโส (เสียชีวิต)' },
  'Investigation unit': { en: 'Investigation', th: 'สืบสวน' },
  'Request missing documents': { en: 'Request documents', th: 'ขอเอกสาร' },
};

const HOSPITALS_T: Record<string, string> = {
  'Bangkok Hospital': 'โรงพยาบาลกรุงเทพ',
  'Bumrungrad International': 'โรงพยาบาลบำรุงราษฎร์',
  'Siriraj Hospital': 'โรงพยาบาลศิริราช',
  'Ramathibodi Hospital': 'โรงพยาบาลรามาธิบดี',
  'Samitivej Sukhumvit': 'โรงพยาบาลสมิติเวช สุขุมวิท',
  'Phyathai 2': 'โรงพยาบาลพญาไท 2',
  'Vejthani Hospital': 'โรงพยาบาลเวชธานี',
  'BNH Hospital': 'โรงพยาบาลบีเอ็นเอช',
};

/** Thai coordinator strings for each hospital's claims desk (synthetic). Keyed by the English coordinator string. */
const COORDINATOR_T: Record<string, string> = {
  'Khun Siriwan (Claims desk)': 'คุณศิริวรรณ (แผนกเคลม)',
  'Khun Ploy (Claims desk)': 'คุณพลอย (แผนกเคลม)',
  'Khun Anong (Billing office)': 'คุณอนงค์ (แผนกการเงิน)',
  'Khun Weera (Billing office)': 'คุณวีระ (แผนกการเงิน)',
  'Khun Nong (Claims desk)': 'คุณน้อง (แผนกเคลม)',
  'Khun Suda (Claims desk)': 'คุณสุดา (แผนกเคลม)',
  'Khun Mai (Claims desk)': 'คุณใหม่ (แผนกเคลม)',
  'Khun Pim (Claims desk)': 'คุณพิม (แผนกเคลม)',
};

/** translate a UI key, filling {placeholders} from vars. */
export function translate(lang: Lang, key: string, vars?: Record<string, string | number>): string {
  const pair = UI[key];
  let s = pair ? pair[lang] : key;
  if (vars) for (const [k, v] of Object.entries(vars)) s = s.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
  return s;
}

export const tTag = (lang: Lang, c: Category) => TAGS[c]?.[lang] ?? c;
export const tRoute = (lang: Lang, r: string) => ROUTES_T[r]?.[lang] ?? r;
export const tRouteShort = (lang: Lang, r: string) => ROUTES_SHORT_T[r]?.[lang] ?? r;
export const tHospital = (lang: Lang, h: Hospital) => (lang === 'th' ? HOSPITALS_T[h] ?? h : h);
export const tCoordinator = (lang: Lang, c: string) => (lang === 'th' ? COORDINATOR_T[c] ?? c : c);
export const tPage = (lang: Lang, p: Page) => translate(lang, `page.${p}`);
export const tStatus = (lang: Lang, s: Status) => translate(lang, `status.${s}`);
export const tBand = (lang: Lang, band: 'high' | 'medium' | 'low') => translate(lang, `band.${band}`);

// Claim content resolvers — Thai is a display overlay; English stays the source of truth for logic.
export const tClient = (lang: Lang, c: Claim) => (lang === 'th' ? CLAIMS_TH[c.id]?.client ?? c.client : c.client);
export const tClientById = (lang: Lang, id: string, fallback: string) => (lang === 'th' ? CLAIMS_TH[id]?.client ?? fallback : fallback);
export const tDesc = (lang: Lang, c: Claim) => (lang === 'th' ? CLAIMS_TH[c.id]?.description ?? c.description : c.description);
export function tFactor(lang: Lang, c: Claim, f: Factor): string {
  if (lang !== 'th') return f.label;
  const i = c.factors.indexOf(f);
  return CLAIMS_TH[c.id]?.factors[i] ?? f.label;
}
