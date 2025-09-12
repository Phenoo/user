import React from "react";
import NotificationsSheet from "./modal/notifications-sheet";
import LoadingModal from "./modal/loading-modal";

const ModalProvider = () => {
  return (
    <>
      <NotificationsSheet />
      <LoadingModal />
    </>
  );
};

export default ModalProvider;
