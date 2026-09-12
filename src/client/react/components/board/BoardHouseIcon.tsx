import React from 'react';

interface BoardHouseIconProps {
  houses: number;
  color: string;
  edge?: 'top' | 'bottom' | 'left' | 'right' | 'corner';
}

export const BoardHouseIcon: React.FC<BoardHouseIconProps> = ({
  houses,
  color,
  edge = 'bottom'
}) => {
  // Edge direction:
  // 'top' -> Tab hangs DOWN into center board (flat top, pointed bottom tip) - e.g. Jaipur in reference image
  // 'bottom' -> Tab extends UP into center board (flat bottom, pointed top tip)
  // 'left' -> Tab extends RIGHT into center board (flat left, pointed right tip) - e.g. orange tile in reference image
  // 'right' -> Tab extends LEFT into center board (flat right, pointed left tip)
  const isTop = edge === 'top';
  const isBottom = edge === 'bottom';
  const isLeft = edge === 'left';
  const isRight = edge === 'right';

  // --------------------------------------------------------------------------
  // Level 5: Grand Vyapar Luxury Hotel (Red & Gold Landmark Hotel Pennant)
  // --------------------------------------------------------------------------
  if (houses >= 5) {
    const W = isLeft || isRight ? 24 : 26;
    const H = isLeft || isRight ? 26 : 24;

    let pathD = '';
    if (isTop) {
      pathD = `M 0 0 L ${W} 0 L ${W} ${H - 5} L ${W / 2} ${H} L 0 ${H - 5} Z`;
    } else if (isBottom) {
      pathD = `M 0 ${H} L ${W} ${H} L ${W} 5 L ${W / 2} 0 L 0 5 Z`;
    } else if (isLeft) {
      pathD = `M 0 0 L 0 ${H} L ${W - 5} ${H} L ${W} ${H / 2} L ${W - 5} 0 Z`;
    } else {
      pathD = `M ${W} 0 L ${W} ${H} L 5 ${H} L 0 ${H / 2} L 5 0 Z`;
    }

    const cx = isLeft ? 10 : isRight ? 14 : W / 2;
    const cy = isTop ? 10 : isBottom ? 14 : H / 2;

    return (
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', overflow: 'visible' }}>
        {/* Pennant Flag Tab Body */}
        <path d={pathD} fill="#b91c1c" stroke="#fef08a" strokeWidth="1.2" strokeLinejoin="round" />
        {/* Hotel Spire */}
        <path d={`M ${cx} ${cy - 8.5} L ${cx} ${cy - 5.5}`} stroke="#fef08a" strokeWidth="1.5" strokeLinecap="round" />
        <path d={`M ${cx} ${cy - 8.5} L ${cx + 3} ${cy - 7} L ${cx} ${cy - 5.5} Z`} fill="#fef08a" />
        {/* Hotel Building Body */}
        <rect x={cx - 7.5} y={cy - 5.5} width="15" height="12" rx="1" fill="#dc2626" stroke="#fef08a" strokeWidth="0.9" />
        {/* Lit Golden Windows */}
        <rect x={cx - 5.5} y={cy - 3.8} width="2.4" height="2.4" fill="#fef08a" rx="0.3" />
        <rect x={cx - 1.2} y={cy - 3.8} width="2.4" height="2.4" fill="#fef08a" rx="0.3" />
        <rect x={cx + 3.1} y={cy - 3.8} width="2.4" height="2.4" fill="#fef08a" rx="0.3" />
        <rect x={cx - 5.5} y={cy + 0.2} width="2.4" height="2.4" fill="#fef08a" rx="0.3" />
        <rect x={cx - 1.2} y={cy + 0.2} width="2.4" height="2.4" fill="#fef08a" rx="0.3" />
        <rect x={cx + 3.1} y={cy + 0.2} width="2.4" height="2.4" fill="#fef08a" rx="0.3" />
        {/* Grand Entrance */}
        <rect x={cx - 2} y={cy + 3.8} width="4" height="2.7" fill="#ffffff" rx="0.4" />
      </svg>
    );
  }

  // --------------------------------------------------------------------------
  // Level 4: 4 Houses (Quad residential complex)
  // --------------------------------------------------------------------------
  if (houses === 4) {
    const isVertical = isLeft || isRight;
    const W = isVertical ? 22 : 46;
    const H = isVertical ? 46 : 22;

    let pathD = '';
    if (isTop) {
      pathD = `M 0 0 L ${W} 0 L ${W} ${H - 4.5} L ${W / 2} ${H} L 0 ${H - 4.5} Z`;
    } else if (isBottom) {
      pathD = `M 0 ${H} L ${W} ${H} L ${W} 4.5 L ${W / 2} 0 L 0 4.5 Z`;
    } else if (isLeft) {
      pathD = `M 0 0 L 0 ${H} L ${W - 4.5} ${H} L ${W} ${H / 2} L ${W - 4.5} 0 Z`;
    } else {
      pathD = `M ${W} 0 L ${W} ${H} L 4.5 ${H} L 0 ${H / 2} L 4.5 0 Z`;
    }

    return (
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', overflow: 'visible' }}>
        <path d={pathD} fill={color} stroke="rgba(0, 0, 0, 0.45)" strokeWidth="1" strokeLinejoin="round" />
        {isVertical
          ? [0, 9.5, 19, 28.5].map((offsetY, idx) => {
              const cx = isLeft ? 9 : 13;
              const cy = 6 + offsetY;
              return (
                <g key={idx}>
                  <path d={`M ${cx} ${cy - 4} L ${cx + 5} ${cy - 0.5} H ${cx + 4} V ${cy + 4.5} H ${cx - 4} V ${cy - 0.5} H ${cx - 5} Z`} fill="#ffffff" />
                  <rect x={cx - 1.2} y={cy + 1.2} width="2.4" height="3.3" fill={color} rx="0.3" />
                </g>
              );
            })
          : [0, 10.5, 21, 31.5].map((offsetX, idx) => {
              const cx = 7 + offsetX;
              const cy = isTop ? 8 : 14;
              return (
                <g key={idx}>
                  <path d={`M ${cx} ${cy - 4.5} L ${cx + 4.5} ${cy - 1} H ${cx + 3.5} V ${cy + 4} H ${cx - 3.5} V ${cy - 1} H ${cx - 4.5} Z`} fill="#ffffff" />
                  <rect x={cx - 1.2} y={cy + 1} width="2.4" height="3" fill={color} rx="0.3" />
                </g>
              );
            })}
      </svg>
    );
  }

  // --------------------------------------------------------------------------
  // Level 3: 3 Houses (Triplex row)
  // --------------------------------------------------------------------------
  if (houses === 3) {
    const isVertical = isLeft || isRight;
    const W = isVertical ? 22 : 36;
    const H = isVertical ? 36 : 22;

    let pathD = '';
    if (isTop) {
      pathD = `M 0 0 L ${W} 0 L ${W} ${H - 4.5} L ${W / 2} ${H} L 0 ${H - 4.5} Z`;
    } else if (isBottom) {
      pathD = `M 0 ${H} L ${W} ${H} L ${W} 4.5 L ${W / 2} 0 L 0 4.5 Z`;
    } else if (isLeft) {
      pathD = `M 0 0 L 0 ${H} L ${W - 4.5} ${H} L ${W} ${H / 2} L ${W - 4.5} 0 Z`;
    } else {
      pathD = `M ${W} 0 L ${W} ${H} L 4.5 ${H} L 0 ${H / 2} L 4.5 0 Z`;
    }

    return (
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', overflow: 'visible' }}>
        <path d={pathD} fill={color} stroke="rgba(0, 0, 0, 0.45)" strokeWidth="1" strokeLinejoin="round" />
        {isVertical
          ? [0, 10.5, 21].map((offsetY, idx) => {
              const cx = isLeft ? 9 : 13;
              const cy = 7.5 + offsetY;
              return (
                <g key={idx}>
                  <path d={`M ${cx} ${cy - 4.5} L ${cx + 5} ${cy - 1} H ${cx + 4} V ${cy + 4.5} H ${cx - 4} V ${cy - 1} H ${cx - 5} Z`} fill="#ffffff" />
                  <rect x={cx - 1.2} y={cy + 1.2} width="2.4" height="3.3" fill={color} rx="0.3" />
                </g>
              );
            })
          : [0, 11, 22].map((offsetX, idx) => {
              const cx = 7 + offsetX;
              const cy = isTop ? 8.5 : 13.5;
              return (
                <g key={idx}>
                  <path d={`M ${cx} ${cy - 4.5} L ${cx + 4.8} ${cy - 1} H ${cx + 3.8} V ${cy + 4} H ${cx - 3.8} V ${cy - 1} H ${cx - 4.8} Z`} fill="#ffffff" />
                  <rect x={cx - 1.2} y={cy + 1} width="2.4" height="3" fill={color} rx="0.3" />
                </g>
              );
            })}
      </svg>
    );
  }

  // --------------------------------------------------------------------------
  // Level 2: 2 Houses (Twin houses)
  // --------------------------------------------------------------------------
  if (houses === 2) {
    const isVertical = isLeft || isRight;
    const W = isVertical ? 22 : 28;
    const H = isVertical ? 28 : 22;

    let pathD = '';
    if (isTop) {
      pathD = `M 0 0 L ${W} 0 L ${W} ${H - 4.5} L ${W / 2} ${H} L 0 ${H - 4.5} Z`;
    } else if (isBottom) {
      pathD = `M 0 ${H} L ${W} ${H} L ${W} 4.5 L ${W / 2} 0 L 0 4.5 Z`;
    } else if (isLeft) {
      pathD = `M 0 0 L 0 ${H} L ${W - 4.5} ${H} L ${W} ${H / 2} L ${W - 4.5} 0 Z`;
    } else {
      pathD = `M ${W} 0 L ${W} ${H} L 4.5 ${H} L 0 ${H / 2} L 4.5 0 Z`;
    }

    return (
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', overflow: 'visible' }}>
        <path d={pathD} fill={color} stroke="rgba(0, 0, 0, 0.45)" strokeWidth="1" strokeLinejoin="round" />
        {isVertical
          ? [0, 11.5].map((offsetY, idx) => {
              const cx = isLeft ? 9 : 13;
              const cy = 8.5 + offsetY;
              return (
                <g key={idx}>
                  <path d={`M ${cx} ${cy - 4.5} L ${cx + 5} ${cy - 1} H ${cx + 4} V ${cy + 4.5} H ${cx - 4} V ${cy - 1} H ${cx - 5} Z`} fill="#ffffff" />
                  <rect x={cx - 1.2} y={cy + 1.2} width="2.4" height="3.3" fill={color} rx="0.3" />
                </g>
              );
            })
          : [0, 12].map((offsetX, idx) => {
              const cx = 8 + offsetX;
              const cy = isTop ? 8.5 : 13.5;
              return (
                <g key={idx}>
                  <path d={`M ${cx} ${cy - 4.5} L ${cx + 5} ${cy - 1} H ${cx + 4} V ${cy + 4.5} H ${cx - 4} V ${cy - 1} H ${cx - 5} Z`} fill="#ffffff" />
                  <rect x={cx - 1.2} y={cy + 1.2} width="2.4" height="3.3" fill={color} rx="0.3" />
                </g>
              );
            })}
      </svg>
    );
  }

  // --------------------------------------------------------------------------
  // Level 1: 1 House Built (Single developed suburban house with chimney)
  // --------------------------------------------------------------------------
  if (houses === 1) {
    const W = isLeft || isRight ? 21 : 19;
    const H = isLeft || isRight ? 19 : 21;

    let pathD = '';
    if (isTop) {
      pathD = `M 0 0 L ${W} 0 L ${W} ${H - 4.5} L ${W / 2} ${H} L 0 ${H - 4.5} Z`;
    } else if (isBottom) {
      pathD = `M 0 ${H} L ${W} ${H} L ${W} 4.5 L ${W / 2} 0 L 0 4.5 Z`;
    } else if (isLeft) {
      pathD = `M 0 0 L 0 ${H} L ${W - 4.5} ${H} L ${W} ${H / 2} L ${W - 4.5} 0 Z`;
    } else {
      pathD = `M ${W} 0 L ${W} ${H} L 4.5 ${H} L 0 ${H / 2} L 4.5 0 Z`;
    }

    const cx = isLeft ? 8.5 : isRight ? 12.5 : W / 2;
    const cy = isTop ? 8.5 : isBottom ? 12.5 : H / 2;

    return (
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', overflow: 'visible' }}>
        <path d={pathD} fill={color} stroke="rgba(0, 0, 0, 0.45)" strokeWidth="1" strokeLinejoin="round" />
        {/* Chimney */}
        <rect x={cx + 2.5} y={cy - 5.5} width="2" height="3" fill="#ffffff" />
        {/* House Body & Roof */}
        <path d={`M ${cx} ${cy - 5} L ${cx + 6} ${cy - 1} H ${cx + 4.8} V ${cy + 5} H ${cx - 4.8} V ${cy - 1} H ${cx - 6} Z`} fill="#ffffff" />
        {/* Door */}
        <rect x={cx - 1.4} y={cy + 1.2} width="2.8" height="3.8" fill={color} rx="0.3" />
        {/* Window */}
        <rect x={cx - 3.8} y={cy - 0.2} width="1.8" height="1.8" fill={color} rx="0.2" />
      </svg>
    );
  }

  // --------------------------------------------------------------------------
  // Level 0: Default Owned Property (Authentic Pennant Tab matching reference)
  // --------------------------------------------------------------------------
  const W = isLeft || isRight ? 18 : 16;
  const H = isLeft || isRight ? 16 : 18;

  let pathD = '';
  if (isTop) {
    pathD = `M 0 0 L ${W} 0 L ${W} ${H - 4} L ${W / 2} ${H} L 0 ${H - 4} Z`;
  } else if (isBottom) {
    pathD = `M 0 ${H} L ${W} ${H} L ${W} 4 L ${W / 2} 0 L 0 4 Z`;
  } else if (isLeft) {
    pathD = `M 0 0 L 0 ${H} L ${W - 4} ${H} L ${W} ${H / 2} L ${W - 4} 0 Z`;
  } else {
    pathD = `M ${W} 0 L ${W} ${H} L 4 ${H} L 0 ${H / 2} L 4 0 Z`;
  }

  const cx = isLeft ? 7.5 : isRight ? 10.5 : W / 2;
  const cy = isTop ? 7.5 : isBottom ? 10.5 : H / 2;

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', overflow: 'visible' }}>
      {/* Pennant Tab in Owner's Color with crisp border */}
      <path d={pathD} fill={color} stroke="rgba(0, 0, 0, 0.45)" strokeWidth="1" strokeLinejoin="round" />
      {/* Simple, clean miniature ownership house silhouette in crisp white */}
      <path d={`M ${cx} ${cy - 4} L ${cx + 4.5} ${cy - 0.5} H ${cx + 3.5} V ${cy + 4} H ${cx - 3.5} V ${cy - 0.5} H ${cx - 4.5} Z`} fill="#ffffff" />
      {/* Clean door cutout revealing player color */}
      <rect x={cx - 1.2} y={cy + 0.8} width="2.4" height="3.2" fill={color} rx="0.3" />
    </svg>
  );
};


