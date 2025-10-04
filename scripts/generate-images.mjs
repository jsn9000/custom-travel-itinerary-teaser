import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const prompts = [
  'A stunning photograph of people dining at a seaside Mediterranean taverna during golden hour, crystal clear turquoise water in background, fresh seafood on table, warm sunset lighting, luxury travel photography style',
  'A breathtaking aerial view of a private boat sailing through crystal-clear Mediterranean waters between small islands, dramatic cliffs, vibrant blue and turquoise colors, professional travel photography',
  'A beautiful photograph of ancient Mediterranean architecture, white-washed buildings with blue domes, narrow cobblestone streets, bougainvillea flowers, sunny day, luxury travel magazine style',
  'A luxurious photograph of people wine tasting at a Mediterranean vineyard, rolling hills of grapevines, sunset golden hour lighting, elegant wine glasses, sophisticated travel photography style'
];

async function generateImages() {
  const imageUrls = [];

  for (let i = 0; i < prompts.length; i++) {
    console.log(`Generating image ${i + 1}/${prompts.length}...`);
    try {
      const response = await openai.images.generate({
        model: 'dall-e-3',
        prompt: prompts[i],
        n: 1,
        size: '1792x1024',
        quality: 'hd',
        style: 'natural'
      });

      imageUrls.push(response.data[0].url);
      console.log(`Image ${i + 1} URL: ${response.data[0].url}`);
    } catch (error) {
      console.error(`Error generating image ${i + 1}:`, error.message);
    }
  }

  console.log('\n=== All image URLs ===');
  imageUrls.forEach((url, i) => {
    console.log(`Image ${i + 1}: ${url}`);
  });

  console.log('\n=== JSON Array ===');
  console.log(JSON.stringify(imageUrls, null, 2));
}

generateImages().catch(console.error);
