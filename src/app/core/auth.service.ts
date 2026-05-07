import { Injectable } from '@angular/core';
import { supabase } from './supabase.client';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  async signUp(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      return { data, error };
    }

    if (!data.user) {
      return {
        data,
        error: {
          message: 'Registrazione non completata.',
        },
      };
    }

    const { error: profileError } = await supabase.from('profiles').insert({
      id: data.user.id,
      email,
      role: 'user',
      credits: 500,
      team_id: null,
    });

    if (profileError) {
      return { data, error: profileError };
    }

    return { data, error: null };
  }

  async signIn(email: string, password: string) {
    return supabase.auth.signInWithPassword({
      email,
      password,
    });
  }

  async signOut() {
    return supabase.auth.signOut();
  }

  async getUser() {
    const { data, error } = await supabase.auth.getUser();

    if (error) {
      return null;
    }

    return data.user;
  }

  async getProfile() {
    const user = await this.getUser();

    if (!user) {
      return null;
    }

    const { data, error } = await supabase
      .from('profiles')
      .select(
        `
        id,
        email,
        role,
        credits,
        team_id,
        teams (
          id,
          name,
          logo_url
        )
      `,
      )
      .eq('id', user.id)
      .single();

    if (error) {
      return null;
    }

    return data;
  }

  async getSession() {
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      return null;
    }

    return data.session;
  }

  async isSuperAdmin(): Promise<boolean> {
    const profile = await this.getProfile();

    return profile?.role === 'superadmin';
  }
}
