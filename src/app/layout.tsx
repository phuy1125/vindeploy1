import "./globals.css";

export default function RootLayout({ children }){
  return(
    <html lang="en">
      <body>
        <header>
        <nav
         className="w-full mx-auto relative z-10 flex items-center justify-between dark:bg-white bg-black/80 py-4 text-white dark:text-black border-b border-green-600/20 dark:border-green-600/20 shadow-lg shadow-green-400/20">
        <div className="flex-shrink-0 px-4">
            <a href="#" className="text-xl font-bold text-gray-700">
                <span className="px-1 bg-green-400 rounded-full animate-[ping_1.9s_linear_infinite]">V</span>
                <span className="px-1 bg-green-400 rounded-full animate-[ping_2s_linear_infinite]">I</span>
                <span className="px-1 bg-green-400 rounded-full animate-[ping_2.1s_linear_infinite]">N</span>
                <span className="px-1 bg-green-400 rounded-full animate-[ping_2.2s_linear_infinite]">T</span>
                <span className="px-1 bg-green-400 rounded-full animate-[ping_2.3s_linear_infinite]">E</span>
                <span className="px-1 bg-green-400 rounded-full animate-[ping_2.4s_linear_infinite]">L</span>
                <span className="px-1 bg-green-400 rounded-full animate-[ping_2.5s_linear_infinite]">L</span>
                <span className="px-1 bg-green-400 rounded-full animate-[ping_2.6s_linear_infinite]">I</span>
                <span className="px-1 bg-green-400 rounded-full animate-[ping_2.7s_linear_infinite]">T</span>
                <span className="px-1 bg-green-400 rounded-full animate-[ping_2.8s_linear_infinite]">O</span>
                <span className="px-1 bg-green-400 rounded-full animate-[ping_2.9s_linear_infinite]">U</span>
                <span className="px-1 bg-green-400 rounded-full animate-[ping_3s_linear_infinite]">R</span>
            </a>
        </div>
        <ul
            className="hidden text-lg md:flex w-1/2 items-center justify-between gap-4 py-2 cursor-pointer md:px-10 border-r-2 border-l-2 border-gray-800 dark:border-gray-300">
            <li className="rounded-b border-b-[3px] border-green-600">Trang chủ</li>
            <li className="rounded-b hover:border-b-[3px] hover:border-green-600">Không gian chia sẻ</li>
            <li className="rounded-b hover:border-b-[3px] hover:border-green-600">Về chúng tôi</li>
        </ul>

            <div className="hidden md:flex justify-start pl-2 pr-10 py-1 gap-12 ">
            <a href=""
              className="bg-white text-white border-2 border-blue-800 rounded px-6 py-2 rounded-md relative overflow-hidden group hover:bg-gradient-to-r hover:from-blue-500 hover:via-indigo-400 hover:to-purple-500">
              <span className="relative group-hover:text-white z-10 font-bold text-gray-800 ">Đăng nhập</span>
            </a>
        <a href=""
            className="bg-gradient-to-r from-blue-500 via-indigo-400 to-purple-500 text-white px-6 py-2 rounded-md relative overflow-hidden group">
            <span
                className="absolute top-0 left-0 w-full h-full bg-white opacity-20 transform -skew-x-12 -translate-x-full group-hover:translate-x-0 transition duration-500"
            ></span>
            <span className="relative group-hover:text-white z-10 font-bold text-gray-800">Đăng kí</span>
        </a>
            </div>
    </nav>
        </header>

        <main>{children}</main>

        <footer>footer</footer>
      </body>
    </html>
  )
}

