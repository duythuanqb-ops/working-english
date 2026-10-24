/**
 * TOEIC Comprehensive 4-Skills Dataset (Listening, Reading, Speaking, Writing)
 * Standard ETS Exam Specifications & Workplace Scenarios
 */

// ==========================================
// 1. LISTENING COMPREHENSION (NGHE HIỂU)
// ==========================================

export const TOEIC_PART1_PHOTOS = [
  {
    id: 'p1-1',
    sceneType: 'Office Collaboration / Cuộc họp văn phòng',
    imageContext: 'Một người đàn ông và một người phụ nữ đang ngồi cạnh nhau tại bàn làm việc gỗ, nhìn vào màn hình laptop. Người đàn ông mặc áo sơ mi xanh đang chỉ tay vào màn hình, trên bàn có tài liệu và cốc cà phê.',
    audioPrompt: 'Look at the photograph and listen to the four statements. Select the one that best describes what you see.',
    statements: [
      { key: 'A', text: 'They are hanging a picture on the office wall.', textVi: 'Họ đang treo một bức tranh lên tường văn phòng.' },
      { key: 'B', text: 'One of the people is pointing at a computer screen.', textVi: 'Một trong hai người đang chỉ tay vào màn hình máy tính.' },
      { key: 'C', text: 'The woman is drinking coffee from a ceramic mug.', textVi: 'Người phụ nữ đang uống cà phê từ chiếc cốc gốm.' },
      { key: 'D', text: 'The office desk is completely empty.', textVi: 'Bàn làm việc trong văn phòng hoàn toàn trống trơn.' }
    ],
    correctKey: 'B',
    explanation: 'Phương án B miêu tả chính xác hành động trọng tâm: người đàn ông đang chỉ tay vào màn hình ("pointing at a computer screen"). Phương án A sai hành động, C sai vì cô ấy đang nhìn chứ không uống, D sai vì trên bàn có laptop và tài liệu.',
    trapAlert: 'Bẫy danh từ có trong tranh nhưng sai hành động (cốc cà phê có trên bàn nhưng không ai đang uống).',
    keyVocab: [
      { word: 'Point at', meaningVi: 'Chỉ tay vào vật gì' },
      { word: 'Laptop screen', meaningVi: 'Màn hình máy tính xách tay' },
      { word: 'Collaborate', meaningVi: 'Hợp tác làm việc' }
    ]
  },
  {
    id: 'p1-2',
    sceneType: 'Warehouse & Logistics / Kho bãi & Vận chuyển',
    imageContext: 'Một công nhân mặc áo phản quang vàng và đội mũ bảo hộ đang kiểm tra mã vạch trên các thùng carton xếp trên pallet gỗ trong nhà kho.',
    audioPrompt: 'Look at the photograph and listen to the four statements. Select the one that best describes what you see.',
    statements: [
      { key: 'A', text: 'Some boxes have been stacked on wooden pallets.', textVi: 'Một số hộp carton đã được xếp chồng lên các pallet gỗ.' },
      { key: 'B', text: 'A worker is operating a heavy forklift truck.', textVi: 'Một công nhân đang vận hành xe nâng hàng nặng.' },
      { key: 'C', text: 'The storage shelves are being dismantled.', textVi: 'Các kệ chứa đồ đang bị tháo dỡ.' },
      { key: 'D', text: 'All the packages are being loaded into a delivery van.', textVi: 'Tất cả các kiện hàng đang được bốc lên xe tải giao hàng.' }
    ],
    correctKey: 'A',
    explanation: 'Phương án A miêu tả đúng trạng thái tĩnh của đồ vật: các thùng hàng được xếp chồng ("stacked on wooden pallets"). B sai vì không có xe nâng, C và D dùng thì hiện tại tiếp diễn bị động (being + V3) ám chỉ hành động đang diễn ra mà trong tranh không có.',
    trapAlert: 'Bẫy thì tiếp diễn bị động "being + V3": Nếu không có người đang trực tiếp tháo dỡ/bốc xếp tại khoảnh khắc đó, câu có "being" thường là đáp án sai.',
    keyVocab: [
      { word: 'Stack', meaningVi: 'Xếp chồng lên nhau' },
      { word: 'Pallet', meaningVi: 'Tấm kệ gỗ kê hàng' },
      { word: 'Forklift', meaningVi: 'Xe nâng hàng' }
    ]
  }
];

export const TOEIC_PART2_LISTENING = [
  {
    id: 'p2-1',
    category: 'Câu hỏi When (Thời gian)',
    questionText: 'When will the quarterly financial report be finalized?',
    options: [
      '(A) Yes, I reviewed it yesterday.',
      '(B) By Friday afternoon at the latest.',
      '(C) At the downtown convention center.'
    ],
    correctIndex: 1,
    questionVi: 'Khi nào thì báo cáo tài chính quý sẽ được hoàn tất?',
    optionsVi: [
      '(A) Vâng, tôi đã xem qua hôm qua. (Bẫy Yes/No cho câu hỏi Wh-)',
      '(B) Muộn nhất là chiều thứ Sáu. (Đáp án đúng - mốc thời gian)',
      '(C) Tại trung tâm hội nghị trung tâm thành phố. (Bẫy trả lời cho Where)'
    ],
    trapAlert: 'Câu hỏi bắt đầu bằng "When" KHÔNG BAO GIỜ trả lời bằng "Yes" hoặc "No".',
    keyVocab: [
      { word: 'Quarterly report', meaningVi: 'Báo cáo hàng quý' },
      { word: 'At the latest', meaningVi: 'Muộn nhất là vào...' }
    ]
  },
  {
    id: 'p2-2',
    category: 'Câu hỏi Who / Bộ phận phụ trách',
    questionText: 'Who should I contact regarding the software licensing agreement?',
    options: [
      '(A) Mr. Miller in the legal department.',
      '(B) Yes, the license has expired.',
      '(C) In the conference room on the 5th floor.'
    ],
    correctIndex: 0,
    questionVi: 'Tôi nên liên hệ với ai liên quan đến thỏa thuận cấp phép phần mềm?',
    optionsVi: [
      '(A) Ông Miller ở phòng pháp chế. (Đáp án chỉ người & bộ phận)',
      '(B) Vâng, giấy phép đã hết hạn. (Bẫy Yes/No)',
      '(C) Trong phòng họp ở tầng 5. (Bẫy địa điểm)'
    ],
    trapAlert: 'Câu hỏi "Who" thường có đáp án là: Tên người, Chức danh (Manager, Director) hoặc Tên phòng ban (Legal, HR, IT).',
    keyVocab: [
      { word: 'Regarding', meaningVi: 'Về việc, liên quan đến' },
      { word: 'Licensing agreement', meaningVi: 'Thỏa thuận cấp phép bản quyền' }
    ]
  },
  {
    id: 'p2-3',
    category: 'Câu hỏi Where (Địa điểm)',
    questionText: 'Where can I find the extra ink cartridges for the copy machine?',
    options: [
      '(A) About 200 copies, please.',
      '(B) In the supply closet near the breakroom.',
      '(C) No, the printer is working properly.'
    ],
    correctIndex: 1,
    questionVi: 'Tôi có thể tìm các hộp mực dự phòng cho máy photocopy ở đâu?',
    optionsVi: [
      '(A) Làm ơn cho khoảng 200 bản sao. (Bẫy lặp từ copy)',
      '(B) Trong tủ đồ dùng văn phòng gần phòng nghỉ. (Đáp án chỉ vị trí)',
      '(C) Không, máy in đang hoạt động bình thường. (Bẫy Yes/No)'
    ],
    trapAlert: 'Bẫy lặp âm / từ đồng âm (copy machine ➔ 200 copies). Đáp án đúng là chỉ nơi chốn (supply closet).',
    keyVocab: [
      { word: 'Ink cartridge', meaningVi: 'Hộp mực máy in/photo' },
      { word: 'Supply closet', meaningVi: 'Tủ chứa văn phòng phẩm' }
    ]
  },
  {
    id: 'p2-4',
    category: 'Lời mời & Đề xuất (Why don’t we)',
    questionText: "Why don't we touch base after lunch to review the proposal?",
    options: [
      '(A) Sounds good, let’s meet at 1:30 PM.',
      '(B) Because I was stuck in heavy traffic.',
      '(C) The base of the building is undergoing repairs.'
    ],
    correctIndex: 0,
    questionVi: 'Tại sao chúng ta không trao đổi nhanh sau bữa trưa để xem lại bản đề xuất nhỉ?',
    optionsVi: [
      '(A) Nghe hay đấy, hãy gặp nhau lúc 1:30 chiều nhé. (Đáp ứng lời mời)',
      '(B) Bởi vì tôi bị kẹt xe nghiêm trọng. (Bẫy trả lời Because cho câu rủ rê Why don’t we)',
      '(C) Chân tòa nhà đang được sửa chữa. (Bẫy đồng âm từ "base")'
    ],
    trapAlert: '"Why don’t we..." KHÔNG PHẢI là câu hỏi tìm nguyên nhân, mà là một LỜI ĐỀ NGHỊ/RỦ RÊ. Tránh chọn đáp án bắt đầu bằng "Because"!',
    keyVocab: [
      { word: 'Touch base', meaningVi: 'Trao đổi nhanh, liên lạc cập nhật tình hình' },
      { word: 'Proposal', meaningVi: 'Bản đề xuất kế hoạch' }
    ]
  },
  {
    id: 'p2-5',
    category: 'Câu hỏi Gián tiếp & Phản hồi thực tế (Indirect / Non-standard)',
    questionText: 'Do you know if the client approved the revised project timeline?',
    options: [
      '(A) Yes, they are in the boardroom.',
      '(B) I haven’t checked my email yet this morning.',
      '(C) At the beginning of next month.'
    ],
    correctIndex: 1,
    questionVi: 'Bạn có biết liệu khách hàng đã phê duyệt mốc thời gian dự án sửa đổi chưa?',
    optionsVi: [
      '(A) Vâng, họ đang ở trong phòng họp. (Bẫy địa điểm lạc đề)',
      '(B) Sáng nay tôi vẫn chưa kiểm tra hộp thư email của mình. (Đáp án thực tế - gián tiếp nói chưa biết)',
      '(C) Vào đầu tháng tới. (Bẫy thời gian)'
    ],
    trapAlert: 'Xu hướng đề ETS mới: Đáp án né tránh/gián tiếp ("I haven\'t checked", "Ask Mr. John", "It hasn\'t been announced yet") rất hay là đáp án đúng.',
    keyVocab: [
      { word: 'Project timeline', meaningVi: 'Tiến độ / mốc thời gian dự án' },
      { word: 'Approve', meaningVi: 'Phê duyệt, chấp thuận' }
    ]
  }
];

export const TOEIC_PART3_CONVERSATIONS = [
  {
    id: 'p3-1',
    scenario: 'Văn phòng / Đổi lịch trình công tác (Business Travel Rescheduling)',
    speakers: 'Man & Woman (Colleagues)',
    audioScript: `[Man]: Hi Sandra, did you hear that our flight to Chicago for the tech expo tomorrow morning has been delayed due to severe weather?
[Woman]: Really? That's terrible news. Our keynote presentation is scheduled for 2:00 PM tomorrow afternoon. If we arrive late, we might miss the opening session.
[Man]: I know. I just called the airline, and they can rebook us on an early flight through Detroit that leaves tonight at 8:00 PM. That way, we will already be in Chicago by tomorrow morning.
[Woman]: That sounds like our best option. Please go ahead and confirm those tickets. Meanwhile, I will contact the hotel to let them know we'll be checking in a day earlier than expected.`,
    audioScriptVi: `[Nam]: Chào Sandra, bạn có nghe tin chuyến bay sáng mai của chúng ta đến Chicago để dự triển lãm công nghệ đã bị hoãn do thời tiết xấu không?
[Nữ]: Thật sao? Tin tệ quá. Bài thuyết trình chính của chúng ta dự kiến vào 2:00 chiều mai. Nếu đến muộn, chúng ta có thể lỡ phiên khai mạc.
[Nam]: Tôi biết. Tôi vừa gọi cho hãng hàng không, họ có thể đổi vé cho chúng ta sang chuyến bay sớm qua Detroit khởi hành tối nay lúc 8:00. Bằng cách đó, sáng mai chúng ta sẽ có mặt ở Chicago.
[Nữ]: Đó có vẻ là lựa chọn tốt nhất. Bạn xác nhận vé đi nhé. Trong lúc đó, tôi sẽ liên hệ khách sạn thông báo chúng ta sẽ nhận phòng sớm hơn một ngày.`,
    questions: [
      {
        question: '1. What problem are the speakers discussing?',
        options: [
          '(A) A keynote speaker canceled a speech',
          '(B) A flight has been delayed',
          '(C) A hotel reservation was lost',
          '(D) A presentation file was corrupted'
        ],
        correctIndex: 1,
        explanation: 'Người nam mở đầu: "our flight to Chicago... has been delayed due to severe weather".'
      },
      {
        question: '2. What does the man suggest doing?',
        options: [
          '(A) Postponing the expo presentation',
          '(B) Traveling by train instead',
          '(C) Taking an alternate flight tonight',
          '(D) Canceling the business trip'
        ],
        correctIndex: 2,
        explanation: 'Người nam đề xuất: "they can rebook us on an early flight through Detroit that leaves tonight at 8:00 PM".'
      },
      {
        question: '3. What will the woman do next?',
        options: [
          '(A) Call the hotel regarding an early check-in',
          '(B) Purchase travel insurance online',
          '(C) Rehearse the keynote presentation',
          '(D) Print the conference badges'
        ],
        correctIndex: 0,
        explanation: 'Người nữ nói ở câu cuối: "I will contact the hotel to let them know we\'ll be checking in a day earlier".'
      }
    ],
    keyVocab: [
      { word: 'Keynote presentation', meaningVi: 'Bài thuyết trình chủ đạo' },
      { word: 'Rebook', meaningVi: 'Đổi lại vé / đặt lại lịch' },
      { word: 'Check in earlier', meaningVi: 'Nhận phòng sớm hơn dự kiến' }
    ]
  }
];

export const TOEIC_PART4_TALKS = [
  {
    id: 'p4-1',
    scenario: 'Thông báo phát thanh nội bộ tại siêu thị bán lẻ (Store Announcement)',
    audioScript: `Attention all shoppers at Grandview Electronics. We would like to remind you that our annual inventory clearance sale will conclude this evening at 9:00 PM. Currently, all home theater soundbars, smart televisions, and noise-canceling headphones in the audio department on the second floor are discounted by an additional twenty percent off the marked clearance price. In addition, members of our VIP Rewards Club will earn double reward points on all purchases made before closing time. If you need assistance finding a specific model or wish to schedule home delivery for bulky items, please visit the customer care counter near the central escalators. Thank you for shopping with us today.`,
    audioScriptVi: `Xin quý khách hàng tại Grandview Electronics chú ý. Chúng tôi xin nhắc quý khách rằng đợt giảm giá xả kho hàng năm của chúng tôi sẽ kết thúc vào 9:00 tối nay. Hiện tại, tất cả dàn loa soundbar rạp hát tại gia, tivi thông minh và tai nghe chống ồn ở gian hàng âm thanh tầng 2 đang được giảm thêm 20% trên giá xả kho đã niêm yết. Ngoài ra, thành viên Câu lạc bộ Khách hàng Thân thiết VIP sẽ được nhân đôi điểm thưởng cho mọi đơn mua trước giờ đóng cửa. Nếu quý vị cần trợ giúp tìm model cụ thể hoặc muốn hẹn lịch giao hàng tận nhà cho đồ cồng kềnh, xin vui lòng đến quầy chăm sóc khách hàng gần thang cuốn trung tâm. Cảm ơn quý khách đã mua sắm cùng chúng tôi.`,
    questions: [
      {
        question: '1. What is the speaker primarily announcing?',
        options: [
          '(A) The grand opening of a new store branch',
          '(B) The final hours of a special clearance sale',
          '(C) A change in weekly store operating hours',
          '(D) An upcoming product demonstration workshop'
        ],
        correctIndex: 1,
        explanation: 'Người nói thông báo: "our annual inventory clearance sale will conclude this evening at 9:00 PM".'
      },
      {
        question: '2. According to the announcement, what benefit is offered to VIP Rewards Club members?',
        options: [
          '(A) Free gift wrapping',
          '(B) An extended warranty on electronics',
          '(C) Double reward points on purchases',
          '(D) Complimentary parking vouchers'
        ],
        correctIndex: 2,
        explanation: 'Người nói nêu rõ: "members of our VIP Rewards Club will earn double reward points on all purchases made before closing time".'
      },
      {
        question: '3. Why are shoppers advised to visit the customer care counter?',
        options: [
          '(A) To sign up for store credit cards',
          '(B) To return damaged merchandise',
          '(C) To arrange delivery for large items',
          '(D) To claim free promotional samples'
        ],
        correctIndex: 2,
        explanation: 'Trong bài nói: "wish to schedule home delivery for bulky items, please visit the customer care counter".'
      }
    ],
    keyVocab: [
      { word: 'Inventory clearance', meaningVi: 'Xả hàng tồn kho' },
      { word: 'Bulky items', meaningVi: 'Hàng hóa cồng kềnh' },
      { word: 'Conclude', meaningVi: 'Kết thúc, khép lại' }
    ]
  }
];

// ==========================================
// 2. READING COMPREHENSION (ĐỌC HIỂU)
// ==========================================

export const TOEIC_PART5_QUESTIONS = [
  {
    id: 'p5-1',
    category: 'Từ loại (Word Form)',
    difficulty: '500+',
    question: 'The executive committee is looking for a _______ candidate who possesses proven leadership skills.',
    options: ['qualify', 'qualification', 'qualified', 'qualifying'],
    correctIndex: 2,
    translation: 'Ban điều hành đang tìm kiếm một ứng viên có đủ năng lực, người sở hữu kỹ năng lãnh đạo đã được chứng minh.',
    explanation: 'Vị trí giữa mạo từ "a" và danh từ "candidate" bắt buộc là một TÍNH TỪ để bổ nghĩa. "Qualified" (tính từ: có đủ năng lực, đủ trình độ) là đáp án chính xác duy nhất.',
    trapAlert: 'Bẫy danh từ ghép: Tránh chọn "qualification" vì "qualification candidate" là sai ngữ pháp.',
    keyVocabulary: [
      { word: 'Qualified', pos: 'adj', meaningVi: 'Đủ điều kiện, có năng lực' },
      { word: 'Candidate', pos: 'noun', meaningVi: 'Ứng viên tuyển dụng' },
      { word: 'Possess', pos: 'verb', meaningVi: 'Sở hữu, có' }
    ]
  },
  {
    id: 'p5-2',
    category: 'Liên từ & Giới từ (Conjunctions)',
    difficulty: '650+',
    question: '_______ the unexpected server malfunction, our engineering team managed to deploy the software update on schedule.',
    options: ['Despite', 'Although', 'Because', 'Even though'],
    correctIndex: 0,
    translation: 'Mặc dù sự cố máy chủ bất ngờ xảy ra, đội ngũ kỹ sư của chúng tôi vẫn xoay sở triển khai bản cập nhật phần mềm đúng tiến độ.',
    explanation: '"the unexpected server malfunction" là một CỤM DANH TỪ (Noun Phrase), do đó phải dùng giới từ chỉ sự nhượng bộ "Despite" (+ Noun Phrase). "Although" và "Even though" bắt buộc phải đi với một mệnh đề (S + V).',
    trapAlert: 'Bẫy kinh điển ETS: Nhầm lẫn giữa giới từ (Despite / In spite of) và liên từ (Although / Even though / Though).',
    keyVocabulary: [
      { word: 'Malfunction', pos: 'noun', meaningVi: 'Sự cố trục trặc kỹ thuật' },
      { word: 'On schedule', pos: 'phrase', meaningVi: 'Đúng tiến độ dự kiến' },
      { word: 'Deploy', pos: 'verb', meaningVi: 'Triển khai, phát hành' }
    ]
  },
  {
    id: 'p5-3',
    category: 'Từ vựng công sở (Business Vocab)',
    difficulty: '650+',
    question: 'All employees are strictly required to _______ with the revised company data privacy policy.',
    options: ['comply', 'adhere', 'observe', 'follow'],
    correctIndex: 0,
    translation: 'Tất cả nhân viên được yêu cầu nghiêm ngặt phải tuân thủ chính sách bảo mật dữ liệu đã sửa đổi của công ty.',
    explanation: 'Giới từ đi kèm là "with". Cụm từ cố định trong hợp đồng và quy chế là "comply with" (tuân thủ). Nếu dùng "adhere" thì phải đi với "to" (adhere to). "Observe" và "follow" là ngoại động từ đi trực tiếp với tân ngữ (không có with).',
    trapAlert: 'Bẫy giới từ đi kèm: Comply WITH, Adhere TO, Abide BY, Conform TO.',
    keyVocabulary: [
      { word: 'Comply with', pos: 'verb', meaningVi: 'Tuân thủ, tuân theo quy định' },
      { word: 'Privacy policy', pos: 'noun', meaningVi: 'Chính sách bảo mật quyền riêng tư' },
      { word: 'Revised', pos: 'adj', meaningVi: 'Đã được chỉnh sửa, cập nhật' }
    ]
  },
  {
    id: 'p5-4',
    category: 'Từ loại (Word Form)',
    difficulty: '500+',
    question: 'Ms. Tanaka reviewed the annual audit report very _______ before submitting it to the Board of Directors.',
    options: ['care', 'careful', 'carefully', 'carefulness'],
    correctIndex: 2,
    translation: 'Bà Tanaka đã rà soát báo cáo kiểm toán thường niên rất cẩn thận trước khi trình lên Hội đồng Quản trị.',
    explanation: 'Từ cần điền bổ nghĩa cho động từ hành động "reviewed". Cần một TRẠNG TỪ (Adverb) có đuôi "-ly" đứng sau cụm tân ngữ. Đáp án đúng là "carefully".',
    trapAlert: 'Phân biệt tính từ (-ful) và trạng từ (-fully) khi bổ nghĩa cho động từ hành động.',
    keyVocabulary: [
      { word: 'Audit', pos: 'noun/verb', meaningVi: 'Kiểm toán, thanh tra tài chính' },
      { word: 'Board of Directors', pos: 'noun', meaningVi: 'Hội đồng Quản trị' }
    ]
  },
  {
    id: 'p5-5',
    category: 'Thì & Thể bị động (Tenses & Passive)',
    difficulty: '650+',
    question: 'The new regional headquarters in Singapore _______ next month by our Chief Executive Officer.',
    options: ['will be inaugurated', 'inaugurated', 'has inaugurated', 'is inaugurating'],
    correctIndex: 0,
    translation: 'Trụ sở khu vực mới tại Singapore sẽ được khánh thành vào tháng tới bởi Tổng Giám đốc Điều hành của chúng ta.',
    explanation: 'Chủ ngữ "The new regional headquarters" (vật) không thể tự hành động, kết hợp với "by our CEO" và dấu hiệu thời gian tương lai "next month", câu cần thể BỊ ĐỘNG tương lai đơn: "will be + V3/ed".',
    trapAlert: 'Bẫy thể chủ động / bị động và dấu hiệu thời gian "next month".',
    keyVocabulary: [
      { word: 'Inaugurate', pos: 'verb', meaningVi: 'Khánh thành, khai trương trọng thể' },
      { word: 'Headquarters', pos: 'noun', meaningVi: 'Trụ sở chính' }
    ]
  },
  {
    id: 'p5-6',
    category: 'Đại từ phản thân & Sở hữu (Pronouns)',
    difficulty: '500+',
    question: 'Mr. Henderson completed the quarterly budget forecast all by _______ after the analyst resigned.',
    options: ['he', 'him', 'his', 'himself'],
    correctIndex: 3,
    translation: 'Ông Henderson đã tự mình hoàn thành toàn bộ dự báo ngân sách quý sau khi chuyên viên phân tích từ chức.',
    explanation: 'Thành ngữ "by oneself" = tự mình làm việc gì đó mà không cần ai giúp đỡ. "By himself" là cấu trúc chính xác.',
    trapAlert: 'Bẫy chọn đại từ nhân xưng tân ngữ "him" thay vì đại từ phản thân "himself" sau cụm "by".',
    keyVocabulary: [
      { word: 'Forecast', pos: 'noun', meaningVi: 'Dự báo, số liệu tiên lượng' },
      { word: 'Resign', pos: 'verb', meaningVi: 'Từ chức, thôi việc' }
    ]
  },
  {
    id: 'p5-7',
    category: 'Từ vựng công sở (Business Vocab)',
    difficulty: '800+',
    question: 'All travel expense receipts must be _______ to the finance department within five business days.',
    options: ['submitted', 'relieved', 'exempted', 'postponed'],
    correctIndex: 0,
    translation: 'Mọi hóa đơn chi phí công tác phải được nộp cho phòng tài chính trong vòng năm ngày làm việc.',
    explanation: '"Submit ... to" (nộp/gửi tài liệu cho ai) là ngữ cảnh chính xác nhất. Các từ khác: "relieved" (giảm nhẹ/xoa dịu), "exempted" (miễn trừ), "postponed" (hoãn lại).',
    trapAlert: 'Bẫy ngữ cảnh chuyên ngành kế toán - tài chính doanh nghiệp.',
    keyVocabulary: [
      { word: 'Receipt', pos: 'noun', meaningVi: 'Biên lai, hóa đơn chứng từ' },
      { word: 'Business days', pos: 'noun', meaningVi: 'Ngày làm việc (không tính thứ 7, CN)' }
    ]
  },
  {
    id: 'p5-8',
    category: 'Rút gọn mệnh đề & Phân từ (Participles)',
    difficulty: '800+',
    question: '_______ all customer feedback, the product manager decided to redesign the checkout interface.',
    options: ['Having analyzed', 'Analyzed', 'Analyze', 'To analyzing'],
    correctIndex: 0,
    translation: 'Sau khi đã phân tích toàn bộ phản hồi của khách hàng, trưởng nhóm sản phẩm đã quyết định thiết kế lại giao diện thanh toán.',
    explanation: 'Hành động phân tích xảy ra trước quyết định thiết kế lại, do đó mệnh đề phân từ hoàn thành "Having + V3/ed" (Having analyzed) diễn tả hành động đã hoàn tất trước một hành động khác trong quá khứ.',
    trapAlert: 'Bẫy rút gọn mệnh đề quan hệ và phân từ hoàn thành trong câu điểm 800+.',
    keyVocabulary: [
      { word: 'Customer feedback', pos: 'noun', meaningVi: 'Ý kiến phản hồi từ khách hàng' },
      { word: 'Checkout interface', pos: 'noun', meaningVi: 'Giao diện thanh toán' }
    ]
  }
];

export const TOEIC_PART6_PASSAGES = [
  {
    id: 'p6-1',
    title: 'Thông Báo Nội Bộ: Chuyển Đổi Nộp Chi Phí Công Tác Điện Tử (Internal Expense Reporting Memo)',
    passageText: `MEMORANDUM
To: All Regional Staff
From: Finance Department
Subject: New Online Expense Reporting System

Starting in October, all travel expense claims must be submitted through our new digital portal. Paper submission forms (1) [___] after September 30. The new portal allows staff to photograph receipts on their smartphones and upload them directly, eliminating the need to physically store receipts once claims are approved.

(2) [___]. Claims filed before the fifteenth of each month will be reimbursed within that month's payroll cycle; submissions made after that date will automatically roll into the subsequent month.

If you encounter technical issues when signing into the portal, please contact the IT Helpdesk (3) [___] than emailing your regional branch supervisor. Training webinars will take place next Tuesday to guide everyone through the interface. We truly appreciate your full cooperation during this transition to a more (4) [___] administrative workflow.`,
    blanks: [
      {
        blankIndex: 1,
        options: [
          '(A) will not accept',
          '(B) will not be accepted',
          '(C) are not accepting',
          '(D) have not accepted'
        ],
        correctIndex: 1,
        explanation: 'Chủ ngữ là "Paper submission forms" (biểu mẫu giấy - vật) nên động từ phải ở thể BỊ ĐỘNG tương lai: "will not be accepted".'
      },
      {
        blankIndex: 2,
        options: [
          '(A) Please make sure to submit receipts in chronological order.',
          '(B) Paper forms will remain available upon special request.',
          '(C) Please note the processing schedule for your reimbursement claims.',
          '(D) The finance department is relocating to the fourth floor.'
        ],
        correctIndex: 2,
        explanation: 'Câu đứng liền sau nói về lịch hoàn tiền ("Claims filed before the fifteenth..."), nên câu mở đoạn (C) là câu dẫn đề logic nhất về lịch xử lý hồ sơ.'
      },
      {
        blankIndex: 3,
        options: [
          '(A) rather',
          '(B) more',
          '(C) instead',
          '(D) other'
        ],
        correctIndex: 0,
        explanation: 'Cụm cố định: "rather than" (thay vì làm gì). "Instead of" thì cần đi kèm of, "other than" mang nghĩa ngoại trừ.'
      },
      {
        blankIndex: 4,
        options: [
          '(A) streamline',
          '(B) streamlined',
          '(C) streamlining',
          '(D) streamliner'
        ],
        correctIndex: 1,
        explanation: 'Cần một tính từ đứng trước cụm danh từ "administrative workflow". "Streamlined" (được tinh giản, tối ưu hóa) là tính từ phân từ chính xác.'
      }
    ],
    keyVocab: [
      { word: 'Reimbursement', meaningVi: 'Khoản tiền hoàn trả chi phí công tác' },
      { word: 'Streamlined', meaningVi: 'Được tinh giản, hiệu quả hóa' },
      { word: 'Subsequent', meaningVi: 'Kế tiếp, tiếp theo sau' }
    ]
  }
];

export const TOEIC_PART7_PASSAGES = [
  {
    id: 'p7-1',
    passageType: 'Email Trao Đổi Nghiệp Vụ (Workplace Email)',
    documentContent: `To: All Department Managers
From: Rachel Vance, Facilities Director
Date: October 12
Subject: Annual Office Building Maintenance & Server Outages

Dear Managers,

Please be advised that the annual comprehensive maintenance of the Apex Corporate Tower will take place from Monday, November 6 through Wednesday, November 8. During this three-day period, certified engineering teams will inspect electrical wiring, service central HVAC (heating, ventilation, and air conditioning) units, and upgrade the fiber-optic network infrastructure.

Because of the extensive nature of these updates, electricity and high-speed internet services will be temporarily interrupted on specific floors:
• Monday, Nov 6: Floors 1 through 3 will experience complete outages.
• Tuesday, Nov 7: Floors 4 through 6 (including Marketing & Accounting) will be affected.
• Wednesday, Nov 8: Work will conclude on executive floors 7 through 9.

We strongly advise all personnel working on scheduled floors to back up all digital assets to the cloud and completely power down desktop terminals before leaving the office on Friday, November 3. Furthermore, remote work from home has been officially approved by executive management for staff on affected floors on their scheduled maintenance days.

Sincerely,
Rachel Vance
Facilities Director, Apex Corporate Tower`,
    questions: [
      {
        question: '1. What is the primary purpose of this email?',
        options: [
          '(A) To notify managers about scheduled facility maintenance and service outages',
          '(B) To recruit engineers for a building expansion project',
          '(C) To announce permanent corporate relocation to a new tower',
          '(D) To enforce a mandatory full-time remote work policy'
        ],
        correctIndex: 0,
        explanation: 'Tiêu đề email và đoạn 1 nêu rõ mục đích: thông báo cho các quản lý về đợt bảo trì tòa nhà thường niên và việc gián đoạn điện thoại/mạng.'
      },
      {
        question: '2. On which date will the Accounting department (located on Floor 5) be affected by outages?',
        options: [
          '(A) Friday, November 3',
          '(B) Monday, November 6',
          '(C) Tuesday, November 7',
          '(D) Wednesday, November 8'
        ],
        correctIndex: 2,
        explanation: 'Trong thông báo: "Tuesday, Nov 7: Floors 4 through 6 (including Marketing & Accounting) will be affected". Tầng 5 nằm trong nhóm này.'
      },
      {
        question: '3. What are employees on affected floors instructed to do on Friday, November 3?',
        options: [
          '(A) Return all company laptops to IT support',
          '(B) Back up their digital files and shut down desktop computers',
          '(C) Submit their revised performance reviews',
          '(D) Work overtime to complete pending invoices'
        ],
        correctIndex: 1,
        explanation: 'Đoạn cuối: "...strongly advise all personnel working on scheduled floors to back up all digital assets to the cloud and completely power down desktop terminals before leaving on Friday, November 3".'
      }
    ],
    keyVocab: [
      { word: 'HVAC system', meaningVi: 'Hệ thống sưởi, thông gió và điều hòa' },
      { word: 'Outage', meaningVi: 'Sự cố mất điện / mất mạng gián đoạn' },
      { word: 'Power down', meaningVi: 'Tắt nguồn máy móc hoàn toàn' }
    ]
  }
];

// ==========================================
// 3. SPEAKING (KỸ NĂNG NÓI - TOEIC SW)
// ==========================================

export const TOEIC_SPEAKING_TASKS = [
  {
    id: 'spk-1',
    part: 'Part 1 (Q1 - Q2)',
    partName: 'Đọc to đoạn văn (Read a Text Aloud)',
    prepTimeSec: 45,
    speakTimeSec: 45,
    prompt: 'Read the following business announcement aloud. You will be evaluated on pronunciation, intonation, and rhythm.',
    textToRead: `Thank you for calling Westbrook Pharmacy. Our pharmacy is open Monday through Friday from 8:00 A.M. to 9:00 P.M., and on Saturdays from 9:00 A.M. to 6:00 P.M. If you are calling about a prescription refill, please press one. For store locations and driving directions, please press two. To speak directly with a licensed pharmacist, please hold the line, and a representative will assist you shortly.`,
    scoringFocus: [
      'Ngắt nghỉ (Pauses): Nghỉ ngắn ở dấu phẩy (,) và nghỉ rõ ở cuối câu (.)',
      'Ngữ điệu liệt kê (Listing Intonation): Lên giọng ở các lựa chọn đầu (one ↗, two ↗) và hạ giọng ở lựa chọn cuối (shortly ↘)',
      'Phát âm âm đuôi: "pres-crip-tion re-fill", "pharma-cist", "repre-sen-ta-tive"'
    ],
    phoneticGuide: 'Westbrook /ˈwest.brʊk/ • Pharmacy /ˈfɑː.mə.si/ • Prescription /prɪˈskrɪp.ʃən/ • Pharmacist /ˈfɑː.mə.sɪst/',
    modelAudioText: 'Thank you for calling Westbrook Pharmacy. Our pharmacy is open Monday through Friday from 8:00 A.M. to 9:00 P.M., and on Saturdays from 9:00 A.M. to 6:00 P.M. If you are calling about a prescription refill, please press one. For store locations and driving directions, please press two. To speak directly with a licensed pharmacist, please hold the line, and a representative will assist you shortly.'
  },
  {
    id: 'spk-2',
    part: 'Part 2 (Q3 - Q4)',
    partName: 'Miêu tả bức tranh (Describe a Picture)',
    prepTimeSec: 45,
    speakTimeSec: 30,
    prompt: 'Describe the picture on your screen in as much detail as possible. Focus on location, people, actions, and background details.',
    imageDescription: 'Một văn phòng hiện đại với 2 đồng nghiệp (1 nam, 1 nữ) đang trao đổi công việc trước màn hình máy tính xách tay. Người nam đang chỉ tay vào biểu đồ số liệu, người nữ chăm chú lắng nghe và cầm sổ ghi chép.',
    strategyTemplate: [
      '1. Mở bài (Tổng quan): "This picture was taken in a modern office environment..."',
      '2. Trọng tâm (Người & Hành động): "In the foreground, a man and a woman are collaborating at a desk. The man is pointing at a laptop screen..."',
      '3. Chi tiết phụ & Hậu cảnh: "On the desk, there are some paper documents and a coffee mug. In the background, there is a large window with soft sunlight..."',
      '4. Cảm nghĩ/Kết luận: "Overall, they seem completely focused on finalizing their project report."'
    ],
    sampleBand8Answer: `This is a photo taken inside a contemporary office. In the center, two colleagues are sitting side by side at a wooden conference desk. The man on the left, wearing a light blue dress shirt, is pointing directly at a data chart on the laptop screen. The woman on the right, dressed in a professional blazer, is listening attentively while holding a notepad and pen. On the table, I can see several folders, a smartphone, and a white coffee mug. In the background, there is a large glass window that lets in ample natural light. Overall, the atmosphere appears highly productive and collaborative.`,
    keyVocab: [
      { word: 'Attentively', meaningVi: 'Chăm chú, tập trung lắng nghe' },
      { word: 'Contemporary office', meaningVi: 'Văn phòng hiện đại' },
      { word: 'Collaborative atmosphere', meaningVi: 'Bầu không khí hợp tác' }
    ]
  },
  {
    id: 'spk-3',
    part: 'Part 3 (Q5 - Q7)',
    partName: 'Trả lời câu hỏi tình huống (Respond to Questions)',
    scenario: 'Imagine that a market research firm is conducting a survey on shopping habits and consumer electronics in your area.',
    prepTimeSec: 3,
    questions: [
      {
        qNum: 'Question 5 (15 giây)',
        question: 'When was the last time you bought electronic gadgets, and what did you purchase?',
        prepSec: 3,
        speakSec: 15,
        modelAnswer: 'The last time I purchased an electronic gadget was two weeks ago. I bought a pair of wireless noise-canceling headphones from an online retailer because I needed them for my daily commute and office video calls.'
      },
      {
        qNum: 'Question 6 (15 giây)',
        question: 'Do you prefer shopping for electronics online or at a physical electronics store, and why?',
        prepSec: 3,
        speakSec: 15,
        modelAnswer: 'I definitely prefer shopping at physical stores because I can test the sound quality and examine the build materials in person before deciding to buy, which avoids the inconvenience of returning defective products.'
      },
      {
        qNum: 'Question 7 (30 giây)',
        question: 'What is the most important factor when choosing an electronics brand, and why?',
        prepSec: 3,
        speakSec: 30,
        modelAnswer: 'In my view, reliable customer warranty and after-sales support are the most critical factors. High-tech devices are complex, so if a software malfunction occurs, having access to prompt technical repair gives me peace of mind. Additionally, long battery life and proven durability ensure that the investment remains valuable over several years.'
      }
    ]
  },
  {
    id: 'spk-4',
    part: 'Part 4 (Q8 - Q10)',
    partName: 'Trả lời câu hỏi theo lịch trình (Respond Using Information Provided)',
    prepTimeSec: 45,
    prompt: 'Read the conference schedule below. You will answer three questions based on this provided schedule.',
    scheduleData: {
      title: 'Global Tech Summit 2026 — Program Agenda',
      date: 'Thursday, November 12',
      location: 'Grand Ballroom, Pacific Hotel',
      sessions: [
        { time: '09:00 - 10:15 AM', topic: 'Opening Keynote: The Future of Cloud Architecture', speaker: 'Dr. Michael Chen, Chief Architect' },
        { time: '10:30 - 11:45 AM', topic: 'Workshop: Enterprise Cyber Security Best Practices', speaker: 'Ms. Sarah Jenkins, Lead Security Analyst' },
        { time: '12:00 - 01:15 PM', topic: 'Networking Luncheon & Product Demonstrations', speaker: 'All Attendees & Sponsors' },
        { time: '01:30 - 02:45 PM', topic: 'Case Study: AI Automation in Financial Services', speaker: 'Mr. David Morales, VP of Fintech' },
        { time: '03:00 - 04:30 PM', topic: 'Panel Discussion: Scaling Global Engineering Teams', speaker: 'Tech Leaders Roundtable' }
      ]
    },
    questions: [
      {
        qNum: 'Question 8 (15 giây)',
        question: 'What time does the summit begin, and who will deliver the opening keynote speech?',
        modelAnswer: 'The summit begins at 9:00 A.M., and the opening keynote speech on the Future of Cloud Architecture will be delivered by Dr. Michael Chen.'
      },
      {
        qNum: 'Question 9 (15 giây)',
        question: 'I heard that the cyber security workshop is scheduled in the afternoon. Can you confirm that?',
        modelAnswer: 'Actually, that information is incorrect. The cyber security workshop is scheduled in the morning, from 10:30 to 11:45 A.M., led by Ms. Sarah Jenkins.'
      },
      {
        qNum: 'Question 10 (30 giây)',
        question: 'Could you please give me full details about all the sessions scheduled to take place in the afternoon?',
        modelAnswer: 'Certainly. There are two sessions scheduled in the afternoon. First, from 1:30 to 2:45 P.M., Mr. David Morales will present a case study on AI Automation in Financial Services. Following that, from 3:00 to 4:30 P.M., there will be a panel discussion on Scaling Global Engineering Teams featuring a tech leaders roundtable.'
      }
    ]
  },
  {
    id: 'spk-5',
    part: 'Part 5 (Q11)',
    partName: 'Bày tỏ quan điểm (Express an Opinion - 60s)',
    prepTimeSec: 45,
    speakTimeSec: 60,
    prompt: 'Do you agree or disagree with the following statement? "Companies should allow their employees to work remotely from home at least two days per week." State your opinion and support it with specific reasons and examples.',
    peelOutline: [
      'P (Point): Khẳng định lập trường đồng ý (I strongly agree that...)',
      'E (Explanation 1): Tiết kiệm thời gian di chuyển, giảm stress tắc đường ➔ tăng năng suất',
      'E (Explanation 2): Cân bằng công việc & cuộc sống (Work-life balance) ➔ giữ chân nhân tài',
      'L (Link/Conclusion): Tóm tắt lại giá trị đôi bên cùng có lợi (win-win for both employers and staff)'
    ],
    sampleBand8Answer: `I strongly agree that modern companies should allow employees to work remotely from home at least two days a week. There are two primary reasons for my opinion.

First, hybrid remote work dramatically boosts productivity by eliminating long daily commutes. In bustling metropolitan cities, employees often spend two hours each day stuck in heavy traffic, which causes severe fatigue before the workday even begins. By working from home a couple of days, workers can channel that saved energy into deep, focused tasks without office distractions.

Second, this flexibility promotes a superior work-life balance. When employees have the autonomy to manage their schedules, they experience lower stress levels, which naturally leads to higher job satisfaction and lower staff turnover rates for employers. For instance, my company adopted a two-day remote policy last year, and our team completed quarterly deliverables twenty percent faster.

Therefore, embracing a hybrid schedule is a win-win strategy for both corporate success and employee well-being.`
  }
];

// ==========================================
// 4. WRITING (KỸ NĂNG VIẾT - TOEIC SW)
// ==========================================

export const TOEIC_WRITING_TASKS = [
  {
    id: 'wrt-1',
    part: 'Part 1 (Q1 - Q5)',
    partName: 'Viết câu dựa trên tranh (Write a Sentence Based on a Picture)',
    timeMinutes: 8,
    prompt: 'Write ONE grammatically correct sentence based on the picture using the TWO keywords provided. You may alter word forms and use them in any order.',
    tasks: [
      {
        qNum: 'Question 1',
        sceneDescription: 'Một người đàn ông đang ngồi trên ghế băng gỗ trong công viên rợp bóng cây xanh mát.',
        keywords: ['bench', 'near / trees'],
        modelAnswers: [
          'A man is sitting on a wooden bench near several large trees.',
          'There is an empty park bench positioned near the tall green trees.'
        ],
        grammarNotes: 'Cần một mệnh đề hoàn chỉnh (S + V + O) liên kết danh từ bench và cụm giới từ near trees.'
      },
      {
        qNum: 'Question 2',
        sceneDescription: 'Một hàng xe đạp công cộng cho thuê được xếp gọn gàng trên giá đỗ kim loại ven vỉa hè.',
        keywords: ['bicycles', 'on / rack'],
        modelAnswers: [
          'Several rental bicycles are neatly parked on the metal rack along the sidewalk.',
          'Many bicycles have been placed on the rack for public commuters.'
        ],
        grammarNotes: 'Sử dụng thể bị động "are parked on / have been placed on" để miêu tả trạng thái đồ vật.'
      },
      {
        qNum: 'Question 3',
        sceneDescription: 'Một nhân viên giao hàng mặc đồng phục đang trao gói kiện hàng carton cho nhân viên lễ tân.',
        keywords: ['hand / to', 'package'],
        modelAnswers: [
          'The delivery courier is handing a cardboard package to the receptionist at the front desk.',
          'A worker handed the package to a customer in the office lobby.'
        ],
        grammarNotes: 'Cấu trúc "hand something to someone" (trao cái gì cho ai).'
      }
    ]
  },
  {
    id: 'wrt-2',
    part: 'Part 2 (Q6 - Q7)',
    partName: 'Viết Email phản hồi công việc (Respond to a Written Request)',
    timeMinutes: 10,
    prompt: 'Read the customer email below and write a professional, courteous business response addressing all specified requirements.',
    emailReceived: {
      from: 'Mark Taylor <m.taylor@apexmail.com>',
      to: 'Customer Support <support@officeworld.com>',
      subject: 'Inquiry regarding damaged ergonomic chair (Order #49281)',
      date: 'October 24',
      body: `Dear Customer Service Team,

I recently purchased an ergonomic executive office chair (Order #49281) through your website. When I unpacked the shipment this morning, I discovered that the right armrest is severely cracked and cannot be assembled safely. 

Could you please inform me how this issue can be resolved promptly? I urgently need this chair for my home office setup.

Sincerely,
Mark Taylor`
    },
    writingRequirements: [
      '1. Bày tỏ lời xin lỗi chân thành và đồng cảm về sự cố giao hàng.',
      '2. Đưa ra 2 giải pháp cụ thể: (A) Giao ngay tay vịn thay thế miễn phí trong 24h, HOẶC (B) Đổi nguyên chiếc ghế mới và cử nhân viên thu hồi ghế cũ.',
      '3. Hướng dẫn khách hàng bước xác nhận tiếp theo.'
    ],
    sampleBand8Email: `Dear Mr. Taylor,

Thank you for contacting OfficeWorld Customer Support, and please accept our sincere apologies for the damaged ergonomic chair you received in Order #49281. We pride ourselves on product quality and deeply regret the inconvenience this has caused your home office setup.

To resolve this matter as quickly as possible, we would like to present two immediate solutions:

1. Express Part Replacement: We can dispatch a brand-new replacement armrest via priority courier within 24 hours at no additional charge, complete with installation tools and simple assembly instructions.
2. Complete Unit Exchange: Alternatively, we can deliver a completely new executive chair to your address this Thursday and have our delivery personnel collect the defective item simultaneously.

Please reply to this email with your preferred option and confirm your current shipping address. We will expedite the process immediately upon your confirmation.

Thank you for your patience and understanding.

Warm regards,
Jessica Reynolds
Senior Customer Relations Specialist
OfficeWorld Support Team`
  },
  {
    id: 'wrt-3',
    part: 'Part 3 (Q8)',
    partName: 'Viết bài luận bày tỏ quan điểm (Write an Opinion Essay)',
    timeMinutes: 30,
    targetWords: 'Tối thiểu 300 từ (4 - 5 đoạn chuẩn cấu trúc ETS)',
    prompt: 'Some companies believe that all employees should be required to wear formal business attire (such as suits and ties), while others encourage business casual or relaxed clothing. Which dress code policy do you prefer, and why? Support your position with specific workplace examples and reasons.',
    essayStructureGuide: [
      'Đoạn 1: Mở bài (Introduction) — Paraphrase đề bài + Khẳng định luận điểm chọn phong cách Business Casual.',
      'Đoạn 2: Thân bài 1 (Body 1) — Tăng cường sự thoải mái thể chất, giúp nhân viên tập trung làm việc sáng tạo hơn.',
      'Đoạn 3: Thân bài 2 (Body 2) — Tiết kiệm chi phí trang phục đắt đỏ, tạo môi trường giao tiếp bình đẳng, cởi mở giữa sếp và nhân viên.',
      'Đoạn 4: Kết bài (Conclusion) — Khẳng định lại giá trị của Business Casual nhưng lưu ý linh hoạt khi gặp gỡ đối tác ngoại giao quan trọng.'
    ],
    sampleBand8Essay: `In recent decades, corporate workplace culture has evolved substantially, prompting widespread debate over appropriate office dress codes. While traditional corporations mandate formal attire such as suits and ties, a growing number of modern enterprises advocate for business casual clothing. In my opinion, adopting a business casual dress policy is far superior because it fosters employee comfort, stimulates creative productivity, and reduces financial strain on workers.

To begin with, comfortable attire directly correlates with higher workplace productivity and mental well-being. Rigid suits, stiff collars, and high heels often cause physical fatigue, especially during long work shifts at a computer desk. When professionals are permitted to wear breathable, ergonomic clothing such as polo shirts and slacks, they experience far less physical tension. For instance, many world-leading technology companies like Google and Apple maintain relaxed dress codes, allowing their software engineers and designers to focus their mental energy entirely on innovation and complex problem-solving rather than uncomfortable wardrobe constraints.

Furthermore, a business casual policy creates a more approachable and collaborative corporate atmosphere. Traditional formal dress can reinforce rigid departmental hierarchies, making junior associates feel intimidated when speaking with senior executives. Conversely, when managers and employees dress in similar casual attire, barriers diminish, encouraging open communication, spontaneous brainstorming, and genuine team camaraderie. Additionally, maintaining multiple high-end business suits requires substantial expenses for dry cleaning and wardrobe updates, placing unnecessary financial burdens on recent university graduates who have just entered the corporate workforce.

In conclusion, although formal suits may remain suitable for ceremonial ceremonies or high-stakes legal proceedings, a business casual dress code represents the most practical and beneficial standard for modern day-to-day office life. By prioritizing comfort, collaboration, and financial fairness, organizations can cultivate a motivated workforce that consistently delivers outstanding results.`
  }
];

// ==========================================
// 5. 600 ESSENTIAL BUSINESS WORDS
// ==========================================

export const TOEIC_600_WORDS = [
  // 1. Contracts & Agreements
  {
    word: 'Obligate',
    ipa: '/ˈɒb.lɪ.ɡeɪt/',
    partOfSpeech: 'verb',
    meaningVi: 'Bắt buộc, ràng buộc nghĩa vụ pháp lý',
    topic: 'Contracts & Agreements',
    collocation: 'Obligated to comply',
    exampleEn: 'The contractor is legally obligated to complete the construction before December.',
    exampleVi: 'Nhà thầu có nghĩa vụ pháp lý phải hoàn thành công trình trước tháng Mười Hai.'
  },
  {
    word: 'Provision',
    ipa: '/prəˈvɪʒ.ən/',
    partOfSpeech: 'noun',
    meaningVi: 'Điều khoản trong hợp đồng / Sự dự phòng',
    topic: 'Contracts & Agreements',
    collocation: 'Contractual provision',
    exampleEn: 'Under the provisions of the agreement, either party may terminate with 30 days notice.',
    exampleVi: 'Theo các điều khoản của thỏa thuận, một trong hai bên có thể chấm dứt với thông báo trước 30 ngày.'
  },
  {
    word: 'Binding',
    ipa: '/ˈbaɪn.dɪŋ/',
    partOfSpeech: 'adj',
    meaningVi: 'Có tính ràng buộc pháp lý',
    topic: 'Contracts & Agreements',
    collocation: 'Legally binding contract',
    exampleEn: 'Once both executives sign the document, it becomes a legally binding contract.',
    exampleVi: 'Khi cả hai lãnh đạo ký tài liệu, nó trở thành hợp đồng ràng buộc pháp lý.'
  },

  // 2. Marketing & Sales
  {
    word: 'Attract',
    ipa: '/əˈtrækt/',
    partOfSpeech: 'verb',
    meaningVi: 'Thu hút khách hàng / Lôi cuốn',
    topic: 'Marketing & Sales',
    collocation: 'Attract new prospective clients',
    exampleEn: 'The digital marketing campaign helped attract thousands of new prospective buyers.',
    exampleVi: 'Chiến dịch tiếp thị số đã giúp thu hút hàng ngàn khách mua tiềm năng mới.'
  },
  {
    word: 'Consume',
    ipa: '/kənˈsjuːm/',
    partOfSpeech: 'verb',
    meaningVi: 'Tiêu thụ, sử dụng sản phẩm dịch vụ',
    topic: 'Marketing & Sales',
    collocation: 'Consumer demand',
    exampleEn: 'Modern businesses consume massive amounts of cloud computing resources.',
    exampleVi: 'Các doanh nghiệp hiện đại tiêu thụ lượng lớn tài nguyên điện toán đám mây.'
  },
  {
    word: 'Persuade',
    ipa: '/pəˈsweɪd/',
    partOfSpeech: 'verb',
    meaningVi: 'Thuyết phục khách hàng hoặc đối tác',
    topic: 'Marketing & Sales',
    collocation: 'Persuade a client',
    exampleEn: 'Our sales representative managed to persuade the client to upgrade their subscription.',
    exampleVi: 'Đại diện bán hàng của chúng tôi đã thuyết phục được khách hàng nâng cấp gói dịch vụ.'
  },

  // 3. Warranties & Quality Control
  {
    word: 'Characteristic',
    ipa: '/ˌkær.ək.təˈrɪs.tɪk/',
    partOfSpeech: 'noun / adj',
    meaningVi: 'Đặc tính, nét đặc trưng tiêu biểu',
    topic: 'Warranties & Quality',
    collocation: 'Key characteristic',
    exampleEn: 'Durability is the defining characteristic of this industrial equipment.',
    exampleVi: 'Độ bền là đặc tính then chốt định hình thiết bị công nghiệp này.'
  },
  {
    word: 'Consequence',
    ipa: '/ˈkɒn.sɪ.kwəns/',
    partOfSpeech: 'noun',
    meaningVi: 'Hậu quả, kết quả tất yếu',
    topic: 'Warranties & Quality',
    collocation: 'Dire consequences',
    exampleEn: 'Failing to inspect the machinery could lead to severe financial consequences.',
    exampleVi: 'Không kiểm tra máy móc có thể dẫn đến những hậu quả tài chính nghiêm trọng.'
  },
  {
    word: 'Expire',
    ipa: '/ɪkˈspaɪər/',
    partOfSpeech: 'verb',
    meaningVi: 'Hết hạn hiệu lực (hợp đồng, bảo hành, thẻ)',
    topic: 'Warranties & Quality',
    collocation: 'Warranty expires',
    exampleEn: 'Your free technical support service will expire at the end of this month.',
    exampleVi: 'Dịch vụ hỗ trợ kỹ thuật miễn phí của bạn sẽ hết hạn vào cuối tháng này.'
  },

  // 4. Business Planning & Operations
  {
    word: 'Strategy',
    ipa: '/ˈstræt.ə.dʒi/',
    partOfSpeech: 'noun',
    meaningVi: 'Chiến lược kinh doanh',
    topic: 'Business Planning',
    collocation: 'Corporate strategy',
    exampleEn: 'The CEO outlined a comprehensive strategy for entering emerging Asian markets.',
    exampleVi: 'Tổng Giám đốc đã phác thảo chiến lược toàn diện để thâm nhập các thị trường mới nổi châu Á.'
  },
  {
    word: 'Demonstrate',
    ipa: '/ˈdem.ən.streɪt/',
    partOfSpeech: 'verb',
    meaningVi: 'Chứng minh, thị phạm cho thấy năng lực',
    topic: 'Business Planning',
    collocation: 'Demonstrate profitability',
    exampleEn: 'The pilot test demonstrated significant improvements in operational efficiency.',
    exampleVi: 'Thử nghiệm thử điểm đã chứng minh sự cải thiện rõ rệt trong hiệu quả vận hành.'
  },

  // 5. Conferences & Meetings
  {
    word: 'Accommodate',
    ipa: '/əˈkɒm.ə.deɪt/',
    partOfSpeech: 'verb',
    meaningVi: 'Chứa đủ số người / Đáp ứng nhu cầu',
    topic: 'Conferences & Meetings',
    collocation: 'Accommodate 500 attendees',
    exampleEn: 'The main auditorium can comfortably accommodate up to 500 conference attendees.',
    exampleVi: 'Khán phòng chính có thể chứa thoải mái tới 500 người tham dự hội nghị.'
  },
  {
    word: 'Arrange',
    ipa: '/əˈreɪndʒ/',
    partOfSpeech: 'verb',
    meaningVi: 'Sắp xếp, bố trí cuộc họp hoặc lịch trình',
    topic: 'Conferences & Meetings',
    collocation: 'Arrange a meeting',
    exampleEn: 'Please arrange a teleconference with our branch managers by tomorrow morning.',
    exampleVi: 'Làm ơn sắp xếp một cuộc họp trực tuyến với các giám đốc chi nhánh trước sáng mai.'
  },

  // 6. Finance & Accounting
  {
    word: 'Allocate',
    ipa: '/ˈæl.ə.keɪt/',
    partOfSpeech: 'verb',
    meaningVi: 'Phân bổ ngân sách, nguồn lực',
    topic: 'Finance & Accounting',
    collocation: 'Allocate budget funds',
    exampleEn: 'The board decided to allocate twenty percent of profits to research and development.',
    exampleVi: 'Hội đồng đã quyết định phân bổ hai mươi phần trăm lợi nhuận cho nghiên cứu và phát triển.'
  },
  {
    word: 'Audit',
    ipa: '/ˈɔː.dɪt/',
    partOfSpeech: 'noun / verb',
    meaningVi: 'Kiểm toán sổ sách tài chính',
    topic: 'Finance & Accounting',
    collocation: 'Conduct an internal audit',
    exampleEn: 'An independent accounting firm will conduct the annual financial audit next week.',
    exampleVi: 'Một công ty kế toán độc lập sẽ tiến hành đợt kiểm toán tài chính hàng năm vào tuần tới.'
  },
  {
    word: 'Expenditure',
    ipa: '/ɪkˈspen.dɪ.tʃər/',
    partOfSpeech: 'noun',
    meaningVi: 'Chi phí chi tiêu, khoản chi ngân sách',
    topic: 'Finance & Accounting',
    collocation: 'Capital expenditure',
    exampleEn: 'We need to reduce operational expenditures to maintain our quarterly profit margin.',
    exampleVi: 'Chúng ta cần cắt giảm chi phí vận hành để duy trì biên lợi nhuận hàng quý.'
  }
];

export const TOEIC_BANDS = [
  {
    band: '500 - 650',
    title: 'Giao Tiếp & Công Sở Cơ Bản',
    color: '#0ea5e9',
    description: 'Nắm chắc ngữ pháp nền tảng Part 5 (từ loại, giới từ, thì) và nghe hiểu câu hỏi Part 2 thường gặp.',
    tips: 'Tập trung chắc chắn câu hỏi từ loại (Word form) và loại bỏ bẫy Yes/No trong câu hỏi Wh-.'
  },
  {
    band: '650 - 800',
    title: 'Chuyên Viên & Quản Lý',
    color: '#6366f1',
    description: 'Xử lý thành thạo cụm liên từ phức, câu điều kiện, bị động và từ vựng hợp đồng/kinh doanh chuyên sâu.',
    tips: 'Ghi nhớ các cặp liên từ tương quan, collocations công sở và mẹo nghe tránh bẫy đồng âm.'
  },
  {
    band: '800 - 990',
    title: 'Thành Thạo Quốc Tế (Master)',
    color: '#10b981',
    description: 'Chinh phục câu hỏi phân từ rút gọn, đảo ngữ, cấu trúc giả định và ngữ cảnh đàm phán cấp cao.',
    tips: 'Luyện tốc độ đọc quét nhanh (<30s/câu Part 5) và phản xạ nghe hiểu ẩn ý trong giao tiếp thương mại.'
  }
];
