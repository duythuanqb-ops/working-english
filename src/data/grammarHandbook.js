/**
 * WorkingEnglish — Toàn bộ Cẩm Nang Ngữ Pháp Tiếng Anh Chuyên Sâu (Handbook)
 * Được biên soạn chi tiết cho người đi làm, học tập và giao tiếp chuyên nghiệp.
 */

export const GRAMMAR_CHAPTERS = [
  {
    id: "tenses",
    title: "1. Hệ thống 12 Thì Tiếng Anh (Tenses Master)",
    description: "Công thức, cách dùng thực chiến, dấu hiệu nhận biết và ví dụ công sở cho 12 thì.",
    icon: "Clock",
    sections: [
      {
        subId: "present-simple",
        title: "Hiện tại đơn (Present Simple)",
        formula: "S + V(s/es) + O | S + do/does not + V-inf | Do/Does + S + V-inf?",
        usage: "Diễn tả sự thật hiển nhiên, thói quen, lịch trình cố định, chính sách công ty.",
        signals: "Always, usually, often, daily, every quarter, normally, seldom.",
        workplaceExample: "Our QA team reviews all pull requests before merging to production.",
        exampleVi: "Đội ngũ QA của chúng tôi luôn kiểm tra tất cả các yêu cầu gộp trước khi đưa lên môi trường thực tế.",
        commonMistake: "Quên chia 's/es' ở ngôi thứ 3 số ít: He work here ➔ He works here."
      },
      {
        subId: "present-continuous",
        title: "Hiện tại tiếp diễn (Present Continuous)",
        formula: "S + am/is/are + V-ing | S + am/is/are + not + V-ing",
        usage: "Hành động đang diễn ra tại thời điểm nói, dự án tạm thời đang tiến hành, xu hướng thay đổi.",
        signals: "Now, currently, at the moment, this quarter, right now.",
        workplaceExample: "We are currently migrating our legacy database to Cloud Firestore.",
        exampleVi: "Chúng tôi hiện đang chuyển đổi cơ sở dữ liệu cũ sang Cloud Firestore.",
        commonMistake: "Dùng với động từ chỉ trạng thái nhận thức/sở hữu (stative verbs): I am knowing ➔ I know."
      },
      {
        subId: "present-perfect",
        title: "Hiện tại hoàn thành (Present Perfect)",
        formula: "S + have/has + V3/ed | S + have/has + not + V3/ed",
        usage: "Hành động đã xảy ra trong quá khứ nhưng kết quả còn liên quan đến hiện tại; báo cáo tiến độ công việc.",
        signals: "Already, yet, just, recently, since, for, so far, up to now.",
        workplaceExample: "The marketing department has already finalized the Q3 campaign budget.",
        exampleVi: "Phòng marketing đã hoàn tất ngân sách chiến dịch quý 3 rồi.",
        commonMistake: "Dùng mốc thời gian cụ thể trong quá khứ: I have finished it yesterday ➔ I finished it yesterday."
      },
      {
        subId: "present-perfect-continuous",
        title: "Hiện tại hoàn thành tiếp diễn (Present Perfect Continuous)",
        formula: "S + have/has + been + V-ing",
        usage: "Nhấn mạnh tính liên tục của hành động bắt đầu từ quá khứ và vẫn đang tiếp diễn đến hiện tại.",
        signals: "All morning, for 5 hours, since 8 AM, lately.",
        workplaceExample: "Our engineers have been debugging this critical memory leak since this morning.",
        exampleVi: "Các kỹ sư của chúng tôi đã liên tục tìm lỗi tràn bộ nhớ này từ sáng đến giờ."
      },
      {
        subId: "past-simple",
        title: "Quá khứ đơn (Past Simple)",
        formula: "S + V2/ed | S + did not + V-inf | Did + S + V-inf?",
        usage: "Hành động đã xảy ra và chấm dứt hoàn toàn trong quá khứ với thời gian xác định.",
        signals: "Yesterday, last week, in 2023, two days ago.",
        workplaceExample: "We successfully deployed the v2.0 release yesterday evening.",
        exampleVi: "Chúng tôi đã triển khai thành công bản phát hành v2.0 vào tối hôm qua."
      },
      {
        subId: "past-continuous",
        title: "Quá khứ tiếp diễn (Past Continuous)",
        formula: "S + was/were + V-ing",
        usage: "Hành động đang diễn ra tại một thời điểm xác định trong quá khứ hoặc một hành động đang diễn ra thì bị xen vào.",
        signals: "At 9 AM yesterday, while, when.",
        workplaceExample: "While we were presenting the roadmap, the client raised a security concern.",
        exampleVi: "Khi chúng tôi đang trình bày lộ trình, khách hàng đã nêu lên một quan ngại về bảo mật."
      },
      {
        subId: "past-perfect",
        title: "Quá khứ hoàn thành (Past Perfect)",
        formula: "S + had + V3/ed",
        usage: "Hành động xảy ra và hoàn thành TRƯỚC một hành động hoặc mốc thời gian khác trong quá khứ.",
        signals: "Before, after, by the time, prior to.",
        workplaceExample: "By the time the stakeholder joined the call, we had resolved the incident.",
        exampleVi: "Trước khi bên liên quan tham gia cuộc gọi, chúng tôi đã giải quyết xong sự cố."
      },
      {
        subId: "future-simple-be-going-to",
        title: "Tương lai đơn vs Be Going To (Future Forms)",
        formula: "Will + V-inf (Quyết định tức thời/Dự đoán) vs Am/is/are going to + V-inf (Dự định sẵn có bằng chứng)",
        usage: "Will dùng cho lời hứa, đề nghị, quyết định tại chỗ; Be going to dùng cho kế hoạch đã lên trước.",
        signals: "Tomorrow, next sprint, soon, I think, we plan to.",
        workplaceExample: "I will look into this issue right away. / We are going to launch the beta next month.",
        exampleVi: "Tôi sẽ kiểm tra vấn đề này ngay lập tức. / Chúng tôi dự định ra mắt bản thử nghiệm vào tháng tới."
      }
    ]
  },
  {
    id: "passive-voice",
    title: "2. Câu Bị Động Chuyên Nghiệp (Passive Voice)",
    description: "Cách dùng thể bị động để viết email khách quan, trang trọng và không đổ lỗi cá nhân.",
    icon: "Shield",
    sections: [
      {
        subId: "passive-core",
        title: "Cấu trúc bị động căn bản",
        formula: "S + Be + V3/ed (+ by O)",
        usage: "Dùng khi chủ thể gây ra hành động không quan trọng hoặc muốn nhấn mạnh vào đối tượng chịu tác động.",
        workplaceExample: "The contract was signed by both parties this afternoon.",
        exampleVi: "Hợp đồng đã được ký kết bởi cả hai bên vào chiều nay."
      },
      {
        subId: "passive-impersonal",
        title: "Bị động khách quan (Impersonal Passive)",
        formula: "It is reported/estimated/believed that + S + V",
        usage: "Thường dùng trong báo cáo tài chính, báo cáo dự án để giữ giọng văn trung lập, chuyên nghiệp.",
        workplaceExample: "It is estimated that operational costs will drop by 18% post-automation.",
        exampleVi: "Ước tính rằng chi phí vận hành sẽ giảm 18% sau khi tự động hóa."
      },
      {
        subId: "passive-polite",
        title: "Bị động ngoại giao (Tránh đổ lỗi trong công việc)",
        formula: "An error was made (thay vì You made an error)",
        usage: "Giảm tính công kích cá nhân trong giao tiếp văn phòng và giải quyết phàn nàn.",
        workplaceExample: "A miscommunication occurred, and the delivery was delayed.",
        exampleVi: "Đã xảy ra một sự thiếu nhất quán trong trao đổi, và việc giao hàng đã bị hoãn."
      }
    ]
  },
  {
    id: "conditionals",
    title: "3. Câu Điều Kiện & Đảo Ngữ (Conditionals)",
    description: "Đàm phán hợp đồng, giả định rủi ro kinh doanh và lập kế hoạch dự phòng.",
    icon: "GitBranch",
    sections: [
      {
        subId: "cond-type-1",
        title: "Câu điều kiện loại 1 (Có thể xảy ra trong tương lai)",
        formula: "If + S + V(hiện tại đơn), S + will/can/may + V-inf",
        usage: "Dùng cho thỏa thuận, cam kết tiến độ và điều kiện công việc khả thi.",
        workplaceExample: "If you approve the proposal by Friday, we will begin development on Monday.",
        exampleVi: "Nếu bạn phê duyệt đề xuất trước thứ Sáu, chúng tôi sẽ bắt đầu phát triển vào thứ Hai."
      },
      {
        subId: "cond-type-2",
        title: "Câu điều kiện loại 2 (Giả định trái với hiện tại)",
        formula: "If + S + V2/ed (were), S + would/could + V-inf",
        usage: "Đưa ra lời khuyên lịch sự hoặc giả định tình huống không có thật ở hiện tại.",
        workplaceExample: "If we had additional headcount, we could accelerate the release cycle.",
        exampleVi: "Nếu chúng ta có thêm nhân sự, chúng ta có thể đẩy nhanh chu kỳ phát hành."
      },
      {
        subId: "cond-type-3",
        title: "Câu điều kiện loại 3 (Nuối tiếc hoặc đánh giá quá khứ)",
        formula: "If + S + had + V3/ed, S + would/could + have + V3/ed",
        usage: "Phân tích nguyên nhân sự cố (Post-mortem review) hoặc đánh giá điều đã qua.",
        workplaceExample: "If the load balancer had scaled automatically, the server wouldn't have crashed.",
        exampleVi: "Nếu bộ cân bằng tải tự động co giãn, máy chủ đã không bị sập."
      },
      {
        subId: "cond-inversion",
        title: "Đảo ngữ câu điều kiện (Inversion - Cực trang trọng)",
        formula: "Should you need... (Loại 1) | Were we to... (Loại 2) | Had we known... (Loại 3)",
        usage: "Dùng trong thư từ kinh doanh trang trọng, hợp đồng thương mại quốc tế.",
        workplaceExample: "Should you have any further questions, please feel free to reach out to me.",
        exampleVi: "Nếu quý đối tác có bất kỳ thắc mắc nào thêm, xin vui lòng liên hệ với tôi."
      }
    ]
  },
  {
    id: "relative-clauses",
    title: "4. Mệnh Đề Quan Hệ & Rút Gọn (Relative Clauses)",
    description: "Mở rộng câu văn súc tích, mô tả sản phẩm và viết tài liệu kỹ thuật chuẩn xác.",
    icon: "Network",
    sections: [
      {
        subId: "rel-defining",
        title: "Mệnh đề xác định (Defining) vs Không xác định (Non-defining)",
        formula: "Who (người), Which/That (vật), Whose (sở hữu), Where (nơi chốn)",
        usage: "Non-defining luôn có dấu phẩy và không dùng 'that'.",
        workplaceExample: "Our CEO, who founded the company in 2018, delivered the opening keynote.",
        exampleVi: "Tổng giám đốc của chúng tôi, người đã thành lập công ty năm 2018, đã phát biểu khai mạc."
      },
      {
        subId: "rel-reduced-active",
        title: "Rút gọn mệnh đề chủ động (V-ing)",
        formula: "The person who is leading ➔ The person leading...",
        usage: "Làm câu văn ngắn gọn, thanh thoát hơn.",
        workplaceExample: "Employees seeking travel reimbursement must submit receipts within 7 days.",
        exampleVi: "Nhân viên muốn xin hoàn trả chi phí công tác phải nộp hóa đơn trong vòng 7 ngày."
      },
      {
        subId: "rel-reduced-passive",
        title: "Rút gọn mệnh đề bị động (V3/ed)",
        formula: "The framework which was developed ➔ The framework developed...",
        usage: "Rất phổ biến trong văn bản kỹ thuật và báo cáo thường niên.",
        workplaceExample: "The security protocol outlined in section 3 is mandatory for all personnel.",
        exampleVi: "Giao thức bảo mật được nêu trong mục 3 là bắt buộc đối với tất cả nhân sự."
      }
    ]
  },
  {
    id: "modal-verbs",
    title: "5. Động Từ Khuyết Thiếu & Quá Khứ (Modal Verbs)",
    description: "Mức độ chắc chắn, sắc thái lịch sự trong yêu cầu và đánh giá hành động trong quá khứ.",
    icon: "Compass",
    sections: [
      {
        subId: "modal-past",
        title: "Modal in the Past (Phán đoán & Đánh giá quá khứ)",
        formula: "Should have done (Lẽ ra nên) | Must have done (Chắc hẳn đã) | Could have done (Lẽ ra đã có thể)",
        usage: "Dùng để mổ xẻ vấn đề hoặc phỏng đoán sự việc đã rồi.",
        workplaceExample: "We should have tested this feature on staging before pushing to production.",
        exampleVi: "Lẽ ra chúng ta nên kiểm thử tính năng này trên môi trường staging trước khi đẩy lên production."
      },
      {
        subId: "modal-polite",
        title: "Yêu cầu lịch sự (Could / Would / May vs Can / Will)",
        formula: "Could you please review...? / Would you mind sending...?",
        usage: "Cách nói tiêu chuẩn khi nhờ đồng nghiệp hoặc gửi email khách hàng.",
        workplaceExample: "Would you mind reviewing the revised pitch deck before our 2 PM sync?",
        exampleVi: "Bạn có phiền xem qua tệp thuyết trình đã chỉnh sửa trước buổi họp lúc 2 giờ chiều không?"
      }
    ]
  },
  {
    id: "business-writing",
    title: "6. Mẫu Cấu Trúc Viết Email Công Sở (Business Patterns)",
    description: "Bộ khung viết email quốc tế: Chào hỏi, nêu lý do, từ chối lịch thiệp và chốt việc.",
    icon: "Mail",
    sections: [
      {
        subId: "email-opening",
        title: "Mở đầu thư & Nêu lý do liên hệ",
        formula: "I am writing to follow up on... / I hope this email finds you well.",
        usage: "Tạo cảm giác chuyên nghiệp ngay câu đầu tiên.",
        workplaceExample: "I am writing to follow up on our discussion regarding the partnership terms.",
        exampleVi: "Tôi viết thư này để theo dõi tiến độ cuộc thảo luận của chúng ta về các điều khoản đối tác."
      },
      {
        subId: "email-declining",
        title: "Từ chối lịch thiệp (Diplomatic Declining)",
        formula: "While we appreciate..., unfortunately at this time we are unable to...",
        usage: "Từ chối đề nghị mà không làm mất lòng đối tác.",
        workplaceExample: "While we appreciate your proposal, we have decided to pursue another vendor.",
        exampleVi: "Dù rất cảm kích đề xuất của quý công ty, chúng tôi đã quyết định chọn một nhà cung cấp khác."
      },
      {
        subId: "email-call-to-action",
        title: "Lời kêu gọi hành động & Kết thư",
        formula: "Please let me know your thoughts by [Date]. / Looking forward to hearing from you.",
        usage: "Xác định rõ deadline và mong muốn phản hồi.",
        workplaceExample: "Please let me know your availability for a brief 15-minute alignment call.",
        exampleVi: "Vui lòng cho tôi biết thời gian rảnh của bạn cho một cuộc gọi đồng bộ ngắn 15 phút."
      }
    ]
  },
  {
    id: "common-mistakes",
    title: "7. 25 Lỗi Ngữ Pháp Người Việt Hay Gặp Nhất",
    description: "Tổng hợp các lỗi phổ biến do thói quen dịch Word-by-Word từ tiếng Việt sang tiếng Anh.",
    icon: "AlertTriangle",
    sections: [
      {
        subId: "mistake-advise",
        title: "Advice (Danh từ) vs Advise (Động từ)",
        formula: "Advice [uncountable noun] - không có 'an advice' hay 'advices'.",
        workplaceExample: "❌ He gave me many good advices ➔ ✅ He gave me a lot of good advice.",
        exampleVi: "Lưu ý: 'Advice' là danh từ không đếm được. Muốn đếm phải dùng 'a piece of advice'."
      },
      {
        subId: "mistake-discuss",
        title: "Discuss about something (Thừa giới từ)",
        formula: "Discuss something (không có 'about').",
        workplaceExample: "❌ We will discuss about the deadline ➔ ✅ We will discuss the deadline.",
        exampleVi: "Động từ 'discuss' đã mang nghĩa bàn về cái gì rồi, không thêm 'about'."
      },
      {
        subId: "mistake-feedback",
        title: "Feedbacks (Thừa số nhiều)",
        formula: "Feedback [uncountable noun] - luôn là số ít.",
        workplaceExample: "❌ Thank you for your feedbacks ➔ ✅ Thank you for your feedback.",
        exampleVi: "'Feedback' là danh từ không đếm được trong tiếng Anh."
      },
      {
        subId: "mistake-look-forward",
        title: "Look forward to + V-ing",
        formula: "Look forward to + Verb-ING / Noun",
        workplaceExample: "❌ I look forward to hear from you ➔ ✅ I look forward to hearing from you.",
        exampleVi: "Chữ 'to' ở đây là giới từ, sau đó bắt buộc phải là V-ing hoặc danh từ."
      },
      {
        subId: "mistake-suggest",
        title: "Suggest someone to do something",
        formula: "Suggest that S + (should) V-inf HOẶC Suggest V-ing",
        workplaceExample: "❌ I suggest you to take a rest ➔ ✅ I suggest that you take a rest / I suggest taking a rest.",
        exampleVi: "Không bao giờ dùng cấu trúc 'suggest someone to do something'."
      }
    ]
  }
];
