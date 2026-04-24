import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { normalizeProject } from '../lib/projectData';
import { NormalizedProject } from '../types/bookBuddy';
import { useAuth } from '../state/AuthContext';

export function useProjects() {
  const { session } = useAuth();
  const [projects, setProjects] = useState<NormalizedProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    const userId = session?.user.id;

    if (!userId) {
      setProjects([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const { data, error: queryError } = await supabase
      .from('user_projects')
      .select('id, user_id, data, updated_at')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (queryError) {
      setError(queryError.message);
      setProjects([]);
    } else {
      setProjects((data ?? []).map(normalizeProject));
    }

    setLoading(false);
  }, [session?.user.id]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { projects, loading, error, reload };
}
