import { containsBanned } from './bannedWords';

export function formatUsernameForTts(username: string): string {
  if (!username) return 'bạn';

  // Read the name only: fancy letters (𝑵𝒈𝒖𝒚𝒆̂̃𝒏) become plain, emoji and symbols (💥🌑❤) are dropped
  let clean = username
    .normalize('NFKC')
    .replace(/[︀-️‍⃣]/g, '') // emoji variation selectors / joiners count as marks
    .replace(/[^\p{L}\p{M}\p{N}\s._-]/gu, ' ')
    .normalize('NFC')
    .replace(/\s+/g, ' ')
    .trim();
  // Never say a name that carries a banned word; just call them "bạn"
  if (!clean || containsBanned(clean)) return 'bạn';

  // Separate letter-digit and word boundary transitions
  clean = clean.replace(/([a-z])([A-Z])/g, '$1 $2');
  clean = clean.replace(/([a-zA-Z])(\d)/g, '$1 $2');
  clean = clean.replace(/(\d)([a-zA-Z])/g, '$1 $2');
  clean = clean.replace(/[._\-]+/g, ' ');

  const digitWords: Record<string, string> = {
    '0': 'không',
    '1': 'một',
    '2': 'hai',
    '3': 'ba',
    '4': 'bốn',
    '5': 'năm',
    '6': 'sáu',
    '7': 'bảy',
    '8': 'tám',
    '9': 'chín',
  };

  const words = clean.split(/\s+/).filter(Boolean);
  const processed: string[] = [];

  for (const w of words) {
    if (/^\d+$/.test(w)) {
      const spelled = w
        .split('')
        .map((d) => digitWords[d] || d)
        .join(' ');
      processed.push(spelled);
      continue;
    }

    const lower = w.toLowerCase();

    if (lower === 'thanhtam') {
      processed.push('Thanh Tâm');
      continue;
    }
    if (lower === 'minhtue') {
      processed.push('Minh Tuệ');
      continue;
    }
    if (lower === 'tuyetmai') {
      processed.push('Tuyết Mai');
      continue;
    }
    if (lower === 'luukikim') {
      processed.push('Lưu Ki Kim');
      continue;
    }

    const prefixes = [
      'duy', 'thanh', 'minh', 'tuyet', 'ngoc', 'phuc', 'van', 'xuan',
      'kim', 'hong', 'hoang', 'quoc', 'viet', 'hai', 'nam', 'quang',
      'tien', 'trung', 'tuan'
    ];

    let splitDone = false;
    for (const p of prefixes) {
      if (lower.startsWith(p) && lower.length > p.length) {
        processed.push(w.slice(0, p.length), w.slice(p.length));
        splitDone = true;
        break;
      }
    }

    if (!splitDone) {
      processed.push(w);
    }
  }

  return processed.join(' ');
}

