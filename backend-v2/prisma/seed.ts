import { execSync } from 'child_process';
import * as path from 'path';

async function main() {
  const seeds = [
    'seed-metiers.ts',
    'seed-amortissements.ts',
    'seed-glossaire.ts',
    'seed-fiches.ts',
    'seed-imf.ts'
  ];

  console.log('🏁 Starting database seeding...');
  for (const seed of seeds) {
    const seedPath = path.join(__dirname, seed);
    console.log(`\n🏃 Running seed: ${seed}...`);
    try {
      execSync(`npx ts-node "${seedPath}"`, { stdio: 'inherit' });
      console.log(`✅ Seed ${seed} completed successfully.`);
    } catch (error) {
      console.error(`❌ Error running seed ${seed}:`, error);
      process.exit(1);
    }
  }
  console.log('\n🎉 All seeds completed successfully!');
}

main();
