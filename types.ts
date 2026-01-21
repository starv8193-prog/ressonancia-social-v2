export interface ResonanceResponse {
  socialInfo: string;
  collectiveObservation: string;
  movementNote: string;
}

export interface Comment {
  id: string;
  userName: string;
  text: string;
  timestamp: number;
}

export interface MediaFile {
  url: string;
  type: 'image' | 'video' | 'gif';
}

export interface GalleryItem {
  id: string;
  media: MediaFile[]; // Máximo 7
  caption: string;
  comments: Comment[];
  timestamp: number;
  authorName?: string;
  authorAvatar?: string;
}

export interface PremiumSettings {
  borderColor: string;
  profileColor: string;
  appColor: string;
  nameColor: string;
  borderType: 'solid' | 'gradient';
  profileType: 'solid' | 'gradient';
  nameType: 'solid' | 'gradient';
}

export interface DynastyRole {
  id: string;
  name: string;
  color: string;
}

export interface DynastyMessage {
  id: string;
  userName: string;
  userRole?: DynastyRole;
  text: string;
  timestamp: number;
}

export interface Dynasty {
  id: string;
  name: string;
  photoUrl: string;
  bannerUrl: string;
  purpose: string;
  isPublic: boolean;
  roles: DynastyRole[];
  members: EchoProfile[];
  feed: GalleryItem[];
  chat: DynastyMessage[];
}

export interface Group {
  id: string;
  name: string;
  photoUrl?: string;
  members: EchoProfile[];
  messages: DynastyMessage[];
  lastMessage?: string;
}

export interface Participation {
  id: string;
  topic: string;
  description: string;
  activeCount: number;
  messages: DynastyMessage[];
}

export interface UserProfile {
  name: string;
  bio: string;
  avatarUrl: string;
  bannerUrl: string;
  isPremium: boolean;
  premiumSettings?: PremiumSettings;
  followers: EchoProfile[];
  following: EchoProfile[];
  gallery: GalleryItem[];
  createdDynasty?: Dynasty;
  groups: Group[];
}

export interface UserSettings {
  isPublic: boolean;
  allowMessages: boolean;
  allowGroups: boolean;
  allowDynastyInvites: boolean;
}

export interface EchoProfile {
  id: string;
  name: string;
  bio: string;
  isPublic: boolean;
  isPrivate?: boolean;
  isPremium?: boolean;
  premiumSettings?: PremiumSettings;
  avatarColor: string;
  avatarUrl?: string;
  gallery?: GalleryItem[];
}

export interface HistoryItem {
  id: string;
  original: string;
  response: ResonanceResponse;
  timestamp: number;
  relatedEchoes: EchoProfile[];
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  token: string;
}

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

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