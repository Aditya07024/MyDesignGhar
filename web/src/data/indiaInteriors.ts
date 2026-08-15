import type { IndiaInteriorState } from '../types';
import jammu1 from '../components/india-interiors/jammu1.jpeg';
import jammu2 from '../components/india-interiors/jammu2.jpeg';
import jammu3 from '../components/india-interiors/jammu3.jpeg';
import jammu4 from '../components/india-interiors/jammu4.jpeg';
import himachal1 from '../components/india-interiors/himachal1.png';
import himachal2 from '../components/india-interiors/himachal2.png';
import himachal3 from '../components/india-interiors/himachal3.png';
import himachal4 from '../components/india-interiors/himachal4.png';
import himachal5 from '../components/india-interiors/himachal5.png';
import kerala1 from '../components/india-interiors/kerala1.jpeg';
import kerala2 from '../components/india-interiors/kerala2.jpeg';
import kerala3 from '../components/india-interiors/kerala3.jpeg';
import kerala4 from '../components/india-interiors/kerala4.jpeg';
import rajasthan1 from '../components/india-interiors/rajasthan1.jpeg';
import rajasthan2 from '../components/india-interiors/rajasthan2jpeg.jpeg';
import rajasthan3 from '../components/india-interiors/rajasthan3.jpeg';
import rajasthan4 from '../components/india-interiors/rajasthan4.jpeg';

export const STATE_DISPLAY_DURATION = 35000;
export const AUTO_RESUME_DELAY = 2500;

export const INDIA_INTERIOR_FALLBACK_IMAGES = [
  '/images/project-living.png',
  '/images/project-bedroom.png',
  '/images/project-kitchen.png',
  '/images/project-office.png',
];

const palette = [
  '#d7c0a8',
  '#c9d6b8',
  '#e4c79c',
  '#d8b8a8',
  '#c7d4d9',
  '#d7cbb7',
  '#cdbeb0',
  '#d5d8b8',
];

const buildImages = (id: string) => buildSplitCollageImages(id);

const buildSplitCollageImages = (id: string) => ([
  `/images/india-interiors-split/${id}/01.png`,
  `/images/india-interiors-split/${id}/02.png`,
  `/images/india-interiors-split/${id}/03.png`,
  `/images/india-interiors-split/${id}/04.png`,
  `/images/india-interiors-split/${id}/05.png`,
]);

const LOCAL_STATE_IMAGE_OVERRIDES: Record<string, string[]> = {
  'andaman-nicobar': buildSplitCollageImages('andaman-nicobar'),
  'andhra-pradesh': buildSplitCollageImages('andhra-pradesh'),
  'arunachal-pradesh': buildSplitCollageImages('arunachal-pradesh'),
  assam: buildSplitCollageImages('assam'),
  bihar: buildSplitCollageImages('bihar'),
  chandigarh: buildSplitCollageImages('chandigarh'),
  chhattisgarh: buildSplitCollageImages('chhattisgarh'),
  'dadra-nagar-haveli-daman-diu': [
    ...buildSplitCollageImages('dadra-nagar-haveli'),
    ...buildSplitCollageImages('daman-diu'),
  ],
  delhi: buildSplitCollageImages('delhi'),
  goa: buildSplitCollageImages('goa'),
  gujarat: buildSplitCollageImages('gujarat'),
  haryana: buildSplitCollageImages('haryana'),
  'himachal-pradesh': [himachal1, himachal2, himachal3, himachal4, himachal5],
  jharkhand: buildSplitCollageImages('jharkhand'),
  'jammu-kashmir': [jammu1, jammu2, jammu3, jammu4],
  karnataka: buildSplitCollageImages('karnataka'),
  kerala: [kerala1, kerala2, kerala3, kerala4],
  ladakh: buildSplitCollageImages('ladakh'),
  lakshadweep: buildSplitCollageImages('lakshadweep'),
  'madhya-pradesh': buildSplitCollageImages('madhya-pradesh'),
  maharashtra: buildSplitCollageImages('maharashtra'),
  manipur: buildSplitCollageImages('manipur'),
  meghalaya: buildSplitCollageImages('meghalaya'),
  mizoram: buildSplitCollageImages('mizoram'),
  nagaland: buildSplitCollageImages('nagaland'),
  odisha: buildSplitCollageImages('odisha'),
  puducherry: buildSplitCollageImages('puducherry'),
  punjab: buildSplitCollageImages('punjab'),
  rajasthan: [rajasthan1, rajasthan2, rajasthan3, rajasthan4],
  sikkim: buildSplitCollageImages('sikkim'),
  'tamil-nadu': buildSplitCollageImages('tamil-nadu'),
  telangana: buildSplitCollageImages('telangana'),
  tripura: buildSplitCollageImages('tripura'),
  'uttar-pradesh': buildSplitCollageImages('uttar-pradesh'),
  uttarakhand: buildSplitCollageImages('uttarakhand'),
  'west-bengal': buildSplitCollageImages('west-bengal'),
};

const createState = (
  id: string,
  name: string,
  labelLines: string[],
  description: string,
  highlights: string[],
  shape: IndiaInteriorState['shape'],
  pin: IndiaInteriorState['pin'],
  label: IndiaInteriorState['label'],
  accent: string,
): IndiaInteriorState => ({
  id,
  name,
  labelLines,
  description,
  highlights,
  images: LOCAL_STATE_IMAGE_OVERRIDES[id] ?? buildImages(id),
  shape,
  pin,
  label,
  accent,
});

export const INDIA_INTERIOR_STATES: IndiaInteriorState[] = [
  createState('jammu-kashmir', 'Jammu & Kashmir', ['JAMMU &', 'KASHMIR'], 'Walnut wood, carpets, carved ceilings and richly layered heritage rooms.', ['Walnut wood', 'Rich textiles', 'Carved details'], { x: 238, y: 40, width: 115, height: 58, rx: 20, rotate: -10 }, { x: 292, y: 68 }, { x: 292, y: 62 }, palette[0]),
  createState('ladakh', 'Ladakh', ['LADAKH'], 'Mountain calm translated into warm woods, texture and serene hospitality.', ['Stone tones', 'Warm timber', 'Minimal palette'], { x: 360, y: 38, width: 110, height: 65, rx: 18, rotate: 8 }, { x: 415, y: 69 }, { x: 415, y: 63 }, palette[1]),
  createState('himachal-pradesh', 'Himachal Pradesh', ['HIMACHAL', 'PRADESH'], 'Timber, stone and mountain architecture shaping intimate, warm interiors.', ['Timber frames', 'Stone character', 'Warm hearths'], { x: 250, y: 112, width: 95, height: 48, rx: 16, rotate: -4 }, { x: 296, y: 135 }, { x: 296, y: 131 }, palette[2]),
  createState('punjab', 'Punjab', ['PUNJAB'], 'Generous homes with classical proportions, warmth and artisanal detailing.', ['Bold arches', 'Handcrafted wood', 'Warm hospitality'], { x: 190, y: 136, width: 78, height: 58, rx: 18, rotate: -8 }, { x: 228, y: 164 }, { x: 228, y: 159 }, palette[3]),
  createState('chandigarh', 'Chandigarh', ['CHANDIGARH'], 'Modernist clarity meets refined domestic comfort and clean spatial planning.', ['Modern lines', 'Polished surfaces', 'Orderly layouts'], { x: 275, y: 162, width: 20, height: 18, rx: 6 }, { x: 285, y: 171 }, { x: 340, y: 150 }, palette[4]),
  createState('haryana', 'Haryana', ['HARYANA'], 'Quiet luxury, structured planning and contemporary family living.', ['Structured plans', 'Muted elegance', 'Modern comfort'], { x: 286, y: 150, width: 66, height: 58, rx: 18, rotate: -2 }, { x: 318, y: 179 }, { x: 318, y: 173 }, palette[5]),
  createState('delhi', 'Delhi', ['DELHI'], 'A layered metropolitan mix of heritage opulence and contemporary sophistication.', ['Urban luxury', 'Statement lighting', 'Layered decor'], { x: 332, y: 190, width: 20, height: 18, rx: 6 }, { x: 342, y: 199 }, { x: 387, y: 206 }, palette[6]),
  createState('uttarakhand', 'Uttarakhand', ['UTTARAKHAND'], 'Hill-inspired interiors with tactile woods, local stone and natural light.', ['Natural light', 'Wood textures', 'Quiet retreat'], { x: 347, y: 130, width: 82, height: 52, rx: 16, rotate: 4 }, { x: 388, y: 156 }, { x: 388, y: 151 }, palette[7]),
  createState('rajasthan', 'Rajasthan', ['RAJASTHAN'], 'Royal heritage meets handcrafted interiors, arches, sandstone and textile richness.', ['Arches', 'Carved wood', 'Textile warmth'], { x: 138, y: 202, width: 150, height: 118, rx: 22, rotate: -8 }, { x: 210, y: 260 }, { x: 210, y: 252 }, palette[2]),
  createState('uttar-pradesh', 'Uttar Pradesh', ['UTTAR', 'PRADESH'], 'Classical detailing and grand room-making shaped by palatial traditions.', ['Grand rooms', 'Crafted mouldings', 'Timeless symmetry'], { x: 360, y: 190, width: 162, height: 92, rx: 20, rotate: 2 }, { x: 440, y: 235 }, { x: 440, y: 225 }, palette[1]),
  createState('sikkim', 'Sikkim', ['SIKKIM'], 'Compact but expressive interiors with mountain restraint and intricate craft.', ['Mountain calm', 'Soft textures', 'Craft focus'], { x: 620, y: 214, width: 34, height: 24, rx: 10 }, { x: 637, y: 226 }, { x: 684, y: 210 }, palette[5]),
  createState('bihar', 'Bihar', ['BIHAR'], 'Earthy tones, crafted furnishings and quietly formal rooms.', ['Earthy palette', 'Warm timber', 'Crafted furniture'], { x: 525, y: 220, width: 88, height: 72, rx: 18, rotate: -4 }, { x: 567, y: 256 }, { x: 567, y: 248 }, palette[0]),
  createState('west-bengal', 'West Bengal', ['WEST', 'BENGAL'], 'Colonial-era proportions, intricate timber work and deeply atmospheric rooms.', ['Colonial proportion', 'Decorative details', 'Layered lighting'], { x: 615, y: 250, width: 68, height: 88, rx: 18, rotate: 8 }, { x: 648, y: 294 }, { x: 648, y: 286 }, palette[4]),
  createState('jharkhand', 'Jharkhand', ['JHARKHAND'], 'Textural simplicity shaped by natural materials and solid, grounded furniture.', ['Natural materials', 'Grounded palette', 'Solid joinery'], { x: 520, y: 302, width: 88, height: 58, rx: 18, rotate: 2 }, { x: 563, y: 331 }, { x: 563, y: 326 }, palette[6]),
  createState('assam', 'Assam', ['ASSAM'], 'Bamboo, cane, timber and light-filled interiors with a natural ease.', ['Bamboo craft', 'Cane details', 'Natural light'], { x: 692, y: 240, width: 110, height: 58, rx: 18, rotate: 4 }, { x: 746, y: 269 }, { x: 746, y: 262 }, palette[3]),
  createState('arunachal-pradesh', 'Arunachal Pradesh', ['ARUNACHAL', 'PRADESH'], 'Warm timber spaces with local craft, texture and elevated mountain calm.', ['Local craft', 'Warm timber', 'Mountain calm'], { x: 735, y: 155, width: 122, height: 88, rx: 18, rotate: -8 }, { x: 795, y: 198 }, { x: 795, y: 188 }, palette[7]),
  createState('meghalaya', 'Meghalaya', ['MEGHALAYA'], 'Small-scale handcrafted interiors, wood grain and moody atmospheric warmth.', ['Atmospheric wood', 'Handcrafted scale', 'Soft warmth'], { x: 650, y: 295, width: 62, height: 38, rx: 16, rotate: -3 }, { x: 681, y: 314 }, { x: 681, y: 310 }, palette[5]),
  createState('tripura', 'Tripura', ['TRIPURA'], 'Compact interiors with warm materials and an intimate handcrafted spirit.', ['Handcrafted spirit', 'Warm palette', 'Intimate rooms'], { x: 686, y: 336, width: 38, height: 48, rx: 12, rotate: -2 }, { x: 705, y: 360 }, { x: 748, y: 352 }, palette[0]),
  createState('nagaland', 'Nagaland', ['NAGALAND'], 'Tribal craft, woven textiles, dark wood and expressive handmade character.', ['Tribal craft', 'Woven textiles', 'Dark wood'], { x: 770, y: 260, width: 72, height: 48, rx: 16, rotate: 6 }, { x: 806, y: 284 }, { x: 806, y: 278 }, palette[2]),
  createState('manipur', 'Manipur', ['MANIPUR'], 'Refined handcrafted rooms with layered textiles and warm local woods.', ['Local woods', 'Layered textiles', 'Calm elegance'], { x: 760, y: 315, width: 58, height: 48, rx: 16, rotate: 4 }, { x: 789, y: 339 }, { x: 789, y: 334 }, palette[1]),
  createState('mizoram', 'Mizoram', ['MIZORAM'], 'Light timber, woven surfaces and intimate homes shaped by craft traditions.', ['Woven surfaces', 'Timber warmth', 'Compact comfort'], { x: 728, y: 362, width: 68, height: 58, rx: 16, rotate: 8 }, { x: 762, y: 391 }, { x: 762, y: 384 }, palette[6]),
  createState('gujarat', 'Gujarat', ['GUJARAT'], 'Pol house memory, carved wood, courtyards and vibrant traditional textiles.', ['Courtyards', 'Carved facades', 'Textile detail'], { x: 82, y: 312, width: 104, height: 92, rx: 22, rotate: -10 }, { x: 132, y: 357 }, { x: 132, y: 348 }, palette[1]),
  createState('madhya-pradesh', 'Madhya Pradesh', ['MADHYA', 'PRADESH'], 'Central Indian warmth with grounded materials, layered wood and heritage cues.', ['Grounded materials', 'Layered wood', 'Heritage cues'], { x: 286, y: 302, width: 168, height: 122, rx: 24, rotate: 4 }, { x: 370, y: 362 }, { x: 370, y: 352 }, palette[3]),
  createState('chhattisgarh', 'Chhattisgarh', ['CHHATTISGARH'], 'Natural palettes, quiet detailing and generous, livable spaces.', ['Natural palette', 'Quiet detailing', 'Generous plans'], { x: 460, y: 336, width: 94, height: 92, rx: 22, rotate: 6 }, { x: 507, y: 382 }, { x: 507, y: 373 }, palette[4]),
  createState('odisha', 'Odisha', ['ODISHA'], 'Temple-inspired geometry, artisan work and richly textured domestic interiors.', ['Temple geometry', 'Artisan craft', 'Textured rooms'], { x: 530, y: 398, width: 92, height: 90, rx: 20, rotate: 8 }, { x: 576, y: 443 }, { x: 576, y: 434 }, palette[2]),
  createState('maharashtra', 'Maharashtra', ['MAHARASHTRA'], 'Wada-inspired spatial depth with timber, courtyards and enduring materiality.', ['Wada character', 'Timber depth', 'Courtyard planning'], { x: 184, y: 420, width: 164, height: 132, rx: 24, rotate: 4 }, { x: 264, y: 486 }, { x: 264, y: 476 }, palette[2]),
  createState('dadra-nagar-haveli-daman-diu', 'Dadra & Nagar Haveli and Daman & Diu', ['DNH &', 'DAMAN DIU'], 'Coastal and inland influences blending airy rooms with crafted details.', ['Coastal light', 'Craft detail', 'Relaxed rooms'], { x: 150, y: 472, width: 30, height: 34, rx: 10 }, { x: 165, y: 489 }, { x: 108, y: 495 }, palette[7]),
  createState('goa', 'Goa', ['GOA'], 'Indo-Portuguese charm, tiled floors, coastal light and colorful joinery.', ['Tiled floors', 'Coastal light', 'Indo-Portuguese'], { x: 199, y: 558, width: 26, height: 32, rx: 10 }, { x: 212, y: 574 }, { x: 165, y: 584 }, palette[5]),
  createState('telangana', 'Telangana', ['TELANGANA'], 'Refined contemporary comfort layered with local craft and warm tones.', ['Contemporary calm', 'Warm tones', 'Craft accents'], { x: 388, y: 460, width: 82, height: 82, rx: 18, rotate: -2 }, { x: 429, y: 501 }, { x: 429, y: 492 }, palette[1]),
  createState('andhra-pradesh', 'Andhra Pradesh', ['ANDHRA', 'PRADESH'], 'Expansive homes with warm finishes, soft luxury and regional character.', ['Soft luxury', 'Warm finishes', 'Regional craft'], { x: 460, y: 478, width: 118, height: 128, rx: 22, rotate: 8 }, { x: 519, y: 542 }, { x: 519, y: 532 }, palette[3]),
  createState('karnataka', 'Karnataka', ['KARNATAKA'], 'Timber richness, verandahs and quietly elegant spaces made for long living.', ['Verandahs', 'Timber richness', 'Quiet elegance'], { x: 236, y: 560, width: 112, height: 132, rx: 22, rotate: 2 }, { x: 292, y: 626 }, { x: 292, y: 616 }, palette[6]),
  createState('kerala', 'Kerala', ['KERALA'], 'Natural materials, timber craftsmanship and tropical courtyards full of light.', ['Tropical courtyards', 'Teak craft', 'Brass warmth'], { x: 250, y: 700, width: 58, height: 126, rx: 22, rotate: -6 }, { x: 279, y: 762 }, { x: 334, y: 760 }, palette[1]),
  createState('tamil-nadu', 'Tamil Nadu', ['TAMIL', 'NADU'], 'Chettinad influence, columns, Athangudi spirit and stately timber furniture.', ['Chettinad influence', 'Columns', 'Timber furniture'], { x: 330, y: 686, width: 102, height: 132, rx: 22, rotate: 4 }, { x: 380, y: 752 }, { x: 380, y: 742 }, palette[0]),
  createState('puducherry', 'Puducherry', ['PUDUCHERRY'], 'Sunlit coastal interiors with heritage romance and refined restraint.', ['Coastal calm', 'Heritage touch', 'Sunlit rooms'], { x: 392, y: 796, width: 26, height: 30, rx: 10 }, { x: 405, y: 811 }, { x: 472, y: 808 }, palette[4]),
  createState('lakshadweep', 'Lakshadweep', ['LAKSHADWEEP'], 'Barefoot coastal luxury with light timber, woven textures and sea air.', ['Coastal luxury', 'Woven textures', 'Light timber'], { x: 104, y: 728, width: 24, height: 52, rx: 10 }, { x: 116, y: 754 }, { x: 88, y: 790 }, palette[7]),
  createState('andaman-nicobar', 'Andaman & Nicobar Islands', ['ANDAMAN &', 'NICOBAR'], 'Island interiors shaped by ocean light, resort calm and effortless comfort.', ['Ocean light', 'Resort calm', 'Relaxed sophistication'], { x: 720, y: 622, width: 40, height: 134, rx: 16, rotate: 8 }, { x: 740, y: 688 }, { x: 792, y: 688 }, palette[5]),
];

export const INDIA_INTERIOR_STATE_MAP = Object.fromEntries(
  INDIA_INTERIOR_STATES.map((state) => [state.id, state]),
) as Record<string, IndiaInteriorState>;

export const INDIA_INTERIOR_AUTO_ORDER = INDIA_INTERIOR_STATES.map((state) => state.id);
