export const money = value => Number.isFinite(value) ? `¥${Number(value).toFixed(2).replace(/\.00$/, '')}` : '价格待确认';
export const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
export function extractPackageClauses(text) {
  const included=[], excluded=[];
  let needsReview=false;
  const clauses=String(text).replace(/[,，]\s*(?=(?:不包含|不包括|不含|需另购|另购))/g,'\n').split(/[\r\n;；]+/);
  for(const clause of clauses){
    const value=clause.trim();
    const negative=value.match(/^(?:不包含|不包括|不含|需另购|另购)\s*[：:]?\s*(.+)$/);
    if(negative){excluded.push(negative[1].trim());continue;}
    const positive=value.match(/^(?:包含|包装清单|内含)[：:]\s*(.+)$/);
    if(positive){if(/不包含|不包括|不含|另购/.test(positive[1]))needsReview=true;else included.push(positive[1].trim());}
  }
  return {includes:included.join('\n'),excludes:excluded.join('、'),needsReview};
}
export function parseIncludedLines(text) {
  const lines=String(text).split(/[\n、,，;；]+/).map(s=>s.trim()).filter(Boolean);
  if(lines.length>15)throw new Error('包含内容最多15项，请合并重复项后再保存。');
  return lines.map(line=>{
    if(/不包含|不包括|不含|另购/.test(line))throw new Error('包含内容中有排除说明，请把不含或另购的东西填写到“不包含”一栏。');
    const match=line.match(/^(.+?)\s*[×xX*]\s*(\d+)\s*(?:只|个|件|片|张|根|套|把)?$/)||line.match(/^(.+?)\s*(\d+)\s*(?:只|个|件|片|张|根|套|把)$/);
    if(match){const qty=Number(match[2]);if(qty<1||qty>99)throw new Error('每项数量请填写1到99。');return {name:match[1].trim().slice(0,100),qty,kind:'item'};}
    return {name:line.slice(0,100),qty:1,kind:'item'};
  });
}
export function summarizeCart(items) {
  let total = 0, unknown = 0, count = 0;
  for (const item of items) {
    const qty = Math.min(99, Math.max(1, Math.trunc(Number(item.quantity) || 1)));
    count += qty;
    if (Number.isFinite(item.unitPrice) && item.unitPrice >= 0) total += Math.round(item.unitPrice * 100) * qty;
    else unknown += qty;
  }
  return {total:total / 100,unknown,count};
}
export function cartItem(product, variant, color) {
  return {key:`${product.id}:${variant.id}:${color.id}`,productId:product.id,variantId:variant.id,colorId:color.id,
    name:product.name,variant:variant.label,color:color.name,hex:color.hex,kind:product.kind,quantity:1,
    unitPrice:variant.price,includes:variant.includes.map(i=>`${i.name} × ${i.qty}`),excludes:variant.excludes,
    source:product.source || '示例商品',sourceUrl:product.sourceUrl || '',note:''};
}
export function spokenSummary(product, variant, color) {
  return `${product.name}。你选的是${variant.label}，${color.name}。${variant.capacity ? '规格：'+variant.capacity+'。' : ''}价格${money(variant.price).replace('¥','')}${Number.isFinite(variant.price)?'元':''}。包含${variant.includes.map(i=>`${i.qty}件${i.name}`).join('、')}。${variant.excludes.length?'不包含'+variant.excludes.join('、')+'。':''}${product.source==='自己录入'?'资料由你录入，请在购买前向商家核对。':'这是示例商品和示例价格，不会实际下单。'}`;
}
