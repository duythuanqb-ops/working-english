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
  }
];
