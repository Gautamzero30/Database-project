import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SQL Level",
  description:
    "Play SQL missions from beginner to advanced in SQL Vision Coders SQL playground.",
  alternates: {
    canonical: "/",
  },
};

export default function LevelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
