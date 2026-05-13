import { Injectable } from '@angular/core';
import { supabase } from '../core/supabase.client';

type MatchResult = 'win' | 'draw' | 'loss';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private readonly stadiumLevels = [
    { level: 1, homeBonus: { win: 2, draw: 1, loss: 0 } },
    { level: 2, homeBonus: { win: 3, draw: 1, loss: 0 } },
    { level: 3, homeBonus: { win: 3, draw: 2, loss: 1 } },
    { level: 4, homeBonus: { win: 4, draw: 3, loss: 1 } },
    { level: 5, homeBonus: { win: 5, draw: 3, loss: 2 } },
    { level: 6, homeBonus: { win: 6, draw: 4, loss: 2 } },
  ];

  async checkSuperadmin(): Promise<boolean> {
    const { data: userData } = await supabase.auth.getUser();

    if (!userData.user) return false;

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

  async deleteTeam(teamId: string | number): Promise<void> {
    const { error } = await supabase.from('teams').delete().eq('id', teamId);
    if (error) throw error;
  }

  async assignTeam(
    userId: string,
    oldTeamId: string | number | null,
    newTeamId: string | number,
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

  async removeTeamFromUser(
    userId: string,
    oldTeamId: string | number,
  ): Promise<void> {
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

  async getCalendarSeasons(): Promise<any[]> {
    const { data, error } = await supabase
      .from('calendar_seasons')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async createCalendarSeason(name: string): Promise<void> {
    const { error } = await supabase.from('calendar_seasons').insert({
      name,
      is_active: false,
      last_processed_round: 0,
    });

    if (error) throw error;
  }

  async setActiveCalendarSeason(seasonId: string): Promise<void> {
    const { error: resetError } = await supabase
      .from('calendar_seasons')
      .update({ is_active: false })
      .neq('id', seasonId);

    if (resetError) throw resetError;

    const { error } = await supabase
      .from('calendar_seasons')
      .update({
        is_active: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', seasonId);

    if (error) throw error;
  }

  async getActiveCalendarSeason(): Promise<any | null> {
    const { data, error } = await supabase
      .from('calendar_seasons')
      .select('*')
      .eq('is_active', true)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async getCalendarMatches(
    seasonId: string,
    roundNumber: number,
  ): Promise<any[]> {
    const { data, error } = await supabase
      .from('matches')
      .select('*')
      .eq('season_id', seasonId)
      .eq('round_number', roundNumber);

    if (error) throw error;
    return data || [];
  }

  private getCreditsByStadiumLevel(level: number, result: MatchResult): number {
    const stadium = this.stadiumLevels.find(
      (s) => s.level === Number(level || 1),
    );

    if (!stadium) return 0;

    return stadium.homeBonus[result] ?? 0;
  }

  private getMatchResultForHomeTeam(
    homeGoals: number,
    awayGoals: number,
  ): MatchResult {
    if (homeGoals === awayGoals) return 'draw';
    return homeGoals > awayGoals ? 'win' : 'loss';
  }

  async calculateNextCalendarRound(): Promise<void> {
    const season = await this.getActiveCalendarSeason();

    if (!season) {
      throw new Error('Nessuna stagione calendario attiva.');
    }

    const nextRound = Number(season.last_processed_round || 0) + 1;
    const users = await this.getUsers();
    const matches = await this.getCalendarMatches(season.id, nextRound);

    if (!matches.length) {
      throw new Error(
        `Nessuna partita trovata per la giornata ${nextRound} della stagione ${season.name}.`,
      );
    }

    const { data: calculation, error: calculationError } = await supabase
      .from('calendar_calculations')
      .insert({
        season_id: season.id,
        round_number: nextRound,
        title: `Calcolo ${nextRound}ª giornata ${season.name}`,
      })
      .select()
      .single();

    if (calculationError) throw calculationError;

    const rows: any[] = [];

    for (const match of matches) {
      const homeUser = users.find(
        (user: any) => Number(user.team_id) === Number(match.home_team_id),
      );

      if (!homeUser) continue;

      const stadiumLevel = Number(homeUser.stadiumLevel || 1);
      const result = this.getMatchResultForHomeTeam(
        Number(match.home_goals || 0),
        Number(match.away_goals || 0),
      );

      const creditsAdded = this.getCreditsByStadiumLevel(stadiumLevel, result);

      rows.push({
        calculation_id: calculation.id,
        user_id: homeUser.id,
        team_id: homeUser.team_id,
        stadium_id: homeUser.stadium?.id || null,
        stadium_name: homeUser.stadiumName || 'Stadio Comunale',
        stadium_level: stadiumLevel,
        credits_added: creditsAdded,
      });
    }

    if (rows.length) {
      const { error: rowsError } = await supabase
        .from('calendar_calculation_rows')
        .insert(rows);

      if (rowsError) throw rowsError;

      for (const row of rows) {
        const user = users.find((u: any) => u.id === row.user_id);
        const currentCredits = Number(user?.credits || 0);

        await this.updateCredits(
          row.user_id,
          currentCredits + Number(row.credits_added || 0),
        );
      }
    }

    const { error: seasonError } = await supabase
      .from('calendar_seasons')
      .update({
        last_processed_round: nextRound,
        updated_at: new Date().toISOString(),
      })
      .eq('id', season.id);

    if (seasonError) throw seasonError;
  }

  async getCalendarCalculations(seasonId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('calendar_calculations')
      .select(
        `
        *,
        calendar_calculation_rows (*)
      `,
      )
      .eq('season_id', seasonId)
      .order('round_number', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async cancelCalendarCalculation(calculation: any): Promise<void> {
    if (calculation.is_cancelled) return;

    const rows = calculation.calendar_calculation_rows || [];

    for (const row of rows) {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('credits')
        .eq('id', row.user_id)
        .single();

      if (profileError) throw profileError;

      const newCredits =
        Number(profile?.credits || 0) - Number(row.credits_added || 0);

      await this.updateCredits(row.user_id, Math.max(0, newCredits));
    }

    const { error } = await supabase
      .from('calendar_calculations')
      .update({
        is_cancelled: true,
        cancelled_at: new Date().toISOString(),
      })
      .eq('id', calculation.id);

    if (error) throw error;
  }

  async resetCalendarSeason(seasonId: string): Promise<void> {
    const calculations = await this.getCalendarCalculations(seasonId);

    for (const calculation of calculations.filter(
      (c: any) => !c.is_cancelled,
    )) {
      await this.cancelCalendarCalculation(calculation);
    }

    const { error } = await supabase
      .from('calendar_seasons')
      .update({
        last_processed_round: 0,
        updated_at: new Date().toISOString(),
      })
      .eq('id', seasonId);

    if (error) throw error;
  }
}
