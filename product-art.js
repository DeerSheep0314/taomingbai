/** Decorative, locally drawn illustrations. No product photograph or live claim. */
let sequence = 0;
const esc = (value) => String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
function tint(hex, amount) {
  const n = parseInt(hex.slice(1), 16);
  const target = amount > 0 ? 255 : 0;
  return '#' + [n >> 16, (n >> 8) & 255, n & 255].map((c) => Math.round(c + (target - c) * Math.abs(amount)).toString(16).padStart(2, '0')).join('');
}

export function productArt(kind, { color = '#91a798', open = false, variant = 'default', label = '', compact = false } = {}) {
  const safe = /^#[0-9a-f]{6}$/i.test(color) ? color : '#91a798';
  const p = `tmba-${++sequence}`;
  const pale = tint(safe, .52), light = tint(safe, .25), dark = tint(safe, -.28), deep = tint(safe, -.56);
  const fill = `url(#${p}-body)`;
  const metal = `url(#${p}-metal)`;
  const definitions = `<defs>
    <linearGradient id="${p}-body" x1="0" x2="1" y1=".15" y2=".3"><stop stop-color="${deep}"/><stop offset=".11" stop-color="${dark}"/><stop offset=".3" stop-color="${light}"/><stop offset=".44" stop-color="${pale}"/><stop offset=".58" stop-color="${light}"/><stop offset=".84" stop-color="${safe}"/><stop offset="1" stop-color="${dark}"/></linearGradient>
    <linearGradient id="${p}-top" x1="0" y1="0" x2=".82" y2="1"><stop stop-color="${pale}"/><stop offset=".4" stop-color="${light}"/><stop offset="1" stop-color="${safe}"/></linearGradient>
    <linearGradient id="${p}-side" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${safe}"/><stop offset=".65" stop-color="${dark}"/><stop offset="1" stop-color="${deep}"/></linearGradient>
    <linearGradient id="${p}-metal" x1="0" x2="1"><stop stop-color="#757b71"/><stop offset=".15" stop-color="#c7c7b5"/><stop offset=".29" stop-color="#fffbee"/><stop offset=".4" stop-color="#b0b5a7"/><stop offset=".61" stop-color="#e9e7d8"/><stop offset=".78" stop-color="#999e91"/><stop offset="1" stop-color="#585f55"/></linearGradient>
    <linearGradient id="${p}-lid" x1="0" x2="1" y2=".5"><stop stop-color="${dark}"/><stop offset=".3" stop-color="${light}"/><stop offset=".57" stop-color="${pale}"/><stop offset="1" stop-color="${dark}"/></linearGradient>
    <linearGradient id="${p}-ceramic" x1="0" y1="0" x2=".4" y2="1"><stop stop-color="#f8edd7"/><stop offset="1" stop-color="#ac936d"/></linearGradient>
    <radialGradient id="${p}-glow"><stop stop-color="#ffe2a3" stop-opacity=".7"/><stop offset=".48" stop-color="#ffd280" stop-opacity=".25"/><stop offset="1" stop-color="#ffc565" stop-opacity="0"/></radialGradient>
    <radialGradient id="${p}-light"><stop stop-color="#fffbe8"/><stop offset=".65" stop-color="#ffdf99"/><stop offset="1" stop-color="#d8a650"/></radialGradient>
    <filter id="${p}-shadow" x="-50%" y="-150%" width="200%" height="400%"><feGaussianBlur stdDeviation="5"/></filter>
    <filter id="${p}-soft" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="2"/></filter>
  </defs>`;
  let drawing = '';
  if (kind === 'cup') {
    const short = variant === 'mini';
    const top = short ? 134 : 111;
    drawing = `
      <ellipse cx="202" cy="340" rx="80" ry="13" fill="#152a23" opacity=".19" filter="url(#${p}-shadow)"/>
      <ellipse cx="202" cy="339" rx="58" ry="7" fill="#152a23" opacity=".12"/>
      <path d="M144 ${top} H256 V311 Q256 334 200 335 Q144 334 144 311Z" fill="${fill}"/>
      <path d="M153 ${top + 15} V303 Q153 317 162 319" fill="none" stroke="${pale}" stroke-width="2" opacity=".8"/>
      <path d="M168 ${top + 19} Q162 221 170 304" fill="none" stroke="#fffdf2" stroke-width="9" opacity=".13" filter="url(#${p}-soft)"/>
      <path d="M247 ${top + 23} V306 Q247 320 237 324" fill="none" stroke="${deep}" stroke-width="3" opacity=".25"/>
      <path d="M145 307 Q200 326 255 307 V318 Q250 335 200 335 Q151 334 145 318Z" fill="${dark}" opacity=".5"/>
      <path d="M145 ${top - 1} Q200 ${top + 19} 255 ${top - 1} V${top + 5} Q200 ${top + 25} 145 ${top + 5}Z" fill="${metal}"/>
      <ellipse cx="200" cy="${top}" rx="56" ry="15" fill="${metal}"/>
      <ellipse cx="200" cy="${top}" rx="45" ry="10" fill="#555e56"/>
      <ellipse cx="200" cy="${top + 2}" rx="40" ry="7" fill="#2f3e36" opacity=".6"/>
      <g transform="${open ? (short ? 'translate(31 -58) rotate(15 200 100)' : `rotate(-72 250 ${top})`) : 'translate(0 0)'}">
        <path d="M142 ${top - 22} Q200 ${top - 42} 258 ${top - 22} V${top + 1} Q200 ${top + 22} 142 ${top + 1}Z" fill="url(#${p}-lid)"/>
        <ellipse cx="200" cy="${top - 22}" rx="58" ry="16" fill="url(#${p}-top)"/>
        <ellipse cx="200" cy="${top - 22}" rx="49" ry="11" fill="none" stroke="${pale}" stroke-width="1.2" opacity=".8"/>
        <path d="M153 ${top - 24} Q192 ${top - 37} 232 ${top - 28}" stroke="#fffdf2" stroke-width="1.5" fill="none" opacity=".6"/>
        <ellipse cx="200" cy="${top - 22}" rx="42" ry="10" fill="${safe}" opacity=".6"/>
        ${short ? `<path d="M153 ${top - 10} V${top + 1} M161 ${top - 7} V${top + 4} M239 ${top - 7} V${top + 4} M247 ${top - 10} V${top + 1}" stroke="${dark}" stroke-width="2" opacity=".5"/>` : `<rect x="185" y="${top - 9}" width="30" height="23" rx="7" fill="${deep}"/><rect x="192" y="${top - 4}" width="16" height="5" rx="2.5" fill="#d7ded4"/><rect x="194" y="${top + 4}" width="12" height="4" rx="2" fill="#b5c7b7"/>`}
      </g>
      <path d="M185 267 H215" stroke="${dark}" stroke-width="2" opacity=".45"/>
      <circle cx="200" cy="254" r="7" fill="none" stroke="${dark}" stroke-width="2" opacity=".45"/>
      ${variant === 'gift' ? `<g transform="translate(266 246)"><path d="M0 10 L46 0 L70 13 L25 25Z" fill="#f0dec0"/><path d="M0 10 L25 25 V73 L0 58Z" fill="#b99b72"/><path d="M25 25 L70 13 V61 L25 73Z" fill="url(#${p}-ceramic)"/><path d="M20 5 L44 20 V68 L51 66 V18 L27 3Z" fill="#7b5942"/><path d="M45 20 Q24 -2 38 3 Q47 7 48 19 Q58 -4 63 2 Q70 11 49 20" fill="none" stroke="#7b5942" stroke-width="3"/><rect x="39" y="33" width="23" height="15" rx="2" fill="#fff4df" transform="rotate(-14 50 40)"/></g>` : ''}`;
  } else if (kind === 'lamp') {
    drawing = `
      ${open ? `<ellipse cx="195" cy="282" rx="134" ry="88" fill="url(#${p}-glow)"/><path d="M124 151 L71 308 Q196 350 321 308 L274 151Z" fill="#ffcf7f" opacity=".12"/>` : ''}
      <ellipse cx="201" cy="344" rx="91" ry="13" fill="#152a23" opacity=".19" filter="url(#${p}-shadow)"/>
      <path d="M248 327 C302 324 295 350 331 344" stroke="#7b796d" stroke-width="4" stroke-linecap="round" fill="none"/>
      <ellipse cx="200" cy="321" rx="69" ry="18" fill="${dark}"/>
      <path d="M131 308 V321 Q200 348 269 321 V308Z" fill="${fill}"/>
      <ellipse cx="200" cy="308" rx="69" ry="18" fill="url(#${p}-top)"/>
      <path d="M137 305 Q181 288 226 296" fill="none" stroke="${pale}" stroke-width="2" opacity=".9"/>
      <path d="M133 320 Q200 341 267 320" stroke="${deep}" stroke-width="1.3" opacity=".4" fill="none"/>
      <ellipse cx="225" cy="313" rx="10" ry="5" fill="${dark}"/><ellipse cx="225" cy="312" rx="7" ry="3" fill="${open ? '#ffda96' : pale}"/>
      <rect x="194" y="145" width="12" height="158" rx="6" fill="${metal}"/>
      <rect x="196" y="146" width="7" height="155" rx="3.5" fill="${fill}"/>
      <path d="M198 167 V299" stroke="${pale}" stroke-width="1.3" opacity=".75"/>
      <path d="M150 94 Q199 61 249 94 L279 153 Q199 179 119 153Z" fill="${fill}"/>
      <ellipse cx="199" cy="153" rx="80" ry="21" fill="${deep}"/>
      <ellipse cx="199" cy="154" rx="75" ry="18" fill="${metal}"/>
      <ellipse cx="199" cy="154" rx="69" ry="15" fill="${open ? `url(#${p}-light)` : '#ede5d4'}"/>
      <ellipse cx="199" cy="151" rx="46" ry="9" fill="${open ? '#fff6d8' : '#d0c9ba'}"/>
      <path d="M163 96 Q175 86 192 82 L156 152 Q144 151 133 147Z" fill="#fff8e7" opacity=".18"/>
      <path d="M235 89 L270 150" stroke="${deep}" stroke-width="6" opacity=".08"/>
      <path d="M120 154 Q199 184 278 154" stroke="${pale}" stroke-width="1.2" fill="none" opacity=".6"/>
      <path d="M151 99 Q180 82 204 85" stroke="${pale}" stroke-width="4" stroke-linecap="round" fill="none" opacity=".7"/>
      ${variant === 'complete' ? `<g transform="translate(292 306) rotate(-10)"><rect width="33" height="29" rx="7" fill="url(#${p}-ceramic)"/><path d="M9 0 V-8 M22 0 V-8" stroke="#a1a49d" stroke-width="4"/><path d="M12 29 V35" stroke="#777b70" stroke-width="3"/></g>` : ''}`;
  } else if (kind === 'box') {
    const scale = variant === 'small' ? '.86' : '1';
    const box = (ox, oy, inner) => `<g transform="translate(${ox} ${oy})">
      <path d="M92 199 L209 164 L309 199 L190 238Z" fill="${deep}"/>
      ${inner ? `<path d="M105 202 L209 172 L295 202 L190 235Z" fill="${dark}"/><path d="M209 172 V210 L190 235 L105 202Z" fill="${safe}"/><path d="M148 190 L248 221 V233 L148 202Z" fill="${safe}"/><path d="M148 190 L248 221" fill="none" stroke="${pale}" stroke-width="3"/><path d="M251 188 L145 221 V233 L251 200Z" fill="${dark}"/><path d="M251 188 L145 221" fill="none" stroke="${pale}" stroke-width="3"/>` : ''}
      <path d="M92 199 L190 238 V324 L92 280Z" fill="url(#${p}-side)"/>
      <path d="M92 199 L190 238 L309 199" fill="none" stroke="${pale}" stroke-width="2" opacity=".75"/>
      <path d="M190 238 L309 199 V282 L190 324Z" fill="${fill}"/>
      <path d="M198 244 V313" stroke="${pale}" stroke-width="1.2" opacity=".7"/>
      <path d="M200 317 L301 281" stroke="${deep}" opacity=".2" fill="none"/>
      <path d="M101 211 V274 L181 309" fill="none" stroke="${light}" stroke-width="3" opacity=".5"/>
      <path d="M225 252 L267 238 V254 L225 268Z" fill="${deep}" opacity=".55"/>
      <path d="M232 253 L260 244" stroke="${pale}" stroke-width="2" opacity=".65"/>
      <g transform="${inner ? 'translate(-10 -68) rotate(-7 200 190)' : 'translate(0 -6)'}">
        <path d="M87 195 L208 159 L314 195 L191 236Z" fill="url(#${p}-top)"/>
        <path d="M108 194 L207 164 L253 181 L155 213Z" fill="#fffbed" opacity=".12"/>
        <path d="M87 195 L191 236 V248 L87 207Z" fill="url(#${p}-side)"/>
        <path d="M191 236 L314 195 V207 L191 248Z" fill="${fill}"/>
        <path d="M88 195 L191 236 L313 195" fill="none" stroke="${pale}" stroke-width="1.8" opacity=".9"/>
        <path d="M103 194 L208 164 L299 195 L191 230Z" fill="none" stroke="${light}" stroke-width="2"/>
      </g>
    </g>`;
    drawing = `<ellipse cx="201" cy="338" rx="122" ry="17" fill="#152a23" opacity=".19" filter="url(#${p}-shadow)"/><g transform="translate(${variant === 'small' ? 28 : 0} ${variant === 'small' ? 42 : 0}) scale(${scale})">${variant === 'pair' ? `<g transform="translate(69 -73) scale(.73)">${box(0, 0, false)}</g>` : ''}${box(0, 0, open)}</g>`;
  } else if (kind === 'umbrella') {
    drawing = open ? `
      <ellipse cx="202" cy="350" rx="74" ry="11" fill="#152a23" opacity=".19" filter="url(#${p}-shadow)"/>
      <rect x="196.5" y="86" width="7" height="228" fill="${metal}"/>
      <path d="M200 306 V325 Q200 345 218 345 Q237 345 237 326" stroke="${deep}" stroke-width="14" stroke-linecap="round" fill="none"/>
      <path d="M197 68 Q62 81 47 198 Q83 176 119 199 Q160 177 200 199 Q240 177 281 199 Q317 176 353 198 Q338 81 203 68Z" fill="${fill}"/>
      <path d="M200 69 Q138 92 119 199 Q160 177 200 199Z" fill="url(#${p}-top)"/>
      <path d="M200 69 Q310 91 353 198 Q317 176 281 199 Q263 92 200 69Z" fill="${dark}" opacity=".5"/>
      <path d="M200 69 Q261 92 281 199 Q240 177 200 199Z" fill="${safe}"/>
      <path d="M200 69 Q86 100 47 198 M200 69 Q137 92 119 199 M200 69 V199 M200 69 Q263 92 281 199 M200 69 Q315 100 353 198" stroke="${dark}" stroke-width="1.8" fill="none" opacity=".5"/>
      <path d="M47 198 Q83 176 119 199 Q160 177 200 199 Q240 177 281 199 Q317 176 353 198" stroke="${deep}" stroke-width="2" fill="none" opacity=".6"/>
      <path d="M200 72 Q145 96 126 187 M203 74 Q258 104 275 189" stroke="${pale}" stroke-width="1" fill="none" opacity=".55"/>
      <path d="M127 139 Q143 110 163 97" stroke="#fff9ed" stroke-width="8" stroke-linecap="round" fill="none" opacity=".1" filter="url(#${p}-soft)"/>
      <path d="M200 61 V72" stroke="${deep}" stroke-width="6" stroke-linecap="round"/>
      <path d="M98 126 Q131 92 169 85" stroke="${pale}" stroke-width="4" stroke-linecap="round" fill="none" opacity=".7"/>
      ${variant !== 'manual' ? `<rect x="192" y="309" width="16" height="12" rx="4" fill="${safe}"/>` : ''}` : `
      <ellipse cx="200" cy="345" rx="78" ry="12" fill="#152a23" opacity=".19" filter="url(#${p}-shadow)"/>
      <g transform="rotate(14 200 205)">
        <path d="M199 72 V106" stroke="${deep}" stroke-width="5" stroke-linecap="round"/>
        <path d="M185 93 Q199 82 213 93 L229 265 Q200 281 171 265Z" fill="${fill}"/>
        <path d="M190 98 L188 262 M204 96 L207 266" stroke="${pale}" stroke-width="1.7" fill="none" opacity=".75"/>
        <path d="M193 98 L192 262" stroke="#fff9ed" stroke-width="5" opacity=".1" fill="none"/>
        <path d="M185 94 L182 265 M200 93 V270 M213 94 L220 265" stroke="${dark}" stroke-width="2" fill="none" opacity=".6"/>
        <path d="M176 218 Q200 230 225 218 V238 Q200 250 174 237Z" fill="${dark}"/>
        <rect x="198" y="228" width="10" height="5" rx="2.5" fill="${pale}"/>
        <rect x="195" y="272" width="10" height="11" fill="${metal}"/>
        <rect x="184" y="282" width="32" height="55" rx="13" fill="url(#${p}-side)"/>
        <path d="M190 291 V324 Q190 329 195 331" stroke="${light}" stroke-width="1.5" fill="none" opacity=".7"/>
        ${variant !== 'manual' ? `<rect x="191" y="289" width="18" height="15" rx="5" fill="${safe}"/><path d="M196 297 L200 293 L204 297" fill="none" stroke="${pale}" stroke-width="1.5"/>` : ''}
        <path d="M213 328 Q238 346 223 360 Q205 367 204 335" stroke="${dark}" stroke-width="3" fill="none"/>
      </g>
      ${variant === 'case' ? `<g transform="translate(263 167) rotate(13)"><rect width="47" height="158" rx="22" fill="url(#${p}-ceramic)"/><path d="M23 8 V150" stroke="#ab9f8a" stroke-width="2"/><path d="M18 23 H29 V34 H18Z" fill="#eee6d5"/></g>` : ''}`;
  } else {
    drawing = `<rect x="125" y="125" width="150" height="150" rx="32" fill="${fill}"/><path d="M175 200 H225 M200 175 V225" stroke="${pale}" stroke-width="6" stroke-linecap="round"/>`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" aria-hidden="true" focusable="false" class="product-illustration${compact ? ' is-compact' : ''}"${label ? ` data-illustration-label="${esc(label)}"` : ''}>${definitions}${drawing}</svg>`;
}
