/**
 * TOEIC Comprehensive Multi-Test 4-Skills Dataset
 * Features authentic ETS exam formats, real photographs, audio transcripts,
 * in-depth explanations, trap warnings, and 600 essential workplace words.
 */

export const TOEIC_TEST_SETS = [
  {
    id: 'test-1',
    name: 'Bộ Đề ETS 01: Đề Thi TOEIC Quốc Tế 01',
    subtitle: '100% Format ETS Chuẩn Quốc Tế • Luyện tập toàn diện 7 phần thi',
    difficulty: 'Tiêu chuẩn (Target 650 - 850)',
    part1Photos: [
      {
        id: 't1-p1-1',
        sceneType: 'Airport Check-in Line / Xếp hàng làm thủ tục sân bay',
        imageUrl: '/exams/fallbacks/part1-airport.jpg',
        fallbackUrl: '/exams/fallbacks/part1-airport.jpg',
        audioPrompt: 'Look at the photograph and listen to the four statements. Select the one that best describes what you see.',
        statements: [
          { key: 'A', text: 'Some people are waiting in line.', textVi: 'Một số người đang xếp hàng chờ đợi.' },
          { key: 'B', text: 'Some people are sitting on chairs.', textVi: 'Một số người đang ngồi trên ghế.' },
          { key: 'C', text: 'Some people are pulling their suitcases.', textVi: 'Một số người đang kéo vali của họ.' },
          { key: 'D', text: 'Some people are standing outside.', textVi: 'Một số người đang đứng ở bên ngoài.' }
        ],
        correctKey: 'A',
        explanation: 'Phương án (A) "Some people are waiting in line" (Một số người đang xếp hàng chờ) miêu tả hoàn toàn chính xác 100% hành động thực tế của nhóm người trong ảnh tại quầy thủ tục sân bay. Các phương án còn lại: (B) sai vì họ đang đứng thành hàng chứ không ngồi ghế; (C) sai vì các vali đang dựng đứng cạnh người chứ không ai đang kéo di chuyển; (D) sai vì khung cảnh diễn ra bên trong nhà ga sân bay (indoor) chứ không phải ngoài trời.',
        trapAlert: 'Bẫy hành động: Chú ý tư thế và trạng thái của người và vật. Dù có vali (suitcases) hay ghế chờ (chairs) xuất hiện ở xa, người trong hình không hề thực hiện các hành động ngồi hay kéo vali.',
        keyVocab: [
          { word: 'Wait in line', meaningVi: 'Đứng xếp hàng chờ đợi' },
          { word: 'Suitcase / Luggage', meaningVi: 'Chiếc vali / Hành lý' },
          { word: 'Check-in counter', meaningVi: 'Quầy thủ tục sân bay' }
        ]
      },
      {
        id: 't1-p1-2',
        sceneType: 'Warehouse & Logistics / Kho bãi & Vận chuyển',
        imageUrl: '/exams/fallbacks/part1-warehouse.jpg',
        fallbackUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80',
        audioPrompt: 'Look at the photograph and listen to the four statements. Select the one that best describes what you see.',
        statements: [
          { key: 'A', text: 'Some boxes have been stacked on wooden pallets.', textVi: 'Một số hộp carton đã được xếp chồng lên các pallet gỗ.' },
          { key: 'B', text: 'A worker is operating a heavy forklift truck.', textVi: 'Một công nhân đang vận hành xe nâng hàng nặng.' },
          { key: 'C', text: 'The storage shelves are being dismantled.', textVi: 'Các kệ chứa đồ đang bị tháo dỡ.' },
          { key: 'D', text: 'All the packages are being loaded into a delivery van.', textVi: 'Tất cả các kiện hàng đang được bốc lên xe tải giao hàng.' }
        ],
        correctKey: 'A',
        explanation: 'Phương án A miêu tả đúng trạng thái tĩnh của đồ vật: các thùng hàng được xếp chồng ("stacked on wooden pallets"). B sai vì không có xe nâng trong hình, C và D dùng thì hiện tại tiếp diễn bị động (being + V3) miêu tả hành động đang diễn ra mà thực tế trong hình không có người làm.',
        trapAlert: 'Bẫy thì tiếp diễn bị động "being + V3": Nếu không có người đang trực tiếp tháo dỡ/bốc xếp tại khoảnh khắc chụp, câu có "being" luôn là đáp án sai.',
        keyVocab: [
          { word: 'Stack', meaningVi: 'Xếp chồng lên nhau' },
          { word: 'Pallet', meaningVi: 'Tấm kệ gỗ kê hàng' },
          { word: 'Cardboard box', meaningVi: 'Thùng bìa carton' }
        ]
      }
    ],
    part2Listening: [
      {
        id: 't1-p2-1',
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
          '(C) Tại trung tâm hội nghị trung tâm thành phố. (Bẫy địa điểm Where)'
        ],
        trapAlert: 'Câu hỏi bắt đầu bằng "When" KHÔNG BAO GIỜ trả lời bằng "Yes" hoặc "No".',
        keyVocab: [
          { word: 'Quarterly report', meaningVi: 'Báo cáo hàng quý' },
          { word: 'At the latest', meaningVi: 'Muộn nhất là vào...' }
        ]
      },
      {
        id: 't1-p2-2',
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
        id: 't1-p2-3',
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
      }
    ],
    part3Conversations: [
      {
        id: 't1-p3-1',
        scenario: 'Văn phòng / Đổi lịch trình công tác (Business Travel Rescheduling)',
        speakers: 'Man & Woman (Colleagues)',
        audioScript: `[Man]: Hi Sandra, did you hear that our flight to Chicago for the tech expo tomorrow morning has been delayed due to severe weather?
[Woman]: Really? That's terrible news. Our keynote presentation is scheduled for 2:00 PM tomorrow afternoon. If we arrive late, we might miss the opening session.
[Man]: I know. I just called the airline, and they can rebook us on an early flight through Detroit that leaves tonight at 8:00 PM. That way, we will already be in Chicago by tomorrow morning.
[Woman]: That sounds like our best option. Please go ahead and confirm those tickets. Meanwhile, I will contact the hotel to let them know we'll be checking in a day earlier than expected.`,
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
          { word: 'Rebook', meaningVi: 'Đổi lại vé / đặt lại lịch' }
        ]
      }
    ],
    part4Talks: [
      {
        id: 't1-p4-1',
        scenario: 'Thông báo phát thanh nội bộ tại siêu thị điện máy (Store Announcement)',
        audioScript: `Attention all shoppers at Grandview Electronics. We would like to remind you that our annual inventory clearance sale will conclude this evening at 9:00 PM. Currently, all home theater soundbars, smart televisions, and noise-canceling headphones in the audio department on the second floor are discounted by an additional twenty percent off the marked clearance price. In addition, members of our VIP Rewards Club will earn double reward points on all purchases made before closing time. If you need assistance finding a specific model or wish to schedule home delivery for bulky items, please visit the customer care counter near the central escalators. Thank you for shopping with us today.`,
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
          { word: 'Bulky items', meaningVi: 'Hàng hóa cồng kềnh' }
        ]
      }
    ],
    part5Questions: [
      {
        id: 't1-p5-1',
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
        id: 't1-p5-2',
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
        id: 't1-p5-3',
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
          { word: 'Privacy policy', pos: 'noun', meaningVi: 'Chính sách bảo mật quyền riêng tư' }
        ]
      },
      {
        id: 't1-p5-4',
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
      }
    ],
    part6Passages: [
      {
        id: 't1-p6-1',
        title: 'Thông Báo Nội Bộ: Chuyển Đổi Nộp Chi Phí Công Tác Điện Tử',
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
            options: ['(A) will not accept', '(B) will not be accepted', '(C) are not accepting', '(D) have not accepted'],
            correctIndex: 1,
            explanation: 'Chủ ngữ là "Paper submission forms" (vật) nên động từ phải ở thể BỊ ĐỘNG tương lai: "will not be accepted".'
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
            options: ['(A) rather', '(B) more', '(C) instead', '(D) other'],
            correctIndex: 0,
            explanation: 'Cụm cố định: "rather than" (thay vì làm gì).'
          },
          {
            blankIndex: 4,
            options: ['(A) streamline', '(B) streamlined', '(C) streamlining', '(D) streamliner'],
            correctIndex: 1,
            explanation: 'Cần một tính từ đứng trước cụm danh từ "administrative workflow". "Streamlined" (được tinh giản, tối ưu hóa) là tính từ phân từ chính xác.'
          }
        ]
      }
    ],
    part7Passages: [
      {
        id: 't1-p7-1',
        passageType: 'Email Trao Đổi Nghiệp Vụ (Workplace Email)',
        documentContent: `To: All Department Managers
From: Rachel Vance, Facilities Director
Date: October 12
Subject: Annual Office Building Maintenance & Server Outages

Dear Managers,

Please be advised that the annual comprehensive maintenance of the Apex Corporate Tower will take place from Monday, November 6 through Wednesday, November 8. During this three-day period, certified engineering teams will inspect electrical wiring, service central HVAC units, and upgrade the fiber-optic network infrastructure.

Because of the extensive nature of these updates, electricity and high-speed internet services will be temporarily interrupted on specific floors:
• Monday, Nov 6: Floors 1 through 3 will experience complete outages.
• Tuesday, Nov 7: Floors 4 through 6 (including Marketing & Accounting) will be affected.
• Wednesday, Nov 8: Work will conclude on executive floors 7 through 9.

We strongly advise all personnel working on scheduled floors to back up all digital assets to the cloud and completely power down desktop terminals before leaving the office on Friday, November 3. Furthermore, remote work from home has been officially approved by executive management for staff on affected floors on their scheduled maintenance days.

Sincerely,
Rachel Vance, Facilities Director`,
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
            explanation: 'Tiêu đề email và đoạn 1 nêu rõ mục đích: thông báo cho các quản lý về đợt bảo trì tòa nhà thường niên và việc gián đoạn dịch vụ.'
          },
          {
            question: '2. On which date will the Accounting department (located on Floor 5) be affected by outages?',
            options: ['(A) Friday, November 3', '(B) Monday, November 6', '(C) Tuesday, November 7', '(D) Wednesday, November 8'],
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
        ]
      }
    ]
  },

  {
    id: 'test-2',
    name: 'Bộ Đề ETS 02: Vận Hành, Kỹ Thuật & Chuỗi Cung Ứng',
    subtitle: 'Tập trung chủ đề Logistics, Sản Xuất, Giám Sát Công Trường & Hàng Không',
    difficulty: 'Nâng cao (Target 750 - 900+)',
    part1Photos: [
      {
        id: 't2-p1-1',
        sceneType: 'Construction & Civil Engineering / Công trường & Bản vẽ',
        imageUrl: '/exams/fallbacks/part1-construction.jpg',
        fallbackUrl: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=800&q=80',
        audioPrompt: 'Look at the photograph and listen to the four statements. Select the one that best describes what you see.',
        statements: [
          { key: 'A', text: 'An architect is examining construction blueprints on a table.', textVi: 'Một kiến trúc sư đang xem xét các bản vẽ thi công trên bàn.' },
          { key: 'B', text: 'Workers are painting the exterior wall of a building.', textVi: 'Các công nhân đang sơn bức tường bên ngoài của tòa nhà.' },
          { key: 'C', text: 'All construction equipment has been packed away.', textVi: 'Tất cả thiết bị thi công đã được thu dọn cất đi.' },
          { key: 'D', text: 'A crane is lifting a heavy steel beam into the air.', textVi: 'Một chiếc cần cẩu đang nhấc thanh dầm thép nặng lên không trung.' }
        ],
        correctKey: 'A',
        explanation: 'Phương án A miêu tả chính xác hành động: người đang xem xét các bản vẽ thiết kế xây dựng trên bàn ("examining construction blueprints on a table").',
        trapAlert: 'Bẫy các từ vựng công trường thường gặp (crane, painting, packed away) nhưng không diễn ra trong tranh.',
        keyVocab: [
          { word: 'Blueprint', meaningVi: 'Bản vẽ thiết kế kỹ thuật' },
          { word: 'Examine', meaningVi: 'Xem xét cẩn thận' }
        ]
      },
      {
        id: 't2-p1-2',
        sceneType: 'Airport Terminal & Transit / Ga hàng không & Di chuyển',
        imageUrl: '/exams/fallbacks/part1-airport.jpg',
        fallbackUrl: 'https://images.unsplash.com/photo-1530521954074-e64f6810b32d?auto=format&fit=crop&w=800&q=80',
        audioPrompt: 'Look at the photograph and listen to the four statements. Select the one that best describes what you see.',
        statements: [
          { key: 'A', text: 'Passengers are boarding an airplane via stairs.', textVi: 'Hành khách đang bước lên máy bay bằng cầu thang bộ.' },
          { key: 'B', text: 'A traveler is standing in an airport terminal with luggage.', textVi: 'Một du khách đang đứng trong nhà ga sân bay cùng với hành lý.' },
          { key: 'C', text: 'Flight attendants are serving beverages in the cabin.', textVi: 'Các tiếp viên hàng không đang phục vụ đồ uống trong khoang máy bay.' },
          { key: 'D', text: 'Suitcases are being unloaded from a cargo aircraft.', textVi: 'Các va li đang được dỡ xuống từ một máy bay chở hàng.' }
        ],
        correctKey: 'B',
        explanation: 'Phương án B miêu tả đúng người du khách đang ở trong sảnh nhà ga cùng vali hành lý ("standing in an airport terminal with luggage").',
        trapAlert: 'Bẫy bối cảnh sân bay: nhầm lẫn giữa nhà ga sân bay (terminal) và khoang máy bay (cabin).',
        keyVocab: [
          { word: 'Luggage / Baggage', meaningVi: 'Hành lý mang theo' },
          { word: 'Terminal', meaningVi: 'Nhà ga sân bay' }
        ]
      }
    ],
    part2Listening: [
      {
        id: 't2-p2-1',
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
        id: 't2-p2-2',
        category: 'Câu hỏi Gián tiếp & Phản hồi thực tế (Indirect)',
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
        trapAlert: 'Xu hướng đề ETS mới: Đáp án gián tiếp ("I haven\'t checked", "Ask Mr. John") thường là đáp án đúng.',
        keyVocab: [
          { word: 'Project timeline', meaningVi: 'Tiến độ / mốc thời gian dự án' }
        ]
      },
      {
        id: 't2-p2-3',
        category: 'Câu hỏi đuôi / Xác nhận (Tag Question)',
        questionText: "The shipment of industrial valves arrived this morning, didn't it?",
        options: [
          '(A) Yes, but two of the crates were slightly damaged.',
          '(B) Shipping and handling are included in the price.',
          '(C) It takes about forty-five minutes by express train.'
        ],
        correctIndex: 0,
        questionVi: 'Lô hàng van công nghiệp đã đến vào sáng nay rồi phải không?',
        optionsVi: [
          '(A) Đúng rồi, nhưng hai trong số các thùng hàng đã bị hư hại nhẹ. (Đáp án chính xác xác nhận thông tin)',
          '(B) Chi phí vận chuyển và đóng gói đã bao gồm trong giá. (Bẫy lặp từ shipping)',
          '(C) Mất khoảng 45 phút đi tàu tốc hành. (Bẫy trả lời cho câu hỏi How long)'
        ],
        trapAlert: 'Câu hỏi xác nhận bằng Tag Question: Chú ý nghe vế chính xem sự việc đã xảy ra hay chưa và kiểm tra tình trạng thực tế.',
        keyVocab: [
          { word: 'Shipment', meaningVi: 'Lô hàng giao' },
          { word: 'Crate', meaningVi: 'Thùng kiện gỗ đóng hàng' }
        ]
      }
    ],
    part3Conversations: [
      {
        id: 't2-p3-1',
        scenario: 'Nhà máy sản xuất / Báo cáo sự cố máy móc & Đặt phụ tùng thay thế',
        speakers: 'Marcus (Plant Supervisor) & Elena (Maintenance Engineer)',
        audioScript: `[Man]: Elena, has the technical team diagnosed why assembly line three shut down unexpectedly this morning?
[Woman]: Yes, Marcus. A hydraulic valve cracked due to excessive pressure. The good news is that our primary backup supplier in Frankfurt has the exact replacement unit in stock.
[Man]: That's a huge relief. How quickly can they ship it to our manufacturing facility? Every hour the line remains idle costs our plant thousands of dollars in delayed customer orders.
[Woman]: If we authorize expedited air freight before noon today, the package will arrive at our warehouse tomorrow morning by 9:00 AM, and our crew can install it within two hours.`,
        questions: [
          {
            question: '1. What problem are the speakers discussing?',
            options: [
              '(A) A power failure across the entire industrial park',
              '(B) An unexpected equipment shutdown on an assembly line',
              '(C) A dispute regarding employee overtime pay',
              '(D) A delayed payment from a major customer'
            ],
            correctIndex: 1,
            explanation: 'Người nam mở đầu: "has the technical team diagnosed why assembly line three shut down unexpectedly this morning?".'
          },
          {
            question: '2. Where is the replacement part currently located?',
            options: [
              '(A) In the on-site spare parts storage room',
              '(B) At a supplier facility in Frankfurt',
              '(C) On a cargo ship approaching the harbor',
              '(D) At a local repair workshop downtown'
            ],
            correctIndex: 1,
            explanation: 'Người nữ trả lời: "our primary backup supplier in Frankfurt has the exact replacement unit in stock".'
          },
          {
            question: '3. What does the woman recommend doing before noon?',
            options: [
              '(A) Inspecting the hydraulic pressure meters',
              '(B) Submitting an insurance claim for damaged goods',
              '(C) Authorizing expedited air freight shipping',
              '(D) Canceling the pending customer orders'
            ],
            correctIndex: 2,
            explanation: 'Người nữ nói ở câu kết: "If we authorize expedited air freight before noon today, the package will arrive at our warehouse tomorrow".'
          }
        ],
        keyVocab: [
          { word: 'Assembly line', meaningVi: 'Dây chuyền lắp ráp' },
          { word: 'Expedited air freight', meaningVi: 'Vận tải hàng không hỏa tốc' },
          { word: 'In stock', meaningVi: 'Có sẵn trong kho' }
        ]
      }
    ],
    part4Talks: [
      {
        id: 't2-p4-1',
        scenario: 'Buổi phổ biến quy định an toàn & Vận hành robot tại xưởng chế tạo (Safety Briefing)',
        audioScript: `Good morning, manufacturing team. Before we commence today's shift on the main fabrication floor, I have a mandatory safety update regarding the newly installed robotic welding cells in Zone B. All technicians operating within the yellow boundary lines must wear certified safety goggles, heat-resistant gloves, and steel-toed boots at all times. In addition, please take note that the emergency stop switches have been relocated to the support columns directly behind each workstation for faster reach. If any sensor indicator light turns flashing red, do not attempt to clear the jam yourself. Shut down power immediately and notify your shift supervisor. Let's make workplace safety our top priority.`,
        questions: [
          {
            question: '1. Who is the intended audience for this briefing?',
            options: [
              '(A) Sales representatives visiting from regional branches',
              '(B) Manufacturing technicians working on a fabrication floor',
              '(C) Office administrative assistants',
              '(D) External logistics truck drivers'
            ],
            correctIndex: 1,
            explanation: 'Người nói chào: "Good morning, manufacturing team. Before we commence today\'s shift on the main fabrication floor...".'
          },
          {
            question: '2. What equipment has recently been installed in Zone B?',
            options: [
              '(A) Robotic welding cells',
              '(B) Digital inventory scanners',
              '(C) Air conditioning units',
              '(D) Automated packaging conveyor belts'
            ],
            correctIndex: 0,
            explanation: 'Người nói đề cập: "...mandatory safety update regarding the newly installed robotic welding cells in Zone B".'
          },
          {
            question: '3. What are workers instructed to do if a sensor light flashes red?',
            options: [
              '(A) Replace the hydraulic fluid immediately',
              '(B) Shut down power and notify their shift supervisor',
              '(C) Continue operating at a reduced speed',
              '(D) Call the emergency fire department'
            ],
            correctIndex: 1,
            explanation: 'Người nói chỉ dẫn: "Shut down power immediately and notify your shift supervisor".'
          }
        ],
        keyVocab: [
          { word: 'Mandatory', meaningVi: 'Bắt buộc tuân thủ' },
          { word: 'Relocate', meaningVi: 'Chuyển dời vị trí' },
          { word: 'Emergency shut-off', meaningVi: 'Ngắt nguồn khẩn cấp' }
        ]
      }
    ],
    part5Questions: [
      {
        id: 't2-p5-1',
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
      },
      {
        id: 't2-p5-2',
        category: 'Từ vựng công sở (Business Vocab)',
        difficulty: '650+',
        question: 'The warranty coverage will be considered _______ if the product is opened by an unauthorized technician.',
        options: ['void', 'vague', 'vacant', 'valuable'],
        correctIndex: 0,
        translation: 'Phạm vi bảo hành sẽ bị coi là vô hiệu nếu sản phẩm bị mở ra bởi kỹ thuật viên không được ủy quyền.',
        explanation: 'Trong hợp đồng và bảo hành, "void" (vô hiệu, không còn giá trị pháp lý) là thuật ngữ chuẩn.',
        trapAlert: 'Thuật ngữ pháp lý kinh điển: "null and void" (vô hiệu lực).',
        keyVocabulary: [
          { word: 'Warranty', pos: 'noun', meaningVi: 'Phiếu bảo hành, cam kết bảo hành' },
          { word: 'Void', pos: 'adj', meaningVi: 'Vô hiệu, hết hiệu lực' }
        ]
      },
      {
        id: 't2-p5-3',
        category: 'Liên từ nhượng bộ (Conjunctions)',
        difficulty: '700+',
        question: '_______ the delivery of raw materials was delayed by severe weather, the assembly plant managed to complete the order on time.',
        options: ['Although', 'Despite', 'Because', 'In spite'],
        correctIndex: 0,
        translation: 'Mặc dù việc giao nguyên vật liệu bị trì hoãn do thời tiết khắc nghiệt, nhà máy lắp ráp vẫn kịp hoàn thành đơn hàng đúng hạn.',
        explanation: 'Phía sau là một mệnh đề hoàn chỉnh (S + V: "the delivery of raw materials was delayed..."), do đó phải dùng liên từ "Although". "Despite" và "In spite of" chỉ đi với danh từ/V-ing.',
        trapAlert: 'Phân biệt "Although + Clause" vs "Despite / In spite of + Noun phrase".',
        keyVocabulary: [
          { word: 'Raw materials', pos: 'noun', meaningVi: 'Nguyên vật liệu thô' },
          { word: 'On time', pos: 'adv', meaningVi: 'Đúng giờ, đúng hẹn' }
        ]
      },
      {
        id: 't2-p5-4',
        category: 'Cụm giới từ cố định (Prepositional Collocations)',
        difficulty: '750+',
        question: 'All industrial chemical containers must be clearly labeled strictly in _______ with workplace safety regulations.',
        options: ['accordance', 'accord', 'according', 'accorded'],
        correctIndex: 0,
        translation: 'Tất cả các thùng chứa hóa chất công nghiệp phải được dán nhãn rõ ràng tuân thủ nghiêm ngặt theo các quy định an toàn lao động.',
        explanation: 'Cụm thành ngữ cố định trong tiếng Anh thương mại: "in accordance with" (phù hợp với, tuân thủ theo quy định/luật lệ).',
        trapAlert: 'Cụm từ pháp lý / quy chuẩn: "in accordance with" xuất hiện với tần suất cực cao trong Part 5.',
        keyVocabulary: [
          { word: 'In accordance with', pos: 'idiom', meaningVi: 'Tuân thủ theo, chiếu theo' },
          { word: 'Hazardous chemicals', pos: 'noun', meaningVi: 'Hóa chất nguy hại' }
        ]
      }
    ],
    part6Passages: [
      {
        id: 't2-p6-1',
        title: 'Thông Báo Bảo Trì & Triển Khai Hệ Thống Kiểm Kê Kỹ Thuật Số',
        passageText: `INTERNAL LOGISTICS DIRECTIVE
To: Distribution Center Personnel
From: Wayne Roberts, Operations Manager
Date: November 4
Subject: Warehouse Management System Upgrade

Next week, our primary regional warehouse will undergo a comprehensive transition to the new barcode scanning platform. This digital architecture (1) [___] to minimize picking errors and expedite order fulfillment cycles.

During the initial three-day rollout beginning on Wednesday, temporary delays may occur while workers adjust to the handheld terminals. (2) [___]. Extra technical specialists will remain on-site throughout the transition to assist team members with scanner calibration and inventory synchronization.

Please ensure that all pending outbound shipments scheduled for Tuesday afternoon are finalized (3) [___] the system shutdown at 5:00 PM. We appreciate your diligent commitment to maintaining our distribution center's high standards of operational (4) [___].`,
        blanks: [
          {
            blankIndex: 1,
            options: ['(A) is designing', '(B) was designed', '(C) will design', '(D) has designed'],
            correctIndex: 1,
            explanation: 'Chủ ngữ là "This digital architecture" (hệ thống kiến trúc số này), do đó động từ phải ở thể BỊ ĐỘNG: "was designed" (được thiết kế để).'
          },
          {
            blankIndex: 2,
            options: [
              '(A) We therefore request your patience and careful attention to detail.',
              '(B) Paper packing slips will permanently replace all electronic orders.',
              '(C) All regional distribution centers will be permanently closed.',
              '(D) Forklift operators must take an unscheduled holiday break.'
            ],
            correctIndex: 0,
            explanation: 'Câu đứng trước nói về việc có thể phát sinh chậm trễ tạm thời khi làm quen thiết bị mới, do đó câu (A) "Chúng tôi mong nhận được sự kiên nhẫn và chú ý cẩn thận của các bạn" là lời đề nghị liên kết logic nhất.'
          },
          {
            blankIndex: 3,
            options: ['(A) prior to', '(B) ahead', '(C) previous', '(D) forward'],
            correctIndex: 0,
            explanation: 'Cụm giới từ mang nghĩa "trước khi diễn ra mốc thời gian nào đó": "prior to" (+ noun/time).'
          },
          {
            blankIndex: 4,
            options: ['(A) excellence', '(B) excel', '(C) excellent', '(D) excellently'],
            correctIndex: 0,
            explanation: 'Đứng sau tính từ "operational" cần một DANH TỪ (Noun): "excellence" (sự xuất sắc trong vận hành).'
          }
        ]
      }
    ],
    part7Passages: [
      {
        id: 't2-p7-1',
        passageType: 'Chứng Từ Vận Chuyển & Trạng Thái Giao Hàng (Freight Bill & Tracking Manifest)',
        documentContent: `GLOBAL AIR CARGO EXPRESS — WAYBILL #GAC-889201
Shipper: Precision Micro-Parts Ltd. (Tokyo, Japan)
Consignee: Apex Automation Systems (San Francisco, CA)
Service Level: Priority International Air Freight
Date Shipped: November 10 | Estimated Delivery: November 12, 10:30 AM

TRACKING HISTORY & CHECKPOINTS:
• Nov 10, 08:15 AM — Tokyo Hub: Consignment received and cleared customs export scan.
• Nov 10, 06:40 PM — Narita Int'l Airport: Departed on Flight GA-402 to Anchorage.
• Nov 11, 04:20 AM — Anchorage Hub: Cargo processed through international transit sort.
• Nov 11, 09:15 PM — San Francisco Sorting Center: Cleared US Customs & Border Protection inspection.
• Nov 12, 07:00 AM — San Francisco Distribution Facility: Loaded onto delivery truck #14.

DELIVERY INSTRUCTIONS:
Package contains fragile optical sensors. Handle with extreme care. Consignee signature and photo verification are required upon handover at the main reception dock.`,
        questions: [
          {
            question: '1. Where did the shipment originate?',
            options: [
              '(A) San Francisco, California',
              '(B) Tokyo, Japan',
              '(C) Anchorage, Alaska',
              '(D) Frankfurt, Germany'
            ],
            correctIndex: 1,
            explanation: 'Mục Shipper (Người gửi) ghi rõ: "Precision Micro-Parts Ltd. (Tokyo, Japan)".'
          },
          {
            question: '2. According to the tracking manifest, what happened on the morning of November 12?',
            options: [
              '(A) The cargo departed from Narita International Airport',
              '(B) The items were cleared by US Customs inspection',
              '(C) The package was loaded onto a delivery vehicle for final transport',
              '(D) A delivery exception was reported due to weather'
            ],
            correctIndex: 2,
            explanation: 'Mục ngày Nov 12, 07:00 AM ghi: "Loaded onto delivery truck #14".'
          },
          {
            question: '3. What special requirement is stated for the delivery handover?',
            options: [
              '(A) Payment must be made in cash upon arrival',
              '(B) The delivery must be left outside the warehouse gate',
              '(C) A recipient signature and photo verification are mandatory',
              '(D) The package must be opened immediately by the driver'
            ],
            correctIndex: 2,
            explanation: 'Mục hướng dẫn: "Consignee signature and photo verification are required upon handover at the main reception dock".'
          }
        ]
      }
    ]
  },

  {
    id: 'test-3',
    name: 'Bộ Đề ETS 03: Dịch Vụ Khách Hàng, Bán Lẻ & Tiếp Thị',
    subtitle: 'Chuyên đề Nhà Hàng, Khách Sạn, Thương Mại Điện Tử & Chăm Sóc Khách Hàng',
    difficulty: 'Thực tế (Target 600 - 800)',
    part1Photos: [
      {
        id: 't3-p1-1',
        sceneType: 'Restaurant & Dining Hospitality / Nhà hàng & Ẩm thực',
        imageUrl: '/exams/fallbacks/part1-restaurant.jpg',
        fallbackUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
        audioPrompt: 'Look at the photograph and listen to the four statements. Select the one that best describes what you see.',
        statements: [
          { key: 'A', text: 'Chairs and tables have been arranged in the dining area.', textVi: 'Bàn ghế đã được sắp xếp gọn gàng trong khu vực ăn uống.' },
          { key: 'B', text: 'Customers are queuing up outside the entrance.', textVi: 'Khách hàng đang xếp hàng bên ngoài lối vào.' },
          { key: 'C', text: 'A chef is cooking food in a kitchen.', textVi: 'Một đầu bếp đang nấu ăn trong nhà bếp.' },
          { key: 'D', text: 'Dishes are being washed in a commercial sink.', textVi: 'Bát đĩa đang được rửa trong bồn rửa công nghiệp.' }
        ],
        correctKey: 'A',
        explanation: 'Phương án A miêu tả đúng hiện trạng bàn ghế được xếp đặt ngăn nắp trong nhà hàng ("Chairs and tables have been arranged"). Các câu khác không có hình ảnh tương ứng.',
        trapAlert: 'Bẫy thì hiện tại hoàn thành bị động diễn tả trạng thái tĩnh của đồ vật.',
        keyVocab: [
          { word: 'Dining area', meaningVi: 'Khu vực ăn uống' },
          { word: 'Arrange', meaningVi: 'Sắp xếp, bố trí' }
        ]
      },
      {
        id: 't3-p1-2',
        sceneType: 'Supermarket & Retail / Bán lẻ & Mua sắm',
        imageUrl: '/exams/fallbacks/part1-supermarket.jpg',
        fallbackUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80',
        audioPrompt: 'Look at the photograph and listen to the four statements. Select the one that best describes what you see.',
        statements: [
          { key: 'A', text: 'Fresh groceries are displayed on shelves in the store.', textVi: 'Hàng hóa thực phẩm tươi sống được trưng bày trên các kệ trong cửa hàng.' },
          { key: 'B', text: 'A cashier is ringing up purchases at the cash register.', textVi: 'Thu ngân đang tính tiền các món hàng tại quầy thu ngân.' },
          { key: 'C', text: 'The grocery store is completely closed for renovations.', textVi: 'Cửa hàng tạp hóa đóng cửa hoàn toàn để sửa chữa.' },
          { key: 'D', text: 'Shopping carts are being loaded into an automobile.', textVi: 'Các xe đẩy hàng đang được xếp vào ô tô.' }
        ],
        correctKey: 'A',
        explanation: 'Phương án A miêu tả đúng các mặt hàng thực phẩm tươi sống được trưng bày trên kệ hàng ("displayed on shelves").',
        trapAlert: 'Tranh tĩnh đồ vật thường dùng cấu trúc bị động "are displayed / are organized".',
        keyVocab: [
          { word: 'Groceries', meaningVi: 'Hàng tạp hóa thực phẩm' },
          { word: 'Display', meaningVi: 'Trưng bày' }
        ]
      }
    ],
    part2Listening: [
      {
        id: 't3-p2-1',
        category: 'Hỏi vị trí sản phẩm (Customer Inquiry - Where)',
        questionText: 'Excuse me, could you tell me where the organic produce section is located?',
        options: [
          '(A) It’s down aisle four, right next to the bakery counter.',
          '(B) Yes, thirty-five dollars in cash, please.',
          '(C) Because the vegetables were harvested yesterday morning.'
        ],
        correctIndex: 0,
        questionVi: 'Xin lỗi, bạn có thể cho tôi biết khu thực phẩm hữu cơ nằm ở đâu không?',
        optionsVi: [
          '(A) Nó ở lối đi số 4, ngay cạnh quầy bánh mì. (Chỉ dẫn vị trí chính xác)',
          '(B) Vâng, tổng cộng là 35 đô la tiền mặt. (Bẫy giá tiền)',
          '(C) Bởi vì rau củ được thu hoạch sáng hôm qua. (Bẫy câu hỏi Why)'
        ],
        trapAlert: 'Câu hỏi vị trí trong bán lẻ / siêu thị: chú ý các từ khóa phương hướng (aisle, next to, adjacent, opposite, on the second floor).',
        keyVocab: [
          { word: 'Organic produce', meaningVi: 'Nông sản / thực phẩm hữu cơ' },
          { word: 'Aisle', meaningVi: 'Lối đi giữa các dãy kệ hàng' }
        ]
      },
      {
        id: 't3-p2-2',
        category: 'Lời đề nghị phục vụ (Offer of Service)',
        questionText: 'Would you like me to complimentary gift-wrap this watch for you?',
        options: [
          '(A) That would be wonderful, thank you very much!',
          '(B) It is currently a quarter past four in the afternoon.',
          '(C) No, I haven’t watched that documentary yet.'
        ],
        correctIndex: 0,
        questionVi: 'Bạn có muốn tôi gói quà miễn phí cho chiếc đồng hồ này không?',
        optionsVi: [
          '(A) Thế thì tuyệt quá, cảm ơn bạn rất nhiều! (Chấp nhận lời đề nghị lịch sự)',
          '(B) Hiện tại là 4 giờ 15 phút chiều. (Bẫy giờ giấc từ "watch")',
          '(C) Không, tôi chưa xem bộ phim tài liệu đó. (Bẫy đồng âm động từ "watch" = xem)'
        ],
        trapAlert: 'Bẫy đồng âm cực phổ biến trong Part 2: danh từ "watch" (đồng hồ đeo tay) bị bẫy với động từ "watch" (xem phim/xem TV) hoặc thời gian.',
        keyVocab: [
          { word: 'Gift-wrap', meaningVi: 'Gói quà' },
          { word: 'Complimentary', meaningVi: 'Miễn phí, tặng kèm' }
        ]
      },
      {
        id: 't3-p2-3',
        category: 'Chính sách hoàn tiền & Đổi trả (Customer Service Policy)',
        questionText: 'How do we process a return if the customer has misplaced their receipt?',
        options: [
          '(A) We can issue store credit with a valid photo ID.',
          '(B) The shipment arrived three days ahead of schedule.',
          '(C) Yes, the customer left a very positive online review.'
        ],
        correctIndex: 0,
        questionVi: 'Chúng ta xử lý việc đổi trả thế nào nếu khách hàng làm thất lạc hóa đơn mua hàng?',
        optionsVi: [
          '(A) Chúng ta có thể cấp phiếu mua hàng (store credit) nếu có giấy tờ tùy thân hợp lệ. (Giải pháp chính sách)',
          '(B) Lô hàng đã đến sớm hơn 3 ngày so với kế hoạch. (Lạc đề)',
          '(C) Vâng, khách hàng đã để lại đánh giá tích cực. (Bẫy Yes/No cho câu hỏi How)'
        ],
        trapAlert: 'Câu hỏi bắt đầu bằng "How" (như thế nào) không trả lời bằng "Yes" hay "No".',
        keyVocab: [
          { word: 'Store credit', meaningVi: 'Phiếu tín dụng mua hàng hoàn tiền tại cửa hàng' },
          { word: 'Misplace', meaningVi: 'Để quên / làm thất lạc tạm thời' }
        ]
      }
    ],
    part3Conversations: [
      {
        id: 't3-p3-1',
        scenario: 'Cửa hàng bán lẻ / Chuẩn bị sự kiện khuyến mãi mùa hè (Seasonal Apparel Promotion)',
        speakers: 'Victoria (Store Manager) & Patrick (Lead Merchandiser)',
        audioScript: `[Woman]: Patrick, how are the promotional arrangements coming along for our annual summer clearance event this weekend?
[Man]: We have set up the main display mannequins near the front sliding doors featuring our new line of casual linen shirts and beach accessories. However, the print shop hasn't delivered our large discount hanging banners yet.
[Woman]: Don't worry. I spoke with their accounts coordinator earlier, and they confirmed the delivery van will arrive here by 2:00 PM today.
[Man]: Excellent! As soon as the banners arrive, our sales floor team will suspend them above the main central aisles and place the tabletop promotional signs.`,
        questions: [
          {
            question: '1. What event are the speakers preparing for?',
            options: [
              '(A) A seasonal apparel clearance sale',
              '(B) An international trade conference',
              '(C) A company anniversary banquet',
              '(D) An employee recruitment fair'
            ],
            correctIndex: 0,
            explanation: 'Người nữ nói ngay câu đầu: "arrangements coming along for our annual summer clearance event this weekend".'
          },
          {
            question: '2. What item is currently missing?',
            options: [
              '(A) Price tags for the linen shirts',
              '(B) Large hanging discount banners',
              '(C) Cash registers for the checkout counters',
              '(D) Uniforms for seasonal sales associates'
            ],
            correctIndex: 1,
            explanation: 'Người nam thông báo: "the print shop hasn\'t delivered our large discount hanging banners yet".'
          },
          {
            question: '3. What will the man do when the delivery arrives?',
            options: [
              '(A) Order more mannequins from the supplier',
              '(B) Process customer payment refunds',
              '(C) Hang the banners above the central shopping aisles',
              '(D) Contact the regional marketing director'
            ],
            correctIndex: 2,
            explanation: 'Người nam khẳng định: "our sales floor team will suspend them above the main central aisles".'
          }
        ],
        keyVocab: [
          { word: 'Promotional arrangement', meaningVi: 'Sắp xếp chuẩn bị khuyến mãi' },
          { word: 'Mannequin', meaningVi: 'Ma-nơ-canh trưng bày quần áo' },
          { word: 'Suspend', meaningVi: 'Treo lơ lửng, mắc lên' }
        ]
      }
    ],
    part4Talks: [
      {
        id: 't3-p4-1',
        scenario: 'Thông báo phát thanh giờ vàng tri ân khách hàng tại trung tâm mua sắm (Mall Flash Sale)',
        audioScript: `Good afternoon and welcome to Grand Central Galleria! To commemorate our tenth anniversary in the city, we are thrilled to present our exclusive "Flash Savings Hour" for all shoppers today. Between 3:00 PM and 5:00 PM, all premium footwear, leather handbags, and designer sunglasses across the second floor will be available at an additional twenty-five percent discount off the sticker price. Furthermore, if you dine at any restaurant located in our fourth-floor food pavilion and spend forty dollars or more, simply present your dining receipt at the customer service desk in the central atrium to receive a voucher for three hours of free valet parking. We thank you for choosing Grand Central Galleria and wish you a pleasant shopping experience.`,
        questions: [
          {
            question: '1. What milestone is the shopping center celebrating?',
            options: [
              '(A) Its tenth anniversary',
              '(B) The opening of a new subway connection',
              '(C) The completion of a solar energy project',
              '(D) A new international store partnership'
            ],
            correctIndex: 0,
            explanation: 'Phát thanh viên mở đầu: "To commemorate our tenth anniversary in the city...".'
          },
          {
            question: '2. What promotion is offered between 3:00 PM and 5:00 PM on the second floor?',
            options: [
              '(A) Free gift wrapping on all book purchases',
              '(B) A 25 percent discount on footwear and accessories',
              '(C) Free beverages for VIP loyalty club members',
              '(D) Buy-one-get-one-free electronics warranties'
            ],
            correctIndex: 1,
            explanation: 'Nội dung thông báo: "all premium footwear, leather handbags, and designer sunglasses... available at an additional twenty-five percent discount".'
          },
          {
            question: '3. How can shoppers receive a free parking voucher?',
            options: [
              '(A) By downloading the shopping mall’s mobile app',
              '(B) By spending at least $40 at a fourth-floor restaurant and presenting the receipt',
              '(C) By signing up for a retailer credit card',
              '(D) By participating in a customer feedback survey'
            ],
            correctIndex: 1,
            explanation: 'Nội dung thông báo: "spend forty dollars or more, simply present your dining receipt at the customer service desk... to receive a voucher for three hours of free valet parking".'
          }
        ],
        keyVocab: [
          { word: 'Commemorate', meaningVi: 'Kỷ niệm, tưởng nhớ dấu mốc' },
          { word: 'Atrium', meaningVi: 'Sảnh thông tầng trung tâm' },
          { word: 'Valet parking', meaningVi: 'Dịch vụ đỗ xe hộ' }
        ]
      }
    ],
    part5Questions: [
      {
        id: 't3-p5-1',
        category: 'Từ loại (Word Form)',
        difficulty: '650+',
        question: 'The marketing campaign proved to be _______ successful in increasing brand awareness across Southeast Asia.',
        options: ['remarkable', 'remarkably', 'remarked', 'remarking'],
        correctIndex: 1,
        translation: 'Chiến dịch tiếp thị đã chứng minh là thành công một cách đáng kinh ngạc trong việc nâng cao độ nhận diện thương hiệu khắp Đông Nam Á.',
        explanation: '"successful" là tính từ, đứng trước tính từ cần một TRẠNG TỪ (Adv) để bổ nghĩa: "remarkably".',
        trapAlert: 'Quy tắc vị trí từ: Trạng từ đứng trước Tính từ (Adv + Adj + Noun).',
        keyVocabulary: [
          { word: 'Remarkably', pos: 'adv', meaningVi: 'Đáng chú ý, một cách xuất sắc' },
          { word: 'Brand awareness', pos: 'noun', meaningVi: 'Độ nhận diện thương hiệu' }
        ]
      },
      {
        id: 't3-p5-2',
        category: 'Giới từ đi kèm tính từ (Prepositions)',
        difficulty: '600+',
        question: 'Customers who enroll in our premier loyalty membership are eligible _______ a ten percent discount on all future bookings.',
        options: ['for', 'to', 'with', 'about'],
        correctIndex: 0,
        translation: 'Những khách hàng đăng ký chương trình hội viên thân thiết ưu tiên sẽ đủ điều kiện được giảm giá 10% cho tất cả các lần đặt chỗ trong tương lai.',
        explanation: 'Cấu trúc cố định: "eligible for something" (đủ điều kiện hưởng cái gì) hoặc "eligible to do something" (đủ điều kiện làm gì). Đứng sau là cụm danh từ "a ten percent discount" nên chọn giới từ "for".',
        trapAlert: 'Phân biệt "eligible FOR + Noun" vs "eligible TO + Verb nguyên thể".',
        keyVocabulary: [
          { word: 'Eligible for', pos: 'adj + prep', meaningVi: 'Đủ tư cách / điều kiện nhận cái gì' },
          { word: 'Premier loyalty', pos: 'noun', meaningVi: 'Hội viên thân thiết cao cấp' }
        ]
      },
      {
        id: 't3-p5-3',
        category: 'Đại từ quan hệ (Relative Pronouns)',
        difficulty: '650+',
        question: 'The customer service representative _______ handled my warranty claim was exceptionally courteous and efficient.',
        options: ['who', 'whom', 'which', 'whose'],
        correctIndex: 0,
        translation: 'Nhân viên dịch vụ khách hàng người mà đã xử lý yêu cầu bảo hành của tôi cư xử vô cùng lịch thiệp và hiệu quả.',
        explanation: 'Tiền từ là "The customer service representative" (người), vị trí khuyết làm CHỦ NGỮ đứng trước động từ "handled", do đó dùng đại từ quan hệ "who".',
        trapAlert: '"Whom" làm tân ngữ (sau whom là S + V). "Who" làm chủ ngữ (sau who là V).',
        keyVocabulary: [
          { word: 'Representative', pos: 'noun', meaningVi: 'Đại diện / nhân viên phụ trách' },
          { word: 'Courteous', pos: 'adj', meaningVi: 'Lịch sự, nhã nhặn' }
        ]
      },
      {
        id: 't3-p5-4',
        category: 'Giới từ chỉ khoảng thời gian (Prepositions of Time)',
        difficulty: '700+',
        question: 'Due to overwhelming public excitement, VIP tickets for the international culinary festival sold out _______ twenty minutes of opening.',
        options: ['within', 'among', 'during', 'between'],
        correctIndex: 0,
        translation: 'Do sự hào hứng nồng nhiệt của công chúng, vé VIP cho lễ hội ẩm thực quốc tế đã bán hết sạch chỉ trong vòng 20 phút sau khi mở bán.',
        explanation: '"Within + khoảng thời gian" (within twenty minutes) mang nghĩa "trong vòng bao lâu". "During" đi với danh từ chỉ sự kiện (during the concert), không đi trực tiếp với khoảng số lượng thời gian cụ thể.',
        trapAlert: 'Phân biệt "Within + số phút/giờ/ngày" (trong vòng) vs "During + danh từ sự kiện" (trong suốt kỳ nghỉ/buổi họp).',
        keyVocabulary: [
          { word: 'Within', pos: 'prep', meaningVi: 'Trong vòng (khoảng thời gian)' },
          { word: 'Sold out', pos: 'verb phrase', meaningVi: 'Bán hết sạch' }
        ]
      }
    ],
    part6Passages: [
      {
        id: 't3-p6-1',
        title: 'Thông Báo Nâng Cấp Ứng Dụng Khách Hàng Thân Thiết (Digital Loyalty Program)',
        passageText: `VALUED CUSTOMER ANNOUNCEMENT
Dear Bella Vista Rewards Club Member,

We are delighted to introduce the completely redesigned Bella Vista Gourmet mobile app. With this upgrade, keeping track of your dining rewards points (1) [___] faster and more intuitive than ever before.

Starting this Friday, every dollar spent at our bistro automatically converts into five rewards points when you scan your in-app QR code at the table. (2) [___]. Accumulated points may be redeemed at any time for complimentary appetizers, artisanal desserts, or premium beverage pairings.

To ensure uninterrupted access to your reward balance, please download the updated application from your smartphone app store (3) [___] the end of the month. As a token of our appreciation for your continued loyalty, a ten-dollar dining voucher will be credited (4) [___] to your account upon your first login.

Warm regards,
The Bella Vista Hospitality Team`,
        blanks: [
          {
            blankIndex: 1,
            options: ['(A) has become', '(B) will become', '(C) becoming', '(D) become'],
            correctIndex: 0,
            explanation: 'Chủ ngữ là danh động từ "keeping track..." (số ít), hành động đã hoàn tất mang lại kết quả hiện tại, dùng thì hiện tại hoàn thành số ít "has become".'
          },
          {
            blankIndex: 2,
            options: [
              '(A) Physical loyalty plastic cards will no longer be required.',
              '(B) The dining room will be closed permanently on weekends.',
              '(C) Customers must pay an annual membership subscription fee.',
              '(D) Table reservations can only be booked six months in advance.'
            ],
            correctIndex: 0,
            explanation: 'Đoạn trước nhấn mạnh việc quét mã QR trực tiếp trên điện thoại tại bàn, do đó câu (A) "Thẻ nhựa tích điểm vật lý sẽ không còn cần thiết nữa" là sự tiếp nối hoàn toàn ăn khớp.'
          },
          {
            blankIndex: 3,
            options: ['(A) by', '(B) until', '(C) for', '(D) since'],
            correctIndex: 0,
            explanation: 'Chỉ hạn chót hành động hoàn thành trước một thời điểm ("the end of the month"): dùng giới từ "by" (trước / muộn nhất vào).'
          },
          {
            blankIndex: 4,
            options: ['(A) directly', '(B) direction', '(C) directed', '(D) directive'],
            correctIndex: 0,
            explanation: 'Bổ nghĩa cho động từ bị động "will be credited... to your account" cần một TRẠNG TỪ: "directly" (sẽ được cộng trực tiếp vào tài khoản của bạn).'
          }
        ]
      }
    ],
    part7Passages: [
      {
        id: 't3-p7-1',
        passageType: 'Thư Trao Đổi Đặt Tiệc & Phản Hồi Dịch Vụ Khách Hàng (Catering Inquiry & Confirmation)',
        documentContent: `To: Horizon Conference Center <events@horizoncenter.org>
From: David Kim, Marketing Coordinator at NexaTech <d.kim@nexatech.com>
Date: October 18
Subject: Catering Requirements for Annual Product Launch

Dear Horizon Events Team,

Thank you for sending over the venue floor plan for our upcoming annual product launch on Thursday, November 14. We expect approximately 150 attendees, including our regional executive team, partners, and media journalists.

We would like to confirm the "Executive Delights" buffet catering package for the evening reception from 6:30 PM to 8:30 PM. In addition, because several members of our guest delegation have specific dietary restrictions, could you please confirm that the following options will be clearly labeled at the buffet stations?
1. At least two vegetarian and gluten-free savory hors d'oeuvres.
2. Non-alcoholic sparkling cider and infused water stations.

Please send an updated invoice reflecting the catering package and our ten percent early-booking corporate deposit by Monday afternoon so our finance department can authorize wire payment.

Sincerely,
David Kim, Marketing Coordinator`,
        questions: [
          {
            question: '1. What is the main objective of David Kim’s email?',
            options: [
              '(A) To cancel a reservation for a corporate seminar',
              '(B) To confirm a catering package and request dietary accommodations',
              '(C) To complain about poor conference center audiovisual equipment',
              '(D) To apply for an event coordinator position'
            ],
            correctIndex: 1,
            explanation: 'David Kim viết: "We would like to confirm the \'Executive Delights\' buffet catering package... and request that dietary restrictions be accommodated".'
          },
          {
            question: '2. How many attendees are anticipated for the product launch?',
            options: [
              '(A) About 50 people',
              '(B) Approximately 150 people',
              '(C) Over 500 people',
              '(D) Only 10 executives'
            ],
            correctIndex: 1,
            explanation: 'Đoạn 1 nêu: "We expect approximately 150 attendees, including our regional executive team...".'
          },
          {
            question: '3. What does Mr. Kim request by Monday afternoon?',
            options: [
              '(A) A printed seating chart for journalists',
              '(B) An updated invoice reflecting the corporate deposit',
              '(C) A sample tasting menu delivered to his office',
              '(D) Full payment from the conference venue'
            ],
            correctIndex: 1,
            explanation: 'Đoạn cuối: "Please send an updated invoice reflecting the catering package and our ten percent early-booking corporate deposit by Monday afternoon...".'
          }
        ]
      }
    ]
  }
];

// ==========================================
// TOEIC SPEAKING TASKS (Q1 to Q11) WITH REAL IMAGES
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
    imageUrl: '/exams/fallbacks/speaking-office.jpg',
    fallbackUrl: 'https://images.unsplash.com/photo-1531497865144-0464ef8fb9a9?auto=format&fit=crop&w=800&q=80',
    prompt: 'Describe the picture on your screen in as much detail as possible. Focus on location, people, actions, and background details.',
    imageDescription: 'Một văn phòng hiện đại với 2 đồng nghiệp đang trao đổi công việc trước màn hình máy tính xách tay. Người nam đang chỉ tay vào biểu đồ số liệu, người nữ chăm chú lắng nghe và cầm sổ ghi chép.',
    photos: [
      {
        qNum: 'Question 3: Công Sở & Họp Nhóm',
        imageUrl: '/exams/fallbacks/speaking-office.jpg',
        fallbackUrl: 'https://images.unsplash.com/photo-1531497865144-0464ef8fb9a9?auto=format&fit=crop&w=800&q=80',
        imageDescription: 'Một văn phòng hiện đại với 2 đồng nghiệp đang trao đổi công việc trước màn hình máy tính xách tay. Người nam đang chỉ tay vào biểu đồ số liệu, người nữ chăm chú lắng nghe và cầm sổ ghi chép.',
        sampleBand8Answer: `This is a photo taken inside a contemporary office. In the center, two colleagues are sitting side by side at a wooden conference desk. The man on the left, wearing a light blue dress shirt, is pointing directly at a data chart on the laptop screen. The woman on the right, dressed in a professional blazer, is listening attentively while holding a notepad and pen. On the table, I can see several folders, a smartphone, and a white coffee mug. In the background, there is a large glass window that lets in ample natural light. Overall, the atmosphere appears highly productive and collaborative.`,
        keyVocab: [
          { word: 'Attentively', meaningVi: 'Chăm chú, tập trung lắng nghe' },
          { word: 'Contemporary office', meaningVi: 'Văn phòng hiện đại' },
          { word: 'Collaborative atmosphere', meaningVi: 'Bầu không khí hợp tác' }
        ]
      },
      {
        qNum: 'Question 4: Ngoài Trời & Công Viên Đô Thị',
        imageUrl: '/exams/fallbacks/speaking-park.jpg',
        fallbackUrl: 'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?auto=format&fit=crop&w=800&q=80',
        imageDescription: 'Một nhóm bạn/đồng nghiệp đang ngồi trò chuyện thư giãn và trao đổi ngoài trời trên bãi cỏ xanh của một công viên đô thị rợp bóng cây mát, phía xa là các tòa nhà cao ốc.',
        sampleBand8Answer: `This photograph was taken outdoors in an urban public park on a bright, sunny afternoon. In the foreground, several people are sitting together on a green lawn, engaging in a lively and casual conversation. One person is reading a printed document while others are gesturing and smiling cheerfully. In the background, there is a cluster of modern city skyscrapers rising behind tall leafy trees under a clear blue sky. Overall, the scene looks remarkably peaceful and enjoyable as people unwind outdoors after work.`,
        keyVocab: [
          { word: 'Urban park', meaningVi: 'Công viên đô thị' },
          { word: 'Skyscrapers', meaningVi: 'Tòa nhà chọc trời' },
          { word: 'Unwind', meaningVi: 'Thư giãn, xả hơi' }
        ]
      }
    ],
    strategyTemplate: [
      '1. Mở bài (Tổng quan): "This picture was taken in a modern office environment / an urban park..."',
      '2. Trọng tâm (Người & Hành động): "In the foreground, people are collaborating / chatting..."',
      '3. Chi tiết phụ & Hậu cảnh: "In the background, there are tall windows / skyscrapers..."',
      '4. Cảm nghĩ/Kết luận: "Overall, they seem completely focused / relaxed."'
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
// TOEIC WRITING TASKS (Q1 to Q8) WITH REAL IMAGES
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
        imageUrl: '/exams/fallbacks/writing-bench.jpg',
        fallbackUrl: 'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?auto=format&fit=crop&w=800&q=80',
        sceneDescription: 'Một người đàn ông đang ngồi trên ghế băng gỗ trong công viên rợp bóng cây xanh mát.',
        keywords: ['bench', 'near / trees'],
        modelAnswers: [
          'A man is sitting on a wooden bench near several large trees.',
          'There is a park bench positioned near the tall green trees.'
        ],
        grammarNotes: 'Cần một mệnh đề hoàn chỉnh (S + V + O) liên kết danh từ bench và cụm giới từ near trees.'
      },
      {
        qNum: 'Question 2',
        imageUrl: '/exams/fallbacks/writing-bicycles.jpg',
        fallbackUrl: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=800&q=80',
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
        imageUrl: '/exams/fallbacks/writing-courier.jpg',
        fallbackUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80',
        sceneDescription: 'Một nhân viên giao hàng mặc đồng phục đang trao gói kiện hàng carton cho khách hàng.',
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
Senior Customer Relations Specialist, OfficeWorld Support Team`
  },
  {
    id: 'wrt-3',
    part: 'Part 3 (Q8)',
    partName: 'Viết bài luận bày tỏ quan điểm (Write an Opinion Essay)',
    timeMinutes: 30,
    targetWords: 'Tối thiểu 300 từ (4 - 5 đoạn chuẩn cấu trúc ETS)',
    prompt: 'Some companies believe that all employees should be required to wear formal business attire (such as suits and ties), while others encourage business casual or relaxed clothing. Which dress code policy do you prefer, and why? Support your position with specific workplace examples and reasons.',
    sampleBand8Essay: `In recent decades, corporate workplace culture has evolved substantially, prompting widespread debate over appropriate office dress codes. While traditional corporations mandate formal attire such as suits and ties, a growing number of modern enterprises advocate for business casual clothing. In my opinion, adopting a business casual dress policy is far superior because it fosters employee comfort, stimulates creative productivity, and reduces financial strain on workers.

To begin with, comfortable attire directly correlates with higher workplace productivity and mental well-being. Rigid suits, stiff collars, and high heels often cause physical fatigue, especially during long work shifts at a computer desk. When professionals are permitted to wear breathable, ergonomic clothing such as polo shirts and slacks, they experience far less physical tension. For instance, many world-leading technology companies like Google and Apple maintain relaxed dress codes, allowing their software engineers and designers to focus their mental energy entirely on innovation and complex problem-solving rather than uncomfortable wardrobe constraints.

Furthermore, a business casual policy creates a more approachable and collaborative corporate atmosphere. Traditional formal dress can reinforce rigid departmental hierarchies, making junior associates feel intimidated when speaking with senior executives. Conversely, when managers and employees dress in similar casual attire, barriers diminish, encouraging open communication, spontaneous brainstorming, and genuine team camaraderie. Additionally, maintaining multiple high-end business suits requires substantial expenses for dry cleaning and wardrobe updates, placing unnecessary financial burdens on recent university graduates who have just entered the corporate workforce.

In conclusion, although formal suits may remain suitable for ceremonial ceremonies or high-stakes legal proceedings, a business casual dress code represents the most practical and beneficial standard for modern day-to-day office life. By prioritizing comfort, collaboration, and financial fairness, organizations can cultivate a motivated workforce that consistently delivers outstanding results.`
  }
];

// ==========================================
// 600 ESSENTIAL BUSINESS WORDS
// ==========================================

export const TOEIC_600_WORDS = [
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
    description: 'Nắm chắc ngữ pháp nền tảng Part 5 (từ loại, giới từ, thì) và nghe hiểu câu hỏi Part 2 thường gặp.'
  },
  {
    band: '650 - 800',
    title: 'Chuyên Viên & Quản Lý',
    color: '#6366f1',
    description: 'Xử lý thành thạo cụm liên từ phức, câu điều kiện, bị động và từ vựng hợp đồng/kinh doanh chuyên sâu.'
  },
  {
    band: '800 - 990',
    title: 'Thành Thạo Quốc Tế (Master)',
    color: '#10b981',
    description: 'Chinh phục câu hỏi phân từ rút gọn, đảo ngữ, cấu trúc giả định và ngữ cảnh đàm phán cấp cao.'
  }
];



/**
 * Standard ETS Pace & Countdown Configuration per Question/Part
 * For practice & exam timing optimization
 */
export const TOEIC_PACE_CONFIG = {
  // Listening: Audio plays continuously, countdown indicates answer bubble transition window
  listening: {
    part1: { perQuestionSeconds: 5, targetSeconds: 5, label: '5s sau audio', title: 'Part 1: Tô đáp án tranh' },
    part2: { perQuestionSeconds: 5, targetSeconds: 5, label: '5s sau audio', title: 'Part 2: Tô đáp án hỏi - đáp' },
    part3: { perQuestionSeconds: 8, targetSeconds: 8, label: '8s / câu', title: 'Part 3: Chọn đáp án hội thoại' },
    part4: { perQuestionSeconds: 8, targetSeconds: 8, label: '8s / câu', title: 'Part 4: Chọn đáp án bài nói ngắn' }
  },
  // Reading: Strict speed pacing to ensure completing 100 questions within 75 minutes
  reading: {
    part5: { perQuestionSeconds: 30, targetSeconds: 30, label: '30s / câu', title: 'Part 5: Hoàn thành câu ngữ pháp (Tối đa 15 phút/30 câu)' },
    part6: { perQuestionSeconds: 60, targetSeconds: 60, label: '60s / câu', title: 'Part 6: Điền đoạn văn (Tối đa 8 - 10 phút/16 câu)' },
    part7: { perQuestionSeconds: 60, targetSeconds: 60, label: '60s / câu', title: 'Part 7: Đọc hiểu văn bản (Tối đa 50 - 52 phút/54 câu)' }
  },
  // Speaking: Official ETS speaking timers (Preparation + Speaking)
  speaking: {
    'spk-1': { prepSeconds: 45, speakSeconds: 45, label: '45s chuẩn bị • 45s nói', title: 'Q1 - Q2: Đọc to đoạn văn' },
    'spk-2': { prepSeconds: 45, speakSeconds: 30, label: '45s chuẩn bị • 30s nói', title: 'Q3 - Q4: Miêu tả bức tranh' },
    'spk-3': { prepSeconds: 3, speakSeconds: 15, label: '3s chuẩn bị • 15s - 30s nói', title: 'Q5 - Q7: Trả lời câu hỏi tình huống' },
    'spk-4': { prepSeconds: 45, speakSeconds: 15, label: '45s đọc tài liệu • 15s - 30s nói', title: 'Q8 - Q10: Trả lời theo lịch trình' },
    'spk-5': { prepSeconds: 45, speakSeconds: 60, label: '45s chuẩn bị • 60s nói', title: 'Q11: Bày tỏ quan điểm (60s)' }
  },
  // Writing: Official ETS writing timers
  writing: {
    'wrt-1': { perQuestionSeconds: 90, totalSeconds: 480, label: '8 phút / 5 câu (~90s/câu)', title: 'Q1 - Q5: Viết câu theo tranh & từ khóa' },
    'wrt-2': { perQuestionSeconds: 600, totalSeconds: 1200, label: '10 phút / email', title: 'Q6 - Q7: Viết email phản hồi công việc' },
    'wrt-3': { perQuestionSeconds: 1800, totalSeconds: 1800, label: '30 phút / bài luận', title: 'Q8: Viết bài luận quan điểm (Opinion Essay)' }
  }
};

/**
 * Study4-Style Complete Test Collections
 * Categorized into TOEIC LR (Listening & Reading) and TOEIC SW (Speaking & Writing)
 */
export const TOEIC_CATALOG_TESTS = [
  {
    id: 'lr-c1-t1',
    category: 'LR',
    collection: 'TOEIC LR Collection 1',
    title: 'TOEIC LR Collection 1 Test 1',
    subtitle: 'Đề Thi TOEIC Chuẩn Quốc Tế • Đầy đủ 7 phần thi chuẩn ETS',
    durationMinutes: 120,
    participantsCount: 555137,
    commentsCount: 512,
    partsCount: 7,
    questionsCount: 200,
    tags: ['#TOEIC', '#LR', '#COLLECTION_1', '#TEST_1'],
    targetBand: '650 - 800',
    difficulty: 'Tiêu chuẩn'
  },
  {
    id: 'lr-c1-t2',
    category: 'LR',
    collection: 'TOEIC LR Collection 1',
    title: 'TOEIC LR Collection 1 Test 2',
    subtitle: 'Vận Hành, Kỹ Thuật & Chuỗi Cung Ứng • Giám sát sản xuất & kho vận',
    durationMinutes: 120,
    participantsCount: 510274,
    commentsCount: 474,
    partsCount: 7,
    questionsCount: 200,
    tags: ['#TOEIC', '#LR', '#COLLECTION_1', '#TEST_2'],
    targetBand: '650 - 800',
    difficulty: 'Tiêu chuẩn'
  },
  {
    id: 'lr-c1-t3',
    category: 'LR',
    collection: 'TOEIC LR Collection 1',
    title: 'TOEIC LR Collection 1 Test 3',
    subtitle: 'Dịch Vụ Khách Hàng, Bán Lẻ & Tiếp Thị • Khách sạn & thương mại',
    durationMinutes: 120,
    participantsCount: 465411,
    commentsCount: 436,
    partsCount: 7,
    questionsCount: 200,
    tags: ['#TOEIC', '#LR', '#COLLECTION_1', '#TEST_3'],
    targetBand: '650 - 800',
    difficulty: 'Tiêu chuẩn'
  },
  {
    id: 'lr-c1-t4',
    category: 'LR',
    collection: 'TOEIC LR Collection 1',
    title: 'TOEIC LR Collection 1 Test 4',
    subtitle: 'Nhân Sự, Tuyển Dụng & Đào Tạo Nội Bộ • Hợp đồng lao động & phúc lợi',
    durationMinutes: 120,
    participantsCount: 420548,
    commentsCount: 398,
    partsCount: 7,
    questionsCount: 200,
    tags: ['#TOEIC', '#LR', '#COLLECTION_1', '#TEST_4'],
    targetBand: '650 - 800',
    difficulty: 'Tiêu chuẩn'
  },
  {
    id: 'lr-c1-t5',
    category: 'LR',
    collection: 'TOEIC LR Collection 1',
    title: 'TOEIC LR Collection 1 Test 5',
    subtitle: 'Tài Chính, Kế Toán & Đầu Tư Doanh Nghiệp • Báo cáo quý & kiểm toán',
    durationMinutes: 120,
    participantsCount: 375685,
    commentsCount: 360,
    partsCount: 7,
    questionsCount: 200,
    tags: ['#TOEIC', '#LR', '#COLLECTION_1', '#TEST_5'],
    targetBand: '650 - 800',
    difficulty: 'Tiêu chuẩn'
  },
  {
    id: 'lr-c1-t6',
    category: 'LR',
    collection: 'TOEIC LR Collection 1',
    title: 'TOEIC LR Collection 1 Test 6',
    subtitle: 'Công Nghệ Thông Tin & Phần Mềm Doanh Nghiệp • Bảo mật & hệ thống cloud',
    durationMinutes: 120,
    participantsCount: 330822,
    commentsCount: 322,
    partsCount: 7,
    questionsCount: 200,
    tags: ['#TOEIC', '#LR', '#COLLECTION_1', '#TEST_6'],
    targetBand: '750 - 900',
    difficulty: 'Nâng cao'
  },
  {
    id: 'lr-c1-t7',
    category: 'LR',
    collection: 'TOEIC LR Collection 1',
    title: 'TOEIC LR Collection 1 Test 7',
    subtitle: 'Thương Mại Quốc Tế, Thuế Quan & Xuất Nhập Khẩu • Đàm phán FOB/CIF',
    durationMinutes: 120,
    participantsCount: 285959,
    commentsCount: 284,
    partsCount: 7,
    questionsCount: 200,
    tags: ['#TOEIC', '#LR', '#COLLECTION_1', '#TEST_7'],
    targetBand: '750 - 900',
    difficulty: 'Nâng cao'
  },
  {
    id: 'lr-c1-t8',
    category: 'LR',
    collection: 'TOEIC LR Collection 1',
    title: 'TOEIC LR Collection 1 Test 8',
    subtitle: 'Hội Nghị Khách Hàng & Chiến Lược Ra Mắt Sản Phẩm • Truyền thông đa phương tiện',
    durationMinutes: 120,
    participantsCount: 241096,
    commentsCount: 246,
    partsCount: 7,
    questionsCount: 200,
    tags: ['#TOEIC', '#LR', '#COLLECTION_1', '#TEST_8'],
    targetBand: '750 - 900',
    difficulty: 'Nâng cao'
  },
  {
    id: 'lr-c1-t9',
    category: 'LR',
    collection: 'TOEIC LR Collection 1',
    title: 'TOEIC LR Collection 1 Test 9',
    subtitle: 'Đàm Phán Sáp Nhập Doanh Nghiệp & Hợp Đồng Pháp Lý (M&A Contracts)',
    durationMinutes: 120,
    participantsCount: 196233,
    commentsCount: 208,
    partsCount: 7,
    questionsCount: 200,
    tags: ['#TOEIC', '#LR', '#COLLECTION_1', '#TEST_9'],
    targetBand: '750 - 900',
    difficulty: 'Nâng cao'
  },
  {
    id: 'lr-c1-t10',
    category: 'LR',
    collection: 'TOEIC LR Collection 1',
    title: 'TOEIC LR Collection 1 Test 10',
    subtitle: 'Tổng Hợp Bẫy Đề Thi ETS Thường Gặp • Luyện phản xạ & tối ưu thời gian',
    durationMinutes: 120,
    participantsCount: 151370,
    commentsCount: 170,
    partsCount: 7,
    questionsCount: 200,
    tags: ['#TOEIC', '#LR', '#COLLECTION_1', '#TEST_10'],
    targetBand: '750 - 900',
    difficulty: 'Nâng cao'
  },
  {
    id: 'lr-c2-t1',
    category: 'LR',
    collection: 'TOEIC LR Collection 2',
    title: 'TOEIC LR Collection 2 Test 1',
    subtitle: 'Đề Thi Thử Nghiệm Định Dạng Mới ETS • Đồ thị & hội thoại 3 người',
    durationMinutes: 120,
    participantsCount: 327211,
    commentsCount: 299,
    partsCount: 7,
    questionsCount: 200,
    tags: ['#TOEIC', '#LR', '#COLLECTION_2', '#TEST_1'],
    targetBand: '700 - 850',
    difficulty: 'Nâng cao'
  },
  {
    id: 'lr-c2-t2',
    category: 'LR',
    collection: 'TOEIC LR Collection 2',
    title: 'TOEIC LR Collection 2 Test 2',
    subtitle: 'Kỹ Năng Nghe Giọng Đa Quốc Gia (Mỹ, Anh, Úc, Canada) & Đọc Nhanh Skimming',
    durationMinutes: 120,
    participantsCount: 304422,
    commentsCount: 278,
    partsCount: 7,
    questionsCount: 200,
    tags: ['#TOEIC', '#LR', '#COLLECTION_2', '#TEST_2'],
    targetBand: '700 - 850',
    difficulty: 'Nâng cao'
  },
  {
    id: 'lr-c2-t3',
    category: 'LR',
    collection: 'TOEIC LR Collection 2',
    title: 'TOEIC LR Collection 2 Test 3',
    subtitle: 'Chiến Lược Phân Tích Báo Cáo Tài Chính & Biên Bản Họp Ban Giám Đốc',
    durationMinutes: 120,
    participantsCount: 281633,
    commentsCount: 257,
    partsCount: 7,
    questionsCount: 200,
    tags: ['#TOEIC', '#LR', '#COLLECTION_2', '#TEST_3'],
    targetBand: '700 - 850',
    difficulty: 'Nâng cao'
  },
  {
    id: 'lr-c2-t4',
    category: 'LR',
    collection: 'TOEIC LR Collection 2',
    title: 'TOEIC LR Collection 2 Test 4',
    subtitle: 'Xử Lý Khảo Sát Thị Trường, Đánh Giá Khách Hàng & Chiến Dịch Quảng Cáo',
    durationMinutes: 120,
    participantsCount: 258844,
    commentsCount: 236,
    partsCount: 7,
    questionsCount: 200,
    tags: ['#TOEIC', '#LR', '#COLLECTION_2', '#TEST_4'],
    targetBand: '700 - 850',
    difficulty: 'Nâng cao'
  },
  {
    id: 'lr-c2-t5',
    category: 'LR',
    collection: 'TOEIC LR Collection 2',
    title: 'TOEIC LR Collection 2 Test 5',
    subtitle: 'Quy Trình Mua Sắm Trang Thiết Bị & Đàm Phán Nhà Cung Ứng Doanh Nghiệp',
    durationMinutes: 120,
    participantsCount: 236055,
    commentsCount: 215,
    partsCount: 7,
    questionsCount: 200,
    tags: ['#TOEIC', '#LR', '#COLLECTION_2', '#TEST_5'],
    targetBand: '700 - 850',
    difficulty: 'Nâng cao'
  },
  {
    id: 'lr-c2-t6',
    category: 'LR',
    collection: 'TOEIC LR Collection 2',
    title: 'TOEIC LR Collection 2 Test 6',
    subtitle: 'Quản Trị Nhân Sự, Đánh Giá Hiệu Suất KPI & Lương Thưởng Nhân Viên',
    durationMinutes: 120,
    participantsCount: 213266,
    commentsCount: 194,
    partsCount: 7,
    questionsCount: 200,
    tags: ['#TOEIC', '#LR', '#COLLECTION_2', '#TEST_6'],
    targetBand: '700 - 850',
    difficulty: 'Nâng cao'
  },
  {
    id: 'lr-c2-t7',
    category: 'LR',
    collection: 'TOEIC LR Collection 2',
    title: 'TOEIC LR Collection 2 Test 7',
    subtitle: 'Hậu Cần Vận Tải Đa Phương Thức, Logistics Quốc Tế & Thủ Tục Hải Quan',
    durationMinutes: 120,
    participantsCount: 190477,
    commentsCount: 173,
    partsCount: 7,
    questionsCount: 200,
    tags: ['#TOEIC', '#LR', '#COLLECTION_2', '#TEST_7'],
    targetBand: '800 - 950',
    difficulty: 'Chuyên gia'
  },
  {
    id: 'lr-c2-t8',
    category: 'LR',
    collection: 'TOEIC LR Collection 2',
    title: 'TOEIC LR Collection 2 Test 8',
    subtitle: 'Bảo Trì Hệ Thống Máy Tính, An Toàn Mạng Doanh Nghiệp & Cập Nhật Phần Mềm',
    durationMinutes: 120,
    participantsCount: 167688,
    commentsCount: 152,
    partsCount: 7,
    questionsCount: 200,
    tags: ['#TOEIC', '#LR', '#COLLECTION_2', '#TEST_8'],
    targetBand: '800 - 950',
    difficulty: 'Chuyên gia'
  },
  {
    id: 'lr-c2-t9',
    category: 'LR',
    collection: 'TOEIC LR Collection 2',
    title: 'TOEIC LR Collection 2 Test 9',
    subtitle: 'Hội Thảo Quốc Tế, Lịch Trình Di Chuyển & Đặt Chỗ Vé Máy Bay Khách Sạn',
    durationMinutes: 120,
    participantsCount: 144899,
    commentsCount: 131,
    partsCount: 7,
    questionsCount: 200,
    tags: ['#TOEIC', '#LR', '#COLLECTION_2', '#TEST_9'],
    targetBand: '800 - 950',
    difficulty: 'Chuyên gia'
  },
  {
    id: 'lr-c2-t10',
    category: 'LR',
    collection: 'TOEIC LR Collection 2',
    title: 'TOEIC LR Collection 2 Test 10',
    subtitle: 'Đề Thi Chinh Phục Điểm 900+ • Bẫy Suy Luận Part 7 & Paraphrasing Part 3-4',
    durationMinutes: 120,
    participantsCount: 122110,
    commentsCount: 110,
    partsCount: 7,
    questionsCount: 200,
    tags: ['#TOEIC', '#LR', '#COLLECTION_2', '#TEST_10'],
    targetBand: '800 - 950',
    difficulty: 'Chuyên gia'
  },
  {
    id: 'lr-c3-t1',
    category: 'LR',
    collection: 'TOEIC LR Collection 3',
    title: 'TOEIC LR Collection 3 Test 1',
    subtitle: 'Đề Khởi Động Chuỗi Luyện Thi ETS Mới • Phản xạ từ vựng công sở trọng tâm',
    durationMinutes: 120,
    participantsCount: 261153,
    commentsCount: 243,
    partsCount: 7,
    questionsCount: 200,
    tags: ['#TOEIC', '#LR', '#COLLECTION_3', '#TEST_1'],
    targetBand: '700 - 850',
    difficulty: 'Tiêu chuẩn'
  },
  {
    id: 'lr-c3-t2',
    category: 'LR',
    collection: 'TOEIC LR Collection 3',
    title: 'TOEIC LR Collection 3 Test 2',
    subtitle: 'Chiến Thuật Bắt Key Nghe Part 2 & Đọc Hiểu Nhanh Part 5 Trong 15 Phút',
    durationMinutes: 120,
    participantsCount: 242306,
    commentsCount: 226,
    partsCount: 7,
    questionsCount: 200,
    tags: ['#TOEIC', '#LR', '#COLLECTION_3', '#TEST_2'],
    targetBand: '700 - 850',
    difficulty: 'Tiêu chuẩn'
  },
  {
    id: 'lr-c3-t3',
    category: 'LR',
    collection: 'TOEIC LR Collection 3',
    title: 'TOEIC LR Collection 3 Test 3',
    subtitle: 'Kỹ Thuật Xử Lý Bài Đọc Kép (Double Passages) Part 7 & Bắt Nhịp Hội Thoại',
    durationMinutes: 120,
    participantsCount: 223459,
    commentsCount: 209,
    partsCount: 7,
    questionsCount: 200,
    tags: ['#TOEIC', '#LR', '#COLLECTION_3', '#TEST_3'],
    targetBand: '700 - 850',
    difficulty: 'Tiêu chuẩn'
  },
  {
    id: 'lr-c3-t4',
    category: 'LR',
    collection: 'TOEIC LR Collection 3',
    title: 'TOEIC LR Collection 3 Test 4',
    subtitle: 'Tối Ưu Thời Gian Làm Bài & Phân Tích Thông Báo Tàu Xe Sân Bay Part 4',
    durationMinutes: 120,
    participantsCount: 204612,
    commentsCount: 192,
    partsCount: 7,
    questionsCount: 200,
    tags: ['#TOEIC', '#LR', '#COLLECTION_3', '#TEST_4'],
    targetBand: '700 - 850',
    difficulty: 'Nâng cao'
  },
  {
    id: 'lr-c3-t5',
    category: 'LR',
    collection: 'TOEIC LR Collection 3',
    title: 'TOEIC LR Collection 3 Test 5',
    subtitle: 'Chuyên Đề Ngữ Pháp Thì & Thể Bị Động Nâng Cao Part 5 & Điền Từ Part 6',
    durationMinutes: 120,
    participantsCount: 185765,
    commentsCount: 175,
    partsCount: 7,
    questionsCount: 200,
    tags: ['#TOEIC', '#LR', '#COLLECTION_3', '#TEST_5'],
    targetBand: '700 - 850',
    difficulty: 'Nâng cao'
  },
  {
    id: 'lr-c3-t6',
    category: 'LR',
    collection: 'TOEIC LR Collection 3',
    title: 'TOEIC LR Collection 3 Test 6',
    subtitle: 'Giao Tiếp Đa Văn Hóa, Email Đối Tác & Biên Bản Bàn Giao Dự Án',
    durationMinutes: 120,
    participantsCount: 166918,
    commentsCount: 158,
    partsCount: 7,
    questionsCount: 200,
    tags: ['#TOEIC', '#LR', '#COLLECTION_3', '#TEST_6'],
    targetBand: '800 - 990',
    difficulty: 'Nâng cao'
  },
  {
    id: 'lr-c3-t7',
    category: 'LR',
    collection: 'TOEIC LR Collection 3',
    title: 'TOEIC LR Collection 3 Test 7',
    subtitle: 'Quản Lý Đơn Hàng Thương Mại Điện Tử & Chính Sách Đổi Trả Bảo Hành',
    durationMinutes: 120,
    participantsCount: 148071,
    commentsCount: 141,
    partsCount: 7,
    questionsCount: 200,
    tags: ['#TOEIC', '#LR', '#COLLECTION_3', '#TEST_7'],
    targetBand: '800 - 990',
    difficulty: 'Nâng cao'
  },
  {
    id: 'lr-c3-t8',
    category: 'LR',
    collection: 'TOEIC LR Collection 3',
    title: 'TOEIC LR Collection 3 Test 8',
    subtitle: 'Chiến Dịch Tiếp Thị Số (Digital Marketing) & Phân Tích Xu Hướng Thị Trường',
    durationMinutes: 120,
    participantsCount: 129224,
    commentsCount: 124,
    partsCount: 7,
    questionsCount: 200,
    tags: ['#TOEIC', '#LR', '#COLLECTION_3', '#TEST_8'],
    targetBand: '800 - 990',
    difficulty: 'Chuyên gia'
  },
  {
    id: 'lr-c3-t9',
    category: 'LR',
    collection: 'TOEIC LR Collection 3',
    title: 'TOEIC LR Collection 3 Test 9',
    subtitle: 'Tái Cấu Trúc Doanh Nghiệp, Bổ Nhiệm Nhân Sự Cấp Cao & Họp Cổ Đông',
    durationMinutes: 120,
    participantsCount: 110377,
    commentsCount: 107,
    partsCount: 7,
    questionsCount: 200,
    tags: ['#TOEIC', '#LR', '#COLLECTION_3', '#TEST_9'],
    targetBand: '800 - 990',
    difficulty: 'Chuyên gia'
  },
  {
    id: 'lr-c3-t10',
    category: 'LR',
    collection: 'TOEIC LR Collection 3',
    title: 'TOEIC LR Collection 3 Test 10',
    subtitle: 'Đề Thi Thử Thách Cực Hạn • Tăng Tốc Độ Xử Lý Bài Đọc Ba (Triple Passages)',
    durationMinutes: 120,
    participantsCount: 91530,
    commentsCount: 90,
    partsCount: 7,
    questionsCount: 200,
    tags: ['#TOEIC', '#LR', '#COLLECTION_3', '#TEST_10'],
    targetBand: '800 - 990',
    difficulty: 'Chuyên gia'
  },
  {
    id: 'lr-c4-t1',
    category: 'LR',
    collection: 'TOEIC LR Collection 4',
    title: 'TOEIC LR Collection 4 Test 1',
    subtitle: 'Bộ Đề Luyện Tập Toàn Diện 2024 • Chuẩn Format Ra Đề Mới Nhất',
    durationMinutes: 120,
    participantsCount: 196097,
    commentsCount: 178,
    partsCount: 7,
    questionsCount: 200,
    tags: ['#TOEIC', '#LR', '#COLLECTION_4', '#TEST_1'],
    targetBand: '750 - 900',
    difficulty: 'Nâng cao'
  },
  {
    id: 'lr-c4-t2',
    category: 'LR',
    collection: 'TOEIC LR Collection 4',
    title: 'TOEIC LR Collection 4 Test 2',
    subtitle: 'Phân Tích Đoạn Văn Kép Email & Hóa Đơn Mua Hàng Part 7 Chuẩn Xác',
    durationMinutes: 120,
    participantsCount: 182194,
    commentsCount: 166,
    partsCount: 7,
    questionsCount: 200,
    tags: ['#TOEIC', '#LR', '#COLLECTION_4', '#TEST_2'],
    targetBand: '750 - 900',
    difficulty: 'Nâng cao'
  },
  {
    id: 'lr-c4-t3',
    category: 'LR',
    collection: 'TOEIC LR Collection 4',
    title: 'TOEIC LR Collection 4 Test 3',
    subtitle: 'Nhận Diện Ý Đồ Người Nói (Speaker Intent) & Ngữ Cảnh Ẩn Part 3-4',
    durationMinutes: 120,
    participantsCount: 168291,
    commentsCount: 154,
    partsCount: 7,
    questionsCount: 200,
    tags: ['#TOEIC', '#LR', '#COLLECTION_4', '#TEST_3'],
    targetBand: '750 - 900',
    difficulty: 'Nâng cao'
  },
  {
    id: 'lr-c4-t4',
    category: 'LR',
    collection: 'TOEIC LR Collection 4',
    title: 'TOEIC LR Collection 4 Test 4',
    subtitle: 'Luyện Kỹ Năng Tìm Dữ Liệu Nhanh Trong Lịch Trình, Bảng Biểu & Thực Đơn',
    durationMinutes: 120,
    participantsCount: 154388,
    commentsCount: 142,
    partsCount: 7,
    questionsCount: 200,
    tags: ['#TOEIC', '#LR', '#COLLECTION_4', '#TEST_4'],
    targetBand: '750 - 900',
    difficulty: 'Nâng cao'
  },
  {
    id: 'lr-c4-t5',
    category: 'LR',
    collection: 'TOEIC LR Collection 4',
    title: 'TOEIC LR Collection 4 Test 5',
    subtitle: 'Ngữ Pháp Mệnh Đề Quan Hệ Rút Gọn & Đảo Ngữ Thường Gặp Trong Part 5',
    durationMinutes: 120,
    participantsCount: 140485,
    commentsCount: 130,
    partsCount: 7,
    questionsCount: 200,
    tags: ['#TOEIC', '#LR', '#COLLECTION_4', '#TEST_5'],
    targetBand: '750 - 900',
    difficulty: 'Nâng cao'
  },
  {
    id: 'lr-c4-t6',
    category: 'LR',
    collection: 'TOEIC LR Collection 4',
    title: 'TOEIC LR Collection 4 Test 6',
    subtitle: 'Xử Lý Thư Khiếu Nại Dịch Vụ & Thư Xin Lỗi Khách Hàng Doanh Nghiệp',
    durationMinutes: 120,
    participantsCount: 126582,
    commentsCount: 118,
    partsCount: 7,
    questionsCount: 200,
    tags: ['#TOEIC', '#LR', '#COLLECTION_4', '#TEST_6'],
    targetBand: '750 - 900',
    difficulty: 'Nâng cao'
  },
  {
    id: 'lr-c4-t7',
    category: 'LR',
    collection: 'TOEIC LR Collection 4',
    title: 'TOEIC LR Collection 4 Test 7',
    subtitle: 'Kế Hoạch Mở Rộng Chi Nhánh Quốc Tế & Nghiên Cứu Khả Thi Thị Trường',
    durationMinutes: 120,
    participantsCount: 112679,
    commentsCount: 106,
    partsCount: 7,
    questionsCount: 200,
    tags: ['#TOEIC', '#LR', '#COLLECTION_4', '#TEST_7'],
    targetBand: '850 - 990',
    difficulty: 'Chuyên gia'
  },
  {
    id: 'lr-c4-t8',
    category: 'LR',
    collection: 'TOEIC LR Collection 4',
    title: 'TOEIC LR Collection 4 Test 8',
    subtitle: 'Hội Nghị Đổi Mới Công Nghệ, Diễn Giả Khách Mời & Đăng Ký Tham Gia',
    durationMinutes: 120,
    participantsCount: 98776,
    commentsCount: 94,
    partsCount: 7,
    questionsCount: 200,
    tags: ['#TOEIC', '#LR', '#COLLECTION_4', '#TEST_8'],
    targetBand: '850 - 990',
    difficulty: 'Chuyên gia'
  },
  {
    id: 'lr-c4-t9',
    category: 'LR',
    collection: 'TOEIC LR Collection 4',
    title: 'TOEIC LR Collection 4 Test 9',
    subtitle: 'Hợp Đồng Thuê Văn Phòng, Điều Khoản Pháp Lý & Gia Hạn Dịch Vụ',
    durationMinutes: 120,
    participantsCount: 84873,
    commentsCount: 82,
    partsCount: 7,
    questionsCount: 200,
    tags: ['#TOEIC', '#LR', '#COLLECTION_4', '#TEST_9'],
    targetBand: '850 - 990',
    difficulty: 'Chuyên gia'
  },
  {
    id: 'lr-c4-t10',
    category: 'LR',
    collection: 'TOEIC LR Collection 4',
    title: 'TOEIC LR Collection 4 Test 10',
    subtitle: 'Đề Thi Tổng Lực Bứt Phá Điểm Số • Kiểm Tra Phong Độ Trước Kỳ Thi Thật',
    durationMinutes: 120,
    participantsCount: 70970,
    commentsCount: 70,
    partsCount: 7,
    questionsCount: 200,
    tags: ['#TOEIC', '#LR', '#COLLECTION_4', '#TEST_10'],
    targetBand: '850 - 990',
    difficulty: 'Chuyên gia'
  },
  {
    id: 'lr-sample-t1',
    category: 'LR',
    collection: 'Sample TOEIC Test',
    title: 'Sample TOEIC Test Test 1',
    subtitle: 'Đề Thi Mẫu Tiêu Chuẩn 01 • Cọ Xát Cấu Trúc Đề ETS Thực Tế',
    durationMinutes: 120,
    participantsCount: 141067,
    commentsCount: 121,
    partsCount: 7,
    questionsCount: 200,
    tags: ['#TOEIC', '#LR', '#SAMPLE_TEST', '#TEST_1'],
    targetBand: '600 - 800',
    difficulty: 'Tiêu chuẩn'
  },
  {
    id: 'lr-sample-t2',
    category: 'LR',
    collection: 'Sample TOEIC Test',
    title: 'Sample TOEIC Test Test 2',
    subtitle: 'Đề Thi Mẫu Tiêu Chuẩn 02 • Đánh Giá Năng Lực Khởi Đầu & Đo Mức Điểm',
    durationMinutes: 120,
    participantsCount: 132134,
    commentsCount: 112,
    partsCount: 7,
    questionsCount: 200,
    tags: ['#TOEIC', '#LR', '#SAMPLE_TEST', '#TEST_2'],
    targetBand: '600 - 800',
    difficulty: 'Tiêu chuẩn'
  },
  {
    id: 'lr-sample-t3',
    category: 'LR',
    collection: 'Sample TOEIC Test',
    title: 'Sample TOEIC Test Test 3',
    subtitle: 'Đề Thi Mẫu Tiêu Chuẩn 03 • Luyện Độ Tập Trung Cao Độ 120 Phút Liên Tục',
    durationMinutes: 120,
    participantsCount: 123201,
    commentsCount: 103,
    partsCount: 7,
    questionsCount: 200,
    tags: ['#TOEIC', '#LR', '#SAMPLE_TEST', '#TEST_3'],
    targetBand: '600 - 800',
    difficulty: 'Tiêu chuẩn'
  },
  {
    id: 'lr-sample-t4',
    category: 'LR',
    collection: 'Sample TOEIC Test',
    title: 'Sample TOEIC Test Test 4',
    subtitle: 'Đề Thi Mẫu Tiêu Chuẩn 04 • Rèn Luyện Thói Quen Tô Đáp Án & Quản Lý Thời Gian',
    durationMinutes: 120,
    participantsCount: 114268,
    commentsCount: 94,
    partsCount: 7,
    questionsCount: 200,
    tags: ['#TOEIC', '#LR', '#SAMPLE_TEST', '#TEST_4'],
    targetBand: '600 - 800',
    difficulty: 'Tiêu chuẩn'
  },
  {
    id: 'lr-sample-t5',
    category: 'LR',
    collection: 'Sample TOEIC Test',
    title: 'Sample TOEIC Test Test 5',
    subtitle: 'Đề Thi Mẫu Tiêu Chuẩn 05 • Làm Quen Ngữ Điệu Hội Thoại Nhanh Chuẩn Giọng Mỹ',
    durationMinutes: 120,
    participantsCount: 105335,
    commentsCount: 85,
    partsCount: 7,
    questionsCount: 200,
    tags: ['#TOEIC', '#LR', '#SAMPLE_TEST', '#TEST_5'],
    targetBand: '600 - 800',
    difficulty: 'Tiêu chuẩn'
  },
  {
    id: 'lr-sample-t6',
    category: 'LR',
    collection: 'Sample TOEIC Test',
    title: 'Sample TOEIC Test Test 6',
    subtitle: 'Đề Thi Mẫu Tiêu Chuẩn 06 • Tăng Cường Vốn Từ Vựng Môi Trường Công Sở',
    durationMinutes: 120,
    participantsCount: 96402,
    commentsCount: 76,
    partsCount: 7,
    questionsCount: 200,
    tags: ['#TOEIC', '#LR', '#SAMPLE_TEST', '#TEST_6'],
    targetBand: '600 - 800',
    difficulty: 'Tiêu chuẩn'
  },
  {
    id: 'lr-sample-t7',
    category: 'LR',
    collection: 'Sample TOEIC Test',
    title: 'Sample TOEIC Test Test 7',
    subtitle: 'Đề Thi Mẫu Tiêu Chuẩn 07 • Kiểm Tra Ngữ Pháp Trọng Điểm & Bẫy Từ Loại Part 5',
    durationMinutes: 120,
    participantsCount: 87469,
    commentsCount: 67,
    partsCount: 7,
    questionsCount: 200,
    tags: ['#TOEIC', '#LR', '#SAMPLE_TEST', '#TEST_7'],
    targetBand: '600 - 800',
    difficulty: 'Tiêu chuẩn'
  },
  {
    id: 'lr-sample-t8',
    category: 'LR',
    collection: 'Sample TOEIC Test',
    title: 'Sample TOEIC Test Test 8',
    subtitle: 'Đề Thi Mẫu Tiêu Chuẩn 08 • Thực Hành Đọc Hiểu Đoạn Văn Đơn & Kép Part 7',
    durationMinutes: 120,
    participantsCount: 78536,
    commentsCount: 58,
    partsCount: 7,
    questionsCount: 200,
    tags: ['#TOEIC', '#LR', '#SAMPLE_TEST', '#TEST_8'],
    targetBand: '600 - 800',
    difficulty: 'Tiêu chuẩn'
  },
  {
    id: 'lr-sample-t9',
    category: 'LR',
    collection: 'Sample TOEIC Test',
    title: 'Sample TOEIC Test Test 9',
    subtitle: 'Đề Thi Mẫu Tiêu Chuẩn 09 • Rèn Luyện Tư Duy Loại Trừ Đáp Án Nhiễu Nhanh',
    durationMinutes: 120,
    participantsCount: 69603,
    commentsCount: 49,
    partsCount: 7,
    questionsCount: 200,
    tags: ['#TOEIC', '#LR', '#SAMPLE_TEST', '#TEST_9'],
    targetBand: '600 - 800',
    difficulty: 'Tiêu chuẩn'
  },
  {
    id: 'lr-sample-t10',
    category: 'LR',
    collection: 'Sample TOEIC Test',
    title: 'Sample TOEIC Test Test 10',
    subtitle: 'Đề Thi Mẫu Tiêu Chuẩn 10 • Tổng Duyệt Trước Kỳ Thi • Tự Tin Đạt Target',
    durationMinutes: 120,
    participantsCount: 60670,
    commentsCount: 40,
    partsCount: 7,
    questionsCount: 200,
    tags: ['#TOEIC', '#LR', '#SAMPLE_TEST', '#TEST_10'],
    targetBand: '600 - 800',
    difficulty: 'Tiêu chuẩn'
  },

  // --- TOEIC SW COLLECTION 1 (Speaking & Writing: 15 Đề Bản Gốc STUDY4) ---
  {
    id: 'sw-c1-t1',
    category: 'SW',
    collection: 'TOEIC SW Collection 1',
    title: 'TOEIC SW Collection 1 Test 1',
    subtitle: 'Speaking (11 câu) & Writing (8 câu) • Thuyết trình, Phỏng vấn & Viết Email Chuẩn Quốc Tế',
    durationMinutes: 80,
    participantsCount: 142350,
    commentsCount: 184,
    partsCount: 8,
    questionsCount: 19,
    tags: ['#TOEIC_SW', '#SPEAKING', '#WRITING', '#TEST_1'],
    baseTestSetId: 'test-1',
    targetBand: '160 - 200 (Band 7-8)',
    difficulty: 'Tiêu chuẩn'
  },
  {
    id: 'sw-c1-t2',
    category: 'SW',
    collection: 'TOEIC SW Collection 1',
    title: 'TOEIC SW Collection 1 Test 2',
    subtitle: 'Chăm Sóc Khách Hàng, Xử Lý Khiếu Nại & Soạn Thảo Đề Xuất Dự Án',
    durationMinutes: 80,
    participantsCount: 98120,
    commentsCount: 112,
    partsCount: 8,
    questionsCount: 19,
    tags: ['#TOEIC_SW', '#SPEAKING', '#WRITING', '#TEST_2'],
    baseTestSetId: 'test-2',
    targetBand: '160 - 200 (Band 7-8)',
    difficulty: 'Tiêu chuẩn'
  },
  {
    id: 'sw-c1-t3',
    category: 'SW',
    collection: 'TOEIC SW Collection 1',
    title: 'TOEIC SW Collection 1 Test 3',
    subtitle: 'Điều Phối Cuộc Họp Trực Tuyến & Luận Điểm Làm Việc Từ Xa (Remote Work)',
    durationMinutes: 80,
    participantsCount: 67490,
    commentsCount: 85,
    partsCount: 8,
    questionsCount: 19,
    tags: ['#TOEIC_SW', '#SPEAKING', '#WRITING', '#TEST_3'],
    baseTestSetId: 'test-3',
    targetBand: '180 - 200 (Band 8)',
    difficulty: 'Nâng cao'
  },
  {
    id: 'sw-c1-t4',
    category: 'SW',
    collection: 'TOEIC SW Collection 1',
    title: 'TOEIC SW Collection 1 Test 4',
    subtitle: 'Thuyết Trình Kế Hoạch Ngân Sách & Bài Luận Trách Nhiệm Xã Hội (CSR)',
    durationMinutes: 80,
    participantsCount: 45210,
    commentsCount: 63,
    partsCount: 8,
    questionsCount: 19,
    tags: ['#TOEIC_SW', '#SPEAKING', '#WRITING', '#TEST_4'],
    baseTestSetId: 'test-1',
    targetBand: '180 - 200 (Band 8)',
    difficulty: 'Chuyên gia'
  },
  {
    id: 'sw-c1-t5',
    category: 'SW',
    collection: 'TOEIC SW Collection 1',
    title: 'TOEIC SW Collection 1 Test 5',
    subtitle: 'Quản Lý Chuỗi Cung Ứng & Phản Hồi Khiếu Nại Chậm Giao Hàng',
    durationMinutes: 80,
    participantsCount: 41200,
    commentsCount: 58,
    partsCount: 8,
    questionsCount: 19,
    tags: ['#TOEIC_SW', '#SPEAKING', '#WRITING', '#TEST_5'],
    baseTestSetId: 'test-1',
    targetBand: '160 - 200 (Band 7-8)',
    difficulty: 'Tiêu chuẩn'
  },
  {
    id: 'sw-c1-t6',
    category: 'SW',
    collection: 'TOEIC SW Collection 1',
    title: 'TOEIC SW Collection 1 Test 6',
    subtitle: 'Đàm Phán Gia Hạn Hợp Đồng Thuê Văn Phòng & Phỏng Vấn Tuyển Dụng',
    durationMinutes: 80,
    participantsCount: 38900,
    commentsCount: 52,
    partsCount: 8,
    questionsCount: 19,
    tags: ['#TOEIC_SW', '#SPEAKING', '#WRITING', '#TEST_6'],
    baseTestSetId: 'test-1',
    targetBand: '160 - 200 (Band 7-8)',
    difficulty: 'Tiêu chuẩn'
  },
  {
    id: 'sw-c1-t7',
    category: 'SW',
    collection: 'TOEIC SW Collection 1',
    title: 'TOEIC SW Collection 1 Test 7',
    subtitle: 'Giới Thiệu Tính Năng Ứng Dụng Mới & Email Xác Nhận Lịch Trình',
    durationMinutes: 80,
    participantsCount: 36400,
    commentsCount: 47,
    partsCount: 8,
    questionsCount: 19,
    tags: ['#TOEIC_SW', '#SPEAKING', '#WRITING', '#TEST_7'],
    baseTestSetId: 'test-1',
    targetBand: '160 - 200 (Band 7-8)',
    difficulty: 'Tiêu chuẩn'
  },
  {
    id: 'sw-c1-t8',
    category: 'SW',
    collection: 'TOEIC SW Collection 1',
    title: 'TOEIC SW Collection 1 Test 8',
    subtitle: 'Xử Lý Sự Cố Phần Mềm & Thư Cảm Ơn Đối Tác Chiến Lược',
    durationMinutes: 80,
    participantsCount: 33100,
    commentsCount: 41,
    partsCount: 8,
    questionsCount: 19,
    tags: ['#TOEIC_SW', '#SPEAKING', '#WRITING', '#TEST_8'],
    baseTestSetId: 'test-1',
    targetBand: '180 - 200 (Band 8)',
    difficulty: 'Nâng cao'
  },
  {
    id: 'sw-c1-t9',
    category: 'SW',
    collection: 'TOEIC SW Collection 1',
    title: 'TOEIC SW Collection 1 Test 9',
    subtitle: 'Kế Hoạch Marketing Tiếp Thị Sản Phẩm & Đề Xuất Giảm Chi Phí',
    durationMinutes: 80,
    participantsCount: 29800,
    commentsCount: 36,
    partsCount: 8,
    questionsCount: 19,
    tags: ['#TOEIC_SW', '#SPEAKING', '#WRITING', '#TEST_9'],
    baseTestSetId: 'test-1',
    targetBand: '180 - 200 (Band 8)',
    difficulty: 'Nâng cao'
  },
  {
    id: 'sw-c1-t10',
    category: 'SW',
    collection: 'TOEIC SW Collection 1',
    title: 'TOEIC SW Collection 1 Test 10',
    subtitle: 'Quy Trình Đào Tạo Nhân Viên Mới & Thư Phàn Nàn Dịch Vụ Khách Hàng',
    durationMinutes: 80,
    participantsCount: 27500,
    commentsCount: 33,
    partsCount: 8,
    questionsCount: 19,
    tags: ['#TOEIC_SW', '#SPEAKING', '#WRITING', '#TEST_10'],
    baseTestSetId: 'test-1',
    targetBand: '180 - 200 (Band 8)',
    difficulty: 'Nâng cao'
  },
  {
    id: 'sw-c1-t11',
    category: 'SW',
    collection: 'TOEIC SW Collection 1',
    title: 'TOEIC SW Collection 1 Test 11',
    subtitle: 'Tổ Chức Hội Thảo Khách Hàng Thường Niên & Báo Cáo Doanh Thu Quý',
    durationMinutes: 80,
    participantsCount: 24300,
    commentsCount: 29,
    partsCount: 8,
    questionsCount: 19,
    tags: ['#TOEIC_SW', '#SPEAKING', '#WRITING', '#TEST_11'],
    baseTestSetId: 'test-1',
    targetBand: '180 - 200 (Band 8)',
    difficulty: 'Nâng cao'
  },
  {
    id: 'sw-c1-t12',
    category: 'SW',
    collection: 'TOEIC SW Collection 1',
    title: 'TOEIC SW Collection 1 Test 12',
    subtitle: 'Đánh Giá Hiệu Quả Làm Việc Nhóm & Đề Xuất Cải Tiến Quy Trình',
    durationMinutes: 80,
    participantsCount: 22100,
    commentsCount: 26,
    partsCount: 8,
    questionsCount: 19,
    tags: ['#TOEIC_SW', '#SPEAKING', '#WRITING', '#TEST_12'],
    baseTestSetId: 'test-1',
    targetBand: '180 - 200 (Band 8)',
    difficulty: 'Nâng cao'
  },
  {
    id: 'sw-c1-t13',
    category: 'SW',
    collection: 'TOEIC SW Collection 1',
    title: 'TOEIC SW Collection 1 Test 13',
    subtitle: 'Tiếp Thị Kỹ Thuật Số (Digital Marketing) & Email Xin Tài Trợ Sự Kiện',
    durationMinutes: 80,
    participantsCount: 19800,
    commentsCount: 22,
    partsCount: 8,
    questionsCount: 19,
    tags: ['#TOEIC_SW', '#SPEAKING', '#WRITING', '#TEST_13'],
    baseTestSetId: 'test-1',
    targetBand: '180 - 200 (Band 8)',
    difficulty: 'Chuyên gia'
  },
  {
    id: 'sw-c1-t14',
    category: 'SW',
    collection: 'TOEIC SW Collection 1',
    title: 'TOEIC SW Collection 1 Test 14',
    subtitle: 'Quản Trị Khủng Hoảng Truyền Thông & Thuyết Phục Ban Giám Đốc Phê Duyệt',
    durationMinutes: 80,
    participantsCount: 17500,
    commentsCount: 19,
    partsCount: 8,
    questionsCount: 19,
    tags: ['#TOEIC_SW', '#SPEAKING', '#WRITING', '#TEST_14'],
    baseTestSetId: 'test-1',
    targetBand: '180 - 200 (Band 8)',
    difficulty: 'Chuyên gia'
  },
  {
    id: 'sw-c1-t15',
    category: 'SW',
    collection: 'TOEIC SW Collection 1',
    title: 'TOEIC SW Collection 1 Test 15',
    subtitle: 'Chiến Lược Mở Rộng Thị Trường Quốc Tế & Bài Luận Lãnh Đạo Toàn Cầu',
    durationMinutes: 80,
    participantsCount: 15400,
    commentsCount: 16,
    partsCount: 8,
    questionsCount: 19,
    tags: ['#TOEIC_SW', '#SPEAKING', '#WRITING', '#TEST_15'],
    baseTestSetId: 'test-1',
    targetBand: '180 - 200 (Band 8)',
    difficulty: 'Chuyên gia'
  },

  // ==================== PARROTO TOEIC 2024 (10 FULL TESTS) ====================
  ...Array.from({ length: 10 }, (_, i) => ({
    id: `toeic-2024-test-${i + 1}`,
    category: 'LR',
    collection: 'Bộ Đề TOEIC 2024 (Parroto)',
    title: `TOEIC 2024 - Test ${i + 1}`,
    subtitle: 'Đề Thi Chuẩn Định Dạng ETS Mới Nhất • Full 200 câu song ngữ Anh - Việt có audio gốc',
    durationMinutes: 120,
    participantsCount: 420000 + i * 3500,
    commentsCount: 380 + i * 14,
    partsCount: 7,
    questionsCount: 200,
    tags: ['#TOEIC', '#LR', '#TOEIC_2024', `#TEST_${i + 1}`],
    targetBand: '750 - 990',
    difficulty: i < 5 ? 'Tiêu chuẩn' : 'Nâng cao'
  })),

  // ==================== PARROTO TOEIC 2026 (10 FULL TESTS) ====================
  ...Array.from({ length: 10 }, (_, i) => ({
    id: `toeic-2026-test-${i + 1}`,
    category: 'LR',
    collection: 'Bộ Đề TOEIC 2026 (Parroto)',
    title: `TOEIC 2026 - Test ${i + 1}`,
    subtitle: 'Đề Dự Đoán & Luyện Thi Chuyên Sâu 2026 • Full 200 câu Audio MP3 bản quyền',
    durationMinutes: 120,
    participantsCount: 310000 + i * 2800,
    commentsCount: 290 + i * 12,
    partsCount: 7,
    questionsCount: 200,
    tags: ['#TOEIC', '#LR', '#TOEIC_2026', `#TEST_${i + 1}`],
    targetBand: '750 - 990',
    difficulty: 'Nâng cao'
  })),

  // ==================== PARROTO TOEIC 2023 (10 FULL TESTS) ====================
  ...Array.from({ length: 10 }, (_, i) => ({
    id: `toeic-2023-test-${i + 1}`,
    category: 'LR',
    collection: 'Bộ Đề TOEIC 2023 (Parroto)',
    title: `TOEIC 2023 - Test ${i + 1}`,
    subtitle: 'Đề Thi Thật ETS 2023 Chuẩn Quốc Tế • Full 200 câu giải thích chi tiết',
    durationMinutes: 120,
    participantsCount: 480000 + i * 4100,
    commentsCount: 420 + i * 16,
    partsCount: 7,
    questionsCount: 200,
    tags: ['#TOEIC', '#LR', '#TOEIC_2023', `#TEST_${i + 1}`],
    targetBand: '650 - 850',
    difficulty: 'Tiêu chuẩn'
  })),

  // ==================== PARROTO TOEIC PRACTICE VOL. 1 (10 FULL TESTS) ====================
  ...Array.from({ length: 10 }, (_, i) => ({
    id: `parroto-toeic-vol-1-test-${i + 1}`,
    category: 'LR',
    collection: 'Parroto TOEIC Vol. 1',
    title: `Parroto TOEIC Vol. 1 - Test ${i + 1}`,
    subtitle: 'Bộ Đề Luyện Thi Thực Chiến Parroto Vol. 1 • 7 Phần chuẩn ETS kèm Transcript & Dịch',
    durationMinutes: 120,
    participantsCount: 250000 + i * 2200,
    commentsCount: 210 + i * 9,
    partsCount: 7,
    questionsCount: 200,
    tags: ['#TOEIC', '#LR', '#PARROTO_VOL_1', `#TEST_${i + 1}`],
    targetBand: '650 - 900',
    difficulty: 'Tiêu chuẩn'
  }))
];
