import { STUDENT_WEB_ROUTES } from '@endo4life/feature-config';
import { 
  MdEmail, 
  MdPhone, 
  MdLocationOn,
  MdArrowForward 
} from 'react-icons/md';
import { 
  FaFacebook, 
  FaTwitter, 
  FaInstagram, 
  FaLinkedin, 
  FaYoutube 
} from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useState } from 'react';

export default function Footer() {
  const [email, setEmail] = useState('');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Subscribe email:', email);
    setEmail('');
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-neutral-heading text-white">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <img
                src="/images/logo.png"
                alt="Endo4Life Logo"
                className="w-10 h-10"
              />
              <span className="text-title font-bold text-white">Endo4Life</span>
            </div>
            <p className="text-body1 text-gray-300 leading-relaxed">
              Nền tảng e-Learning tích hợp AI về giáo dục và hỗ trợ lạc nội mạc tử cung.
            </p>
            
            {/* Social Media */}
            <div className="flex gap-3 pt-2">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-white bg-opacity-10 hover:bg-primary-600 flex items-center justify-center transition-all duration-300 hover:scale-110"
                  aria-label={social.name}
                >
                  <social.icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-title1 font-semibold mb-4">Liên Kết Nhanh</h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-body1 text-gray-300 hover:text-primary-300 transition-colors duration-200 inline-flex items-center gap-2 group"
                  >
                    <span className="group-hover:translate-x-1 transition-transform duration-200">
                      {link.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources & Support */}
          <div>
            <h3 className="text-title1 font-semibold mb-4">Tài Nguyên & Hỗ Trợ</h3>
            <ul className="space-y-3">
              {resourceLinks.map((link) => (
                <li key={link.id}>
                  <Link
                    to={link.path}
                    className="text-body1 text-gray-300 hover:text-primary-300 transition-colors duration-200 inline-flex items-center gap-2 group"
                  >
                    <span className="group-hover:translate-x-1 transition-transform duration-200">
                      {link.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Newsletter */}
          <div>
            <h3 className="text-title1 font-semibold mb-4">Liên Hệ</h3>
            <ul className="space-y-3 mb-6">
              <li className="flex items-start gap-3 text-body1 text-gray-300">
                <MdEmail className="flex-shrink-0 mt-1 text-primary-300" size={18} />
                <a href="mailto:info@endo4life.com" className="hover:text-primary-300 transition-colors">
                  info@endo4life.com
                </a>
              </li>
              <li className="flex items-start gap-3 text-body1 text-gray-300">
                <MdPhone className="flex-shrink-0 mt-1 text-primary-300" size={18} />
                <a href="tel:+84123456789" className="hover:text-primary-300 transition-colors">
                  +84 123 456 789
                </a>
              </li>
              <li className="flex items-start gap-3 text-body1 text-gray-300">
                <MdLocationOn className="flex-shrink-0 mt-1 text-primary-300" size={18} />
                <span>Hà Nội, Việt Nam</span>
              </li>
            </ul>

            {/* Newsletter */}
            <div>
              <h4 className="text-body font-semibold mb-3">Đăng Ký Nhận Tin</h4>
              <form onSubmit={handleSubscribe} className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email của bạn"
                  required
                  className="flex-1 px-4 py-2 rounded-lg bg-white bg-opacity-10 border border-white border-opacity-20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-400 text-body1"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors duration-200"
                  aria-label="Subscribe"
                >
                  <MdArrowForward size={20} />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white border-opacity-10">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-body1 text-gray-300 text-center md:text-left">
              © {currentYear} Endo4Life. Bảo lưu mọi quyền.
            </p>
            
            <div className="flex flex-wrap justify-center gap-6">
              {legalLinks.map((link, index) => (
                <div key={link.path} className="flex items-center gap-6">
                  <Link
                    to={link.path}
                    className="text-body1 text-gray-300 hover:text-primary-300 transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                  {index < legalLinks.length - 1 && (
                    <span className="text-gray-300">•</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

// Data constants
const socialLinks = [
  { name: 'Facebook', icon: FaFacebook, url: 'https://facebook.com/endo4life' },
  { name: 'Twitter', icon: FaTwitter, url: 'https://twitter.com/endo4life' },
  { name: 'Instagram', icon: FaInstagram, url: 'https://instagram.com/endo4life' },
  { name: 'LinkedIn', icon: FaLinkedin, url: 'https://linkedin.com/company/endo4life' },
  { name: 'YouTube', icon: FaYoutube, url: 'https://youtube.com/@endo4life' },
];

const quickLinks = [
  { label: 'Trang Chủ', path: STUDENT_WEB_ROUTES.ROOT },
  { label: 'Về Chúng Tôi', path: STUDENT_WEB_ROUTES.ABOUT_US },
  { label: 'Tài Nguyên', path: STUDENT_WEB_ROUTES.RESOURCES },
  { label: 'Thư Viện Của Tôi', path: STUDENT_WEB_ROUTES.MY_LIBRARY },
];

const resourceLinks = [
  { id: 'resource-1', label: 'Khóa Học', path: STUDENT_WEB_ROUTES.RESOURCES },
  { id: 'resource-2', label: 'Video Học Tập', path: STUDENT_WEB_ROUTES.RESOURCES },
  { id: 'resource-3', label: 'Tài Liệu', path: STUDENT_WEB_ROUTES.RESOURCES },
  { id: 'resource-4', label: 'Câu Hỏi Thường Gặp', path: STUDENT_WEB_ROUTES.ABOUT_US },
  { id: 'resource-5', label: 'Hỗ Trợ', path: STUDENT_WEB_ROUTES.ABOUT_US },
];

const legalLinks = [
  { label: 'Chính Sách Bảo Mật', path: '/privacy-policy' },
  { label: 'Điều Khoản Sử Dụng', path: '/terms-of-service' },
  { label: 'Cookies', path: '/cookie-policy' },
];