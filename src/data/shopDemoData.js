/**
 * Frontend-only sample catalog for the JNRmart Shop Page.
 * Replace this module with Laravel API data without changing ShopPage layout.
 * Images are original demo SVG illustrations, NOT photos of real merchandise.
 */
const image = (name) => `/images/shop/${name}.svg`;

export const shopProductGroups = [
  { slug: 'oil-ghee', name: 'Oil & Ghee' },
  { slug: 'honey', name: 'Honey' },
  { slug: 'dates', name: 'Dates' },
  { slug: 'spices', name: 'Spices' },
  { slug: 'nuts-seeds', name: 'Nuts & Seeds' },
  { slug: 'beverage', name: 'Beverage' },
  { slug: 'rice', name: 'Rice' },
  { slug: 'flours-lentils', name: 'Flours & Lentils' },
];

// Short form: [name, category, subCategory, brand, price, oldPrice, illustration, flags]
const records = [
  ['Cold Pressed Mustard Oil 2L', 'oil-ghee', 'Mustard Oil', 'JNRmart', 680, 750, 'mustard-oil', 'best'],
  ['Pure Gawa Ghee 400g', 'oil-ghee', 'Ghee', 'Shuddho', 800, 850, 'ghee', ''],
  ['Extra Virgin Coconut Oil 1L', 'oil-ghee', 'Coconut Oil', 'GreenNest', 2080, null, 'coconut-oil', 'new'],
  ['Premium Gawa Ghee 200g', 'oil-ghee', 'Ghee', 'Shuddho', 400, null, 'ghee', ''],
  ['Organic Coconut Oil 500ml', 'oil-ghee', 'Coconut Oil', 'GreenNest', 1150, 1280, 'coconut-oil', ''],
  ['Natural Black Seed Oil 1L', 'oil-ghee', 'Black Seed Oil', 'PureFields', 2500, null, 'seed-oil', 'best'],
  ['Mustard Oil 500ml', 'oil-ghee', 'Mustard Oil', 'JNRmart', 175, null, 'mustard-oil', ''],
  ['Traditional Gawa Ghee 1kg', 'oil-ghee', 'Ghee', 'Shuddho', 1890, 1990, 'ghee', 'best'],
  ['Extra Virgin Olive Oil 500ml', 'oil-ghee', 'Olive Oil', 'Oliveta', 1150, null, 'olive-oil', ''],
  ['Extra Virgin Olive Oil 250ml', 'oil-ghee', 'Olive Oil', 'Oliveta', 750, null, 'olive-oil', ''],
  ['Organic Mustard Oil 5L', 'oil-ghee', 'Mustard Oil', 'JNRmart', 1700, null, 'mustard-oil', 'new'],
  ['Premium Olive Oil 1L', 'oil-ghee', 'Olive Oil', 'Oliveta', 2390, 2550, 'olive-oil', ''],
  ['Farm Fresh Ghee 500g', 'oil-ghee', 'Ghee', 'PureFields', 975, null, 'ghee', ''],
  ['Rice Bran Cooking Oil 2L', 'oil-ghee', 'Cooking Oil', 'Nourish', 610, 650, 'mustard-oil', ''],
  ['Sunflower Cooking Oil 1L', 'oil-ghee', 'Cooking Oil', 'Nourish', 385, null, 'mustard-oil', 'new'],
  ['Virgin Coconut Oil 250ml', 'oil-ghee', 'Coconut Oil', 'GreenNest', 450, null, 'coconut-oil', ''],
  ['Black Seed Oil 250ml', 'oil-ghee', 'Black Seed Oil', 'PureFields', 790, null, 'seed-oil', ''],
  ['Premium Imported Olive Oil 5L', 'oil-ghee', 'Olive Oil', 'Oliveta', 12500, 13000, 'olive-oil', 'best'],
  ['Sundarban Raw Honey 1kg', 'honey', 'Raw Honey', 'JNRmart', 2125, 2500, 'honey', 'best'],
  ['Black Seed Honey 500g', 'honey', 'Black Seed Honey', 'PureFields', 960, null, 'honey', ''],
  ['Mustard Flower Honey 1kg', 'honey', 'Raw Honey', 'PureFields', 1690, null, 'honey', 'new'],
  ['Litchi Flower Honey 500g', 'honey', 'Raw Honey', 'GreenNest', 720, 790, 'honey', ''],
  ['Premium Ajwa Dates 500g', 'dates', 'Ajwa Dates', 'JNRmart', 1450, null, 'dates', 'best'],
  ['Premium Medjool Dates 1kg', 'dates', 'Medjool Dates', 'PureFields', 2250, 2490, 'dates', 'new'],
  ['Soft Mariyam Dates 500g', 'dates', 'Mariyam Dates', 'Shuddho', 840, null, 'dates', ''],
  ['Turmeric Powder 250g', 'spices', 'Ground Spices', 'Shuddho', 150, null, 'spices', ''],
  ['Premium Chili Powder 250g', 'spices', 'Ground Spices', 'JNRmart', 230, 270, 'spices', 'best'],
  ['Whole Cumin Seeds 200g', 'spices', 'Whole Spices', 'PureFields', 290, null, 'spices', ''],
  ['Roasted Almonds 500g', 'nuts-seeds', 'Almonds', 'PureFields', 1100, 1250, 'nuts', 'best'],
  ['Premium Cashews 250g', 'nuts-seeds', 'Cashews', 'GreenNest', 690, null, 'nuts', ''],
  ['Mixed Nuts 400g', 'nuts-seeds', 'Mixed Nuts', 'JNRmart', 1190, null, 'nuts', 'new'],
  ['Organic Green Tea 100g', 'beverage', 'Tea', 'GreenNest', 460, null, 'tea', 'new'],
  ['Black Tea 200g', 'beverage', 'Tea', 'JNRmart', 240, null, 'tea', ''],
  ['Instant Coffee 200g', 'beverage', 'Coffee', 'Nourish', 790, 850, 'tea', 'best'],
  ['Premium Miniket Rice 5kg', 'rice', 'Miniket Rice', 'JNRmart', 490, null, 'rice', ''],
  ['Aromatic Chinigura Rice 2kg', 'rice', 'Aromatic Rice', 'PureFields', 440, 490, 'rice', 'best'],
  ['Brown Rice 2kg', 'rice', 'Brown Rice', 'GreenNest', 380, null, 'rice', 'new'],
  ['Premium Masoor Dal 1kg', 'flours-lentils', 'Lentils', 'JNRmart', 190, null, 'rice', ''],
  ['Stoneground Atta 2kg', 'flours-lentils', 'Flour', 'PureFields', 175, 195, 'rice', 'best'],
  ['Organic Moong Dal 1kg', 'flours-lentils', 'Lentils', 'GreenNest', 240, null, 'rice', 'new'],
];

export const shopProducts = records.map((record, index) => {
  const [name, category, subCategory, brand, price, oldPrice, imageName, flag] = record;
  return {
    id: index + 101,
    slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
    name,
    category,
    subCategory,
    brand,
    price,
    oldPrice,
    image: image(imageName),
    bestSelling: flag === 'best',
    newArrival: flag === 'new',
    rating: 4.3 + (index % 6) / 10,
    createdAt: Date.now() - index * 86400000,
  };
});

export const moneyBDT = (amount) => `৳${Number(amount || 0).toLocaleString('en-BD', { maximumFractionDigits: 0 })}`;
