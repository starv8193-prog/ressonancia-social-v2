import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { UserProfile, UserSettings, GalleryItem, Dynasty, Group, HistoryItem, EchoProfile, DynastyMessage } from '../types';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey);

// Tipos para o banco Supabase
interface DatabaseUser {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  bio?: string;
  is_premium: boolean;
  avatar_color: string;
  profile_color: string;
  app_color: string;
  name_color: string;
  border_type: 'solid' | 'gradient';
  profile_type: 'solid' | 'gradient';
  name_type: 'solid' | 'gradient';
  border_color: string;
  banner_url?: string;
  is_public: boolean;
  allow_messages: boolean;
  allow_groups: boolean;
  allow_dynasty_invites: boolean;
  resonance_count: number;
  created_at: string;
  updated_at: string;
}

interface DatabaseGallery {
  id: string;
  user_id: string;
  caption: string;
  media_urls: string[];
  timestamp: number;
  author_name: string;
  created_at: string;
}

interface DatabaseResonanceHistory {
  id: string;
  user_id: string;
  original: string;
  response: any;
  timestamp: number;
  related_echoes: string[];
  created_at: string;
}

// Converter tipos do banco para tipos da aplicação
function convertDatabaseUserToProfile(user: DatabaseUser): UserProfile {
  return {
    name: user.name,
    bio: user.bio || 'Explorador do núcleo social.',
    avatarUrl: user.avatar_url || 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?w=200&h=200&fit=crop',
    bannerUrl: user.banner_url || 'https://images.unsplash.com/photo-1464802686167-b939a6910659?w=1200&h=400&fit=crop',
    isPremium: user.is_premium,
    premiumSettings: {
      borderColor: user.border_color,
      profileColor: user.profile_color,
      appColor: user.app_color,
      nameColor: user.name_color,
      borderType: user.border_type,
      profileType: user.profile_type,
      nameType: user.name_type
    },
    followers: [],
    following: [],
    gallery: [],
    groups: []
  };
}

function convertDatabaseGalleryToGalleryItem(item: DatabaseGallery): GalleryItem {
  return {
    id: item.id,
    media: item.media_urls.map((url, index) => ({
      url: url,
      type: 'image' as const,
      id: `${item.id}_${index}`
    })),
    caption: item.caption,
    comments: [],
    timestamp: item.timestamp,
    authorName: item.author_name
  };
}

function convertDatabaseHistoryToHistoryItem(item: DatabaseResonanceHistory): HistoryItem {
  return {
    id: item.id,
    original: item.original,
    response: item.response,
    timestamp: item.timestamp,
    relatedEchoes: []
  };
}

// Serviços de usuários
export async function getUserProfile(userId: string): Promise<EchoProfile | null> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, bio, avatar_url, is_public, avatar_color')
      .eq('id', userId)
      .single();

    if (error || !data) {
      console.error('Error getting user profile:', error);
      return null;
    }

    return {
      id: data.id,
      name: data.name,
      bio: data.bio || '',
      isPublic: data.is_public,
      avatarColor: data.avatar_color,
      avatarUrl: data.avatar_url
    };
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
}

export async function updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('users')
      .update({
        name: updates.name,
        bio: updates.bio,
        avatar_url: updates.avatarUrl,
        avatar_color: updates.premiumSettings?.profileColor,
        profile_color: updates.premiumSettings?.profileColor,
        app_color: updates.premiumSettings?.appColor,
        name_color: updates.premiumSettings?.nameColor,
        border_color: updates.premiumSettings?.borderColor,
        border_type: updates.premiumSettings?.borderType,
        profile_type: updates.premiumSettings?.profileType,
        name_type: updates.premiumSettings?.nameType,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (error) {
      console.error('Error updating user profile:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error updating user profile:', error);
    return false;
  }
}

export async function searchUsers(query: string): Promise<EchoProfile[]> {
  try {
    if (!query.trim()) {
      return [];
    }

    const { data, error } = await supabase
      .from('users')
      .select('id, name, bio, avatar_url, is_public, avatar_color')
      .or(`name.ilike.%${query}%,bio.ilike.%${query}%`)
      .limit(20);

    if (error) {
      console.error('Error searching users:', error);
      return [];
    }

    return data.map(user => ({
      id: user.id,
      name: user.name,
      bio: user.bio || '',
      isPublic: user.is_public,
      avatarColor: user.avatar_color,
      avatarUrl: user.avatar_url
    }));
  } catch (error) {
    console.error('Error searching users:', error);
    return [];
  }
}

export async function getUserGallery(userId: string): Promise<GalleryItem[]> {
  try {
    const { data, error } = await supabase
      .from('gallery')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false });

    if (error) {
      console.error('Error getting user gallery:', error);
      return [];
    }

    return data.map(convertDatabaseGalleryToGalleryItem);
  } catch (error) {
    console.error('Error getting user gallery:', error);
    return [];
  }
}

export async function addGalleryItem(userId: string, item: Omit<GalleryItem, 'id'>): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('gallery')
      .insert({
        user_id: userId,
        caption: item.caption,
        media_urls: item.media.map(m => m.url),
        timestamp: Date.now(),
        author_name: item.authorName
      });

    if (error) {
      console.error('Error adding gallery item:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error adding gallery item:', error);
    return false;
  }
}

export async function getResonanceHistory(userId: string): Promise<HistoryItem[]> {
  try {
    const { data, error } = await supabase
      .from('resonance_history')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false })
      .limit(100);

    if (error) {
      console.error('Error getting resonance history:', error);
      return [];
    }

    return data.map(convertDatabaseHistoryToHistoryItem);
  } catch (error) {
    console.error('Error getting resonance history:', error);
    return [];
  }
}

export async function addResonanceHistory(userId: string, item: Omit<HistoryItem, 'id'>): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('resonance_history')
      .insert({
        user_id: userId,
        original: item.original,
        response: item.response,
        timestamp: Date.now(),
        related_echoes: item.relatedEchoes
      });

    if (error) {
      console.error('Error adding resonance history:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error adding resonance history:', error);
    return false;
  }
}

export async function incrementResonanceCount(userId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('users')
      .update({ resonance_count: supabase.rpc('increment') })
      .eq('id', userId);

    if (error) {
      console.error('Error incrementing resonance count:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error incrementing resonance count:', error);
    return false;
  }
}
