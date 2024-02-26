const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabase = createClient(
  'https://pvufuoehcqbckbggpfzg.supabase.co',
  // @ts-ignore
  process.env.SUPABASE_ANON_KEY
)

module.exports = supabase
