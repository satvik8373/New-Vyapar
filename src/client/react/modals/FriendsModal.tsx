import React, { useState, useEffect, useRef } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Typography, Box,
  IconButton, TextField, InputAdornment, Tabs, Tab, CircularProgress,
  Divider, Chip, Tooltip
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import SearchIcon from "@mui/icons-material/Search";
import CheckIcon from "@mui/icons-material/Check";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import PersonRemoveIcon from "@mui/icons-material/PersonRemove";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { PlayerAvatar } from "../components/common/PlayerAvatar";
import { AppButton } from "../components/common/AppButton";
import { AuthService } from "../../firebase/authService";
import { FriendService } from "../../firebase/friendService";
import { UserService } from "../../firebase/userService";

interface FriendsModalProps { open: boolean; onClose: () => void; }

const PresenceDot: React.FC<{ uid: string }> = ({ uid }) => {
  const [online, setOnline] = useState(false);
  useEffect(() => { const u = FriendService.getInstance().subscribePresence(uid, setOnline); return u; }, [uid]);
  return (
    <Box sx={{ width: 8, height: 8, borderRadius: "50%", background: online ? "#10b981" : "#94a3b8", border: "1.5px solid #fff", flexShrink: 0 }} />
  );
};

const TabPanel: React.FC<{ children: React.ReactNode; value: number; index: number }> = ({ children, value, index }) => (
  <Box hidden={value !== index} sx={{ pt: 1.5 }}>{value === index && children}</Box>
);

const avatarColor = (avatar: string) => ({ crown: "#e11d48", diamond: "#0284c7", leaf: "#059669", star: "#d97706" }[avatar] || "#6366f1");

export const FriendsModal: React.FC<FriendsModalProps> = ({ open, onClose }) => {
  const currentProfile = AuthService.getInstance().getCurrentProfile();
  const myUid = currentProfile?.uid || "";
  const myName = currentProfile?.name || "Trader";
  const myAvatar = currentProfile?.avatar || "crown";

  const [tab, setTab] = useState(0);
  const [friends, setFriends] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [recentOpponents, setRecentOpponents] = useState<any[]>([]);
  const [loadingFriends, setLoadingFriends] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [actionPending, setActionPending] = useState<Record<string, boolean>>({});
  const [sentRequests, setSentRequests] = useState<Set<string>>(new Set());
  const [myFriendUids, setMyFriendUids] = useState<string[]>([]);
  const [feedbackMsg, setFeedbackMsg] = useState("");
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!open || !myUid) return;
    setLoadingFriends(true);
    UserService.getInstance().getOrCreateUserProfile(myUid, myName, myAvatar)
      .then((myDoc) => { const uids: string[] = (myDoc as any).friends || []; setMyFriendUids(uids); return FriendService.getInstance().getFriendProfiles(uids); })
      .then((profiles) => { setFriends(profiles); setLoadingFriends(false); })
      .catch(() => setLoadingFriends(false));
    const unsubReq = FriendService.getInstance().subscribeIncomingRequests(myUid, setRequests);
    FriendService.getInstance().getRecentOpponents(myUid).then(setRecentOpponents).catch(() => {});
    return () => { unsubReq(); };
  }, [open, myUid]);

  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    if (!searchQuery.trim() || searchQuery.trim().length < 2) { setSearchResults([]); setSearchLoading(false); return; }
    setSearchLoading(true);
    searchTimer.current = setTimeout(async () => {
      const results = await FriendService.getInstance().searchPlayersByName(searchQuery, myUid);
      setSearchResults(results); setSearchLoading(false);
    }, 400);
    return () => { if (searchTimer.current) clearTimeout(searchTimer.current); };
  }, [searchQuery, myUid]);

  const showFeedback = (msg: string) => { setFeedbackMsg(msg); setTimeout(() => setFeedbackMsg(""), 2500); };

  const handleSendRequest = async (toUid: string) => {
    if (!myUid || actionPending[toUid]) return;
    setActionPending((p) => ({ ...p, [toUid]: true }));
    try {
      await FriendService.getInstance().sendFriendRequest(myUid, myName, myAvatar, toUid);
      setSentRequests((p) => new Set(p).add(toUid));
      showFeedback("Friend request sent!");
    } catch (e: any) {
      if (e.message === "already_friends") showFeedback("Already friends!");
      else if (e.message === "request_pending") showFeedback("Request already sent.");
      else showFeedback("Could not send request.");
    } finally { setActionPending((p) => ({ ...p, [toUid]: false })); }
  };

  const handleAccept = async (req: any) => {
    if (actionPending[req.id]) return;
    setActionPending((p) => ({ ...p, [req.id]: true }));
    try {
      await FriendService.getInstance().acceptFriendRequest(req.id, myUid, req.fromUid);
      setRequests((p) => p.filter((r) => r.id !== req.id));
      const updated = await FriendService.getInstance().getFriendProfiles([...myFriendUids, req.fromUid]);
      setFriends(updated); setMyFriendUids((p) => [...p, req.fromUid]);
      showFeedback(`${req.fromName} added as friend!`);
    } catch { showFeedback("Failed to accept. Try again."); }
    finally { setActionPending((p) => ({ ...p, [req.id]: false })); }
  };

  const handleDecline = async (req: any) => {
    if (actionPending[req.id]) return;
    setActionPending((p) => ({ ...p, [req.id]: true }));
    await FriendService.getInstance().declineFriendRequest(req.id);
    setRequests((p) => p.filter((r) => r.id !== req.id));
    setActionPending((p) => ({ ...p, [req.id]: false }));
  };

  const handleRemoveFriend = async (uid: string, name: string) => {
    if (actionPending[uid]) return;
    setActionPending((p) => ({ ...p, [uid]: true }));
    await FriendService.getInstance().removeFriend(myUid, uid);
    setFriends((p) => p.filter((f) => f.uid !== uid));
    setMyFriendUids((p) => p.filter((id) => id !== uid));
    showFeedback(`Removed ${name}.`);
    setActionPending((p) => ({ ...p, [uid]: false }));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth PaperProps={{ sx: { background: "#ffffff", boxShadow: "0 20px 60px rgba(15,23,42,0.18)", border: "1px solid #e2e8f0", borderRadius: "20px", p: 1, maxHeight: "86vh" } }}>
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pb: 0.5 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 900, color: "#0f172a", fontSize: "16px" }}>Friends</Typography>
          {requests.length > 0 && (
            <Chip icon={<NotificationsIcon sx={{ fontSize: 13, ml: "4px !important" }} />} label={requests.length} size="small"
              sx={{ height: 20, bgcolor: "#ef4444", color: "#fff", fontWeight: 900, fontSize: "11px", "& .MuiChip-icon": { color: "#fff" } }} />
          )}
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ color: "#64748b" }}><CloseIcon fontSize="small" /></IconButton>
      </DialogTitle>

      {feedbackMsg && (
        <Box sx={{ mx: 2, mb: 0.5, px: 1.5, py: 0.6, bgcolor: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "8px" }}>
          <Typography variant="caption" sx={{ color: "#15803d", fontWeight: 700 }}>{feedbackMsg}</Typography>
        </Box>
      )}

      <Tabs value={tab} onChange={(_, v) => setTab(v)}
        sx={{ px: 1.5, minHeight: 36, "& .MuiTab-root": { fontSize: "12px", fontWeight: 800, minHeight: 36, py: 0, textTransform: "none" }, "& .MuiTabs-indicator": { backgroundColor: "#0f172a", height: 2 } }}>
        <Tab label={`Friends (${friends.length})`} />
        <Tab label={`Requests${requests.length > 0 ? ` (${requests.length})` : ""}`} />
        <Tab label="Add Friends" />
      </Tabs>
      <Divider />

      <DialogContent sx={{ px: 1.5, py: 0.5, overflowY: "auto" }}>
        {/* Tab 0: Friends */}
        <TabPanel value={tab} index={0}>
          {loadingFriends ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}><CircularProgress size={28} sx={{ color: "#ffa502" }} /></Box>
          ) : friends.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <Typography sx={{ color: "#94a3b8", fontSize: "13px", fontWeight: 700 }}>No friends yet.</Typography>
              <Typography variant="caption" sx={{ color: "#cbd5e1" }}>Go to "Add Friends" tab to search players.</Typography>
            </Box>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1, pt: 0.5 }}>
              {friends.map((f) => (
                <Box key={f.uid} sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", p: 1.2, borderRadius: "14px", background: "#f8fafc", border: "1.5px solid #e2e8f0" }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
                    <PresenceDot uid={f.uid} />
                    <PlayerAvatar avatar={f.avatar || "crown"} color={avatarColor(f.avatar)} size={36} level={f.level} />
                    <Box>
                      <Typography sx={{ fontWeight: 800, fontSize: "13px", color: "#0f172a" }}>{f.displayName}</Typography>
                      <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 600, fontSize: "10px" }}>{f.rankTitle || "Gujarat Merchant"} • Lv.{f.level}</Typography>
                    </Box>
                  </Box>
                  <Tooltip title="Remove friend" arrow>
                    <IconButton size="small" disabled={actionPending[f.uid]} onClick={() => handleRemoveFriend(f.uid, f.displayName)}
                      sx={{ color: "#ef4444", opacity: 0.7, "&:hover": { opacity: 1 } }}>
                      <PersonRemoveIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Tooltip>
                </Box>
              ))}
            </Box>
          )}

          {recentOpponents.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="caption" sx={{ color: "#94a3b8", fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase", display: "block", mb: 0.8 }}>Recent Opponents</Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.8 }}>
                {recentOpponents.slice(0, 5).map((opp) => {
                  const alreadyFriend = myFriendUids.includes(opp.uid);
                  const sent = sentRequests.has(opp.uid);
                  return (
                    <Box key={opp.uid} sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", p: 1, borderRadius: "12px", background: "#fafafa", border: "1px solid #e2e8f0" }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <PlayerAvatar avatar={opp.avatar || "crown"} color={avatarColor(opp.avatar)} size={30} />
                        <Typography sx={{ fontWeight: 700, fontSize: "12px", color: "#334155" }}>{opp.displayName}</Typography>
                      </Box>
                      {!alreadyFriend && (
                        <AppButton size="small" variant={sent ? "neutral" : "outlined"} disabled={sent || actionPending[opp.uid]} onClick={() => handleSendRequest(opp.uid)}>
                          {sent ? "Sent" : "+ Add"}
                        </AppButton>
                      )}
                    </Box>
                  );
                })}
              </Box>
            </Box>
          )}
        </TabPanel>

        {/* Tab 1: Requests */}
        <TabPanel value={tab} index={1}>
          {requests.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 4 }}><Typography sx={{ color: "#94a3b8", fontSize: "13px", fontWeight: 700 }}>No pending requests.</Typography></Box>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {requests.map((req) => (
                <Box key={req.id} sx={{ p: 1.4, borderRadius: "14px", background: "#f8fafc", border: "1.5px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
                    <PlayerAvatar avatar={req.fromAvatar || "crown"} color={avatarColor(req.fromAvatar)} size={36} />
                    <Box>
                      <Typography sx={{ fontWeight: 800, fontSize: "13px", color: "#0f172a" }}>{req.fromName}</Typography>
                      <Typography variant="caption" sx={{ color: "#94a3b8", fontSize: "10px", fontWeight: 600 }}>Wants to be friends</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: "flex", gap: 0.6 }}>
                    <IconButton size="small" disabled={actionPending[req.id]} onClick={() => handleAccept(req)}
                      sx={{ bgcolor: "#dcfce7", color: "#15803d", "&:hover": { bgcolor: "#bbf7d0" }, width: 30, height: 30 }}>
                      <CheckIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                    <IconButton size="small" disabled={actionPending[req.id]} onClick={() => handleDecline(req)}
                      sx={{ bgcolor: "#fee2e2", color: "#dc2626", "&:hover": { bgcolor: "#fecaca" }, width: 30, height: 30 }}>
                      <CloseRoundedIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Box>
                </Box>
              ))}
            </Box>
          )}
        </TabPanel>

        {/* Tab 2: Search */}
        <TabPanel value={tab} index={2}>
          <TextField fullWidth size="small" placeholder="Search player by name..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: "#94a3b8", fontSize: 18 }} /></InputAdornment>,
              endAdornment: searchLoading ? <InputAdornment position="end"><CircularProgress size={14} sx={{ color: "#94a3b8" }} /></InputAdornment> : null
            }}
            sx={{ mb: 1.5, "& .MuiOutlinedInput-root": { borderRadius: "10px", fontSize: "13px", fontWeight: 600 } }}
          />

          {searchResults.length === 0 && searchQuery.trim().length >= 2 && !searchLoading && (
            <Box sx={{ textAlign: "center", py: 3 }}>
              <Typography variant="caption" sx={{ color: "#94a3b8", fontWeight: 700 }}>No players found for "{searchQuery}"</Typography>
            </Box>
          )}
          {searchResults.length === 0 && searchQuery.trim().length < 2 && (
            <Box sx={{ textAlign: "center", py: 3 }}>
              <Typography variant="caption" sx={{ color: "#cbd5e1", fontWeight: 600 }}>Type at least 2 characters to search</Typography>
            </Box>
          )}

          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {searchResults.map((user) => {
              const alreadyFriend = myFriendUids.includes(user.uid);
              const sent = sentRequests.has(user.uid);
              return (
                <Box key={user.uid} sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", p: 1.2, borderRadius: "14px", background: "#f8fafc", border: "1.5px solid #e2e8f0" }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
                    <PresenceDot uid={user.uid} />
                    <PlayerAvatar avatar={user.avatar || "crown"} color={avatarColor(user.avatar)} size={36} level={user.level} />
                    <Box>
                      <Typography sx={{ fontWeight: 800, fontSize: "13px", color: "#0f172a" }}>{user.displayName}</Typography>
                      <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 600, fontSize: "10px" }}>{user.rankTitle || "Gujarat Merchant"} • {user.gamesWon} Wins</Typography>
                    </Box>
                  </Box>
                  {alreadyFriend ? (
                    <Chip label="Friends" size="small" sx={{ height: 22, bgcolor: "#dcfce7", color: "#15803d", fontWeight: 800, fontSize: "10px" }} />
                  ) : (
                    <AppButton size="small" variant={sent ? "neutral" : "primary"} disabled={sent || actionPending[user.uid]} onClick={() => handleSendRequest(user.uid)}
                      startIcon={sent ? undefined : <PersonAddIcon sx={{ fontSize: 14 }} />}>
                      {sent ? "Sent" : "Add"}
                    </AppButton>
                  )}
                </Box>
              );
            })}
          </Box>
        </TabPanel>
      </DialogContent>

      <DialogActions sx={{ p: 1.5 }}>
        <AppButton fullWidth variant="neutral" size="medium" onClick={onClose}>Close</AppButton>
      </DialogActions>
    </Dialog>
  );
};
