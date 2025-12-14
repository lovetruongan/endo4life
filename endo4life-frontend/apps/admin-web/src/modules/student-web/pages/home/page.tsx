import { useAuthContext } from '@endo4life/feature-auth';
import { STUDENT_WEB_ROUTES } from '@endo4life/feature-config';
import {
  MdSchool,
  MdVideoLibrary,
  MdQuiz,
  MdForum,
  MdArrowForward,
  MdCheckCircle,
} from 'react-icons/md';
import { Link } from 'react-router-dom';

export function HomePage() {
  const { isAuthenticated } = useAuthContext();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100">
      {/* Hero Section */}
      <section className="relative px-4 py-20 md:py-32">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-display3 md:text-display2 font-bold text-neutral-heading leading-tight">
                Chào mừng đến với{' '}
                <span className="text-primary-600">Endo4Life</span>
              </h1>
              <p className="text-title1 text-neutral-subtle-text leading-relaxed">
                Nền tảng e-Learning tích hợp AI về giáo dục và hỗ trợ lạc nội
                mạc tử cung. Trao quyền cho bạn với kiến thức, cộng đồng và trải
                nghiệm học tập cá nhân hóa.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link
                  to={
                    isAuthenticated
                      ? STUDENT_WEB_ROUTES.RESOURCES
                      : STUDENT_WEB_ROUTES.RESOURCES
                  }
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  {isAuthenticated ? 'Khám Phá Tài Nguyên' : 'Bắt Đầu Ngay'}
                  <MdArrowForward size={20} />
                </Link>
                <Link
                  to={STUDENT_WEB_ROUTES.ABOUT_US}
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-primary-600 font-semibold rounded-lg border-2 border-primary-600 hover:bg-primary-50 transition-all duration-300"
                >
                  Tìm Hiểu Thêm
                </Link>
              </div>
            </div>

            <div className="relative hidden md:block">
              <img
                src="/images/anhbacsi.jpg"
                alt="Bác sĩ nội soi"
                className="w-full aspect-[4/3] object-cover rounded-3xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 py-20 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-heading font-bold text-neutral-heading mb-4">
              Tại Sao Chọn Endo4Life?
            </h2>
            <p className="text-title1 text-neutral-subtle-text max-w-2xl mx-auto">
              Tài nguyên học tập toàn diện được thiết kế đặc biệt cho giáo dục
              lạc nội mạc tử cung
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group p-6 rounded-2xl bg-gradient-to-br from-neutral-white to-primary-50 hover:shadow-xl transition-all duration-300 border border-neutral-border hover:border-primary-300"
              >
                <div className="w-16 h-16 rounded-2xl bg-primary-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="text-white" size={32} />
                </div>
                <h3 className="text-title font-semibold text-neutral-heading mb-2">
                  {feature.title}
                </h3>
                <p className="text-body1 text-neutral-subtle-text">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="px-4 py-20 bg-gradient-to-r from-primary-600 to-primary-800">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            {stats.map((stat, index) => (
              <div key={index} className="space-y-2">
                <div className="text-display2 font-bold text-white">
                  {stat.value}
                </div>
                <div className="text-title1 text-primary-100">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="px-4 py-20 bg-neutral-background-layer-2">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-heading1 font-bold text-neutral-heading">
                Mọi Thứ Bạn Cần Để Tìm Hiểu Về Lạc Nội Mạc Tử Cung
              </h2>
              <p className="text-body text-neutral-subtle-text">
                Nền tảng của chúng tôi cung cấp nội dung giáo dục toàn diện, dựa
                trên bằng chứng được thiết kế bởi các chuyên gia y tế và chuyên
                gia trong lĩnh vực.
              </p>
              <ul className="space-y-4">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <MdCheckCircle
                      className="text-primary-600 flex-shrink-0 mt-1"
                      size={24}
                    />
                    <span className="text-body text-neutral-text">
                      {benefit}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <img
                src="/images/anh13.jpg"
                alt="Bác sĩ nội soi"
                className="aspect-square object-cover rounded-2xl shadow-lg"
              />
              <img
                src="/images/anh10.png"
                alt="Nội soi tiêu hóa"
                className="aspect-square object-cover rounded-2xl shadow-lg"
              />
              <img
                src="/images/anh11.jpg"
                alt="Quy trình nội soi"
                className="aspect-square object-cover rounded-2xl shadow-lg"
              />
              <img
                src="/images/noi-soi-tieu-hoa.jpg"
                alt="Nội soi tiêu hóa"
                className="aspect-square object-cover rounded-2xl shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-20 bg-white">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-heading1 font-bold text-neutral-heading">
            Sẵn Sàng Bắt Đầu Hành Trình Học Tập?
          </h2>
          <p className="text-title1 text-neutral-subtle-text">
            Tham gia cộng đồng của chúng tôi và truy cập tài nguyên giáo dục
            toàn diện về lạc nội mạc tử cung ngay hôm nay.
          </p>
          <div className="pt-4">
            <Link
              to={
                isAuthenticated
                  ? STUDENT_WEB_ROUTES.RESOURCES
                  : STUDENT_WEB_ROUTES.RESOURCES
              }
              className="inline-flex items-center justify-center gap-2 px-10 py-5 bg-primary-600 text-white text-title1 font-semibold rounded-xl hover:bg-primary-700 transition-all duration-300 shadow-xl hover:shadow-2xl"
            >
              {isAuthenticated ? 'Khám Phá Tài Nguyên' : 'Đăng Ký Ngay'}
              <MdArrowForward size={24} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

// Data constants
const features = [
  {
    icon: MdSchool,
    title: 'Khóa Học Chuyên Gia',
    description:
      'Học hỏi từ các chuyên gia y tế và chuyên gia về giáo dục lạc nội mạc tử cung.',
  },
  {
    icon: MdVideoLibrary,
    title: 'Học Qua Video',
    description:
      'Nội dung video hấp dẫn với theo dõi tiến độ và các yếu tố tương tác.',
  },
  {
    icon: MdQuiz,
    title: 'Đánh Giá Kiến Thức',
    description:
      'Kiểm tra kiến thức với các bài quiz tương tác và nhận phản hồi cá nhân hóa.',
  },
  {
    icon: MdForum,
    title: 'Cộng Đồng',
    description:
      'Kết nối với người khác, chia sẻ kinh nghiệm và nhận hỗ trợ từ cộng đồng.',
  },
];

const stats = [
  { value: '500+', label: 'Tài Nguyên Giáo Dục' },
  { value: '1000+', label: 'Người Học Tích Cực' },
  { value: '50+', label: 'Chuyên Gia Đóng Góp' },
];

const benefits = [
  'Tài liệu khóa học toàn diện bao gồm mọi khía cạnh của lạc nội mạc tử cung',
  'Học tập theo tốc độ riêng phù hợp với lịch trình của bạn',
  'Đánh giá và bài quiz tương tác để kiểm tra kiến thức',
  'Truy cập vào cộng đồng hỗ trợ gồm người học và chuyên gia',
  'Cập nhật thường xuyên với các nghiên cứu và phát hiện mới nhất',
  'Nền tảng thân thiện với thiết bị di động để học mọi lúc mọi nơi',
];

export default HomePage;
