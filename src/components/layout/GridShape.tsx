// src\components\layout\GridShape.tsx
import Image from "next/image";

export default function GridShape() {
  return (
    <>
      {/* Top Right Grid */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-0 right-0 z-0 w-full max-w-[240px] opacity-20 xl:max-w-[420px] dark:opacity-10"
      >
        <Image
          src="/images/shape/grid-01.svg"
          alt=""
          width={540}
          height={254}
          priority={false}
          className="contrast-125 saturate-0 filter select-none dark:brightness-75"
        />
      </div>

      {/* Bottom Left Grid */}
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-0 z-0 w-full max-w-[240px] rotate-180 opacity-20 xl:max-w-[420px] dark:opacity-10"
      >
        <Image
          src="/images/shape/grid-01.svg"
          alt=""
          width={540}
          height={254}
          priority={false}
          className="contrast-125 saturate-0 filter select-none dark:brightness-75"
        />
      </div>
    </>
  );
}
