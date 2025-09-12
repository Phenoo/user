import { create } from "zustand";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
}

const useLoadingModal = create<ModalProps>((set) => ({
  isOpen: false,
  onClose: () => set({ isOpen: false }),
  onOpen: () => set({ isOpen: true }),
}));

export default useLoadingModal;
