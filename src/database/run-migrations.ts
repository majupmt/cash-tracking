import { runMigrations } from './migrations';

async function main() {
    await runMigrations();
    process.exit(0);
}

main();