// Parses Ibn Hajar al-Asqalani, "Taqrib al-Tahdhib" (OpenITI text, CC BY-NC-SA 4.0)
// into one record per narrator: { id, name, grade, gradeText, tabaqah, death, books:[codes], text }.
const TABAQAT = ['الأولى', 'الثانية', 'الثالثة', 'الرابعة', 'الخامسة', 'السادسة', 'السابعة', 'الثامنة', 'التاسعة', 'العاشرة', 'الحادية عشرة', 'الثانية عشرة'];
const BOOK_CODES = new Set(['خ', 'خت', 'بخ', 'عخ', 'ر', 'ي', 'م', 'مق', 'د', 'مد', 'صد', 'خد', 'قد', 'ف', 'ل', 'كد', 'ت', 'تم', 'س', 'عس', 'كن', 'سي', 'ص', 'ق', 'فق', 'ع', '4', 'تمييز']);
// Longest first so "ثقة حافظ" wins over "ثقة".
const GRADES = ['ثقة ثبت', 'ثقة حافظ', 'ثقة متقن', 'ثقة فقيه', 'ثقة عابد', 'ثقة إمام', 'ثقة', 'صدوق', 'صحابي', 'صحابية', 'مقبول', 'مجهول الحال', 'مجهول', 'مستور', 'ضعيف', 'متروك', 'كذاب', 'وضاع', 'متهم', 'منكر الحديث', 'لين الحديث', 'لين', 'ثبت', 'حافظ', 'إمام', 'فقيه', 'عابد', 'مخضرم', 'مرسل', 'ليس بالقوي', 'ليس بشيء', 'يرسل', 'رمي', 'مبتدع'];

export function parseTaqrib(text) {
  const body = text.slice(text.indexOf('#META#Header#End'));
  const lines = body.split('\n');
  const out = [];
  let cur = null;
  const flush = () => { if (cur && cur.parts.length) out.push(cur); cur = null; };
  for (const raw of lines) {
    const line = raw.trim();
    const m = line.match(/^### \| (\d+)-\s*$/);
    if (m) { flush(); cur = { n: +m[1], parts: [] }; continue; }
    if (line.startsWith('### |') || line.startsWith('# Page') || line.startsWith('# PageV')) { if (line.startsWith('### |')) flush(); continue; }
    if (!cur) continue;
    if (line.startsWith('# [] ')) continue; // cross-reference note, not a narrator
    const t = line.replace(/^#\s*/, '').replace(/^~~/, '').trim();
    if (t) cur.parts.push(t);
  }
  flush();

  return out.map((e) => {
    let txt = e.parts.join(' ').replace(/\bms\d+\b/g, '').replace(/\s+/g, ' ').trim();
    // trailing book codes
    const toks = txt.split(' ');
    const books = [];
    while (toks.length > 1 && BOOK_CODES.has(toks[toks.length - 1].replace(/[()]/g, ''))) books.unshift(toks.pop().replace(/[()]/g, ''));
    const body2 = toks.join(' ');
    let tab = null, tabPos = -1;
    const tm = body2.match(/ من (?:كبار |أوساط |صغار |أواخر |أوائل )?(الأولى|الثانية|الثالثة|الرابعة|الخامسة|السادسة|السابعة|الثامنة|التاسعة|العاشرة|الحادية عشرة|الثانية عشرة)/);
    if (tm) { tab = TABAQAT.indexOf(tm[1]) + 1; tabPos = tm.index; }
    const head = tabPos > 0 ? body2.slice(0, tabPos) : body2;
    let gStart = -1, gText = '';
    for (const g of GRADES) {
      const i = head.indexOf(' ' + g);
      if (i > 0 && (gStart < 0 || i < gStart || (i === gStart && g.length > gText.length))) { gStart = i; gText = g; }
    }
    if (!tab && /^صحابي/.test(gText)) tab = 1;
    // read the full ruling (e.g. "صدوق يخطئ") from the grade start up to the tabaqah
    const ruling = gStart > 0 ? head.slice(gStart + 1).trim() : '';
    const name = (gStart > 0 ? head.slice(0, gStart) : head.split(' ').slice(0, 8).join(' ')).trim();
    const dm = body2.match(/مات (?:سنة|في) ([^\d]{0,60})/);
    let death = '';
    if (dm) death = dm[0].replace(/ (?:م|خ|د|ت|س|ق|ع|4)( .*)?$/, '').trim();
    return { id: e.n, name: name.slice(0, 220), grade: gText.split(' ')[0] === 'ثقة' ? 'ثقة' : gText, ruling: ruling.slice(0, 160), tabaqah: tab, death: death.slice(0, 80), books, text: body2 };
  });
}
