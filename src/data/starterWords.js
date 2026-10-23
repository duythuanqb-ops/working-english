/**
 * Initial Starter Vocabulary: Curated high-impact words for professional & business English
 */

export const INITIAL_WORDS = [
  {
    id: "word-1",
    word: "Consensus",
    ipa: "/kənˈsen.səs/",
    partOfSpeech: "noun",
    meaningVi: "Sự đồng thuận, nhất trí chung giữa các bên",
    meaningEn: "A general agreement about something, especially among a group of people.",
    examples: [
      {
        en: "After hours of heated discussion, the executive committee finally reached a consensus.",
        vi: "Sau nhiều giờ thảo luận sôi nổi, ban điều hành cuối cùng đã đạt được sự đồng thuận.",
        context: "Meeting & Decision Making"
      },
      {
        en: "There is still no broad consensus on how to allocate the remaining quarterly budget.",
        vi: "Vẫn chưa có sự đồng thuận rộng rãi về cách phân bổ phần ngân sách quý còn lại.",
        context: "Financial Planning"
      }
    ],
    synonyms: ["Agreement", "Accord", "Concurrence", "Harmony", "Unanimity"],
    antonyms: ["Disagreement", "Conflict", "Dissent"],
    collocations: ["Reach a consensus", "Broad consensus", "Build a consensus"],
    box: 1,
    reviewCount: 2,
    correctCount: 2,
    dateAdded: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
    lastReviewed: new Date().toISOString(),
    tags: ["Meeting", "Management", "Business"]
  },
  {
    id: "word-2",
    word: "Mitigate",
    ipa: "/ˈmɪt.ɪ.ɡeɪt/",
    partOfSpeech: "verb",
    meaningVi: "Giảm thiểu mức độ nghiêm trọng, xoa dịu rủi ro hoặc thiệt hại",
    meaningEn: "To make something less harmful, unpleasant, or bad.",
    examples: [
      {
        en: "We need proactive measures to mitigate potential cybersecurity risks in cloud storage.",
        vi: "Chúng ta cần các biện pháp chủ động để giảm thiểu rủi ro an ninh mạng tiềm ẩn trong lưu trữ đám mây.",
        context: "Risk Management"
      },
      {
        en: "Multi-region server deployment helps mitigate the impact of sudden network outages.",
        vi: "Việc triển khai máy chủ đa khu vực giúp giảm thiểu tác động của sự cố mất mạng đột ngột.",
        context: "DevOps & Infrastructure"
      }
    ],
    synonyms: ["Alleviate", "Lessen", "Reduce", "Diminish", "Ease"],
    antonyms: ["Aggravate", "Exacerbate", "Intensify"],
    collocations: ["Mitigate risks", "Mitigate the impact", "Mitigate losses"],
    box: 2,
    reviewCount: 3,
    correctCount: 3,
    dateAdded: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
    lastReviewed: new Date().toISOString(),
    tags: ["Risk", "Strategy", "Tech"]
  },
  {
    id: "word-3",
    word: "Streamline",
    ipa: "/ˈstriːm.laɪn/",
    partOfSpeech: "verb",
    meaningVi: "Tối ưu hóa, tinh gọn quy trình để tăng hiệu quả và tiết kiệm thời gian",
    meaningEn: "To improve the effectiveness of an organization or process by eliminating redundant steps.",
    examples: [
      {
        en: "The automation tool allowed us to streamline our customer onboarding workflow significantly.",
        vi: "Công cụ tự động hóa đã cho phép chúng tôi tinh gọn quy trình tiếp nhận khách hàng một cách đáng kể.",
        context: "Process Optimization"
      },
      {
        en: "We are actively seeking ways to streamline the procurement process before next quarter.",
        vi: "Chúng tôi đang tích cực tìm kiếm giải pháp để tinh gọn quy trình thu mua trước quý tới.",
        context: "Operations"
      }
    ],
    synonyms: ["Optimize", "Simplify", "Restructure", "Expedite"],
    antonyms: ["Complicate", "Obstruct", "Delay"],
    collocations: ["Streamline workflow", "Streamline operations", "Streamline communications"],
    box: 1,
    reviewCount: 1,
    correctCount: 1,
    dateAdded: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
    lastReviewed: new Date().toISOString(),
    tags: ["Productivity", "Operations", "Workplace"]
  },
  {
    id: "word-4",
    word: "Discrepancy",
    ipa: "/dɪˈskrep.ən.si/",
    partOfSpeech: "noun",
    meaningVi: "Sự sai lệch, không nhất quán giữa hai hoặc nhiều số liệu/thông tin",
    meaningEn: "A difference between two things that should be the same.",
    examples: [
      {
        en: "The auditor discovered a significant discrepancy between the invoice amount and bank balance.",
        vi: "Kiểm toán viên đã phát hiện một sự sai lệch đáng kể giữa số tiền trên hóa đơn và số dư ngân hàng.",
        context: "Finance & Accounting"
      },
      {
        en: "There was a slight discrepancy in the test logs, which prompted our tech lead to investigate.",
        vi: "Đã có một sự sai lệch nhỏ trong nhật ký kiểm thử, khiến trưởng nhóm kỹ thuật phải điều tra.",
        context: "Software Testing"
      }
    ],
    synonyms: ["Inconsistency", "Divergence", "Mismatch", "Variance"],
    antonyms: ["Consistency", "Concurrence", "Correspondence"],
    collocations: ["Notice a discrepancy", "Explain a discrepancy", "Resolve a discrepancy"],
    box: 3,
    reviewCount: 4,
    correctCount: 4,
    dateAdded: new Date(Date.now() - 8 * 24 * 3600 * 1000).toISOString(),
    lastReviewed: new Date().toISOString(),
    tags: ["Finance", "Quality Control", "Audit"]
  },
  {
    id: "word-5",
    word: "Feasibility",
    ipa: "/ˌfiː.zəˈbɪl.ə.ti/",
    partOfSpeech: "noun",
    meaningVi: "Tính khả thi, khả năng thực hiện thành công của một dự án hoặc giải pháp",
    meaningEn: "The possibility that something can be made, done, or achieved successfully.",
    examples: [
      {
        en: "Before greenlighting the investment, the board requested a thorough feasibility study.",
        vi: "Trước khi phê duyệt khoản đầu tư, hội đồng quản trị đã yêu cầu một nghiên cứu khả thi toàn diện.",
        context: "Project Management"
      },
      {
        en: "We are currently assessing the technical feasibility of migrating to a microservices architecture.",
        vi: "Chúng tôi hiện đang đánh giá tính khả thi về mặt kỹ thuật của việc chuyển sang kiến trúc microservices.",
        context: "Engineering Roadmap"
      }
    ],
    synonyms: ["Viability", "Practicability", "Workability", "Plausibility"],
    antonyms: ["Impossibility", "Impracticability"],
    collocations: ["Feasibility study", "Technical feasibility", "Assess feasibility"],
    box: 2,
    reviewCount: 2,
    correctCount: 2,
    dateAdded: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString(),
    lastReviewed: new Date().toISOString(),
    tags: ["Strategy", "Project Management", "Tech"]
  },
  {
    id: "word-6",
    word: "Leverage",
    ipa: "/ˈliː.vɚ.ɪdʒ/",
    partOfSpeech: "verb",
    meaningVi: "Tận dụng tối đa đòn bẩy hoặc nguồn lực sẵn có để đạt kết quả tốt nhất",
    meaningEn: "To use something that you already have in order to achieve something new or better.",
    examples: [
      {
        en: "We can leverage our existing partner network to distribute the new mobile application.",
        vi: "Chúng ta có thể tận dụng mạng lưới đối tác hiện có để phân phối ứng dụng di động mới.",
        context: "Business Development"
      },
      {
        en: "Engineers should leverage AI code completion to boost daily sprint velocity.",
        vi: "Các kỹ sư nên tận dụng công cụ gợi ý mã nguồn AI để tăng tốc độ phát triển trong sprint.",
        context: "Engineering Velocity"
      }
    ],
    synonyms: ["Utilize", "Exploit", "Capitalize on", "Harness"],
    antonyms: ["Underutilize", "Waste"],
    collocations: ["Leverage resources", "Leverage technology", "Leverage strengths"],
    box: 4,
    reviewCount: 5,
    correctCount: 5,
    dateAdded: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
    lastReviewed: new Date().toISOString(),
    tags: ["Strategy", "Business", "Productivity"]
  },
  {
    id: "word-7",
    word: "Bottleneck",
    ipa: "/ˈbɑː.t̬əl.nek/",
    partOfSpeech: "noun",
    meaningVi: "Điểm nghẽn, nút thắt cổ chai cản trở tiến độ của cả quy trình",
    meaningEn: "A problem, delay, or place where progress is blocked or slowed down.",
    examples: [
      {
        en: "Code reviews became a major bottleneck before we established clear SLA guidelines.",
        vi: "Việc duyệt code đã trở thành điểm nghẽn lớn trước khi chúng tôi thiết lập SLA rõ ràng.",
        context: "DevOps Workflow"
      }
    ],
    synonyms: ["Obstacle", "Impediment", "Choke point", "Hurdle"],
    antonyms: ["Catalyst", "Aid"],
    collocations: ["Identify a bottleneck", "Clear a bottleneck", "Production bottleneck"],
    box: 1,
    reviewCount: 1,
    correctCount: 0,
    dateAdded: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
    lastReviewed: null,
    tags: ["Operations", "Tech", "Management"]
  },
  {
    id: "word-8",
    word: "Pivotal",
    ipa: "/ˈpɪv.ə.t̬əl/",
    partOfSpeech: "adj",
    meaningVi: "Mang tính then chốt, bước ngoặt định đoạt thành bại",
    meaningEn: "Crucial; having a very important effect on what happens in the future.",
    examples: [
      {
        en: "Securing this strategic partnership played a pivotal role in our European expansion.",
        vi: "Việc ký kết đối tác chiến lược này đóng vai trò then chốt trong kế hoạch mở rộng sang châu Âu.",
        context: "Strategic Expansion"
      }
    ],
    synonyms: ["Crucial", "Vital", "Decisive", "Momentous"],
    antonyms: ["Insignificant", "Minor", "Trivial"],
    collocations: ["Pivotal role", "Pivotal moment", "Pivotal decision"],
    box: 5,
    reviewCount: 8,
    correctCount: 8,
    dateAdded: new Date(Date.now() - 20 * 24 * 3600 * 1000).toISOString(),
    lastReviewed: new Date().toISOString(),
    tags: ["Strategy", "Management"]
  },
  {
    id: "word-9",
    word: "Redundant",
    ipa: "/rɪˈdʌn.dənt/",
    partOfSpeech: "adj",
    meaningVi: "Dư thừa, lặp lại không cần thiết hoặc dự phòng an toàn",
    meaningEn: "Unnecessary because it is more than is needed, or duplicated for safety backup.",
    examples: [
      {
        en: "We eliminated redundant approval layers to speed up customer refunds.",
        vi: "Chúng tôi đã loại bỏ các tầng phê duyệt dư thừa để hoàn tiền cho khách hàng nhanh hơn.",
        context: "Process Optimization"
      }
    ],
    synonyms: ["Superfluous", "Excessive", "Duplicate"],
    antonyms: ["Essential", "Necessary", "Unique"],
    collocations: ["Make redundant", "Redundant systems", "Redundant features"],
    box: 3,
    reviewCount: 4,
    correctCount: 4,
    dateAdded: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString(),
    lastReviewed: new Date().toISOString(),
    tags: ["Operations", "Management"]
  },
  {
    id: "word-10",
    word: "Benchmark",
    ipa: "/ˈbentʃ.mɑːrk/",
    partOfSpeech: "noun",
    meaningVi: "Tiêu chuẩn so sánh, cột mốc chuẩn mực để đánh giá hiệu suất",
    meaningEn: "A standard by which other things can be judged or measured.",
    examples: [
      {
        en: "Our customer satisfaction score is now the benchmark for the entire fintech industry.",
        vi: "Điểm hài lòng khách hàng của chúng tôi hiện là chuẩn mực cho toàn ngành fintech.",
        context: "Quality Assurance"
      }
    ],
    synonyms: ["Standard", "Criterion", "Yardstick", "Touchstone"],
    antonyms: ["Deviation", "Anomaly"],
    collocations: ["Set a benchmark", "Industry benchmark", "Benchmark performance"],
    box: 4,
    reviewCount: 6,
    correctCount: 6,
    dateAdded: new Date(Date.now() - 12 * 24 * 3600 * 1000).toISOString(),
    lastReviewed: new Date().toISOString(),
    tags: ["Strategy", "Finance", "Productivity"]
  },
  {
    id: "word-11",
    word: "Proactive",
    ipa: "/proʊˈæk.tɪv/",
    partOfSpeech: "adj",
    meaningVi: "Chủ động kiểm soát và hành động trước thay vì chỉ phản ứng thụ động",
    meaningEn: "Controlling a situation by making things happen rather than waiting for things to happen.",
    examples: [
      {
        en: "Taking a proactive approach to risk mitigation saved the client millions in audit penalties.",
        vi: "Cách tiếp cận chủ động giảm thiểu rủi ro đã giúp khách hàng tiết kiệm hàng triệu đô la tiền phạt kiểm toán.",
        context: "Compliance & Risk"
      }
    ],
    synonyms: ["Forward-thinking", "Enterprising", "Preemptive"],
    antonyms: ["Reactive", "Passive"],
    collocations: ["Proactive approach", "Proactive measures", "Proactive communication"],
    box: 3,
    reviewCount: 5,
    correctCount: 5,
    dateAdded: new Date(Date.now() - 6 * 24 * 3600 * 1000).toISOString(),
    lastReviewed: new Date().toISOString(),
    tags: ["Management", "Productivity"]
  },
  {
    id: "word-12",
    word: "Pragmatic",
    ipa: "/præɡˈmæt̬.ɪk/",
    partOfSpeech: "adj",
    meaningVi: "Thực tế, thực dụng, giải quyết dựa trên tính khả thi thay vì lý thuyết suông",
    meaningEn: "Solving problems in a sensible way that suits the conditions that really exist.",
    examples: [
      {
        en: "We need a pragmatic roadmap that delivers value in Q2 rather than an idealistic 3-year plan.",
        vi: "Chúng ta cần một lộ trình thực tế mang lại giá trị trong quý 2 thay vì một kế hoạch 3 năm lý tưởng hóa.",
        context: "Product Strategy"
      }
    ],
    synonyms: ["Practical", "Realistic", "Sensible", "Down-to-earth"],
    antonyms: ["Idealistic", "Impractical", "Dogmatic"],
    collocations: ["Pragmatic approach", "Pragmatic solution", "Pragmatic decision"],
    box: 4,
    reviewCount: 6,
    correctCount: 6,
    dateAdded: new Date(Date.now() - 14 * 24 * 3600 * 1000).toISOString(),
    lastReviewed: new Date().toISOString(),
    tags: ["Strategy", "Business"]
  },
  {
    id: "word-13",
    word: "Facilitate",
    ipa: "/fəˈsɪl.ə.teɪt/",
    partOfSpeech: "verb",
    meaningVi: "Tạo điều kiện thuận lợi, làm cho một quá trình diễn ra dễ dàng hơn",
    meaningEn: "To make something possible or easier.",
    examples: [
      {
        en: "The modern CRM tool was adopted to facilitate collaboration across cross-functional squads.",
        vi: "Công cụ CRM hiện đại được áp dụng để tạo điều kiện thuận lợi cho việc cộng tác giữa các đội nhóm.",
        context: "Team Collaboration"
      }
    ],
    synonyms: ["Enable", "Expedite", "Assist", "Ease"],
    antonyms: ["Hinder", "Impede", "Obstruct"],
    collocations: ["Facilitate communication", "Facilitate growth", "Facilitate discussions"],
    box: 5,
    reviewCount: 9,
    correctCount: 9,
    dateAdded: new Date(Date.now() - 25 * 24 * 3600 * 1000).toISOString(),
    lastReviewed: new Date().toISOString(),
    tags: ["Management", "Tech", "Productivity"]
  },
  {
    id: "word-14",
    word: "Stipulate",
    ipa: "/ˈstɪp.jə.leɪt/",
    partOfSpeech: "verb",
    meaningVi: "Quy định rõ ràng, đưa thành điều khoản bắt buộc trong hợp đồng",
    meaningEn: "To state exactly what must be done or what can happen in an agreement or law.",
    examples: [
      {
        en: "The master service agreement stipulates that intellectual property belongs exclusively to the client.",
        vi: "Hợp đồng dịch vụ khung quy định rõ sở hữu trí tuệ thuộc về riêng khách hàng.",
        context: "Legal & Contracts"
      }
    ],
    synonyms: ["Specify", "Demand", "Prescribe", "Condition"],
    antonyms: ["Waive", "Imply"],
    collocations: ["Contract stipulates", "Stipulate terms", "Expressly stipulate"],
    box: 1,
    reviewCount: 1,
    correctCount: 0,
    dateAdded: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
    lastReviewed: null,
    tags: ["Legal", "Contract", "Business"]
  },
  {
    id: "word-15",
    word: "Holistic",
    ipa: "/hoʊˈlɪs.tɪk/",
    partOfSpeech: "adj",
    meaningVi: "Toàn diện, tổng thể, nhìn nhận toàn bộ hệ thống thay vì từng bộ phận rời rạc",
    meaningEn: "Dealing with or treating the whole of something or someone and not just a part.",
    examples: [
      {
        en: "We need a holistic employee well-being program encompassing mental health and flexible hours.",
        vi: "Chúng ta cần một chương trình phúc lợi nhân viên toàn diện bao gồm cả sức khỏe tinh thần và giờ làm linh hoạt.",
        context: "Human Resources"
      }
    ],
    synonyms: ["Comprehensive", "Integrated", "All-inclusive", "Exhaustive"],
    antonyms: ["Fragmented", "Partial", "Narrow"],
    collocations: ["Holistic view", "Holistic approach", "Holistic strategy"],
    box: 5,
    reviewCount: 7,
    correctCount: 7,
    dateAdded: new Date(Date.now() - 18 * 24 * 3600 * 1000).toISOString(),
    lastReviewed: new Date().toISOString(),
    tags: ["HR", "Management", "Strategy"]
  }
];

