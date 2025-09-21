"use client";

import React from "react";

import { Modal, type ModalProps } from "venomous-ui-react/components";

const CustomModal = React.memo<ModalProps>(({ style, ...props }) => {
  return (
    <Modal
      portalTargetId="root"
      style={{
        backgroundImage: "url('/assets/backgrounds/01.avif')",
        backgroundPosition: "center",
        backgroundSize: "cover",
        transition: "none",
        ...style,
      }}
      {...props}
    />
  );
});

CustomModal.displayName = "CustomModal";
export default CustomModal;
