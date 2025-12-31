/// <reference no-default-lib="true" />
/// <reference lib="deno.ns" />
/// <reference lib="deno.window" />

declare module "https://deno.land/std@0.190.0/http/server.ts" {
  export { serve } from "https://deno.land/std@0.190.0/http/server.ts";
}

declare module "https://esm.sh/@supabase/supabase-js@2.45.0" {
  export { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
  export type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
}

// Declare Deno global for environment variables
declare namespace Deno {
  namespace env {
    function get(key: string): string | undefined;
  }
}