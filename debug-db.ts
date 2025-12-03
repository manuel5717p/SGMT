import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import fs from 'fs'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
})

async function debug() {
    let output = ''

    // Check appointments columns via information_schema
    const { data: columns, error: schemaError } = await supabase
        .from('information_schema.columns')
        .select('column_name')
        .eq('table_name', 'appointments')
        .eq('table_schema', 'public')

    if (schemaError) {
        // information_schema might not be accessible via client if RLS is strict or not exposed
        // Try inserting a dummy record with a bad column to provoke an error listing columns? No, that's messy.
        // Let's try to just select * from appointments limit 0 and see if we get keys? No, empty data means no keys in JSON.
        // Let's try to use the 'rpc' if we had one, but we don't.
        // Let's assume 'client_id' based on previous code usage, but wait...
        // If I can't access information_schema, I'll try to just inspect the error message of a bad select?
        output += 'Error fetching schema: ' + schemaError.message + '\n'
    } else if (columns) {
        output += 'APPOINTMENTS SCHEMA: ' + columns.map(c => c.column_name).join(', ') + '\n'
    } else {
        output += 'No columns found in information_schema for appointments.\n'
    }

    fs.writeFileSync('debug_output.txt', output)
    console.log('Done writing to debug_output.txt')
}

debug()
