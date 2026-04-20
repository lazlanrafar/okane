const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

async function run() {
    console.log('--- STARTING DATABASE RESET ---');
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
        throw new Error('DATABASE_URL is not set');
    }
    console.log('Connecting to database...');
    
    const pool = new Pool({ connectionString: databaseUrl });
    
    try {
        console.log('Dropping public schema...');
        await pool.query('DROP SCHEMA public CASCADE');
        console.log('Creating public schema...');
        await pool.query('CREATE SCHEMA public');
        console.log('Restoring permissions...');
        await pool.query('GRANT ALL ON SCHEMA public TO postgres');
        await pool.query('GRANT ALL ON SCHEMA public TO public');
        
        const baselinePath = path.join(__dirname, 'drizzle/0000_reset_baseline.sql');
        console.log(`Reading baseline from ${baselinePath}`);
        let sql = fs.readFileSync(baselinePath, 'utf8');
        
        // Remove Drizzle-specific markers
        sql = sql.split('--> statement-breakpoint').join(' ');
        
        console.log('Executing baseline SQL...');
        await pool.query(sql);
        console.log('--- SUCCESS: Baseline applied ---');
    } catch (error) {
        console.error('--- FAILURE ---');
        console.error(error);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

run();
