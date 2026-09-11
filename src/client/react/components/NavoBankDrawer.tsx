import React, { useEffect, useState } from 'react';
import {
  Drawer,
  Box,
  Typography,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Tooltip
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import AssuredWorkloadIcon from '@mui/icons-material/AssuredWorkload';
import HomeIcon from '@mui/icons-material/Home';
import ApartmentIcon from '@mui/icons-material/Apartment';
import AddHomeIcon from '@mui/icons-material/AddHome';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HistoryEduIcon from '@mui/icons-material/HistoryEdu';
import SellIcon from '@mui/icons-material/Sell';
import { GameEngine, GameEngineState } from '../../game-engine/GameEngine';
import { BOARD_TILES, COLOR_HEX_MAP, BoardTileStep } from '@shared/game-data/boardData';
import { CandyButton } from './common/CandyButton';
import { CandyCard } from './common/CandyCard';
import { CandyPill } from './common/CandyPill';
import { CandyStatBox } from './common/CandyStatBox';

interface NavoBankDrawerProps {
  open: boolean;
  onClose: () => void;
}

export const NavoBankDrawer: React.FC<NavoBankDrawerProps> = ({ open, onClose }) => {
  const engine = GameEngine.getInstance();
  const [engineState, setEngineState] = useState<GameEngineState>(engine.getState());

  useEffect(() => {
    return engine.subscribe((s) => setEngineState(s));
  }, [engine]);

  const { players, activePlayerIndex, propertyHouses, mortgagedProperties, logs, bankLoanTaken, bankLoanBalance } = engineState;
  const activePlayer = players[activePlayerIndex];

  if (!activePlayer) return null;

  const isHumanTurn = activePlayer.isHuman;
  const hasTakenLoan = !!bankLoanTaken[activePlayer.id];
  const loanOwed = bankLoanBalance[activePlayer.id] || 0;
  const loanSettled = hasTakenLoan && loanOwed === 0;

  // Filter properties owned by active player
  const ownedTiles: BoardTileStep[] = BOARD_TILES.filter((t) =>
    activePlayer?.ownedPropertyIds?.includes(t.step)
  );

  // Financial logs for ledger
  const financialLogs = logs.filter((l) =>
    ['buy', 'rent', 'tax', 'auction', 'info'].includes(l.type)
  ).slice(0, 25);

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 380, md: 420 },
          background: 'linear-gradient(180deg, #ffffff 0%, #fafbfc 100%)',
          boxShadow: '-12px 0 40px rgba(15, 23, 42, 0.12)',
          borderLeft: '1.5px solid rgba(226, 232, 240, 0.95)',
          borderRadius: { xs: 0, sm: '20px 0 0 20px' },
          p: { xs: 1.5, sm: 2 },
          display: 'flex',
          flexDirection: 'column'
        }
      }}
    >
      {/* ── 1. HEADER ── */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              width: 34,
              height: 34,
              borderRadius: '10px',
              background: 'linear-gradient(180deg, #34d399 0%, #10b981 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 2px 0 #059669, 0 4px 10px rgba(16, 185, 129, 0.3)',
              border: '1px solid rgba(255, 255, 255, 0.25)'
            }}
          >
            <AccountBalanceIcon sx={{ fontSize: 18 }} />
          </Box>
          <Box>
            <Typography
              sx={{
                color: '#0f172a',
                fontWeight: 850,
                fontSize: { xs: '15px', sm: '16px' },
                lineHeight: 1.2,
                fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif'
              }}
            >
              NAVO CENTRAL BANK
            </Typography>
            <Typography sx={{ color: '#64748b', fontWeight: 600, fontSize: '10px', letterSpacing: '0.2px' }}>
              State Treasury & Liquidity Exchange
            </Typography>
          </Box>
        </Box>
        <CandyButton
          variant="glass"
          size="xs"
          onClick={onClose}
          style={{ minHeight: '28px', padding: '3px 6px' }}
        >
          <CloseIcon sx={{ fontSize: 16 }} />
        </CandyButton>
      </Box>

      <Divider sx={{ mb: 1.2, borderColor: 'rgba(226, 232, 240, 0.8)' }} />

      {/* ── SCROLLABLE CONTENT ── */}
      <Box sx={{ flex: 1, overflowY: 'auto', pr: 0.5, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {/* ── 2. ACTIVE MERCHANT FINANCIAL STATUS ── */}
        <CandyCard accent="mint" accentPosition="top" padding="sm" style={{ flexShrink: 0 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  backgroundColor: activePlayer.tokenColor,
                  boxShadow: `0 0 6px ${activePlayer.tokenColor}88`
                }}
              />
              <Typography sx={{ fontWeight: 800, fontSize: '14px', color: '#0f172a' }}>
                {activePlayer.name} ({activePlayer.colorName})
              </Typography>
            </Box>
            <CandyPill variant={isHumanTurn ? 'mint' : 'neutral'} size="xs" dot={isHumanTurn} pulse={isHumanTurn}>
              {isHumanTurn ? 'Active Turn' : 'Bot Player'}
            </CandyPill>
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1 }}>
            <CandyStatBox
              compact
              label="Cash Balance"
              value={`₹${activePlayer.balance.toLocaleString()}`}
              tint="default"
            />
            <CandyStatBox
              compact
              label="Net Worth"
              value={`₹${activePlayer.netWorth.toLocaleString()}`}
              tint="mint"
            />
            <CandyStatBox
              compact
              label="Properties"
              value={activePlayer?.ownedPropertyIds?.length || 0}
              tint="azure"
            />
          </Box>
        </CandyCard>

        {/* ── 3. EMERGENCY BANK LOAN FACILITY ── */}
        <CandyCard
          accent="azure"
          accentPosition="top"
          padding="sm"
          style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
              <AssuredWorkloadIcon sx={{ fontSize: 18, color: '#2563eb' }} />
              <Typography sx={{ fontWeight: 850, fontSize: '13px', color: '#0f172a' }}>
                EMERGENCY BANK LOAN
              </Typography>
            </Box>
            {loanOwed > 0 && (
              <CandyPill variant="berry" size="xs">
                Owed: ₹{loanOwed.toLocaleString()}
              </CandyPill>
            )}
            {loanSettled && (
              <CandyPill variant="mint" size="xs" icon={<CheckCircleOutlineIcon sx={{ fontSize: 12, mr: 0.3 }} />}>
                Repaid
              </CandyPill>
            )}
          </Box>

          <Typography sx={{ fontSize: '11px', color: '#64748b', lineHeight: 1.4 }}>
            One-time commercial loan per merchant. Borrow ₹3,000 instant liquidity. Repay ₹3,300 (+10% interest) at any time.
          </Typography>

          {!hasTakenLoan && (
            <CandyButton
              fullWidth
              variant="primary"
              size="sm"
              onClick={() => engine.takeBankLoan(activePlayer.id)}
              disabled={activePlayer.isBankrupt}
              icon={<MonetizationOnIcon sx={{ fontSize: 16 }} />}
            >
              Borrow ₹3,000 Emergency Loan
            </CandyButton>
          )}

          {loanOwed > 0 && (
            <CandyButton
              fullWidth
              variant="mint"
              size="sm"
              onClick={() => engine.repayBankLoan(activePlayer.id)}
              disabled={activePlayer.balance < loanOwed}
              icon={<CheckCircleOutlineIcon sx={{ fontSize: 16 }} />}
            >
              {activePlayer.balance >= loanOwed
                ? `Repay ₹${loanOwed.toLocaleString()} Loan Full`
                : `Need ₹${(loanOwed - activePlayer.balance).toLocaleString()} More to Repay`}
            </CandyButton>
          )}

          {loanSettled && (
            <Typography sx={{ fontSize: '11px', color: '#10b981', fontWeight: 700, textAlign: 'center' }}>
              Loan facility utilized and fully settled for this game.
            </Typography>
          )}
        </CandyCard>

        {/* ── 4. MERCHANT REAL ESTATE PORTFOLIO ── */}
        <Box sx={{ flexShrink: 0 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography sx={{ fontWeight: 850, fontSize: '12.5px', color: '#0f172a', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              PORTFOLIO ASSETS ({ownedTiles.length})
            </Typography>
            <Typography sx={{ fontSize: '11px', color: '#64748b' }}>
              Manage Mortgages & Buildings
            </Typography>
          </Box>

          {ownedTiles.length === 0 ? (
            <Box
              sx={{
                p: 3,
                textAlign: 'center',
                backgroundColor: '#ffffff',
                border: '1.5px dashed rgba(203, 213, 225, 0.8)',
                borderRadius: '14px'
              }}
            >
              <Typography sx={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>
                No properties registered in {activePlayer.name}'s portfolio.
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {ownedTiles.map((tile) => {
                const houses = propertyHouses[tile.step] || 0;
                const isMortgaged = mortgagedProperties.includes(tile.step);
                const houseCost = tile.price ? Math.round(tile.price * 0.5) : 500;
                const mortgageVal = tile.price ? Math.round(tile.price * 0.5) : 0;
                const unmortgageCost = tile.price ? Math.round(tile.price * 0.55) : 0;
                const sellHouseVal = Math.round(houseCost * 0.5);
                const sellPropVal = tile.price ? Math.round(tile.price * 0.5) : 0;
                const hasMonopoly = tile.color ? engine.ownsColorGroup(activePlayer.id, tile.color) : false;
                const canBuild = hasMonopoly && !isMortgaged && houses < 5 && activePlayer.balance >= houseCost;
                const colorHex = tile.color ? COLOR_HEX_MAP[tile.color] || '#64748b' : '#64748b';

                return (
                  <Box
                    key={tile.step}
                    sx={{
                      backgroundColor: isMortgaged ? '#f8fafc' : '#ffffff',
                      border: isMortgaged ? '1.5px dashed #cbd5e1' : '1px solid rgba(226, 232, 240, 0.9)',
                      borderRadius: '12px',
                      p: 1.2,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 0.8,
                      boxShadow: '0 1px 4px rgba(0,0,0,0.02)'
                    }}
                  >
                    {/* Header Row */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                        <Box
                          sx={{
                            width: 10,
                            height: 10,
                            borderRadius: '3px',
                            backgroundColor: colorHex
                          }}
                        />
                        <Typography sx={{ fontWeight: 800, fontSize: '13px', color: '#0f172a' }}>
                          {tile.name}
                        </Typography>
                        {tile.gujaratiName && (
                          <Typography sx={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>
                            ({tile.gujaratiName})
                          </Typography>
                        )}
                      </Box>

                      {/* Status Badges */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        {isMortgaged ? (
                          <CandyPill variant="berry" size="xs">
                            Mortgaged
                          </CandyPill>
                        ) : houses === 5 ? (
                          <CandyPill variant="berry" size="xs" icon={<ApartmentIcon sx={{ fontSize: 12, mr: 0.2 }} />}>
                            Hotel
                          </CandyPill>
                        ) : houses > 0 ? (
                          <CandyPill variant="mint" size="xs" icon={<HomeIcon sx={{ fontSize: 12, mr: 0.2 }} />}>
                            {houses} House{houses > 1 ? 's' : ''}
                          </CandyPill>
                        ) : hasMonopoly ? (
                          <CandyPill variant="honey" size="xs">
                            Monopoly
                          </CandyPill>
                        ) : null}
                      </Box>
                    </Box>

                    {/* Actions Bar */}
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.6, pt: 0.6, borderTop: '1px solid rgba(241, 245, 249, 0.9)' }}>
                      {/* Build House */}
                      {hasMonopoly && houses < 5 && !isMortgaged && (
                        <Tooltip title={activePlayer.balance < houseCost ? 'Insufficient funds' : `Build (+₹${houseCost})`}>
                          <span>
                            <CandyButton
                              size="xs"
                              variant="mint"
                              onClick={() => engine.buildHouse(tile.step)}
                              disabled={!canBuild}
                              icon={<AddHomeIcon sx={{ fontSize: 14 }} />}
                            >
                              Build (₹{houseCost})
                            </CandyButton>
                          </span>
                        </Tooltip>
                      )}

                      {/* Sell House */}
                      {houses > 0 && (
                        <CandyButton
                          size="xs"
                          variant="honey"
                          onClick={() => engine.sellHouse(tile.step)}
                          icon={<DeleteOutlineIcon sx={{ fontSize: 14 }} />}
                        >
                          Sell Building (+₹{sellHouseVal})
                        </CandyButton>
                      )}

                      {/* Mortgage / Redeem */}
                      {isMortgaged ? (
                        <CandyButton
                          size="xs"
                          variant="azure"
                          onClick={() => engine.unmortgageProperty(tile.step)}
                          disabled={activePlayer.balance < unmortgageCost}
                          icon={<MonetizationOnIcon sx={{ fontSize: 14 }} />}
                        >
                          Redeem (-₹{unmortgageCost})
                        </CandyButton>
                      ) : (
                        <CandyButton
                          size="xs"
                          variant="glass"
                          onClick={() => engine.mortgageProperty(tile.step)}
                          disabled={houses > 0}
                          icon={<AssuredWorkloadIcon sx={{ fontSize: 14 }} />}
                        >
                          Mortgage (+₹{mortgageVal})
                        </CandyButton>
                      )}

                      {/* Sell Property back to Bank */}
                      {houses === 0 && !isMortgaged && (
                        <CandyButton
                          size="xs"
                          variant="danger"
                          onClick={() => engine.sellProperty(tile.step)}
                          icon={<SellIcon sx={{ fontSize: 14 }} />}
                        >
                          Sell (+₹{sellPropVal})
                        </CandyButton>
                      )}
                    </Box>
                  </Box>
                );
              })}
            </Box>
          )}
        </Box>

        {/* ── 5. STATE ECONOMY RULES ── */}
        <CandyCard accent="none" padding="sm" style={{ flexShrink: 0, backgroundColor: '#ffffff', borderRadius: '14px' }}>
          <Typography sx={{ color: '#0f172a', fontWeight: 850, fontSize: '11px', mb: 1, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            State Commercial Banking Charter
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.6 }}>
            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>Starting Capital:</Typography>
            <Typography variant="caption" sx={{ color: '#0f172a', fontWeight: 800 }}>₹5,000</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.6 }}>
            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>START Salary / Exact Bonus:</Typography>
            <Typography variant="caption" sx={{ color: '#10b981', fontWeight: 800 }}>+₹1,000 / +₹2,000</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.6 }}>
            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>Central Bank Tile Landing:</Typography>
            <Typography variant="caption" sx={{ color: '#10b981', fontWeight: 800 }}>+₹250 to All Active Players</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>Commercial Taxes:</Typography>
            <Typography variant="caption" sx={{ color: '#f43f5e', fontWeight: 800 }}>-₹500 / -₹800</Typography>
          </Box>
        </CandyCard>

        {/* ── 6. AUDIT LEDGER ── */}
        <Box sx={{ flexShrink: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 1 }}>
            <HistoryEduIcon sx={{ fontSize: 17, color: '#0f172a' }} />
            <Typography sx={{ fontWeight: 850, fontSize: '12px', color: '#0f172a', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              TRANSACTION AUDIT LEDGER ({financialLogs.length})
            </Typography>
          </Box>

          <List disablePadding sx={{ display: 'flex', flexDirection: 'column', gap: 0.6 }}>
            {financialLogs.map((log) => (
              <ListItem
                key={log.id}
                disableGutters
                sx={{
                  backgroundColor: '#ffffff',
                  border: '1px solid rgba(226, 232, 240, 0.85)',
                  borderRadius: '10px',
                  px: 1.2,
                  py: 0.6
                }}
              >
                <ListItemIcon sx={{ minWidth: 24 }}>
                  {log.type === 'buy' || log.type === 'rent' ? (
                    <Box sx={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#10b981' }} />
                  ) : log.type === 'tax' ? (
                    <Box sx={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#f43f5e' }} />
                  ) : (
                    <Box sx={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#3b82f6' }} />
                  )}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography sx={{ fontSize: '11px', color: '#1e293b', fontWeight: 600, lineHeight: 1.35, fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
                      {log.text}
                    </Typography>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Box>
      </Box>
    </Drawer>
  );
};
