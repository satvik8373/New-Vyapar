import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  onSnapshot,
  getDocs,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  Unsubscribe,
  orderBy,
  limit
} from 'firebase/firestore';
import { ref, onValue, set, onDisconnect, off } from 'firebase/database';
import { db, rtdb } from './firebaseConfig';
import { UserProfileDoc } from './userService';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface FriendRequest {
  id: string;
  fromUid: string;
  toUid: string;
  fromName: string;
  fromAvatar: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: any;
}

export interface FriendEntry {
  uid: string;
  displayName: string;
  avatar: string;
  level?: number;
  rankTitle?: string;
  isOnline: boolean;
  lastSeen?: number;
}

export interface RecentOpponent {
  uid: string;
  displayName: string;
  avatar: string;
  playedAt: any;
}

// ── Service ───────────────────────────────────────────────────────────────────

export class FriendService {
  private static instance: FriendService;

  public static getInstance(): FriendService {
    if (!FriendService.instance) {
      FriendService.instance = new FriendService();
    }
    return FriendService.instance;
  }

  // ── Presence ──────────────────────────────────────────────────────────────

  /** Call once on sign-in. Sets this uid as online and registers cleanup on disconnect. */
  public setupPresence(uid: string): void {
    const presenceRef = ref(rtdb, `presence/${uid}`);
    set(presenceRef, { online: true, lastSeen: Date.now() }).catch(() => {});
    onDisconnect(presenceRef).set({ online: false, lastSeen: Date.now() }).catch(() => {});
  }

  /** Subscribe to another user's online status. Returns unsubscribe fn. */
  public subscribePresence(uid: string, onChange: (online: boolean) => void): () => void {
    const presenceRef = ref(rtdb, `presence/${uid}`);
    const handler = onValue(
      presenceRef,
      (snap) => {
        const data = snap.val();
        onChange(data?.online === true);
      },
      () => onChange(false)
    );
    return () => off(presenceRef, 'value', handler);
  }

  // ── Friend Requests ───────────────────────────────────────────────────────

  /** Send a friend request from fromUid → toUid. Throws descriptive error if blocked. */
  public async sendFriendRequest(
    fromUid: string,
    fromName: string,
    fromAvatar: string,
    toUid: string
  ): Promise<void> {
    // Guard: already friends?
    const mySnap = await getDoc(doc(db, 'users', fromUid));
    if (mySnap.exists()) {
      const friends: string[] = mySnap.data().friends || [];
      if (friends.includes(toUid)) throw new Error('already_friends');
    }

    // Guard: pending request already exists?
    const existing = await getDocs(
      query(
        collection(db, 'friendRequests'),
        where('fromUid', '==', fromUid),
        where('toUid', '==', toUid),
        where('status', '==', 'pending')
      )
    );
    if (!existing.empty) throw new Error('request_pending');

    const reqRef = doc(collection(db, 'friendRequests'));
    await setDoc(reqRef, {
      fromUid,
      fromName,
      fromAvatar,
      toUid,
      status: 'pending',
      createdAt: serverTimestamp()
    });
  }

  /** Live subscribe to incoming pending requests for a user. */
  public subscribeIncomingRequests(
    uid: string,
    onUpdate: (requests: FriendRequest[]) => void
  ): Unsubscribe {
    const q = query(
      collection(db, 'friendRequests'),
      where('toUid', '==', uid),
      where('status', '==', 'pending')
    );
    return onSnapshot(
      q,
      (snap) => {
        const requests: FriendRequest[] = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<FriendRequest, 'id'>)
        }));
        onUpdate(requests);
      },
      () => onUpdate([])
    );
  }

  /** Accept a pending request and mutually add to each other's friends list. */
  public async acceptFriendRequest(
    requestId: string,
    myUid: string,
    theirUid: string
  ): Promise<void> {
    await updateDoc(doc(db, 'friendRequests', requestId), { status: 'accepted' });
    await Promise.all([
      updateDoc(doc(db, 'users', myUid), { friends: arrayUnion(theirUid) }).catch(() => {}),
      updateDoc(doc(db, 'users', theirUid), { friends: arrayUnion(myUid) }).catch(() => {})
    ]);
  }

  /** Decline/dismiss a pending request. */
  public async declineFriendRequest(requestId: string): Promise<void> {
    await deleteDoc(doc(db, 'friendRequests', requestId)).catch(() => {});
  }

  /** Remove a friend from both users' lists. */
  public async removeFriend(myUid: string, theirUid: string): Promise<void> {
    await Promise.all([
      updateDoc(doc(db, 'users', myUid), { friends: arrayRemove(theirUid) }).catch(() => {}),
      updateDoc(doc(db, 'users', theirUid), { friends: arrayRemove(myUid) }).catch(() => {})
    ]);
  }

  // ── Friend Profile Fetching ───────────────────────────────────────────────

  /** Fetch Firestore profiles for a list of UIDs. */
  public async getFriendProfiles(friendUids: string[]): Promise<UserProfileDoc[]> {
    if (!friendUids.length) return [];
    const results: UserProfileDoc[] = [];
    for (const uid of friendUids) {
      try {
        const snap = await getDoc(doc(db, 'users', uid));
        if (snap.exists()) results.push(snap.data() as UserProfileDoc);
      } catch {
        // skip
      }
    }
    return results;
  }

  // ── Search ────────────────────────────────────────────────────────────────

  /** Search players by display name prefix (min 2 chars). Excludes self. */
  public async searchPlayersByName(
    nameQuery: string,
    myUid: string
  ): Promise<UserProfileDoc[]> {
    if (!nameQuery.trim() || nameQuery.trim().length < 2) return [];
    try {
      const q = query(
        collection(db, 'users'),
        orderBy('displayName'),
        where('displayName', '>=', nameQuery.trim()),
        where('displayName', '<=', nameQuery.trim() + '\uf8ff'),
        limit(8)
      );
      const snap = await getDocs(q);
      return snap.docs
        .map((d) => d.data() as UserProfileDoc)
        .filter((u) => u.uid !== myUid);
    } catch {
      return [];
    }
  }

  // ── Recent Opponents ──────────────────────────────────────────────────────

  /**
   * Called after each game ends. Stores opponent info in
   * users/{myUid}/recentOpponents/{opponentUid}.
   */
  public async recordRecentOpponent(
    myUid: string,
    opponent: { uid: string; displayName: string; avatar: string }
  ): Promise<void> {
    if (!myUid || !opponent.uid || myUid === opponent.uid) return;
    try {
      const oppRef = doc(db, 'users', myUid, 'recentOpponents', opponent.uid);
      await setDoc(
        oppRef,
        {
          uid: opponent.uid,
          displayName: opponent.displayName,
          avatar: opponent.avatar,
          playedAt: serverTimestamp()
        },
        { merge: true }
      );
    } catch {
      // non-critical
    }
  }

  /** Fetch last 10 recent opponents. */
  public async getRecentOpponents(myUid: string): Promise<RecentOpponent[]> {
    try {
      const col = collection(db, 'users', myUid, 'recentOpponents');
      const q = query(col, orderBy('playedAt', 'desc'), limit(10));
      const snap = await getDocs(q);
      return snap.docs.map((d) => d.data() as RecentOpponent);
    } catch {
      return [];
    }
  }
}
