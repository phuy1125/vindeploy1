

export default function AboutUs(){
    return(
        <section className="py-24 relative xl:mr-0 lg:mr-5 mr-0">
        <div className="w-full max-w-7xl px-4 md:px-5 lg:px-5 mx-auto">
            <div className="w-full justify-start items-center xl:gap-12 gap-10 grid lg:grid-cols-2 grid-cols-1">
                <div className="w-full flex-col justify-center lg:items-start items-center gap-10 inline-flex">
                    <div className="w-full flex-col justify-center items-start gap-8 flex">
                        <div className="flex-col justify-start lg:items-start items-center gap-4 flex">
                            <h6 className="text-gray-500 text-lg font-normal leading-relaxed">Về Chúng Tôi</h6>
                            <div className="w-full flex-col justify-start lg:items-start items-center gap-3 flex">
                                <h2
                                    className="text-indigo-700 text-4xl font-bold font-manrope leading-normal lg:text-start text-center">
                                    Tổng Quan Về Chức Năng Của VintelliTour</h2>
                                <p className="text-gray-600 text-base font-normal leading-relaxed lg:text-start text-center">
                                   Câu chuyện thành công của chúng tôi là minh chứng cho sự
                                    hợp tác chặt chẽ và sự kiên trì. Cùng nhau, chúng tôi đã vượt qua những
                                     thử thách, kỷ niệm những chiến thắng, và tạo ra một câu chuyện về sự phát triển và thành công. Với VintelliTour, chúng tôi không chỉ mang đến những chuyến du lịch độc đáo mà còn giúp bảo tồn và phát huy giá trị văn hóa Việt Nam thông qua công nghệ tiên tiến.</p>
                            </div>
                        </div>
                        <div className="w-full flex-col justify-center items-start gap-6 flex">
                            <div className="w-full justify-start items-center gap-8 grid md:grid-cols-2 grid-cols-1">
                                <div
                                    className="w-full h-full p-3.5 rounded-xl border border-gray-200 hover:border-gray-400 transition-all duration-700 ease-in-out flex-col justify-start items-start gap-2.5 inline-flex">
                                    <h4 className="text-gray-900 text-2xl font-bold font-manrope leading-9">Bản Đồ Tương Tác</h4>
                                    <p className="text-gray-500 text-base font-normal leading-relaxed">VintelliTour cho phép người dùng nhấp vào các tỉnh thành để khám phá
                                         các danh lam thắng cảnh, di tích lịch sử và văn hóa đặc trưng.</p>
                                </div>
                                <div
                                    className="w-full h-full p-3.5 rounded-xl border border-gray-200 hover:border-gray-400 transition-all duration-700 ease-in-out flex-col justify-start items-start gap-2.5 inline-flex">
                                    <h4 className="text-gray-900 text-2xl font-bold font-manrope leading-9">Tham Quan Online với Ảnh 360°
                                    </h4>
                                    <p className="text-gray-500 text-base font-normal leading-relaxed">Người dùng có thể trải nghiệm tham quan các địa điểm du lịch qua hình
                                         ảnh 360 độ chất lượng cao, kết hợp với thông tin văn hóa và lịch sử.</p>
                                </div>
                            </div>
                            <div className="w-full h-full justify-start items-center gap-8 grid md:grid-cols-2 grid-cols-1">
                                <div
                                    className="w-full p-3.5 rounded-xl border border-gray-200 hover:border-gray-400 transition-all duration-700 ease-in-out flex-col justify-start items-start gap-2.5 inline-flex">
                                    <h4 className="text-gray-900 text-2xl font-bold font-manrope leading-9">TourMate – Hướng Dẫn Viên Du Lịch Ảo</h4>
                                    <p className="text-gray-500 text-base font-normal leading-relaxed">TourMate là trợ lý AI giúp tạo lịch trình du lịch cá nhân hóa,
                                         gợi ý điểm đến và cung cấp thông tin du lịch, với tính năng lưu và xuất lịch trình.</p>
                                </div>
                                <div
                                    className="w-full h-full p-3.5 rounded-xl border border-gray-200 hover:border-gray-400 transition-all duration-700 ease-in-out flex-col justify-start items-start gap-2.5 inline-flex">
                                    <h4 className="text-gray-900 text-2xl font-bold font-manrope leading-9">Không Gian Tương Tác và Chia Sẻ</h4>
                                    <p className="text-gray-500 text-base font-normal leading-relaxed">Người dùng có thể lưu địa điểm yêu thích, chia sẻ trải nghiệm và nhận huy hiệu từ các đóng góp chất lượng, tạo thành cộng đồng du lịch sôi động.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="w-full lg:justify-start justify-center items-start flex">
                    <div
                        className="sm:w-[564px] w-full sm:h-[646px] h-full sm:bg-gray-100 rounded-3xl sm:border border-gray-200 relative">
                        <img className="sm:mt-5 sm:ml-5 w-full h-full rounded-3xl object-cover "
                            src="/img/VN.jpg" alt="about Us image" />
                    </div>
                </div>
            </div>
        </div>
    </section>
                                            
    )
}