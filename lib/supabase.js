import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://aagjeigpavocotkqtoid.supabase.co";
const supabaseAnonKey = "sb_publishable_WsE-3LcDXDylsizVS5IIrA_r93mkdEv";

// Perbaikan untuk error WebSocket di Node.js 20 (terutama saat menggunakan Expo Web/SSR)
const isNode =
  typeof process !== "undefined" && process.versions && process.versions.node;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    transport: isNode ? require("ws") : undefined,
  },
});
