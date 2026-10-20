/**
 * Sipwise — Configuration Settings
 * 
 * To connect your live Supabase cloud database:
 * 1. Go to https://supabase.com and create a free project.
 * 2. In Project Settings -> API, copy your Project URL and anon public key.
 * 3. Paste them below.
 * 4. Run `supabase-schema.sql` in your Supabase SQL Editor.
 * 
 * If left empty/placeholder, Sipwise operates in Local Sandbox Mode automatically!
 */

window.SIPWISE_CONFIG = {
    SUPABASE_URL: "",       // e.g. "https://xyzcompany.supabase.co"
    SUPABASE_ANON_KEY: "",  // e.g. "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    
    // Checks if valid live Supabase credentials have been provided
    isSupabaseConfigured: function () {
        return Boolean(
            this.SUPABASE_URL && 
            this.SUPABASE_ANON_KEY && 
            this.SUPABASE_URL.startsWith("https://") &&
            !this.SUPABASE_URL.includes("your-project-id")
        );
    }
};
