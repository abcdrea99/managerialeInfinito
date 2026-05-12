import { Injectable } from '@angular/core';
import { supabase } from '../core/supabase.client';

export interface RosterSeason {
  id: string;
  name: string;
  season: string;
  phase: string;
}

export interface RosterPlayer {
  id?: string;
  season_id?: string;
  team_name: string;
  player_name: string;
  role: string;
  quotation: number | null;
  sort_order: number;
}

@Injectable({
  providedIn: 'root',
})
export class RosterService {
  async getSeasons(): Promise<RosterSeason[]> {
    const { data, error } = await supabase
      .from('roster_seasons')
      .select('*')
      .order('season', { ascending: false })
      .order('phase', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async getRostersBySeason(seasonId: string): Promise<RosterPlayer[]> {
    const { data, error } = await supabase
      .from('rosters')
      .select('*')
      .eq('season_id', seasonId)
      .order('team_name', { ascending: true })
      .order('sort_order', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async createSeason(season: string, phase: string): Promise<void> {
    const name = `${season} - ${phase}`;

    const { error } = await supabase.from('roster_seasons').insert({
      name,
      season,
      phase,
    });

    if (error) throw error;
  }

  async replaceSeasonRosters(
    seasonId: string,
    players: RosterPlayer[],
  ): Promise<void> {
    const { error: deleteError } = await supabase
      .from('rosters')
      .delete()
      .eq('season_id', seasonId);

    if (deleteError) throw deleteError;

    const rows = players.map((p, index) => ({
      season_id: seasonId,
      team_name: p.team_name,
      player_name: p.player_name,
      role: p.role,
      quotation: p.quotation,
      sort_order: p.sort_order ?? index + 1,
    }));

    const { error: insertError } = await supabase.from('rosters').insert(rows);

    if (insertError) throw insertError;
  }
}
