# Image Assets Guide — Dharma Daily

## Where to add Telugu nativity images:

### 1. `assets/deities/` — Deity images for monthly banner
Add one image per deity. Recommended size: 400x400px, PNG with transparent bg.

```
venkateshwara.png    — శ్రీ వేంకటేశ్వరుడు (Jan, Dec)
shiva.png            — శ్రీ శివుడు (Feb)
rama.png             — శ్రీ రాముడు (Mar)
hanuman.png          — శ్రీ హనుమంతుడు (Apr)
krishna.png          — శ్రీ కృష్ణుడు (May, Aug)
lakshmi.png          — శ్రీ లక్ష్మీదేవి (Jun, Nov)
ganesha.png          — శ్రీ వినాయకుడు (Jul, Sep)
durga.png            — శ్రీ దుర్గాదేవి (Oct)
```

### 2. `assets/festivals/` — Festival card thumbnails
Add one image per major festival. Recommended: 300x200px, JPG.

```
sankranti.jpg        — మకర సంక్రాంతి (Pongal pot)
shivaratri.jpg       — మహా శివరాత్రి (Shiva lingam)
holi.jpg             — హోలీ (Colors)
ugadi.jpg            — ఉగాది (Ugadi pachadi)
rama_navami.jpg      — శ్రీ రామ నవమి
janmashtami.jpg      — శ్రీ కృష్ణ జన్మాష్టమి
ganesh_chavithi.jpg  — వినాయక చవితి
dussehra.jpg         — దసరా / విజయదశమి
deepavali.jpg        — దీపావళి
karthika.jpg         — కార్తీక పౌర్ణమి
tulasi_vivahom.jpg   — తులసీ వివాహం
```

### 3. `assets/cultural/` — Telugu village/cultural scenes
For section dividers and backgrounds. Recommended: 800x200px, JPG.

```
village_scene.jpg    — Telugu village with paddy fields
temple_gopuram.jpg   — Temple gopuram silhouette
godavari.jpg         — Godavari river scene
bullock_cart.jpg     — Traditional bullock cart
rangoli.png          — Rangoli/muggulu pattern (PNG transparent)
kalash.png           — Pongal kalash with sugarcane (PNG transparent, for panchang icon)
```

## How to use in code:

```javascript
// In DeityBanner.js:
const venkateshwara = require('../../assets/deities/venkateshwara.png');
<Image source={venkateshwara} style={{ width: 120, height: 120 }} />

// In FestivalCard.js:
const images = {
  'మకర సంక్రాంతి': require('../../assets/festivals/sankranti.jpg'),
  'ఉగాది': require('../../assets/festivals/ugadi.jpg'),
};
<Image source={images[festival.telugu]} style={{ width: 80, height: 60 }} />

// For custom Panchang icon in QuickAccessBar:
const kalash = require('../../assets/cultural/kalash.png');
<Image source={kalash} style={{ width: 36, height: 36 }} />
```
