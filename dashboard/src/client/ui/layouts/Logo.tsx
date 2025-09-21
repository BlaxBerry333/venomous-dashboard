"use client";

import Image from "next/image";
import React from "react";

const Logo = React.memo<{
  serviceName: string;
  size: number;
}>(({ serviceName, size }) => {
  return (
    <Image
      src={`/assets/logos/${serviceName}.webp`}
      alt={serviceName}
      width={size}
      height={size}
      draggable={false}
      loading="lazy"
      style={{ userSelect: "none" }}
    />
  );
});

Logo.displayName = "Logo";
export default Logo;
