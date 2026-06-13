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

// Deno web globals (not in Node.js typedefs — needed for VS Code IntelliSense)
declare class Request {
  readonly method: string;
  readonly url: string;
  readonly headers: Headers;
  json(): Promise<any>;
  text(): Promise<string>;
}

declare class Response {
  constructor(body?: BodyInit | null, init?: ResponseInit);
  readonly ok: boolean;
  readonly status: number;
  readonly headers: Headers;
  json(): Promise<any>;
  text(): Promise<string>;
}

declare function fetch(input: string | Request, init?: RequestInit): Promise<Response>;