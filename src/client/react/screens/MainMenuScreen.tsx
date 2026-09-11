import React from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import PeopleIcon from '@mui/icons-material/People';
import PersonIcon from '@mui/icons-material/Person';
import LeaderboardIcon from '@mui/icons-material/Leaderboard';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import { motion } from 'framer-motion';
import { MoneyDisplay } from '../components/common/MoneyDisplay';
import { PlayerAvatar } from '../components/common/PlayerAvatar';
import { AppCard, AppButton, AppBadge } from '../components/common';

import LogoutIcon from '@mui/icons-material/Logout';
import InstallMobileIcon from '@mui/icons-material/InstallMobile';
import Tooltip from '@mui/material/Tooltip';
import { usePWAInstall } from '../utils/usePWAInstall';

interface MainMenuScreenProps {
  userName: string;
  userBalance: number;
  userAvatar?: string;
  userPoints?: number;
  userLevel?: number;
  userRankTitle?: string;
  onPlayVsComputer: () => void;
  onCreateRoom: () => void;
  onJoinRoom: () => void;
  onOpenProfile: () => void;
  onOpenFriends: () => void;
  onOpenStats: () => void;
  onOpenSettings: () => void;
  onLogout?: () => void;
}

export const MainMenuScreen: React.FC<MainMenuScreenProps> = ({
  userName,
  userBalance,
  userAvatar = 'crown',
  userPoints = 150,
  userLevel = 1,
  userRankTitle = 'Novice Trader',
  onPlayVsComputer,
  onCreateRoom,
  onJoinRoom,
  onOpenProfile,
  onOpenFriends,
  onOpenStats,
  onOpenSettings,
  onLogout
}) => {
  const { canInstall, installApp } = usePWAInstall();

  return (
    <Box
      sx={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100dvh',
        maxHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        background: '#f8fafc',
        p: { xs: 1.2, sm: 2, md: 3 },
        overflow: 'hidden',
        touchAction: 'manipulation',
        boxSizing: 'border-box',
        '@media (max-height: 500px)': {
          p: 0.8
        }
      }}
    >
      {/* Top Header Card — Sleek & Compact on Mobile */}
      <AppCard
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          px: { xs: 1.4, sm: 2.2, md: 3 },
          py: { xs: 0.8, sm: 1.2, md: 1.5 },
          maxWidth: { xs: '100%', sm: 600, md: 740, lg: 840 },
          width: '100%',
          mx: 'auto',
          boxSizing: 'border-box',
          '@media (max-height: 500px)': {
            py: 0.5,
            px: 1.2
          }
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 1.5 }, cursor: 'pointer', minWidth: 0 }} onClick={onOpenProfile}>
          <Box sx={{ flexShrink: 0 }}>
            <PlayerAvatar avatar={userAvatar} color="#ff4757" size={38} level={userLevel} />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography
              noWrap
              sx={{
                fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
                fontWeight: 900,
                fontSize: { xs: '13.5px', sm: '15px', md: '17px' },
                color: '#1e293b',
                lineHeight: 1.2
              }}
            >
              {userName}
            </Typography>
            <Typography
              noWrap
              variant="caption"
              sx={{
                fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
                color: '#ffa502',
                fontWeight: 800,
                fontSize: { xs: '10px', sm: '11px', md: '12px' },
                display: 'block'
              }}
            >
              Lvl {userLevel} • {userRankTitle}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.6, sm: 1 }, flexShrink: 0 }}>
          <AppBadge
            badgeVariant="warning"
            label={`${userPoints} XP`}
            sx={{
              height: { xs: 28, sm: 32, md: 38 },
              px: { xs: 0.8, sm: 1.2 },
              fontWeight: 900,
              fontSize: { xs: '11px', sm: '12px', md: '13px' },
              display: { xs: 'none', sm: 'inline-flex' }
            }}
          />

          <AppBadge
            badgeVariant="neutral"
            label={<MoneyDisplay amount={userBalance} sx={{ fontSize: { xs: '12.5px', sm: '13.5px', md: '15px' }, fontWeight: 800 }} />}
            sx={{ height: { xs: 28, sm: 32, md: 38 }, px: { xs: 0.8, sm: 1.2 } }}
          />

          {canInstall && (
            <Tooltip title="Install App">
              <IconButton
                size="small"
                onClick={installApp}
                sx={{
                  color: '#059669',
                  border: '1.5px solid #a7f3d0',
                  backgroundColor: '#ecfdf5',
                  padding: { xs: '4px', sm: '6px' },
                  '&:hover': { backgroundColor: '#d1fae5', borderColor: '#34d399' }
                }}
              >
                <InstallMobileIcon sx={{ fontSize: { xs: 16, sm: 18 } }} />
              </IconButton>
            </Tooltip>
          )}

          <IconButton
            size="small"
            onClick={onOpenSettings}
            sx={{
              color: '#64748b',
              border: '1.5px solid #cbd5e1',
              backgroundColor: '#ffffff',
              padding: { xs: '4px', sm: '6px' },
              '&:hover': { backgroundColor: '#f8fafc', borderColor: '#94a3b8' }
            }}
          >
            <SettingsIcon sx={{ fontSize: { xs: 16, sm: 18 } }} />
          </IconButton>

          {onLogout && (
            <Tooltip title="Log Out">
              <IconButton
                size="small"
                onClick={onLogout}
                sx={{
                  color: '#ef4444',
                  border: '1.5px solid #fecaca',
                  backgroundColor: '#ffffff',
                  padding: { xs: '4px', sm: '6px' },
                  '&:hover': { backgroundColor: '#fef2f2', borderColor: '#f87171' }
                }}
              >
                <LogoutIcon sx={{ fontSize: { xs: 16, sm: 18 } }} />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </AppCard>

      {/* Center Hero Branding & Actions — Clean & Perfectly Proportioned */}
      <Box
        sx={{
          maxWidth: { xs: 350, sm: 420, md: 500, lg: 560 },
          width: '100%',
          mx: 'auto',
          textAlign: 'center',
          my: 'auto',
          py: { xs: 0.8, sm: 1.5, md: 2.5 },
          boxSizing: 'border-box',
          '@media (max-height: 500px)': {
            py: 0.2
          }
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          {/* Game Hero Artwork Badge */}
          <Box
            component="img"
            src="/assets/images/app_icon.jpg"
            alt="Navo Vyapar"
            sx={{
              width: { xs: 68, sm: 84, md: 105, lg: 118 },
              height: { xs: 68, sm: 84, md: 105, lg: 118 },
              mx: 'auto',
              mb: { xs: 0.8, sm: 1.2, md: 1.8 },
              borderRadius: { xs: '18px', md: '24px' },
              border: '1px solid rgba(0, 0, 0, 0.08)',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.09), 0 3px 8px rgba(0, 0, 0, 0.04)',
              objectFit: 'cover',
              '@media (max-height: 500px)': {
                width: 48,
                height: 48,
                mb: 0.5
              }
            }}
          />

          <Typography
            sx={{
              fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
              fontWeight: 900,
              color: '#0f172a',
              letterSpacing: '0.3px',
              fontSize: { xs: '21px', sm: '26px', md: '34px', lg: '38px' },
              lineHeight: 1.1,
              mb: 0.2,
              '@media (max-height: 500px)': {
                fontSize: '18px'
              }
            }}
          >
            NAVO VYAPAR
          </Typography>

          <Typography
            variant="caption"
            sx={{
              fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
              color: '#64748b',
              fontWeight: 750,
              letterSpacing: '0.8px',
              textTransform: 'uppercase',
              display: 'block',
              fontSize: { xs: '9.5px', sm: '11px', md: '12px' },
              mb: { xs: 1.5, sm: 2, md: 2.8 },
              '@media (max-height: 500px)': {
                mb: 1
              }
            }}
          >
            Gujarat Commerce Board Game
          </Typography>
        </motion.div>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 1, sm: 1.2, md: 1.5 } }}>
          <AppButton
            fullWidth
            variant="primary"
            size="large"
            startIcon={<SmartToyIcon sx={{ fontSize: { xs: 20, sm: 24, md: 26 } }} />}
            onClick={onPlayVsComputer}
            sx={{
              py: { xs: 1.2, sm: 1.5, md: 2 },
              fontSize: { xs: '15px', sm: '16.5px', md: '18px' },
              fontWeight: 900,
              letterSpacing: '0.3px',
              '@media (max-height: 500px)': {
                py: 0.9,
                fontSize: '14px'
              }
            }}
          >
            PLAY VS COMPUTER
          </AppButton>

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: { xs: 0.8, sm: 1.2 } }}>
            <AppButton
              fullWidth
              variant="secondary"
              size="medium"
              startIcon={<AddCircleOutlineIcon sx={{ fontSize: { xs: 16, sm: 20 } }} />}
              onClick={onCreateRoom}
              sx={{
                py: { xs: 0.8, sm: 1, md: 1.3 },
                fontSize: { xs: '12.5px', sm: '14px', md: '15px' },
                '@media (max-height: 500px)': {
                  py: 0.6,
                  fontSize: '12px'
                }
              }}
            >
              Create Room
            </AppButton>

            <AppButton
              fullWidth
              variant="outlined"
              size="medium"
              startIcon={<MeetingRoomIcon sx={{ fontSize: { xs: 16, sm: 20 } }} />}
              onClick={onJoinRoom}
              sx={{
                py: { xs: 0.8, sm: 1, md: 1.3 },
                fontSize: { xs: '12.5px', sm: '14px', md: '15px' },
                '@media (max-height: 500px)': {
                  py: 0.6,
                  fontSize: '12px'
                }
              }}
            >
              Join Room
            </AppButton>
          </Box>
        </Box>
      </Box>

      {/* Bottom Navigation Bar Card */}
      <AppCard
        padded={false}
        sx={{
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          py: { xs: 0.4, sm: 0.7, md: 1 },
          maxWidth: { xs: 350, sm: 420, md: 500, lg: 560 },
          width: '100%',
          mx: 'auto',
          boxSizing: 'border-box',
          '@media (max-height: 500px)': {
            py: 0.2
          }
        }}
      >
        <IconButton onClick={onOpenFriends} sx={{ display: 'flex', flexDirection: 'column', color: '#64748b', borderRadius: '12px', py: 0.5 }}>
          <PeopleIcon sx={{ fontSize: { xs: 19, sm: 22 } }} />
          <Typography
            variant="caption"
            sx={{
              fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
              fontSize: { xs: '9.5px', sm: '10.5px' },
              fontWeight: 800,
              mt: 0.2
            }}
          >
            Friends
          </Typography>
        </IconButton>

        <IconButton onClick={onOpenProfile} sx={{ display: 'flex', flexDirection: 'column', color: '#64748b', borderRadius: '12px', py: 0.5 }}>
          <PersonIcon sx={{ fontSize: { xs: 19, sm: 22 } }} />
          <Typography
            variant="caption"
            sx={{
              fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
              fontSize: { xs: '9.5px', sm: '10.5px' },
              fontWeight: 800,
              mt: 0.2
            }}
          >
            Profile
          </Typography>
        </IconButton>

        <IconButton onClick={onOpenStats} sx={{ display: 'flex', flexDirection: 'column', color: '#64748b', borderRadius: '12px', py: 0.5 }}>
          <LeaderboardIcon sx={{ fontSize: { xs: 19, sm: 22 } }} />
          <Typography
            variant="caption"
            sx={{
              fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
              fontSize: { xs: '9.5px', sm: '10.5px' },
              fontWeight: 800,
              mt: 0.2
            }}
          >
            Stats
          </Typography>
        </IconButton>

        <IconButton onClick={onOpenSettings} sx={{ display: 'flex', flexDirection: 'column', color: '#64748b', borderRadius: '12px', py: 0.5 }}>
          <SettingsIcon sx={{ fontSize: { xs: 19, sm: 22 } }} />
          <Typography
            variant="caption"
            sx={{
              fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
              fontSize: { xs: '9.5px', sm: '10.5px' },
              fontWeight: 800,
              mt: 0.2
            }}
          >
            Settings
          </Typography>
        </IconButton>
      </AppCard>
    </Box>
  );
};
