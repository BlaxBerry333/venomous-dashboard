"use client";

import React from "react";

import { Popover, type PopoverProps } from "venomous-ui-react/components";

const CustomPopover = React.memo<PopoverProps>(({ contentStyle, triggerStyle, ...props }) => {
  return (
    <Popover
      trigger="click"
      alignment="center"
      direction="bottom"
      triggerStyle={{
        display: "flex",
        alignItems: "center",
        ...triggerStyle,
      }}
      contentStyle={{
        backgroundImage: "url('/assets/backgrounds/01.avif')",
        backgroundPosition: "center",
        backgroundSize: "cover",
        transition: "none",
        ...contentStyle,
      }}
      {...props}
    />
  );
});

CustomPopover.displayName = "CustomPopover";
export default CustomPopover;
