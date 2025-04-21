// page.tsx
"use client";

import Sidebar from "./components/sidebar";
import ChatInterface from "./components/chat-interface";
import MapSection from "./components/map-section";
import { useEffect, useState } from "react";

export default function Home() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if window is available (client-side)
    if (typeof window !== "undefined") {
      const handleResize = () => {
        setIsMobile(window.innerWidth < 1024);
      };

      // Set initial value
      handleResize();

      // Add event listener
      window.addEventListener("resize", handleResize);

      // Clean up
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);

  return (
    <div className="flex flex-col lg:flex-row w-full h-[92vh] mt-[14px] p-2 gap-2">
      {/* Left sidebar - hidden on mobile */}
      <section
        className={`${
          isMobile ? "hidden" : "block"
        } w-full lg:w-[220px] xl:w-[250px] h-[calc(100vh-72px)]`}
      >
        <Sidebar />
      </section>

      {/* Middle chat section */}
      <section className="flex-1 min-w-0 h-[calc(100vh-72px)]">
        <ChatInterface />
      </section>

      {/* Right map section - can be toggled on mobile */}
      <section className="w-full lg:w-[320px] xl:w-[380px] h-[300px] lg:h-[calc(100vh-72px)] mt-2 lg:mt-0">
        <MapSection />
      </section>
    </div>
  );
}
