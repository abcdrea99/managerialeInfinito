import { Injectable } from '@angular/core';
import { supabase } from './supabase.client';

export type AdminUserRow = {
  id: string;
  email: string;
  role: string;
  team_name: string | null;
  credits: number;
};

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  async getAllUsers(): Promise<AdminUserRow[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error(error);
      return [];
    }

    return data as AdminUserRow[];
  }

  async updateCredits(userId: string, credits: number): Promise<boolean> {
    const { error } = await supabase
      .from('profiles')
      .update({
        credits,
      })
      .eq('id', userId);

    if (error) {
      console.error(error);
      return false;
    }

    return true;
  }

  async updateTeam(userId: string, teamName: string): Promise<boolean> {
    const { error } = await supabase
      .from('profiles')
      .update({
        team_name: teamName,
      })
      .eq('id', userId);

    if (error) {
      console.error(error);
      return false;
    }

    return true;
  }

  async updateStadium(
    userId: string,
    stadiumName: string,
    level: number,
  ): Promise<boolean> {
    const { error } = await supabase
      .from('stadiums')
      .update({
        name: stadiumName,
        level,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    if (error) {
      console.error(error);
      return false;
    }

    return true;
  }
}
