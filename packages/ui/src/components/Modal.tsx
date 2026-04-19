"use client";

import * as React from "react";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { X } from "lucide-react";
import { cn } from "../lib/utils";

type ModalProps = DialogPrimitive.Root.Props & {
  children: React.ReactNode;
};

function Modal({ children, ...props }: ModalProps) {
  return <DialogPrimitive.Root {...props}>{children}</DialogPrimitive.Root>;
}

type ModalTriggerProps = DialogPrimitive.Trigger.Props;

function ModalTrigger({ className, ...props }: ModalTriggerProps) {
  return <DialogPrimitive.Trigger className={className} {...props} />;
}

type ModalPortalProps = DialogPrimitive.Portal.Props;

function ModalPortal(props: ModalPortalProps) {
  return <DialogPrimitive.Portal {...props} />;
}

type ModalOverlayProps = DialogPrimitive.Backdrop.Props & {
  className?: string;
};

function ModalOverlay({ className, ...props }: ModalOverlayProps) {
  return (
    <DialogPrimitive.Backdrop
      className={cn(
        "fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 transition-opacity duration-200",
        className
      )}
      {...props}
    />
  );
}

type ModalContentProps = DialogPrimitive.Popup.Props & {
  className?: string;
};

function ModalContent({ className, children, ...props }: ModalContentProps) {
  return (
    <DialogPrimitive.Portal>
      <ModalOverlay />
      <DialogPrimitive.Popup
        className={cn(
          "fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-full max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl border border-border bg-background p-6 shadow-xl data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 transition-opacity duration-200",
          className
        )}
        {...props}
      >
        {children}
      </DialogPrimitive.Popup>
    </DialogPrimitive.Portal>
  );
}

type ModalHeaderProps = React.HTMLAttributes<HTMLDivElement>;

function ModalHeader({ className, ...props }: ModalHeaderProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 mb-4",
        className
      )}
      {...props}
    />
  );
}

type ModalTitleProps = DialogPrimitive.Title.Props & {
  className?: string;
};

function ModalTitle({ className, ...props }: ModalTitleProps) {
  return (
    <DialogPrimitive.Title
      className={cn("text-lg font-semibold leading-none tracking-tight", className)}
      {...props}
    />
  );
}

type ModalDescriptionProps = DialogPrimitive.Description.Props & {
  className?: string;
};

function ModalDescription({ className, ...props }: ModalDescriptionProps) {
  return (
    <DialogPrimitive.Description
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

type ModalCloseProps = DialogPrimitive.Close.Props & {
  className?: string;
};

function ModalClose({ className, ...props }: ModalCloseProps) {
  return (
    <DialogPrimitive.Close
      className={cn(
        "rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
        className
      )}
      {...props}
    >
      <X className="size-4" />
      <span className="sr-only">Close</span>
    </DialogPrimitive.Close>
  );
}

type ModalFooterProps = React.HTMLAttributes<HTMLDivElement>;

function ModalFooter({ className, ...props }: ModalFooterProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-end gap-2 mt-6 pt-4 border-t border-border",
        className
      )}
      {...props}
    />
  );
}

export {
  Modal,
  ModalTrigger,
  ModalPortal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalClose,
  ModalFooter,
};
export type {
  ModalProps,
  ModalTriggerProps,
  ModalPortalProps,
  ModalOverlayProps,
  ModalContentProps,
  ModalHeaderProps,
  ModalTitleProps,
  ModalDescriptionProps,
  ModalCloseProps,
  ModalFooterProps,
};
