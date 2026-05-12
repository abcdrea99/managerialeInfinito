import { Injectable } from '@angular/core';
import { supabase } from '../core/supabase.client';

export interface Regolamento {
  id?: string;
  title: string;
  season?: string | null;
  content: string;
  is_active?: boolean;
  updated_at?: string;
}

@Injectable({
  providedIn: 'root',
})
export class RegolamentoService {
  async getActiveRegolamento(): Promise<Regolamento | null> {
    const { data, error } = await supabase
      .from('Regolamentos')
      .select('*')
      .eq('is_active', true)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async saveRegolamento(Regolamento: Regolamento): Promise<void> {
    const payload = {
      title: Regolamento.title.trim(),
      season: Regolamento.season?.trim() || null,
      content: Regolamento.content.trim(),
      is_active: true,
      updated_at: new Date().toISOString(),
    };

    const existing = await this.getActiveRegolamento();

    if (existing?.id) {
      const { error } = await supabase
        .from('Regolamentos')
        .update(payload)
        .eq('id', existing.id);

      if (error) throw error;
      return;
    }

    const { error } = await supabase.from('Regolamentos').insert(payload);

    if (error) throw error;
  }
}
