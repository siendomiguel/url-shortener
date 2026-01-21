"use client"

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface DeleteButtonProps {
  urlId: string;
}

export function DeleteButton({ urlId }: DeleteButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this URL?')) return;

    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.from('urls').delete().eq('id', urlId);
      if (error) throw error;
      router.refresh(); // Refresh the page
    } catch (err) {
      alert('Error deleting URL');
    }
    setLoading(false);
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50"
      title="Delete URL"
    >
      {loading ? '...' : <Trash2 size={16} />}
    </button>
  );
}