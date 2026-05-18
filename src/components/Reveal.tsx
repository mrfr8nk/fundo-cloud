import { useEffect, useRef, useState, type ReactNode, type CSSProperties } from "react";
import { cn } from "@/lib/utils";

type Props = {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  as?: keyof JSX.IntrinsicElements;
};

export function Reveal({ children, className, delay = 0, y = 24, as: Tag = "div" }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) { setVisible(true); io.disconnect(); }
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -50px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const style: CSSProperties = {
    transform: visible ? "translateY(0)" : `translateY(${y}px)`,
    opacity: visible ? 1 : 0,
    transition: `transform 700ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms, opacity 700ms ease ${delay}ms`,
    willChange: "transform, opacity",
  };

  const Comp = Tag as any;
  return <Comp ref={ref} style={style} className={cn(className)}>{children}</Comp>;
}
