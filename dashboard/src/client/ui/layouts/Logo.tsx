"use client";

import Image from "next/image";
import React from "react";

import type { SERVICE_NAMES } from "@/client/routes/paths";

const Logo = React.memo<{
  serviceName: (typeof SERVICE_NAMES)[keyof typeof SERVICE_NAMES];
  size: number;
  style?: React.CSSProperties;
}>(({ serviceName, size, style }) => {
  return (
    <Image
      src={`/assets/logos/${serviceName}.webp`}
      alt={serviceName}
      width={size}
      height={size}
      draggable={false}
      loading="lazy"
      style={{ userSelect: "none", ...style }}
    />
  );
});

Logo.displayName = "Logo";
export default Logo;
