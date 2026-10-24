/**
 * TOEIC Real-World Workplace Test Prep Dataset
 * Part 5: Incomplete Sentences (Word Forms, Prepositions, Grammar, Vocab)
 * Part 2: Question - Response (Listening Reflexes & Traps)
 * 600 Essential TOEIC Business Words across 10 Core Topics
 */

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
  },
  {
    id: 'p5-9',
    category: 'Từ vựng công sở (Business Vocab)',
    difficulty: '650+',
    question: 'The warranty coverage will be considered _______ if the product is opened by an unauthorized technician.',
    options: ['void', 'vague', 'vacant', 'valuable'],
    correctIndex: 0,
    translation: 'Phạm vi bảo hành sẽ bị coi là vô hiệu nếu sản phẩm bị mở ra bởi kỹ thuật viên không được ủy quyền.',
    explanation: 'Trong hợp đồng và bảo hành, "void" (vô hiệu, không còn giá trị pháp lý) là thuật ngữ chuẩn. "Vague" (mơ hồ), "Vacant" (trống rỗng/bỏ trống), "Valuable" (quý giá).',
    trapAlert: 'Thuật ngữ pháp lý kinh điển: "null and void" (vô hiệu lực).',
    keyVocabulary: [
      { word: 'Warranty', pos: 'noun', meaningVi: 'Phiếu bảo hành, cam kết bảo hành' },
      { word: 'Void', pos: 'adj', meaningVi: 'Vô hiệu, hết hiệu lực' },
      { word: 'Unauthorized', pos: 'adj', meaningVi: 'Chưa được cấp phép, trái phép' }
    ]
  },
  {
    id: 'p5-10',
    category: 'Liên từ & Giới từ (Conjunctions)',
    difficulty: '650+',
    question: 'Neither the department supervisor _______ the senior associates were aware of the revised deadline.',
    options: ['nor', 'or', 'and', 'but'],
    correctIndex: 0,
    translation: 'Cả người giám sát bộ phận lẫn các cộng sự cấp cao đều không biết về thời hạn chót đã được sửa đổi.',
    explanation: 'Cặp liên từ tương quan cố định: "Neither ... NOR ..." (Cả hai đều không). Tương tự: "Either ... OR ...", "Both ... AND ...", "Not only ... BUT ALSO ...".',
    trapAlert: 'Bẫy nhầm lẫn giữa Neither...nor và Either...or.',
    keyVocabulary: [
      { word: 'Neither...nor', pos: 'conjunction', meaningVi: 'Không... cũng không...' },
      { word: 'Supervisor', pos: 'noun', meaningVi: 'Người giám sát' },
      { word: 'Aware of', pos: 'adj', meaningVi: 'Nhận biết, hay biết về' }
    ]
  },
  {
    id: 'p5-11',
    category: 'Từ loại (Word Form)',
    difficulty: '650+',
    question: 'The marketing campaign proved to be _______ successful in increasing brand awareness across Southeast Asia.',
    options: ['remarkable', 'remarkably', 'remarked', 'remarking'],
    correctIndex: 1,
    translation: 'Chiến dịch tiếp thị đã chứng minh là thành công một cách đáng kinh ngạc trong việc nâng cao độ nhận diện thương hiệu khắp Đông Nam Á.',
    explanation: '"successful" là một tính từ. Bổ nghĩa cho tính từ phải là một TRẠNG TỪ (Adverb). Đáp án đúng là "remarkably" (một cách đáng kể, vượt trội).',
    trapAlert: 'Quy tắc vị trí từ: Trạng từ đứng trước Tính từ để bổ nghĩa (Adv + Adj + Noun).',
    keyVocabulary: [
      { word: 'Remarkably', pos: 'adv', meaningVi: 'Đáng chú ý, một cách xuất sắc' },
      { word: 'Brand awareness', pos: 'noun', meaningVi: 'Độ nhận diện thương hiệu' }
    ]
  },
  {
    id: 'p5-12',
    category: 'Từ vựng công sở (Business Vocab)',
    difficulty: '800+',
    question: 'All confidential files are stored in a _______ server room accessible only with biometric credentials.',
    options: ['secure', 'hesitant', 'tentative', 'temporary'],
    correctIndex: 0,
    translation: 'Tất cả các tập tin mật được lưu trữ trong một phòng máy chủ an toàn chỉ có thể truy cập được bằng thông tin sinh trắc học.',
    explanation: '"Secure" (an toàn, bảo mật cao) là tính từ phù hợp nhất cho phòng máy chủ chứa tài liệu mật. "Tentative" (tạm thời/chưa chắc chắn), "Hesitant" (ngập ngừng).',
    trapAlert: 'Collocation CNTT & Bảo mật công sở: "secure server / secure environment".',
    keyVocabulary: [
      { word: 'Confidential', pos: 'adj', meaningVi: 'Bảo mật, tuyệt mật' },
      { word: 'Biometric credentials', pos: 'noun', meaningVi: 'Dữ liệu xác thực sinh trắc học' }
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
    category: 'Câu hỏi Lời mời & Đề xuất (Suggestions)',
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
];

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
