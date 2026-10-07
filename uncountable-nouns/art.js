// Original SVG diagrams for Uncountable Nouns, in the Small Common Words style: a 600×365 cream card, dark-teal
// outlines, warm fills, small capital labels. Three kinds of picture per noun:
//   meaning — what the noun is (a scene built from a few simple parts),
//   lot / little — the same stuff as a big amount or a small amount (with an amount meter),
//   units — one or three countable units of it (a piece of advice, glasses of water).
// Pictures never print the noun itself, so the picture check is about the picture, not reading a label.
import {icon as cwIcon,escape} from '../common-words/art.js';
export {escape};

const INK = '#214b47', CREAM = '#fffdf7', RED = '#d65b3e';
// Common Words object drawings this academy reuses as symbols.
const CW = ['ball','block','coin','button','marble','pencil','crayon','eraser','book','notebook','apple','orange','pear','banana','carrot','spoon','fork','cup','bottle','plate','sock','hat','shoe','glove','scarf','key','comb','brush','bell','candle','shell','stone','leaf','acorn','pinecone','car','boat','rocket','train','robot','envelope','ticket','ribbon','ring','bead','puzzle','ruler','feather','drum'];

// New symbols, drawn about 60 units across around (0,0).
const S = {
 bulb:'<path d="M-15-6A15 15 0 1 1 15-6C15 4 7 8 7 16H-7C-7 8-15 4-15-6Z"/><path d="M-7 21H7M-5 26H5M-6-6Q0-14 6-6" fill="none"/>',
 paper:'<path d="M-18-26H10L20-16V26H-18Z"/><path d="M10-26V-16H20M-11-10H12M-11-2H12M-11 6H12M-11 14H4" fill="none"/>',
 news:'<rect x="-26" y="-20" width="52" height="40" rx="3"/><path d="M-20-12H20M-20-4H-2M-20 4H-2M-20 12H-2" fill="none"/><rect x="3" y="-5" width="17" height="18" fill="#bcd5df"/>',
 letters:'<path d="M-26-14H14V16H-26Z"/><path d="M-26-14-6 2 14-14" fill="none"/><path d="M-14-22H26V8H18" fill="none"/>',
 phone:'<rect x="-14" y="-27" width="28" height="54" rx="6"/><rect x="-9" y="-20" width="18" height="34" fill="#bcd5df"/><circle cy="20" r="2.5"/>',
 screen:'<rect x="-28" y="-22" width="56" height="36" rx="4"/><rect x="-22" y="-16" width="44" height="24" fill="#bcd5df"/><path d="M-8 14V22H8V14M-16 24H16"/>',
 laptop:'<path d="M-22-20H22V8H-22Z"/><rect x="-17" y="-15" width="34" height="18" fill="#bcd5df"/><path d="M-30 8H30L26 16H-26Z"/>',
 code:'<rect x="-28" y="-22" width="56" height="44" rx="4"/><path d="M-12-8-20 0-12 8M12-8 20 0 12 8M4-12-4 12" fill="none"/>',
 chip:'<rect x="-16" y="-16" width="32" height="32" rx="3"/><rect x="-8" y="-8" width="16" height="16" fill="#bcd5df"/><path d="M-10-16V-24M0-16V-24M10-16V-24M-10 16V24M0 16V24M10 16V24M-16-10H-24M-16 0H-24M-16 10H-24M16-10H24M16 0H24M16 10H24" fill="none"/>',
 cloudsave:'<path d="M-20 12Q-30 12-30 2Q-30-8-18-8Q-16-22-2-22Q12-22 14-10Q28-10 28 2Q28 12 18 12Z"/><path d="M0 22V-2M-7 5 0-2 7 5" fill="none"/>',
 wifi:'<path d="M-26-6Q0-28 26-6M-17 3Q0-13 17 3M-8 12Q0 5 8 12" fill="none" stroke-width="4"/><circle cy="20" r="4"/>',
 lock:'<rect x="-18" y="-4" width="36" height="28" rx="4"/><path d="M-11-4V-12A11 11 0 0 1 11-12V-4" fill="none"/><circle cy="9" r="4"/>',
 shield:'<path d="M0-28 22-20V0Q22 18 0 28Q-22 18-22 0V-20Z"/><path d="M-9 0-2 8 11-8" fill="none"/>',
 magnifier:'<circle cx="-6" cy="-6" r="17" fill="#d6ecf2"/><path d="M6 6 24 24" stroke-width="7"/>',
 gear:'<path d="M-5-27H5L7-19 14-16 21-21 27-14 21-7 24 0 21 7 27 14 21 21 14 16 7 19 5 27H-5L-7 19-14 16-21 21-27 14-21 7-24 0-21-7-27-14-21-21-14-16-7-19Z"/><circle r="8" fill="#fffdf7"/>',
 wrench:'<path d="M-24 20 2-6A12 12 0 0 1 16-24L8-14 12-8 20-14A12 12 0 0 1 4 0L-20 24Z"/>',
 hammer:'<path d="M-4-6 22 22 16 28-10 0Z"/><path d="M-24-14-12-26-2-18-6-12 0-6-6 0-12-6-18-2Z"/>',
 tools:'<path d="M-24 22-2 0M-14 26 26-14" stroke-width="6"/><circle cx="-26" cy="24" r="4"/><path d="M20-28 28-20 22-14 14-22Z"/>',
 banknote:'<rect x="-28" y="-16" width="56" height="32" rx="3" fill="#bfe3b0"/><circle r="9"/><path d="M-22-10H-16M16 10H22" fill="none"/>',
 coins:'<ellipse cx="0" cy="16" rx="20" ry="7" fill="#f2c94c"/><path d="M-20 16V8M20 16V8"/><ellipse cx="0" cy="8" rx="20" ry="7" fill="#f2c94c"/><path d="M-20 8V0M20 8V0"/><ellipse cx="0" cy="0" rx="20" ry="7" fill="#f2c94c"/><path d="M-20 0V-8M20 0V-8"/><ellipse cx="0" cy="-8" rx="20" ry="7" fill="#f2c94c"/>',
 wallet:'<path d="M-26-14H20V20H-26Z" fill="#c98b5a"/><path d="M6-4H28V12H6Z" fill="#e0a877"/><circle cx="14" cy="4" r="3"/>',
 bank:'<path d="M-28-6 0-26 28-6Z"/><path d="M-24 22H24M-26 28H26M-18-4V20M-6-4V20M6-4V20M18-4V20" fill="none"/>',
 chart:'<path d="M-26-26V24H28" fill="none"/><rect x="-18" y="6" width="10" height="16" fill="#8fb5c0"/><rect x="-4" y="-6" width="10" height="28" fill="#8fb5c0"/><rect x="10" y="-20" width="10" height="42" fill="#8fb5c0"/>',
 chartup:'<path d="M-26-26V24H28" fill="none"/><path d="M-20 14-6 2 4 8 22-16" fill="none" stroke="#d65b3e" stroke-width="4"/><path d="M14-18H24V-8" fill="none" stroke="#d65b3e" stroke-width="4"/>',
 chartdown:'<path d="M-26-26V24H28" fill="none"/><path d="M-20-16-6-2 4-8 22 14" fill="none" stroke="#d65b3e" stroke-width="4"/>',
 clock:'<circle r="26" fill="#fffdf7"/><path d="M0-16V0L12 8" fill="none" stroke-width="3.5"/>',
 calendar:'<rect x="-24" y="-20" width="48" height="44" rx="4" fill="#fffdf7"/><path d="M-24-8H24M-14-26V-14M14-26V-14" fill="none"/><path d="M-14 2h6M-2 2h6M10 2h6M-14 14h6M-2 14h6" stroke-width="4"/>',
 check:'<circle r="26" fill="#bfe3b0"/><path d="M-12 0-3 10 14-10" fill="none" stroke-width="5"/>',
 cross:'<circle r="26" fill="#f6c3b6"/><path d="M-10-10 10 10M10-10-10 10" fill="none" stroke-width="5"/>',
 question:'<circle r="26" fill="#fff1c1"/><path d="M-9-8Q-9-18 0-18Q10-18 10-9Q10-2 0 2V8" fill="none" stroke-width="4"/><circle cy="16" r="2.5"/>',
 heart:'<path d="M0 24C-36 0-26-30 0-12C26-30 36 0 0 24Z" fill="#f28b82"/>',
 star:'<path d="M0-27 8-9 27-8 12 5 17 24 0 13-17 24-12 5-27-8-8-9Z" fill="#f2c94c"/>',
 trophy:'<path d="M-16-24H16V-4Q16 10 0 10Q-16 10-16-4Z" fill="#f2c94c"/><path d="M-16-18Q-28-18-24-6Q-20 2-14 0M16-18Q28-18 24-6Q20 2 14 0M0 10V18M-12 24H12V18H-12Z" fill="none"/>',
 medal:'<path d="M-10-28-2-8M10-28 2-8" stroke-width="5"/><circle cy="8" r="16" fill="#f2c94c"/><path d="M0 0 3 6 9 7 4 11 6 17 0 14-6 17-4 11-9 7-3 6Z" fill="#fffdf7"/>',
 eye:'<path d="M-28 0Q0-24 28 0Q0 24-28 0Z" fill="#fffdf7"/><circle r="9" fill="#8fb5c0"/><circle r="3.5" fill="#214b47"/>',
 ear:'<path d="M-8 24Q-16 22-14 12Q-22-4-14-18Q-2-30 12-20Q20-12 14 2Q8 10 6 18Q2 26-8 24Z" fill="#e8b48a"/><path d="M-4-6Q2-12 6-4Q4 2-2 4" fill="none"/>',
 hand:'<path d="M-14 26V0L-22-10Q-24-16-18-16L-12-8V-24Q-12-28-8-28Q-4-28-4-24V-6M-4-26Q0-30 4-26V-6M4-24Q8-28 12-24V-4M12-18Q16-22 20-18V8Q20 26 4 26Z" fill="#e8b48a"/>',
 handshake:'<path d="M-30 0-18-10H-4L8-2 20-10H30V6L18 6 6 16Q0 20-6 16L-22 6H-30Z" fill="#e8b48a"/><path d="M-4-10 6-2" fill="none"/>',
 speaker:'<path d="M-24-8H-12L4-22V22L-12 8H-24Z"/><path d="M12-10Q18 0 12 10M18-18Q30 0 18 18" fill="none" stroke-width="3"/>',
 music:'<path d="M-10 16V-20L18-26V10" fill="none" stroke-width="4"/><ellipse cx="-16" cy="16" rx="8" ry="6"/><ellipse cx="12" cy="10" rx="8" ry="6"/>',
 palette:'<path d="M0-26Q28-26 28 0Q28 12 16 10Q6 8 8 18Q8 26 0 26Q-28 26-28 0Q-28-26 0-26Z" fill="#f2d7a6"/><circle cx="-12" cy="-10" r="4" fill="#d65b3e"/><circle cx="2" cy="-16" r="4" fill="#4c8fd6"/><circle cx="15" cy="-8" r="4" fill="#6cc070"/><circle cx="-14" cy="6" r="4" fill="#f2c94c"/>',
 camera:'<path d="M-28-12H-12L-6-20H6L12-12H28V20H-28Z"/><circle cy="4" r="11" fill="#bcd5df"/>',
 dumbbell:'<path d="M-18 0H18" stroke-width="6"/><rect x="-28" y="-14" width="10" height="28" rx="2"/><rect x="18" y="-14" width="10" height="28" rx="2"/>',
 suitcase:'<rect x="-26" y="-14" width="52" height="38" rx="5" fill="#c98b5a"/><path d="M-8-14V-22H8V-14M-26 2H26" fill="none"/>',
 backpack:'<path d="M-18-10Q-18-26 0-26Q18-26 18-10V24H-18Z" fill="#7fb3a0"/><path d="M-12 4H12V18H-12Z"/><path d="M-6-26V-30H6V-26" fill="none"/>',
 plane:'<path d="M-28 4 28-6 30-2 4 6 -6 22H-12L-6 8-22 10-28 16H-32L-28 4Z"/>',
 bus:'<rect x="-28" y="-20" width="56" height="34" rx="6" fill="#f2c94c"/><path d="M-22-14H-2V-2H-22ZM4-14H22V-2H4Z" fill="#bcd5df"/><circle cx="-16" cy="16" r="6"/><circle cx="16" cy="16" r="6"/>',
 bike:'<circle cx="-16" cy="10" r="12" fill="none"/><circle cx="16" cy="10" r="12" fill="none"/><path d="M-16 10-6-10H10L16 10M-6-10 2 10H-16M10-10 8-16H2" fill="none"/>',
 truck:'<rect x="-30" y="-16" width="38" height="28"/><path d="M8-8H20L28 2V12H8Z" fill="#bcd5df"/><circle cx="-18" cy="16" r="6"/><circle cx="16" cy="16" r="6"/>',
 road:'<path d="M-16 28-6-28H6L16 28Z" fill="#9aa5a8"/><path d="M0-22V-12M0-2V8M0 18V26" stroke="#fffdf7" stroke-width="3"/>',
 map:'<path d="M-28-20-10-26 10-20 28-26V20L10 26-10 20-28 26Z" fill="#cfe5c5"/><path d="M-10-26V20M10-20V26" fill="none"/><path d="M-20 8Q-6-6 4 4T20-10" fill="none" stroke="#d65b3e" stroke-dasharray="4 3"/>',
 house:'<path d="M-26 0 0-24 26 0Z" fill="#d65b3e"/><rect x="-20" y="0" width="40" height="26" fill="#f2d7a6"/><rect x="-6" y="10" width="12" height="16"/>',
 building:'<rect x="-20" y="-26" width="40" height="52" fill="#d6dde0"/><path d="M-12-18h6M2-18h6M-12-6h6M2-6h6M-12 6h6M2 6h6" stroke-width="4"/><rect x="-5" y="14" width="10" height="12"/>',
 factory:'<path d="M-28 26V-4L-12 6V-4L4 6V-20H14V-4L28 6V26Z" fill="#d6dde0"/><path d="M8-20Q6-28 14-30" fill="none"/>',
 bed:'<path d="M-30 18V-14M-30 4H30V18" fill="none"/><rect x="-24" y="-8" width="14" height="10" rx="3" fill="#fffdf7"/><path d="M-8-6H28V4H-8Z" fill="#8fb5c0"/>',
 tent:'<path d="M-30 24 0-24 30 24Z" fill="#f2b95d"/><path d="M0-24V24M-8 24 0 6 8 24" fill="none"/>',
 pill:'<rect x="-26" y="-11" width="52" height="22" rx="11" fill="#fffdf7"/><path d="M0-11V11"/><path d="M0-11H15A11 11 0 0 1 15 11H0Z" fill="#f28b82"/>',
 medkit:'<rect x="-26" y="-18" width="52" height="40" rx="5" fill="#fffdf7"/><path d="M-8-26H8V-18H-8Z" fill="none"/><path d="M-4-6H4V2H12V10H4V18H-4V10H-12V2H-4Z" fill="#d65b3e"/>',
 thermometer:'<path d="M-5-26A5 5 0 0 1 5-26V8A11 11 0 1 1-5 8Z" fill="#fffdf7"/><circle cy="16" r="6" fill="#d65b3e"/><path d="M0 12V-12" stroke="#d65b3e" stroke-width="4"/>',
 bandage:'<rect x="-28" y="-10" width="56" height="20" rx="10" fill="#f2d7a6" transform="rotate(-30)"/><rect x="-9" y="-9" width="18" height="18" fill="#fffdf7" transform="rotate(-30)"/>',
 stethoscope:'<path d="M-16-26V-6Q-16 8 -2 8Q12 8 12-6V-26" fill="none" stroke-width="4"/><path d="M-2 8V18Q-2 26 8 26Q18 26 18 16" fill="none" stroke-width="4"/><circle cx="18" cy="12" r="6" fill="#bcd5df"/>',
 chair:'<path d="M-14-26V8H14V26M-14 8V26M-14-4H14" fill="none" stroke-width="4"/><rect x="-14" y="-26" width="28" height="22" fill="#c98b5a"/>',
 table:'<rect x="-28" y="-8" width="56" height="8" fill="#c98b5a"/><path d="M-22 0V26M22 0V26" stroke-width="5"/>',
 lamp:'<path d="M-16-6-8-26H8L16-6Z" fill="#f2c94c"/><path d="M0-6V20M-12 24H12" stroke-width="4"/>',
 sofa:'<path d="M-28-4Q-28-16-16-16H16Q28-16 28-4V18H-28Z" fill="#8fb5c0"/><path d="M-22 4H22V18H-22Z" fill="#b8d3db"/><path d="M-24 18V24M24 18V24"/>',
 shirt:'<path d="M-10-24 0-18 10-24 26-12 18 0 12-4V24H-12V-4L-18 0-26-12Z" fill="#8fb5c0"/>',
 dress:'<path d="M-8-26H8L12-8 26 24H-26L-12-8Z" fill="#f28b82"/>',
 boot:'<path d="M-14-26H6V8L24 14Q28 24 20 24H-14Z" fill="#a57148"/>',
 necklace:'<path d="M-20-24Q-24 8 0 14Q24 8 20-24" fill="none" stroke-width="3"/><circle cy="20" r="7" fill="#9fd3e8"/>',
 underwear:'<path d="M-24-14H24V-4Q16 2 10 16Q0 6-10 16Q-16 2-24-4Z" fill="#fffdf7"/>',
 basket:'<path d="M-28-6H28L20 24H-20Z" fill="#d9b071"/><path d="M-18-6Q-18-28 0-28Q18-28 18-6M-24 4H24M-22 14H22" fill="none"/>',
 cart:'<path d="M-30-22H-22L-14 10H20L26-12H-18" fill="none" stroke-width="3.5"/><circle cx="-10" cy="20" r="5"/><circle cx="16" cy="20" r="5"/>',
 bag:'<path d="M-20-12H20L24 26H-24Z" fill="#f2d7a6"/><path d="M-10-12Q-10-26 0-26Q10-26 10-12" fill="none"/>',
 box:'<path d="M-26-14 0-24 26-14V18L0 28-26 18Z" fill="#d9b071"/><path d="M-26-14 0-4 26-14M0-4V28" fill="none"/>',
 bin:'<path d="M-18-14H18L14 26H-14Z" fill="#9aa5a8"/><path d="M-24-20H24M-6-26H6M-8-6V18M0-6V18M8-6V18" fill="none"/>',
 broom:'<path d="M14-28-2 6" stroke-width="5"/><path d="M-6 2 4 8-6 28-26 22-20 8Z" fill="#f2c94c"/>',
 bucket:'<path d="M-20-14H20L14 24H-14Z" fill="#8fb5c0"/><path d="M-20-14Q0-36 20-14" fill="none"/>',
 washer:'<rect x="-24" y="-26" width="48" height="52" rx="5" fill="#fffdf7"/><circle cy="4" r="14" fill="#bcd5df"/><path d="M-16-18h8" stroke-width="4"/>',
 pot:'<path d="M-24-8H24V14Q24 24 14 24H-14Q-24 24-24 14Z" fill="#9aa5a8"/><path d="M-30-8H30M-6-14H6" fill="none" stroke-width="4"/><path d="M-12-20Q-8-26-12-30M0-20Q4-26 0-30M12-20Q16-26 12-30" fill="none"/>',
 pan:'<ellipse cy="4" rx="22" ry="10" fill="#9aa5a8"/><path d="M22 2H40" stroke-width="5"/>',
 oven:'<rect x="-26" y="-24" width="52" height="50" rx="4" fill="#fffdf7"/><rect x="-18" y="-6" width="36" height="24" fill="#f2b95d"/><path d="M-16-16h4M-4-16h4M8-16h4" stroke-width="4"/>',
 cutlery:'<path d="M-12-26V24M-18-26V-10Q-12-4-6-10V-26M10 24V-26Q20-16 18 0H10" fill="none" stroke-width="3.5"/>',
 dishes:'<ellipse cx="-6" cy="14" rx="24" ry="8" fill="#fffdf7"/><ellipse cx="-6" cy="8" rx="24" ry="8" fill="#fffdf7"/><path d="M10-14H26L24 4H12Z" fill="#fffdf7"/>',
 football:'<circle r="24" fill="#fffdf7"/><path d="M0-10 10-3 6 9H-6L-10-3Z" fill="#214b47"/><path d="M0-10V-24M10-3 23-8M6 9 14 20M-6 9-14 20M-10-3-23-8" fill="none"/>',
 basketball:'<circle r="24" fill="#f2994a"/><path d="M-24 0H24M0-24V24M-17-17Q-6 0-17 17M17-17Q6 0 17 17" fill="none"/>',
 tennis:'<circle cx="10" cy="-8" r="16" fill="#d6ef6a"/><path d="M-2-18Q10-8-2 2M22-18Q10-8 22 2" fill="none"/><path d="M-24 24-6 6" stroke-width="5"/>',
 chess:'<path d="M-10 24H10L8 14Q8 4 4 0Q12-6 6-14Q2-18 4-24H-4Q-2-18-6-14Q-12-6-4 0Q-8 4-8 14Z" fill="#fffdf7"/><path d="M-16 26H16"/>',
 rod:'<path d="M-26 26 18-24" stroke-width="3.5"/><path d="M18-24Q26 0 22 16" fill="none"/><path d="M22 16Q28 22 22 26Q16 22 22 16Z" fill="#8fb5c0"/>',
 runner:'<circle cx="6" cy="-20" r="7"/><path d="M2-10-4 6 8 14 6 26M-4 6-14 12-18 24M0-6 12-2 18-10M0-6-12-8-18 0" fill="none" stroke-width="4"/>',
 swimmer:'<circle cx="-12" cy="-4" r="7"/><path d="M-4 0 18-6M-6 4 6 8" fill="none" stroke-width="4"/><path d="M-30 14Q-20 8-10 14T10 14T30 14M-30 24Q-20 18-10 24T10 24T30 24" fill="none" stroke="#4c8fd6" stroke-width="3"/>',
 dancer:'<circle cy="-20" r="7"/><path d="M0-12V8L-10 26M0 8 12 24M0-6-16-18M0-6 16-14" fill="none" stroke-width="4"/>',
 walker:'<circle cy="-20" r="7"/><path d="M0-12V6L-8 26M0 6 8 26M0-4-8 6M0-4 8 4" fill="none" stroke-width="4"/>',
 sleeper:'<path d="M-28 10H28V20H-28Z" fill="#8fb5c0"/><circle cx="-18" cy="2" r="7"/><path d="M-10 2H24" stroke-width="10" stroke="#b8d3db"/><path d="M10-24h8l-8 8h8M20-14h5l-5 5h5" fill="none" stroke-width="2"/>',
 garden:'<path d="M-30 18H30V26H-30Z" fill="#a57148"/><path d="M-16 18V4M0 18V-6M16 18V2" fill="none" stroke="#3f8a4a" stroke-width="3"/><circle cx="-16" cy="0" r="6" fill="#f28b82"/><circle cy="-10" r="6" fill="#f2c94c"/><circle cx="16" cy="-2" r="6" fill="#c792ea"/>',
 shovel:'<path d="M-20 26 10-8" stroke-width="5"/><path d="M6-12 18-26 28-16 14-4Z" fill="#9aa5a8"/>',
 fire:'<path d="M0-28Q22-6 14 14Q8 26 0 26Q-8 26-14 14Q-22-6-4-14Q-6-2 2 2Q8-12 0-28Z" fill="#f2994a"/><path d="M0 10Q6 16 2 22Q-4 22-4 16Q-2 12 0 10Z" fill="#f2c94c"/>',
 smoke:'<path d="M-14 24Q-24 14-14 6Q-24-6-10-12Q-12-26 4-24Q18-30 20-16Q30-8 20 2Q28 14 14 20Z" fill="#c7cdd0"/>',
 drop:'<path d="M0-26Q20 0 20 10A20 20 0 0 1-20 10Q-20 0 0-26Z" fill="#7cc4e8"/>',
 flake:'<path d="M0-26V26M-22-13 22 13M-22 13 22-13M0-26-6-20M0-26 6-20M0 26-6 20M0 26 6 20" fill="none" stroke-width="3" stroke="#4c8fd6"/>',
 bolt:'<path d="M6-28-18 4H-2L-8 28 18-6H2Z" fill="#f2c94c"/>',
 sun:'<circle r="14" fill="#f2c94c"/><path d="M0-28V-20M0 20V28M-28 0H-20M20 0H28M-20-20-14-14M14 14 20 20M-20 20-14 14M14-14 20-20" fill="none" stroke-width="3.5"/>',
 moon:'<path d="M8-24A24 24 0 1 0 8 24A18 18 0 1 1 8-24Z" fill="#f2e9a6"/>',
 cloud:'<path d="M-20 12Q-30 12-30 2Q-30-8-18-8Q-16-22-2-22Q12-22 14-10Q28-10 28 2Q28 12 18 12Z" fill="#e6ecef"/>',
 wind:'<path d="M-28-10H10Q20-10 20-18Q20-26 12-24M-28 2H20Q30 2 30 12Q30 20 22 18M-28 14H4" fill="none" stroke-width="3.5"/>',
 wave:'<path d="M-30 4Q-20-8-10 4T10 4T30 4V24H-30Z" fill="#7cc4e8"/>',
 tree:'<rect x="-4" y="6" width="8" height="20" fill="#a57148"/><circle cy="-8" r="18" fill="#6cc070"/>',
 flower:'<path d="M0 26V0" stroke="#3f8a4a" stroke-width="3"/><circle cy="-8" r="6" fill="#f2c94c"/><circle cx="-10" cy="-8" r="6" fill="#f28b82"/><circle cx="10" cy="-8" r="6" fill="#f28b82"/><circle cy="-18" r="6" fill="#f28b82"/><circle cy="2" r="6" fill="#f28b82"/>',
 grass:'<path d="M-28 24Q-24 6-20 24Q-16 0-10 24Q-4 4 0 24Q4-2 10 24Q14 6 20 24Q24 2 28 24Z" fill="#6cc070"/>',
 mountain:'<path d="M-30 24-8-18 4 0 12-10 30 24Z" fill="#9fb4a0"/><path d="M-8-18-14-6-6-8 0-4Z" fill="#fffdf7"/>',
 rock:'<path d="M-26 20-20-6-4-18 14-12 26 6 20 20Z" fill="#a7a9a3"/>',
 ice:'<path d="M-20-14 0-24 20-14V12L0 24-20 12Z" fill="#d6f0fb"/><path d="M-20-14 0-4 20-14M0-4V24" fill="none"/>',
 magnet:'<path d="M-20-24V4A20 20 0 0 0 20 4V-24H8V4A8 8 0 0 1-8 4V-24Z" fill="#d65b3e"/><path d="M-20-24H-8V-14H-20ZM8-24H20V-14H8Z" fill="#fffdf7"/>',
 atom:'<ellipse rx="26" ry="10" fill="none"/><ellipse rx="26" ry="10" fill="none" transform="rotate(60)"/><ellipse rx="26" ry="10" fill="none" transform="rotate(-60)"/><circle r="5" fill="#d65b3e"/>',
 planet:'<circle r="16" fill="#c792ea"/><ellipse rx="28" ry="7" fill="none" transform="rotate(-15)"/><circle cx="-22" cy="-20" r="2"/><circle cx="24" cy="18" r="2"/>',
 plug:'<path d="M-12-26V-14M12-26V-14" stroke-width="5"/><path d="M-20-14H20V2Q20 14 6 14H-6Q-20 14-20 2Z" fill="#fffdf7"/><path d="M0 14V28" stroke-width="4"/>',
 battery:'<rect x="-26" y="-12" width="48" height="24" rx="3" fill="#fffdf7"/><path d="M22-5H28V5H22Z"/><rect x="-21" y="-7" width="30" height="14" fill="#6cc070"/>',
 radiation:'<circle r="26" fill="#f2c94c"/><circle r="5"/><path d="M0-8 8-22A24 24 0 0 0-8-22ZM7 4 22 12A24 24 0 0 0 24-4ZM-7 4-22 12A24 24 0 0 1-24-4Z"/>',
 apple2:'<path d="M0-15C-30-32-34 14-13 25Q0 19 13 25C34 14 30-32 0-15Z" fill="#d65b3e"/><path d="M0-15V-28" fill="none"/>',
 deer:'<path d="M-18 4Q-18-6-6-6H14L20-14 24-10 18-2V18M-14 4V24M-6 6V24M10 6V24" fill="none" stroke-width="3.5"/><path d="M20-14 16-26M20-14 28-24" fill="none"/>',
 bird:'<path d="M-24 4Q-10-14 8-6L24-12 16 0Q20 16 0 16Q-16 16-24 4Z" fill="#8fb5c0"/><circle cx="12" cy="-4" r="2"/>',
 bread:'<path d="M-26 4Q-26-18 0-18Q26-18 26 4V16H-26Z" fill="#e0a560"/><path d="M-12-14-6-2M0-16 6-4M12-14 18-2" fill="none"/>',
 toastslice:'<path d="M-20 24V-6Q-26-10-24-18Q-20-26 0-26Q20-26 24-18Q26-10 20-6V24Z" fill="#d9a066"/><path d="M-14 18V-4Q-18-8-16-14Q-12-20 0-20Q12-20 16-14Q18-8 14-4V18Z" fill="#f2d7a6"/>',
 cheese:'<path d="M-28 16-28-2 22-20 28 16Z" fill="#f2c94c"/><path d="M-28-2 28 16" fill="none"/><circle cx="-8" cy="6" r="3"/><circle cx="10" cy="4" r="2.5"/><circle cx="2" cy="12" r="2"/>',
 butter:'<path d="M-26-4-8-14 26-4 8 6Z" fill="#fbe7a1"/><path d="M-26-4V10L8 20 26 10V-4M8 6V20" fill="#f6dc79"/>',
 steak:'<path d="M-24 0Q-28-18-6-18Q16-24 24-8Q30 10 10 16Q-20 22-24 0Z" fill="#d97b6c"/><path d="M-8-6Q0-12 8-4Q0 4-8-6Z" fill="#fff1e6"/>',
 drumstick:'<path d="M-4 4Q-24 4-24-12Q-24-26-8-26Q8-26 8-10Q8 0 0 2Z" fill="#c98b5a"/><path d="M0 2 16 18" stroke-width="6" stroke="#fff4dc"/><circle cx="18" cy="22" r="5" fill="#fff4dc"/>',
 fish:'<path d="M-24 0Q-8-18 14-6L28-16V16L14 6Q-8 18-24 0Z" fill="#8fb5c0"/><circle cx="-12" cy="-2" r="2.5"/>',
 shrimp:'<path d="M-20 10Q-26-14 0-18Q20-20 22-4Q14-6 8 2Q4 10-6 14Z" fill="#f2a07b"/><path d="M-14-6Q-8 0-12 8M-4-12Q2-4-2 6M6-14Q10-6 6 2" fill="none"/>',
 ham:'<path d="M-24 6Q-24-18 4-18Q26-18 26 2Q26 22 0 22Q-24 22-24 6Z" fill="#f2a5a5"/><circle cx="14" cy="-2" r="6" fill="#fff1e6"/>',
 bacon:'<path d="M-28-6Q-18-16-8-6T12-6T28-6V6Q18-4 8 6T-12 6T-28 6Z" fill="#e48f80"/><path d="M-26 0Q-16-10-6 0T14 0T26 0" fill="none" stroke="#fff1e6" stroke-width="2.5"/>',
 cake:'<path d="M-24-2H24V22H-24Z" fill="#f6d1dc"/><path d="M-24-2Q-18 6-12-2T0-2T12-2T24-2" fill="#fffdf7"/><path d="M0-2V-14" stroke-width="3"/><path d="M0-22Q4-16 0-14Q-4-16 0-22Z" fill="#f2994a"/>',
 chocolate:'<rect x="-22" y="-16" width="44" height="32" rx="2" fill="#7b4b2a"/><path d="M-22-5H22M-22 6H22M-8-16V16M8-16V16" fill="none" stroke="#a87150"/>',
 icecream:'<path d="M-12 0 0 28 12 0Z" fill="#e0a560"/><circle cy="-8" r="13" fill="#f6d1dc"/><circle cx="-2" cy="-20" r="9" fill="#fffdf7"/>',
 jar:'<path d="M-16-18H16V-12Q22-8 22 0V20Q22 26 16 26H-16Q-22 26-22 20V0Q-22-8-16-12Z"/><rect x="-18" y="-26" width="36" height="8" rx="2" fill="#c98b5a"/>',
 carton:'<path d="M-16-14 0-26 16-14V26H-16Z" fill="#fffdf7"/><path d="M-16-14H16M-6-4H6V10H-6Z" fill="none"/>',
 shaker:'<path d="M-12-18Q-12-26 0-26Q12-26 12-18V24H-12Z"/><path d="M-4-22h1M3-22h1M0-18h1" stroke-width="3"/>',
 grains:'<ellipse cx="-12" cy="6" rx="5" ry="3"/><ellipse cx="2" cy="10" rx="5" ry="3"/><ellipse cx="14" cy="4" rx="5" ry="3"/><ellipse cx="-4" cy="-4" rx="5" ry="3"/><ellipse cx="10" cy="-8" rx="5" ry="3"/>',
 wheat:'<path d="M0 26V-20" stroke-width="3" fill="none"/><path d="M0-22Q-10-26-8-16Q-4-12 0-14ZM0-22Q10-26 8-16Q4-12 0-14ZM0-10Q-10-14-8-4Q-4 0 0-2ZM0-10Q10-14 8-4Q4 0 0-2ZM0 2Q-10-2-8 8Q-4 12 0 10ZM0 2Q10-2 8 8Q4 12 0 10Z" fill="#e8c46a"/>',
 corn:'<path d="M0-26Q14-20 14 4Q14 24 0 26Q-14 24-14 4Q-14-20 0-26Z" fill="#f2c94c"/><path d="M-8-10h1M0-14h1M8-10h1M-8 2h1M0-2h1M8 2h1M-6 14h1M2 12h1" stroke-width="4"/><path d="M-14 4Q-22 18-6 26M14 4Q22 18 6 26" fill="#6cc070"/>',
 herb:'<path d="M0 26V-6" stroke="#3f8a4a" stroke-width="3"/><path d="M0-6Q-20-10-14-24Q2-22 0-6ZM0 6Q20 2 16-12Q0-12 0 6ZM0 14Q-18 12-16 0Q-2 0 0 14Z" fill="#6cc070"/>',
 greens:'<path d="M-24 18Q-30-8-10-14Q-6-28 8-20Q26-22 24 0Q28 18 10 22H-14Q-22 22-24 18Z" fill="#6cc070"/><path d="M0 22V-14M0 6-12-4M0 0 12-8M0 14 10 6" fill="none" stroke="#3f8a4a"/>',
 broccoli:'<path d="M-6 26V6H6V26Z" fill="#9ccc65"/><circle cx="-12" cy="-4" r="11" fill="#4f9d55"/><circle cx="12" cy="-4" r="11" fill="#4f9d55"/><circle cy="-16" r="12" fill="#4f9d55"/>',
 garlic:'<path d="M0-26Q4-16 14-8Q26 6 16 20Q8 26 0 24Q-8 26-16 20Q-26 6-14-8Q-4-16 0-26Z" fill="#fffdf7"/><path d="M0-12V22M-8-4Q-12 10-8 22M8-4Q12 10 8 22" fill="none"/>',
 ginger:'<path d="M-26 6Q-28-6-16-6Q-14-16-4-12Q6-20 12-10Q26-12 26 2Q28 14 14 14Q4 22-8 14Q-26 18-26 6Z" fill="#e0b070"/>',
 popcorn:'<path d="M-16-4H16L12 26H-12Z" fill="#fffdf7"/><path d="M-8-4V26M0-4V26M8-4V26" stroke="#d65b3e" stroke-width="3"/><circle cx="-10" cy="-10" r="7" fill="#fff4dc"/><circle cy="-16" r="7" fill="#fff4dc"/><circle cx="10" cy="-10" r="7" fill="#fff4dc"/>',
 noodles:'<path d="M-24 0H24Q24 24 0 24Q-24 24-24 0Z" fill="#fffdf7"/><path d="M-18 0Q-14-12-8 0T4 0T16 0" fill="none" stroke="#e8c46a" stroke-width="3"/><path d="M10-26 2 0M18-24 8 0" stroke-width="2.5"/>',
 teacup:'<path d="M-20-10H14V8Q14 22 0 22H-6Q-20 22-20 8Z" fill="#fffdf7"/><path d="M14-4Q26-4 24 6Q22 12 14 10" fill="none"/><path d="M-26 24H20" /><path d="M-10-14Q-6-20-10-26M0-14Q4-20 0-26" fill="none"/>',
 glassdrink:'<path d="M-14-24H14L10 24H-10Z" fill="#fffdf7"/><path d="M-12-8H12L10 24H-10Z" fill="#7cc4e8"/>',
 wineglass:'<path d="M-14-26H14Q16-4 0-2Q-16-4-14-26Z" fill="#fffdf7"/><path d="M-13-14H13Q12-4 0-3Q-12-4-13-14Z" fill="#a33a5a"/><path d="M0-2V20M-10 24H10" fill="none" stroke-width="3"/>',
 can:'<rect x="-14" y="-22" width="28" height="44" rx="4" fill="#d65b3e"/><path d="M-14-14H14M-14 14H14" fill="none"/>',
 tube:'<path d="M-24-10H14L24-4V4L14 10H-24Z" fill="#fffdf7"/><path d="M24-4H30V4H24" /><path d="M-18-10V10" fill="none"/>',
 soapbar:'<rect x="-24" y="-12" width="48" height="26" rx="10" fill="#c7e8f0"/><circle cx="-8" cy="-20" r="4" fill="none"/><circle cx="6" cy="-24" r="3" fill="none"/><circle cx="16" cy="-18" r="2" fill="none"/>',
 lipstick:'<rect x="-8" y="0" width="16" height="26" fill="#9aa5a8"/><path d="M-6 0V-16L6-24V0Z" fill="#d65b3e"/>',
 perfume:'<rect x="-16" y="-6" width="32" height="30" rx="6" fill="#e6d4f5"/><rect x="-5" y="-16" width="10" height="10"/><path d="M8-22h4M14-26h4M14-18h4" stroke-width="2"/>',
 plank:'<path d="M-30-10H30V10H-30Z" fill="#d9a066"/><path d="M-24-4Q-6-10 10-2T28 0M-26 4Q-4-2 14 6" fill="none"/>',
 logs:'<circle cx="-12" cy="8" r="12" fill="#d9a066"/><circle cx="12" cy="8" r="12" fill="#d9a066"/><circle cy="-12" r="12" fill="#d9a066"/><circle cx="-12" cy="8" r="5" fill="none"/><circle cx="12" cy="8" r="5" fill="none"/><circle cy="-12" r="5" fill="none"/>',
 ingot:'<path d="M-26 12-18-6H18L26 12Z"/><path d="M-18-6-12-16H12L18-6" fill="none"/>',
 bricks:'<path d="M-28-16H28V20H-28Z" fill="#d6735a"/><path d="M-28-4H28M-28 8H28M-10-16V-4M12-16V-4M0-4V8M-20-4V8M20-4V8M-10 8V20M12 8V20" fill="none" stroke="#fffdf7"/>',
 blockgrey:'<path d="M-26-10 0-22 26-10V16L0 28-26 16Z" fill="#b9bfc1"/><path d="M-26-10 0 2 26-10M0 2V28" fill="none"/>',
 fabric:'<path d="M-28-18Q-14-26 0-18T28-18V14Q14 6 0 14T-28 14Z"/><path d="M-20-12V8M-8-14V10M4-12V12M16-14V8" fill="none" stroke-dasharray="3 3"/>',
 yarn:'<circle r="22"/><path d="M-20-8Q0 4 18-12M-18 8Q2 0 20 6M-8 20Q4-4 6-22M10 20Q8 0 14-18" fill="none"/><path d="M18 14 30 28" fill="none"/>',
 hide:'<path d="M-24-20Q-12-12 0-20Q12-12 24-20Q18 0 24 20Q12 12 0 20Q-12 12-24 20Q-18 0-24-20Z"/>',
 pane:'<path d="M-24-24H24V24H-24Z" fill="#d6f0fb"/><path d="M-14 6 2-10M-4 14 12-2" fill="none" stroke="#fffdf7" stroke-width="3"/>',
 plasticbottle:'<path d="M-6-26H6V-18Q16-12 16 0V24H-16V0Q-16-12-6-18Z" fill="#cfe9f5"/><path d="M-16 4H16M-16 14H16" fill="none"/>',
 paintcan:'<path d="M-18-12H18V24H-18Z" fill="#9aa5a8"/><ellipse cy="-12" rx="18" ry="5" fill="#4c8fd6"/><path d="M-18-12Q0-36 18-12" fill="none"/><path d="M8-8Q10 4 6 10" fill="none" stroke="#4c8fd6" stroke-width="4"/>',
 inkbottle:'<path d="M-14-6H14V24H-14Z" fill="#3b4f8a"/><rect x="-7" y="-14" width="14" height="8"/><path d="M14-26-6 4" stroke-width="3"/>',
 gluetube:'<path d="M-24 12 10-22 20-12-14 22Z" fill="#fffdf7"/><path d="M10-22 20-28 26-18 20-12" /><path d="M-18 24Q-24 30-28 26" fill="none"/>',
 pump:'<rect x="-22" y="-24" width="30" height="50" rx="3" fill="#d65b3e"/><rect x="-16" y="-18" width="18" height="12" fill="#fffdf7"/><path d="M8-14H16Q22-14 22-6V14Q22 20 16 18" fill="none" stroke-width="3"/>',
 balloon:'<ellipse cy="-6" rx="18" ry="22" fill="#f28b82"/><path d="M0 16Q-6 22 0 28" fill="none"/>',
 bubbles:'<circle cx="-12" cy="8" r="10" fill="none"/><circle cx="10" cy="-6" r="13" fill="none"/><circle cx="12" cy="18" r="6" fill="none"/><circle cx="-14" cy="-16" r="5" fill="none"/>',
 hairlock:'<path d="M-20-26Q-28 0-16 26M-10-26Q-18 0-6 26M0-26Q-8 0 4 26M10-26Q2 0 14 26M20-26Q12 0 24 26" fill="none" stroke="#7b4b2a" stroke-width="3"/>',
 sweatdrop:'<circle r="20" fill="#f2d7a6"/><path d="M-8-4h1M8-4h1" stroke-width="4"/><path d="M-6 8Q0 4 6 8" fill="none"/><path d="M22-20Q28-10 22-6Q16-10 22-20Z" fill="#7cc4e8"/>',
 dirt:'<path d="M-30 20Q-20 0 0 4Q20-6 30 20Z" fill="#a57148"/><circle cx="-10" cy="12" r="2"/><circle cx="8" cy="8" r="2"/><circle cx="18" cy="14" r="2"/>',
 sandpile:'<path d="M-30 22Q-10-18 0-18Q10-18 30 22Z" fill="#ecd08e"/><path d="M-8 4h1M6-4h1M2 12h1M14 10h1M-16 14h1" stroke-width="3"/>',
 mudpuddle:'<path d="M-28 6Q-28-8-10-6Q0-14 14-8Q30-8 28 6Q28 18 6 16Q-20 22-28 6Z" fill="#8a6748"/>',
 gravel:'<path d="M-24 16-18 8-10 14ZM-8 18-2 8 6 16ZM8 16 14 6 22 14ZM-16 4-10-4-4 4ZM2 2 8-6 14 2Z" fill="#a7a9a3"/>',
 coal:'<path d="M-22 16-16-2-2-8 10 0 22 12 6 20Z" fill="#3c4446"/><path d="M-6 0 2 6" fill="none" stroke="#9aa5a8"/>',
 gascloud:'<path d="M-24 14Q-30 0-16-4Q-18-20 0-18Q16-24 20-8Q32-4 24 10Q20 20 4 18Q-14 24-24 14Z" fill="#e6ecef" stroke-dasharray="4 3"/><path d="M-10 4h1M4-2h1M12 8h1M-2 10h1" stroke-width="4"/>',
 face:'<circle r="26" fill="#f2d7a6"/>',
 crowd:'<circle cx="-16" cy="-8" r="8" fill="#b97d53"/><circle cx="16" cy="-8" r="8" fill="#8fb5c0"/><circle cy="-14" r="8" fill="#e0a560"/><path d="M-28 24Q-28 4-16 4Q-4 4-4 24ZM4 24Q4 4 16 4Q28 4 28 24ZM-10 24Q-10-2 0-2Q10-2 10 24Z" fill="#d6dde0"/>',
 scales:'<path d="M0-26V22M-14 24H14M-24-16H24" fill="none" stroke-width="3"/><path d="M-24-16-32 4H-16ZM24-16 16 4H32Z" fill="#f2c94c"/>',
 gavel:'<path d="M-8-8 18 18" stroke-width="5"/><rect x="-26" y="-22" width="24" height="12" rx="2" transform="rotate(45 -14 -16)" fill="#c98b5a"/><path d="M-28 24H8" stroke-width="4"/>',
 dove:'<path d="M-24 6Q-10-6 4-2L18-14 16 0Q28 0 24 8Q10 16-4 14Q-18 16-24 6Z" fill="#fffdf7"/><path d="M4-2Q-2-18 10-22Q12-10 16 0" fill="#fffdf7"/>',
 brokenheart:'<path d="M0 24C-36 0-26-30 0-12L-6 0 4 6-2 16Z" fill="#f28b82"/><path d="M4-14C28-28 36 0 6 22L10 10 2 4 8-6Z" fill="#f28b82"/>',
 storm:'<path d="M-20 4Q-30 4-30-6Q-30-16-18-16Q-16-28-2-28Q12-28 14-18Q28-18 28-6Q28 4 18 4Z" fill="#9aa5a8"/><path d="M2 6-8 18H2L-4 28 10 14H0L6 6Z" fill="#f2c94c"/>',
 tangle:'<path d="M-26 0Q-20-24 0-10T20-4Q30 16 8 14T-6-8Q-26-20-14 18Q0 30 16 20T28-20" fill="none" stroke-width="3"/>',
 neat:'<path d="M-24-18H24M-24-6H24M-24 6H24M-24 18H24" stroke-width="4"/>',
 bars:'<rect x="-24" y="-24" width="48" height="48" fill="none"/><path d="M-12-24V24M0-24V24M12-24V24" stroke-width="4"/>',
 bird_free:'<path d="M-26 0Q-14-12 0 0Q14-12 26 0" fill="none" stroke-width="4"/><path d="M-20 16Q-12 8-4 16" fill="none" stroke-width="3"/>',
 clover:'<circle cx="-9" cy="-9" r="9" fill="#6cc070"/><circle cx="9" cy="-9" r="9" fill="#6cc070"/><circle cx="-9" cy="9" r="9" fill="#6cc070"/><circle cx="9" cy="9" r="9" fill="#6cc070"/><path d="M0 0Q8 18 16 28" fill="none" stroke="#3f8a4a" stroke-width="3"/>',
 mirror:'<ellipse cy="-4" rx="18" ry="22" fill="#d6f0fb"/><path d="M0 18V28M-10 28H10" stroke-width="3"/><path d="M-6-16Q-12-6-8 2" fill="none" stroke="#fffdf7" stroke-width="3"/>',
 flag:'<path d="M-18 28V-26" stroke-width="3"/><path d="M-18-26H22L14-14 22-2H-18Z" fill="#d65b3e"/>',
 target:'<circle r="26" fill="#fffdf7"/><circle r="17" fill="#f28b82"/><circle r="8" fill="#fffdf7"/><path d="M0 0 24-24" stroke-width="3"/>',
 rocketup:'<path d="M0-28Q12-16 12 6H-12Q-12-16 0-28Z" fill="#fffdf7"/><circle cy="-8" r="4" fill="#8fb5c0"/><path d="M-12 6-20 16H-10ZM12 6 20 16H10Z" fill="#d65b3e"/><path d="M-6 8Q0 26 6 8" fill="#f2994a"/>',
 hourglass:'<path d="M-16-26H16M-16 26H16M-12-26Q-12-6 0 0Q-12 6-12 26M12-26Q12-6 0 0Q12 6 12 26" fill="none" stroke-width="3"/><path d="M-6-14H6L0-4Z" fill="#ecd08e"/><path d="M-8 22Q0 10 8 22Z" fill="#ecd08e"/>',
 alarm:'<circle cy="2" r="22" fill="#f6c3b6"/><path d="M0-10V2L8 8" fill="none" stroke-width="3"/><path d="M-22-18-12-26M22-18 12-26" stroke-width="4"/>',
 strong:'<path d="M-26 10Q-26-10-10-10L-4-24Q4-28 6-20L2-10Q18-14 24 2Q28 18 8 20H-18Q-26 20-26 10Z" fill="#e8b48a"/>',
 piggy:'<ellipse cy="4" rx="24" ry="18" fill="#f6c3cf"/><circle cx="18" cy="-2" r="2"/><path d="M-6-14H6" stroke-width="3"/><path d="M-16 20V26M12 20V26" stroke-width="4"/>',
 mail:'<path d="M-26-16H26V18H-26Z" fill="#fffdf7"/><path d="M-26-16 0 4 26-16" fill="none"/><rect x="14" y="-12" width="8" height="8" fill="#d65b3e"/>',
 stamp:'<path d="M-18-22H18V22H-18Z" fill="#fffdf7" stroke-dasharray="3 2"/><circle r="9" fill="#f28b82"/>',
 megaphone:'<path d="M-24-6-6-6 18-20V20L-6 6H-24Z" fill="#f2c94c"/><path d="M-16 6-12 22H-4L-6 6" />',
 billboard:'<rect x="-28" y="-26" width="56" height="34" rx="2" fill="#fffdf7"/><path d="M-18-16H18M-18-8H8" fill="none"/><path d="M-12 8V28M12 8V28" stroke-width="4"/><path d="M-18-18 0-2" fill="none"/>',
 abc:'<rect x="-28" y="-20" width="56" height="40" rx="5" fill="#fffdf7"/><text x="0" y="8" text-anchor="middle" font-family="system-ui,sans-serif" font-size="22" font-weight="700" stroke="none" fill="#214b47">Abc</text>',
 numbers:'<rect x="-28" y="-20" width="56" height="40" rx="5" fill="#fffdf7"/><text x="0" y="8" text-anchor="middle" font-family="system-ui,sans-serif" font-size="20" font-weight="700" stroke="none" fill="#214b47">1+2</text>',
 punct:'<rect x="-28" y="-20" width="56" height="40" rx="5" fill="#fffdf7"/><text x="0" y="10" text-anchor="middle" font-family="system-ui,sans-serif" font-size="26" font-weight="700" stroke="none" fill="#214b47">. , ?</text>',
 quote:'<rect x="-28" y="-20" width="56" height="40" rx="5" fill="#fffdf7"/><text x="0" y="16" text-anchor="middle" font-family="Georgia,serif" font-size="38" stroke="none" fill="#214b47">“ ”</text>',
 mouth:'<ellipse rx="22" ry="14" fill="#f28b82"/><path d="M-22 0Q0 10 22 0" fill="none"/><path d="M-12-6h24" stroke="#fffdf7" stroke-width="4"/>',
 lungs:'<path d="M0-26V0M0-4Q-6 4-12 0M0-4Q6 4 12 0" fill="none" stroke-width="3"/><path d="M-6-12Q-26-14-26 10Q-26 24-10 22Q-6 18-6 0Z" fill="#f6c3cf"/><path d="M6-12Q26-14 26 10Q26 24 10 22Q6 18 6 0Z" fill="#f6c3cf"/>',
 stomach:'<path d="M-6-26V-14Q-20-14-22 4Q-22 24 0 24Q18 24 18 8Q18-2 8 0Q2-4 2-14V-26" fill="#f6c3cf"/>',
 joint:'<path d="M-24-24-4-4M4 4 24 24" stroke-width="8" stroke="#fff4dc"/><circle r="8" fill="#f28b82"/>',
 virus:'<circle r="16" fill="#9ccc65"/><path d="M0-16V-24M0 16V24M-16 0H-24M16 0H24M-11-11-17-17M11 11 17 17M-11 11-17 17M11-11 17-17" fill="none" stroke-width="3"/><circle cy="-26" r="3"/><circle cy="26" r="3"/><circle cx="-26" r="3"/><circle cx="26" r="3"/>',
 spots:'<circle r="24" fill="#f2d7a6"/><circle cx="-10" cy="-8" r="3" fill="#d65b3e"/><circle cx="8" cy="-12" r="3" fill="#d65b3e"/><circle cx="12" cy="6" r="3" fill="#d65b3e"/><circle cx="-6" cy="10" r="3" fill="#d65b3e"/><circle cx="2" cy="0" r="3" fill="#d65b3e"/>',
 blooddrop:'<path d="M0-26Q20 0 20 10A20 20 0 0 1-20 10Q-20 0 0-26Z" fill="#c0392b"/>',
 traffic:'<rect x="-28" y="-6" width="20" height="14" rx="3" fill="#d65b3e"/><rect x="-4" y="-6" width="20" height="14" rx="3" fill="#4c8fd6"/><rect x="20" y="-6" width="14" height="14" rx="3" fill="#f2c94c"/><rect x="-28" y="14" width="20" height="14" rx="3" fill="#6cc070"/><rect x="-4" y="14" width="20" height="14" rx="3" fill="#f2994a"/><path d="M-30-14H34" stroke-dasharray="6 4"/>',
 quiet:'<path d="M-24-8H-12L4-22V22L-12 8H-24Z"/><path d="M12-8 26 8M26-8 12 8" fill="none" stroke-width="4"/>',
 noise:'<path d="M-24-8H-12L4-22V22L-12 8H-24Z"/><path d="M10-12Q16 0 10 12M16-20Q28 0 16 20M22-26Q36 0 22 26" fill="none" stroke-width="3"/>',
 junk:'<path d="M-24 22-18 6-6 12-12 24ZM-6 24 0 0 12 6 6 24ZM10 24 18 10 28 18 24 26Z" fill="#c7cdd0"/><path d="M-14-2-2-16 8-6" fill="none" stroke-width="3"/><circle cx="18" cy="-8" r="6" fill="none"/>',
 sheets:'<path d="M-28 4 0-10 28 4 0 18Z" fill="#8fb5c0"/><path d="M-28 4V12L0 26 28 12V4" fill="#b8d3db"/><rect x="-14" y="-12" width="14" height="8" rx="3" fill="#fffdf7"/>',
 pencilcase:'<rect x="-28" y="-10" width="56" height="22" rx="10" fill="#c792ea"/><path d="M-20-6 18-22 22-16-16 0" fill="#f2c94c"/>',
 dollar:'<circle r="26" fill="#bfe3b0"/><text x="0" y="10" text-anchor="middle" font-family="system-ui,sans-serif" font-size="30" font-weight="700" stroke="none" fill="#214b47">$</text>',
 percent:'<circle r="26" fill="#fff1c1"/><text x="0" y="10" text-anchor="middle" font-family="system-ui,sans-serif" font-size="28" font-weight="700" stroke="none" fill="#214b47">%</text>',
 boss:'<circle cy="-14" r="10" fill="#b97d53"/><path d="M-20 26Q-20 0 0 0Q20 0 20 26Z" fill="#3b4f8a"/><path d="M0 0 -4 14 0 22 4 14Z" fill="#d65b3e"/>',
 worker:'<circle cy="-12" r="10" fill="#e0a560"/><path d="M-12-16Q-12-28 0-28Q12-28 12-16Z" fill="#f2c94c"/><path d="M-20 26Q-20 2 0 2Q20 2 20 26Z" fill="#f2994a"/>',
 robotarm:'<path d="M-24 26H0M-12 26V8L4-10 20-2" fill="none" stroke-width="5"/><circle cx="-12" cy="8" r="4"/><circle cx="4" cy="-10" r="4"/><path d="M20-2 28-10M20-2 28 4" stroke-width="3"/>',
 conveyor:'<rect x="-28" y="6" width="56" height="12" rx="6"/><circle cx="-20" cy="12" r="3"/><circle cx="20" cy="12" r="3"/><rect x="-18" y="-10" width="14" height="16" fill="#d9b071"/><rect x="4" y="-10" width="14" height="16" fill="#d9b071"/>',
 contract:'<path d="M-18-26H18V26H-18Z" fill="#fffdf7"/><path d="M-10-16H10M-10-8H10M-10 0H4" fill="none"/><path d="M-8 16Q-2 8 2 16T12 14" fill="none" stroke="#3b4f8a" stroke-width="2.5"/>',
 stack:'<path d="M-22 18H22V26H-22ZM-20 8H20V16H-20ZM-22-2H22V6H-22ZM-18-12H18V-4H-18ZM-20-22H20V-14H-20Z" fill="#fffdf7"/>',
 folder:'<path d="M-28-18H-6L0-12H28V22H-28Z" fill="#f2c94c"/>',
 network:'<circle cx="0" cy="-18" r="7" fill="#8fb5c0"/><circle cx="-20" cy="14" r="7" fill="#8fb5c0"/><circle cx="20" cy="14" r="7" fill="#8fb5c0"/><path d="M0-11-16 9M0-11 16 9M-13 14H13" fill="none"/>',
 server:'<rect x="-20" y="-26" width="40" height="16" rx="2" fill="#d6dde0"/><rect x="-20" y="-8" width="40" height="16" rx="2" fill="#d6dde0"/><rect x="-20" y="10" width="40" height="16" rx="2" fill="#d6dde0"/><circle cx="12" cy="-18" r="2.5" fill="#6cc070"/><circle cx="12" r="2.5" fill="#6cc070"/><circle cx="12" cy="18" r="2.5" fill="#6cc070"/>',
 umbrella:'<path d="M-28 0Q-28-26 0-26Q28-26 28 0Q22-6 14 0Q7-6 0 0Q-7-6-14 0Q-22-6-28 0Z" fill="#8fb5c0"/><path d="M0 0V20Q0 26-6 24" fill="none" stroke-width="3"/>',
 crown:'<path d="M-24 18-28-16-12 0 0-22 12 0 28-16 24 18Z" fill="#f2c94c"/>',
 ladder:'<path d="M-12-28V28M12-28V28M-12-18H12M-12-6H12M-12 6H12M-12 18H12" fill="none" stroke-width="3"/>',
 mug:'<path d="M-18-16H12V18Q12 24 6 24H-12Q-18 24-18 18Z" fill="#fffdf7"/><path d="M12-8Q24-8 22 4Q20 10 12 8" fill="none"/>',
 bowl:'<path d="M-26-4H26Q26 22 0 22Q-26 22-26-4Z" fill="#fffdf7"/>',
 brain:'<path d="M-4-22Q-18-28-24-14Q-30-2-22 8Q-22 22-6 20Q-2 24 2 20Q18 24 22 10Q30 0 22-12Q18-28 4-22Q0-26-4-22Z" fill="#f6c3cf"/><path d="M0-22V20M-14-10Q-8-6-12 2M12-8Q6-2 12 4" fill="none"/>',
 graduation:'<path d="M-30-4 0-16 30-4 0 8Z" fill="#3b4f8a"/><path d="M-16 2V14Q0 22 16 14V2" fill="#3b4f8a"/><path d="M24-2V14" stroke-width="2"/>',
 teacher:'<rect x="-6" y="-24" width="36" height="24" fill="#3f6b55"/><path d="M0-16h20M0-10h14" stroke="#fffdf7"/><circle cx="-20" cy="-12" r="7" fill="#b97d53"/><path d="M-30 24Q-30 0-20 0Q-10 0-10 24Z" fill="#8fb5c0"/><path d="M-12-2-2-12" stroke-width="3"/>',
 blank:''
};
export const SYMBOLS = [...Object.keys(S), ...CW].filter(k => k !== 'blank');
export const FACES = ['happy','sad','angry','scared','calm','surprised','proud','tired','bored','worried','loving','excited','confused','brave','kind','ashamed','jealous','hopeful','grumpy','sick','thoughtful','dreamy'];
export const HOLDERS = ['glass','cup','mug','bowl','jar','bottle','bag','plate','pile','box','tank','pot','carton','tube','can','bucket','sack','tray','shelf','basket'];
export const FILLS = ['liquid','grains','powder','chunks','leaves','strands','slab','foam','gas','sparkle','paste','flakes'];
export const SKIES = ['rain','snow','fog','mist','wind','sun','sunlight','lightning','thunder','hail','sleet','frost','dew','heat','cold','dark','daylight','storm','smoke','steam','dust','pollution','rainbow','night','clouds'];
export const UNITS = ['piece','item','glass','cup','bowl','bottle','carton','jar','loaf','slice','bar','scoop','sheet','grain','lump','strand','drop','bag','box','load','spoonful','bunch','head','stick','can','cube','pinch','roll','tube','game','session','trip','flash','clap','gust','ray','bolt','project','kit','pair','set','pile','pot','plate','basket','file','tank','meal','dose'];

let clipSerial = 0;
const text = (x, y, s, size = 16, w = 'normal', fill = INK) => `<text x="${x}" y="${y}" text-anchor="middle" fill="${fill}" stroke="none" font-family="system-ui,sans-serif" font-size="${size}" font-weight="${w}">${escape(s)}</text>`;
const rect = (x, y, w, h, fill = '#fff8eb', extra = '') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12" fill="${fill}" ${extra}/>`;
export function sym(name, x, y, scale = 1, fill = '#f2b95d', opacity = 1){
 if (CW.includes(name)) return cwIcon({ art: name }, x, y, scale, fill, opacity);
 const body = S[name] ?? S.question;
 return `<g transform="translate(${x} ${y}) scale(${scale})" fill="${fill}" stroke="${INK}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" opacity="${opacity}">${body}</g>`;
}
function person(x, y, label, skin = '#b97d53', shirt = '#8fb5c0', s = 1){
 return `<g transform="translate(${x} ${y}) scale(${s})" stroke="${INK}" stroke-width="3"><circle cy="-22" r="15" fill="${skin}"/><path d="M-24 26Q-26-4 0-4Q26-4 24 26Z" fill="${shirt}"/></g>` + (label ? text(x, y + 50 * s, label, 13) : '');
}
const bubble = (x, y, w, h, tailX, tailY, think) => think
 ? `<ellipse cx="${x}" cy="${y}" rx="${w / 2}" ry="${h / 2}" fill="#fff" stroke="${INK}" stroke-width="2.5"/><circle cx="${tailX + (x - tailX) * .45}" cy="${tailY + (y - tailY) * .45}" r="7" fill="#fff" stroke="${INK}" stroke-width="2"/><circle cx="${tailX + (x - tailX) * .2}" cy="${tailY + (y - tailY) * .2}" r="4" fill="#fff" stroke="${INK}" stroke-width="2"/>`
 : `<path d="M${x - w / 2} ${y - h / 2}H${x + w / 2}V${y + h / 2}H${x + 12}L${tailX} ${tailY}L${x - 8} ${y + h / 2}H${x - w / 2}Z" fill="#fff" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/>`;
const arrow = (d, color = RED) => `<path d="${d}" fill="none" stroke="${color}" stroke-width="5" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${color}" stroke-width="1" marker-end="url(#tip)"/>`;

// A face that shows a feeling (eyes, brows and mouth only).
function face(x, y, kind, r = 70){
 const k = r / 26, e = (d) => `<g transform="translate(${x} ${y}) scale(${k})" stroke="${INK}" stroke-width="${2.6 / k * 2}" fill="none" stroke-linecap="round">${d}</g>`;
 const M = {
  happy:'<path d="M-10-6h1M10-6h1"/><path d="M-11 6Q0 16 11 6"/>', sad:'<path d="M-10-5h1M10-5h1"/><path d="M-10 13Q0 4 10 13"/><path d="M-14-12-6-10M14-12 6-10"/>',
  angry:'<path d="M-14-12-5-7M14-12 5-7"/><path d="M-10-3h1M10-3h1"/><path d="M-10 12Q0 6 10 12"/>', scared:'<circle cx="-9" cy="-5" r="3"/><circle cx="9" cy="-5" r="3"/><ellipse cy="10" rx="5" ry="6"/><path d="M-14-13-5-11M14-13 5-11"/>',
  calm:'<path d="M-13-5Q-9-2-5-5M5-5Q9-2 13-5"/><path d="M-7 8Q0 11 7 8"/>', surprised:'<circle cx="-9" cy="-6" r="3"/><circle cx="9" cy="-6" r="3"/><circle cy="10" r="5"/><path d="M-14-14-5-15M14-14 5-15"/>',
  proud:'<path d="M-13-6Q-9-9-5-6M5-6Q9-9 13-6"/><path d="M-10 6Q0 13 10 6"/><path d="M-2-24 0-30 2-24"/>', tired:'<path d="M-13-4H-5M5-4H13"/><path d="M-5 10H5"/><path d="M14-18h6l-6 6h6" stroke-width="1.2"/>',
  bored:'<path d="M-13-5H-5M5-5H13"/><path d="M-8 10H8"/>', worried:'<path d="M-10-5h1M10-5h1"/><path d="M-10 11Q-5 7 0 11T10 11"/><path d="M-14-10-6-13M14-10 6-13"/>',
  loving:'<path d="M-12-8Q-9-12-8-8Q-6-12-4-8L-8-3Z M4-8Q6-12 8-8Q9-12 12-8L8-3Z"/><path d="M-10 7Q0 15 10 7"/>', excited:'<path d="M-12-5-8-9-4-5M4-5 8-9 12-5"/><path d="M-11 5Q0 18 11 5Z"/>',
  confused:'<path d="M-10-5h1M10-5h1"/><path d="M-9 10Q-3 6 2 10T10 8"/><path d="M-14-12-6-10M6-13 14-14"/>', brave:'<path d="M-14-11-5-8M14-11 5-8"/><path d="M-10-3h1M10-3h1"/><path d="M-9 8Q0 13 9 8"/>',
  kind:'<path d="M-13-5Q-9-9-5-5M5-5Q9-9 13-5"/><path d="M-10 6Q0 14 10 6"/>', ashamed:'<path d="M-12 0Q-9 2-6 0M6 0Q9 2 12 0"/><path d="M-6 11H6"/><path d="M-15 5h4M11 5h4" stroke="#d65b3e"/>',
  jealous:'<path d="M-13-6H-5M5-6H13"/><path d="M-9-4h1M12-4h1"/><path d="M-8 10Q0 7 8 11"/>', hopeful:'<path d="M-10-7h1M10-7h1"/><path d="M-8 8Q0 12 8 8"/><path d="M-12-14-6-12M12-14 6-12"/>',
  grumpy:'<path d="M-14-9-5-6M14-9 5-6"/><path d="M-9-2h1M9-2h1"/><path d="M-8 11Q0 7 8 11"/>', sick:'<path d="M-12-6-6-3M-12-3-6-6M6-6 12-3M6-3 12-6"/><path d="M-8 11Q-4 8 0 11T8 11"/>',
  thoughtful:'<path d="M-10-5h1M10-7h1"/><path d="M-4 10H8"/><path d="M-12-13-5-12M5-15 12-14"/>', dreamy:'<path d="M-13-5Q-9-2-5-5M5-5Q9-2 13-5"/><path d="M-6 9Q0 12 6 9"/>'
 };
 return `<circle cx="${x}" cy="${y}" r="${r}" fill="#f2d7a6" stroke="${INK}" stroke-width="3"/>` + e(M[kind] || M.calm);
}

// Something held in a holder; level is 0..1 of the holder filled.
function holder(kind, x, y, s, fill, color, level = .75){
 const g = (inner, outline) => `<g transform="translate(${x} ${y}) scale(${s})" stroke="${INK}" stroke-width="${2.5 / s}" stroke-linejoin="round" stroke-linecap="round">${inner}${outline}</g>`;
 const id = 'c' + (++clipSerial);
 // Holder outline paths (inside space roughly x -40..40, y -45..45).
 const O = {
  glass:'M-28-44H28L22 44H-22Z', cup:'M-34-30H34V20Q34 44 10 44H-10Q-34 44-34 20Z', mug:'M-30-34H24V34Q24 44 14 44H-20Q-30 44-30 34Z', bowl:'M-48-6H48Q48 40 0 40Q-48 40-48-6Z',
  jar:'M-28-34H28V-26Q36-20 36-6V34Q36 44 26 44H-26Q-36 44-36 34V-6Q-36-20-28-26Z', bottle:'M-10-50H10V-30Q28-22 28-4V44H-28V-4Q-28-22-10-30Z', bag:'M-36-30H36L42 44H-42Z',
  plate:'M-56 14Q-56 28 0 28Q56 28 56 14Z', pile:'M-60 44Q-30-30 0-30Q30-30 60 44Z', box:'M-44-30H44V44H-44Z', tank:'M-60-40H60V44H-60Z', pot:'M-46-20H46V30Q46 44 30 44H-30Q-46 44-46 30Z',
  carton:'M-28-30 0-50 28-30V44H-28Z', tube:'M-50-14H40L52-6V6L40 14H-50Z', can:'M-30-40H30V44H-30Z', bucket:'M-40-30H40L32 44H-32Z', sack:'M-36-34Q-46 0-40 44H40Q46 0 36-34Q24-26 0-34Q-24-26-36-34Z', tray:'M-60 20H60V36H-60Z', shelf:'M-60 30H60V40H-60Z', basket:'M-48-10H48L38 44H-38Z'
 }[kind] || 'M-44-30H44V44H-44Z';
 const open = ['plate','pile','tray','shelf'].includes(kind);
 const top = -46, bottom = 44, ly = bottom - (bottom - top) * Math.max(0.05, Math.min(1, level));
 let stuff = '';
 const C = color || '#7cc4e8';
 if (open && fill === 'none') return g('', `<path d="${O}" fill="#fffdf7"/>`);
 if (open) {
  // Stuff sits on top: a mound sized by level.
  const h = 20 + 50 * level, w = 30 + 34 * level, by = kind === 'plate' ? 14 : kind === 'tray' ? 20 : kind === 'shelf' ? 30 : 44;
  if (kind === 'pile') return g(`<path d="M${-60 * level - 6} 44Q${-30 * level} ${44 - 70 * level} 0 ${44 - 74 * level}Q${30 * level} ${44 - 70 * level} ${60 * level + 6} 44Z" fill="${C}"/>` + texture(fill, -50 * level, 44 - 60 * level, 100 * level, 56 * level), '');
  stuff = `<path d="M${-w} ${by}Q${-w * .6} ${by - h} 0 ${by - h}Q${w * .6} ${by - h} ${w} ${by}Z" fill="${C}"/>` + texture(fill, -w * .8, by - h * .9, w * 1.6, h * .8);
  return g(stuff, `<path d="${O}" fill="#fffdf7"/>`);
 }
 const clip = `<clipPath id="${id}"><path d="${O}"/></clipPath>`;
 stuff = `<g clip-path="url(#${id})"><rect x="-70" y="${ly}" width="140" height="${bottom - ly + 4}" fill="${C}" stroke="none"/>${fill === 'liquid' ? `<path d="M-70 ${ly}H70" stroke="#fffdf7" stroke-width="3" opacity=".6"/>` : texture(fill, -60, ly + 4, 120, bottom - ly - 4)}</g>`;
 return g(`<defs>${clip}</defs>` + stuff, `<path d="${O}" fill="none"/>`);
}
// Small marks that tell grains from powder from leaves (shape, not only colour).
function texture(kind, x, y, w, h){
 if (h <= 4 || w <= 4) return '';
 let out = '', n = 0, rnd = (i) => ((Math.sin(i * 12.9898) * 43758.5453) % 1 + 1) % 1;
 const cols = Math.max(2, Math.round(w / 14)), rows = Math.max(1, Math.round(h / 12));
 for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
  const px = x + (c + .5) * w / cols + (rnd(++n) - .5) * 6, py = y + (r + .5) * h / rows + (rnd(++n) - .5) * 4;
  if (kind === 'grains') out += `<ellipse cx="${px}" cy="${py}" rx="3.2" ry="1.8" fill="#fffdf7" stroke="${INK}" stroke-width=".8"/>`;
  else if (kind === 'powder' || kind === 'flakes') out += `<circle cx="${px}" cy="${py}" r="${kind === 'flakes' ? 1.8 : 1}" fill="${INK}" stroke="none" opacity=".45"/>`;
  else if (kind === 'chunks') { if ((r + c) % 2 === 0) out += `<rect x="${px - 4}" y="${py - 3}" width="8" height="6" rx="1.5" fill="none" stroke="${INK}" stroke-width="1.2"/>`; }
  else if (kind === 'leaves') { if ((r + c) % 2 === 0) out += `<path d="M${px - 5} ${py}Q${px} ${py - 6} ${px + 5} ${py}Q${px} ${py + 6} ${px - 5} ${py}Z" fill="#9ccc65" stroke="${INK}" stroke-width=".9"/>`; }
  else if (kind === 'strands') { if (c % 2 === 0) out += `<path d="M${px - 6} ${py - 4}Q${px} ${py + 4} ${px + 6} ${py - 4}" fill="none" stroke="${INK}" stroke-width="1.2"/>`; }
  else if (kind === 'foam' || kind === 'gas') { if ((r * 3 + c) % 3 === 0) out += `<circle cx="${px}" cy="${py}" r="3.5" fill="none" stroke="${INK}" stroke-width="1" opacity=".6"/>`; }
  else if (kind === 'sparkle') { if ((r + c) % 3 === 0) out += `<path d="M${px} ${py - 4}V${py + 4}M${px - 4} ${py}H${px + 4}" stroke="#fffdf7" stroke-width="1.6"/>`; }
  else if (kind === 'paste') { if (c % 3 === 0 && r === 0) out += `<path d="M${px - 8} ${py}Q${px} ${py - 5} ${px + 8} ${py}" fill="none" stroke="${INK}" stroke-width="1" opacity=".6"/>`; }
 }
 return out;
}

// Weather and nature: a framed outdoor view with the element drawn across it.
function sky(el, x = 300, y = 175, w = 420, h = 230){
 const L = x - w / 2, T = y - h / 2, R = L + w, B = T + h, ground = B - 40;
 const dark = ['dark','night','storm','thunder','lightning'].includes(el), grey = ['rain','fog','mist','hail','sleet','smoke','pollution','clouds','cold','wind'].includes(el);
 const bg = dark ? '#3b4f6b' : grey ? '#cfd8dc' : el === 'heat' ? '#ffe2b8' : '#d6ecf7';
 let o = `<rect x="${L}" y="${T}" width="${w}" height="${h}" rx="14" fill="${bg}"/><path d="M${L} ${ground}H${R}V${B - 14}Q${R} ${B} ${R - 14} ${B}H${L + 14}Q${L} ${B} ${L} ${B - 14}Z" fill="${el === 'snow' || el === 'frost' ? '#f4f9fb' : '#9ccc65'}"/>`;
 const each = (n, f) => { let s = ''; for (let i = 0; i < n; i++) s += f(i); return s; };
 const cloud = (cx, cy, s = 1, fill = '#e6ecef') => sym('cloud', cx, cy, s, fill);
 switch (el) {
  case 'rain': o += cloud(x - 80, T + 50, 1.4, '#b0bec5') + cloud(x + 70, T + 45, 1.6, '#b0bec5') + each(22, i => `<path d="M${L + 30 + (i * 37) % (w - 60)} ${T + 85 + (i * 23) % 70}l-6 14" stroke="#4c8fd6" stroke-width="3" stroke-linecap="round"/>`); break;
  case 'snow': o += cloud(x - 70, T + 45, 1.4) + cloud(x + 80, T + 50, 1.3) + each(20, i => sym('flake', L + 30 + (i * 41) % (w - 60), T + 90 + (i * 29) % 80, .32, 'none')); break;
  case 'hail': case 'sleet': o += cloud(x, T + 48, 1.8, '#b0bec5') + each(20, i => el === 'hail' ? `<circle cx="${L + 30 + (i * 41) % (w - 60)}" cy="${T + 90 + (i * 29) % 80}" r="5" fill="#fff" stroke="${INK}" stroke-width="1.5"/>` : `<path d="M${L + 30 + (i * 41) % (w - 60)} ${T + 90 + (i * 29) % 80}l-5 10" stroke="#4c8fd6" stroke-width="3"/><circle cx="${L + 50 + (i * 37) % (w - 80)}" cy="${T + 100 + (i * 19) % 70}" r="3" fill="#fff" stroke="${INK}"/>`); break;
  case 'fog': case 'mist': o += sym('tree', L + 90, ground - 30, 1.1) + sym('house', x + 60, ground - 26, 1.1) + each(el === 'fog' ? 6 : 3, i => `<path d="M${L + 10} ${T + 60 + i * 28}H${R - 10}" stroke="#fff" stroke-width="${el === 'fog' ? 16 : 10}" stroke-linecap="round" opacity=".8"/>`); break;
  case 'wind': o += sym('tree', L + 110, ground - 30, 1.2) + `<g transform="rotate(12 ${L + 110} ${ground})"></g>` + sym('wind', x + 50, T + 80, 2) + sym('leaf', x + 140, T + 130, .5) + sym('leaf', x + 90, T + 150, .4); break;
  case 'sun': case 'sunlight': case 'daylight': case 'heat': o += sym('sun', R - 90, T + 70, el === 'heat' ? 2.2 : 1.8) + (el === 'sunlight' ? each(5, i => `<path d="M${R - 110 - i * 10} ${T + 95 + i * 6}L${L + 80 + i * 50} ${ground}" stroke="#f2c94c" stroke-width="5" opacity=".7"/>`) : '') + sym('tree', L + 90, ground - 30, 1.1) + (el === 'heat' ? sym('thermometer', L + 180, ground - 50, 1.3) : sym('house', x, ground - 26, 1.1)); break;
  case 'lightning': case 'storm': o += cloud(x - 40, T + 55, 1.9, '#78909c') + sym('bolt', x - 30, T + 125, 1.6) + (el === 'storm' ? each(14, i => `<path d="M${L + 40 + (i * 37) % (w - 80)} ${T + 95 + (i * 23) % 60}l-6 14" stroke="#9fd3e8" stroke-width="3"/>`) : ''); break;
  case 'thunder': o += cloud(x - 30, T + 60, 2, '#78909c') + text(x + 110, T + 80, 'BOOM!', 30, '900', '#f2c94c') + `<path d="M${x + 60} ${T + 100}l16 10M${x + 70} ${T + 70}l20-2M${x + 65} ${T + 45}l16-12" stroke="#f2c94c" stroke-width="4"/>` + person(L + 90, ground - 30, '', '#b97d53', '#8fb5c0', .8) + `<path d="M${L + 70} ${ground - 60}h-8M${L + 110} ${ground - 60}h8" stroke="${INK}" stroke-width="3"/>`; break;
  case 'frost': o += sym('grass', L + 80, ground + 8, 1.4, '#cfe9f5') + sym('pane', x + 70, T + 90, 1.8) + each(10, i => `<path d="M${x + 30 + (i * 13) % 80} ${T + 50 + (i * 17) % 80}l6 6m0-6-6 6" stroke="#fff" stroke-width="2"/>`); break;
  case 'dew': o += sym('grass', x, ground + 6, 3) + each(8, i => sym('drop', L + 90 + i * 32, ground - 10 - (i % 3) * 8, .28)); break;
  case 'cold': o += person(x - 40, ground - 30, '', '#b97d53', '#8fb5c0') + sym('scarf', x - 40, ground - 40, .7, '#d65b3e') + sym('thermometer', x + 90, ground - 60, 1.4, '#cfe9f5') + each(8, i => sym('flake', L + 40 + i * 50, T + 40 + (i % 2) * 30, .3, 'none')); break;
  case 'dark': case 'night': o += sym('moon', R - 90, T + 60, 1.2) + each(9, i => sym('star', L + 40 + (i * 47) % (w - 80), T + 30 + (i * 31) % 90, .25, '#f2e9a6')) + sym('house', x - 40, ground - 26, 1.1, '#5d6d7e'); break;
  case 'smoke': case 'pollution': o += sym('factory', x - 40, ground - 28, 1.8) + sym('smoke', x - 10, T + 70, el === 'pollution' ? 2.4 : 1.8, el === 'pollution' ? '#90a4ae' : '#cfd8dc') + (el === 'pollution' ? sym('bin', x + 130, ground - 20, .8) : ''); break;
  case 'steam': o += sym('pot', x, ground - 40, 2.2); break;
  case 'dust': o += each(30, i => `<circle cx="${L + 20 + (i * 53) % (w - 40)}" cy="${T + 30 + (i * 37) % (h - 80)}" r="${1.5 + (i % 3)}" fill="#a1887f" opacity=".7"/>`) + sym('sun', R - 80, T + 60, 1.2) + sym('rock', L + 80, ground - 10, 1); break;
  case 'rainbow': o += [RED, '#f2994a', '#f2c94c', '#6cc070', '#4c8fd6', '#7e57c2'].map((c, i) => `<path d="M${L + 60 + i * 12} ${ground}A${150 - i * 12} ${150 - i * 12} 0 0 1 ${R - 60 - i * 12} ${ground}" fill="none" stroke="${c}" stroke-width="10"/>`).join(''); break;
  case 'clouds': o += cloud(x - 100, T + 60, 1.4) + cloud(x + 30, T + 90, 1.8) + cloud(x + 140, T + 55, 1.2); break;
 }
 return o;
}

// The meaning picture for a noun, from its spec.
function meaningCore(p){
 const c = p.color || undefined;
 switch (p.t) {
  case 'stuff': return rect(140, 60, 320, 240, '#f5f2e7') + holder(p.holder || 'glass', 300, 195, 2.1, p.fill || 'liquid', p.color, .72) + (p.sym ? sym(p.sym, 300, p.holder === 'plate' || p.holder === 'tray' ? 165 : 185, 1.4, c) : '');
  case 'thing': return rect(140, 60, 320, 240, '#f5f2e7') + (p.holder ? holder(p.holder, 300, 230, 1.6, 'none', '#fffdf7', 0) : '') + sym(p.sym, 300, p.holder ? 170 : 180, p.holder ? 2.6 : 3.2, c) + (p.sym2 ? sym(p.sym2, 395, 230, 1.1, p.color2) : '');
  case 'sky': return sky(p.el || 'rain');
  case 'talk': return person(120, 230, p.a || 'MAYA', '#b97d53', '#8fb5c0') + person(480, 230, p.b || 'LEO', '#e0a560', '#f2b95d') + bubble(300, 110, 180, 110, 150, 175, false) + sym(p.sym || 'bulb', 300, 108, 1.5, c) + (p.sym2 ? sym(p.sym2, 345, 135, .6, p.color2) : '');
  case 'think': return person(170, 240, p.a || 'MAYA') + bubble(390, 115, 230, 150, 205, 190, true) + sym(p.sym || 'bulb', p.sym2 ? 355 : 390, 115, 1.5, c) + (p.sym2 ? sym(p.sym2, 430, 115, 1.2, p.color2) : '');
  case 'feel': return face(220, 180, p.face || 'happy', 110) + (p.sym ? sym(p.sym, 440, 170, 2.6, c) : '') + (p.sym2 ? sym(p.sym2, 470, 260, 1, p.color2) : '');
  case 'do': return person(190, 235, p.a || '', '#b97d53', '#8fb5c0', 1.2) + sym(p.sym || 'pencil', 380, 190, 2.8, c) + (p.sym2 ? sym(p.sym2, 470, 250, 1.2, p.color2) : '') + `<path d="M265 150q10-12 20 0M268 175q10-12 20 0" fill="none" stroke="${RED}" stroke-width="3" stroke-linecap="round"/>`;
  case 'group': { const xs = (p.syms || ['chair','table','lamp']).slice(0, 4); return rect(100, 70, 400, 220, '#f5f2e7') + xs.map((s, i) => sym(s, 160 + i * (280 / Math.max(1, xs.length - 1 || 1)) * (xs.length > 1 ? 1 : 0) + (xs.length === 1 ? 140 : 0), 180 + (i % 2) * 30, 1.9, i === 0 ? c : undefined)).join(''); }
  case 'screen': return `<rect x="150" y="70" width="300" height="190" rx="14" fill="${INK}"/><rect x="166" y="86" width="268" height="158" rx="6" fill="#e6f2f6"/><path d="M270 260v24h60v-24M240 290h120" stroke="${INK}" stroke-width="5" fill="none"/>` + sym(p.sym || 'code', 300, 165, 2.3, c) + (p.sym2 ? sym(p.sym2, 395, 210, .8, p.color2) : '');
  case 'give': return person(110, 230, p.a || 'MAYA') + person(490, 230, p.b || 'LEO', '#e0a560', '#f2b95d') + arrow('M170 150H420') + sym(p.sym || 'hand', 300, 205, 1.5, c);
  case 'meter': { const lv = p.level ?? .85; return sym(p.sym || 'star', 190, 180, 3.2, c) + `<rect x="320" y="90" width="60" height="180" rx="10" fill="#fff" stroke="${INK}" stroke-width="3"/><rect x="326" y="${96 + 168 * (1 - lv)}" width="48" height="${168 * lv}" rx="6" fill="#6cc070"/>` + text(350, 300, lv > .5 ? 'HIGH' : 'LOW', 14); }
  case 'place': return rect(100, 60, 400, 240, '#e6f2e0') + (p.syms || ['tree','house','mountain']).slice(0, 4).map((s, i, a) => sym(s, 160 + i * (280 / Math.max(1, a.length - 1)), 200 - (i % 2) * 40, 1.6)).join('');
  case 'people': return person(200, 230, p.a || 'MAYA') + person(400, 230, p.b || 'LEO', '#e0a560', '#f2b95d') + sym(p.sym || 'handshake', 300, 150, 1.6, c);
  default: return sym(p.sym || 'question', 300, 180, 2.6, c);
 }
}

// The noun's small "unit of stuff": used to show amounts and countable units.
function glyph(p, x, y, s){
 if (p.t === 'stuff') return holder(p.holder === 'plate' || p.holder === 'tray' || p.holder === 'shelf' ? 'pile' : p.holder || 'glass', x, y, s * .7, p.fill || 'liquid', p.color, .7) + (p.sym ? sym(p.sym, x, y, s * .6, p.color) : '');
 if (p.t === 'sky') return sym({ rain:'drop', snow:'flake', hail:'ice', sleet:'drop', fog:'cloud', mist:'cloud', wind:'wind', sun:'sun', sunlight:'sun', daylight:'sun', heat:'sun', lightning:'bolt', storm:'storm', thunder:'storm', frost:'flake', dew:'drop', cold:'flake', dark:'moon', night:'moon', smoke:'smoke', pollution:'smoke', steam:'smoke', dust:'gravel', rainbow:'sun', clouds:'cloud' }[p.el] || 'cloud', x, y, s, p.el === 'rain' || p.el === 'dew' ? '#7cc4e8' : undefined);
 if (p.t === 'feel') return p.sym ? sym(p.sym, x, y, s, p.color) : face(x, y, p.face || 'happy', 26 * s);
 return sym(p.sym || (p.syms && p.syms[0]) || 'question', x, y, s, p.color);
}

// "a lot of" / "a little": the same stuff, big amount or small amount, with an amount meter beside it.
function amountCore(p, big){
 let o = rect(70, 60, 360, 240, '#f5f2e7');
 if (p.t === 'stuff' && p.holder !== 'plate' && p.holder !== 'tray') o += holder(['bowl','plate','pile','tray'].includes(p.holder) ? 'pile' : 'tank', 250, 200, big ? 1.9 : 1.9, p.fill || 'liquid', p.color, big ? .92 : .14);
 else {
  const spots = big ? [[150,130],[210,110],[270,130],[330,115],[160,190],[225,175],[290,190],[350,180],[190,250],[255,240],[320,250]] : [[250,190]];
  o += spots.map(([x, y]) => glyph(p, x, y, big ? .78 : .95)).join('');
 }
 const lv = big ? .92 : .14;
 o += `<rect x="470" y="70" width="56" height="220" rx="10" fill="#fff" stroke="${INK}" stroke-width="3"/><rect x="476" y="${76 + 208 * (1 - lv)}" width="44" height="${208 * lv}" rx="6" fill="${big ? '#f2994a' : '#9fd3e8'}"/>` + text(498, 318, big ? 'A LOT' : 'A LITTLE', 14, '700');
 return o;
}

// Units: one or three countable units (pieces, glasses, loaves...) of the noun.
const UNIT_SHAPE = { piece:'puzzle', item:'ticket', glass:'glass', cup:'cup', bowl:'bowl', bottle:'bottle', carton:'carton', jar:'jar', loaf:'bread', slice:'toastslice', bar:'chocolate', scoop:'icecream', sheet:'paper', grain:'grains', lump:'coal', strand:'hairlock', drop:'drop', bag:'bag', box:'box', load:'basket', spoonful:'spoon', bunch:'herb', head:'greens', stick:'butter', can:'can', cube:'ice', pinch:'shaker', roll:'yarn', tube:'tube', game:'chess', session:'clock', trip:'suitcase', flash:'bolt', clap:'storm', gust:'wind', ray:'sun', bolt:'bolt', project:'folder', kit:'medkit', pair:'shoe', set:'dishes', pile:'stack', pot:'pot', plate:'plate', basket:'basket', file:'folder', tank:'can', meal:'plate', dose:'pill' };
function unitCore(p, n, unit){
 const u = (unit && unit.shape) || 'piece', holders = ['glass','cup','bowl','bottle','carton','jar','bag','box','can','pot','plate','basket','tank'];
 const xs = n === 1 ? [300] : [170, 300, 430], s = n === 1 ? 1.25 : 1.05;
 let o = rect(70, 60, 460, 240, '#f5f2e7');
 xs.forEach((x, i) => {
  if (holders.includes(u) && p.t === 'stuff') o += holder(u === 'tank' ? 'can' : u, x, 185, s * .95, p.fill || 'liquid', p.color, .75);
  else if (holders.includes(u)) o += holder(u === 'tank' ? 'can' : u, x, 185, s * .95, 'none', '#fffdf7', 0) + glyph(p, x, 185, .7 * s);
  else o += `<g>${sym(UNIT_SHAPE[u] || 'puzzle', x, 185, 2.1 * s, u === 'piece' || u === 'item' ? '#fff1c1' : p.color)}</g>` + (['piece','item','sheet','file','project','session','game','kit','set'].includes(u) ? glyph(p, x, 190, .95 * s) : '');
  o += `<circle cx="${x + 52 * s}" cy="${110}" r="15" fill="${RED}"/>` + text(x + 52 * s, 116, String(i + 1), 16, '700', '#fff');
 });
 return o;
}

// Each scene: kind is 'meaning' | 'other' (another noun's meaning picture) | 'lot' | 'little' | 'units' | 'unit'.
export function illustration(s, kind = s.kind, { caption = true, legend = true } = {}){
 const p = kind === 'other' ? s.other.pic : s.noun.pic;
 const body = kind === 'meaning' || kind === 'other' ? meaningCore(p) : kind === 'lot' ? amountCore(p, true) : kind === 'little' ? amountCore(p, false) : kind === 'units' ? unitCore(p, 3, s.noun.unit) : unitCore(p, 1, s.noun.unit);
 const note = kind === 'meaning' || kind === 'other' ? 'pictures show a meaning • the word is not written in the picture' : kind === 'lot' || kind === 'little' ? 'the bar shows how much • uncountable: no number in front' : 'count the units • the number dots count units, not the stuff';
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 365" role="img" aria-label="${escape(caption ? s.sentence : 'Illustrated answer option; use Read this to me for a text alternative.')}"><defs><marker id="tip" markerWidth="12" markerHeight="12" refX="9" refY="5" orient="auto" markerUnits="userSpaceOnUse"><path d="M0 0L10 5L0 10Z" fill="${RED}"/></marker></defs><rect width="600" height="365" rx="20" fill="${CREAM}"/><g stroke="${INK}" stroke-width="2">${body}</g>${legend ? text(300, 350, note, 12) : ''}</svg>`;
}
export const describe = (s, kind = s.kind) => kind === 'other' ? `a picture of ${s.other.kid}` : kind === 'meaning' ? `a picture of ${s.noun.kid}` : kind === 'lot' ? `a large amount of ${s.noun.word}` : kind === 'little' ? `a small amount of ${s.noun.word}` : kind === 'units' ? `three ${s.noun.unit?.many || 'units'} of ${s.noun.word}` : `one ${s.noun.unit?.one || 'unit'} of ${s.noun.word}`;
