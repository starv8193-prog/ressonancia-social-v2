import { UserProfile, UserSettings, GalleryItem, Dynasty, Group, HistoryItem, EchoProfile } from '../types';

export interface UserData {
  profile: UserProfile;
  settings: UserSettings;
  gallery: GalleryItem[];
  dynasty?: Dynasty;
  groups: Group[];
  history: HistoryItem[];
  followers: EchoProfile[];
  following: EchoProfile[];
  resonanceCount: number;
  lastActive: number;
}

export interface UserDataResponse {
  success: boolean;
  data?: UserData;
  error?: string;
}

// Mock database para simular persistência
const mockDatabase: Record<string, UserData> = {};

// Mock database global de perfis para busca
const globalProfiles: Record<string, EchoProfile> = {
  'user1': {
    id: 'user1',
    name: 'Consciência_Alfa',
    bio: 'Explorador das frequências primárias.',
    isPublic: true,
    avatarColor: '#3b82f6',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop'
  },
  'user2': {
    id: 'user2',
    name: 'Consciência_Beta',
    bio: 'Sintetizador de padrões emergentes.',
    isPublic: true,
    avatarColor: '#10b981',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108755-2616b332c1ca?w=200&h=200&fit=crop'
  },
  'user3': {
    id: 'user3',
    name: 'Consciência_Gama',
    bio: 'Observador de ressonâncias coletivas.',
    isPublic: true,
    avatarColor: '#f59e0b',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop'
  }
};

export async function saveUserData(userId: string, userData: Partial<UserData>): Promise<UserDataResponse> {
  try {
    // Simulação de salvamento no servidor
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const existingData = mockDatabase[userId] || {
      profile: {
        name: 'Consciência_Original',
        bio: 'Explorador do núcleo social.',
        avatarUrl: 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?w=200&h=200&fit=crop',
        bannerUrl: 'https://images.unsplash.com/photo-1464802686167-b939a6910659?w=1200&h=400&fit=crop',
        isPremium: false,
        premiumSettings: {
          borderColor: '#ffffff',
          profileColor: '#050505',
          appColor: '#ffffff',
          nameColor: '#ffffff',
          borderType: 'solid',
          profileType: 'solid',
          nameType: 'solid'
        },
        followers: [],
        following: [],
        gallery: [],
        groups: []
      },
      settings: {
        isPublic: true,
        allowMessages: true,
        allowGroups: true,
        allowDynastyInvites: true
      },
      gallery: [],
      groups: [],
      history: [],
      followers: [],
      following: [],
      resonanceCount: 0,
      lastActive: Date.now()
    };

    // Mescla dados existentes com novos dados
    const updatedData: UserData = {
      ...existingData,
      ...userData,
      lastActive: Date.now()
    };

    mockDatabase[userId] = updatedData;

    return {
      success: true,
      data: updatedData
    };
  } catch (error) {
    console.error('Error saving user data:', error);
    return {
      success: false,
      error: 'Erro ao salvar dados do usuário'
    };
  }
}

export async function loadUserData(userId: string): Promise<UserDataResponse> {
  try {
    // Simulação de carregamento do servidor
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const userData = mockDatabase[userId];
    
    if (!userData) {
      // Retorna dados padrão para novos usuários
      const defaultData: UserData = {
        profile: {
          name: 'Consciência_Original',
          bio: 'Explorador do núcleo social.',
          avatarUrl: 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?w=200&h=200&fit=crop',
          bannerUrl: 'https://images.unsplash.com/photo-1464802686167-b939a6910659?w=1200&h=400&fit=crop',
          isPremium: false,
          premiumSettings: {
            borderColor: '#ffffff',
            profileColor: '#050505',
            appColor: '#ffffff',
            nameColor: '#ffffff',
            borderType: 'solid',
            profileType: 'solid',
            nameType: 'solid'
          },
          followers: [],
          following: [],
          gallery: [],
          groups: []
        },
        settings: {
          isPublic: true,
          allowMessages: true,
          allowGroups: true,
          allowDynastyInvites: true
        },
        gallery: [],
        groups: [],
        history: [],
        followers: [],
        following: [],
        resonanceCount: 0,
        lastActive: Date.now()
      };

      mockDatabase[userId] = defaultData;
      
      return {
        success: true,
        data: defaultData
      };
    }

    return {
      success: true,
      data: userData
    };
  } catch (error) {
    console.error('Error loading user data:', error);
    return {
      success: false,
      error: 'Erro ao carregar dados do usuário'
    };
  }
}

export async function updateProfile(userId: string, profileUpdates: Partial<UserProfile>): Promise<UserDataResponse> {
  const currentData = await loadUserData(userId);
  if (!currentData.success || !currentData.data) {
    return currentData;
  }

  const updatedProfile = { ...currentData.data.profile, ...profileUpdates };
  return saveUserData(userId, { profile: updatedProfile });
}

export async function updateSettings(userId: string, settingsUpdates: Partial<UserSettings>): Promise<UserDataResponse> {
  const currentData = await loadUserData(userId);
  if (!currentData.success || !currentData.data) {
    return currentData;
  }

  const updatedSettings = { ...currentData.data.settings, ...settingsUpdates };
  return saveUserData(userId, { settings: updatedSettings });
}

export async function addToGallery(userId: string, item: GalleryItem): Promise<UserDataResponse> {
  const currentData = await loadUserData(userId);
  if (!currentData.success || !currentData.data) {
    return currentData;
  }

  const updatedGallery = [...currentData.data.gallery, item];
  return saveUserData(userId, { gallery: updatedGallery });
}

export async function addToHistory(userId: string, item: HistoryItem): Promise<UserDataResponse> {
  const currentData = await loadUserData(userId);
  if (!currentData.success || !currentData.data) {
    return currentData;
  }

  const updatedHistory = [item, ...currentData.data.history].slice(0, 100); // Limita a 100 itens
  return saveUserData(userId, { history: updatedHistory });
}

export async function incrementResonanceCount(userId: string): Promise<UserDataResponse> {
  const currentData = await loadUserData(userId);
  if (!currentData.success || !currentData.data) {
    return currentData;
  }

  return saveUserData(userId, { 
    resonanceCount: currentData.data.resonanceCount + 1 
  });
}

export async function deleteUserData(userId: string): Promise<UserDataResponse> {
  try {
    // Simulação de exclusão de dados
    await new Promise(resolve => setTimeout(resolve, 500));
    
    delete mockDatabase[userId];
    
    return {
      success: true
    };
  } catch (error) {
    console.error('Error deleting user data:', error);
    return {
      success: false,
      error: 'Erro ao excluir dados do usuário'
    };
  }
}

export async function searchUsers(query: string): Promise<EchoProfile[]> {
  try {
    // Simulação de busca de usuários
    await new Promise(resolve => setTimeout(resolve, 300));
    
    if (!query.trim()) {
      return Object.values(globalProfiles);
    }
    
    const lowerQuery = query.toLowerCase();
    return Object.values(globalProfiles).filter(user => 
      user.name.toLowerCase().includes(lowerQuery) ||
      user.bio.toLowerCase().includes(lowerQuery)
    );
  } catch (error) {
    console.error('Error searching users:', error);
    return [];
  }
}

export async function getUserProfile(userId: string): Promise<EchoProfile | null> {
  try {
    // Buscar no banco global primeiro
    if (globalProfiles[userId]) {
      return globalProfiles[userId];
    }
    
    // Se não encontrar, buscar nos dados salvos
    const userData = mockDatabase[userId];
    if (userData?.profile) {
      return {
        id: userId,
        name: userData.profile.name,
        bio: userData.profile.bio,
        isPublic: userData.settings.isPublic,
        avatarColor: userData.profile.premiumSettings?.profileColor || '#ffffff',
        avatarUrl: userData.profile.avatarUrl,
        gallery: userData.profile.gallery
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
}

// Adicionar perfil atual ao banco global quando usuário faz login
export async function registerUserProfile(userId: string, profile: EchoProfile): Promise<void> {
  try {
    await new Promise(resolve => setTimeout(resolve, 200));
    globalProfiles[userId] = profile;
  } catch (error) {
    console.error('Error registering user profile:', error);
  }
}
