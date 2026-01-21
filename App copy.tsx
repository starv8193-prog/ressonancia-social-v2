import React, { useState, useCallback, useRef, useMemo } from 'react';
import { processResonance } from './services/geminiService';
import { HistoryItem, UserProfile, UserSettings, EchoProfile, GalleryItem, Comment, MediaFile, PremiumSettings, Dynasty, DynastyRole, DynastyMessage, Group, Participation } from './types';
import ResonanceVisualizer from './components/ResonanceVisualizer';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Auth } from './components/Auth';

type TabType = 'Núcleo' | 'Feed' | 'Mensagens' | 'Participações' | 'Dinastia' | 'Perfil' | 'Configurações';
type DynastyTab = 'Geral' | 'Feed' | 'Chat' | 'Gerenciar';
type GroupViewTab = 'Chat' | 'Membros';

const MOCK_NAMES = ["Eco_Sombrio", "Luz_Difusa", "Voz_Interior", "Pulso_Cósmico", "Mente_Aberta", "Silêncio_Ativo", "Nômade_Digital", "Consciência_X", "Frequência_Alta", "Sombra_Amiga"];
const MOCK_BIOS = ["Navegando em fluxos de pensamento.", "Buscando ressonância no caos.", "Uma ideia em movimento.", "Apenas um eco no vazio.", "Conectando pontos invisíveis."];

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

const GRADIENTS = [
  { name: 'Sunset', value: 'linear-gradient(45deg, #ff512f, #dd2476)' },
  { name: 'Royal', value: 'linear-gradient(45deg, #8e2de2, #4a00e0)' },
  { name: 'Gold', value: 'linear-gradient(45deg, #f12711, #f5af19)' },
  { name: 'Ocean', value: 'linear-gradient(45deg, #2193b0, #6dd5ed)' },
  { name: 'Vampire', value: 'linear-gradient(45deg, #b21f1f, #1a2a6c)' },
  { name: 'Emerald', value: 'linear-gradient(45deg, #34e89e, #0f3443)' },
  { name: 'Midnight', value: 'linear-gradient(45deg, #232526, #414345)' },
  { name: 'Neon', value: 'linear-gradient(45deg, #00f2ff, #0061ff)' }
];

const generateMockGallery = (name: string): GalleryItem[] => {
  return Array.from({ length: Math.floor(Math.random() * 5) + 1 }, () => ({
    id: crypto.randomUUID(),
    media: [{ url: `https://picsum.photos/seed/${Math.random()}/800/800`, type: 'image' }],
    caption: "Uma ressonância visual capturada no fluxo.",
    comments: [],
    timestamp: Date.now() - Math.random() * 10000000,
    authorName: name
  }));
};

const generateEchoes = (count: number = 15): EchoProfile[] => {
  return Array.from({ length: count }, () => {
    const name = MOCK_NAMES[Math.floor(Math.random() * MOCK_NAMES.length)] + "_" + Math.floor(Math.random() * 999);
    const isPrivate = Math.random() > 0.7;
    const isPremium = Math.random() > 0.8;
    return {
      id: crypto.randomUUID(),
      name,
      bio: MOCK_BIOS[Math.floor(Math.random() * MOCK_BIOS.length)],
      isPublic: !isPrivate,
      isPrivate,
      isPremium,
      premiumSettings: isPremium ? {
        borderColor: SOLID_COLORS[Math.floor(Math.random() * SOLID_COLORS.length)].value,
        profileColor: SOLID_COLORS[9].value,
        appColor: SOLID_COLORS[Math.floor(Math.random() * SOLID_COLORS.length)].value,
        nameColor: SOLID_COLORS[0].value,
        borderType: 'solid',
        profileType: 'solid',
        nameType: 'solid'
      } : undefined,
      avatarColor: `hsl(${Math.random() * 360}, 50%, 60%)`,
      gallery: isPrivate ? [] : generateMockGallery(name)
    };
  });
};

const VerifiedBadge = ({ color }: { color?: string }) => (
  <svg className="w-4 h-4 inline-block ml-1 mb-1" style={{ color: color || '#60a5fa' }} fill="currentColor" viewBox="0 0 24 24">
    <path d="M23 12l-2.44-2.78.34-3.68-3.61-.82-1.89-3.18L12 3 8.6 1.54 6.71 4.72l-3.61.81.34 3.68L1 12l2.44 2.78-.34 3.69 3.61.82 1.89 3.18L12 21l3.4 1.46 1.89-3.18 3.61-.82-.34-3.68L23 12zm-13 5l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
  </svg>
);

const App: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh',
        background: '#000000',
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        flexDirection: 'column',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        position: 'relative'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 20% 80%, rgba(99, 102, 241, 0.15) 0%, transparent 50%)',
          pointerEvents: 'none'
        }}></div>
        <div style={{
          width: '100px',
          height: '100px',
          background: '#0a0a0a',
          backdropFilter: 'blur(20px)',
          borderRadius: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '24px',
          boxShadow: '0 25px 50px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.03)',
          position: 'relative',
          zIndex: 1
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '3px solid #4f46e5',
            borderTop: '3px solid transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
        </div>
        <div style={{
          color: '#ffffff',
          fontSize: '20px',
          fontWeight: '600',
          textAlign: 'center',
          textShadow: '0 2px 10px rgba(0,0,0,0.5)',
          position: 'relative',
          zIndex: 1
        }}>
          Sintonizando sua ressonância...
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  const [activeTab, setActiveTab] = useState<TabType>('Núcleo');
  const [dynastyTab, setDynastyTab] = useState<DynastyTab>('Geral');
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showManifesto, setShowManifesto] = useState(true);
  const [pendingRequests, setPendingRequests] = useState<Set<string>>(new Set());
  
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const dynastyPhotoRef = useRef<HTMLInputElement>(null);
  const dynastyBannerRef = useRef<HTMLInputElement>(null);
  const groupPhotoInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<UserProfile>({
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
    followers: generateEchoes(10),
    following: [],
    gallery: [],
    groups: []
  });

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

  const [participations, setParticipations] = useState<Participation[]>([
    { id: '1', topic: 'Arquitetura do Silêncio', description: 'Explorações sobre o vazio e a ausência de som.', activeCount: 42, messages: [] },
    { id: '2', topic: 'Fluxo Onírico', description: 'Compartilhamento de visões durante o sono profundo.', activeCount: 156, messages: [] },
    { id: '3', topic: 'Ecos Urbanos', description: 'A melancolia escondida no concreto das cidades.', activeCount: 89, messages: [] },
    { id: '4', topic: 'Paradoxos Digitais', description: 'Conexões que isolam e isolamentos que conectam.', activeCount: 230, messages: [] },
  ]);
  const [activeParticipationId, setActiveParticipationId] = useState<string | null>(null);
  const [participationSearch, setParticipationSearch] = useState('');

  const filteredParticipations = useMemo(() => {
    return participations.filter(p => 
      p.topic.toLowerCase().includes(participationSearch.toLowerCase()) ||
      p.description.toLowerCase().includes(participationSearch.toLowerCase())
    );
  }, [participations, participationSearch]);

  const activeParticipation = useMemo(() => participations.find(p => p.id === activeParticipationId), [participations, activeParticipationId]);

  const [settings, setSettings] = useState<UserSettings>({
    isPublic: true,
    allowMessages: true,
    allowGroups: true,
    allowDynastyInvites: true
  });

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
    alert("Bem-vindo ao ciclo Premium. O fluxo agora é seu para moldar.");
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
          if (next.has(echo.id)) {
            next.delete(echo.id);
          } else {
            next.add(echo.id);
          }
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

  const handleDynastyFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'photo' | 'banner') => {
    const files = e.currentTarget.files;
    if (files && files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = () => {
        setNewDynasty(prev => ({
          ...prev,
          [type === 'photo' ? 'photoUrl' : 'bannerUrl']: reader.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDynastyCreation = () => {
    if (!newDynasty.name || !newDynasty.purpose) {
      alert("Defina o nome e o propósito de seu legado.");
      return;
    }
    const dynasty: Dynasty = {
      id: crypto.randomUUID(),
      name: newDynasty.name!,
      purpose: newDynasty.purpose!,
      isPublic: newDynasty.isPublic!,
      photoUrl: newDynasty.photoUrl || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=300&h=300&fit=crop',
      bannerUrl: newDynasty.bannerUrl || 'https://images.unsplash.com/photo-1464802686167-b939a6910659?w=1200&h=400&fit=crop',
      roles: [{ id: 'owner', name: 'Líder Supremo', color: '#ffcc00' }],
      members: profile.followers.slice(0, 3),
      feed: [],
      chat: [{ id: '1', userName: 'Núcleo', text: 'A Dinastia foi forjada no silêncio.', timestamp: Date.now() }]
    };
    setProfile(prev => ({ ...prev, createdDynasty: dynasty }));
    setIsCreatingDynasty(false);
    setNewDynasty({ name: '', purpose: '', isPublic: true, photoUrl: '', bannerUrl: '' });
    alert(`Dinastia ${dynasty.name} foi estabelecida.`);
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
    if (!newGroupName.trim() || selectedMembers.size === 0) {
      alert("Escolha um nome e selecione pelo menos um seguidor.");
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
    alert("Grupo sintonizado com sucesso.");
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
    if (!chatMessage.trim() || !activeParticipationId) return;
    const newMessage: DynastyMessage = {
      id: crypto.randomUUID(),
      userName: profile.name,
      text: chatMessage,
      timestamp: Date.now()
    };
    setParticipations(prev => prev.map(p => p.id === activeParticipationId ? {
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

  const saveProfileEdits = () => {
    setProfile(prev => ({ ...prev, name: tempProfile.name, bio: tempProfile.bio }));
    setIsEditingProfile(false);
  };

  const handleGalleryFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.currentTarget.files;
    if (!fileList || fileList.length === 0) return;
    
    const remainingSlots = 7 - pendingMedia.length;
    if (remainingSlots <= 0) {
      alert("O limite de 7 mídias por publicação foi atingido.");
      return;
    }

    const files = Array.from(fileList).slice(0, remainingSlots);
    if (Array.from(fileList).length > remainingSlots) {
      alert(`O limite é de 7 mídias. Apenas ${remainingSlots} novas fotos foram adicionadas.`);
    }

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
      alert("O silêncio precisa de uma imagem.");
      return;
    }
    const newPost: GalleryItem = {
      id: crypto.randomUUID(),
      media: pendingMedia,
      caption: newPostCaption || "Sem legenda.",
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
        relatedEchoes: generateEchoes(12),
      };
      setHistory(prev => [newItem, ...prev]);
      setInput('');
    } catch (error) {
      console.error(error);
      alert('Erro na ressonância.');
    } finally {
      setIsProcessing(false);
    }
  }, [input, isProcessing]);

  const feedItems = useMemo(() => {
    const items: GalleryItem[] = [];
    profile.following.forEach(user => { if (user.gallery) items.push(...user.gallery); });
    return items.sort((a, b) => b.timestamp - a.timestamp);
  }, [profile.following]);

  const openGalleryItem = (item: GalleryItem) => {
    setActiveGalleryItem(item);
    setActiveMediaIndex(0);
  };

  const nextMedia = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!activeGalleryItem) return;
    setActiveMediaIndex((prev) => (prev + 1) % activeGalleryItem.media.length);
  };

  const prevMedia = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!activeGalleryItem) return;
    setActiveMediaIndex((prev) => (prev - 1 + activeGalleryItem.media.length) % activeGalleryItem.media.length);
  };

  const renderDynastyDashboard = (dynasty: Dynasty) => {
    return (
      <div className="fade-in max-w-6xl mx-auto flex flex-col md:flex-row gap-10">
        <aside className="w-full md:w-72 flex flex-col gap-3 p-6 bg-neutral-950/80 backdrop-blur-3xl border border-white/5 rounded-[3rem] h-fit sticky top-32">
          {(['Geral', 'Feed', 'Chat', 'Gerenciar'] as DynastyTab[]).map(tab => (
            <button
              key={tab}
              onClick={() => setDynastyTab(tab)}
              className={`text-[11px] uppercase tracking-[0.2em] p-5 rounded-3xl text-left transition-all font-bold ${dynastyTab === tab ? 'bg-white text-black shadow-xl' : 'text-neutral-500 hover:bg-white/5 hover:text-white'}`}
            >
              {tab}
            </button>
          ))}
        </aside>

        <div className="flex-grow space-y-10">
          {dynastyTab === 'Geral' && (
            <div className="space-y-10">
              <div className="relative h-80 rounded-[4rem] overflow-hidden group border border-white/5 shadow-2xl">
                <img src={dynasty.bannerUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Banner" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                <div className="absolute bottom-10 left-10 flex items-end gap-8">
                  <img src={dynasty.photoUrl} className="w-32 h-32 rounded-[2.5rem] border-4 border-black shadow-2xl" alt="Dinastia" />
                  <div className="mb-2">
                    <h2 className="text-4xl font-thin tracking-[0.3em] uppercase">{dynasty.name}</h2>
                    <p className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold mt-2">{dynasty.isPublic ? 'Soberania Aberta' : 'Legado Restrito'}</p>
                  </div>
                </div>
              </div>
              <div className="p-12 bg-neutral-900/30 backdrop-blur-md border border-white/5 rounded-[4rem]">
                <h3 className="text-[10px] uppercase tracking-widest text-neutral-600 font-bold mb-6">Manifesto do Legado</h3>
                <p className="text-2xl font-light italic leading-relaxed text-neutral-100">"{dynasty.purpose}"</p>
              </div>
            </div>
          )}

          {dynastyTab === 'Feed' && (
            <div className="space-y-10">
              <div className="flex justify-between items-center border-b border-white/5 pb-8">
                <h3 className="text-sm uppercase tracking-[0.4em] font-bold">Mural de Ideias</h3>
                <button onClick={() => setIsPosting(true)} className="bg-white text-black text-[10px] font-bold uppercase tracking-widest px-8 py-3 rounded-full hover:scale-105 transition-all">Novo Registro</button>
              </div>
              {dynasty.feed.length === 0 ? (
                <div className="py-32 text-center text-neutral-700 italic border border-dashed border-white/5 rounded-[4rem]">O mural soberano está em silêncio.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {dynasty.feed.map(post => (
                    <div key={post.id} onClick={() => openGalleryItem(post)} className="bg-neutral-900/20 border border-white/5 rounded-[3rem] overflow-hidden cursor-pointer hover:border-white/10 transition-all">
                      <img src={post.media[0].url} className="w-full aspect-video object-cover" />
                      <div className="p-8"><p className="text-sm font-light text-neutral-400">"{post.caption}"</p></div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {dynastyTab === 'Chat' && (
            <div className="h-[700px] flex flex-col bg-neutral-950/80 backdrop-blur-2xl border border-white/5 rounded-[4rem] overflow-hidden shadow-2xl">
              <div className="flex-grow p-10 overflow-y-auto space-y-8 scrollbar-hide">
                {dynasty.chat.map(msg => (
                  <div key={msg.id} className="flex gap-5 animate-fade-in">
                    <div className="w-12 h-12 rounded-2xl bg-neutral-800 flex-shrink-0"></div>
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-xs font-bold tracking-widest">{msg.userName}</span>
                        {msg.userRole && <span className="text-[9px] uppercase tracking-widest px-3 py-1 rounded-full border border-white/5 font-bold" style={{ color: msg.userRole.color }}>{msg.userRole.name}</span>}
                      </div>
                      <div className="bg-neutral-900/40 p-5 rounded-3xl rounded-tl-none border border-white/5">
                        <p className="text-sm text-neutral-300 font-light leading-relaxed">{msg.text}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-10 border-t border-white/5 bg-black/40 flex gap-5">
                <input 
                  type="text" 
                  placeholder="Expressar fluxo..." 
                  value={chatMessage} 
                  onChange={e => setChatMessage(e.target.value)} 
                  onKeyDown={e => e.key === 'Enter' && handleSendMessage()} 
                  className="flex-grow bg-neutral-900/50 rounded-full px-10 py-5 text-sm focus:outline-none border border-white/5 focus:border-white/20 transition-all" 
                />
                <button onClick={handleSendMessage} className="bg-white text-black px-10 rounded-full text-[11px] font-bold uppercase tracking-widest hover:scale-105 transition-all">Enviar</button>
              </div>
            </div>
          )}

          {dynastyTab === 'Gerenciar' && (
            <div className="p-12 bg-neutral-950/50 border border-white/5 rounded-[4rem] space-y-16">
              <div className="space-y-8">
                <h4 className="text-[11px] uppercase tracking-widest text-neutral-600 font-bold">Forjar Hierarquia</h4>
                <div className="flex gap-5">
                  <input type="text" placeholder="Nome do cargo..." value={newRole.name} onChange={e => setNewRole(p => ({...p, name: e.target.value}))} className="flex-grow bg-neutral-900 rounded-[1.5rem] px-8 py-4 text-sm focus:ring-1 focus:ring-white/10" />
                  <div className="flex gap-3">
                    {SOLID_COLORS.slice(0, 5).map(c => (
                      <button key={c.name} onClick={() => setNewRole(p => ({...p, color: c.value}))} className={`w-12 h-12 rounded-full border-2 transition-all ${newRole.color === c.value ? 'border-white scale-110' : 'border-transparent'}`} style={{ background: c.value }} />
                    ))}
                  </div>
                  <button onClick={handleAddRole} className="bg-white text-black px-10 rounded-3xl text-[10px] font-bold uppercase tracking-widest">Adicionar</button>
                </div>
              </div>
              <div className="space-y-6">
                <h4 className="text-[11px] uppercase tracking-widest text-neutral-600 font-bold">Cargos da Ordem</h4>
                <div className="grid grid-cols-2 gap-4">
                  {dynasty.roles.map(r => (
                    <div key={r.id} className="p-6 bg-white/5 rounded-3xl flex justify-between items-center border border-white/5">
                      <span className="text-xs font-bold uppercase tracking-widest" style={{ color: r.color }}>{r.name}</span>
                      <button className="text-[9px] text-red-500 font-bold uppercase tracking-widest opacity-30 hover:opacity-100 transition-opacity">Dissolver</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const getPremiumStyle = (type: 'solid' | 'gradient', color: string) => {
    if (type === 'solid') return color;
    return color.includes('gradient') ? color : `linear-gradient(45deg, ${color}, #000000)`;
  };

  return (
    <div className="min-h-screen bg-[#020202] text-[#e5e5e5] transition-all duration-1000">
      <ResonanceVisualizer />

      {showManifesto && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center bg-black p-8 text-center">
          <div className="flex flex-col items-center space-y-12">
            <h1 className="text-7xl md:text-9xl font-thin tracking-[0.5em] text-white animate-pulse mr-[-0.5em]">RESSONÂNCIA</h1>
            <p className="text-2xl text-neutral-400 font-light italic max-w-2xl">“Você não está sendo visto. Você está sendo compartilhado.”</p>
            <button onClick={() => setShowManifesto(false)} className="px-20 py-6 border border-white/10 hover:border-white text-[11px] tracking-[0.5em] uppercase transition-all hover:bg-white hover:text-black font-bold">Acessar o Fluxo</button>
          </div>
        </div>
      )}

      {!showManifesto && (
        <nav className="fixed top-0 left-0 w-full z-[100] bg-black/60 backdrop-blur-3xl border-b border-white/5 overflow-x-auto scrollbar-hide">
          <div className="max-w-7xl mx-auto px-10 h-24 flex items-center justify-between min-w-max md:min-w-0">
            <div className="hidden md:flex items-center gap-4">
              <div className="w-3 h-3 rounded-full animate-pulse" style={{ background: profile.isPremium ? profile.premiumSettings?.appColor : '#ffffff' }}></div>
              <h1 className="text-[12px] uppercase tracking-[0.7em] text-white font-bold select-none">Núcleo</h1>
            </div>
            <div className="flex gap-8">
              {(['Núcleo', 'Feed', 'Mensagens', 'Participações', 'Dinastia', 'Perfil', 'Configurações'] as TabType[]).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`text-[9px] md:text-[10px] uppercase tracking-[0.2em] md:tracking-[0.3em] transition-all relative py-3 font-bold ${activeTab === tab ? 'text-white' : 'text-neutral-500 hover:text-neutral-300'}`}
                  style={{ color: activeTab === tab && profile.isPremium ? profile.premiumSettings?.appColor : undefined }}
                >
                  {tab}
                  {activeTab === tab && <div className="absolute -bottom-1 left-0 w-full h-[2px] rounded-full transition-all duration-500" style={{ background: profile.isPremium ? profile.premiumSettings?.appColor : '#fff' }}></div>}
                </button>
              ))}
            </div>
          </div>
        </nav>
      )}

      <main className="relative z-[10] w-full pt-40 px-6 pb-40">
        {activeTab === 'Núcleo' && (
          <div className="max-w-2xl mx-auto fade-in">
            <section className="mb-20">
              <div className="relative group">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Inicie um fluxo..."
                  className="w-full h-48 bg-neutral-900/30 border border-neutral-800/50 rounded-3xl p-8 text-neutral-200 placeholder-neutral-700 focus:outline-none focus:border-neutral-600 transition-all resize-none font-light leading-relaxed text-xl"
                  disabled={isProcessing}
                />
                <button
                  onClick={handleProcess}
                  disabled={isProcessing || !input.trim()}
                  className="absolute bottom-8 right-8 px-12 py-4 rounded-full text-[11px] uppercase tracking-[0.3em] font-bold hover:scale-105 transition-all shadow-2xl"
                  style={{ background: profile.isPremium ? profile.premiumSettings?.appColor : '#ffffff', color: profile.isPremium ? '#ffffff' : '#000000' }}
                >
                  {isProcessing ? 'Sintonizando...' : 'Transmitir'}
                </button>
              </div>
            </section>
            <section className="space-y-32">
              {history.map((item) => (
                <div key={item.id} className="fade-in border-l border-white/5 pl-12 relative group">
                  <div className="absolute -left-[4px] top-2 w-2 h-2 rounded-full bg-white/20 group-hover:bg-white transition-colors"></div>
                  <div className="mb-12">
                    {/* Fixed property access: socialInfo is inside response */}
                    <h4 className="text-[10px] uppercase tracking-[0.5em] text-neutral-600 mb-6 font-bold">{item.response.socialInfo}</h4>
                    <p className="text-3xl font-light text-neutral-100 leading-snug mb-6">{item.response.collectiveObservation}</p>
                    <p className="text-[10px] text-neutral-500 tracking-[0.2em] uppercase italic">{item.response.movementNote}</p>
                  </div>
                  <div className="relative">
                    <div className="flex gap-6 overflow-x-auto pb-8 scrollbar-hide">
                      {item.relatedEchoes.map(echo => (
                        <div key={echo.id} 
                            className="flex-shrink-0 w-44 bg-neutral-950/50 p-6 rounded-[2rem] border transition-all duration-500 hover:scale-105 cursor-pointer relative" 
                            style={{ borderColor: echo.isPremium ? `${echo.premiumSettings?.borderColor}44` : '#1a1a1a' }}>
                          <div onClick={() => setViewingProfile(echo)}>
                            <div className="w-14 h-14 mx-auto rounded-full mb-4 border-2 overflow-hidden flex items-center justify-center" style={{ backgroundColor: echo.avatarColor, borderColor: echo.isPremium ? echo.premiumSettings?.borderColor : 'transparent' }}>
                              {echo.avatarUrl && <img src={echo.avatarUrl} className="w-full h-full object-cover" alt="" />}
                            </div>
                            <p className="text-[11px] font-bold truncate mb-2 text-center" style={{ color: echo.isPremium ? echo.premiumSettings?.nameColor : '#e5e5e5' }}>
                              {echo.name}
                              {echo.isPremium && <VerifiedBadge color={echo.premiumSettings?.borderColor} />}
                            </p>
                          </div>
                          <div className="flex gap-2 justify-center mt-2">
                            <button onClick={() => toggleFollow(echo)} className="text-[8px] uppercase tracking-widest text-white px-3 py-1.5 bg-white/10 rounded-full hover:bg-white hover:text-black transition-all font-bold">
                              {profile.following.some(f => f.id === echo.id) 
                                ? 'Largar' 
                                : (pendingRequests.has(echo.id) 
                                    ? 'Solicitação enviada' 
                                    : (echo.isPrivate ? 'Solicitar' : 'Seguir'))}
                            </button>
                            <button onClick={() => setViewingProfile(echo)} className="text-[8px] uppercase tracking-widest text-neutral-500 px-3 py-1.5 border border-white/5 rounded-full hover:bg-white hover:text-black transition-all font-bold">Ver</button>
                          </div>
                        </div>
                      ))}
                      <div className="flex-shrink-0 flex items-center justify-center w-20 opacity-30 group-hover:opacity-100 transition-opacity">
                        <svg className="w-10 h-10 text-white animate-bounce-horizontal" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7l5 5-5 5M6 7l5 5-5 5" /></svg>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </section>
          </div>
        )}

        {activeTab === 'Feed' && (
          <div className="max-w-2xl mx-auto space-y-12 fade-in">
            {feedItems.length === 0 ? <p className="text-center py-40 text-neutral-700 italic">O fluxo global está em silêncio. Siga outros ecos.</p> : feedItems.map(item => (
              <div key={item.id} onClick={() => openGalleryItem(item)} className="bg-neutral-900/20 border border-white/5 rounded-[3rem] overflow-hidden cursor-pointer hover:border-white/10 transition-all">
                <div className="p-8 flex items-center gap-5"><div className="w-10 h-10 rounded-2xl bg-neutral-800"></div><span className="text-xs font-bold tracking-widest">{item.authorName}</span></div>
                <img src={item.media[0].url} className="w-full object-cover aspect-square" alt="Post" />
                <div className="p-10"><p className="text-lg font-light italic text-neutral-400">"{item.caption}"</p></div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'Mensagens' && (
          <div className="max-w-4xl mx-auto fade-in">
            {!activeGroupId ? (
              <div className="space-y-10">
                <div className="flex justify-between items-center border-b border-white/5 pb-8">
                  <h2 className="text-sm uppercase tracking-[0.5em] font-bold">Núcleos de Conversa</h2>
                  <button onClick={() => setIsCreatingGroup(true)} className="bg-white text-black text-[11px] font-bold uppercase tracking-widest px-10 py-4 rounded-full hover:scale-105 transition-all shadow-xl">Criar Grupo</button>
                </div>
                {profile.groups.length === 0 ? (
                  <div className="py-40 text-center text-neutral-800 italic">Nenhum núcleo estabelecido. Inicie uma conexão.</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {profile.groups.map(g => (
                      <div key={g.id} onClick={() => setActiveGroupId(g.id)} className="p-10 bg-neutral-900/30 border border-white/5 rounded-[3rem] flex justify-between items-center group cursor-pointer hover:border-white/20 transition-all">
                        <div className="flex items-center gap-6">
                          {g.photoUrl ? (
                            <img src={g.photoUrl} className="w-16 h-16 rounded-[1.5rem] object-cover border border-white/10" alt="Group" />
                          ) : (
                            <div className="w-16 h-16 rounded-[1.5rem] bg-neutral-800 flex items-center justify-center text-xl font-thin tracking-tighter">
                              {g.name.charAt(0)}
                            </div>
                          )}
                          <div className="space-y-2">
                            <h3 className="text-xl font-light tracking-widest uppercase">{g.name}</h3>
                            <p className="text-[10px] text-neutral-600 uppercase font-bold">{g.members.length} ecos conectados</p>
                            <p className="text-[9px] text-neutral-400 italic truncate max-w-[150px]">{g.lastMessage}</p>
                          </div>
                        </div>
                        <div className="flex -space-x-4">
                          {g.members.slice(0, 3).map(m => (
                            <div key={m.id} className="w-10 h-10 rounded-full border-2 border-black overflow-hidden flex items-center justify-center" style={{ background: m.avatarColor }}>
                               {m.avatarUrl && <img src={m.avatarUrl} className="w-full h-full object-cover" alt="" />}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              activeGroup && (
                <div className="flex flex-col h-[750px] bg-neutral-950/50 backdrop-blur-3xl border border-white/5 rounded-[4rem] overflow-hidden shadow-2xl relative">
                  <header className="p-10 border-b border-white/5 flex items-center justify-between bg-black/40">
                    <div className="flex items-center gap-6">
                      <button onClick={() => setActiveGroupId(null)} className="w-12 h-12 flex items-center justify-center rounded-full bg-white/5 hover:bg-white hover:text-black transition-all">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                      </button>
                      <div className="relative group cursor-pointer" onClick={() => groupPhotoInputRef.current?.click()}>
                        {activeGroup.photoUrl ? (
                          <img src={activeGroup.photoUrl} className="w-14 h-14 rounded-2xl object-cover border border-white/10" alt="Group" />
                        ) : (
                          <div className="w-14 h-14 rounded-2xl bg-neutral-800 flex items-center justify-center text-xs font-bold">{activeGroup.name.charAt(0)}</div>
                        )}
                        <div className="absolute inset-0 bg-black/60 rounded-2xl opacity-0 group-hover:opacity-100 flex items-center justify-center text-[8px] font-bold uppercase transition-opacity">Trocar</div>
                        <input type="file" ref={groupPhotoInputRef} className="hidden" onChange={handleChangeGroupPhoto} />
                      </div>
                      <div>
                        <h2 className="text-xl font-thin tracking-[0.2em] uppercase">{activeGroup.name}</h2>
                        <div className="flex gap-4 mt-2">
                          <button onClick={() => setGroupViewTab('Chat')} className={`text-[9px] uppercase tracking-widest font-bold ${groupViewTab === 'Chat' ? 'text-white' : 'text-neutral-600'}`}>Conversa</button>
                          <button onClick={() => setGroupViewTab('Membros')} className={`text-[9px] uppercase tracking-widest font-bold ${groupViewTab === 'Membros' ? 'text-white' : 'text-neutral-600'}`}>Membros ({activeGroup.members.length})</button>
                        </div>
                      </div>
                    </div>
                  </header>

                  <div className="flex-grow overflow-hidden flex flex-col">
                    {groupViewTab === 'Chat' ? (
                      <>
                        <div className="flex-grow p-10 overflow-y-auto space-y-8 scrollbar-hide">
                          {activeGroup.messages.map(msg => (
                            <div key={msg.id} className={`flex gap-5 animate-fade-in ${msg.userName === profile.name ? 'flex-row-reverse' : ''}`}>
                              <div className="w-10 h-10 rounded-xl bg-neutral-800 flex-shrink-0"></div>
                              <div className={`max-w-[70%] ${msg.userName === profile.name ? 'text-right' : ''}`}>
                                <p className="text-[10px] font-bold tracking-widest text-neutral-500 mb-2 uppercase">{msg.userName}</p>
                                <div className={`p-5 rounded-3xl border border-white/5 ${msg.userName === profile.name ? 'bg-white text-black rounded-tr-none' : 'bg-neutral-900/40 rounded-tl-none'}`}>
                                  <p className="text-sm font-light leading-relaxed">{msg.text}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="p-10 border-t border-white/5 bg-black/40 flex gap-5">
                          <input 
                            type="text" 
                            placeholder="Sintonizar mensagem..." 
                            value={chatMessage} 
                            onChange={e => setChatMessage(e.target.value)} 
                            onKeyDown={e => e.key === 'Enter' && handleSendGroupMessage()} 
                            className="flex-grow bg-neutral-900/50 rounded-full px-10 py-5 text-sm focus:outline-none border border-white/5 focus:border-white/20 transition-all" 
                          />
                          <button onClick={handleSendGroupMessage} className="bg-white text-black px-10 rounded-full text-[11px] font-bold uppercase tracking-widest hover:scale-105 transition-all">Enviar</button>
                        </div>
                      </>
                    ) : (
                      <div className="p-10 space-y-6 overflow-y-auto scrollbar-hide">
                        <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-neutral-600">Composição do Núcleo</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {activeGroup.members.map(member => (
                            <div key={member.id} className="p-6 bg-white/5 border border-white/5 rounded-3xl flex items-center justify-between group">
                              <div className="flex items-center gap-5">
                                <div className="w-12 h-12 rounded-full border border-white/5 shadow-lg flex-shrink-0 overflow-hidden flex items-center justify-center" style={{ background: member.avatarColor }}>
                                  {member.avatarUrl && <img src={member.avatarUrl} className="w-full h-full object-cover" alt="" />}
                                </div>
                                <span className="text-sm font-bold tracking-widest uppercase">{member.name}</span>
                              </div>
                              <button onClick={() => handleRemoveMember(activeGroupId!, member.id)} className="text-[9px] uppercase tracking-widest text-red-500/30 font-bold hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">Remover</button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )
            )}
          </div>
        )}

        {activeTab === 'Participações' && (
          <div className="max-w-4xl mx-auto fade-in">
            {!activeParticipationId ? (
              <div className="space-y-12">
                <header className="border-b border-white/5 pb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                  <div>
                    <h2 className="text-sm uppercase tracking-[0.5em] font-bold">Resonâncias Temáticas</h2>
                    <p className="text-neutral-500 text-xs mt-3 italic">Participe de discussões efémeras sobre fluxos de consciência coletiva.</p>
                  </div>
                  <div className="relative w-full md:w-80">
                    <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                      <svg className="w-4 h-4 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </div>
                    <input 
                      type="text" 
                      placeholder="Pesquisar pautas..." 
                      value={participationSearch}
                      onChange={(e) => setParticipationSearch(e.target.value)}
                      className="w-full bg-neutral-900/50 border border-white/5 rounded-full py-4 pl-12 pr-6 text-sm focus:outline-none focus:border-white/20 transition-all placeholder:text-neutral-700"
                    />
                  </div>
                </header>
                <div className="grid grid-cols-1 gap-6">
                  {filteredParticipations.length > 0 ? filteredParticipations.map(p => (
                    <div key={p.id} className="p-10 bg-neutral-900/20 border border-white/5 rounded-[3rem] flex items-center justify-between group hover:border-white/20 transition-all">
                      <div className="space-y-3">
                        <div className="flex items-center gap-4">
                          <span className="text-neutral-600 font-mono text-xs"># {p.id.padStart(2, '0')}</span>
                          <h3 className="text-2xl font-thin tracking-widest uppercase text-white">{p.topic}</h3>
                        </div>
                        <p className="text-sm text-neutral-400 font-light max-w-xl">{p.description}</p>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                          <span className="text-[9px] uppercase tracking-widest font-bold text-neutral-600">{p.activeCount} ecos ressonando agora</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => setActiveParticipationId(p.id)} 
                        className="px-12 py-5 bg-white text-black rounded-full text-[10px] font-bold uppercase tracking-widest hover:scale-110 transition-all shadow-xl"
                      >
                        Participar
                      </button>
                    </div>
                  )) : (
                    <div className="py-20 text-center border border-dashed border-white/10 rounded-[3rem]">
                      <p className="text-neutral-600 italic">Nenhum fluxo encontrado com este termo.</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              activeParticipation && (
                <div className="flex flex-col h-[750px] bg-neutral-950/50 backdrop-blur-3xl border border-white/5 rounded-[4rem] overflow-hidden shadow-2xl relative">
                  <header className="p-10 border-b border-white/5 flex items-center justify-between bg-black/40">
                    <div className="flex items-center gap-6">
                      <div className="flex flex-col">
                        <span className="text-neutral-600 font-mono text-[9px] uppercase tracking-widest mb-1">Ressonância Ativa</span>
                        <h2 className="text-2xl font-thin tracking-[0.3em] uppercase text-white">{activeParticipation.topic}</h2>
                      </div>
                    </div>
                    <button 
                      onClick={() => setActiveParticipationId(null)} 
                      className="px-10 py-4 border border-red-500/20 text-red-500/60 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all"
                    >
                      Sair do Fluxo
                    </button>
                  </header>

                  <div className="flex-grow overflow-y-auto p-10 space-y-8 scrollbar-hide">
                    <div className="py-20 text-center text-neutral-700 italic border-b border-dashed border-white/5 mb-10">
                      Você entrou no fluxo de "{activeParticipation.topic}". Sua presença é efémera.
                    </div>
                    {activeParticipation.messages.map(msg => (
                      <div key={msg.id} className={`flex gap-5 animate-fade-in ${msg.userName === profile.name ? 'flex-row-reverse' : ''}`}>
                        <div className="w-10 h-10 rounded-full bg-neutral-900 border border-white/5 flex-shrink-0"></div>
                        <div className={`max-w-[70%] ${msg.userName === profile.name ? 'text-right' : ''}`}>
                          <p className="text-[10px] font-bold tracking-widest text-neutral-600 mb-2 uppercase">{msg.userName === profile.name ? 'Eu' : 'Eco_Anônimo'}</p>
                          <div className={`p-6 rounded-3xl border border-white/5 ${msg.userName === profile.name ? 'bg-white text-black rounded-tr-none' : 'bg-neutral-900/60 rounded-tl-none'}`}>
                            <p className="text-sm font-light leading-relaxed">{msg.text}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-10 border-t border-white/5 bg-black/40 flex gap-5">
                    <input 
                      type="text" 
                      placeholder="Contribuir com o fluxo..." 
                      value={chatMessage} 
                      onChange={e => setChatMessage(e.target.value)} 
                      onKeyDown={e => e.key === 'Enter' && handleSendParticipationMessage()} 
                      className="flex-grow bg-neutral-900/50 rounded-full px-10 py-5 text-sm focus:outline-none border border-white/5 focus:border-white/20 transition-all" 
                    />
                    <button onClick={handleSendParticipationMessage} className="bg-white text-black px-10 rounded-full text-[11px] font-bold uppercase tracking-widest hover:scale-105 transition-all">Transmitir</button>
                  </div>
                </div>
              )
            )}
          </div>
        )}

        {activeTab === 'Dinastia' && (
          !profile.isPremium ? (
            <div className="max-w-2xl mx-auto text-center py-40 space-y-10 fade-in">
              <h2 className="text-5xl font-thin tracking-[0.5em] uppercase">Dinastia</h2>
              <p className="text-neutral-500 italic font-light text-xl">Crie sua soberania de consciência. Exclusivo para o ciclo Premium.</p>
              <button onClick={buyPremium} className="px-16 py-6 border border-yellow-500/40 text-yellow-500 text-[11px] font-bold uppercase tracking-widest rounded-full hover:bg-yellow-500 hover:text-black transition-all">Assinar Premium</button>
            </div>
          ) : profile.createdDynasty ? renderDynastyDashboard(profile.createdDynasty) : (
            <div className="max-w-2xl mx-auto text-center py-40 space-y-12 fade-in">
              <h2 className="text-6xl font-thin tracking-widest uppercase">Forjar Legado</h2>
              <p className="text-neutral-500 text-2xl font-light italic leading-relaxed">Sintonize sua própria soberania para ecos que ressoam with seu propósito.</p>
              <button onClick={() => setIsCreatingDynasty(true)} className="px-16 py-6 bg-white text-black text-[11px] font-bold uppercase tracking-[0.5em] rounded-full hover:scale-105 transition-all shadow-2xl">Iniciar Fundação</button>
            </div>
          )
        )}

        {activeTab === 'Perfil' && (
          <div className="max-w-3xl mx-auto space-y-12 fade-in">
            <div className="overflow-hidden rounded-[4.5rem] transition-all duration-1000 border shadow-2xl relative" 
                 style={{ 
                   background: profile.isPremium && profile.premiumSettings ? getPremiumStyle(profile.premiumSettings.profileType, profile.premiumSettings.profileColor) : '#050505', 
                   borderColor: profile.isPremium && profile.premiumSettings ? (profile.premiumSettings.borderType === 'solid' ? profile.premiumSettings.borderColor : 'transparent') : 'rgba(255,255,255,0.05)',
                   borderWidth: profile.isPremium ? '4px' : '1px'
                 }}>
              
              {profile.isPremium && profile.premiumSettings?.borderType === 'gradient' && (
                <div className="absolute inset-0 rounded-[4.5rem] p-[4px] -m-[4px] pointer-events-none" style={{ background: profile.premiumSettings.borderColor, mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)', WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)', maskComposite: 'xor', WebkitMaskComposite: 'xor' }}></div>
              )}

              <div className="relative h-64 group cursor-pointer overflow-hidden" onClick={() => bannerInputRef.current?.click()}>
                <img src={profile.bannerUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Banner" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[10px] font-bold uppercase tracking-widest transition-opacity backdrop-blur-sm">Alterar Banner</div>
                <input type="file" ref={bannerInputRef} className="hidden" onChange={handleBannerChange} />
              </div>

              <div className="p-16 relative -mt-32">
                <header className="flex flex-col items-center mb-24">
                  <div className="relative group cursor-pointer mb-12" onClick={() => avatarInputRef.current?.click()}>
                    <img src={profile.avatarUrl} className="w-44 h-44 rounded-[4rem] object-cover border-4 shadow-2xl" 
                         style={{ borderColor: profile.isPremium ? profile.premiumSettings?.borderColor : '#050505', backgroundColor: '#050505' }} alt="Avatar" />
                    <div className="absolute inset-0 bg-black/70 rounded-[4rem] opacity-0 group-hover:opacity-100 flex items-center justify-center text-[10px] font-bold uppercase tracking-widest transition-opacity">Alterar Foto</div>
                    <input type="file" ref={avatarInputRef} className="hidden" onChange={handleAvatarChange} />
                  </div>
                  
                  {isEditingProfile ? (
                    <div className="w-full max-w-sm flex flex-col gap-4 animate-fade-in">
                      <input 
                        type="text" 
                        value={tempProfile.name} 
                        onChange={e => setTempProfile(p => ({...p, name: e.target.value}))} 
                        className="bg-neutral-900 border border-white/10 rounded-2xl px-6 py-4 text-center text-xl font-light uppercase tracking-widest focus:outline-none focus:border-white/30"
                        placeholder="Nome de usuário"
                      />
                      <textarea 
                        value={tempProfile.bio} 
                        onChange={e => setTempProfile(p => ({...p, bio: e.target.value}))} 
                        className="bg-neutral-900 border border-white/10 rounded-2xl px-6 py-4 text-center text-sm font-light italic h-24 resize-none focus:outline-none focus:border-white/30"
                        placeholder="Sua bio..."
                      />
                      <div className="flex gap-4">
                        <button onClick={() => setIsEditingProfile(false)} className="flex-1 py-3 border border-white/10 rounded-full text-[10px] font-bold uppercase tracking-widest">Cancelar</button>
                        <button onClick={saveProfileEdits} className="flex-1 py-3 bg-white text-black rounded-full text-[10px] font-bold uppercase tracking-widest">Salvar</button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center group cursor-pointer" onClick={() => { setTempProfile({ name: profile.name, bio: profile.bio }); setIsEditingProfile(true); }}>
                      <h3 className="text-4xl font-thin tracking-[0.4em] uppercase flex items-center justify-center" 
                          style={{ 
                            color: profile.isPremium && profile.premiumSettings?.nameType === 'solid' ? profile.premiumSettings.nameColor : 'inherit',
                            background: profile.isPremium && profile.premiumSettings?.nameType === 'gradient' ? profile.premiumSettings.nameColor : 'none',
                            WebkitBackgroundClip: profile.isPremium && profile.premiumSettings?.nameType === 'gradient' ? 'text' : 'border-box',
                            WebkitTextFillColor: profile.isPremium && profile.premiumSettings?.nameType === 'gradient' ? 'transparent' : 'inherit'
                          }}>
                        {profile.name} {profile.isPremium && <VerifiedBadge color={profile.premiumSettings?.borderColor} />}
                        <svg className="w-4 h-4 ml-4 opacity-0 group-hover:opacity-40 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                      </h3>
                      <p className="text-neutral-500 italic mt-6 text-xl">"{profile.bio}"</p>
                    </div>
                  )}
                  
                  <div className="flex gap-20 mt-16 py-10 border-y border-white/5 w-full justify-center">
                    <button onClick={() => setShowList('followers')} className="text-center group"><div className="text-3xl font-light group-hover:scale-110 transition-transform">{profile.followers.length}</div><div className="text-[10px] uppercase tracking-widest text-neutral-600 font-bold">Seguidores</div></button>
                    <button onClick={() => setShowList('following')} className="text-center group"><div className="text-3xl font-light group-hover:scale-110 transition-transform">{profile.following.length}</div><div className="text-[10px] uppercase tracking-widest text-neutral-600 font-bold">Seguindo</div></button>
                  </div>
                </header>
                <section className="space-y-12">
                  <div className="flex justify-between items-center"><h4 className="text-[11px] uppercase tracking-[0.5em] font-bold text-neutral-500">Galeria de Consciência</h4><button onClick={() => setIsPosting(true)} className="px-8 py-3 bg-white text-black rounded-full text-[9px] font-bold uppercase hover:scale-105 transition-all">Novo Post</button></div>
                  <div className="grid grid-cols-3 gap-4">
                    {profile.gallery.map(g => (
                      <div key={g.id} onClick={() => openGalleryItem(g)} className="aspect-square bg-neutral-900 rounded-[2rem] overflow-hidden cursor-pointer hover:opacity-80 transition-all border border-white/5"><img src={g.media[0].url} className="w-full h-full object-cover" /></div>
                    ))}
                  </div>
                </section>
              </div>
            </div>

            {profile.isPremium && (
              <div className="p-12 bg-neutral-950/50 border border-white/5 rounded-[4rem] space-y-12 fade-in">
                <h3 className="text-xs uppercase tracking-[0.5em] font-bold text-yellow-500/80">Soberania Visual (Premium)</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                  {([
                    { label: 'Cor do Nome', key: 'nameColor', typeKey: 'nameType' },
                    { label: 'Fundo Perfil', key: 'profileColor', typeKey: 'profileType' },
                    { label: 'Cor da Borda', key: 'borderColor', typeKey: 'borderType' }
                  ] as const).map(item => (
                    <div key={item.key} className="space-y-6">
                      <p className="text-[10px] uppercase font-bold tracking-widest text-neutral-500">{item.label}</p>
                      <div className="flex gap-2 p-1 bg-neutral-900 rounded-full">
                        <button onClick={() => updatePremiumType(item.typeKey, 'solid')} className={`flex-1 py-2 text-[9px] font-bold uppercase rounded-full transition-all ${profile.premiumSettings?.[item.typeKey] === 'solid' ? 'bg-white text-black' : 'text-neutral-500'}`}>Sólida</button>
                        <button onClick={() => updatePremiumType(item.typeKey, 'gradient')} className={`flex-1 py-2 text-[9px] font-bold uppercase rounded-full transition-all ${profile.premiumSettings?.[item.typeKey] === 'gradient' ? 'bg-white text-black' : 'text-neutral-500'}`}>Degradê</button>
                      </div>
                      <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between bg-neutral-900/40 p-4 rounded-2xl border border-white/5">
                          <span className="text-[9px] uppercase font-bold text-neutral-600">Cor Principal</span>
                          <input 
                            type="color" 
                            className="w-10 h-10 bg-transparent border-none cursor-pointer"
                            value={profile.premiumSettings?.[item.key].startsWith('linear') ? '#ffffff' : profile.premiumSettings?.[item.key]}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (profile.premiumSettings?.[item.typeKey] === 'solid') {
                                updatePremiumColor(item.key, val);
                              } else {
                                updatePremiumColor(item.key, `linear-gradient(45deg, ${val}, #000000)`);
                              }
                            }}
                          />
                        </div>
                        {profile.premiumSettings?.[item.typeKey] === 'gradient' && (
                           <div className="flex items-center justify-between bg-neutral-900/40 p-4 rounded-2xl border border-white/5">
                            <span className="text-[9px] uppercase font-bold text-neutral-600">Cor Secundária</span>
                            <input 
                              type="color" 
                              className="w-10 h-10 bg-transparent border-none cursor-pointer"
                              onChange={(e) => {
                                const mainColor = profile.premiumSettings?.[item.key].match(/#[a-fA-F0-9]{6}/)?.[0] || '#ffffff';
                                updatePremiumColor(item.key, `linear-gradient(45deg, ${mainColor}, ${e.target.value})`);
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'Configurações' && (
          <div className="max-w-md mx-auto py-20 space-y-20 fade-in">
            <div className="space-y-8">
              <h3 className="text-xs uppercase tracking-[0.5em] text-neutral-600 font-bold border-b border-white/5 pb-6">Protocolos Sociais</h3>
              {[{ label: 'Perfil Público', key: 'isPublic' }, { label: 'Mensagens', key: 'allowMessages' }, { label: 'Grupos', key: 'allowGroups' }, { label: 'Convites Dinastia', key: 'allowDynastyInvites' }].map(item => (
                <div key={item.key} className="flex items-center justify-between p-7 bg-neutral-900/30 rounded-[2rem] border border-white/5">
                  <span className="text-sm tracking-widest uppercase font-bold text-neutral-400">{item.label}</span>
                  <button onClick={() => setSettings(p => ({...p, [item.key]: !p[item.key as keyof UserSettings]}))} className={`w-14 h-7 rounded-full relative transition-all ${settings[item.key as keyof UserSettings] ? 'bg-white' : 'bg-neutral-800'}`}><div className={`absolute top-1 w-5 h-5 rounded-full transition-all ${settings[item.key as keyof UserSettings] ? 'right-1 bg-black' : 'left-1 bg-neutral-600'}`}></div></button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Modal Seguidores/Seguindo */}
      {showList && (
           <div className="fixed inset-0 z-[400] bg-black/95 flex items-center justify-center p-8" onClick={() => setShowList(null)}>
            <div className="bg-[#050505] border border-white/5 rounded-[4rem] p-14 max-w-sm w-full max-h-[85vh] flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
              <h3 className="text-[12px] uppercase tracking-[0.5em] mb-12 text-neutral-600 font-bold border-b border-white/5 pb-8">{showList === 'followers' ? 'Seguidores' : 'Seguindo'}</h3>
              <div className="overflow-y-auto space-y-8 scrollbar-hide">
                {(showList === 'followers' ? profile.followers : profile.following).map(user => (
                  <div key={user.id} className="flex items-center gap-6 group cursor-pointer" onClick={() => { setViewingProfile(user); setShowList(null); }}>
                    <div className="w-14 h-14 rounded-full border border-white/5 shadow-lg flex-shrink-0 overflow-hidden flex items-center justify-center" style={{ backgroundColor: user.avatarColor }}>
                      {user.avatarUrl ? (
                        <img src={user.avatarUrl} className="w-full h-full object-cover" alt="" />
                      ) : (
                        <div className="w-full h-full bg-neutral-800 flex items-center justify-center text-[10px] font-bold text-neutral-600">{user.name.charAt(0)}</div>
                      )}
                    </div>
                    <div className="flex-grow overflow-hidden"><p className="text-sm font-bold tracking-widest uppercase truncate">{user.name}</p></div>
                    <button className="text-[10px] uppercase tracking-widest text-neutral-600 border border-white/5 px-5 py-2.5 rounded-full font-bold group-hover:text-white group-hover:bg-white/5 transition-all">Ver</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      {/* Outros Modais (Criação de Dinastia, Grupo, Postagem, Perfil Externo, etc) permanencem aqui... */}
      {isCreatingDynasty && (
        <div className="fixed inset-0 z-[400] bg-black/95 backdrop-blur-3xl flex items-center justify-center p-8 overflow-y-auto" onClick={() => setIsCreatingDynasty(false)}>
          <div className="bg-[#050505] border border-white/10 rounded-[4.5rem] p-16 max-w-2xl w-full shadow-[0_0_100px_rgba(0,0,0,0.5)] my-10" onClick={e => e.stopPropagation()}>
            <h3 className="text-5xl font-thin tracking-widest text-center mb-16 uppercase">Fundar Dinastia</h3>
            <div className="space-y-12">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1 space-y-3">
                  <label className="text-[10px] uppercase font-bold text-neutral-600">Brasão</label>
                  <div onClick={() => dynastyPhotoRef.current?.click()} className="h-44 bg-neutral-900/50 rounded-[2.5rem] border border-dashed border-white/10 flex items-center justify-center cursor-pointer overflow-hidden hover:border-white/30 transition-all">
                    {newDynasty.photoUrl ? <img src={newDynasty.photoUrl} className="w-full h-full object-cover" alt="Legado" /> : <span className="text-[10px] uppercase font-bold text-neutral-700">Foto</span>}
                  </div>
                  <input type="file" ref={dynastyPhotoRef} className="hidden" onChange={e => handleDynastyFileChange(e, 'photo')} />
                </div>
                <div className="flex-[2] space-y-3">
                  <label className="text-[10px] uppercase font-bold text-neutral-600">Território (Banner)</label>
                  <div onClick={() => dynastyBannerRef.current?.click()} className="h-44 bg-neutral-900/50 rounded-[2.5rem] border border-dashed border-white/10 flex items-center justify-center cursor-pointer overflow-hidden hover:border-white/30 transition-all">
                    {newDynasty.bannerUrl ? <img src={newDynasty.bannerUrl} className="w-full h-full object-cover" alt="Banner" /> : <span className="text-[10px] uppercase font-bold text-neutral-700">Banner</span>}
                  </div>
                  <input type="file" ref={dynastyBannerRef} className="hidden" onChange={e => handleDynastyFileChange(e, 'banner')} />
                </div>
              </div>
              <div className="space-y-6">
                <input type="text" placeholder="Nome..." value={newDynasty.name} onChange={e => setNewDynasty(p => ({...p, name: e.target.value}))} className="w-full bg-neutral-900 border border-white/5 rounded-3xl px-10 py-6 text-xl font-light focus:outline-none focus:border-white/20" />
                <textarea placeholder="Propósito..." value={newDynasty.purpose} onChange={e => setNewDynasty(p => ({...p, purpose: e.target.value}))} className="w-full bg-neutral-900 border border-white/5 rounded-3xl px-10 py-6 text-lg h-44 resize-none focus:outline-none focus:border-white/20" />
              </div>
              <button onClick={handleDynastyCreation} className="w-full py-8 bg-white text-black rounded-full font-bold uppercase tracking-[0.5em] text-xs hover:scale-105 transition-all shadow-2xl">Estabelecer</button>
            </div>
          </div>
        </div>
      )}

      {isCreatingGroup && (
        <div className="fixed inset-0 z-[400] bg-black/95 backdrop-blur-3xl flex items-center justify-center p-8 overflow-y-auto" onClick={() => setIsCreatingGroup(false)}>
          <div className="bg-[#050505] border border-white/10 rounded-[4rem] p-16 max-w-lg w-full shadow-2xl my-10" onClick={e => e.stopPropagation()}>
            <h3 className="text-4xl font-thin tracking-widest text-center mb-12 uppercase">Estabelecer Núcleo</h3>
            <div className="space-y-10">
              <div className="flex justify-center">
                <div onClick={() => groupPhotoInputRef.current?.click()} className="w-32 h-32 bg-neutral-900 rounded-[2rem] border border-dashed border-white/20 flex flex-col items-center justify-center cursor-pointer hover:border-white/40 overflow-hidden relative group">
                  {newGroupPhoto ? (
                    <img src={newGroupPhoto} className="w-full h-full object-cover" alt="Group" />
                  ) : (
                    <>
                      <svg className="w-8 h-8 text-neutral-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" /></svg>
                      <span className="text-[8px] uppercase font-bold text-neutral-700">Foto do Grupo</span>
                    </>
                  )}
                  <input type="file" ref={groupPhotoInputRef} className="hidden" onChange={handleGroupPhotoChange} />
                </div>
              </div>
              <input 
                type="text" 
                placeholder="Título do Grupo..." 
                value={newGroupName} 
                onChange={e => setNewGroupName(e.target.value)} 
                className="w-full bg-neutral-900 border border-white/5 rounded-3xl px-8 py-6 text-xl font-light focus:outline-none focus:border-white/20" 
              />
              <div className="space-y-4">
                <p className="text-[10px] uppercase font-bold text-neutral-600 tracking-widest">Selecionar Ecos ({selectedMembers.size})</p>
                <div className="max-h-72 overflow-y-auto space-y-2 pr-3 scrollbar-hide">
                  {profile.followers.map(f => (
                    <div key={f.id} 
                         onClick={() => toggleMemberSelection(f.id)} 
                         className={`p-5 rounded-[2rem] flex items-center gap-5 cursor-pointer border transition-all ${selectedMembers.has(f.id) ? 'bg-white/10 border-white/20' : 'bg-white/5 border-transparent hover:border-white/10'}`}>
                      <div className="w-12 h-12 rounded-full shadow-lg flex-shrink-0 overflow-hidden flex items-center justify-center" style={{ backgroundColor: f.avatarColor }}>
                        {f.avatarUrl && <img src={f.avatarUrl} className="w-full h-full object-cover" alt="" />}
                      </div>
                      <span className="text-sm font-bold tracking-widest">{f.name}</span>
                      {selectedMembers.has(f.id) && <div className="ml-auto w-3 h-3 rounded-full bg-white shadow-[0_0_15px_rgba(255,255,255,0.5)]"></div>}
                    </div>
                  ))}
                </div>
              </div>
              <button onClick={handleCreateGroup} className="w-full py-7 bg-white text-black rounded-full font-bold uppercase tracking-[0.4em] text-[10px] hover:scale-105 transition-all shadow-2xl">Conectar Núcleo</button>
            </div>
          </div>
        </div>
      )}

      {isPosting && (
        <div className="fixed inset-0 z-[400] bg-black/98 flex items-center justify-center p-8" onClick={() => setIsPosting(false)}>
          <div className="bg-[#050505] border border-white/10 rounded-[4rem] p-16 max-w-2xl w-full shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-4xl font-thin tracking-widest text-center mb-12 uppercase">Nova Ressonância</h3>
            <div className="space-y-10">
              <div className="flex flex-wrap gap-4 items-center justify-center py-6 min-h-[140px] bg-neutral-900/20 rounded-[3rem] border border-white/5">
                {pendingMedia.map((media, idx) => (
                  <div key={idx} className="relative w-24 h-24 rounded-2xl overflow-hidden border border-white/10 shadow-xl group animate-fade-in">
                    <img src={media.url} className="w-full h-full object-cover" alt="Preview" />
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setPendingMedia(prev => prev.filter((_, i) => i !== idx));
                      }}
                      className="absolute top-1.5 right-1.5 bg-black/70 rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/80"
                    >
                      <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
                {pendingMedia.length < 7 && (
                  <div 
                    onClick={() => galleryInputRef.current?.click()} 
                    className="w-24 h-24 rounded-2xl border-2 border-dashed border-white/10 hover:border-white/30 hover:bg-white/5 transition-all flex flex-col items-center justify-center cursor-pointer group"
                  >
                    <svg className="w-7 h-7 text-neutral-700 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span className="text-[9px] uppercase font-bold mt-2 text-neutral-700 group-hover:text-white select-none tracking-widest">Novo</span>
                  </div>
                )}
              </div>
              <input type="file" ref={galleryInputRef} className="hidden" multiple onChange={handleGalleryFiles} />
              <textarea 
                placeholder="Legenda da ideia..." 
                value={newPostCaption} 
                onChange={e => setNewPostCaption(e.target.value)} 
                className="w-full bg-neutral-900/50 border border-white/5 rounded-3xl p-10 text-xl font-light h-48 resize-none focus:ring-1 focus:ring-white/10 focus:outline-none transition-all" 
              />
              <div className="flex gap-4">
                <button onClick={() => setIsPosting(false)} className="flex-1 py-7 border border-white/10 text-neutral-500 rounded-full font-bold uppercase tracking-[0.4em] text-[10px] hover:text-white hover:bg-white/5 transition-all">Desistir</button>
                <button onClick={handleAddPost} className="flex-[2] py-7 bg-white text-black rounded-full font-bold uppercase tracking-[0.5em] text-[10px] hover:scale-105 transition-all shadow-xl shadow-white/5">Gravar no Mural</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {viewingProfile && (
        <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-3xl flex items-center justify-center p-6" onClick={() => setViewingProfile(null)}>
          <div className="bg-[#050505] border rounded-[4rem] p-16 max-w-lg w-full relative shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-y-auto max-h-[90vh] transition-all duration-700" 
               style={{ 
                 borderColor: viewingProfile.isPremium ? viewingProfile.premiumSettings?.borderColor : '#1a1a1a', 
                 background: viewingProfile.isPremium && viewingProfile.premiumSettings ? getPremiumStyle(viewingProfile.premiumSettings.profileType, viewingProfile.premiumSettings.profileColor) : '#050505',
               }}
               onClick={e => e.stopPropagation()}>
            <button onClick={() => setViewingProfile(null)} className="absolute top-10 right-10 w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white hover:text-black transition-all">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <div className="text-center mb-10">
              <div className="w-32 h-32 mx-auto rounded-full mb-10 border-2 shadow-2xl overflow-hidden flex items-center justify-center" style={{ backgroundColor: viewingProfile.avatarColor, borderColor: viewingProfile.isPremium ? viewingProfile.premiumSettings?.borderColor : '#333' }}>
                {viewingProfile.avatarUrl && <img src={viewingProfile.avatarUrl} className="w-full h-full object-cover" alt="" />}
              </div>
              <h3 className="text-4xl font-light tracking-widest flex items-center justify-center uppercase" style={{ color: viewingProfile.isPremium ? viewingProfile.premiumSettings?.nameColor : '#fff' }}>
                {viewingProfile.name}
                {viewingProfile.isPremium && <VerifiedBadge color={viewingProfile.premiumSettings?.borderColor} />}
              </h3>
              <p className="text-neutral-500 text-lg italic mt-6">"{viewingProfile.bio}"</p>
            </div>
            <div className="flex gap-4 mb-12">
              <button onClick={() => toggleFollow(viewingProfile)} className={`flex-1 py-6 rounded-full text-[11px] uppercase tracking-widest font-bold transition-all ${profile.following.some(f => f.id === viewingProfile.id) ? 'border border-white/10 text-white' : 'bg-white text-black'}`}>
                {profile.following.some(f => f.id === viewingProfile.id) ? 'Largar' : (pendingRequests.has(viewingProfile.id) ? 'Solicitação enviada' : (viewingProfile.isPrivate ? 'Solicitar' : 'Seguir'))}
              </button>
              <button className="flex-1 py-6 border border-white/5 rounded-full text-[11px] uppercase tracking-widest font-bold text-neutral-400">Mensagem</button>
            </div>
            <div className="space-y-8">
              <h4 className="text-[10px] uppercase tracking-widest text-neutral-600 font-bold">Publicações</h4>
              {viewingProfile.isPrivate && !profile.following.some(f => f.id === viewingProfile.id) ? (
                <div className="py-20 text-center border border-dashed border-white/5 rounded-[3rem] bg-neutral-900/20"><p className="text-xs text-neutral-600 uppercase tracking-widest">Este núcleo é restrito.</p></div>
              ) : (
                <div className="grid grid-cols-3 gap-3">
                  {viewingProfile.gallery?.map(item => (
                    <div key={item.id} className="aspect-square bg-neutral-900 rounded-2xl overflow-hidden cursor-pointer hover:opacity-70 transition-opacity" onClick={() => openGalleryItem(item)}><img src={item.media[0].url} className="w-full h-full object-cover" alt="Thumb" /></div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeGalleryItem && (
        <div className="fixed inset-0 z-[450] bg-black flex flex-col md:flex-row animate-fade-in" onClick={() => setActiveGalleryItem(null)}>
          <div className="flex-grow bg-[#000] flex items-center justify-center p-8 relative overflow-hidden" onClick={e => e.stopPropagation()}>
            <button onClick={() => setActiveGalleryItem(null)} className="absolute top-8 right-8 z-[500] w-12 h-12 flex items-center justify-center rounded-full bg-black/40 border border-white/10 hover:bg-white hover:text-black transition-all group">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            {activeGalleryItem.media.length > 1 && (
              <>
                <button onClick={prevMedia} className="absolute left-6 z-[460] w-14 h-14 flex items-center justify-center rounded-full bg-black/20 border border-white/5 hover:bg-white hover:text-black transition-all backdrop-blur-sm group"><svg className="w-8 h-8 transform group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" /></svg></button>
                <button onClick={nextMedia} className="absolute right-6 z-[460] w-14 h-14 flex items-center justify-center rounded-full bg-black/20 border border-white/5 hover:bg-white hover:text-black transition-all backdrop-blur-sm group"><svg className="w-8 h-8 transform group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" /></svg></button>
              </>
            )}
            <div className="relative w-full h-full flex items-center justify-center">
              <img key={activeMediaIndex} src={activeGalleryItem.media[activeMediaIndex].url} className="max-w-full max-h-full rounded-[3rem] shadow-[0_0_80px_rgba(0,0,0,0.8)] border border-white/5 animate-fade-in" alt="Post Content" />
              {activeGalleryItem.media.length > 1 && (<div className="absolute bottom-6 flex gap-2">{activeGalleryItem.media.map((_, idx) => (<div key={idx} className={`w-1.5 h-1.5 rounded-full transition-all ${idx === activeMediaIndex ? 'bg-white w-4' : 'bg-white/20'}`} />))}</div>)}
            </div>
          </div>
          <div className="w-full md:w-[500px] bg-[#050505] border-l border-white/5 p-16 flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="border-b border-white/5 pb-12 mb-12 flex flex-col gap-6">
              <div className="flex items-center gap-4"><div className="w-10 h-10 rounded-full bg-neutral-900 border border-white/5"></div><h3 className="text-2xl font-thin tracking-widest uppercase">{activeGalleryItem.authorName}</h3></div>
              <p className="text-xl font-light text-neutral-400 italic leading-relaxed">"{activeGalleryItem.caption}"</p>
              <span className="text-[9px] uppercase tracking-widest text-neutral-600 font-bold">{activeMediaIndex + 1} / {activeGalleryItem.media.length} REGISTROS</span>
            </div>
            <button onClick={() => setActiveGalleryItem(null)} className="mt-auto py-6 border border-white/10 rounded-full text-[10px] uppercase tracking-widest font-bold hover:bg-white hover:text-black transition-all shadow-xl">Sair do Foco</button>
          </div>
        </div>
      )}

      <footer className="fixed bottom-0 left-0 w-full py-8 pointer-events-none opacity-5">
        <p className="text-center text-[10px] uppercase tracking-[3.5em] font-bold select-none italic">Fluxo Permanente</p>
      </footer>

      <style>{`
        @keyframes bounceHorizontal {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(10px); }
        }
        .animate-bounce-horizontal {
          animation: bounceHorizontal 1.5s infinite;
        }
      `}</style>
    </div>
  );
};

export default App;
