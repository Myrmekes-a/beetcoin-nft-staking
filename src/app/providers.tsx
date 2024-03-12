"use client";
import React, { ReactNode } from "react";
import { PageProvider } from "@/contexts/PageContext";
import { SolanaWalletProvider } from "@/contexts/SolanaWalletProvider";
import { QueryClientProvider, QueryClient } from "react-query";
import { ToastContainer } from "react-toastify";
import { ModalProvider } from "@/contexts/ModalProvider";

const queryClient = new QueryClient();

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <SolanaWalletProvider>
      <QueryClientProvider client={queryClient}>
        <ModalProvider>
          <PageProvider>
            {children}
            <ToastContainer pauseOnFocusLoss={false} theme="colored" />
          </PageProvider>
        </ModalProvider>
      </QueryClientProvider>
    </SolanaWalletProvider>
  );
}
