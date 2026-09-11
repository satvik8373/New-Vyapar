import {
  signInAnonymously,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  updateProfile,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  User
} from 'firebase/auth';
import { auth } from './firebaseConfig';
import { UserService, UserProfileDoc } from './userService';

const LOCAL_STORAGE_PLAYER_NAME = 'navo_player_name';
const LOCAL_STORAGE_AVATAR = 'navo_player_avatar';

export interface PlayerProfile {
  uid: string;
  name: string;
  avatar: string;
  isAnonymous: boolean;
  photoURL?: string | null;
  coins?: number;
  points?: number;
  level?: number;
  rankTitle?: string;
}

export class AuthService {
  private static instance: AuthService;
  private currentUserProfile: PlayerProfile | null = null;
  private authListeners: Set<(profile: PlayerProfile | null) => void> = new Set();

  private constructor() {
    onAuthStateChanged(auth, async (user: User | null) => {
      if (user) {
        localStorage.setItem('navo_user_uid', user.uid);
        localStorage.setItem('navo_logged_in', 'true');
        const savedName = localStorage.getItem(LOCAL_STORAGE_PLAYER_NAME);
        const savedAvatar = localStorage.getItem(LOCAL_STORAGE_AVATAR) || 'crown';
        const name = user.displayName || savedName || `Merchant ${user.uid.slice(0, 4).toUpperCase()}`;

        // Fetch or create official Firestore user database document
        const userDoc: UserProfileDoc = await UserService.getInstance().getOrCreateUserProfile(
          user.uid,
          name,
          savedAvatar,
          user.email
        );

        this.currentUserProfile = {
          uid: user.uid,
          name: userDoc.displayName || name,
          avatar: userDoc.avatar || savedAvatar,
          isAnonymous: user.isAnonymous,
          photoURL: user.photoURL,
          coins: userDoc.coins,
          points: userDoc.points,
          level: userDoc.level,
          rankTitle: userDoc.rankTitle
        };
      } else {
        this.currentUserProfile = null;
      }
      this.notifyListeners();
    });
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  public getCurrentProfile(): PlayerProfile | null {
    return this.currentUserProfile;
  }

  public getUid(): string {
    if (this.currentUserProfile?.uid) return this.currentUserProfile.uid;
    if (auth.currentUser?.uid) return auth.currentUser.uid;
    const stored = localStorage.getItem('navo_user_uid');
    if (stored) return stored;
    let guest = localStorage.getItem('navo_guest_id');
    if (!guest) {
      guest = 'g_' + Math.random().toString(36).substring(2, 10) + '_' + Date.now().toString(36);
      localStorage.setItem('navo_guest_id', guest);
    }
    return guest;
  }

  public isLoggedIn(): boolean {
    return Boolean(
      this.currentUserProfile ||
      auth.currentUser ||
      localStorage.getItem('navo_logged_in') === 'true'
    );
  }

  public subscribeAuth(listener: (profile: PlayerProfile | null) => void): () => void {
    this.authListeners.add(listener);
    listener(this.currentUserProfile);
    return () => this.authListeners.delete(listener);
  }

  private notifyListeners(): void {
    this.authListeners.forEach((l) => l(this.currentUserProfile));
  }

  /**
   * Seamless Anonymous Authentication - instant frictionless play with database persistence
   */
  public async signInGuest(playerName: string = 'Trader', avatar: string = 'crown'): Promise<PlayerProfile> {
    try {
      localStorage.setItem(LOCAL_STORAGE_PLAYER_NAME, playerName);
      localStorage.setItem(LOCAL_STORAGE_AVATAR, avatar);

      let user = auth.currentUser;
      if (!user) {
        try {
          const cred = await signInAnonymously(auth);
          user = cred.user;
        } catch (anonErr: any) {
          console.warn('Anonymous auth not enabled in Firebase Console, using seamless guest account:', anonErr);
          // Fallback: seamless guest email/password account
          let guestUid = localStorage.getItem('navo_guest_id');
          if (!guestUid) {
            guestUid = 'g_' + Math.random().toString(36).substring(2, 10);
            localStorage.setItem('navo_guest_id', guestUid);
          }
          const guestEmail = `${guestUid}@navovyapar.internal`;
          const guestPass = 'NavoGuest@2026!';

          try {
            const cred = await signInWithEmailAndPassword(auth, guestEmail, guestPass);
            user = cred.user;
          } catch {
            const cred = await createUserWithEmailAndPassword(auth, guestEmail, guestPass);
            user = cred.user;
          }
        }
      }

      if (user) {
        await updateProfile(user, { displayName: playerName }).catch(() => { });
      }

      // Initialize or update user record
      const uid = user ? user.uid : (localStorage.getItem('navo_guest_id') || 'guest_' + Date.now());
      const userDoc = await UserService.getInstance().getOrCreateUserProfile(
        uid,
        playerName,
        avatar
      );

      localStorage.setItem('navo_user_uid', uid);
      localStorage.setItem('navo_logged_in', 'true');

      this.currentUserProfile = {
        uid,
        name: userDoc.displayName || playerName,
        avatar: userDoc.avatar || avatar,
        isAnonymous: true,
        photoURL: null,
        coins: userDoc.coins,
        points: userDoc.points,
        level: userDoc.level,
        rankTitle: userDoc.rankTitle
      };

      this.notifyListeners();
      return this.currentUserProfile;
    } catch (err) {
      console.error('Failed to sign in as guest, creating local session:', err);
      const fallbackUid = localStorage.getItem('navo_guest_id') || 'guest_' + Date.now();
      localStorage.setItem('navo_guest_id', fallbackUid);
      localStorage.setItem('navo_user_uid', fallbackUid);
      localStorage.setItem('navo_logged_in', 'true');
      this.currentUserProfile = {
        uid: fallbackUid,
        name: playerName,
        avatar: avatar,
        isAnonymous: true,
        photoURL: null,
        coins: 12500,
        points: 150,
        level: 1,
        rankTitle: 'Novice Trader'
      };
      this.notifyListeners();
      return this.currentUserProfile;
    }
  }

  /**
   * Official Google Authentication with database persistence
   */
  public async signInWithGoogle(): Promise<PlayerProfile> {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const savedAvatar = localStorage.getItem(LOCAL_STORAGE_AVATAR) || 'crown';
      const name = user.displayName || 'Gujarat Trader';
      localStorage.setItem(LOCAL_STORAGE_PLAYER_NAME, name);

      const userDoc = await UserService.getInstance().getOrCreateUserProfile(
        user.uid,
        name,
        savedAvatar,
        user.email
      );

      this.currentUserProfile = {
        uid: user.uid,
        name: userDoc.displayName,
        avatar: userDoc.avatar,
        isAnonymous: false,
        photoURL: user.photoURL,
        coins: userDoc.coins,
        points: userDoc.points,
        level: userDoc.level,
        rankTitle: userDoc.rankTitle
      };

      this.notifyListeners();
      return this.currentUserProfile;
    } catch (err) {
      console.error('Failed to sign in with Google:', err);
      throw err;
    }
  }

  /**
   * Update current user profile name and avatar in Auth and Firestore
   */
  public async updatePlayerDetails(name: string, avatar: string): Promise<void> {
    localStorage.setItem(LOCAL_STORAGE_PLAYER_NAME, name);
    localStorage.setItem(LOCAL_STORAGE_AVATAR, avatar);

    if (auth.currentUser) {
      await updateProfile(auth.currentUser, { displayName: name });
      await UserService.getInstance().updateProfileDetails(auth.currentUser.uid, {
        displayName: name,
        avatar
      });
    }

    if (this.currentUserProfile) {
      this.currentUserProfile.name = name;
      this.currentUserProfile.avatar = avatar;
      this.notifyListeners();
    }
  }

  public async signOut(): Promise<void> {
    localStorage.removeItem('navo_logged_in');
    localStorage.removeItem('navo_vyapar_session');
    await signOut(auth);
    this.currentUserProfile = null;
    this.notifyListeners();
  }
}
