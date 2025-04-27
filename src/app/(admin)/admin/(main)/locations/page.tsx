"use client"
import dynamic from "next/dynamic";

// Dynamic import với SSR disabled vì Leaflet cần window object
const VietnamMapWithNoSSR = dynamic(
  () => import('@/components/province_admin/VietnamMap'),
  { ssr: false }
);

export default function Home() {
  return (
    <main style={{ width: '100%', height: '100vh', padding: 0, margin: 0 }}>
      <VietnamMapWithNoSSR />
    </main>
  );
}