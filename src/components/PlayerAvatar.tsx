// src/components/PlayerAvatar.tsx
import React from "react";
import { getCartoonAvatarDataUrl, getPlayerAvatarStyle } from "../utils/avatarUtils";

export type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl" | "xxl" | number;

interface PlayerAvatarProps {
  name: string;
  size?: AvatarSize;
  teamColor?: string;
  showBorder?: boolean;
  showFlag?: boolean;
  traitIcon?: string;
  className?: string;
  style?: React.CSSProperties;
}

const SIZE_MAP: Record<string, number> = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 56,
  xl: 96,
  xxl: 120,
};

export const PlayerAvatar: React.FC<PlayerAvatarProps> = ({
  name,
  size = "md",
  teamColor = "#0F6B45",
  showBorder = true,
  showFlag = false,
  traitIcon,
  className = "",
  style = {},
}) => {
  const pixelSize = typeof size === "number" ? size : SIZE_MAP[size] || 40;
  const avatarUrl = getCartoonAvatarDataUrl(name, teamColor);
  const avatarStyle = getPlayerAvatarStyle(name, teamColor);

  return (
    <div
      className={`player-avatar-container ${className}`}
      style={{
        position: "relative",
        width: pixelSize,
        height: pixelSize,
        flexShrink: 0,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        ...style,
      }}
      title={name}
    >
      <img
        src={avatarUrl}
        alt={name}
        style={{
          width: "100%",
          height: "100%",
          borderRadius: "50%",
          objectFit: "cover",
          border: showBorder ? "1px solid #E0E0E0" : "none",
          background: avatarStyle.bgFill,
          display: "block",
        }}
      />

      {/* Optional Country Flag */}
      {showFlag && avatarStyle.flag && (
        <span
          style={{
            position: "absolute",
            bottom: "-2px",
            right: "-2px",
            fontSize: pixelSize >= 56 ? "14px" : "10px",
            lineHeight: 1,
            background: "#FFFFFF",
            borderRadius: "50%",
            padding: "1px",
            boxShadow: "0 1px 2px rgba(0,0,0,0.15)",
          }}
        >
          {avatarStyle.flag}
        </span>
      )}

      {/* Optional Personality Trait Badge */}
      {traitIcon && (
        <span
          style={{
            position: "absolute",
            top: "-3px",
            right: "-3px",
            fontSize: pixelSize >= 56 ? "14px" : "10px",
            lineHeight: 1,
            background: "#FFFFFF",
            borderRadius: "50%",
            padding: "2px",
            border: "1px solid #E0E0E0",
            boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
          }}
          title="Personality Trait"
        >
          {traitIcon}
        </span>
      )}
    </div>
  );
};
