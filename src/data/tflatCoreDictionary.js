/**
 * TFlat Core English-Vietnamese Dictionary Dataset
 * Instant offline definitions, phonetics, parts of speech, collocations, and bilingual examples.
 */

export const TFLAT_CORE_DICTIONARY = {
  university: {
    word: 'university',
    ipaUk: '/ˌjuːnɪˈvɜːsəti/',
    ipaUs: '/ˌjuːnəˈvɝːsəti/',
    audioUk: 'https://api.dictionaryapi.dev/media/pronunciations/en/university-uk.mp3',
    audioUs: 'https://api.dictionaryapi.dev/media/pronunciations/en/university-us.mp3',
    meaningVi: 'Trường đại học, viện đại học',
    partOfSpeech: 'noun',
    partsOfSpeech: [
      {
        pos: 'noun',
        posVi: 'Danh từ',
        meanings: [
          'Trường đại học, viện đại học (cơ sở giáo dục bậc cao cấp bằng cử nhân, thạc sĩ, tiến sĩ)',
          '(Từ cổ) Toàn thể giáo sư và sinh viên của một trường đại học'
        ]
      },
      {
        pos: 'adjective',
        posVi: 'Tính từ (bổ ngữ)',
        meanings: [
          'Thuộc về trường đại học (university degree: bằng đại học, university student: sinh viên đại học)'
        ]
      }
    ],
    collocations: [
      'attend university (theo học đại học)',
      'university degree (bằng đại học)',
      'university graduate (người tốt nghiệp đại học)',
      'top-tier university (trường đại học danh tiếng hàng đầu)',
      'enter a university (thi đỗ/nhập học vào đại học)'
    ],
    examples: [
      {
        en: 'She studied computer science at a prestigious university in the UK.',
        vi: 'Cô ấy học khoa học máy tính tại một trường đại học danh tiếng ở Anh Quốc.',
        context: 'Giáo dục & Tuyển dụng'
      },
      {
        en: 'The company actively recruits top talent directly from leading universities.',
        vi: 'Công ty chủ động tuyển dụng các nhân tài hàng đầu trực tiếp từ các trường đại học lớn.',
        context: 'Doanh nghiệp & Nhân sự'
      }
    ],
    synonyms: ['college', 'academy', 'institute', 'higher education institution'],
    antonyms: []
  },
  bottleneck: {
    word: 'bottleneck',
    ipaUk: '/ˈbɒtlnek/',
    ipaUs: '/ˈbɑːtlnek/',
    meaningVi: 'Điểm nghẽn, nút thắt cổ chai cản trở tiến độ',
    partOfSpeech: 'noun',
    partsOfSpeech: [
      {
        pos: 'noun',
        posVi: 'Danh từ',
        meanings: [
          'Nút thắt cổ chai, điểm nghẽn (nơi dòng chảy công việc hoặc giao thông bị ách tắc)',
          'Khâu trì trệ làm chậm tiến độ của toàn bộ hệ thống hoặc dự án'
        ]
      },
      {
        pos: 'verb',
        posVi: 'Động từ',
        meanings: [
          'Gây ách tắc, dồn ứ làm chậm trễ tiến trình'
        ]
      }
    ],
    collocations: [
      'identify a bottleneck (xác định điểm nghẽn)',
      'production bottleneck (nút thắt trong sản xuất)',
      'eliminate bottlenecks (loại bỏ các điểm nghẽn)',
      'bottleneck in the approval process (nút thắt trong quy trình phê duyệt)'
    ],
    examples: [
      {
        en: 'Code reviews became a major bottleneck before we established clear SLA guidelines.',
        vi: 'Việc duyệt code đã trở thành điểm nghẽn lớn trước khi chúng tôi thiết lập bộ quy chuẩn thời gian phản hồi rõ ràng.',
        context: 'DevOps & Kỹ thuật'
      },
      {
        en: 'We need to automate manual QA testing to resolve this workflow bottleneck.',
        vi: 'Chúng ta cần tự động hóa quy trình kiểm thử thủ công để giải quyết điểm nghẽn trong luồng công việc này.',
        context: 'Quản lý Dự án'
      }
    ],
    synonyms: ['obstacle', 'impediment', 'choke point', 'hurdle', 'blockage'],
    antonyms: ['catalyst', 'accelerator', 'smooth flow']
  },
  streamline: {
    word: 'streamline',
    ipaUk: '/ˈstriːmlaɪn/',
    ipaUs: '/ˈstriːmlaɪn/',
    meaningVi: 'Tối ưu hóa, tinh giản quy trình để tăng hiệu quả',
    partOfSpeech: 'verb',
    partsOfSpeech: [
      {
        pos: 'verb',
        posVi: 'Động từ',
        meanings: [
          'Tối ưu hóa, tinh giản (tổ chức, quy trình sản xuất, công việc) để hoạt động hiệu quả và tiết kiệm chi phí hơn',
          'Tạo dáng khí động học (cho xe cộ, tàu bay để lướt êm hơn)'
        ]
      },
      {
        pos: 'adjective',
        posVi: 'Tính từ',
        meanings: [
          'Có hình dáng khí động học, thon gọn'
        ]
      }
    ],
    collocations: [
      'streamline the process (tinh giản quy trình)',
      'streamline operations (tối ưu hóa vận hành)',
      'streamline workflow (tinh gọn luồng công việc)',
      'streamline communication (tối ưu hóa luồng trao đổi thông tin)'
    ],
    examples: [
      {
        en: 'Adopting the new Jira workflow helped streamline our sprint planning significantly.',
        vi: 'Việc áp dụng quy trình Jira mới đã giúp tinh giản đáng kể khâu lập kế hoạch sprint của chúng tôi.',
        context: 'Agile & Vận hành'
      },
      {
        en: 'The management is looking for ways to streamline administrative procedures.',
        vi: 'Ban lãnh đạo đang tìm kiếm các giải pháp để tinh gọn các thủ tục hành chính.',
        context: 'Quản trị Doanh nghiệp'
      }
    ],
    synonyms: ['optimize', 'simplify', 'rationalize', 'make efficient'],
    antonyms: ['complicate', 'hinder', 'obstruct']
  },
  feasibility: {
    word: 'feasibility',
    ipaUk: '/ˌfiːzəˈbɪləti/',
    ipaUs: '/ˌfiːzəˈbɪləti/',
    meaningVi: 'Tính khả thi, khả năng thực hiện thành công của dự án',
    partOfSpeech: 'noun',
    partsOfSpeech: [
      {
        pos: 'noun',
        posVi: 'Danh từ',
        meanings: [
          'Tính khả thi, khả năng thực hiện được trong thực tế của một dự án hoặc giải pháp',
          'Sự tiện lợi, tính xác đáng'
        ]
      }
    ],
    collocations: [
      'feasibility study (nghiên cứu khả thi)',
      'economic feasibility (tính khả thi về mặt kinh tế)',
      'assess the feasibility (đánh giá tính khả thi)',
      'technical feasibility (tính khả thi về công nghệ)'
    ],
    examples: [
      {
        en: 'We must conduct a thorough feasibility study before committing the annual budget.',
        vi: 'Chúng ta phải tiến hành một nghiên cứu khả thi kỹ lưỡng trước khi giải ngân ngân sách cả năm.',
        context: 'Lập Kế Hoạch & Tài Chính'
      }
    ],
    synonyms: ['viability', 'practicability', 'workability'],
    antonyms: ['impracticability', 'unfeasibility']
  },
  consensus: {
    word: 'consensus',
    ipaUk: '/kənˈsensəs/',
    ipaUs: '/kənˈsensəs/',
    meaningVi: 'Sự đồng thuận, nhất trí chung giữa các bên',
    partOfSpeech: 'noun',
    partsOfSpeech: [
      {
        pos: 'noun',
        posVi: 'Danh từ',
        meanings: [
          'Sự đồng lòng, sự nhất trí, sự đồng thuận của tập thể'
        ]
      }
    ],
    collocations: [
      'reach a consensus (đạt được sự đồng thuận)',
      'general consensus (sự đồng thuận chung)',
      'build a consensus (xây dựng sự đồng thuận)',
      'consensus among stakeholders (sự nhất trí giữa các bên liên quan)'
    ],
    examples: [
      {
        en: 'After hours of discussion, the executive committee finally reached a consensus.',
        vi: 'Sau nhiều giờ thảo luận, ban điều hành cuối cùng đã đạt được sự đồng thuận.',
        context: 'Họp Điều Hành'
      }
    ],
    synonyms: ['agreement', 'harmony', 'accord', 'unanimity'],
    antonyms: ['disagreement', 'conflict', 'dissent']
  },
  mitigate: {
    word: 'mitigate',
    ipaUk: '/ˈmɪtɪɡeɪt/',
    ipaUs: '/ˈmɪt̬əɡeɪt/',
    meaningVi: 'Giảm thiểu, xoa dịu mức độ rủi ro hoặc thiệt hại',
    partOfSpeech: 'verb',
    partsOfSpeech: [
      {
        pos: 'verb',
        posVi: 'Động từ',
        meanings: [
          'Giảm bớt, làm nhẹ bớt, làm dịu bớt (nỗi đau, sự nguy hiểm, thiệt hại, rủi ro)'
        ]
      }
    ],
    collocations: [
      'mitigate risk (giảm thiểu rủi ro)',
      'mitigate impact (giảm thiểu tác động tiêu cực)',
      'mitigate the effects of inflation (xoa dịu ảnh hưởng của lạm phát)'
    ],
    examples: [
      {
        en: 'We prepared a fallback server deployment to mitigate the risk of downtime.',
        vi: 'Chúng tôi đã chuẩn bị máy chủ dự phòng để giảm thiểu rủi ro gián đoạn dịch vụ.',
        context: 'Hạ Tầng & CNTT'
      }
    ],
    synonyms: ['alleviate', 'reduce', 'diminish', 'lessen', 'cushion'],
    antonyms: ['aggravate', 'exacerbate', 'worsen']
  },
  proactive: {
    word: 'proactive',
    ipaUk: '/ˌprəʊˈæktɪv/',
    ipaUs: '/ˌproʊˈæktɪv/',
    meaningVi: 'Chủ động hành động đón đầu thay vì chỉ phản ứng thụ động',
    partOfSpeech: 'adjective',
    partsOfSpeech: [
      {
        pos: 'adjective',
        posVi: 'Tính từ',
        meanings: [
          'Chủ động, đón đầu (hành động trước để giải quyết vấn đề trước khi nó xảy ra thay vì chỉ phản ứng lại sau)'
        ]
      }
    ],
    collocations: [
      'proactive approach (cách tiếp cận chủ động)',
      'take a proactive role (đảm nhận vai trò chủ động)',
      'proactive customer support (hỗ trợ khách hàng chủ động)',
      'proactive measures (các biện pháp chủ động)'
    ],
    examples: [
      {
        en: 'A proactive approach to customer feedback helps us prevent churn early.',
        vi: 'Cách tiếp cận chủ động đối với phản hồi của khách hàng giúp chúng tôi ngăn chặn tình trạng rời bỏ dịch vụ từ sớm.',
        context: 'Chăm Sóc Khách Hàng'
      }
    ],
    synonyms: ['forward-looking', 'enterprising', 'preventive', 'anticipatory'],
    antonyms: ['reactive', 'passive']
  },
  redundant: {
    word: 'redundant',
    ipaUk: '/rɪˈdʌndənt/',
    ipaUs: '/rɪˈdʌndənt/',
    meaningVi: 'Dư thừa, lặp lại không cần thiết; (HR) bị sa thải vì giảm biên chế',
    partOfSpeech: 'adjective',
    partsOfSpeech: [
      {
        pos: 'adjective',
        posVi: 'Tính từ',
        meanings: [
          'Thừa, dư thừa, lặp lại không cần thiết (lời nói, thiết bị)',
          '(Anh - Anh, Nhân sự) Bị sa thải, mất việc do công ty thu hẹp biên chế hoặc vị trí đó không còn cần thiết',
          '(Kỹ thuật) Có cơ chế dự phòng (redundant power supply: nguồn điện dự phòng)'
        ]
      }
    ],
    collocations: [
      'make someone redundant (cho ai đó nghỉ việc vì giảm biên chế)',
      'redundant code (đoạn mã dư thừa)',
      'redundant data (dữ liệu trùng lặp)',
      'redundant systems (hệ thống dự phòng an toàn)'
    ],
    examples: [
      {
        en: 'Refactoring this legacy module removed hundreds of lines of redundant code.',
        vi: 'Tái cấu trúc module cũ này đã loại bỏ hàng trăm dòng code dư thừa.',
        context: 'Phát Triển Phần Mềm'
      }
    ],
    synonyms: ['superfluous', 'unnecessary', 'excess', 'duplicate'],
    antonyms: ['essential', 'indispensable', 'vital']
  },
  leverage: {
    word: 'leverage',
    ipaUk: '/ˈliːvərɪdʒ/',
    ipaUs: '/ˈlevərɪdʒ/',
    meaningVi: 'Tận dụng tối đa đòn bẩy hoặc nguồn lực sẵn có; (Tài chính) đòn bẩy tài chính',
    partOfSpeech: 'verb',
    partsOfSpeech: [
      {
        pos: 'noun',
        posVi: 'Danh từ',
        meanings: [
          'Tác dụng đòn bẩy, lực đòn bẩy',
          'Sức mạnh, tầm ảnh hưởng có thể dùng để đạt được kết quả mong muốn',
          '(Tài chính) Việc dùng vốn vay để đầu tư sinh lời'
        ]
      },
      {
        pos: 'verb',
        posVi: 'Động từ',
        meanings: [
          'Tận dụng triệt để (nguồn lực, công nghệ, mối quan hệ) để tạo lợi thế cạnh tranh tối đa'
        ]
      }
    ],
    collocations: [
      'leverage technology (tận dụng công nghệ)',
      'leverage resources (tận dụng nguồn lực)',
      'financial leverage (đòn bẩy tài chính)',
      'leverage synergy (tận dụng hiệu ứng cộng hưởng)'
    ],
    examples: [
      {
        en: 'We should leverage AI automation to cut down manual paperwork for our sales team.',
        vi: 'Chúng ta nên tận dụng tự động hóa bằng AI để cắt giảm giấy tờ thủ công cho đội ngũ kinh doanh.',
        context: 'Chiến Lược Công Nghệ'
      }
    ],
    synonyms: ['utilize', 'capitalize on', 'harness', 'exploit', 'maximize'],
    antonyms: ['waste', 'underutilize', 'ignore']
  },
  benchmark: {
    word: 'benchmark',
    ipaUk: '/ˈbentʃmɑːk/',
    ipaUs: '/ˈbentʃmɑːrk/',
    meaningVi: 'Tiêu chuẩn so sánh, cột mốc chuẩn mực để đánh giá hiệu suất',
    partOfSpeech: 'noun',
    partsOfSpeech: [
      {
        pos: 'noun',
        posVi: 'Danh từ',
        meanings: [
          'Tiêu chuẩn so sánh, điểm chuẩn (cột mốc chuẩn mực dùng để đối chiếu và đánh giá chất lượng hoặc hiệu quả)'
        ]
      },
      {
        pos: 'verb',
        posVi: 'Động từ',
        meanings: [
          'Đo điểm chuẩn, đem ra so sánh với chuẩn mực của đối thủ hoặc tiêu chuẩn ngành'
        ]
      }
    ],
    collocations: [
      'industry benchmark (chuẩn mực trong ngành)',
      'set a benchmark (thiết lập chuẩn mực)',
      'performance benchmark (chỉ số hiệu năng tham chiếu)',
      'benchmark against competitors (so sánh điểm chuẩn với đối thủ)'
    ],
    examples: [
      {
        en: 'This quarter, our app load speed serves as the new performance benchmark in the market.',
        vi: 'Trong quý này, tốc độ tải ứng dụng của chúng tôi đóng vai trò là chuẩn mực hiệu năng mới trên thị trường.',
        context: 'Sản Phẩm & Hiệu Năng'
      }
    ],
    synonyms: ['standard', 'yardstick', 'criterion', 'touchstone'],
    antonyms: []
  }
};
