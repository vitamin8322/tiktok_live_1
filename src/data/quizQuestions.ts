export type Choice = 'A' | 'B' | 'C' | 'D';
export interface QuizQuestion {
  topic: string;
  question: string;
  answers: [string, string, string, string];
  correct: Choice;
  explanation: string;
}

// Questions are interleaved by topic so each ten-question round stays varied.
export const QUIZ_QUESTIONS: QuizQuestion[] = [
  { topic: 'Toán vui', question: '2 mũ 10 bằng bao nhiêu?', answers: ['100', '512', '2048', '1024'], correct: 'D', explanation: 'Hai nhân với chính nó mười lần bằng 1024.' },
  { topic: 'Khoa học', question: 'Hành tinh nào gần Mặt Trời nhất?', answers: ['Sao Thủy', 'Sao Hỏa', 'Trái Đất', 'Sao Kim'], correct: 'A', explanation: 'Sao Thủy là hành tinh gần Mặt Trời nhất.' },
  { topic: 'Địa lý', question: 'Thủ đô của Việt Nam là thành phố nào?', answers: ['Đà Nẵng', 'Huế', 'Hà Nội', 'Hải Phòng'], correct: 'C', explanation: 'Hà Nội là thủ đô của Việt Nam.' },
  { topic: 'Tiếng Việt', question: 'Từ nào sau đây là từ láy?', answers: ['Học sinh', 'Long lanh', 'Bàn ghế', 'Sách vở'], correct: 'B', explanation: 'Long lanh là từ láy có âm đầu giống nhau.' },
  { topic: 'Đời sống', question: 'Một giờ có bao nhiêu phút?', answers: ['30', '60', '90', '100'], correct: 'B', explanation: 'Một giờ có 60 phút.' },
  { topic: 'Toán vui', question: 'Một hình tam giác có bao nhiêu cạnh?', answers: ['2', '3', '4', '5'], correct: 'B', explanation: 'Tam giác có ba cạnh.' },
  { topic: 'Khoa học', question: 'Nước đóng băng ở nhiệt độ nào theo thang Celsius, ở áp suất khí quyển?', answers: ['0 độ C', '10 độ C', '50 độ C', '100 độ C'], correct: 'A', explanation: 'Nước tinh khiết đóng băng ở 0 độ C tại áp suất khí quyển.' },
  { topic: 'Địa lý', question: 'Đại dương nào có diện tích lớn nhất?', answers: ['Đại Tây Dương', 'Ấn Độ Dương', 'Bắc Băng Dương', 'Thái Bình Dương'], correct: 'D', explanation: 'Thái Bình Dương là đại dương lớn nhất.' },
  { topic: 'Tiếng Việt', question: 'Từ nào trái nghĩa với “cao”?', answers: ['Dài', 'Rộng', 'Thấp', 'Lớn'], correct: 'C', explanation: 'Thấp là từ trái nghĩa với cao.' },
  { topic: 'Đời sống', question: 'Một tuần có bao nhiêu ngày?', answers: ['5', '6', '7', '8'], correct: 'C', explanation: 'Một tuần có bảy ngày.' },
  { topic: 'Toán vui', question: '15 nhân 4 bằng bao nhiêu?', answers: ['45', '50', '55', '60'], correct: 'D', explanation: '15 nhân 4 bằng 60.' },
  { topic: 'Khoa học', question: 'Bộ phận nào của cây thường hấp thụ nước từ đất?', answers: ['Hoa', 'Rễ', 'Quả', 'Lá'], correct: 'B', explanation: 'Rễ cây hấp thụ nước và chất khoáng từ đất.' },
  { topic: 'Địa lý', question: 'Quốc gia nào có hình dạng thường được ví như chiếc ủng?', answers: ['Ý', 'Nhật Bản', 'Ấn Độ', 'Ai Cập'], correct: 'A', explanation: 'Bán đảo Ý thường được ví như chiếc ủng.' },
  { topic: 'Tiếng Việt', question: 'Dấu câu nào thường đặt cuối câu hỏi?', answers: ['Dấu phẩy', 'Dấu hai chấm', 'Dấu hỏi', 'Dấu chấm phẩy'], correct: 'C', explanation: 'Câu hỏi thường kết thúc bằng dấu hỏi.' },
  { topic: 'Thiên nhiên', question: 'Loài vật nào là động vật có vú?', answers: ['Cá heo', 'Cá chép', 'Cá ngừ', 'Cá mập'], correct: 'A', explanation: 'Cá heo thở bằng phổi và nuôi con bằng sữa.' },
  { topic: 'Toán vui', question: 'Một nửa của 86 là bao nhiêu?', answers: ['42', '43', '44', '46'], correct: 'B', explanation: '86 chia 2 bằng 43.' },
  { topic: 'Khoa học', question: 'Trái Đất quay quanh ngôi sao nào?', answers: ['Sao Hỏa', 'Sao Kim', 'Sao Thủy', 'Mặt Trời'], correct: 'D', explanation: 'Trái Đất quay quanh Mặt Trời.' },
  { topic: 'Địa lý', question: 'Sông Hương gắn liền với thành phố nào?', answers: ['Huế', 'Đà Lạt', 'Cần Thơ', 'Nha Trang'], correct: 'A', explanation: 'Sông Hương chảy qua thành phố Huế.' },
  { topic: 'Tiếng Việt', question: 'Trong câu “Lan đọc sách”, từ nào chỉ hoạt động?', answers: ['Lan', 'Sách', 'Đọc', 'Không có'], correct: 'C', explanation: 'Đọc là từ chỉ hoạt động.' },
  { topic: 'Đời sống', question: 'Một năm không nhuận có bao nhiêu ngày?', answers: ['360', '365', '366', '370'], correct: 'B', explanation: 'Năm không nhuận có 365 ngày.' },
  { topic: 'Toán vui', question: 'Số nguyên tố nhỏ nhất là số nào?', answers: ['0', '1', '2', '3'], correct: 'C', explanation: 'Hai là số nguyên tố nhỏ nhất.' },
  { topic: 'Thiên nhiên', question: 'Con vật nào thường trải qua giai đoạn sâu và nhộng?', answers: ['Bướm', 'Mèo', 'Chim', 'Ếch'], correct: 'A', explanation: 'Bướm phát triển qua giai đoạn sâu và nhộng.' },
  { topic: 'Địa lý', question: 'Đà Lạt thuộc tỉnh nào?', answers: ['Khánh Hòa', 'Lâm Đồng', 'Đắk Lắk', 'Quảng Nam'], correct: 'B', explanation: 'Đà Lạt thuộc tỉnh Lâm Đồng.' },
  { topic: 'Tiếng Việt', question: 'Từ nào là danh từ chỉ đồ vật?', answers: ['Chạy', 'Đẹp', 'Chiếc bàn', 'Nhanh'], correct: 'C', explanation: 'Chiếc bàn là cụm từ chỉ đồ vật.' },
  { topic: 'Đời sống', question: 'Một tá bằng bao nhiêu chiếc?', answers: ['10', '11', '12', '20'], correct: 'C', explanation: 'Một tá bằng 12 chiếc.' },
  { topic: 'Toán vui', question: '25 phần trăm của 200 là bao nhiêu?', answers: ['25', '40', '50', '75'], correct: 'C', explanation: '25 phần trăm là một phần tư; một phần tư của 200 là 50.' },
  { topic: 'Khoa học', question: 'Khí nào có nhiều nhất trong khí quyển Trái Đất?', answers: ['Ôxy', 'Nitơ', 'Cacbon điôxít', 'Hiđrô'], correct: 'B', explanation: 'Nitơ chiếm khoảng 78 phần trăm khí quyển.' },
  { topic: 'Địa lý', question: 'Châu lục nào có diện tích lớn nhất?', answers: ['Châu Á', 'Châu Âu', 'Châu Phi', 'Châu Đại Dương'], correct: 'A', explanation: 'Châu Á là châu lục lớn nhất theo diện tích.' },
  { topic: 'Thiên nhiên', question: 'Cây xanh sử dụng năng lượng nào để quang hợp?', answers: ['Ánh sáng', 'Âm thanh', 'Gió', 'Sóng biển'], correct: 'A', explanation: 'Cây xanh dùng năng lượng ánh sáng trong quá trình quang hợp.' },
  { topic: 'Đời sống', question: 'Một mét bằng bao nhiêu xentimét?', answers: ['10', '100', '1000', '10000'], correct: 'B', explanation: 'Một mét bằng 100 xentimét.' },
];
