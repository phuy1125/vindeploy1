'use client';

import { ReactNode, useState } from "react";
import "../globals.css";
import Link from "next/link";
import Image from "next/image";
import { FaFacebookF, FaInstagram, FaLinkedinIn } from 'react-icons/fa';
import UserProfile from "@components/userprofile/UserProfile";

type Props = {
  children: ReactNode;
};

export default function MainLayout({ children }: Props) {
  const [active, setActive] = useState("home");

  return (
    <>
      {/* Header */}
      <header>
        <nav className="w-full mx-auto relative z-10 flex items-center justify-between bg-white bg-black/80 py-0 text-black border-b border-blue-600/20 shadow-lg shadow-blue-400/20">
          {/* Nav content remains the same */}
          <div className="flex-shrink-0 px-4">
            <Link href="/">
              <Image
                src="/img/Logo_merus.png"
                alt="Logo"
                className="w-40 ml-15 h-auto cursor-pointer"
                width={160}
                height={30}
              />
            </Link>
          </div>
          <ul className="hidden text-lg md:flex w-1/2 items-center justify-between gap-4 py-2 cursor-pointer md:px-10 border-r-2 border-l-2 border-gray-800 dark:border-gray-300 group">
            <Link href="/" onClick={() => setActive("home")}>
              <li className={`rounded-b px-2 ${active === "home" ? "border-b-[3px] border-blue-600 font-bold" : "hover:border-b-[3px] hover:border-blue-600 hover:font-bold group-hover:border-b-0"}`}>
                Trang chủ
              </li>
            </Link>
            <Link href="/share-space" onClick={() => setActive("share")}>
              <li className={`rounded-b px-2 ${active === "share" ? "border-b-[3px] border-blue-600 font-bold" : "hover:border-b-[3px] hover:border-blue-600 hover:font-bold group-hover:border-b-0"}`}>
                Không gian chia sẻ
              </li>
            </Link>
            <Link href="/aboutus" onClick={() => setActive("about")}>
              <li className={`rounded-b px-2 ${active === "about" ? "border-b-[3px] border-blue-600 font-bold" : "hover:border-b-[3px] hover:border-blue-600 hover:font-bold group-hover:border-b-0"}`}>
                Về chúng tôi
              </li>
            </Link>
          </ul>
          <div className="hidden md:flex justify-start pl-2 pr-10 py-1 gap-12">
            <UserProfile />
          </div>
        </nav>
      </header>
      
      {/* Main content */}
      <main>{children}</main>
      
      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 border-t border-blue-600/20 shadow-[0_-4px_6px_rgba(96,165,250,0.2)]">
        {/* Footer content remains the same */}
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {/* Rest of your footer content */}
            {/* ... */}
          </div>
        </div>
        <hr className="h-px bg-gray-600 border-0 mx-auto w-[90%] mt-7" />
        <div className="bg-white-700 pt-4">
          <div className="max-w-7xl mx-auto grid grid-cols-2 gap-4 px-4 text-center">
            {/* Rest of your footer content */}
            {/* ... */}
          </div>
        </div>
      </footer>
    </>
  );
}