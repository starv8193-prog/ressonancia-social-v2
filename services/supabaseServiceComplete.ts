import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { UserProfile, UserSettings, GalleryItem, Dynasty, Group, HistoryItem, EchoProfile, DynastyMessage } from '../types';

const supabase: SupabaseClient = createClient(
  process.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co',
  process.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'
);

// Serviços completos para Supabase
export const supabaseService = {
  // Perfil
  async getUserProfile(userId: string) {
    const { data } = await supabase
      .from('users')
      .select('id, name, bio, avatar_url, is_public, avatar_color')
      .eq('id', userId)
      .single();
    
    return data ? {
      id: data.id,
      name: data.name,
      bio: data.bio || '',
      isPublic: data.is_public,
      avatarColor: data.avatar_color,
      avatarUrl: data.avatar_url
    } : null;
  },

  async updateUserProfile(userId: string, updates: Partial<UserProfile>) {
    const { error } = await supabase
      .from('users')
      .update({
        name: updates.name,
        bio: updates.bio,
        avatar_url: updates.avatarUrl,
        avatar_color: updates.premiumSettings?.profileColor,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);
    
    return !error;
  },

  // Busca
  async searchUsers(query: string) {
    if (!query.trim()) return [];
    
    const isEmailSearch = query.includes('@');
    const searchQuery = isEmailSearch 
      ? `email.eq.${query}` 
      : `name.ilike.%${query}%,bio.ilike.%${query}%`;
    
    const { data } = await supabase
      .from('users')
      .select('id, name, bio, avatar_url, is_public, avatar_color')
      .or(searchQuery)
      .limit(20);
    
    return data.map(user => ({
      id: user.id,
      name: user.name,
      bio: user.bio || '',
      isPublic: user.is_public,
      avatarColor: user.avatar_color,
      avatarUrl: user.avatar_url
    }));
  },

  // Histórico
  async getResonanceHistory(userId: string) {
    const { data } = await supabase
      .from('resonance_history')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false })
      .limit(100);
    
    return data.map(item => ({
      id: item.id,
      original: item.original,
      response: item.response,
      timestamp: item.timestamp,
      relatedEchoes: item.related_echoes || []
    }));
  },

  async addResonanceHistory(userId: string, item: Omit<HistoryItem, 'id'>) {
    const { error } = await supabase
      .from('resonance_history')
      .insert({
        user_id: userId,
        original: item.original,
        response: item.response,
        timestamp: Date.now(),
        related_echoes: item.relatedEchoes
      });
    
    return !error;
  },

  async incrementResonanceCount(userId: string) {
    const { error } = await supabase.rpc('increment_resonance_count', {
      user_id: userId
    });
    
    return !error;
  },

  // Galería
  async getUserGallery(userId: string) {
    const { data } = await supabase
      .from('gallery')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false });
    
    return data.map(item => ({
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
    }));
  },

  async addGalleryItem(userId: string, item: Omit<GalleryItem, 'id'>) {
    const { error } = await supabase
      .from('gallery')
      .insert({
        user_id: userId,
        caption: item.caption,
        media_urls: item.media.map(m => m.url),
        timestamp: Date.now(),
        author_name: item.authorName
      });
    
    return !error;
  }
};

export default supabaseService;
