import React, { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { processResonance } from './services/geminiService';
import { validateToken, logout } from './services/authService';
import { loadUserData, saveUserData, updateProfile, updateSettings, addToHistory, incrementResonanceCount } from './services/userDataService';
import { HistoryItem, UserProfile, UserSettings, EchoProfile, GalleryItem, Comment, MediaFile, PremiumSettings, Dynasty, DynastyRole, DynastyMessage, Group, Participation, AuthUser, AuthState, UserData } from './types';
import ResonanceVisualizer from './components/ResonanceVisualizer';
import LoginForm from './components/LoginForm';

type TabType = 'Núcleo' | 'Feed' | 'Mensagens' | 'Participações' | 'Dinastia' | 'Perfil' | 'Configurações';
type DynastyTab = 'Geral' | 'Feed' | 'Chat' | 'Gerenciar';
type GroupViewTab = 'Chat' | 'Membros';

const SOLID_COLORS = [
  { name: 'Branco', value: '#ffffff' },
  { name: 'Cinza', value: '#a3a3a3' },
  { name: 'Azul', value: '#3b82f6' },
  { name: 'Verde', value: '#10b981' },
  { name: 'Vermelho', value: '#ef4444' },
  { name: 'Amarelo', value: '#f59e0b' },
  { name: 'Rosa', value: '#ec4899' },
  { name: 'Roxo', value: '#8b5cf6' },
  { name: 'Ciano', value: '#06b6d4' },
  { name: 'Preto Profundo', value: '#050505' }
];

const VerifiedBadge = ({ color }: { color?: string }) => (
  <svg className="w-4 h-4 inline-block ml-1 mb-1" style={{ color: color || '#60a5fa' }} fill="currentColor" viewBox="0 0 24 24">
    <path d="M23 12l-2.44-2.78.34-3.68-3.61-.82-1.89-3.18L12 3 8.6 1.54 6.71 4.72l-3.61.81.34 3.68L1 12l2.44 2.78-.34 3.69 3.61.82 1.89 3.18L12 21l3.4 1.46 1.89-3.18 3.61-.82-.34-3.68L23 12zm-13 5l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
  </svg>
);

const GearIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const App: React.FC = () => {
  const [authState, setAuthState] = useState<AuthState>(() => {
    const token = localStorage.getItem('authToken');
    const userStr = localStorage.getItem('user');
    
    if (token && userStr) {
      return {
        user: JSON.parse(userStr),
        isAuthenticated: true,
        isLoading: false
      };
    }
    
    return {
      user: null,
      isAuthenticated: false,
      isLoading: false
    };
  });

  const [userData, setUserData] = useState<UserData | null>(null);
  const [isDataLoading, setIsDataLoading] = useState(false);

  // Carregar dados do usuário quando autenticado
  useEffect(() => {
    const loadUserDataOnLogin = async () => {
      if (authState.isAuthenticated && authState.user) {
        setIsDataLoading(true);
        try {
          const response = await loadUserData(authState.user.id);
          if (response.success && response.data) {
            setUserData(response.data);
          }
        } catch (error) {
          console.error('Error loading user data:', error);
        } finally {
          setIsDataLoading(false);
        }
      }
    };

    loadUserDataOnLogin();
  }, [authState.isAuthenticated, authState.user?.id]);

  const [activeTab, setActiveTab] = useState<TabType>('Núcleo');
  const [dynastyTab, setDynastyTab] = useState<DynastyTab>('Geral');
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Set<string>>(new Set());
  const [userSearch, setUserSearch] = useState('');
  
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const dynastyPhotoRef = useRef<HTMLInputElement>(null);
  const dynastyBannerRef = useRef<HTMLInputElement>(null);
  const groupPhotoInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<UserProfile>(() => {
    if (userData) {
      return userData.profile;
    }
    
    const saved = localStorage.getItem('resonance_profile');
    return saved ? JSON.parse(saved) : {
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
    };
  });

  const [userSettings, setUserSettings] = useState<UserSettings>(() => {
    return userData?.settings || {
      isPublic: true,
      allowMessages: true,
      allowGroups: true,
      allowDynastyInvites: true
    };
  });

  // Atualizar dados do usuário quando mudar
  useEffect(() => {
    if (userData && authState.user) {
      setProfile(userData.profile);
      setSettings(userData.settings);
      setHistory(userData.history);
    }
  }, [userData]);

  useEffect(() => {
    localStorage.setItem('resonance_profile', JSON.stringify(profile));
  }, [profile]);

  const handleLoginSuccess = async (userData: AuthUser) => {
    setAuthState({
      user: userData,
      isAuthenticated: true,
      isLoading: false
    });

    // Carregar dados do usuário após login
    try {
      const response = await loadUserData(userData.id);
      if (response.success && response.data) {
        setUserData(response.data);
      }
    } catch (error) {
      console.error('Error loading user data on login:', error);
    }
  };

  const handleLogout = async () => {
    if (authState.user?.token) {
      await logout(authState.user.token);
    }
    
    // Salvar dados atuais antes de fazer logout
    if (authState.user && userData) {
      await saveUserData(authState.user.id, userData);
    }
    
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false
    });
    
    setUserData(null);
    setHistory([]);
  };

  useEffect(() => {
    const validateAuth = async () => {
      if (authState.user?.token) {
        const isValid = await validateToken(authState.user.token);
        if (!isValid) {
          handleLogout();
        }
      }
    };

    validateAuth();
  }, [authState.user?.token]);

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [tempProfile, setTempProfile] = useState({ name: profile.name, bio: profile.bio });

  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const [groupViewTab, setGroupViewTab] = useState<GroupViewTab>('Chat');
  const [isCreatingDynasty, setIsCreatingDynasty] = useState(false);
  const [newDynasty, setNewDynasty] = useState<Partial<Dynasty>>({
    name: '',
    purpose: '',
    isPublic: true,
    photoUrl: '',
    bannerUrl: ''
  });

  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupPhoto, setNewGroupPhoto] = useState<string | null>(null);
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set());

  const [participations, setParticipations] = useState<Participation[]>(() => {
    const saved = localStorage.getItem('resonance_participations');
    return saved ? JSON.parse(saved) : [
      { id: '1', topic: 'Arquitetura do Silêncio', description: 'Explorações sobre o vazio e a ausência de som.', activeCount: 0, messages: [] },
      { id: '2', topic: 'Fluxo Onírico', description: 'Compartilhamento de visões durante o sono profundo.', activeCount: 0, messages: [] },
      { id: '3', topic: 'Ecos Urbanos', description: 'A melancolia escondida no concreto das cidades.', activeCount: 0, messages: [] },
      { id: '4', topic: 'Paradoxos Digitais', description: 'Conexões que isolam e isolamentos que conectam.', activeCount: 0, messages: [] },
    ];
  });

  useEffect(() => {
    localStorage.setItem('resonance_participations', JSON.stringify(participations));
  }, [participations]);

  const activeParticipationId = useMemo(() => {
    return (new URLSearchParams(window.location.search)).get('p_id');
  }, []);

  const setActiveParticipationId = (id: string | null) => {
    const url = new URL(window.location.href);
    if (id) url.searchParams.set('p_id', id);
    else url.searchParams.delete('p_id');
    window.history.pushState({}, '', url);
    setActiveTab('Participações');
  };

  const activeParticipation = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('p_id');
    return participations.find(p => p.id === id);
  }, [participations]);

  const [participationSearch, setParticipationSearch] = useState('');

  const filteredParticipations = useMemo(() => {
    return participations.filter(p => 
      p.topic.toLowerCase().includes(participationSearch.toLowerCase()) ||
      p.description.toLowerCase().includes(participationSearch.toLowerCase())
    );
  }, [participations, participationSearch]);

  const searchResults = useMemo(() => {
    return []; 
  }, [userSearch]);

  const [settings, setSettings] = useState<UserSettings>(() => {
    const saved = localStorage.getItem('resonance_settings');
    return saved ? JSON.parse(saved) : userSettings || {
      isPublic: true,
      allowMessages: true,
      allowGroups: true,
      allowDynastyInvites: true
    };
  });

  useEffect(() => {
    localStorage.setItem('resonance_settings', JSON.stringify(settings));
  }, [settings]);

  const [viewingProfile, setViewingProfile] = useState<EchoProfile | null>(null);
  const [showList, setShowList] = useState<'followers' | 'following' | null>(null);
  const [isPosting, setIsPosting] = useState(false);
  const [pendingMedia, setPendingMedia] = useState<MediaFile[]>([]);
  const [newPostCaption, setNewPostCaption] = useState('');
  const [activeGalleryItem, setActiveGalleryItem] = useState<GalleryItem | null>(null);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [chatMessage, setChatMessage] = useState('');
  const [newRole, setNewRole] = useState({ name: '', color: '#ffffff' });

  const activeGroup = useMemo(() => profile.groups.find(g => g.id === activeGroupId), [profile.groups, activeGroupId]);

  const buyPremium = () => {
    setProfile(prev => ({
      ...prev,
      isPremium: true,
      premiumSettings: {
        borderColor: '#ffffff',
        profileColor: '#050505',
        appColor: '#ffffff',
        nameColor: '#ffffff',
        borderType: 'solid',
        profileType: 'solid',
        nameType: 'solid'
      }
    }));
    alert("Ciclo Premium Ativado.");
  };

  const updatePremiumColor = (key: 'borderColor' | 'profileColor' | 'nameColor', value: string) => {
    setProfile(prev => ({
      ...prev,
      premiumSettings: prev.premiumSettings ? { ...prev.premiumSettings, [key]: value } : undefined
    }));
  };

  const updatePremiumType = (key: 'borderType' | 'profileType' | 'nameType', value: 'solid' | 'gradient') => {
    setProfile(prev => ({
      ...prev,
      premiumSettings: prev.premiumSettings ? { ...prev.premiumSettings, [key]: value } : undefined
    }));
  };

  const toggleFollow = (echo: EchoProfile) => {
    const isFollowing = profile.following.some(f => f.id === echo.id);
    if (isFollowing) {
      setProfile(prev => ({
        ...prev,
        following: prev.following.filter(f => f.id !== echo.id)
      }));
    } else {
      if (echo.isPrivate) {
        setPendingRequests(prev => {
          const next = new Set(prev);
          if (next.has(echo.id)) next.delete(echo.id);
          else next.add(echo.id);
          return next;
        });
      } else {
        setProfile(prev => ({
          ...prev,
          following: [...prev.following, echo]
        }));
      }
    }
  };

  const handleDynastyCreation = () => {
    if (!newDynasty.name || !newDynasty.purpose) {
      alert("Defina o nome e o propósito.");
      return;
    }
    const dynasty: Dynasty = {
      id: crypto.randomUUID(),
      name: newDynasty.name!,
      purpose: newDynasty.purpose!,
      isPublic: newDynasty.isPublic!,
      photoUrl: newDynasty.photoUrl || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=300&h=300&fit=crop',
      bannerUrl: newDynasty.bannerUrl || 'https://images.unsplash.com/photo-1464802686167-b939a6910659?w=1200&h=400&fit=crop',
      roles: [{ id: 'owner', name: 'Líder', color: '#ffcc00' }],
      members: [],
      feed: [],
      chat: [{ id: '1', userName: 'Núcleo', text: 'A Dinastia foi estabelecida.', timestamp: Date.now() }]
    };
    setProfile(prev => ({ ...prev, createdDynasty: dynasty }));
    setIsCreatingDynasty(false);
    setNewDynasty({ name: '', purpose: '', isPublic: true, photoUrl: '', bannerUrl: '' });
  };

  const handleGroupPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setNewGroupPhoto(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleCreateGroup = () => {
    if (!newGroupName.trim()) {
      alert("Escolha um nome.");
      return;
    }
    const members = profile.followers.filter(f => selectedMembers.has(f.id));
    const group: Group = {
      id: crypto.randomUUID(),
      name: newGroupName,
      photoUrl: newGroupPhoto || undefined,
      members: members,
      messages: [{ id: '1', userName: 'Núcleo', text: `Núcleo "${newGroupName}" estabelecido.`, timestamp: Date.now() }],
      lastMessage: 'Núcleo estabelecido.'
    };
    setProfile(prev => ({
      ...prev,
      groups: [group, ...prev.groups]
    }));
    setIsCreatingGroup(false);
    setNewGroupName('');
    setNewGroupPhoto(null);
    setSelectedMembers(new Set());
  };

  const handleSendGroupMessage = () => {
    if (!chatMessage.trim() || !activeGroupId) return;
    const newMessage: DynastyMessage = {
      id: crypto.randomUUID(),
      userName: profile.name,
      text: chatMessage,
      timestamp: Date.now()
    };
    setProfile(prev => ({
      ...prev,
      groups: prev.groups.map(g => g.id === activeGroupId ? {
        ...g,
        messages: [...g.messages, newMessage],
        lastMessage: chatMessage
      } : g)
    }));
    setChatMessage('');
  };

  const handleSendParticipationMessage = () => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('p_id');
    if (!chatMessage.trim() || !id) return;
    const newMessage: DynastyMessage = {
      id: crypto.randomUUID(),
      userName: profile.name,
      text: chatMessage,
      timestamp: Date.now()
    };
    setParticipations(prev => prev.map(p => p.id === id ? {
      ...p,
      messages: [...p.messages, newMessage]
    } : p));
    setChatMessage('');
  };

  const handleRemoveMember = (groupId: string, memberId: string) => {
    setProfile(prev => ({
      ...prev,
      groups: prev.groups.map(g => g.id === groupId ? {
        ...g,
        members: g.members.filter(m => m.id !== memberId)
      } : g)
    }));
  };

  const handleChangeGroupPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && activeGroupId) {
      const reader = new FileReader();
      reader.onload = () => {
        setProfile(prev => ({
          ...prev,
          groups: prev.groups.map(g => g.id === activeGroupId ? { ...g, photoUrl: reader.result as string } : g)
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleMemberSelection = (id: string) => {
    const newSelection = new Set(selectedMembers);
    if (newSelection.has(id)) newSelection.delete(id);
    else newSelection.add(id);
    setSelectedMembers(newSelection);
  };

  const handleSendMessage = () => {
    if (!chatMessage.trim() || !profile.createdDynasty) return;
    const newMessage: DynastyMessage = {
      id: crypto.randomUUID(),
      userName: profile.name,
      userRole: profile.createdDynasty.roles[0],
      text: chatMessage,
      timestamp: Date.now()
    };
    setProfile(prev => ({
      ...prev,
      createdDynasty: prev.createdDynasty ? {
        ...prev.createdDynasty,
        chat: [...prev.createdDynasty.chat, newMessage]
      } : undefined
    }));
    setChatMessage('');
  };

  const handleAddRole = () => {
    if (!newRole.name || !profile.createdDynasty) return;
    const role: DynastyRole = { id: crypto.randomUUID(), ...newRole };
    setProfile(prev => ({
      ...prev,
      createdDynasty: prev.createdDynasty ? {
        ...prev.createdDynasty,
        roles: [...prev.createdDynasty.roles, role]
      } : undefined
    }));
    setNewRole({ name: '', color: '#ffffff' });
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (files && files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = () => setProfile(prev => ({ ...prev, avatarUrl: reader.result as string }));
      reader.readAsDataURL(file);
    }
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (files && files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = () => setProfile(prev => ({ ...prev, bannerUrl: reader.result as string }));
      reader.readAsDataURL(file);
    }
  };

  const saveProfileEdits = async () => {
    const updatedProfile = { ...profile, name: tempProfile.name, bio: tempProfile.bio };
    setProfile(updatedProfile);
    
    // Salvar no servidor se autenticado
    if (authState.user) {
      await updateProfile(authState.user.id, { name: tempProfile.name, bio: tempProfile.bio });
    }
    
    setIsEditingProfile(false);
  };

  const handleGalleryFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.currentTarget.files;
    if (!fileList || fileList.length === 0) return;
    
    const remainingSlots = 7 - pendingMedia.length;
    if (remainingSlots <= 0) {
      alert("Limite de 7 mídias atingido.");
      return;
    }

    const files = Array.from(fileList).slice(0, remainingSlots);
    const loadedMedia: MediaFile[] = [];
    let processedCount = 0;
    files.forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = () => {
        loadedMedia.push({ url: reader.result as string, type: 'image' });
        processedCount++;
        if (processedCount === files.length) {
          setPendingMedia(prev => [...prev, ...loadedMedia]);
        }
      };
      reader.readAsDataURL(file);
    });

    e.target.value = '';
  };

  const handleAddPost = () => {
    if (pendingMedia.length === 0) {
      alert("Adicione uma imagem.");
      return;
    }
    const newPost: GalleryItem = {
      id: crypto.randomUUID(),
      media: pendingMedia,
      caption: newPostCaption || "Fluxo de consciência.",
      comments: [],
      timestamp: Date.now(),
      authorName: profile.name
    };

    if (activeTab === 'Dinastia' && profile.createdDynasty && dynastyTab === 'Feed') {
      setProfile(p => ({ ...p, createdDynasty: p.createdDynasty ? { ...p.createdDynasty, feed: [newPost, ...p.createdDynasty.feed] } : undefined }));
    } else {
      setProfile(p => ({ ...p, gallery: [newPost, ...p.gallery] }));
    }

    setIsPosting(false);
    setPendingMedia([]);
    setNewPostCaption('');
  };

  const handleProcess = useCallback(async () => {
    if (!input.trim() || isProcessing) return;
    setIsProcessing(true);
    try {
      const result = await processResonance(input);
      const newItem: HistoryItem = {
        id: crypto.randomUUID(),
        original: input,
        response: result,
        timestamp: Date.now(),
        relatedEchoes: [],
      };
      
      // Salvar no histórico do usuário
      if (authState.user) {
        await addToHistory(authState.user.id, newItem);
        await incrementResonanceCount(authState.user.id);
      }
      
      setHistory(prev => [newItem, ...prev]);
      setInput('');
    } catch (error) {
      console.error(error);
      alert('Erro na sintonização.');
    } finally {
      setIsProcessing(false);
    }
  }, [input, isProcessing, authState.user?.id]);

  const feedItems = useMemo(() => {
    const items: GalleryItem[] = [];
    profile.following.forEach(user => { if (user.gallery) items.push(...user.gallery); });
    return items.sort((a, b) => b.timestamp - a.timestamp);
  }, [profile.following]);

  const openGalleryItem = (item: GalleryItem) => {
    setActiveGalleryItem(item);
    setActiveMediaIndex(0);
  };

  const getPremiumStyle = (type: 'solid' | 'gradient', color: string) => {
    if (type === 'solid') return color;
    return color.includes('gradient') ? color : `linear-gradient(45deg, ${color}, #000000)`;
  };

  const renderDynastyDashboard = (dynasty: Dynasty) => {
    return (
      <div className="fade-in w-full max-w-5xl mx-auto flex flex-col md:flex-row gap-6 md:gap-10 px-4 md:px-0">
        <aside className="w-full md:w-64 flex flex-col gap-2 p-4 bg-neutral-950/80 backdrop-blur-3xl border border-white/5 rounded-[2rem] h-fit md:sticky top-28">
          {(['Geral', 'Feed', 'Chat', 'Gerenciar'] as DynastyTab[]).map(tab => (
            <button
              key={tab}
              onClick={() => setDynastyTab(tab)}
              className={`text-[10px] md:text-[11px] uppercase tracking-[0.2em] p-4 rounded-2xl text-left transition-all font-bold ${dynastyTab === tab ? 'bg-white text-black shadow-xl' : 'text-neutral-500 hover:bg-white/5 hover:text-white'}`}
            >
              {tab}
            </button>
          ))}
        </aside>

        <div className="flex-grow space-y-6">
          {dynastyTab === 'Geral' && (
            <div className="space-y-6">
              <div className="relative h-60 md:h-80 rounded-[3rem] overflow-hidden border border-white/5 shadow-2xl">
                <img src={dynasty.bannerUrl} className="w-full h-full object-cover" alt="Banner" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                <div className="absolute bottom-6 left-6 flex flex-col md:flex-row items-start md:items-end gap-4 md:gap-8">
                  <img src={dynasty.photoUrl} className="w-20 h-20 md:w-32 md:h-32 rounded-[1.5rem] border-2 border-black shadow-2xl" alt="Dynasty" />
                  <div className="mb-2">
                    <h2 className="text-2xl md:text-4xl font-thin tracking-[0.3em] uppercase">{dynasty.name}</h2>
                    <p className="text-[8px] md:text-[10px] uppercase tracking-widest text-neutral-400 font-bold mt-1">Legado</p>
                  </div>
                </div>
              </div>
              <div className="p-8 bg-neutral-900/30 backdrop-blur-md border border-white/5 rounded-[3rem]">
                <p className="text-xl md:text-2xl font-light italic leading-relaxed text-neutral-100">"{dynasty.purpose}"</p>
              </div>
            </div>
          )}

          {dynastyTab === 'Feed' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-white/5 pb-6">
                <h3 className="text-xs md:text-sm uppercase tracking-[0.4em] font-bold">Mural</h3>
                <button onClick={() => setIsPosting(true)} className="bg-white text-black text-[9px] md:text-[10px] font-bold uppercase tracking-widest px-6 py-2 rounded-full hover:scale-105 transition-all">Novo Registro</button>
              </div>
              {dynasty.feed.length === 0 ? (
                <div className="py-20 text-center text-neutral-700 italic border border-dashed border-white/5 rounded-[3rem]">O mural está em silêncio.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {dynasty.feed.map(post => (
                    <div key={post.id} onClick={() => openGalleryItem(post)} className="bg-neutral-900/20 border border-white/5 rounded-[2.5rem] overflow-hidden cursor-pointer hover:border-white/10 transition-all">
                      <img src={post.media[0].url} className="w-full aspect-video object-cover" />
                      <div className="p-6 md:p-8"><p className="text-xs md:text-sm font-light text-neutral-400">"{post.caption}"</p></div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {dynastyTab === 'Chat' && (
            <div className="h-[600px] flex flex-col bg-neutral-950/80 backdrop-blur-2xl border border-white/5 rounded-[3rem] overflow-hidden shadow-2xl">
              <div className="flex-grow p-6 md:p-10 overflow-y-auto space-y-6 scrollbar-hide">
                {dynasty.chat.map(msg => (
                  <div key={msg.id} className="flex gap-4 animate-fade-in">
                    <div className="w-10 h-10 rounded-xl bg-neutral-800 flex-shrink-0"></div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] md:text-xs font-bold tracking-widest">{msg.userName}</span>
                      </div>
                      <div className="bg-neutral-900/40 p-4 rounded-2xl rounded-tl-none border border-white/5">
                        <p className="text-xs md:text-sm text-neutral-300 font-light leading-relaxed">{msg.text}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-6 border-t border-white/5 bg-black/40 flex gap-3">
                <input 
                  type="text" 
                  placeholder="Expressar..." 
                  value={chatMessage} 
                  onChange={e => setChatMessage(e.target.value)} 
                  onKeyDown={e => e.key === 'Enter' && handleSendMessage()} 
                  className="flex-grow bg-neutral-900/50 rounded-full px-6 py-3 text-xs md:text-sm focus:outline-none border border-white/5 transition-all" 
                />
                <button onClick={handleSendMessage} className="bg-white text-black px-6 rounded-full text-[9px] md:text-[11px] font-bold uppercase tracking-widest hover:scale-105 transition-all">Enviar</button>
              </div>
            </div>
          )}

          {dynastyTab === 'Gerenciar' && (
            <div className="p-8 bg-neutral-950/50 border border-white/5 rounded-[3rem] space-y-10">
              <div className="space-y-6">
                <h4 className="text-[9px] md:text-[11px] uppercase tracking-widest text-neutral-600 font-bold">Hierarquia</h4>
                <div className="flex flex-col md:flex-row gap-4">
                  <input type="text" placeholder="Cargo..." value={newRole.name} onChange={e => setNewRole(p => ({...p, name: e.target.value}))} className="flex-grow bg-neutral-900 rounded-[1rem] px-6 py-3 text-xs md:text-sm" />
                  <button onClick={handleAddRole} className="bg-white text-black px-8 py-3 rounded-2xl text-[9px] md:text-[10px] font-bold uppercase tracking-widest">Adicionar</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render login form if not authenticated
  if (!authState.isAuthenticated) {
    return <LoginForm onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-[#020202] text-[#e5e5e5] transition-all duration-1000 overflow-x-hidden flex flex-col items-center">
      <ResonanceVisualizer />

      <nav className="fixed top-0 left-0 w-full z-[100] bg-black/60 backdrop-blur-3xl border-b border-white/5 overflow-x-auto scrollbar-hide">
        <div className="max-w-7xl mx-auto px-4 h-20 md:h-24 flex items-center justify-center md:justify-between">
          <div className="hidden lg:flex items-center gap-4">
            <div className="w-3 h-3 rounded-full animate-pulse" style={{ background: profile.isPremium ? profile.premiumSettings?.appColor : '#ffffff' }}></div>
            <h1 className="text-[12px] uppercase tracking-[0.7em] text-white font-bold select-none">Núcleo</h1>
          </div>
          <div className="flex gap-4 md:gap-8 px-4 overflow-x-auto scrollbar-hide flex-nowrap min-w-max items-center">
            {(['Núcleo', 'Feed', 'Mensagens', 'Participações', 'Dinastia', 'Perfil', 'Configurações'] as TabType[]).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`transition-all relative py-2 md:py-3 font-bold flex-shrink-0 ${activeTab === tab ? 'text-white' : 'text-neutral-500 hover:text-neutral-300'} ${tab === 'Configurações' ? 'p-1' : 'text-[8px] md:text-[10px] uppercase tracking-[0.15em] md:tracking-[0.3em]'}`}
                style={{ color: activeTab === tab && profile.isPremium ? profile.premiumSettings?.appColor : undefined }}
              >
                {tab === 'Configurações' ? <GearIcon /> : tab}
                {activeTab === tab && <div className="absolute -bottom-1 left-0 w-full h-[2px] rounded-full transition-all duration-500" style={{ background: profile.isPremium ? profile.premiumSettings?.appColor : '#fff' }}></div>}
              </button>
            ))}
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-red-500 hover:text-red-400 text-[8px] md:text-[10px] uppercase tracking-[0.15em] md:tracking-[0.3em] font-bold transition-all"
            >
              Sair
            </button>
          </div>
        </div>
      </nav>

      <main className="relative z-[10] w-full max-w-4xl pt-28 md:pt-40 px-4 pb-20 md:pb-40 flex flex-col items-center">
        {activeTab === 'Núcleo' && (
          <div className="w-full max-w-2xl mx-auto fade-in">
            <section className="mb-12 md:mb-20">
              <div className="relative group">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Inicie um fluxo..."
                  className="w-full h-40 md:h-48 bg-neutral-900/30 border border-neutral-800/50 rounded-[2rem] p-6 md:p-8 text-neutral-200 placeholder-neutral-700 focus:outline-none focus:border-neutral-600 transition-all resize-none font-light leading-relaxed text-lg md:text-xl"
                  disabled={isProcessing}
                />
                <button
                  onClick={handleProcess}
                  disabled={isProcessing || !input.trim()}
                  className="absolute bottom-6 right-6 md:bottom-8 md:right-8 px-8 md:px-12 py-3 md:py-4 rounded-full text-[10px] md:text-[11px] uppercase tracking-[0.3em] font-bold hover:scale-105 transition-all shadow-2xl"
                  style={{ background: profile.isPremium ? profile.premiumSettings?.appColor : '#ffffff', color: profile.isPremium ? '#ffffff' : '#000000' }}
                >
                  {isProcessing ? 'Sintonizando...' : 'Transmitir'}
                </button>
              </div>
            </section>
            <section className="space-y-12">
              {history.map((item) => (
                <div key={item.id} className="fade-in border-l border-white/5 pl-8 md:pl-12 relative group">
                  <div className="absolute -left-[4px] top-2 w-2 h-2 rounded-full bg-white/20 group-hover:bg-white transition-colors"></div>
                  <div className="mb-8">
                    <h4 className="text-[9px] md:text-[10px] uppercase tracking-[0.3em] text-neutral-600 mb-4 font-bold">{item.response.socialInfo}</h4>
                    <p className="text-xl md:text-2xl font-light text-neutral-100 leading-snug mb-4">{item.response.collectiveObservation}</p>
                    <p className="text-[9px] md:text-[10px] text-neutral-500 tracking-[0.2em] uppercase italic">{item.response.movementNote}</p>
                  </div>
                </div>
              ))}
            </section>
          </div>
        )}

        {activeTab === 'Feed' && (
          <div className="w-full max-w-2xl mx-auto space-y-8 fade-in">
            <input 
              type="text" 
              placeholder="Pesquisar..." 
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              className="w-full bg-neutral-900/50 border border-white/5 rounded-full py-4 px-6 text-xs md:text-sm focus:outline-none placeholder:text-neutral-700"
            />
            {feedItems.length === 0 ? <p className="text-center py-20 text-neutral-700 italic">O fluxo global está em silêncio.</p> : feedItems.map(item => (
              <div key={item.id} onClick={() => openGalleryItem(item)} className="bg-neutral-900/20 border border-white/5 rounded-[2rem] overflow-hidden cursor-pointer hover:border-white/10 transition-all">
                <div className="p-6 flex items-center gap-4"><div className="w-8 h-8 rounded-xl bg-neutral-800"></div><span className="text-[10px] md:text-xs font-bold tracking-widest">{item.authorName}</span></div>
                <img src={item.media[0].url} className="w-full object-cover aspect-square" alt="Post" />
                <div className="p-8"><p className="text-base font-light italic text-neutral-400">"{item.caption}"</p></div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'Mensagens' && (
          <div className="w-full max-w-4xl mx-auto fade-in px-4 md:px-0">
             {!activeGroupId ? (
              <div className="space-y-8">
                <div className="flex justify-between items-center border-b border-white/5 pb-6">
                  <h2 className="text-xs md:text-sm uppercase tracking-[0.5em] font-bold">Núcleos</h2>
                  <button onClick={() => setIsCreatingGroup(true)} className="bg-white text-black text-[10px] font-bold uppercase tracking-widest px-8 py-3 rounded-full shadow-xl">Criar</button>
                </div>
                {profile.groups.length === 0 ? (
                  <div className="py-20 text-center text-neutral-800 italic">Nenhum núcleo.</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {profile.groups.map(g => (
                      <div key={g.id} onClick={() => setActiveGroupId(g.id)} className="p-6 bg-neutral-900/30 border border-white/5 rounded-[2rem] flex justify-between items-center cursor-pointer hover:border-white/20 transition-all">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-[1rem] bg-neutral-800 flex items-center justify-center font-bold">
                            {g.name.charAt(0)}
                          </div>
                          <div>
                            <h3 className="text-lg font-light tracking-widest uppercase">{g.name}</h3>
                            <p className="text-[8px] text-neutral-600 uppercase font-bold">{g.members.length} ecos</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              activeGroup && (
                <div className="flex flex-col h-[650px] bg-neutral-950/50 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl relative">
                  <header className="p-6 border-b border-white/5 flex items-center justify-between bg-black/40">
                    <div className="flex items-center gap-4">
                      <button onClick={() => setActiveGroupId(null)} className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white hover:text-black">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                      </button>
                      <h2 className="text-lg md:text-xl font-thin tracking-[0.2em] uppercase">{activeGroup.name}</h2>
                    </div>
                  </header>
                  <div className="flex-grow p-6 overflow-y-auto space-y-6 scrollbar-hide">
                    {activeGroup.messages.map(msg => (
                      <div key={msg.id} className={`flex gap-4 ${msg.userName === profile.name ? 'flex-row-reverse' : ''}`}>
                        <div className="max-w-[80%]">
                          <div className={`p-4 rounded-2xl border border-white/5 ${msg.userName === profile.name ? 'bg-white text-black' : 'bg-neutral-900/40'}`}>
                            <p className="text-xs md:text-sm font-light leading-relaxed">{msg.text}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-6 border-t border-white/5 bg-black/40 flex gap-3">
                    <input 
                      type="text" 
                      placeholder="Sintonizar..." 
                      value={chatMessage} 
                      onChange={e => setChatMessage(e.target.value)} 
                      onKeyDown={e => e.key === 'Enter' && handleSendGroupMessage()} 
                      className="flex-grow bg-neutral-900/50 rounded-full px-6 py-3 text-xs md:text-sm focus:outline-none border border-white/5" 
                    />
                    <button onClick={handleSendGroupMessage} className="bg-white text-black px-6 rounded-full text-[9px] font-bold uppercase tracking-widest">Enviar</button>
                  </div>
                </div>
              )
            )}
          </div>
        )}

        {activeTab === 'Participações' && (
          <div className="w-full max-w-4xl mx-auto fade-in px-4">
            {!activeParticipation ? (
              <div className="space-y-10">
                <header className="border-b border-white/5 pb-8 flex flex-col md:flex-row justify-between items-center gap-6">
                  <h2 className="text-xs md:text-sm uppercase tracking-[0.5em] font-bold">Ressonâncias</h2>
                  <input 
                    type="text" 
                    placeholder="Pesquisar..." 
                    value={participationSearch}
                    onChange={(e) => setParticipationSearch(e.target.value)}
                    className="w-full md:w-80 bg-neutral-900/50 border border-white/5 rounded-full py-3 px-6 text-xs md:text-sm"
                  />
                </header>
                <div className="grid grid-cols-1 gap-6">
                  {filteredParticipations.map(p => (
                    <div key={p.id} className="p-10 bg-neutral-900/20 border border-white/5 rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-6">
                      <div className="text-center md:text-left">
                        <h3 className="text-xl md:text-2xl font-thin tracking-widest uppercase text-white">{p.topic}</h3>
                        <p className="text-xs md:text-sm text-neutral-400 font-light mt-2">{p.description}</p>
                      </div>
                      <button 
                        onClick={() => setActiveParticipationId(p.id)} 
                        className="px-10 py-4 bg-white text-black rounded-full text-[9px] font-bold uppercase tracking-widest hover:scale-110 transition-all shadow-xl"
                      >
                        Participar
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col h-[650px] bg-neutral-950/50 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl relative">
                <header className="p-6 border-b border-white/5 flex items-center justify-between bg-black/40">
                  <h2 className="text-xl md:text-2xl font-thin tracking-[0.3em] uppercase text-white">{activeParticipation.topic}</h2>
                  <button onClick={() => setActiveParticipationId(null)} className="px-6 py-2 border border-red-500/20 text-red-500/60 rounded-full text-[8px] font-bold uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all">Sair</button>
                </header>
                <div className="flex-grow overflow-y-auto p-6 space-y-6 scrollbar-hide">
                  {activeParticipation.messages.map(msg => (
                    <div key={msg.id} className={`flex gap-4 ${msg.userName === profile.name ? 'flex-row-reverse' : ''}`}>
                      <div className="max-w-[80%]">
                        <div className={`p-4 rounded-2xl border border-white/5 ${msg.userName === profile.name ? 'bg-white text-black' : 'bg-neutral-900/60'}`}>
                          <p className="text-xs md:text-sm font-light leading-relaxed">{msg.text}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-6 border-t border-white/5 bg-black/40 flex gap-3">
                  <input 
                    type="text" 
                    placeholder="Contribuir..." 
                    value={chatMessage} 
                    onChange={e => setChatMessage(e.target.value)} 
                    onKeyDown={e => e.key === 'Enter' && handleSendParticipationMessage()} 
                    className="flex-grow bg-neutral-900/50 rounded-full px-6 py-3 text-xs md:text-sm focus:outline-none border border-white/5" 
                  />
                  <button onClick={handleSendParticipationMessage} className="bg-white text-black px-6 rounded-full text-[9px] font-bold uppercase tracking-widest">Transmitir</button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'Dinastia' && (
          !profile.isPremium ? (
            <div className="w-full max-w-2xl mx-auto text-center py-20 space-y-8 fade-in">
              <h2 className="text-3xl md:text-5xl font-thin tracking-[0.5em] uppercase">Dinastia</h2>
              <p className="text-neutral-500 italic font-light text-lg">Crie sua soberania. Exclusivo para o ciclo Premium.</p>
              <button onClick={() => setActiveTab('Configurações')} className="px-12 py-4 border border-yellow-500/40 text-yellow-500 text-[10px] font-bold uppercase tracking-widest rounded-full hover:bg-yellow-500 hover:text-black transition-all">Ver Planos Premium</button>
            </div>
          ) : profile.createdDynasty ? renderDynastyDashboard(profile.createdDynasty) : (
            <div className="w-full max-w-2xl mx-auto text-center py-20 space-y-8 fade-in">
              <h2 className="text-4xl md:text-6xl font-thin tracking-widest uppercase">Forjar Legado</h2>
              <p className="text-neutral-500 text-xl font-light italic leading-relaxed">Sintonize sua própria soberania.</p>
              <button onClick={() => setIsCreatingDynasty(true)} className="px-12 py-4 bg-white text-black text-[10px] font-bold uppercase tracking-[0.5em] rounded-full hover:scale-105 transition-all shadow-2xl">Iniciar Fundação</button>
            </div>
          )
        )}

        {activeTab === 'Perfil' && (
          <div className="w-full max-w-3xl mx-auto space-y-12 fade-in px-4 md:px-0">
            <div className="overflow-hidden rounded-[3rem] transition-all duration-1000 border shadow-2xl relative" 
                 style={{ 
                   background: profile.isPremium && profile.premiumSettings ? getPremiumStyle(profile.premiumSettings.profileType, profile.premiumSettings.profileColor) : '#050505', 
                   borderColor: profile.isPremium && profile.premiumSettings ? (profile.premiumSettings.borderType === 'solid' ? profile.premiumSettings.borderColor : 'rgba(255,255,255,0.1)') : 'rgba(255,255,255,0.05)',
                   borderWidth: profile.isPremium ? '4px' : '1px'
                 }}>
              
              <div className="relative h-48 md:h-64 group cursor-pointer overflow-hidden" onClick={() => bannerInputRef.current?.click()}>
                <img src={profile.bannerUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Banner" />
                <input type="file" ref={bannerInputRef} className="hidden" onChange={handleBannerChange} />
              </div>

              <div className="p-8 sm:p-12 relative -mt-20 md:-mt-32">
                <header className="flex flex-col items-center mb-12">
                  <div className="relative group cursor-pointer mb-8" onClick={() => avatarInputRef.current?.click()}>
                    <img src={profile.avatarUrl} className="w-32 h-32 md:w-44 md:h-44 rounded-[2.5rem] object-cover border-4 shadow-2xl" 
                         style={{ borderColor: profile.isPremium ? profile.premiumSettings?.borderColor : '#050505', backgroundColor: '#050505' }} alt="Avatar" />
                    <input type="file" ref={avatarInputRef} className="hidden" onChange={handleAvatarChange} />
                  </div>
                  
                  {isEditingProfile ? (
                    <div className="w-full max-w-sm flex flex-col gap-4 animate-fade-in">
                      <input 
                        type="text" 
                        value={tempProfile.name} 
                        onChange={e => setTempProfile(p => ({...p, name: e.target.value}))} 
                        className="bg-neutral-900 border border-white/10 rounded-xl px-5 py-3 text-center text-lg md:text-xl font-light uppercase tracking-widest focus:outline-none"
                        placeholder="Nome"
                      />
                      <textarea 
                        value={tempProfile.bio} 
                        onChange={e => setTempProfile(p => ({...p, bio: e.target.value}))} 
                        className="bg-neutral-900 border border-white/10 rounded-xl px-5 py-3 text-center text-sm font-light italic h-20 resize-none focus:outline-none"
                        placeholder="Bio..."
                      />
                      <div className="flex gap-4">
                        <button onClick={() => setIsEditingProfile(false)} className="flex-1 py-3 border border-white/10 rounded-full text-[9px] font-bold uppercase tracking-widest">Cancelar</button>
                        <button onClick={saveProfileEdits} className="flex-1 py-3 bg-white text-black rounded-full text-[9px] font-bold uppercase tracking-widest">Salvar</button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center group cursor-pointer" onClick={() => { setTempProfile({ name: profile.name, bio: profile.bio }); setIsEditingProfile(true); }}>
                      <h3 className="text-2xl md:text-4xl font-thin tracking-[0.4em] uppercase flex items-center justify-center">
                        {profile.name} {profile.isPremium && <VerifiedBadge color={profile.premiumSettings?.borderColor} />}
                      </h3>
                      <p className="text-neutral-500 italic mt-6 text-lg px-4">"{profile.bio}"</p>
                    </div>
                  )}
                  
                  <div className="flex gap-10 sm:gap-20 mt-16 py-10 border-y border-white/5 w-full justify-center">
                    <button onClick={() => setShowList('followers')} className="text-center group"><div className="text-2xl md:text-3xl font-light group-hover:scale-110 transition-transform">{profile.followers.length}</div><div className="text-[8px] md:text-[10px] uppercase tracking-widest text-neutral-600 font-bold">Seguidores</div></button>
                    <button onClick={() => setShowList('following')} className="text-center group"><div className="text-2xl md:text-3xl font-light group-hover:scale-110 transition-transform">{profile.following.length}</div><div className="text-[8px] md:text-[10px] uppercase tracking-widest text-neutral-600 font-bold">Seguindo</div></button>
                  </div>
                </header>
                <section className="space-y-8">
                  <div className="flex justify-between items-center"><h4 className="text-[9px] md:text-[11px] uppercase tracking-[0.5em] font-bold text-neutral-500">Galeria</h4><button onClick={() => setIsPosting(true)} className="px-6 py-2 bg-white text-black rounded-full text-[8px] font-bold uppercase hover:scale-105 transition-all">Novo Post</button></div>
                  <div className="grid grid-cols-3 gap-2 md:gap-4">
                    {profile.gallery.map(g => (
                      <div key={g.id} onClick={() => openGalleryItem(g)} className="aspect-square bg-neutral-900 rounded-2xl overflow-hidden cursor-pointer hover:opacity-80 transition-all border border-white/5"><img src={g.media[0].url} className="w-full h-full object-cover" /></div>
                    ))}
                  </div>
                </section>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Configurações' && (
          <div className="w-full max-w-2xl mx-auto py-10 space-y-12 fade-in px-4 md:px-0">
             {!profile.isPremium && (
              <div className="bg-neutral-900/50 border-2 border-yellow-500/20 rounded-[2rem] p-10 space-y-8 relative overflow-hidden shadow-2xl">
                <h3 className="text-xl md:text-2xl font-thin tracking-widest uppercase text-yellow-500">Vire Premium</h3>
                <p className="text-neutral-400 font-light text-xs md:text-sm italic">Eleve sua presença no núcleo e lidere o fluxo.</p>
                <button 
                  onClick={buyPremium}
                  className="w-full py-5 bg-yellow-500 text-black rounded-full font-bold uppercase tracking-[0.4em] text-[10px] hover:scale-[1.02] transition-all shadow-xl"
                >
                  Ativar Soberania
                </button>
              </div>
            )}
            <div className="space-y-8">
              <h3 className="text-[10px] md:text-xs uppercase tracking-[0.5em] text-neutral-600 font-bold border-b border-white/5 pb-6">Protocolos</h3>
              {[{ label: 'Perfil Público', key: 'isPublic' }, { label: 'Mensagens', key: 'allowMessages' }, { label: 'Grupos', key: 'allowGroups' }].map(item => (
                <div key={item.key} className="flex items-center justify-between p-7 bg-neutral-900/30 rounded-[2rem] border border-white/5">
                  <span className="text-xs md:text-sm tracking-widest uppercase font-bold text-neutral-400">{item.label}</span>
                  <button onClick={() => setSettings(p => ({...p, [item.key]: !p[item.key as keyof UserSettings]}))} className={`w-12 h-6 rounded-full relative transition-all ${settings[item.key as keyof UserSettings] ? 'bg-white' : 'bg-neutral-800'}`}><div className={`absolute top-1 w-4 h-4 rounded-full transition-all ${settings[item.key as keyof UserSettings] ? 'right-1 bg-black' : 'left-1 bg-neutral-600'}`}></div></button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Modals and Overlays */}
      {activeGalleryItem && (
        <div className="fixed inset-0 z-[450] bg-black flex flex-col lg:flex-row animate-fade-in" onClick={() => setActiveGalleryItem(null)}>
          <div className="flex-grow bg-[#000] flex items-center justify-center p-4 relative overflow-hidden" onClick={e => e.stopPropagation()}>
            <img src={activeGalleryItem.media[0].url} className="max-w-full max-h-full rounded-[2rem] shadow-2xl animate-fade-in" />
          </div>
          <div className="w-full lg:w-[400px] bg-[#050505] border-l border-white/5 p-8 flex flex-col" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-thin tracking-widest uppercase mb-4">{activeGalleryItem.authorName}</h3>
            <p className="text-lg font-light text-neutral-400 italic">"{activeGalleryItem.caption}"</p>
            <button onClick={() => setActiveGalleryItem(null)} className="mt-auto py-5 border border-white/10 rounded-full text-[9px] font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-all">Sair</button>
          </div>
        </div>
      )}

      {isCreatingDynasty && (
        <div className="fixed inset-0 z-[400] bg-black/95 backdrop-blur-3xl flex items-center justify-center p-4 overflow-y-auto" onClick={() => setIsCreatingDynasty(false)}>
          <div className="bg-[#050505] border border-white/10 rounded-[2.5rem] p-8 max-w-2xl w-full shadow-2xl my-10" onClick={e => e.stopPropagation()}>
            <h3 className="text-3xl md:text-5xl font-thin tracking-widest text-center mb-16 uppercase">Fundar Dinastia</h3>
            <div className="space-y-12">
              <input type="text" placeholder="Nome..." value={newDynasty.name} onChange={e => setNewDynasty(p => ({...p, name: e.target.value}))} className="w-full bg-neutral-900 border border-white/5 rounded-3xl px-10 py-6 text-xl font-light focus:outline-none" />
              <textarea placeholder="Propósito..." value={newDynasty.purpose} onChange={e => setNewDynasty(p => ({...p, purpose: e.target.value}))} className="w-full bg-neutral-900 border border-white/5 rounded-3xl px-10 py-6 text-lg h-44 resize-none focus:outline-none" />
              <button onClick={handleDynastyCreation} className="w-full py-8 bg-white text-black rounded-full font-bold uppercase tracking-[0.5em] text-xs hover:scale-105 transition-all shadow-2xl">Estabelecer</button>
            </div>
          </div>
        </div>
      )}

      {isCreatingGroup && (
        <div className="fixed inset-0 z-[400] bg-black/95 backdrop-blur-3xl flex items-center justify-center p-4 overflow-y-auto" onClick={() => setIsCreatingGroup(false)}>
          <div className="bg-[#050505] border border-white/10 rounded-[2rem] p-16 max-w-lg w-full shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-2xl md:text-4xl font-thin tracking-widest text-center mb-12 uppercase">Novo Núcleo</h3>
            <div className="space-y-10">
              <input 
                type="text" 
                placeholder="Título..." 
                value={newGroupName} 
                onChange={e => setNewGroupName(e.target.value)} 
                className="w-full bg-neutral-900 border border-white/5 rounded-3xl px-8 py-6 text-xl font-light focus:outline-none" 
              />
              <button onClick={handleCreateGroup} className="w-full py-7 bg-white text-black rounded-full font-bold uppercase tracking-[0.4em] text-[10px] hover:scale-105 transition-all shadow-2xl">Conectar</button>
            </div>
          </div>
        </div>
      )}

      {isPosting && (
        <div className="fixed inset-0 z-[400] bg-black/98 flex items-center justify-center p-4" onClick={() => setIsPosting(false)}>
          <div className="bg-[#050505] border border-white/10 rounded-[2.5rem] p-16 max-w-2xl w-full shadow-2xl overflow-y-auto max-h-[95vh]" onClick={e => e.stopPropagation()}>
            <h3 className="text-2xl md:text-4xl font-thin tracking-widest text-center mb-12 uppercase">Novo Post</h3>
            <div className="space-y-10">
              <div 
                onClick={() => galleryInputRef.current?.click()} 
                className="w-full h-40 rounded-3xl border-2 border-dashed border-white/10 hover:border-white/30 hover:bg-white/5 transition-all flex flex-col items-center justify-center cursor-pointer"
              >
                <span className="text-[10px] uppercase font-bold text-neutral-700">Adicionar Mídia</span>
              </div>
              <input type="file" ref={galleryInputRef} className="hidden" multiple onChange={handleGalleryFiles} />
              <textarea 
                placeholder="Legenda..." 
                value={newPostCaption} 
                onChange={e => setNewPostCaption(e.target.value)} 
                className="w-full bg-neutral-900/50 border border-white/5 rounded-3xl p-10 text-xl font-light h-48 resize-none focus:outline-none transition-all" 
              />
              <button onClick={handleAddPost} className="w-full py-7 bg-white text-black rounded-full font-bold uppercase tracking-[0.5em] text-[10px] hover:scale-105 transition-all shadow-xl">Gravar</button>
            </div>
          </div>
        </div>
      )}

      <footer className="fixed bottom-0 left-0 w-full py-8 pointer-events-none opacity-5">
        <p className="text-center text-[10px] uppercase tracking-[3.5em] font-bold select-none italic">Fluxo Permanente</p>
      </footer>
    </div>
  );
};

export default App;