import { create } from "zustand";

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
}

const useNotificationModal = create<NotificationModalProps>((set) => ({
  isOpen: false,
  onClose: () => set({ isOpen: false }),
  onOpen: () => set({ isOpen: true }),
}));

export default useNotificationModal;
