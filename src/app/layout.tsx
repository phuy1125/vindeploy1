"use client";

import { ReactNode } from "react";
import "./globals.css";
import Link from "next/link";
import { FaFacebookF, FaInstagram, FaLinkedinIn } from "react-icons/fa";
import { useState } from "react";
type Props = {
  children: ReactNode;
};

export default function RootLayout({ children }: Props) {
  const [active, setActive] = useState("home");

  return (
    <html lang="en">
      <body>
        <header>
          <nav className="w-full mx-auto relative z-10 flex items-center justify-between bg-white bg-black/80 py-0 text-black border-b border-blue-600/20 shadow-lg shadow-blue-400/20">
            <div className="flex-shrink-0 px-4">
              <Link href="/">
                <img
                  src="img/Logo_merus.png"
                  alt="description"
                  className="w-40 ml-15 h-auto cursor-pointer"
                />
              </Link>
            </div>
            <ul className="hidden text-lg md:flex w-1/2 items-center justify-between gap-4 py-2 cursor-pointer md:px-10 border-r-2 border-l-2 border-gray-800 dark:border-gray-300 group">
              {/* Trang chủ */}
              <Link href="/" onClick={() => setActive("home")}>
                <li
                  className={`rounded-b px-2 ${
                    active === "home"
                      ? "border-b-[3px] border-blue-600 font-bold"
                      : "hover:border-b-[3px] hover:border-blue-600 hover:font-bold group-hover:border-b-0"
                  }`}
                >
                  Trang chủ
                </li>
              </Link>

              {/* Không gian chia sẻ */}
              <Link href="/share-space">
                <li
                  onClick={() => setActive("share")}
                  className={`rounded-b px-2 ${
                    active === "share"
                      ? "border-b-[3px] border-blue-600 font-bold"
                      : "hover:border-b-[3px] hover:border-blue-600 hover:font-bold group-hover:border-b-0"
                  }`}
                >
                  Không gian chia sẻ
                </li>
              </Link>

              {/* Về chúng tôi */}
              <Link href="/aboutus" onClick={() => setActive("about")}>
                <li
                  className={`rounded-b px-2 ${
                    active === "about"
                      ? "border-b-[3px] border-blue-600 font-bold"
                      : "hover:border-b-[3px] hover:border-blue-600 hover:font-bold group-hover:border-b-0"
                  }`}
                >
                  Về chúng tôi
                </li>
              </Link>
            </ul>

            <div className="hidden md:flex justify-start pl-2 pr-10 py-1 gap-12 ">
              <Link
                href="/login"
                className="bg-white text-white border-2 border-blue-800 rounded px-6 py-2 rounded-md relative overflow-hidden group hover:bg-gradient-to-r hover:from-blue-500 hover:via-indigo-400 hover:to-purple-500"
              >
                <span className="relative group-hover:text-white z-10 font-bold text-gray-800">
                  Đăng nhập
                </span>
              </Link>
              <Link
                href="/register"
                className="bg-gradient-to-r from-blue-500 via-indigo-400 to-purple-500 text-white px-6 py-2 rounded-md relative overflow-hidden group"
              >
                <span className="absolute top-0 left-0 w-full h-full bg-white opacity-20 transform -skew-x-12 -translate-x-full group-hover:translate-x-0 transition duration-500"></span>
                <span className="relative group-hover:text-white z-10 font-bold text-gray-800">
                  Đăng kí
                </span>
              </Link>
            </div>
          </nav>
        </header>

        <main>{children}</main>

        <footer className="bg-gray-800 text-white py-8 border-t border-blue-600/20 shadow-[0_-4px_6px_rgba(96,165,250,0.2)]">
          {/* Phần trên của footer */}
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              {/* Phần trái (chiếm 2 phần) */}
              <div className="col-span-2">
                <img
                  src="img/Logo_merus.png"
                  alt="description"
                  className="w-40  h-auto"
                />
                <p className="text-sm text-gray-600 text-left">
                  Website kết hợp du lịch, văn hóa và trí tuệ nhân tạo, mang đến
                  trải nghiệm khám phá Việt Nam thông minh và cá nhân hóa.
                </p>
                <div className="flex space-x-4 mt-4">
                  <a
                    href="https://www.facebook.com/anvanket1402"
                    className="text-white-600 text-3xl hover:text-blue-500 rounded-full p-2 border-blue-2 bg-blue-600"
                  >
                    <FaFacebookF />
                  </a>
                  <a
                    href="https://www.instagram.com/vanket_1402/"
                    className="text-white-600 text-3xl hover:text-blue-500 rounded-full p-2 border-blue-2 bg-blue-600 bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500"
                  >
                    <FaInstagram />
                  </a>
                  <a
                    href="#"
                    className="text-white-600 text-3xl hover:text-blue-500 rounded-full p-2 border-blue-2 bg-blue-600"
                  >
                    <FaLinkedinIn />
                  </a>
                </div>
              </div>

              {/* Phần phải (chiếm 3 phần) */}
              <div className="col-span-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-10">
                  <div>
                    <ul className="space-y-2 text-sm">
                      <li>
                        <p className="text-black text-base font-bold">
                          Địa chỉ
                        </p>
                      </li>
                      <li>
                        <p className="text-gray-500">
                          Hàn Thuyên, khu phố 6 P, Thủ Đức, Hồ Chí Minh
                        </p>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <ul className="space-y-2 text-sm">
                      <li>
                        <p className="text-black text-base font-bold ">
                          Liên hệ
                        </p>
                      </li>
                      <li>
                        <p className="text-gray-500">+84 377 892 859</p>
                      </li>
                      <li>
                        <p className="text-gray-500">22520595@gm.uit.edu.vn</p>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <ul className="space-y-2 text-sm">
                      <li>
                        <p className="text-black text-base font-bold">
                          Thời gian
                        </p>
                      </li>
                      <li>
                        <p className="text-gray-500">Thứ hai - Thứ bảy</p>
                      </li>
                      <li>
                        <p className="text-gray-500">9AM - 7PM</p>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <hr className="h-px bg-gray-600 border-0 mx-auto w-[90%] mt-7" />

          {/* Phần dưới của footer */}
          <div className="bg-white-700 pt-4">
            <div className="max-w-7xl mx-auto grid grid-cols-2 gap-4 px-4 text-center">
              <div className="text-left flex items-center">
                <p className="text-sm text-gray-500 ">
                  &copy; 2025 VintelliTour. Tất cả quyền lợi được bảo vệ.
                </p>
              </div>
              <div className="text-right flex space-x-8">
                <img
                  src="img/brand-threejs.svg"
                  alt="description"
                  className="inline-block w-auto"
                />
                <img
                  src="img/Langchain--Streamline-Simple-Icons.svg"
                  alt="description"
                  className="inline-block w-auto"
                />
                <img
                  src="img/LangGraph_icon.png"
                  alt="description"
                  className="inline-block w-15 h-15"
                />
                <img
                  src="img/leaflet.svg"
                  alt="description"
                  className="inline-block w-auto w-5 h-5 mt-4"
                />
                <img
                  src="img/mongodb-original-wordmark.svg"
                  alt="description"
                  className="inline-block mt-3 w-auto w-8 h-8"
                />
                <img
                  src="img/nextjs.svg"
                  alt="description"
                  className="inline-block w-auto w-8 h-8 mt-3"
                />
                <img
                  src="img/tailwind-css.svg"
                  alt="description"
                  className="inline-block w-auto w-5 h-5 mt-4"
                />
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
