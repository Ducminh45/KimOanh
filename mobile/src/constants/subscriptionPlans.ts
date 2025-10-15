export const SUBSCRIPTION_PLANS = {
  FREE: {
    id: 'free',
    name: 'Miễn phí',
    nameEn: 'Free',
    price: 0,
    currency: 'VND',
    duration: 'forever',
    features: [
      '3 lượt quét thực phẩm/ngày',
      'Theo dõi dinh dưỡng cơ bản',
      'Theo dõi nước uống',
      'Theo dõi tập luyện',
      'AI chatbot cơ bản',
      'Cộng đồng cơ bản',
    ],
    scanLimit: 3,
  },
  MONTHLY: {
    id: 'monthly',
    name: 'Premium Tháng',
    nameEn: 'Premium Monthly',
    price: 99000,
    currency: 'VND',
    duration: 'month',
    features: [
      'Quét thực phẩm không giới hạn',
      'AI chatbot cao cấp',
      'Thống kê và báo cáo chi tiết',
      'Gợi ý thực đơn cá nhân hóa',
      'Tính năng cộng đồng mở rộng',
      'Tư vấn dinh dưỡng chuyên sâu',
      'Hỗ trợ ưu tiên 24/7',
      'Không quảng cáo',
    ],
    scanLimit: -1, // unlimited
    popular: false,
  },
  YEARLY: {
    id: 'yearly',
    name: 'Premium Năm',
    nameEn: 'Premium Yearly',
    price: 990000,
    currency: 'VND',
    duration: 'year',
    features: [
      'Tất cả tính năng Premium',
      'Tiết kiệm 198,000₫/năm',
      'Quét thực phẩm không giới hạn',
      'AI chatbot cao cấp',
      'Thống kê và báo cáo chi tiết',
      'Gợi ý thực đơn cá nhân hóa',
      'Tính năng cộng đồng mở rộng',
      'Tư vấn dinh dưỡng chuyên sâu',
      'Hỗ trợ ưu tiên 24/7',
      'Không quảng cáo',
    ],
    scanLimit: -1, // unlimited
    popular: true,
    savings: 198000, // 99k x 12 - 990k
  },
};

export const PREMIUM_BENEFITS = [
  {
    icon: '📸',
    title: 'Quét không giới hạn',
    description: 'Quét bao nhiêu món ăn cũng được, không giới hạn số lần',
  },
  {
    icon: '🤖',
    title: 'AI thông minh hơn',
    description: 'Truy cập AI chatbot cao cấp với tư vấn chuyên sâu',
  },
  {
    icon: '📊',
    title: 'Thống kê chi tiết',
    description: 'Xem báo cáo và biểu đồ chi tiết về tiến trình',
  },
  {
    icon: '🍱',
    title: 'Thực đơn cá nhân',
    description: 'Nhận gợi ý thực đơn được tạo riêng cho bạn',
  },
  {
    icon: '👥',
    title: 'Cộng đồng VIP',
    description: 'Tham gia các tính năng cộng đồng độc quyền',
  },
  {
    icon: '🎯',
    title: 'Tư vấn chuyên sâu',
    description: 'Nhận lời khuyên dinh dưỡng từ chuyên gia',
  },
  {
    icon: '📱',
    title: 'Hỗ trợ ưu tiên',
    description: 'Được hỗ trợ ưu tiên 24/7 khi cần',
  },
  {
    icon: '🚫',
    title: 'Không quảng cáo',
    description: 'Trải nghiệm ứng dụng hoàn toàn không quảng cáo',
  },
];

export default SUBSCRIPTION_PLANS;
