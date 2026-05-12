import { Injectable } from '@angular/core';
import { supabase } from '../core/supabase.client';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  async checkSuperadmin(): Promise<boolean> {
    const { data: userData } = await supabase.auth.getUser();

    if (!userData.user) {
      return false;
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userData.user.id)
      .single();

    return !error && profile?.role === 'superadmin';
  }

  async getUsers(): Promise<any[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select(
        `
        id,
        email,
        role,
        credits,
        team_id,
        teams!profiles_team_id_fkey (
          id,
          name
        ),
        stadiums (
          id,
          name,
          level
        )
      `,
      )
      .order('email', { ascending: true });

    if (error) throw error;

    return (data || []).map((user: any) => {
      const stadium = Array.isArray(user.stadiums)
        ? user.stadiums[0]
        : user.stadiums;

      return {
        ...user,
        stadium,
        selectedTeamId: user.team_id,
        stadiumName: stadium?.name || 'Stadio Comunale',
        stadiumLevel: stadium?.level || 1,
      };
    });
  }

  async getTeams(): Promise<any[]> {
    const { data, error } = await supabase
      .from('teams')
      .select('id, name, is_assigned')
      .order('name', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async addTeam(name: string): Promise<void> {
    const { error } = await supabase.from('teams').insert({
      name,
      is_assigned: false,
    });

    if (error) throw error;
  }

  async deleteTeam(teamId: string): Promise<void> {
    const { error } = await supabase.from('teams').delete().eq('id', teamId);
    if (error) throw error;
  }

  async assignTeam(
    userId: string,
    oldTeamId: string | null,
    newTeamId: string,
  ): Promise<void> {
    const { error } = await supabase
      .from('profiles')
      .update({ team_id: newTeamId })
      .eq('id', userId);

    if (error) throw error;

    if (oldTeamId) {
      await supabase
        .from('teams')
        .update({ is_assigned: false })
        .eq('id', oldTeamId);
    }

    await supabase
      .from('teams')
      .update({ is_assigned: true })
      .eq('id', newTeamId);
  }

  async removeTeamFromUser(userId: string, oldTeamId: string): Promise<void> {
    const { error } = await supabase
      .from('profiles')
      .update({ team_id: null })
      .eq('id', userId);

    if (error) throw error;

    await supabase
      .from('teams')
      .update({ is_assigned: false })
      .eq('id', oldTeamId);
  }

  async updateCredits(userId: string, credits: number): Promise<void> {
    const { error } = await supabase
      .from('profiles')
      .update({ credits })
      .eq('id', userId);

    if (error) throw error;
  }

  async updateUserStadium(
    user: any,
    stadiumName: string,
    stadiumLevel: number,
  ): Promise<void> {
    if (user.stadium?.id) {
      const { error } = await supabase
        .from('stadiums')
        .update({
          name: stadiumName,
          level: stadiumLevel,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.stadium.id);

      if (error) throw error;
      return;
    }

    const { error } = await supabase.from('stadiums').insert({
      user_id: user.id,
      name: stadiumName,
      level: stadiumLevel,
    });

    if (error) throw error;
  }
}
