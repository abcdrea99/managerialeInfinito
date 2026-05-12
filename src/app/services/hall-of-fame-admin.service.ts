import { Injectable } from '@angular/core';
import { supabase } from '../core/supabase.client';

export type HallOfFameItem = {
  id: string;
  title: string;
  season: string;
  left_content: string;
  right_content: string;
  sort_order: number;
};

export type HallOfFameForm = {
  id: string | null;
  title: string;
  season: string;
  left_content: string;
  right_content: string;
  sort_order: number;
};

@Injectable({
  providedIn: 'root',
})
export class HallOfFameAdminService {
  async getItems(): Promise<HallOfFameItem[]> {
    const { data, error } = await supabase
      .from('hall_of_fame')
      .select('id, title, season, left_content, right_content, sort_order')
      .order('season', { ascending: false })
      .order('sort_order', { ascending: true });

    if (error) throw error;
    return data ?? [];
  }

  async saveItem(form: HallOfFameForm): Promise<void> {
    const payload = {
      title: form.title.trim(),
      season: form.season.trim(),
      left_content: form.left_content.trim(),
      right_content: form.right_content.trim(),
      sort_order: Number(form.sort_order) || 0,
      updated_at: new Date().toISOString(),
    };

    if (form.id) {
      const { data, error } = await supabase
        .from('hall_of_fame')
        .update(payload)
        .eq('id', form.id)
        .select();

      if (error) throw error;

      if (!data || data.length === 0) {
        throw new Error(
          'Nessun elemento aggiornato. Controlla policy RLS o id elemento.',
        );
      }

      return;
    }

    const { error } = await supabase.from('hall_of_fame').insert(payload);
    if (error) throw error;
  }

  async deleteItem(id: string): Promise<void> {
    const { error } = await supabase.from('hall_of_fame').delete().eq('id', id);

    if (error) throw error;
  }
}
