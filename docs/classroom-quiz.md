# Lớp học đố vui

Chạy ứng dụng bằng `npm run dev` hoặc `BAT-LIVE.bat`. Sau khi thay đổi mã máy chủ, khởi động lại ứng dụng. Dùng `http://lvh.me:3000/?view=stage` làm nguồn Link trong TikTok LIVE Studio; trang này nhận bình luận và phát giọng đọc. Bảng điều khiển ở `http://localhost:3000` có công tắc, âm lượng và tốc độ giọng dẫn.

Trang điều khiển mặc định không phát tiếng để tránh trùng với OBS. Để nghe ngay trên trình duyệt, bấm **Bật tiếng xem trước** ở phía trên; giọng đọc bắt đầu từ thông báo tiếp theo và các nút nghe thử hiệu ứng sẽ phát tại trình duyệt. Tắt tiếng xem trước khi OBS cũng đang phát để tránh nghe hai lần.

Để thử mà không cần TikTok, mở `http://localhost:3000/?view=stage&demo=1` và chọn A, B, C hoặc D ở cuối màn hình. Nút gửi quà thử cũng có trên trang demo. Nếu trình duyệt chặn phát tiếng tự động, hãy nhấp vào trang để cho phép âm thanh.

Mỗi câu được đọc trước, sau đó có 15 giây trả lời; có thể bình luận ngay khi đang đọc và đổi đáp án trước khi hết giờ. Đúng được 10 điểm, câu thứ 5 và 10 trong mỗi vòng được 20 điểm; cứ ba câu đúng liên tiếp được thêm 5 điểm. Trả lời sai hoặc bỏ qua câu sẽ ngắt chuỗi. Sau 10 câu, kết quả được công bố và điểm được đặt lại cho vòng tiếp theo. Quà và tim tạo hiệu ứng, không cộng điểm.

Lớp học đọc tiếng Việt bằng giọng Hoài My và nội dung tiếng Anh bằng giọng Jenny. Nếu dịch vụ giọng chính không khả dụng, máy chủ dùng giọng Google theo đúng ngôn ngữ của từng đoạn. Trong bảng điều khiển, có thể bật/tắt, chỉnh âm lượng và nghe thử từng hiệu ứng trên màn hình live. Không có nhạc nền mặc định.

Trong 15 giây trả lời, phát nhạc nền từ `public/assets/audio/countdown.mp3`; khi hết giờ nhạc dừng và phát âm báo đáp án. Bật **Hiệu ứng âm thanh lớp học** và điều chỉnh âm lượng hiệu ứng để nghe nhạc.

Trò chơi đang dùng bộ 100 câu luyện tiếng Anh ở `src/data/englishQuestions.ts`, gồm từ vựng, ngữ pháp và hội thoại. Bộ câu hỏi kiến thức tổng hợp trước đây vẫn nằm ở `src/data/quizQuestions.ts`. Mỗi câu có bốn đáp án, đáp án đúng và lời giải. Câu hỏi chạy theo thứ tự trong bộ rồi lặp lại. Điểm và tiến độ được giữ trong trang sân khấu, nên tải lại trang sẽ bắt đầu lại. Mỗi trang sân khấu có trạng thái độc lập; dùng một trang sân khấu cho phiên live để tránh tiếng đọc trùng.
