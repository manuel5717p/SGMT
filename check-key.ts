import dotenv from 'dotenv'
import fs from 'fs'

dotenv.config({ path: '.env.local' })

if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.log('SERVICE_ROLE_KEY_EXISTS: YES')
} else {
    console.log('SERVICE_ROLE_KEY_EXISTS: NO')
}
