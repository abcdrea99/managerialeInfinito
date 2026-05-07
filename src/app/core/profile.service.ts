import { Injectable } from '@angular/core';
import { supabase } from './supabase.client';

export type UserProfile = {
  id: string;
  email: string;
  role: 'user' | 'superadmin';
  team_name: string | null;
  credits: number;
};

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  async getMyProfile(): Promise<UserProfile | null> {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return null;
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, role, team_name, credits')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error(error);
      return null;
    }

    return data as UserProfile;
  }
}
