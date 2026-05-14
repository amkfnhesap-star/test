"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  description?: string;
  isLoading?: boolean;
}

export function DeleteModal({ isOpen, onClose, onConfirm, description, isLoading }: DeleteModalProps) {
  const [value, setValue] = useState("");

  const handleClose = () => {
    setValue("");
    onClose();
  };

  const handleConfirm = () => {
    if (value === "DELETE") {
      onConfirm();
      setValue("");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Confirm Deletion" size="sm">
      <div className="space-y-4">
        {description && <p className="text-sm text-zinc-400">{description}</p>}
        <p className="text-sm text-zinc-300">
          Type <span className="font-mono text-red-400 font-semibold">DELETE</span> to confirm.
        </p>
        <input
          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-500"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleConfirm()}
          placeholder="DELETE"
          autoFocus
        />
        <div className="flex gap-2 justify-end">
          <Button variant="ghost" size="sm" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            variant="danger"
            size="sm"
            disabled={value !== "DELETE"}
            isLoading={isLoading}
            onClick={handleConfirm}
          >
            Delete
          </Button>
        </div>
      </div>
    </Modal>
  );
}
