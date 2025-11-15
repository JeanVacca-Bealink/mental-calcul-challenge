"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import migrateLocalEntries from "@/app/actions/localSync.actions";

const STORAGE_KEY = "localCompletedChallenges";

export function AuthSync() {
  useEffect(() => {
    const supabase = createClient();
    const { data: sub } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN") {
        try {
          const raw = localStorage.getItem(STORAGE_KEY);
          if (!raw) return;
          const entries = JSON.parse(raw) as Array<any>;
          if (!entries || entries.length === 0) return;
          await migrateLocalEntries(entries);
          // Clear local entries after migration
          localStorage.removeItem(STORAGE_KEY);
        } catch (err) {
          console.error("AuthSync migration failed", err);
        }
      }
    });

    return () => sub?.subscription.unsubscribe();
  }, []);

  return null;
}
