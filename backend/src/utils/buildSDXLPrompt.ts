export interface PromptOptions {
  style: string;
  roomType: string;
  budget: string;
  customKeywords?: string;
}

const styleDescriptions: Record<string, string> = {
  Rajasthan: "ornate arches, jharokha window details, block-printed block designs, warm marigold and terracotta hues, handcrafted sheesham wooden furniture, traditional brass lanterns, luxury royal heritage decor",
  Kerala: "teak and rosewood paneling, brass urli bowls, terracotta floors, high wooden ceilings, traditional charupady window benches, white and gold kasavu linen, natural eco-friendly materials",
  Kashmir: "intricate walnut wood carvings, colorful papier-mâché artifacts, hand-knotted crewel carpets, traditional khatamband ceilings, copper tea samovars as decor, warm lighting, cozy velvet cushions",
  Punjab: "vibrant phulkari embroidery pillows, rich clay pottery, rustic wooden chests (sandook), sturdy charpai-style benches, bright mustard and orange tones, spacious open windows",
  Gujarat: "colorful sankheda lacquerware furniture, mud mirror art (lippan kaam) on accent walls, bandhani drapes, patch-work cushions, copper bells, vibrant festive textures",
  "Tamil Nadu": "rich athangudi patterned tiles, brass oil lamps (kuthuvilakku), heavy wooden pillars, Tanjore paintings, traditional wooden swing (oonjal), earthy red brick details",
  Karnataka: "sandalwood accents, rosewood furniture, traditional bidriware metal crafts, rich silk throw pillows, minimalist stone columns, calm green and gold color scheme",
  Telangana: "kondapalli wooden toys on shelves, silver filigree frames, ikkat patterned upholstery, local handloom fabrics, warm brass wall hangings, contemporary deccan styling",
  "Uttar Pradesh": "exquisite brassware from Moradabad, blue pottery vases, lucknowi chikankari curtains, avadhi style arches, marble inlay tabletop designs, elegant traditional chandeliers",
  Maharashtra: "warli wall paintings, robust teakwood cabinets, copper vessels, traditional wooden swings, handloom paithani silk cushion covers, warm yellow lighting",
  Goa: "indo-Portuguese archways, distressed pastel blue and white cabinets, hand-painted azulejo tiles, wicker furniture, coastal sea-breeze layout, light sheer drapes",
  "West Bengal": "terracotta wall panels, hand-woven jamdani throw pillows, book-filled teak shelves, classic colonial-era armchairs, kantha stitch runners, elegant red and white accent themes",
  Assam: "muga silk runners, bamboo and cane screens, bell metal plates, traditional jaapi hats, light wood structure, natural botanical plants, minimal design",
  Sikkim: "tibetan-style thangka scrolls, colorful hand-painted low tables (choktse), woolen carpets with dragon motifs, warm fire hearth, wooden beams, rich red and gold hues",
  Bihar: "colorful madhubani paintings, handwoven tussar silk bedsheets, local clay planters, rustic wooden stool, bright earthy tones",
  Odisha: "pattachitra scroll paintings, hand-loomed ikat fabrics, brass bells, silver filigree decorative boxes, calm blue and grey hues resembling coastal temples",
  "Himachal Pradesh": "cozy himachali wool carpets, slate stone fireplace, heavy pine wood walls and ceiling beams, local hand-woven throws, scenic window view styling",
  Uttarakhand: "rustic wooden cabin aesthetic, local slate stone accents, warm woolen blankets, pine cone centerpiece decor, natural elements",
  Delhi: "luxurious mughal-inspired marble, modern luxury furniture, grand metallic screens (jaali), velvet upholstery, high ceilings, rich emerald and gold tones",
  "Andhra Pradesh": "lepakshi fresco paintings on canvas, kalamkari block-printed curtains, brass figurines, sturdy wooden bench, warm amber tones",
  Haryana: "sturdy wooden chests, clay pots, handwoven cotton durries, minimalist farm-house structural beams, rustic metal hardware",
  "Madhya Pradesh": "chanderi silk drapes, local stone statues, tribal gond art panels, wooden screens, warm forest green and mustard tones",
  Chhattisgarh: "traditional dhokra bronze figurines, hand-crafted wrought iron art, local bastar wood carvings, neutral linen fabrics, dark wood furniture",
  Jharkhand: "sohrai tribal wall paintings, local clay pots, bamboo light fixtures, cotton weaves, natural foliage",
  Manipur: "hand-woven manipuri cotton bedcovers, local black stone pottery, bamboo vases, simple low-seating arrangement, natural textures",
  Meghalaya: "cane and bamboo partition screens, local wildflowers, rustic dark wood, cozy handloom blankets, misty glass windows style",
  // Fallbacks
  Modern: "clean straight lines, modern minimalist furniture, neutral grey and white color schemes, smart lighting, high-end materials",
  Luxury: "premium marble floor, gold metallic accents, high-end velvet seating, massive chandeliers, luxurious modern styling",
  Minimalist: "decluttered space, bare minimum furniture, sleek hidden storage, monochrome palette, natural light optimization",
  Japandi: "blending Japanese minimalism and Scandinavian warmth, low-profile oak furniture, linen fabrics, muted earth tones, paper lamps",
  Scandinavian: "light wooden floor, cozy sheepskin throws, simple functional furniture, white walls, airy layout",
  Bohemian: "macrame wall hangings, textured rugs, mismatching colorful pillows, multiple indoor plants, rattan furniture",
};

export function buildSDXLPrompt(options: PromptOptions) {
  const { style, roomType, budget, customKeywords } = options;

  const styleText = styleDescriptions[style] || styleDescriptions["Modern"];
  const budgetQualifier =
    budget === "Under ₹50K"
      ? "affordable and smart space optimization, clean simple layout, neat paint finish"
      : budget === "₹50K–2L"
        ? "moderate pricing, comfortable branded furniture, modular setups, stylish wallpaper"
        : budget === "₹2L–5L"
          ? "premium build, customized wardrobes, bespoke wooden paneling, high-quality false ceiling, designer lights"
          : "ultra-luxurious premium finishes, custom marble tiling, high-end designer furniture, architectural statement walls";

  const roomQualifier = `${roomType.toLowerCase()} interior design, highly detailed, realistic shadows, architectural digest style, 8k resolution, photorealistic`;

  const positivePrompt = `Professional photo of a ${roomQualifier}. Designed in Indian ${style} style with ${styleText}. Includes ${budgetQualifier}. ${
    customKeywords ? `Custom preferences: ${customKeywords}.` : ""
  } Warm ambient lighting, perfect perspective, volumetric rendering, cinematic shot, realistic texture mapping, raytracing.`;

  const negativePrompt =
    "watermark, text, signatures, low quality, deformed furniture, distorted perspective, extra legs, blurry, bad anatomy, bad lighting, out of frame, oversaturated, unrealistic rendering, draft, sketch, black and white";

  return { positivePrompt, negativePrompt };
}
