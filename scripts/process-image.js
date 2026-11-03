const sharp = require('sharp');

async function createStudioPortrait() {
  const { width, height } = await sharp('public/rayansh-isolated.png').metadata();
  console.log(`Original cutout dimensions: ${width}x${height}`);

  // Apply subtle color grading to make Rayansh pop cleanly and brightly
  // Brightness slightly boosted, rich blacks, healthy saturation
  const graded = await sharp('public/rayansh-isolated.png')
    .modulate({
      brightness: 1.08,
      saturation: 0.95,
    })
    .linear(1.08, -5) // healthy crisp contrast curve
    .png({ quality: 100 })
    .toFile('public/rayansh-hero.png');

  console.log('Created public/rayansh-hero.png successfully!', graded);
}

createStudioPortrait().catch(err => {
  console.error(err);
  process.exit(1);
});

