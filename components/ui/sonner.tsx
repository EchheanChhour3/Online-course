"use client";

import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const AnimatedCheck = () => (
  <div className="relative h-6 w-6 flex items-center justify-center">
    <div
      className="absolute inset-0 rounded-full bg-green-600"
      style={{
        animation: "scaleIn 0.4s ease-out forwards",
      }}
    />
    <svg
      className="absolute h-4 w-4 text-white"
      style={{
        animation: "rotateIn 0.6s ease-out 0.2s forwards",
      }}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path d="M5 13l4 4L19 7" />
    </svg>
    <style jsx>{`
      @keyframes scaleIn {
        0% {
          transform: scale(0);
          opacity: 0;
        }
        50% {
          transform: scale(1.1);
        }
        100% {
          transform: scale(1);
          opacity: 1;
        }
      }

      @keyframes rotateIn {
        0% {
          transform: rotate(-180deg) scale(0);
          opacity: 0;
        }
        50% {
          transform: rotate(-90deg) scale(0.5);
          opacity: 0.5;
        }
        100% {
          transform: rotate(0deg) scale(1);
          opacity: 1;
        }
      }
    `}</style>
  </div>
);

const AnimatedX = () => (
  <div className="relative h-6 w-6 flex items-center justify-center">
    <div
      className="absolute inset-0 rounded-full bg-red-600"
      style={{
        animation: "scaleIn 0.4s ease-out forwards",
      }}
    />
    <svg
      className="absolute h-4 w-4 text-white"
      style={{
        animation: "rotateIn 0.6s ease-out 0.2s forwards",
      }}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path d="M6 6l12 12M6 18L18 6" />
    </svg>
    <style jsx>{`
      @keyframes scaleIn {
        0% {
          transform: scale(0);
          opacity: 0;
        }
        50% {
          transform: scale(1.1);
        }
        100% {
          transform: scale(1);
          opacity: 1;
        }
      }

      @keyframes rotateIn {
        0% {
          transform: rotate(-180deg) scale(0);
          opacity: 0;
        }
        50% {
          transform: rotate(-90deg) scale(0.5);
          opacity: 0.5;
        }
        100% {
          transform: rotate(0deg) scale(1);
          opacity: 1;
        }
      }
    `}</style>
  </div>
);

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toaster]:text-muted-foreground",
          success: "bg-green-500 text-white border-green-600",
          error: "bg-red-500 text-white border-red-600",
          info: "bg-blue-500 text-white border-blue-600",
          icon: "mr-6",
        },
      }}
      icons={{
        success: <AnimatedCheck />,
        error: <AnimatedX />,
      }}
      {...props}
    />
  );
};

export { Toaster };
