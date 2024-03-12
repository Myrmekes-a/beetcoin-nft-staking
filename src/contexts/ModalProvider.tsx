import React, { createContext, useContext, useState, ReactNode } from "react";

// Define the type for your modal component props
interface ModalProps {
  isOpen: boolean;
  closeModal: () => void;
}

// Define the type for your modal context
interface ModalContextType {
  openModal: (content: ReactNode) => void;
  closeModal: () => void;
}

// Create the modal context
const ModalContext = createContext<ModalContextType | undefined>(undefined);

// Define the modal provider component
export const ModalProvider = ({ children }: { children: ReactNode }) => {
  const [modalContent, setModalContent] = useState<ReactNode | null>(null);

  const openModal = (content: ReactNode) => {
    setModalContent(content);
  };

  const closeModal = () => {
    setModalContent(null);
  };

  return (
    <ModalContext.Provider value={{ openModal, closeModal }}>
      {children}
      {modalContent && <>{modalContent}</>}
    </ModalContext.Provider>
  );
};

// Custom hook to access the modal context
export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
};
