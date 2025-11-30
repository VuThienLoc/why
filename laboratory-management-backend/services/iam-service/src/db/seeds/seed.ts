import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runSeed(seedFile: string) {
  try {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Running: ${seedFile}`);
    console.log('='.repeat(60));
    
    const seedPath = path.join(__dirname, seedFile);
    const { stdout, stderr } = await execAsync(`node --loader ts-node/esm ${seedPath}`);
    
    if (stdout) console.log(stdout);
    if (stderr) console.error(stderr);
    
    console.log(`✅ Completed: ${seedFile}\n`);
  } catch (error: any) {
    console.error(`❌ Error running ${seedFile}:`, error.message);
    throw error;
  }
}

async function seedAll() {
  console.log('\n🌱 Starting database seeding...\n');
  
  try {
    // Run seeds in order
    await runSeed('001_roles.seed.ts');
    await runSeed('002_users.seed.ts');
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ All seeds completed successfully!');
    console.log('='.repeat(60) + '\n');
  } catch (error) {
    console.error('\n❌ Seeding failed!');
    process.exit(1);
  }
}

seedAll();
