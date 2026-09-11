import React, { useRef, useEffect } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import { GameLogEntry } from '../../../game-engine/GameEngine';
import './ActivityLogDrawer.css';

interface ActivityLogDrawerProps {
  open: boolean;
  onClose: () => void;
  logs: GameLogEntry[];
}

export const ActivityLogDrawer: React.FC<ActivityLogDrawerProps> = ({
  open,
  onClose,
  logs
}) => {
  const logsEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (open) {
      logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [open, logs.length]);

  if (!open) return null;

  return (
    <div className="activity-drawer-overlay" onClick={onClose}>
      <div className="activity-drawer-panel" onClick={(e) => e.stopPropagation()}>
        {/* Drawer Header */}
        <div className="activity-drawer-header">
          <div className="activity-header-left">
            <FormatListBulletedIcon sx={{ fontSize: 18, color: '#3b82f6' }} />
            <span className="activity-header-title">Match Activity Log</span>
          </div>
          <button className="activity-drawer-close-btn" onClick={onClose}>
            <CloseIcon sx={{ fontSize: 16 }} />
          </button>
        </div>

        {/* Logs List */}
        <div className="activity-drawer-body">
          {logs.length === 0 ? (
            <div className="activity-empty-state">
              No game events logged yet.
            </div>
          ) : (
            logs.map((log) => {
              const text = typeof log === 'string' ? log : log.text;
              const type = typeof log === 'object' && log.type ? log.type : 'info';

              let bulletClass = 'bullet-default';
              if (type === 'roll') bulletClass = 'bullet-roll';
              else if (type === 'buy' || type === 'pass') bulletClass = 'bullet-money';
              else if (type === 'rent') bulletClass = 'bullet-turn';
              else if (type === 'tax' || type === 'jail') bulletClass = 'bullet-danger';

              return (
                <div key={typeof log === 'object' ? log.id : Math.random()} className="activity-log-item">
                  <span className={`activity-log-bullet ${bulletClass}`} />
                  <span className="activity-log-text">{text}</span>
                </div>
              );
            })
          )}
          <div ref={logsEndRef} />
        </div>
      </div>
    </div>
  );
};
