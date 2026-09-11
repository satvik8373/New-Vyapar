import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  onSnapshot,
  serverTimestamp,
  Unsubscribe
} from 'firebase/firestore';
import { db } from './firebaseConfig';

export interface UserProfileDoc {
  uid: string;
  displayName: string;
  email?: string | null;
  avatar: string;
  coins: number;
  points: number; // Experience Points (XP)
  level: number;
  rankTitle: string;
  gamesPlayed: number;
  gamesWon: number;
  totalEarnings: number;
  propertiesBought: number;
  friends?: string[]; // Array of friend UIDs
  createdAt: any;
  lastLoginAt: any;
}

export function computeLevelAndRank(points: number): { level: number; rankTitle: string } {
  const level = Math.max(1, Math.floor(points / 250) + 1);
  let rankTitle = 'Novice Trader';
  if (points >= 5000) {
    rankTitle = 'Gujarat Tycoon';
  } else if (points >= 2000) {
    rankTitle = 'Senior Trade Master';
  } else if (points >= 800) {
    rankTitle = 'Gujarat Merchant';
  } else if (points >= 300) {
    rankTitle = 'Junior Merchant';
  }
  return { level, rankTitle };
}

export class UserService {
  private static instance: UserService;
  private cachedProfile: UserProfileDoc | null = null;

  public static getInstance(): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService();
    }
    return UserService.instance;
  }

  /**
   * Get existing user profile or initialize a new one in Firestore
   */
  public async getOrCreateUserProfile(
    uid: string,
    initialName: string = 'Gujarat Trader',
    avatar: string = 'crown',
    email?: string | null
  ): Promise<UserProfileDoc> {
    const userRef = doc(db, 'users', uid);

    try {
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        const data = snap.data() as UserProfileDoc;
        // Update last login
        await updateDoc(userRef, { lastLoginAt: serverTimestamp() }).catch(() => {});
        this.cachedProfile = data;
        return data;
      }

      // Initialize brand new user profile
      const startingPoints = 150;
      const { level, rankTitle } = computeLevelAndRank(startingPoints);
      const newProfile: UserProfileDoc = {
        uid,
        displayName: initialName,
        email: email || null,
        avatar,
        coins: 12500, // Starting capital
        points: startingPoints,
        level,
        rankTitle,
        gamesPlayed: 0,
        gamesWon: 0,
        totalEarnings: 12500,
        propertiesBought: 0,
        createdAt: serverTimestamp(),
        lastLoginAt: serverTimestamp()
      };

      await setDoc(userRef, newProfile);
      this.cachedProfile = newProfile;
      return newProfile;
    } catch (err) {
      console.warn('Firestore user fetch failed, using local profile fallback:', err);
      const fallback: UserProfileDoc = {
        uid,
        displayName: initialName,
        email: null,
        avatar,
        coins: 12500,
        points: 150,
        level: 1,
        rankTitle: 'Novice Trader',
        gamesPlayed: 0,
        gamesWon: 0,
        totalEarnings: 12500,
        propertiesBought: 0,
        createdAt: Date.now(),
        lastLoginAt: Date.now()
      };
      this.cachedProfile = fallback;
      return fallback;
    }
  }

  /**
   * Real-time listener on user profile
   */
  public subscribeUserProfile(
    uid: string,
    onUpdate: (profile: UserProfileDoc) => void
  ): Unsubscribe {
    const userRef = doc(db, 'users', uid);
    return onSnapshot(
      userRef,
      (snap) => {
        if (snap.exists()) {
          const profile = snap.data() as UserProfileDoc;
          this.cachedProfile = profile;
          onUpdate(profile);
        }
      },
      (err) => {
        console.warn('Error subscribing to user profile:', err);
      }
    );
  }

  /**
   * Update name or avatar
   */
  public async updateProfileDetails(
    uid: string,
    updates: { displayName?: string; avatar?: string }
  ): Promise<void> {
    try {
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, {
        ...updates,
        lastLoginAt: serverTimestamp()
      }).catch(() => {});
    } catch (e) {
      console.warn('Firestore profile update skipped:', e);
    }
    if (this.cachedProfile) {
      this.cachedProfile = { ...this.cachedProfile, ...updates };
    }
  }

  /**
   * Record match completion and add points/coins rewards to database
   */
  public async recordGameFinished(
    uid: string,
    stats: {
      won: boolean;
      finalBalance: number;
      propertiesCount: number;
    }
  ): Promise<UserProfileDoc | null> {
    const userRef = doc(db, 'users', uid);
    try {
      const snap = await getDoc(userRef);
      if (!snap.exists()) return null;

      const curr = snap.data() as UserProfileDoc;
      const pointsReward = stats.won ? 350 : 120;
      const coinReward = stats.won ? 2500 : 500;

      const newPoints = curr.points + pointsReward;
      const newCoins = curr.coins + coinReward;
      const newGamesPlayed = curr.gamesPlayed + 1;
      const newGamesWon = stats.won ? curr.gamesWon + 1 : curr.gamesWon;
      const newTotalEarnings = curr.totalEarnings + Math.max(0, stats.finalBalance);
      const newProperties = curr.propertiesBought + stats.propertiesCount;

      const { level, rankTitle } = computeLevelAndRank(newPoints);

      const updatedFields = {
        points: newPoints,
        coins: newCoins,
        level,
        rankTitle,
        gamesPlayed: newGamesPlayed,
        gamesWon: newGamesWon,
        totalEarnings: newTotalEarnings,
        propertiesBought: newProperties,
        lastLoginAt: serverTimestamp()
      };

      await updateDoc(userRef, updatedFields);
      const updatedProfile = { ...curr, ...updatedFields };
      this.cachedProfile = updatedProfile;
      return updatedProfile;
    } catch (err) {
      console.warn('Failed to record game finished to Firestore:', err);
      return null;
    }
  }

  /**
   * Fetch top players for Leaderboard
   */
  public async getTopLeaderboard(count: number = 6): Promise<UserProfileDoc[]> {
    try {
      const usersCol = collection(db, 'users');
      const q = query(usersCol, orderBy('points', 'desc'), limit(count));
      const querySnap = await getDocs(q);

      const list: UserProfileDoc[] = [];
      querySnap.forEach((d) => {
        list.push(d.data() as UserProfileDoc);
      });

      if (list.length > 0) return list;
    } catch (err) {
      console.warn('Leaderboard fetch failed, using defaults:', err);
    }

    // Default fallback leaderboard entries
    return [
      {
        uid: 'demo_1',
        displayName: 'Surat Diamond Merchant',
        avatar: 'crown',
        coins: 48500,
        points: 5420,
        level: 22,
        rankTitle: 'Gujarat Tycoon',
        gamesPlayed: 78,
        gamesWon: 52,
        totalEarnings: 340000,
        propertiesBought: 142,
        createdAt: null,
        lastLoginAt: null
      },
      {
        uid: 'demo_2',
        displayName: 'Kutch Port Trader',
        avatar: 'diamond',
        coins: 34200,
        points: 3890,
        level: 16,
        rankTitle: 'Senior Trade Master',
        gamesPlayed: 64,
        gamesWon: 39,
        totalEarnings: 260000,
        propertiesBought: 108,
        createdAt: null,
        lastLoginAt: null
      },
      {
        uid: 'demo_3',
        displayName: 'Ahmedabad Mill Owner',
        avatar: 'leaf',
        coins: 29000,
        points: 2750,
        level: 12,
        rankTitle: 'Senior Trade Master',
        gamesPlayed: 52,
        gamesWon: 31,
        totalEarnings: 210000,
        propertiesBought: 94,
        createdAt: null,
        lastLoginAt: null
      },
      {
        uid: 'demo_4',
        displayName: 'Rajkot Heritage Guild',
        avatar: 'star',
        coins: 21500,
        points: 1650,
        level: 7,
        rankTitle: 'Gujarat Merchant',
        gamesPlayed: 40,
        gamesWon: 22,
        totalEarnings: 155000,
        propertiesBought: 68,
        createdAt: null,
        lastLoginAt: null
      }
    ];
  }

  public getCachedProfile(): UserProfileDoc | null {
    return this.cachedProfile;
  }
}
