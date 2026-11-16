/* THE WED THEORY — content, option catalogue and the production manifest maths */
const IMG = n => 'img/' + n + '.jpg';
const WA = '923137027761', WA_TXT = '+92 313 7027761', IG = 'https://www.instagram.com/thewedtheory/';
const CATS = ['Luxury Weddings', 'Corporate Galas', 'Private Soirées', 'Brand Launches'];
const VENUE_LIST = ['Lahore Fort (Shahi Qila)', 'Pearl Continental Lahore', 'Royal Palm Golf & Country Club', 'The Nishat Hotel', 'Private Bedian Road Farmhouse'];
const BUDGET_BRACKETS = [[0, 5e5, 'Under PKR 500,000'], [5e5, 15e5, 'PKR 500,000 – 1,500,000'], [15e5, 3e6, 'PKR 1,500,000 – 3,000,000'], [3e6, 6e6, 'PKR 3,000,000 – 6,000,000'], [6e6, Infinity, 'PKR 6,000,000 and above']];

const DIVISIONS = [
  { cat: 'Luxury Weddings', img: 'haveli', line: 'Mehndi, baraat, nikkah and walima, designed as one story from the first arch to the last candle.' },
  { cat: 'Private Soirées', title: 'Social Celebrations & Soirées', img: 'busts', line: 'Engagements, anniversaries, bridal showers and family dinners with the polish of a wedding.' },
  { cat: 'Corporate Galas', title: 'Corporate Galas & Brand Launches', img: 'bluegala', line: 'Annual dinners, product unveilings and conferences staged with broadcast-grade light and sound.' }
];

const PALETTES = {
  ivory:    { name: 'Ivory & Champagne',   sw: ['#fbf7ee', '#efe3cc', '#d5ba80', '#a9b295', '#5b5346'], flowers: ['#fffaf0', '#f6ecd6', '#f2e2c4', '#e9d9b8', '#ffffff'], deep: '#5a4a3a', linen: '#f4ecdc', metal: 'gold' },
  blush:    { name: 'Blush & Sage',        sw: ['#f7e3dc', '#e9c3bd', '#d99a9a', '#97a281', '#f6efe4'], flowers: ['#f7d9d3', '#eeb9b5', '#fbeee8', '#e59aa0', '#fff6ef'], deep: '#8d5a5f', linen: '#f8ebe4', metal: 'gold' },
  burgundy: { name: 'Burgundy & Gold',     sw: ['#5e1524', '#8c2334', '#c9a45c', '#e7b7b0', '#2a0d12'], flowers: ['#6d1627', '#9a2238', '#c44a5a', '#e8b9b4', '#3d0c18', '#d9a441'], deep: '#5e1524', linen: '#f1e4d2', metal: 'gold' },
  marigold: { name: 'Marigold & Fuchsia',  sw: ['#f59e0b', '#f7c948', '#d6246e', '#7a1f5c', '#2f6b3f'], flowers: ['#f59e0b', '#f7b733', '#e8590c', '#d6246e', '#ffd76a', '#ff7ab0'], deep: '#a11855', linen: '#fff3d6', metal: 'gold' },
  midnight: { name: 'Midnight & Silver',   sw: ['#0f1b3d', '#27407a', '#c9d2e3', '#f4f6fb', '#8fa3c8'], flowers: ['#f7f9ff', '#dfe7f7', '#8fa8dc', '#4a66ad', '#c5cfe6'], deep: '#14224d', linen: '#e9edf6', metal: 'silver' },
  terracotta: { name: 'Sage & Terracotta', sw: ['#c8623d', '#e3a57f', '#8a9a78', '#f3e6d3', '#5b4636'], flowers: ['#c8623d', '#e3a57f', '#f3d9c4', '#f6ead9', '#b5523a'], deep: '#7b3f2a', linen: '#f3e6d3', metal: 'gold' },
  lilac:    { name: 'Lilac & Pearl',       sw: ['#b9a2d8', '#e3d7f2', '#f6f2fa', '#8d7bb5', '#c9d2e3'], flowers: ['#b9a2d8', '#d9c9ee', '#f6f2fa', '#8d7bb5', '#ffffff'], deep: '#5b4a82', linen: '#f4f0f8', metal: 'silver' },
  sagepearl: { name: 'Sage & Pearl',       sw: ['#f6f1e4', '#e9e2d0', '#8a9a78', '#c9a45c', '#5f6b4f'], flowers: ['#fffaf0', '#f6ecd6', '#ffffff', '#eef0e0', '#dfe6cf'], deep: '#7d8c6a', linen: '#f6f1e4', metal: 'gold' },
  emerald:  { name: 'Emerald & Ivory',     sw: ['#0f4a3a', '#2f7a5c', '#f6f1e4', '#c9a45c', '#93b79a'], flowers: ['#fbf8ee', '#eef3e2', '#bfe0a8', '#7fbf7a', '#f3e9c9'], deep: '#0f4a3a', linen: '#f6f1e4', metal: 'gold' }
};

/* The four "theories" are the styles from the studio's own quiz; the fifth is Lahore-specific. */
const VIBES = {
  classic:  { name: 'The Candlelit Classic', line: 'Warm, timeless and unhurried.',        img: 'dinner',     words: ['Taper candles', 'Ivory drapery', 'Gilded rims'],
              rec: { venue: 'ballroom', palette: ['ivory', 'burgundy'], stage: ['jharoka', 'rosewall'], ceiling: ['chandeliers', 'drapes'], floor: ['rug', 'chequer'], seating: ['round', 'mirror'], time: 0.55, density: 0.45 } },
  romantic: { name: 'The Serene Romantic',  line: 'Soft, airy and effortless.',            img: 'haveli',     words: ['Sheer voile', 'Garden roses', 'Blush glass'],
              rec: { venue: 'farm', palette: ['blush', 'lilac', 'ivory'], stage: ['moongate', 'rosewall'], ceiling: ['wisteria', 'drapes'], floor: ['mirror', 'petal'], seating: ['round', 'velvet'], time: 0.12, density: 0.55 } },
  garden:   { name: 'The Garden in Bloom',  line: 'Lush, abundant and alive.',             img: 'pillars',    words: ['Wild meadow', 'Trailing vines', 'Open sky'],
              rec: { venue: 'farm', palette: ['emerald', 'terracotta', 'blush'], stage: ['moongate', 'jhoola'], ceiling: ['sky', 'lanterns'], floor: ['lawn', 'petal'], seating: ['majlis', 'round'], time: 0.08, density: 0.9 } },
  radiant:  { name: 'The Radiant Evening',  line: 'Grand, glittering and unforgettable.',  img: 'twtstage',   words: ['Cut crystal', 'Mirror shine', 'Moving light'],
              rec: { venue: 'ballroom', palette: ['midnight', 'burgundy', 'lilac'], stage: ['tunnel', 'mandap'], ceiling: ['chandeliers', 'fairy'], floor: ['chequer', 'acrylic'], seating: ['mirror', 'round'], time: 1, density: 0.6 } },
  heirloom: { name: 'The Mughal Heirloom',  line: 'Regal, storied and unmistakably Lahore.', img: 'gotalotus', words: ['Carved jharokas', 'Genda strands', 'Velvet & zari'],
              rec: { venue: 'fort', palette: ['marigold', 'burgundy', 'terracotta'], stage: ['jharoka', 'mandap', 'jhoola'], ceiling: ['lanterns', 'fairy'], floor: ['rug', 'petal'], seating: ['velvet', 'majlis'], time: 0.62, density: 0.72 } }
};

const VENUES = {
  fort:     { name: 'Lahore Fort Courtyard',            note: 'Red sandstone arcades, open sky. Heritage permissions apply.' },
  ballroom: { name: 'Pearl Continental Grand Ballroom', note: 'Pillarless hall, 9 m ceiling, in-house rigging points.' },
  farm:     { name: 'Private Bedian Road Farmhouse',    note: 'Open lawn framed by trees. Weather cover advised Dec to Feb.' },
  street:   { name: 'Live Street View',                 note: 'Search any address and stand the décor in the real street scene.' },
  photo:    { name: 'Your own venue photo',             note: 'Upload a photo, mark the floor corners, and the décor sits on top.' }
};
const STAGES = {
  jharoka:  { name: 'Mughal Jharoka Arch',          desc: 'Three cusped arches with a central dome, finished in antique gold.', mats: ['Fibreglass arches', 'Gold leaf finish', 'Silk backdrop'] },
  rosewall: { name: 'Monolithic White Rose Wall',   desc: 'A single wall of blooms, nine metres wide, with a low ivory settee.', mats: ['Avalanche roses', 'Foam-mesh panels', 'Pillar candles'], ref: 'stage' },
  tunnel:   { name: 'Mirrored Tunnel',              desc: 'Seven mirrored arches lead to a faceted mirror backdrop.', mats: ['Mirror acrylic', 'Polished frames', 'Meadow florals'] },
  jhoola:   { name: 'Marigold Jhoola',              desc: 'A carved swing under a curtain of genda strands.', mats: ['Carved sheesham', 'Brass chains', 'Marigold ladi'], ref: 'gotaswing' },
  moongate: { name: 'Floral Moon Gate',             desc: 'A six-metre ring, bloomed off-centre, against sheer drapery.', mats: ['Steel ring', 'Asymmetric florals', 'Sheer voile'] },
  velvetswag: { name: 'Velvet Swag Backdrop',       desc: 'A wall of gathered velvet with off-centre florals pinned into the folds.', mats: ['Gathered velvet', 'Anthurium & amaranthus', 'Floor puddle'], ref: 'velvetgarden' },
  pillars:  { name: 'Floral Pillar Garden',         desc: 'Seven ivory pillars at stepped heights, climbed by white blooms.', mats: ['Ivory plinth pillars', 'Climbing florals', 'Amber up-lights'], ref: 'pillars' },
  gotalotus: { name: 'Gota Lotus Bench',            desc: 'Giant gota lotuses and leaves behind a woven bench, for mehndi.', mats: ['Gota-work lotuses', 'Tassel strands', 'Gota bench'], ref: 'gotalotus' },
  haveli:   { name: 'Haveli Drape & Sage',          desc: 'Ivory sheers with a sage swag, twin floral mounds and a curved settee.', mats: ['Ivory sheers', 'Sage swag', 'Floral mounds'], ref: 'haveli' },
  mandap:   { name: 'Garlanded Mandap Canopy',      desc: 'Four-pillar pavilion with a fabric crown and wrapped posts.', mats: ['Gilded pillars', 'Fabric crown', 'Pillar garlands'] }
};
const CEILINGS = {
  fairy:       { name: 'Fairy-Light Canopy',   desc: 'Warm-white strings swept from a centre ridge.', mats: ['Warm-white LED', 'Sheer swags'], ref: 'lights' },
  wisteria:    { name: 'Suspended Wisteria',   desc: 'Hundreds of hanging drops in lilac and ivory.', mats: ['Silk wisteria', 'Trailing vines'], ref: 'floral' },
  chandeliers: { name: 'Crystal Chandeliers',  desc: 'One grand tier and four satellites.', mats: ['K9 crystal', 'Gilded frames'], ref: 'chandelier' },
  drapes:      { name: 'Draped Silk Canopy',   desc: 'Swags of fabric sweeping from a flowered ridge.', mats: ['Silk-look voile', 'Ridge florals'] },
  lanterns:    { name: 'Hanging Lantern Sky',  desc: 'Sixty brass lanterns at staggered heights.', mats: ['Brass lanterns', 'LED candles'] },
  ribbons:     { name: 'Canopy of Ribbons',    desc: 'Tiers of ribbon fringe with mirror balls.', mats: ['Satin ribbon fringe', 'Mirror balls'], ref: 'ribbons' },
  bulbs:       { name: 'Festoon Bulb Strings', desc: 'Criss-crossed warm bulbs under open sky.', mats: ['Festoon bulbs', 'Black cable'], ref: 'pillars' },
  gota:        { name: 'Gota Strand Canopy',   desc: 'Hundreds of golden gota strands, lit from within.', mats: ['Gota strands', 'Warm pin lights'], ref: 'gotatree' },
  sky:         { name: 'Open Sky',             desc: 'No canopy. Stars after dusk.', mats: ['Nothing overhead'] }
};
const FLOORS = {
  acrylic: { name: 'Glossy Acrylic',          desc: 'White high-gloss aisle and dance floor.', mats: ['Gloss acrylic panels', 'Edge candles'] },
  mirror:  { name: 'Mirrored Floral Runner',  desc: 'Mirror walkway hedged with blooms.', mats: ['Mirror panels', 'Floral hedging'], ref: 'entrance' },
  rug:     { name: 'Persian Rug Walkway',     desc: 'Layered hand-knotted rugs and brass lanterns.', mats: ['Persian rugs', 'Brass lanterns'] },
  chequer: { name: 'Marble Chequer Floor',    desc: 'Black and white gloss tiles, aisle and dance floor.', mats: ['Printed gloss panels', 'Brass edging'] },
  petal:   { name: 'Rose-Petal Carpet',       desc: 'A fabric runner buried in loose petals.', mats: ['Fresh petals', 'Ivory runner'] },
  lawn:    { name: 'Natural Lawn',            desc: 'Groomed grass, stepping stones, petal line.', mats: ['Groomed turf', 'Stone pavers'], ref: 'garden' }
};
const SEATS = {
  velvet: { name: 'Velvet Banquets',                    desc: 'Long tables with velvet banquettes on one side.', mats: ['Velvet banquettes', 'Linen runners'], per: 18 },
  mirror: { name: 'Royal Mirror Banquet Tables',        desc: 'Mirror-top long tables with candelabra.', mats: ['Mirror tops', 'Candelabra'], per: 20, ref: 'table' },
  round:  { name: 'Round Tables · Gold Chiavari',       desc: 'Tables of ten with tall centrepieces.', mats: ['Floor-length linen', 'Chiavari chairs'], per: 10 },
  daybed: { name: 'Haveli Daybeds',                     desc: 'Whitewashed daybeds with bolsters and tapestry stools.', mats: ['Bolster daybeds', 'Tapestry footstools'], per: 3, ref: 'daybeds' },
  majlis: { name: 'Majlis Lounge Seating',              desc: 'Low velvet sofas around a centre table, on rugs.', mats: ['Velvet floor sofas', 'Area rugs'], per: 8 }
};
const ENTRANCES = {
  gate:      { name: 'Floral Entrance Arch',  desc: 'A bloomed arch where the aisle begins.', mats: ['Steel arch', 'Cascading florals'] },
  welcome:   { name: 'Mirror Welcome Sign',   desc: 'Arched mirror sign, urns and a lantern cluster.', mats: ['Arched mirror', 'Calligraphy vinyl'] },
  pearlstairs: { name: 'Pearl & Drape Doorway', desc: 'Soft drapes, pearl strands, lanterns and candles.', mats: ['Chiffon drapes', 'Pearl garlands'], ref: 'pearlstairs' },
  welcometable: { name: 'Satin Welcome Table', desc: 'Swagged satin table, framed sign, busts and tapers.', mats: ['Satin swags', 'Framed sign'], ref: 'welcome' },
  balloon:   { name: 'Balloon Arch Backdrop', desc: 'Arched panel, organic balloons and a cake plinth.', mats: ['Organic balloons', 'Arched panel'], ref: 'balloons' },
  arches:    { name: 'Floral Arch Tunnel',    desc: 'Five full floral arches over the walk-in.', mats: ['Full floral arches', 'Sheer legs'], ref: 'archday' },
  lightwalk: { name: 'Fairy-Light Walkway',   desc: 'Six lit arches leading guests in.', mats: ['Slim arches', 'Warm-white LED'] }
};
const ELEMENTS = {
  seat:    { name: 'Couple seating',  opts: { settee: 'Ivory settee', thrones: 'Twin thrones', none: 'None' } },
  drape:   { name: 'Backdrop fabric', opts: { deep: 'Deep velvet', palette: 'Palette silk', ivory: 'Ivory voile', none: 'None' } },
  markers: { name: 'Aisle markers',   opts: { floral: 'Floral pedestals', lantern: 'Lantern clusters', candelabra: 'Tall candelabra', none: 'None' } },
  centre:  { name: 'Centrepieces',    opts: { tall: 'Tall florals', low: 'Low florals', busts: 'Busts, pearls & tapers', candelabra: 'Candelabra', none: 'None' } },
  chairs:  { name: 'Chairs',          opts: { gold: 'Gold chiavari', silver: 'Silver chiavari', white: 'White chiavari', bentwood: 'Black bentwood', ghost: 'Clear ghost', velvet: 'Velvet' } },
  linen:   { name: 'Table linen',     opts: { palette: 'Palette', ivory: 'Ivory', deep: 'Deep tone', black: 'Black' } },
  candles: { name: 'Candlelight',     opts: { 0: 'None', 1: 'Classic', 2: 'Abundant' } }
};
const EL_DEFAULT = { seat: 'settee', drape: 'deep', markers: 'floral', centre: 'tall', chairs: 'gold', linen: 'palette', candles: 1 };
const PROPS = {
  pedestal:   { name: 'Floral pedestal',     rate: [18e3, 30e3],  stems: 60 },
  urn:        { name: 'Grand floral urn',    rate: [35e3, 60e3],  stems: 140 },
  lanterns:   { name: 'Lantern cluster',     rate: [9e3, 16e3],   stems: 0 },
  candles:    { name: 'Candle cluster',      rate: [5e3, 9e3],    stems: 0 },
  candelabra: { name: 'Tall candelabra',     rate: [12e3, 20e3],  stems: 0 },
  arch:       { name: 'Floral arch',         rate: [150e3, 260e3], stems: 450 },
  table:      { name: 'Round table of eight', rate: [22e3, 36e3], stems: 30 },
  sofa:       { name: 'Lounge settee',       rate: [14e3, 24e3],  stems: 0 },
  tree:       { name: 'Fairy-lit tree',      rate: [40e3, 70e3],  stems: 0 },
  chandelier: { name: 'Hanging chandelier',  rate: [70e3, 130e3], stems: 0 }
};
const FX = { petals: 'Falling petals', sparks: 'Cold spark fountains', beams: 'Moving light beams' };
const TIMES = { sunset: { name: 'Sunset Golden Hour', t: 0 }, dusk: { name: 'Twilight Dusk', t: 0.5 }, midnight: { name: 'Midnight Gala', t: 1 } };
const CATALOG = { venue: VENUES, vibe: VIBES, palette: PALETTES, stage: STAGES, ceiling: CEILINGS, floor: FLOORS, seating: SEATS, entrance: ENTRANCES };

const timeName = t => t < 0.25 ? 'Sunset Golden Hour' : t < 0.75 ? 'Twilight Dusk' : 'Midnight Gala';
const densityName = d => d < 0.2 ? 'Minimalist Architectural' : d < 0.5 ? 'Tailored & Refined' : d < 0.8 ? 'Lush Garden' : 'Opulent Botanical Overgrowth';

const RECIPES = {
  ivory:    [['Avalanche Roses', .34], ['White Phalaenopsis Orchids', .12], ["Baby's Breath (Gypsophila)", .2], ['White Hydrangea', .12], ['Tuberose (Rajnigandha)', .1], ['Eucalyptus', .12]],
  blush:    [['Sweet Avalanche Roses', .3], ['Quicksand Roses', .16], ['Lisianthus', .14], ["Baby's Breath (Gypsophila)", .14], ['Blush Peonies (imported, seasonal)', .08], ['Silver Dollar Eucalyptus', .18]],
  burgundy: [['Black Baccara Roses', .26], ['Red Naomi Roses', .22], ['Burgundy Dahlias', .12], ['Hanging Amaranthus', .1], ['Deep Red Carnations', .16], ['Italian Ruscus', .14]],
  marigold: [['Desi Marigolds (Genda)', .36], ['Desi Roses (Gulab), fuchsia', .2], ['Tuberose (Rajnigandha)', .12], ['Orange Celosia', .1], ['Mogra / Jasmine buds', .1], ['Asparagus Fern', .12]],
  midnight: [['Avalanche Roses', .28], ['White Phalaenopsis Orchids', .16], ['Blue Delphinium', .16], ['Blue Hydrangea', .14], ['Silver Brunia', .08], ['Eucalyptus', .18]],
  terracotta: [['Toffee Roses', .26], ['Terracotta Carnations', .16], ['Peach Stock', .12], ['Dried Pampas Grass', .14], ['Burnt-orange Dahlias', .12], ['Olive & Eucalyptus', .2]],
  lilac:    [['Ocean Song Roses (lavender)', .28], ['Lilac Stock', .16], ['White Phalaenopsis Orchids', .12], ['Lavender Lisianthus', .16], ["Baby's Breath (Gypsophila)", .14], ['Silver Dollar Eucalyptus', .14]],
  sagepearl: [['Avalanche Roses', .3], ["Baby's Breath (Gypsophila)", .24], ['White Lisianthus', .12], ['White Chrysanthemums', .1], ['Tuberose (Rajnigandha)', .08], ['Asparagus Fern & Ruscus', .16]],
  emerald:  [['Avalanche Roses', .26], ['Green Cymbidium Orchids', .12], ['White Anthurium', .1], ['Tuberose (Rajnigandha)', .14], ['Monstera & Areca Palm leaves', .2], ['Italian Ruscus', .18]]
};

const r10 = n => Math.max(10, Math.round(n / 10) * 10);
const lerp = (a, b, t) => a + (b - a) * t;
function tableCount(c) { return Math.ceil(c.guests / SEATS[c.seating].per); }

/* Sample rates in PKR. Edit these to the studio's real rate card. */
const RATES = {
  stem: [140, 220],
  stage: { jharoka: [750e3, 1.1e6], rosewall: [450e3, 700e3], tunnel: [900e3, 1.4e6], jhoola: [380e3, 600e3], moongate: [420e3, 650e3], mandap: [680e3, 1.05e6], velvetswag: [320e3, 520e3], pillars: [520e3, 820e3], gotalotus: [450e3, 700e3], haveli: [380e3, 600e3] },
  floor: { acrylic: [220e3, 340e3], mirror: [320e3, 480e3], rug: [150e3, 260e3], lawn: [60e3, 120e3], chequer: [260e3, 400e3], petal: [140e3, 240e3] },
  ceiling: { fairy: [260e3, 420e3], wisteria: [380e3, 620e3], chandeliers: [450e3, 800e3], sky: [0, 0], drapes: [320e3, 520e3], lanterns: [340e3, 560e3], ribbons: [300e3, 480e3], bulbs: [120e3, 220e3], gota: [420e3, 680e3] },
  entrance: { gate: [180e3, 300e3], welcome: [90e3, 160e3], lightwalk: [150e3, 260e3], pearlstairs: [140e3, 240e3], welcometable: [80e3, 140e3], balloon: [70e3, 130e3], arches: [450e3, 750e3] }, fx: { petals: [40e3, 70e3], sparks: [90e3, 160e3], beams: [120e3, 200e3] },
  truss: [180e3, 260e3],
  seat: { round: [1400, 2200], mirror: [2600, 3800], velvet: [2200, 3400], majlis: [2400, 3600], daybed: [1800, 2800] },
  light: [[280e3, 420e3], [650e3, 980e3]], lightPerGuest: 150, crew: 0.09,
  perGuestFallback: [5500, 9500]
};
const TIERS = [
  { id: 'signature', name: 'Signature', add: 0,    line: 'Design, décor and on-the-day styling team.' },
  { id: 'couture',   name: 'Couture',   add: 0.18, line: 'Adds full planning, vendor management and coordination.' },
  { id: 'royale',    name: 'Royale',    add: 0.35, line: 'Adds multi-event design, hospitality desk and guest logistics.' }
];

function manifest(c) {
  const el = Object.assign({}, EL_DEFAULT, c.el || {}), chairName = ELEMENTS.chairs.opts[el.chairs] + ' chairs with cushions';
  const d = c.density, dm = 0.2 + 1.8 * d, g = c.guests, on = c.on, outdoor = c.venue !== 'ballroom', fx = c.fx || {}, ent = on.entrance && c.entrance;
  const T = tableCount(c), per = SEATS[c.seating].per;
  const u = {
    stage: on.stage ? { jharoka: 900, rosewall: 2600, tunnel: 1100, jhoola: 700, moongate: 1000, mandap: 1300, velvetswag: 500, pillars: 1400, gotalotus: 150, haveli: 1300 }[c.stage] * dm : 0,
    aisle: on.floor ? { acrylic: 500, mirror: 1500, rug: 450, lawn: 800, chequer: 450, petal: 500 }[c.floor] * dm : 0,
    tables: on.seating ? T * { round: 45, mirror: 160, velvet: 110, majlis: 30, daybed: 0 }[c.seating] * dm * (c.seating === 'majlis' ? 1 : { tall: 1, low: 0.7, busts: 0.6, candelabra: 0.15, none: 0 }[el.centre]) : 0,
    ceiling: on.ceiling ? { fairy: 150, wisteria: 300, chandeliers: 200, sky: 0, drapes: 260, lanterns: 60, ribbons: 0, bulbs: 0, gota: 0 }[c.ceiling] * dm : 0,
    entrance: ent ? { gate: 520, welcome: 160, lightwalk: 0, pearlstairs: 200, welcometable: 120, balloon: 0, arches: 1800 }[ent] * dm : 0
  };
  const pc = {}; (c.props || []).forEach(q => { if (PROPS[q.t]) pc[q.t] = (pc[q.t] || 0) + 1; });
  const stems = u.stage + u.aisle + u.tables + u.ceiling + u.entrance + Object.keys(pc).reduce((n, k) => n + pc[k] * PROPS[k].stems * dm, 0);
  const botanical = stems ? RECIPES[c.palette].map(([name, share]) => [name, r10(stems * share) + ' stems']) : [];
  if (on.stage && c.stage === 'jhoola') { const s = Math.round(180 * (0.4 + 0.6 * d)); botanical.push(['Desi Marigold ladi for jhoola curtain', s + ' strands (about ' + Math.round(s * 0.35) + ' kg)']); }
  if (on.ceiling && c.ceiling === 'wisteria') botanical.push(['Silk wisteria drops, lilac and ivory (reusable)', Math.round(357 * (0.5 + d)) + ' drops']);
  if (on.floor && c.floor === 'petal') botanical.push(['Loose rose petals for the aisle carpet', Math.round(40 * (0.5 + d)) + ' kg']);
  if (fx.petals) botanical.push(['Loose petals for the petal drop', '12 kg']);
  if (on.stage && c.stage === 'rosewall') botanical.push(['Of which rose-wall face alone', r10(u.stage) + ' stems']);

  const structure = [];
  if (on.stage) {
    structure.push(['Stage plinth 11 m × 5 m, carpeted, two-step front', '1']);
    ({ jharoka: [['Three-arch jharoka façade, fibreglass on MS frame, antique gold leaf', '1 set, 10.4 m × 6.2 m'], ['Central dome and two chhatri caps', '3'], ['Silk backdrop drape, 9 m × 6 m', '1']],
       rosewall: [['Backdrop wall frame, 9.5 m × 5 m', '1'], ['Floral foam-mesh panels, 1.2 m × 1.2 m', '32'], ['Candle plinths, lacquered', '2']],
       tunnel: [['Mirrored arch frames, 6.4 m span', '7'], ['Faceted mirror backdrop panels, 1.7 m × 5.5 m', '5'], ['Floral trough bases', '14']],
       jhoola: [['Carved sheesham jhoola with brass chains', '1'], ['Marigold curtain frame, 9 m × 5.6 m', '1'], ['Brass urns', '2']],
       moongate: [['Steel moon-gate ring, 6 m, with inner accent ring', '1'], ['Sheer voile backdrop, 10.5 m × 6.4 m', '1'], ['Floral cage mechanics for ring', '24']],
       velvetswag: [['Velvet backdrop wall with gathered swags, 9.5 m × 5.2 m', '1'], ['Velvet floor puddle, 10 m', '1'], ['Floral cages pinned to backdrop', '4']],
       pillars: [['Ivory plinth pillars, 4.5 m to 6.5 m', '7'], ['Amber LED up-lights', '14']],
       gotalotus: [['Gota-work lotus flowers, 1.8 m', '6'], ['Gota-work leaves on stems', '8'], ['Gota bench with cushions and side stools', '1 set'], ['Tassel strands, 4 m', '14']],
       haveli: [['Ivory sheer backdrop, 11 m × 6 m', '1'], ['Sage swag panels', '2'], ['Floral mound frames, 3 m', '2'], ['Wall sconces', '2']],
       mandap: [['Gilded mandap pillars, 4.6 m', '4'], ['Fabric crown canopy, 5.4 m square', '1'], ['Velvet back drape, 5.4 m × 4.6 m', '1']] })[c.stage].forEach(x => structure.push(x));
    if (el.seat !== 'none') structure.push([el.seat === 'thrones' ? 'Twin throne chairs, velvet and gilt' : 'Bridal settee, upholstered', el.seat === 'thrones' ? '2' : '1']);
  }
  if (on.floor) ({ acrylic: [['High-gloss white acrylic panels, 1.2 m × 2.4 m (aisle + dance floor)', '43']],
       mirror: [['Mirror acrylic aisle panels, 1.2 m × 2.4 m', '27'], ['Floral hedge troughs, 1 m', '48']],
       rug: [['Hand-knotted Persian rugs, 3.2 m × 6 m (hire)', '4'], ['Brass floor lanterns', '16']],
       lawn: [['Turf grooming and levelling', '1 visit'], ['Sandstone stepping pavers', '20']],
       chequer: [['Gloss chequer floor panels, 1.2 m × 2.4 m (aisle + dance floor)', '43'], ['Brass edge trim', '58 m']],
       petal: [['Ivory fabric aisle runner, 3.2 m × 24 m', '1']] })[c.floor].forEach(x => structure.push(x));
  if (on.floor && el.markers !== 'none' && !(on.stage && c.stage === 'tunnel')) structure.push([{ floral: 'Aisle pedestals with floral heads', lantern: 'Aisle lantern clusters, set of three', candelabra: 'Tall aisle candelabra, five-arm' }[el.markers], '12']);
  if (on.ceiling && c.ceiling !== 'sky') {
    if (outdoor) structure.push(['Box-truss canopy frame, 22 m × 27 m × 8.5 m, with ballast', '1']);
    ({ fairy: [['Warm-white fairy-light strings, 22 m', '21'], ['Sheer ceiling swags', '10']],
       wisteria: [['Ceiling grid for suspended florals', '1'], ['Trailing vine garlands, 3 m', String(Math.round(40 * (0.5 + d)))]],
       drapes: [['Silk-look voile ceiling swags, 22 m', '19'], ['Centre ridge truss with floral trough', '1']],
       ribbons: [['Satin ribbon fringe panels, 1 m', '300'], ['Mirror balls, 40 cm', '4']],
       bulbs: [['Festoon bulb strings, 25 m', '8'], ['Rigging poles, 6 m', '6']],
       gota: [['Gota strands, 1.5 m to 3.5 m', String(Math.round(520 * (0.5 + d)))], ['Warm pin lights', '40']],
       lanterns: [['Brass hanging lanterns with LED candles', '63'], ['Suspension grid and cords', '1']],
       chandeliers: [['Grand crystal chandelier, 2.2 m', '1'], ['Satellite crystal chandeliers, 1.4 m', '4'], ['Rated rigging points with safety bonds', '5']] })[c.ceiling].forEach(x => structure.push(x));
  }

  if (ent) ({ gate: [['Entrance arch frame, 4.6 m span', '1']], welcome: [['Arched mirror welcome sign on easel, 2.1 m', '1'], ['Brass urns and lantern cluster', '1 set']], lightwalk: [['Slim walkway arches with warm-white LED, 4.4 m', '6']], pearlstairs: [['Chiffon doorway drapes with pearl garlands', '1 set'], ['Brass lanterns and cylinder candles', '12']], welcometable: [['Satin-swagged welcome table, 2.6 m', '1'], ['Framed welcome sign, busts and taper holders', '1 set']], balloon: [['Arched backdrop panel, 2 m × 3 m', '1'], ['Organic balloon garland', '1'], ['Cake plinth', '1']], arches: [['Full floral arch frames, 4.4 m span', '5']] })[ent].forEach(x => structure.push(x));
  Object.keys(pc).forEach(k => structure.push(['Extra piece: ' + PROPS[k].name.toLowerCase(), String(pc[k])]));
  const furniture = [];
  if (on.seating) {
    ({ round: [['Round tables, 6 ft, floor-length linen', String(T)], [chairName, String(T * 10)], ['Tall gold centrepiece stands', String(T)]],
       mirror: [['Mirror-top banquet tables, 6 m', String(T)], [chairName, String(T * 20)], ['Five-arm candelabra', String(T * 3)]],
       velvet: [['Banquet tables, 6 m, linen runner', String(T)], ['Velvet banquettes, 6 m', String(T)], [chairName, String(T * 10)]],
       daybed: [['Whitewashed daybeds with bolsters', String(T)], ['Tapestry footstools', String(T)]],
       majlis: [['Low centre tables', String(T)], ['Velvet floor sofas, two-seat', String(T * 4)], ['Area rugs, 3.2 m', String(T)]] })[c.seating].forEach(x => furniture.push(x));
    furniture.push(['Charger plates, cutlery and glassware settings', String(T * per)], ['Table linen, ' + ELEMENTS.linen.opts[el.linen].toLowerCase(), String(T)], ['Pillar and taper candles', String(T * (c.seating === 'round' ? 3 : c.seating === 'daybed' ? 0 : 15) * [0, 1, 3][el.candles])]);
  }

  const t = c.time, av = [];
  av.push(['LED PAR up-lighters, warm amber', String(Math.round(lerp(16, 48, t)))]);
  av.push(['Pin spots for tables and stage florals', String(on.seating ? Math.min(T, 60) + 6 : 6)]);
  if (t > 0.3) av.push(['Moving-head beams and wash fixtures', String(Math.round(lerp(0, 16, t)))]);
  if (t > 0.6) av.push(['Haze machine with fan', '2']);
  if (fx.beams) av.push(['Programmed beam show, operator and haze', '1']);
  if (fx.sparks) av.push(['Cold spark fountain machines with DMX firing', '4']);
  if (fx.petals) av.push(['Petal drop cannons', '2']);
  av.push(['Line-array sound system with wireless microphones', g > 400 ? '2 hangs + 4 mics' : '1 pair + 2 mics']);
  av.push(['Lighting desk, dimmer racks and distribution', '1']);
  av.push(['Silent generator backup, ' + (g > 500 || t > 0.6 ? '200' : '100') + ' kVA', '1']);

  const crew = [['Lead designer and floor manager', '2'], ['Florists', String(Math.max(4, Math.round(stems / 900)))], ['Carpenters and riggers', String(6 + (on.ceiling && c.ceiling !== 'sky' ? 6 : 0))], ['Lighting and sound technicians', String(4 + Math.round(t * 4))], ['Setup window', stems > 6000 ? '36 hours' : '24 hours']];

  const R = RATES, add = (a, b) => [a[0] + b[0], a[1] + b[1]], mul = (a, k) => [a[0] * k, a[1] * k];
  let st = [0, 0];
  if (on.stage) st = add(st, R.stage[c.stage]);
  if (on.floor) st = add(st, R.floor[c.floor]);
  if (on.ceiling) { st = add(st, R.ceiling[c.ceiling]); if (outdoor && c.ceiling !== 'sky') st = add(st, R.truss); }
  if (ent) st = add(st, R.entrance[ent]);
  Object.keys(pc).forEach(k => { st = add(st, mul(PROPS[k].rate, pc[k])); });
  let fxc = [0, 0]; Object.keys(fx).forEach(k => { if (fx[k] && R.fx[k]) fxc = add(fxc, R.fx[k]); });
  const depts = [
    ['Florals and botanicals', mul(R.stem, stems)],
    ['Stage, entrance, flooring and canopy', st],
    ['Furniture and linen', on.seating ? mul(R.seat[c.seating], g) : [0, 0]],
    ['Lighting, sound and power', add([lerp(R.light[0][0], R.light[1][0], t), lerp(R.light[0][1], R.light[1][1], t)], [g * R.lightPerGuest + fxc[0], g * R.lightPerGuest + fxc[1]])]
  ];
  const sub = depts.reduce((s, x) => add(s, x[1]), [0, 0]);
  depts.push(['Crew, transport and setup', mul(sub, R.crew)]);
  const total = depts.reduce((s, x) => add(s, x[1]), [0, 0]);
  return { stems: Math.round(stems), tables: T, botanical, structure, furniture, av, crew, depts, lo: total[0], hi: total[1] };
}

const SEED_PROJECTS = [
  { id: 'r1', title: 'Evelin & Mustafa · Haveli Reception', cat: 'Luxury Weddings', client: 'Evelin & Mustafa', venue: '', date: '2026-10-17', guests: 0, theme: 'Ivory sheers, sage and candlelight', palette: ['#f6f1e4', '#8a9a78', '#c9a45c', '#9a5a44'], images: ['haveli', 'pond', 'daybeds', 'welcome', 'guestbook', 'favours'], featured: true },
  { id: 'r2', title: 'The Burgundy Stage', cat: 'Luxury Weddings', venue: '', date: '', guests: 0, theme: 'Velvet, crystal and deep florals', palette: ['#5e1524', '#8c2334', '#e7b7b0', '#c9a45c'], images: ['twtstage', 'chandelier'], featured: true },
  { id: 'r3', title: 'Alina & Gohar · A White Garden Romance', cat: 'Luxury Weddings', client: 'Alina & Gohar', venue: '', date: '', guests: 0, theme: 'Draped canopy, floral arches, candlelit tables', palette: ['#f6efe2', '#ece7dc', '#d8bd8a', '#d9d4cb', '#4a5540'], images: ['wgr'], featured: true },
  { id: 'r4', title: 'Gota Mehndi', cat: 'Luxury Weddings', venue: '', date: '', guests: 0, theme: 'Gota lotuses, gota swing and strand-lit trees', palette: ['#d4a73c', '#d6246e', '#b7d167', '#f0c75e'], images: ['gotalotus', 'gotaswing', 'gotatree'], featured: true },
  { id: 'r5', title: 'Garden Pillars Reception', cat: 'Luxury Weddings', venue: '', date: '', guests: 0, theme: 'Ivory pillars, climbing florals, festoon lights', palette: ['#f6f1e4', '#f0d98a', '#7f8b6a', '#ffffff'], images: ['pillars', 'archday'], featured: false },
  { id: 'r6', title: 'Velvet in the Garden', cat: 'Luxury Weddings', venue: '', date: '', guests: 0, theme: 'Wine velvet against tropical green', palette: ['#5a1030', '#b0203a', '#9aa63c', '#141414'], images: ['velvetgarden'], featured: false },
  { id: 'r7', title: 'Pearl Staircase Entrance', cat: 'Private Soirées', venue: '', date: '', guests: 0, theme: 'Soft drapes, pearls and candles', palette: ['#f1ebe0', '#d8cdbd', '#6f7d52', '#c9a45c'], images: ['pearlstairs'], featured: false },
  { id: 'r8', title: 'Pearls & Busts Birthday Dinner', cat: 'Private Soirées', client: 'Rumaal', venue: '', date: '', guests: 0, theme: 'White roses, classical busts, tapers', palette: ['#ffffff', '#e9e2d0', '#5f7a45', '#7a4a2a'], images: ['dinner', 'busts'], featured: true },
  { id: 'r9', title: 'A Canopy of Ribbons', cat: 'Private Soirées', venue: '', date: '', guests: 0, theme: 'Pink ribbon ceiling, mirror balls, floating candles', palette: ['#e9a3ad', '#c94a5a', '#f3d9d6', '#b9b9b9'], images: ['ribbons'], featured: false },
  { id: 'r10', title: 'Sasha · Sage Balloon Garden', cat: 'Private Soirées', client: 'Sasha', venue: '', date: '', guests: 0, theme: 'Sage and cream balloons, rattan lanterns', palette: ['#6f8f72', '#e8dfcc', '#c9a45c', '#f6f1e4'], images: ['balloons'], featured: false },
  { id: 'p6', title: 'Midnight Blue Annual Gala', cat: 'Corporate Galas', venue: 'Pearl Continental Lahore', date: '2025-11-28', guests: 400, theme: 'The Radiant Evening', palette: ['#0f1b3d', '#27407a', '#7b4ea3', '#c9d2e3'], images: ['bluegala', 'hall'], featured: false, sample: true },
  { id: 'p7', title: 'The Unveiling', cat: 'Brand Launches', venue: 'The Nishat Hotel', date: '2026-05-16', guests: 250, theme: 'The Radiant Evening', palette: ['#dfe5e8', '#6f8794', '#1f2a30', '#ffffff'], images: ['hall', 'drapes'], featured: false, sample: true }
].map(p => Object.assign({ client: '', video: '', testimonial: '', testimonialBy: '', before: '', sample: false }, p));

if (typeof module !== 'undefined') module.exports = { manifest, PALETTES, SEATS, tableCount };
