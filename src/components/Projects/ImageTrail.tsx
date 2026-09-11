"use client";

import {
  Children,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from "react";
import {
  AnimationSequence,
  motion,
  Target,
  Transition,
  useAnimate,
  useAnimationFrame,
} from "framer-motion";
import { useMouseVector } from "./use-mouse-vector";
import styles from "./ImageTrail.module.css";

type TrailSegment = [Target, Transition];
type TrailAnimationSequence = TrailSegment[];

interface ImageTrailProps {
  children: React.ReactNode;
  containerRef?: React.RefObject<HTMLElement | null>;
  newOnTop?: boolean;
  rotationRange?: number;
  animationSequence?: TrailAnimationSequence;
  interval?: number;
  minDistance?: number;
  velocityDependentSpawn?: boolean;
  active?: boolean;
  itemWidth?: number;
  itemHeight?: number;
}

const IDLE_DELAY = 900;
const IDLE_PERIOD_X = 6200;
const IDLE_PERIOD_Y = 5100;
const IDLE_SPAWN_INTERVAL = 220;
const IDLE_MIN_DISTANCE = 44;
const DEFAULT_ITEM_WIDTH = 128;
const DEFAULT_ITEM_HEIGHT = 88;

interface TrailSlotHandle {
  trigger: (x: number, y: number, rotation: number, zIndex: number) => void;
}

interface TrailSlotProps {
  child: React.ReactNode;
  animationSequence: TrailAnimationSequence;
  itemWidth: number;
  itemHeight: number;
}

const TrailSlot = forwardRef<TrailSlotHandle, TrailSlotProps>(
  ({ child, animationSequence, itemWidth, itemHeight }, ref) => {
    const [scope, animate] = useAnimate();

    useImperativeHandle(
      ref,
      () => ({
        trigger(x, y, rotation, zIndex) {
          const node = scope.current;
          if (!node) return;

          node.style.zIndex = String(zIndex);

          const offsetX = x - itemWidth / 2;
          const offsetY = y - itemHeight / 2;

          const sequence = [
            [node, { left: offsetX, top: offsetY, rotate: rotation, opacity: 1, scale: 0 }, { duration: 0 }],
            ...animationSequence.map((segment) => [node, ...segment]),
          ] as AnimationSequence;

          animate(sequence);
        },
      }),
      [animate, animationSequence, itemWidth, itemHeight]
    );

    return (
      <motion.div
        ref={scope}
        className={styles.trailItem}
        style={{ opacity: 0, scale: 0, width: itemWidth, height: itemHeight }}
      >
        {child}
      </motion.div>
    );
  }
);
TrailSlot.displayName = "TrailSlot";

const ImageTrail = ({
  children,
  newOnTop = true,
  rotationRange = 15,
  containerRef,
  animationSequence = [
    [{ scale: 1.2 }, { duration: 0.1, ease: "circOut" }],
    [{ scale: 0 }, { duration: 0.5, ease: "circIn" }],
  ],
  interval = 100,
  minDistance = 40,
  active = true,
  itemWidth = DEFAULT_ITEM_WIDTH,
  itemHeight = DEFAULT_ITEM_HEIGHT,
}: ImageTrailProps) => {
  const lastAddedTimeRef = useRef<number>(0);
  const { position: mousePosition } = useMouseVector(containerRef);
  const lastMousePosRef = useRef(mousePosition);
  const lastSpawnPosRef = useRef(mousePosition);
  const nextSlotRef = useRef(0);
  const zCounterRef = useRef(1);
  const isHoveringRef = useRef(false);
  const isVisibleRef = useRef(true);
  const idleSinceRef = useRef<number | null>(null);
  const slotRefs = useRef<(TrailSlotHandle | null)[]>([]);

  const childrenArray = useMemo(() => Children.toArray(children), [children]);

  useEffect(() => {
    const node = containerRef?.current;
    if (!node) return;

    const handleEnter = () => {
      isHoveringRef.current = true;
      idleSinceRef.current = null;
    };
    const handleLeave = () => {
      isHoveringRef.current = false;
      idleSinceRef.current = null;
    };

    node.addEventListener("pointerenter", handleEnter);
    node.addEventListener("pointerleave", handleLeave);
    return () => {
      node.removeEventListener("pointerenter", handleEnter);
      node.removeEventListener("pointerleave", handleLeave);
    };
  }, [containerRef]);

  useEffect(() => {
    const node = containerRef?.current;
    if (!node || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisibleRef.current = entry.isIntersecting;
        if (!entry.isIntersecting) {
          idleSinceRef.current = null;
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [containerRef]);

  const spawn = useCallback(
    (x: number, y: number) => {
      if (childrenArray.length === 0) return;

      const rotation = (Math.random() - 0.5) * rotationRange * 2;
      const zIndex = newOnTop ? zCounterRef.current++ : 0;
      const slot = slotRefs.current[nextSlotRef.current];
      slot?.trigger(x, y, rotation, zIndex);

      nextSlotRef.current = (nextSlotRef.current + 1) % childrenArray.length;
    },
    [childrenArray.length, rotationRange, newOnTop]
  );

  useAnimationFrame((time) => {
    if (!active) return;

    if (!isHoveringRef.current) {
      if (!isVisibleRef.current) {
        idleSinceRef.current = null;
        return;
      }

      if (idleSinceRef.current === null) {
        idleSinceRef.current = time;
      }

      const elapsed = time - idleSinceRef.current;
      if (elapsed < IDLE_DELAY) return;

      const node = containerRef?.current;
      const width = node?.clientWidth ?? 0;
      const height = node?.clientHeight ?? 0;
      if (width === 0 || height === 0) return;

      const t = elapsed - IDLE_DELAY;
      const centerX = width / 2;
      const centerY = height / 2;
      const rangeX = width * 0.32;
      const rangeY = height * 0.28;

      const idlePos = {
        x: centerX + Math.sin((t / IDLE_PERIOD_X) * Math.PI * 2) * rangeX,
        y:
          centerY +
          Math.sin((t / IDLE_PERIOD_Y) * Math.PI * 2 + Math.PI / 3) * rangeY,
      };

      if (time - lastAddedTimeRef.current < IDLE_SPAWN_INTERVAL) return;

      const dx = idlePos.x - lastSpawnPosRef.current.x;
      const dy = idlePos.y - lastSpawnPosRef.current.y;
      if (Math.hypot(dx, dy) < IDLE_MIN_DISTANCE) return;

      lastAddedTimeRef.current = time;
      lastSpawnPosRef.current = idlePos;
      spawn(idlePos.x, idlePos.y);
      return;
    }

    if (
      lastMousePosRef.current.x === mousePosition.x &&
      lastMousePosRef.current.y === mousePosition.y
    ) {
      return;
    }
    lastMousePosRef.current = mousePosition;

    if (time - lastAddedTimeRef.current < interval) return;

    const dx = mousePosition.x - lastSpawnPosRef.current.x;
    const dy = mousePosition.y - lastSpawnPosRef.current.y;
    if (Math.hypot(dx, dy) < minDistance) return;

    lastAddedTimeRef.current = time;
    lastSpawnPosRef.current = mousePosition;
    spawn(mousePosition.x, mousePosition.y);
  });

  return (
    <div className={styles.trailWrap}>
      {childrenArray.map((child, index) => (
        <TrailSlot
          key={index}
          ref={(handle) => {
            slotRefs.current[index] = handle;
          }}
          child={child}
          animationSequence={animationSequence}
          itemWidth={itemWidth}
          itemHeight={itemHeight}
        />
      ))}
    </div>
  );
};

export { ImageTrail };