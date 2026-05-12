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
      .from('regolamentos')
      .select('*')
      .eq('is_active', true)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async saveRegolamento(regolamento: Regolamento): Promise<void> {
    const payload = {
      title: regolamento.title.trim(),
      season: regolamento.season?.trim() || null,
      content: regolamento.content.trim(),
      is_active: true,
      updated_at: new Date().toISOString(),
    };

    const existing = await this.getActiveRegolamento();

    if (existing?.id) {
      const { error } = await supabase
        .from('regolamentos')
        .update(payload)
        .eq('id', existing.id);

      if (error) throw error;
      return;
    }

    const { error } = await supabase.from('regolamentos').insert(payload);

    if (error) throw error;
  }
}
