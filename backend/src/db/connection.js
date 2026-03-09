const { createClient } = require('@supabase/supabase-js');
const { Pool } = require('pg');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || 'http://localhost:8000';
const supabaseKey = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4YW1wbGUiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTUwMzk3NDU0NiwiZXhwIjoyNTAzOTcwMTQ2fQ.36NmQgQaud91DKKC3k3ka5Euro5YiZW-zv_MQoDfbAE';

const supabase = createClient(supabaseUrl, supabaseKey);

// Direct PostgreSQL connection pool for complex queries
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'nurserytrack'
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

module.exports = {
  supabase,
  pool,
  query: (text, params) => pool.query(text, params)
};
