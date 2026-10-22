/**
 * Local, deterministic helpers. They never fetch a product or send pasted text
 * to a service. Extracted fields must still be confirmed by the person shopping.
 */
const SHARE_PREFIX = '#list=';
const MAX_SHARED_LENGTH = 20000;
const MAX_ITEMS = 20;
const MAX_QUANTITY = 99;
const MAX_PRICE = 10000000;

function cleanText(value) {
  return String(value ?? '').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '').trim();
}

function lineContaining(text, index) {
  const start = text.lastIndexOf('\n', index - 1) + 1;
  const next = text.indexOf('\n', index);
  return text.slice(start, next < 0 ? text.length : next).trim().slice(0, 350);
}

/** Extract only explicit text. Multiple/conditional prices stay unconfirmed. */
export function extractListing(input) {
  const text = cleanText(input).slice(0, 30000);
  const lines = text.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
  const questions = [];
  const evidence = [];
  const addEvidence = value => {
    if (value && !evidence.includes(value) && evidence.length < 16) evidence.push(value);
  };

  const excludedTitle = /^(?:https?:\/\/|[¥￥]|价格|售价|单价|到手价|券后价|标价|实付|容量|净含量|规格[：:]|颜色[：:]|数量[：:]|包装清单|包含[：:]|不含[：:]|满\s*\d|优惠|运费|包邮|复制|打开淘宝|商品详情$)/i;
  let title = '';
  for (const line of lines) {
    const candidate = line.replace(/^(?:商品名称|商品标题|宝贝名称|标题|名称)[：:]\s*/, '').trim();
    if (candidate.length >= 2 && candidate.length <= 160 && !excludedTitle.test(candidate)
      && !/^\d+(?:\.\d+)?\s*(?:元|毫升|ml|升|l|克|kg|g)$/i.test(candidate)) {
      title = candidate;
      break;
    }
  }
  if (!title) questions.push('没有找到明确的商品名称，请手动补充。');

  // Gather money expressions without treating capacities, counts, model numbers,
  // or a bare number as a price. Overlapping matches are deduplicated by value.
  const candidates = [];
  const feeContext = /运费|邮费|快递费|配送费|包装费|服务费|安装费|手续费|押金|保证金/;
  const comparisonContext = /(?:\/|／|每)\s*(?:\d+(?:\.\d+)?|百|千)?\s*(?:毫升|千克|公斤|毫克|升|克|斤|ml|kg|mg|g|l)(?![A-Za-z])/i;
  let hasExcludedFee = false;
  let hasComparisonPrice = false;
  const patterns = [
    /(?:¥|￥|人民币\s*|RMB\s*)\s*(\d+(?:,\d{3})*(?:\.\d{1,2})?)(?![\d.,万千百])/gi,
    /(?<![\d.,\-−－])(\d+(?:,\d{3})*(?:\.\d{1,2})?)\s*(?:元|块钱?)/g,
    /(?:售价|价格|单价|到手价|券后价|实付价|标价|price)\s*[：:=]?\s*(\d+(?:,\d{3})*(?:\.\d{1,2})?)(?![\d.,万千百])/gi,
  ];
  for (const pattern of patterns) {
    for (const match of text.matchAll(pattern)) {
      const sourceLine = lineContaining(text, match.index);
      addEvidence(sourceLine);
      // Amounts charged for delivery or packaging, and standardized comparison
      // rates, are not the price of one complete selected product. If mixed on
      // the same line, require confirmation rather than guessing the boundary.
      if (feeContext.test(sourceLine)) {
        hasExcludedFee = true;
        continue;
      }
      if (comparisonContext.test(sourceLine)) {
        hasComparisonPrice = true;
        continue;
      }
      candidates.push(Number(match[1].replaceAll(',', '')));
    }
  }
  const prices = [...new Set(candidates)];
  const rangeText = text.replace(/(?<=\d),(?=\d)/g, '');
  const range = /(?:¥|￥|价格|售价|单价|到手价)?\s*\d+(?:\.\d+)?\s*(?:元)?\s*(?:-|—|–|~|～|至|到)\s*(?:¥|￥)?\s*\d+(?:\.\d+)?\s*元/.test(rangeText)
    || /(?:价格|售价|单价|到手价)[：:\s]*(?:¥|￥)?\s*\d+(?:\.\d+)?\s*(?:-|—|–|~|～|至|到)\s*(?:¥|￥)?\s*\d+(?:\.\d+)?/.test(rangeText)
    || /[¥￥]\s*\d+(?:\.\d+)?\s*(?:-|—|–|~|～|至|到)\s*[¥￥]?\s*\d+(?:\.\d+)?/.test(rangeText);
  const startingPrice = /(?:起价|起售价|低至|最低价|起拍价)|(?:[¥￥]\s*\d+(?:\.\d+)?|\d+(?:\.\d+)?\s*元)\s*起/.test(rangeText);
  const conditional = /满\s*\d|每满|满减|领券|用券|券后|优惠券|折后|折扣|\d+(?:\.\d+)?\s*折|会员价|新人价|首单价|预售价|定金|订金|尾款|补贴后|返现|立减|第二件|第2件|参考价|原价|划线价|建议零售价|预计|大约|约\s*[¥￥]?\s*\d/.test(text);
  let price = null;
  if (range || startingPrice || conditional || prices.length > 1) {
    const reasons = [];
    if (prices.length > 1) reasons.push('多个金额');
    if (range) reasons.push('价格区间');
    if (startingPrice) reasons.push('起价或最低价');
    if (conditional) reasons.push('优惠或付款条件');
    questions.push(`文字含${reasons.join('、')}，请在淘宝确认所选规格的实际单价后填写。`);
  } else if (prices.length === 1 && Number.isFinite(prices[0]) && prices[0] >= 0 && prices[0] <= MAX_PRICE) {
    price = prices[0];
  } else {
    questions.push('没有找到唯一、明确的单价，请在淘宝核对后填写。');
  }
  if (hasExcludedFee) questions.push('运费、包装费等附加金额未当作商品单价，请另行核对总费用。');
  if (hasComparisonPrice) questions.push('每容量或重量的比较价格未当作整件单价，请确认所选商品的整件价格。');

  const capacities = [];
  const capacityPattern = /\d+(?:\.\d+)?\s*(?:毫升|千克|公斤|毫克|升|克|斤|mL|ml|ML|kg|KG|mg|MG|g|G|L|l)(?![A-Za-z])/g;
  for (const match of text.matchAll(capacityPattern)) {
    if (/(?:\/|／|每)\s*$/.test(text.slice(Math.max(0, match.index - 12), match.index))
      && /[¥￥]|\d\s*元|(?:售价|价格|单价)\s*[：:]?\s*\d/.test(lineContaining(text, match.index))) continue;
    if (!capacities.includes(match[0])) capacities.push(match[0]);
    addEvidence(lineContaining(text, match.index));
  }
  if (capacities.length > 1) questions.push('文字含多个容量或重量，请确认自己选中的规格。');
  for (const line of lines) {
    if (/(?:包含|不含|含有|内含|随附|标配|赠送|不包括|另购|包装清单)/.test(line)) addEvidence(line.slice(0, 350));
  }
  questions.push('请核对商品名称、规格、数量与包含内容；粘贴文字不能证明当前库存或结算价格。');
  return {
    title,
    price,
    capacity: capacities.slice(0, 8).join('、'),
    notes: lines.join('\n').slice(0, 1200),
    questions,
    evidence,
  };
}

/** Only direct, conventional Taobao/Tmall web URLs are accepted. */
export function validateSourceUrl(input) {
  if (typeof input !== 'string' || input.length > 4096 || /[\u0000-\u0020\u007f\\]/.test(input)) return '';
  try {
    const url = new URL(input);
    const hostname = url.hostname.toLowerCase();
    if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password || url.port) return '';
    if (!['taobao.com', 'tmall.com'].some(domain => hostname === domain || hostname.endsWith(`.${domain}`))) return '';
    return url.href;
  } catch {
    return '';
  }
}

/** JSON-backed storage, including browsers with localStorage disabled. */
export function safeStorageGet(key, fallback) {
  try {
    const raw = globalThis.localStorage.getItem(key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function safeStorageSet(key, value) {
  try {
    const serialized = JSON.stringify(value);
    if (serialized === undefined) return false;
    globalThis.localStorage.setItem(key, serialized);
    return true;
  } catch {
    return false;
  }
}

function record(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function boundedString(value, max, fallback = '') {
  if (value === undefined) return fallback;
  if (typeof value !== 'string') throw new Error('清单文字格式不正确。');
  const result = cleanText(value);
  if (result.length > max) throw new Error('清单文字太长，请精简后分享。');
  return result;
}

function sanitizeSharedList(data) {
  if (!record(data) || data.version !== 1 || !Array.isArray(data.items) || data.items.length > MAX_ITEMS) {
    throw new Error('清单格式不正确，最多可以分享 20 件商品。');
  }
  const title = boundedString(data.title, 160);
  const note = boundedString(data.note, 1200);
  const items = data.items.map(item => {
    if (!record(item)) throw new Error('商品资料格式不正确。');
    const name = boundedString(item.name, 160);
    if (!name) throw new Error('请为每件商品填写名称。');
    if (!Number.isSafeInteger(item.quantity) || item.quantity < 1 || item.quantity > MAX_QUANTITY) {
      throw new Error('每件商品的数量必须为 1 至 99。');
    }
    const unitPrice = item.unitPrice ?? null;
    if (unitPrice !== null && (typeof unitPrice !== 'number' || !Number.isFinite(unitPrice) || unitPrice < 0 || unitPrice > MAX_PRICE)) {
      throw new Error('商品单价格式不正确，请重新核对。');
    }
    if (item.includes !== undefined && (!Array.isArray(item.includes) || item.includes.length > 20)) {
      throw new Error('包含内容格式不正确。');
    }
    // Construct only allowed own fields. Never merge the supplied object into
    // application state; __proto__, constructor and arbitrary keys disappear.
    return {
      name,
      variant: boundedString(item.variant, 200),
      color: boundedString(item.color, 120),
      quantity: item.quantity,
      unitPrice,
      includes: [...new Set((item.includes ?? []).map(value => boundedString(value, 200)).filter(Boolean))],
      note: boundedString(item.note, 1000),
    };
  });
  return { version: 1, title, items, note };
}

function toBase64url(text) {
  const bytes = new TextEncoder().encode(text);
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '');
}

/** Returns a complete #list= hash; it contains data, not an uploaded record. */
export function encodeSharedList(data) {
  const cleaned = sanitizeSharedList(data);
  const hash = SHARE_PREFIX + toBase64url(JSON.stringify(cleaned));
  if (hash.length > MAX_SHARED_LENGTH) throw new Error('分享清单超过 20,000 字符，请减少商品或备注后重试。');
  return hash;
}

/** Invalid, malformed, oversized or unsupported links return null. */
export function decodeSharedList(hash) {
  if (typeof hash !== 'string' || !hash || hash.length > MAX_SHARED_LENGTH) return null;
  const encoded = hash.startsWith(SHARE_PREFIX) ? hash.slice(SHARE_PREFIX.length) : hash;
  if (!/^[A-Za-z0-9_-]+$/.test(encoded) || encoded.length % 4 === 1) return null;
  try {
    const padded = encoded.replaceAll('-', '+').replaceAll('_', '/') + '='.repeat((4 - encoded.length % 4) % 4);
    const binary = atob(padded);
    const bytes = Uint8Array.from(binary, char => char.charCodeAt(0));
    const decoded = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
    if (toBase64url(decoded) !== encoded) return null;
    return sanitizeSharedList(JSON.parse(decoded));
  } catch {
    return null;
  }
}
