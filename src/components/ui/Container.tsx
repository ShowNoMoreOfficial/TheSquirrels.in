import type { ReactNode } from "react";

type ContainerProps = {
  children: ReactNode;
  /** "page" = full grid width (~1200px); "measure" = narrow reading column (~680px) */
  variant?: "page" | "measure";
  className?: string;
};

const VARIANTS = {
  page: "max-w-[1200px]",
  measure: "max-w-[680px]",
} as const;

export function Container({
  children,
  variant = "page",
  className = "",
}: ContainerProps) {
  return (
    <div className={`mx-auto w-full px-4 sm:px-6 ${VARIANTS[variant]} ${className}`}>
      {children}
    </div>
  );
}
