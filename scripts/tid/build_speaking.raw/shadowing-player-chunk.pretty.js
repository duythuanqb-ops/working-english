(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push(["object" == typeof document ? document.currentScript : void 0, 651731, e => {
 "use strict";
 var t = e.i(843476),
  s = e.i(271645),
  i = e.i(638292),
  r = e.i(395925),
  n = e.i(23827),
  a = e.i(632781),
  l = e.i(281548),
  o = e.i(887081),
  c = e.i(28788),
  d = e.i(926787),
  u = e.i(590582),
  h = e.i(263676),
  x = e.i(522016),
  m = e.i(265562),
  p = e.i(834859),
  f = e.i(846932),
  g = e.i(88653),
  b = e.i(618566),
  v = e.i(644481),
  y = e.i(359770),
  j = e.i(866912),
  w = e.i(242127),
  k = e.i(173698),
  N = e.i(136466),
  S = e.i(490615),
  C = e.i(162831),
  T = e.i(737088);

 function L(e, t, s) {
  for (let i = 0; i < s.length; i++) e.setUint8(t + i, s.charCodeAt(i))
 }
 async function E(e, t = 16e3) {
  let s, i = await e.arrayBuffer(),
   r = new(window.AudioContext || window.webkitAudioContext);
  try {
   s = await r.decodeAudioData(i)
  } finally {
   r.close().catch(() => {})
  }
  let n = new OfflineAudioContext(1, Math.max(1, Math.ceil(s.duration * t)), t),
   a = n.createBufferSource();
  return a.buffer = s, a.connect(n.destination), a.start(),
   function(e) {
    let t = new Uint8Array(e),
     s = "";
    for (let e = 0; e < t.length; e += 32768) s += String.fromCharCode(...t.subarray(e, e + 32768));
    return btoa(s)
   }(function(e, t) {
    let s = new ArrayBuffer(44 + 2 * e.length),
     i = new DataView(s);
    L(i, 0, "RIFF"), i.setUint32(4, 36 + 2 * e.length, !0), L(i, 8, "WAVE"), L(i, 12, "fmt "), i.setUint32(16, 16, !0), i.setUint16(20, 1, !0), i.setUint16(22, 1, !0), i.setUint32(24, t, !0), i.setUint32(28, 2 * t, !0), i.setUint16(32, 2, !0), i.setUint16(34, 16, !0), L(i, 36, "data"), i.setUint32(40, 2 * e.length, !0);
    var r = 44;
    for (let t = 0; t < e.length; t++, r += 2) {
     let s = Math.max(-1, Math.min(1, e[t]));
     i.setInt16(r, s < 0 ? 32768 * s : 32767 * s, !0)
    }
    return s
   }((await n.startRendering()).getChannelData(0), t))
 }
 var R = e.i(433063),
  z = e.i(845597),
  M = e.i(341987),
  _ = e.i(689664),
  A = e.i(124007),
  I = e.i(867927),
  B = e.i(588196);
 let D = ["Vẫn còn hơi lạc trôi, nhưng luyện thêm là ổn áp nha.", "Mới khởi động thôi mà, mai chiến tiếp nha!", "Chưa xong hết nhưng chăm thế này là có tương lai lắm đó."],
  W = ["Quá nửa chặng đường rồi, đỉnh thật sự!", "Tai nghe của bạn hôm nay làm việc hết công suất luôn.", "Cỡ này thì examiner cũng phải dè chừng á nha."],
  $ = ["Hoàn thành 100%?? Cho xin chữ ký với!!", "Giỏi quá trời giỏi, khoe ngay đi chờ chi!", "Bài này đã bị bạn phá đảo. Respect!"];

 function F(e) {
  if (e < 60) return `${e} gi\xe2y`;
  let t = Math.floor(e / 3600),
   s = Math.floor(e % 3600 / 60),
   i = (e % 60).toString().padStart(2, "0");
  return t > 0 ? `${t} giờ ${s} ph\xfat` : `${s} ph\xfat ${i} gi\xe2y`
 }

 function V({
  mode: i,
  videoId: n,
  videoTitle: a,
  elapsedSeconds: l,
  completedCount: o,
  totalCount: c,
  stats: d = null,
  onJumpTo: u,
  onDrillWord: x,
  onClose: m
 }) {
  let p, g, v = (0, b.useRouter)(),
   [y] = (0, s.useState)(() => {
    let e = 0 === c ? 1 : o / c,
     t = D;
    return 1 === e ? t = $ : e >= .5 && (t = W), t[Math.floor(Math.random() * t.length)]
   }),
   [j, w] = (0, s.useState)(!1),
   [k, N] = (0, s.useState)(!1),
   [S] = (0, s.useState)(() => "u" > typeof navigator && !!navigator.share);
  (0, s.useEffect)(() => {
   e.A(80233).then(e => {
    e.default({
     particleCount: 120,
     spread: 70,
     origin: {
      y: .6
     },
     colors: ["#6e7c3f", "#e6e8d1", "#fdfdfd"]
    })
   })
  }, [o, c]);
  let C = "https://theieltsdictionary.com/practice/speaking/shadowing",
   T = `M\xecnh vừa luyện ${"dictation"===i?"Dictation":"Shadowing"} ${F(l)} với video "${a}" tr\xean The IELTS Dictionary 🌞`;
  return (0, t.jsxs)("div", {
   className: "fixed inset-0 z-[9999] bg-herb overflow-y-auto font-sans selection:bg-herb selection:text-white",
   children: [(0, t.jsx)("button", {
    onClick: m,
    className: "fixed top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-[10000]",
    "aria-label": "Đóng",
    children: (0, t.jsx)(h.X, {
     size: 24
    })
   }), (0, t.jsx)("div", {
    className: "fixed inset-0 pointer-events-none opacity-20",
    style: {
     backgroundImage: "linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)",
     backgroundSize: "40px 40px"
    }
   }), (0, t.jsx)("div", {
    className: "relative z-10 max-w-4xl mx-auto px-6 pt-[12vh] pb-20",
    children: (0, t.jsxs)("div", {
     className: "relative space-y-10",
     children: [(0, t.jsxs)("div", {
      className: "relative",
      children: [(0, t.jsxs)("div", {
       className: "max-w-2xl relative z-20",
       children: [(0, t.jsx)("h1", {
        className: "text-white font-black text-3xl md:text-4xl uppercase tracking-tight mb-1",
        children: "Kết quả bài"
       }), (0, t.jsx)("h1", {
        className: "text-6xl md:text-8xl font-black text-white uppercase tracking-tighter leading-none mb-6",
        children: (0, t.jsxs)("span", {
         className: "relative inline-block",
         children: [i, (0, t.jsx)("span", {
          className: "absolute inset-x-0 bottom-2 h-1/2 bg-white/20 -z-10 rounded-lg transform -skew-x-12"
         })]
        })
       }), (0, t.jsxs)("p", {
        className: "text-white/70 text-lg md:text-xl font-medium leading-relaxed max-w-md",
        children: ['Bạn đã luyện tập video "', (0, t.jsx)("span", {
         className: "font-bold",
         children: a
        }), '" trong khoảng thời gian là']
       }), (0, t.jsx)("div", {
        className: "mt-5",
        children: (0, t.jsxs)("p", {
         className: "text-white font-medium text-lg md:text-xl",
         children: ["Thời gian làm bài: ", (0, t.jsx)("span", {
          className: "font-black text-[#a6d189]",
          children: F(l)
         })]
        })
       })]
      }), (0, t.jsx)("div", {
       className: "absolute top-1/2 -right-12 md:-right-24 z-0 transform -translate-y-[150px] md:-translate-y-[86px]",
       children: (0, t.jsx)(B.ResultSunMascot, {
        size: 368,
        message: y
       })
      })]
     }), (0, t.jsx)(f.motion.div, {
      initial: {
       opacity: 0,
       y: 40
      },
      animate: {
       opacity: 1,
       y: 0
      },
      transition: {
       duration: .7,
       delay: .2
      },
      className: "relative z-10 bg-[#5b6e4e]/90 backdrop-blur-md border border-white/20 p-8 md:p-12 shadow-2xl rounded-[40px]",
      children: (0, t.jsxs)("div", {
       className: "grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-4 divide-y md:divide-y-0 md:divide-x divide-white/10",
       children: [(0, t.jsx)("div", {
        className: "flex flex-col items-center justify-center space-y-4 px-2 py-4 md:py-0",
        children: (0, t.jsx)("img", {
         src: `https://img.youtube.com/vi/${n}/hqdefault.jpg`,
         alt: "Thumbnail",
         className: "w-full max-w-[200px] object-cover rounded-xl shadow-md border border-white/10"
        })
       }), (0, t.jsxs)("div", {
        className: "flex flex-col items-center justify-center text-center space-y-4 px-2 py-4 md:py-0",
        children: [(0, t.jsx)("div", {
         className: "w-14 h-14 rounded-full bg-white/10 flex items-center justify-center",
         children: (0, t.jsxs)("svg", {
          width: "28",
          height: "28",
          viewBox: "0 0 24 24",
          fill: "none",
          stroke: "currentColor",
          strokeWidth: "2",
          strokeLinecap: "round",
          strokeLinejoin: "round",
          className: "text-white",
          children: [(0, t.jsx)("circle", {
           cx: "12",
           cy: "12",
           r: "10"
          }), (0, t.jsx)("polyline", {
           points: "12 6 12 12 16 14"
          })]
         })
        }), (0, t.jsxs)("div", {
         children: [(0, t.jsx)("div", {
          className: "text-white font-black text-4xl",
          children: (p = Math.floor(l / 60).toString().padStart(2, "0"), g = (l % 60).toString().padStart(2, "0"), `${p}:${g}`)
         }), (0, t.jsx)("div", {
          className: "text-white/60 text-[11px] font-bold uppercase tracking-widest mt-1",
          children: "THỜI GIAN"
         })]
        })]
       }), (0, t.jsxs)("div", {
        className: "flex flex-col items-center justify-center text-center space-y-4 px-2 py-4 md:py-0",
        children: [(0, t.jsx)("div", {
         className: "w-14 h-14 rounded-full bg-white/10 flex items-center justify-center text-2xl",
         children: "🎯"
        }), (0, t.jsxs)("div", {
         children: [(0, t.jsx)("div", {
          className: "text-white font-black text-xl leading-tight",
          children: "NỖ LỰC HIỆN TẠI"
         }), (0, t.jsx)("div", {
          className: "text-white font-black text-xl leading-tight",
          children: "CỦA BẠN RẤT ĐÁNG TỰ HÀO!"
         })]
        }), (0, t.jsxs)("div", {
         className: "px-3 py-1 bg-white/5 rounded-full text-white font-bold text-xs",
         children: ["Hoàn thành ", o, "/", c, " câu"]
        })]
       })]
      })
     }), d && (0, t.jsxs)(f.motion.div, {
      initial: {
       opacity: 0,
       y: 40
      },
      animate: {
       opacity: 1,
       y: 0
      },
      transition: {
       duration: .7,
       delay: .35
      },
      className: "relative z-10 bg-[#5b6e4e]/90 backdrop-blur-md border border-white/20 p-8 md:p-10 shadow-2xl rounded-[40px] space-y-8",
      children: [(0, t.jsxs)("div", {
       className: "grid grid-cols-3 gap-4 text-center",
       children: [(0, t.jsxs)("div", {
        children: [(0, t.jsxs)("div", {
         className: "text-white font-black text-4xl",
         children: [d.avgScore, "%"]
        }), (0, t.jsx)("div", {
         className: "text-white/60 text-[11px] font-bold uppercase tracking-widest mt-1",
         children: "Điểm trung bình"
        })]
       }), (0, t.jsxs)("div", {
        children: [(0, t.jsx)("div", {
         className: "text-white font-black text-4xl",
         children: null !== d.avgAccuracy ? `${d.avgAccuracy}%` : "—"
        }), (0, t.jsx)("div", {
         className: "text-white/60 text-[11px] font-bold uppercase tracking-widest mt-1",
         children: "🎯 Chính xác"
        })]
       }), (0, t.jsxs)("div", {
        children: [(0, t.jsx)("div", {
         className: "text-white font-black text-4xl",
         children: null !== d.avgFluency ? `${d.avgFluency}%` : "—"
        }), (0, t.jsx)("div", {
         className: "text-white/60 text-[11px] font-bold uppercase tracking-widest mt-1",
         children: "🌊 Trôi chảy"
        })]
       })]
      }), d.errorWords.length > 0 && (0, t.jsxs)("div", {
       children: [(0, t.jsx)("div", {
        className: "text-white/70 text-[11px] font-black uppercase tracking-widest mb-3",
        children: "Từ bạn hay đọc sai — bấm để luyện ngay 🎤"
       }), (0, t.jsx)("div", {
        className: "flex flex-wrap gap-2",
        children: d.errorWords.map(({
         word: e,
         count: s
        }) => (0, t.jsxs)("button", {
         onClick: () => x?.(e),
         className: "px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/25 border border-white/25 text-white font-bold text-sm transition-colors",
         title: "Luyện phát âm từ này",
         children: [e, s > 1 && (0, t.jsxs)("span", {
          className: "ml-1.5 text-white/60 text-xs",
          children: ["×", s]
         })]
        }, e))
       })]
      }), d.weakest.length > 0 && (0, t.jsxs)("div", {
       children: [(0, t.jsx)("div", {
        className: "text-white/70 text-[11px] font-black uppercase tracking-widest mb-3",
        children: "Câu nên luyện lại"
       }), (0, t.jsx)("div", {
        className: "flex flex-col gap-2",
        children: d.weakest.map(e => (0, t.jsxs)("button", {
         onClick: () => u?.(e.idx),
         className: "flex items-center gap-3 text-left px-4 py-3 rounded-2xl bg-white/5 hover:bg-white/15 border border-white/15 transition-colors",
         title: "Quay lại câu này",
         children: [(0, t.jsxs)("span", {
          className: "shrink-0 text-white font-black text-sm bg-white/15 rounded-full px-2.5 py-1",
          children: [e.score, "%"]
         }), (0, t.jsxs)("span", {
          className: "text-white/85 font-medium text-sm leading-snug line-clamp-2",
          children: ["#", e.idx + 1, " · ", e.text]
         })]
        }, e.idx))
       })]
      })]
     }), (0, t.jsxs)("div", {
      className: "flex flex-col sm:flex-row gap-4 pt-4 relative",
      children: [(0, t.jsxs)("button", {
       onClick: () => v.push("/practice/speaking/shadowing"),
       className: "flex-1 group !bg-white !text-[#1E3006] font-black uppercase tracking-tight py-4 px-8 rounded-2xl !border-2 !border-solid !border-black shadow-[4px_4px_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex items-center justify-center gap-3",
       children: [(0, t.jsx)(r.RotateCcw, {
        className: "w-5 h-5 group-hover:-rotate-180 transition-transform duration-500"
       }), "Làm bài khác"]
      }), (0, t.jsxs)("div", {
       className: "flex-1 relative",
       children: [(0, t.jsxs)("button", {
        onClick: () => w(!j),
        className: "w-full group !bg-[#1E3006] !text-white font-black uppercase tracking-tight py-4 px-8 rounded-2xl !border-2 !border-solid !border-black shadow-[4px_4px_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex items-center justify-center gap-3",
        children: ["Chia sẻ khoảnh khắc chăm chỉ này", (0, t.jsx)(I.ChevronRight, {
         className: "w-5 h-5 group-hover:translate-x-1 transition-transform"
        })]
       }), j && (0, t.jsxs)("div", {
        className: "absolute bottom-full mb-4 right-0 md:left-1/2 md:-translate-x-1/2 w-64 bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col z-50 animate-in fade-in slide-in-from-bottom-2",
        children: [(0, t.jsxs)("button", {
         onClick: () => {
          window.open("https://www.facebook.com/sharer/sharer.php?u=" + encodeURIComponent(C) + "&quote=" + encodeURIComponent(T), "_blank", "noopener,noreferrer,width=640,height=560"), w(!1)
         },
         className: "flex items-center gap-3 px-4 py-3 hover:!bg-slate-50 !text-slate-700 font-bold text-sm transition-colors text-left",
         children: [(0, t.jsx)("svg", {
          className: "w-5 h-5 text-[#1877F2]",
          fill: "currentColor",
          viewBox: "0 0 24 24",
          children: (0, t.jsx)("path", {
           d: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
          })
         }), " Facebook"]
        }), (0, t.jsxs)("button", {
         onClick: () => {
          window.open("https://www.threads.net/intent/post?text=" + encodeURIComponent(T + "\n" + C), "_blank", "noopener,noreferrer,width=640,height=560"), w(!1)
         },
         className: "flex items-center gap-3 px-4 py-3 hover:!bg-slate-50 !text-slate-700 font-bold text-sm transition-colors text-left border-t border-slate-100",
         children: [(0, t.jsx)("span", {
          className: "flex items-center justify-center w-[18px] h-[18px] bg-black text-white rounded-full text-[10px]",
          children: "@"
         }), " ", "Threads"]
        }), S && (0, t.jsxs)("button", {
         onClick: () => {
          navigator.share && navigator.share({
           text: T,
           url: C
          }).catch(() => {}), w(!1)
         },
         className: "flex items-center gap-3 px-4 py-3 hover:!bg-slate-50 !text-slate-700 font-bold text-sm transition-colors text-left border-t border-slate-100",
         children: [(0, t.jsx)(M.Share2, {
          size: 18
         }), " Khác..."]
        }), (0, t.jsx)("button", {
         onClick: () => {
          navigator.clipboard.writeText(T + "\n" + C).catch(() => {}), N(!0), setTimeout(() => {
           N(!1), w(!1)
          }, 2e3)
         },
         className: "flex items-center gap-3 px-4 py-3 hover:!bg-slate-50 !text-slate-700 font-bold text-sm transition-colors text-left border-t border-slate-100",
         children: k ? (0, t.jsxs)(t.Fragment, {
          children: [(0, t.jsx)(_.Check, {
           size: 18,
           className: "text-green-600"
          }), " Đã chép ✓"]
         }) : (0, t.jsxs)(t.Fragment, {
          children: [(0, t.jsx)(A.Link, {
           size: 18
          }), " Sao chép liên kết"]
         })
        })]
       })]
      })]
     })]
    })
   }), (0, t.jsx)("div", {
    className: "fixed bottom-4 right-6 text-white/50 text-xs font-bold tracking-widest z-[10000] pointer-events-none",
    children: "theieltsdictionary.com"
   })]
  })
 }
 let O = e => e.toLowerCase().replace(/[’‘`´]/g, "'").replace(/[^\w\s']/g, "").replace(/'/g, "").trim(),
  P = e => e.map(O).filter(Boolean).join(" ");
 var U = e.i(281860),
  K = e.i(191366),
  H = e.i(902309),
  J = e.i(377150),
  q = e.i(279602);
 let G = [{
  id: 1,
  text: "Dropping out of light speed, a fleet of rebel spaceships is greeted by a frenzy of laser blasts,",
  ipa: "drɑːpɪŋ aʊt əv laɪt spiːd, ə fliːt əv ˈrebl ˈspeɪsʃɪps ɪz ˈɡriːtɪd baɪ ə ˈfrenzi əv ˈleɪzər blæsts,",
  startTime: 0,
  endTime: 6.5,
  words: 18
 }, {
  id: 2,
  text: "sending them scrambling for cover.",
  ipa: "ˈsendɪŋ ðem ˈskræmblɪŋ fər ˈkʌvər.",
  startTime: 6.5,
  endTime: 9,
  words: 5
 }, {
  id: 3,
  text: "This is a classic scene in science fiction movies.",
  ipa: "ðɪs ɪz ə ˈklæsɪk siːn ɪn ˈsaɪəns ˈfɪkʃn ˈmuːviz.",
  startTime: 9,
  endTime: 12.5,
  words: 9
 }, {
  id: 4,
  text: "But what exactly is a laser, and how does it work?",
  ipa: "bʌt wʌt ɪɡˈzæktli ɪz ə ˈleɪzər, ənd haʊ dʌz ɪt wɜːrk?",
  startTime: 12.5,
  endTime: 16,
  words: 11
 }];
 async function X(e) {
  let t = async e => e.ok ? String((await e.json())?.translated || "").trim() : "";
  if ("string" == typeof e?.id && e.id) try {
   let s = await fetch("/api/shadowing/translate", {
     method: "POST",
     headers: {
      "Content-Type": "application/json"
     },
     body: JSON.stringify({
      subtitleId: e.id
     })
    }),
    i = await t(s);
   if (i) return i
  } catch {}
  let s = String(e?.text || "").trim();
  if (!s) return "";
  try {
   let e = await fetch(j.TRANSLATE_PATH, (0, R.postJson)({
    text: s
   }));
   return await t(e)
  } catch {
   return ""
  }
 }
 let Q = e => e.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D"),
  Y = e => {
   if ("đ" === e || "Đ" === e) return "d";
   let t = e.normalize("NFD");
   return t.length < 2 ? null : t.includes("́") ? "s" : t.includes("̀") ? "f" : t.includes("̉") ? "r" : t.includes("̃") ? "x" : t.includes("̣") ? "j" : t.includes("̂") ? Q(e).toLowerCase() : t.includes("̆") || t.includes("̛") ? "w" : null
  };

 function Z({
  lessonId: e
 }) {
  let j = (0, q.usePlanReturn)("/practice/speaking/shadowing"),
   L = (0, b.useSearchParams)(),
   M = (0, b.useRouter)(),
   _ = "dictation" === L.get("mode") ? "dictation" : "shadowing",
   [A, I] = (0, s.useState)(_),
   [B, D] = (0, s.useState)(0),
   [W, $] = (0, s.useState)(!1),
   [F, O] = (0, s.useState)(!1),
   [ee, et] = (0, s.useState)(!1),
   [es, ei] = (0, s.useState)(!0),
   [er, en] = (0, s.useState)(!0),
   [ea, el] = (0, s.useState)(!1),
   [eo, ec] = (0, s.useState)(70),
   [ed, eu] = (0, s.useState)(1),
   [eh, ex] = (0, s.useState)({}),
   [em, ep] = (0, s.useState)({}),
   [ef, eg] = (0, s.useState)(!1),
   [eb, ev] = (0, s.useState)(null),
   [ey, ej] = (0, s.useState)(_),
   [ew, ek] = (0, s.useState)(""),
   [eN, eS] = (0, s.useState)(!1),
   eC = (0, s.useRef)(!1),
   eT = (0, s.useRef)(Date.now()),
   eL = (0, s.useRef)(0);
  (0, s.useEffect)(() => {
   eT.current = Date.now();
   let e = () => {
    document.hidden ? eL.current += Date.now() - eT.current : eT.current = Date.now()
   };
   return document.addEventListener("visibilitychange", e), () => document.removeEventListener("visibilitychange", e)
  }, []);
  let [eE, eR] = (0, s.useState)(0), ez = (0, s.useRef)(null), eM = () => {
   eR(Math.floor((eL.current + (document.hidden ? 0 : Date.now() - eT.current)) / 1e3)), eS(!0)
  }, [e_, eA] = (0, s.useState)(0), [eI, eB] = (0, s.useState)(Array(32).fill(0)), [eD, eW] = (0, s.useState)(0), [e$, eF] = (0, s.useState)(null), eV = (0, s.useRef)(null), [eO, eP] = (0, s.useState)({
   key: "",
   done: new Set
  }), [eU, eK] = (0, s.useState)({}), [eH, eJ] = (0, s.useState)(!1), [eq, eG] = (0, s.useState)(""), [eX, eQ] = (0, s.useState)(""), [eY, eZ] = (0, s.useState)(null), [e0, e1] = (0, s.useState)(null), [e2, e4] = (0, s.useState)(null), [e5, e3] = (0, s.useState)(!1), [e6, e8] = (0, s.useState)(!1), [e7, e9] = (0, s.useState)(!1), [te, tt] = (0, s.useState)(new Set), [ts, ti] = (0, s.useState)({}), [tr, tn] = (0, s.useState)(!1), ta = (0, s.useRef)(null), [tl, to] = (0, s.useState)(!1), tc = (0, s.useRef)(null), td = (0, s.useRef)(null), tu = (0, s.useRef)(null), th = (0, s.useRef)([]), tx = (0, s.useRef)(null), tm = (0, s.useRef)(null), tp = (0, s.useRef)(null), tf = (0, s.useRef)(null), tg = (0, s.useRef)(""), tb = (0, s.useRef)(null), tv = (0, s.useRef)(!1), ty = (0, s.useRef)(null), tj = (0, s.useRef)(0), tw = (0, s.useRef)([]), tk = (0, s.useRef)(null), tN = (0, s.useRef)(() => {}), tS = (0, s.useRef)(null), [tC, tT] = (0, s.useState)(null), [tL, tE] = (0, s.useState)(null), [tR, tz] = (0, s.useState)(null), [tM, t_] = (0, s.useState)(!1), [tA, tI] = (0, s.useState)(""), [tB, tD] = (0, s.useState)(!1), tW = (0, s.useRef)(null), t$ = (0, s.useRef)(null), tF = (0, s.useRef)(null), tV = (0, s.useRef)(() => {}), tO = (0, s.useRef)(null), tP = (0, s.useRef)(!1), tU = (0, s.useRef)(""), tK = (0, s.useRef)(null), [tH, tJ] = (0, s.useState)(!1), [tq, tG] = (0, s.useState)(null), [tX, tQ] = (0, s.useState)(null), [tY, tZ] = (0, s.useState)(!1), [t0, t1] = (0, s.useState)(560), t2 = (0, s.useRef)(!1), [t4, t5] = (0, s.useState)(null), [t3, t6] = (0, s.useState)({}), t8 = async e => {
   if (t4 === e) return void t5(null);
   if (t5(e), e.startsWith("http")) return void t6(t => ({
    ...t,
    [e]: e
   }));
   if (!t3[e]) {
    let t = await (0, z.getAudio)(e);
    t && t6(s => ({
     ...s,
     [e]: URL.createObjectURL(t)
    }))
   }
  };
  (0, s.useEffect)(() => () => {
   Object.values(t3).forEach(e => {
    e && e.startsWith("blob:") && URL.revokeObjectURL(e)
   })
  }, [t3]), (0, s.useEffect)(() => {
   let e = e => {
     t2.current && t1(Math.max(300, Math.min(e.clientX, 800)))
    },
    t = () => {
     t2.current = !1, document.body.classList.remove("dragging")
    };
   return document.addEventListener("mousemove", e), document.addEventListener("mouseup", t), () => {
    document.removeEventListener("mousemove", e), document.removeEventListener("mouseup", t)
   }
  }, []);
  let t7 = () => {
   M.push(`/practice/listening/quiz/${si}`)
  };
  (0, s.useEffect)(() => {
   (async () => {
    let t = (0, S.createClient)(),
     s = "true" === L.get("saved"),
     i = "true" === L.get("community"),
     r = "true" === L.get("custom");
    if (s || i) {
     let {
      data: s
     } = await t.from("shadowing_videos").select("*").eq("id", e).single();
     if (!s) return;
     let {
      data: i
     } = await t.from("shadowing_subtitles").select("*").eq("video_id", s.id).order("start_time", {
      ascending: !0
     });
     ep({
      video: s,
      subtitles: i || []
     });
     return
    }
    if (r) {
     let t = localStorage.getItem(`custom_lesson_${e}`);
     if (t) {
      let s = JSON.parse(t);
      ep({
       video: {
        youtube_id: e,
        title: s.title,
        level: "Custom",
        segments: s.segments.length,
        seg_version: s.segVersion
       },
       subtitles: s.segments
      })
     }
     return
    }
    let {
     data: n,
     error: a
    } = await t.from("shadowing_videos").select("*").eq("youtube_id", e).maybeSingle();
    if (a) return void console.error(`Failed to load video "${e}" from Supabase: ${a.code??""} ${a.message??""}`.trim());
    if (!n) return void console.warn(`Video "${e}" not found in shadowing_videos — using built-in demo transcript.`);
    let {
     data: l,
     error: o
    } = await t.from("shadowing_subtitles").select("*").eq("video_id", n.id).order("start_time", {
     ascending: !0
    });
    o ? console.error("Failed to load subtitles from Supabase:", o) : ep({
     video: n,
     subtitles: l || []
    })
   })().finally(() => eg(!0))
  }, [e, L]);
  let t9 = (0, s.useRef)(!1);
  (0, s.useEffect)(() => {
   t9.current = !0;
   let e = !1;
   return navigator.mediaDevices?.getUserMedia({
    audio: !0
   }).then(t => {
    e || ty.current ? t.getTracks().forEach(e => e.stop()) : ty.current = t
   }).catch(() => {}), () => {
    e = !0, t9.current = !1, tk.current && (clearTimeout(tk.current), tk.current = null);
    let t = tu.current;
    if (t && "inactive" !== t.state) {
     let e = td.current;
     if (e) {
      e.onend = null;
      try {
       e.abort()
      } catch {}
     }
     t.ondataavailable = null, t.onstop = null;
     try {
      t.stop()
     } catch {}
    }
    ty.current?.getTracks().forEach(e => e.stop()), ty.current = null
   }
  }, []);
  let se = em.subtitles && em.subtitles.length > 0 ? em.subtitles : G,
   st = se[B],
   ss = "true" === L.get("saved") || "true" === L.get("community"),
   si = em.video?.youtube_id || (ss ? "" : e || "wunM9pI6Z5I"),
   sr = Number(em.video?.seg_version ?? 0),
   sn = sr >= 2 ? `_v${sr}` : "",
   sa = `shadowing_results${sn}_${si}`,
   sl = `shadowing_progress${sn}_${si}`,
   so = `shadowing_dictation${sn}_${si}`,
   sc = (0, s.useMemo)(() => eO.key === so ? eO.done : new Set, [eO, so]),
   sd = em.video?.title || "Will laser blasters ever be possible? - Christopher Baird",
   su = em.video?.level || "C1",
   sh = (0, s.useRef)(null);
  if (null === sh.current && ef && tY && !tH) {
   let e = se[B];
   sh.current = Math.max(0, Math.floor(e?.start_time ?? e?.startTime ?? 0))
  }(0, s.useEffect)(() => {
   if (si && ef) {
    let e = null;
    if (sr >= 2) {
     let t = [];
     for (let e = sr - 1; e >= 2; e--) t.push(`shadowing_results_v${e}_${si}`);
     if (t.push(`shadowing_results_${si}`), t.some(e => null !== localStorage.getItem(e))) {
      let s = {};
      try {
       s = JSON.parse(localStorage.getItem(sa) || "{}") || {}
      } catch {}
      let i = 0,
       r = 0;
      for (let e of t) {
       let t = localStorage.getItem(e);
       if (t) try {
        let e = function(e, t, s) {
         let i = new Map;
         t.forEach((e, t) => {
          let s = P(String(e?.text || "").split(/\s+/));
          if (!s) return;
          let r = i.get(s);
          r ? r.push(t) : i.set(s, [t])
         });
         let r = {
           ...s
          },
          n = 0,
          a = 0,
          l = -1;
         for (let t of Object.keys(e).map(Number).filter(Number.isInteger).sort((e, t) => e - t)) {
          let o = Array.isArray(e[t]) ? e[t] : [e[t]],
           c = function(e) {
            for (let t of e) {
             let e = P((t?.wordResults || []).map(e => String(e?.word ?? "")));
             if (e) return e
            }
            return ""
           }(o);
          if (!c) continue;
          let d = i.get(c) || [],
           u = d.filter(e => !(e in r)),
           h = u.find(e => e > l) ?? u[0];
          if (void 0 === h) {
           !d.some(e => e in s) && a++;
           continue
          }
          r[h] = o, l = h, n++
         }
         return {
          merged: r,
          carried: n,
          dropped: a
         }
        }(JSON.parse(t) || {}, se, s);
        s = e.merged, i += e.carried, r += e.dropped
       } catch {}
      }
      try {
       i > 0 && localStorage.setItem(sa, JSON.stringify(s)), t.forEach(e => {
        localStorage.removeItem(e), localStorage.removeItem(e.replace("shadowing_results", "shadowing_progress")), localStorage.removeItem(e.replace("shadowing_results", "shadowing_dictation"))
       }), i > 0 && (e = {
        carried: i,
        dropped: r
       })
      } catch {}
     }
    }
    tQ(e);
    let t = null,
     s = localStorage.getItem(sa);
    if (s) try {
     let e = JSON.parse(s),
      i = {},
      r = !1,
      n = Date.now();
     for (let t in e) {
      let s = Array.isArray(e[t]) ? e[t] : [e[t]];
      s.forEach(e => {
       e.audioKey && e.audioKey.startsWith("http") && n - (e.timestamp || 0) >= 864e6 && (delete e.audioKey, r = !0)
      }), i[Number(t)] = s
     }
     ex(i), t = i, r && localStorage.setItem(sa, JSON.stringify(i))
    } catch (e) {
     ex({})
    } else ex({});
    let i = [];
    try {
     let e = JSON.parse(localStorage.getItem(so) || "[]");
     Array.isArray(e) && (i = e.filter(e => Number.isInteger(e) && e >= 0 && e < se.length))
    } catch {}
    eP({
     key: so,
     done: new Set(i)
    }), i.length > 0 && (ez.current = null);
    let r = localStorage.getItem(sl);
    if (r || t && Object.keys(t).length > 0 || i.length > 0) try {
     let s = r ? JSON.parse(r) : {
       currentIdx: 0
      },
      i = e && t ? se.findIndex((e, s) => !(s in t)) : -1;
     tG(i >= 0 ? i : s.currentIdx || 0), tJ(!0)
    } catch (e) {
     tZ(!0)
    } else tZ(!0)
   }
  }, [si, ef, sa, sl, so]), (0, s.useEffect)(() => {
   if (eO.key && 0 !== eO.done.size) try {
    localStorage.setItem(eO.key, JSON.stringify([...eO.done].sort((e, t) => e - t)))
   } catch {}
  }, [eO]), (0, s.useEffect)(() => {
   si && tY && !tH && (B > 0 || Object.keys(eh).length > 0 || sc.size > 0) && localStorage.setItem(sl, JSON.stringify({
    currentIdx: B,
    updatedAt: Date.now()
   }))
  }, [B, si, tY, eh, sc, tH, sl]);
  let sx = e => {
    tJ(!1), e && null !== tq ? D(tq) : (ex({}), eP({
     key: so,
     done: new Set
    }), D(0), localStorage.removeItem(sl), localStorage.removeItem(sa), localStorage.removeItem(so)), tZ(!0)
   },
   sm = (0, s.useRef)(null),
   sp = (0, s.useRef)(null);
  (0, s.useEffect)(() => {
   let t = se.length,
    s = Object.keys(eh).length;
   return s > 0 && t > 0 && (sm.current && clearTimeout(sm.current), sm.current = setTimeout(async () => {
    let i = 0;
    Object.values(eh).forEach(e => i += e[0]?.score || 0);
    let r = {
     score: Math.round(i / s),
     total: t,
     category: "speaking",
     testName: sd || "Luyện Shadowing",
     answeredCount: s
    };
    if (sp.current) fetch(k.HISTORY_PATH, (0, R.jsonInit)("PATCH", {
     id: sp.current,
     ...r
    })).catch(console.error);
    else try {
     let t = await fetch(k.HISTORY_PATH, (0, R.postJson)({
      exam_id: si || e,
      ...r
     }));
     if (t.ok) {
      let e = await t.json();
      e.session?.id && (sp.current = e.session.id)
     }
    } catch {}
   }, 3e3)), () => {
    sm.current && clearTimeout(sm.current)
   }
  }, [eh, se.length, si, e, sd]), (0, s.useEffect)(() => {
   eW(0), eK({})
  }, [si]), (0, s.useEffect)(() => {
   eW(0), eK({}), eF(null)
  }, [B]);
  let [sf, sg] = (0, s.useState)(!1);
  (0, s.useEffect)(() => {
   sg("ontouchstart" in window || navigator.maxTouchPoints > 0)
  }, []);
  let [sb, sv] = (0, s.useState)(!1);
  (0, s.useEffect)(() => {
   "dictation" !== ey || sb || tO.current?.focus()
  }, [ey, B, sb]), (0, s.useEffect)(() => {
   if ("dictation" !== ey || sb) return;
   let e = () => {
    setTimeout(() => {
     document.activeElement?.tagName === "IFRAME" && tO.current?.focus()
    }, 0)
   };
   return window.addEventListener("blur", e), () => window.removeEventListener("blur", e)
  }, [ey, sb]), (0, s.useEffect)(() => {
   let e = tO.current;
   if (!e) return;
   let t = e => {
     if (e.preventDefault(), tP.current) {
      tP.current = !1;
      return
     }
     if (e.isComposing) return;
     if ("deleteContentBackward" === e.inputType) return void sT();
     if ("insertText" !== e.inputType) return;
     let t = (e.data ?? "").normalize("NFC");
     1 === t.length && " " !== t && tV.current(t)
    },
    s = e => {
     let t = e.normalize("NFC"),
      s = tU.current;
     if (t.length === s.length + 1 && t.startsWith(s)) {
      let e = t[t.length - 1];
      e && " " !== e && tV.current(e)
     } else if (t.length === s.length && s.length > 0 && t.startsWith(s.slice(0, -1)) && t[t.length - 1] !== s[s.length - 1]) {
      let e = Y(t[t.length - 1] ?? "");
      e && tV.current(e)
     }
     tU.current = t
    },
    i = () => {
     tU.current = ""
    },
    r = e => {
     s(e.data ?? "")
    },
    n = t => {
     s(t.data ?? ""), tU.current = "", e.value = ""
    },
    a = () => {
     e.value = ""
    };
   return e.addEventListener("beforeinput", t), e.addEventListener("compositionstart", i), e.addEventListener("compositionupdate", r), e.addEventListener("compositionend", n), e.addEventListener("blur", a), () => {
    e.removeEventListener("beforeinput", t), e.removeEventListener("compositionstart", i), e.removeEventListener("compositionupdate", r), e.removeEventListener("compositionend", n), e.removeEventListener("blur", a)
   }
  }, [ey]), (0, s.useEffect)(() => {
   if (!ef) return;
   let e = se[B];
   if (!e || ts[B] || e.vietnamese_text) return;
   let t = !1;
   return X(e).then(e => {
    !t && e && ti(t => ({
     ...t,
     [B]: e
    }))
   }), () => {
    t = !0
   }
  }, [B, se, ef]), (0, s.useEffect)(() => {
   let e = e => {
    tF.current?.(e), t$.current?.(e)
   };
   return window.addEventListener("keydown", e, !0), () => window.removeEventListener("keydown", e, !0)
  }, []), (0, s.useEffect)(() => {
   tv.current = W
  }, [W]), (0, s.useEffect)(() => {
   if (!eb || !st) return;
   let e = !1,
    t = setInterval(async () => {
     if (!e && tv.current) try {
      let t = await eb.getCurrentTime(),
       s = st.start_time ?? st.startTime ?? 0,
       i = st.duration ?? st.endTime - st.startTime,
       r = se[B + 1],
       n = r ? r.start_time ?? r.startTime : null,
       a = null != n && n > s ? Math.min(s + i, n) : s + i;
      t >= a && (eb.pauseVideo(), $(!1), e = !0, setTimeout(() => {
       e = !1
      }, 600))
     } catch (e) {}
    }, 100);
   return () => clearInterval(t)
  }, [eb, st, se, B]), (0, s.useEffect)(() => {
   if (!F) return;
   let e = !1,
    t = null;
   return (async () => {
    try {
     let s = ty.current ?? await navigator.mediaDevices.getUserMedia({
      audio: !0
     });
     if (e) return;
     let i = window.AudioContext || window.webkitAudioContext,
      r = tx.current;
     if (r && "closed" !== r.state || (tx.current = r = new i), "suspended" === r.state) {
      try {
       await r.resume()
      } catch {}
      if (e) return
     }
     let n = r.createAnalyser();
     t = r.createMediaStreamSource(s), n.fftSize = 256, t.connect(n), tm.current = n;
     let a = n.frequencyBinCount,
      l = new Uint8Array(a),
      o = () => {
       if (!tm.current) return;
       tm.current.getByteFrequencyData(l);
       let e = Math.floor(a / 32),
        t = [];
       for (let s = 0; s < 32; s++) t.push(l[s * e]);
       eB(t);
       let s = 0;
       for (let e = 0; e < a; e++) s += l[e];
       let i = s / a;
       i > tj.current && (tj.current = i), tw.current.push({
        t: performance.now(),
        v: i
       }), eA(Math.min(100, 2.5 * i)), tp.current = requestAnimationFrame(o)
      };
     o()
    } catch (e) {
     console.error("Error accessing microphone for volume visualization:", e)
    }
   })(), () => {
    e = !0, tp.current && (cancelAnimationFrame(tp.current), tp.current = null), tm.current = null;
    try {
     t?.disconnect()
    } catch {}
    eA(0)
   }
  }, [F]), (0, s.useEffect)(() => () => {
   let e = tx.current;
   e && "closed" !== e.state && e.close().catch(() => {}), tx.current = null
  }, []), (0, s.useEffect)(() => {
   function e(e) {
    tc.current && !tc.current.contains(e.target) && e1(null)
   }
   return document.addEventListener("mousedown", e), () => document.removeEventListener("mousedown", e)
  }, []);
  let sy = async (e, t = "") => {
   let s = (e => {
    let t = e.replace(/[’‘`´]/g, "'").replace(/[^A-Za-z']/g, "").replace(/^'+|'+$/g, "").toLowerCase();
    if (!t) return [];
    let s = [t],
     i = t.replace(/(n't|'s|'re|'ve|'ll|'d|'m)$/, "");
    return i && i !== t && s.push(i), s
   })(e);
   if (0 === s.length) return;
   let i = s[0];
   e1(i), e8(!0), e3(!0), e4(null);
   try {
    for (let e of s) {
     let s = t.replace(/\s+/g, " ").trim().slice(0, v.VOCAB_WORD_CONTEXT_MAX_CHARS),
      i = await fetch((0, v.vocabWordUrl)(e, s));
     if (i.ok) {
      let {
       detail: t
      } = await i.json();
      if (t) return void e4({
       word: t.word,
       phonetic: t.ipa || "/.../",
       audioUrl: t.audioUrl || null,
       meanings: t.definition ? [{
        partOfSpeech: t.pos || "",
        definitions: [{
         definition: t.definition,
         example: t.example || ""
        }]
       }] : [],
       vietnamese: t.vietnamese || null,
       cleanWord: e
      })
     }
     if (404 !== i.status) break
    }
    let e = await fetch(y.ALIGN_WORD_PATH, (0, R.postJson)({
      word: i
     })),
     r = e.ok ? String((await e.json())?.phrase || "").trim() : "";
    r && r.toLowerCase() !== i ? e4({
     phonetic: "/.../",
     meanings: [],
     vietnamese: r,
     cleanWord: i
    }) : e4({
     error: "Từ này chưa có trong từ điển bạn ơi, thử tìm từ khác nhé 🔍",
     cleanWord: i
    })
   } catch {
    e4({
     error: "Kết nối bị gián đoạn, thử lại sau nhé 🙏",
     cleanWord: i
    })
   } finally {
    e3(!1)
   }
  }, sj = e => {
   (0, H.speakWord)(e, "en-US")
  }, sw = (0, s.useMemo)(() => {
   if (!st?.text) return {
    words: [],
    totalLetters: 0,
    letters: []
   };
   let e = [],
    t = [],
    s = 0,
    i = [];
   return st.text.split("").forEach((r, n) => {
    if (" " === r) t.length > 0 && (e.push({
     chars: t,
     isSpace: !1
    }), t = []), e.push({
     chars: [{
      raw: " ",
      isLetter: !1,
      letterIndex: -1
     }],
     isSpace: !0
    });
    else {
     let e = /[a-z0-9\u00C0-\u1EF9]/i.test(r),
      n = {
       raw: r,
       isLetter: e,
       letterIndex: e ? s++ : -1
      };
     t.push(n), e && i.push({
      char: r.toLowerCase(),
      raw: r,
      index: n.letterIndex
     })
    }
   }), t.length > 0 && e.push({
    chars: t,
    isSpace: !1
   }), {
    words: e,
    totalLetters: s,
    letters: i
   }
  }, [st?.text]);
  (0, s.useEffect)(() => {
   if (sw.totalLetters && !(eD < sw.totalLetters)) {
    eP(e => {
     let t = new Set(e.key === so ? e.done : []);
     return t.add(B), {
      key: so,
      done: t
     }
    });
    try {
     let e = new(window.AudioContext || window.webkitAudioContext);
     [523, 659, 784, 1047].forEach((t, s) => {
      let i = e.createOscillator(),
       r = e.createGain();
      i.connect(r), r.connect(e.destination), i.frequency.value = t, i.type = "square";
      let n = e.currentTime + .13 * s;
      r.gain.setValueAtTime(.22, n), r.gain.exponentialRampToValueAtTime(.001, n + .18), i.start(n), i.stop(n + .18)
     }), setTimeout(() => {
      e.close().catch(() => {})
     }, 900)
    } catch {}
   }
  }, [eD, sw.totalLetters, B, so]), (0, s.useEffect)(() => {
   if (0 === se.length) return;
   let e = "dictation" === ey ? sc.size : Object.keys(eh).length;
   if (null === ez.current) {
    ez.current = e;
    return
   }
   let t = ez.current;
   if (ez.current = e, e === se.length && t < se.length && !eC.current)
    if ("dictation" === ey) {
     let e = setTimeout(() => {
      eC.current = !0, eb && "function" == typeof eb.pauseVideo && eb.pauseVideo(), eM()
     }, 800);
     return () => clearTimeout(e)
    } else eC.current = !0, eb && "function" == typeof eb.pauseVideo && eb.pauseVideo(), eM()
  }, [sc.size, eh, se.length, ey, eb]), tF.current = e => {
   if (eN || "shadowing" !== ey || e.metaKey || e.altKey) return;
   let t = e.target;
   if (!t || "INPUT" !== t.tagName && "TEXTAREA" !== t.tagName && "AUDIO" !== t.tagName && !t.isContentEditable) {
    if ("Space" === e.code) {
     if (e.preventDefault(), e.repeat) return;
     eH || sM();
     return
    }
    if (!e.ctrlKey && "r" === e.key.toLowerCase()) {
     e.preventDefault();
     let t = tW.current ?? tb.current;
     t && (t.currentTime = 0, t.play().catch(() => {}));
     return
    }
    if (e.ctrlKey) {
     if (e.preventDefault(), B > 0) {
      let e = B - 1;
      D(e);
      let t = se[e];
      eb && t && (eb.seekTo(t.start_time ?? t.startTime), eb.playVideo(), $(!0))
     }
     return
    }
    if ("Tab" === e.key) {
     e.preventDefault(), eb && st && (eb.seekTo(st.start_time ?? st.startTime), eb.playVideo(), $(!0));
     return
    }
    if ("Enter" === e.key) {
     if (e.preventDefault(), B < se.length - 1) {
      let e = B + 1;
      D(e);
      let t = se[e];
      eb && t && (eb.seekTo(t.start_time ?? t.startTime), eb.playVideo(), $(!0))
     }
     return
    }
   }
  };
  let sk = () => {
    if (B > 0) {
     let e = B - 1;
     D(e);
     let t = se[e];
     eb && t && (eb.seekTo(t.start_time ?? t.startTime), eb.playVideo(), $(!0))
    }
   },
   sN = () => {
    eb && st && (eb.seekTo(st.start_time ?? st.startTime), eb.playVideo(), $(!0))
   },
   sS = () => {
    if (B < se.length - 1) {
     let e = B + 1;
     D(e);
     let t = se[e];
     eb && t && (eb.seekTo(t.start_time ?? t.startTime), eb.playVideo(), $(!0))
    }
   },
   sC = () => {
    eW(e => Math.max(0, e - 1)), eF(null)
   },
   sT = () => {
    tK.current && (clearTimeout(tK.current), sC()), tK.current = setTimeout(() => {
     tK.current = null, sC()
    }, 60)
   },
   sL = e => {
    if (1 !== e.length || " " === e) return;
    let t = e;
    if (Y(t) ? tK.current ? (clearTimeout(tK.current), tK.current = null, t = Y(t)) : t = Q(t) : tK.current && (clearTimeout(tK.current), tK.current = null, sC()), 1 !== t.length || " " === t) return;
    let {
     letters: s,
     totalLetters: i
    } = sw;
    eW(e => {
     if (e >= i) return e;
     let r = s[e].char,
      n = t.toLowerCase();
     return n === r || Q(n) === Q(r) ? (eV.current && clearTimeout(eV.current), eF(null), e + 1) : (eV.current && clearTimeout(eV.current), eF(e), eV.current = setTimeout(() => eF(null), 400), e)
    })
   };
  tV.current = sL, t$.current = e => {
   if (eN || "dictation" !== ey || e.metaKey || e.altKey || "u" > typeof document && tO.current && document.activeElement === tO.current) return;
   let t = "u" > typeof document ? document.activeElement : null;
   if (!t || "INPUT" !== t.tagName && "TEXTAREA" !== t.tagName && !t.isContentEditable) {
    if (e.isComposing || 229 === e.keyCode) {
     sb || tO.current?.focus();
     return
    }
    if (e.ctrlKey) {
     e.preventDefault(), sk();
     return
    }
    if ("Tab" === e.key) {
     e.preventDefault(), sN();
     return
    }
    if ("Enter" === e.key) {
     e.preventDefault(), sS();
     return
    }
    if ("Backspace" === e.key) {
     e.preventDefault(), sT();
     return
    }
    if (1 === e.key.length) {
     if (" " === e.key) {
      e.preventDefault && e.preventDefault();
      return
     }
     sL(e.key)
    }
   }
  }, (0, s.useEffect)(() => {
   document.body.classList.add("night");
   let e = () => {
    to(!!document.fullscreenElement)
   };
   return document.addEventListener("fullscreenchange", e), () => {
    document.body.classList.remove("night"), document.removeEventListener("fullscreenchange", e)
   }
  }, []);
  let sE = async () => {
   let e = window.SpeechRecognition || window.webkitSpeechRecognition;
   try {
    if (!ty.current || ty.current.getTracks().some(e => "ended" === e.readyState)) {
     let e = await navigator.mediaDevices.getUserMedia({
      audio: !0
     });
     if (!t9.current) return void e.getTracks().forEach(e => e.stop());
     ty.current = e
    }
    let t = ty.current,
     s = "u" > typeof MediaRecorder && "function" == typeof MediaRecorder.isTypeSupported && ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/mp4;codecs=mp4a.40.2", "audio/ogg;codecs=opus", "audio/ogg"].find(e => MediaRecorder.isTypeSupported(e)) || "",
     i = s ? new MediaRecorder(t, {
      mimeType: s,
      audioBitsPerSecond: 24e3
     }) : new MediaRecorder(t, {
      audioBitsPerSecond: 24e3
     });
    if (th.current = [], await new Promise(e => setTimeout(e, 200)), !t9.current) return;
    if (i.ondataavailable = e => {
      e.data.size > 0 && th.current.push(e.data)
     }, i.onstop = async () => {
      let e = i.mimeType || "audio/webm",
       t = new Blob(th.current, {
        type: e
       }),
       s = URL.createObjectURL(t),
       r = new Audio(s);
      r.preload = "auto", tb.current = r, eZ(s);
      let n = tf.current;
      if (!n) return void eJ(!1);
      if (td.current) {
       await new Promise(e => setTimeout(e, 250));
       for (let e = 0; !tg.current.trim() && e < 1e3; e += 200) await new Promise(e => setTimeout(e, 200))
      }
      if (t.size < 1e3) {
       eQ("Mình chưa nghe được giọng của bạn 🎤\nBạn vui lòng nhấn thu âm và nói lại to, rõ hơn giúp mình nhé!"), eJ(!1);
       return
      }
      let a = tj.current > 0 && tj.current < 5 && !tg.current.trim(),
       l = (0, z.uploadAudioToR2)(t, "shadowing").catch(() => void 0),
       o = (e, t) => {
        e.timestamp = Date.now(), ex(s => {
         let i = [...s[n.idx] || []];
         if (t && i.length > 0 ? i[0] = e : i = [e, ...i], i.length > 3) {
          let e = i.pop();
          e?.audioKey && (0, z.deleteAudioFromR2)(e.audioKey).catch(() => {})
         }
         let r = {
          ...s,
          [n.idx]: i
         };
         return localStorage.setItem(n.resultsStorageKey, JSON.stringify(r)), r
        })
       },
       c = (0, T.analyzeLevels)(tw.current),
       d = (0, T.scoreFluency)({
        speechSeconds: c.speechMs / 1e3,
        nativeSeconds: n.nativeSeconds,
        longPauses: c.longPauses
       }),
       u = e => {
        let t = (0, C.evaluatePronunciation)(e, n.targetText);
        return {
         ...t,
         score: (0, T.combineScores)(t.score, d ? d.score : null),
         accuracy: t.score,
         fluency: d ? d.score : null,
         fluVerdict: d ? d.verdict : null,
         algo: 2
        }
       },
       h = tg.current.trim(),
       x = h ? u(h) : null,
       m = !1;
      x && (o(x, !1), eJ(!1), m = !0);
      let p = !1;
      if (!x && t.size >= 1e3) try {
       let e = new FormData,
        s = function(e) {
         switch ((e || "").split(";")[0].trim().toLowerCase()) {
          case "audio/mp4":
          case "audio/x-m4a":
          case "audio/aac":
           return "mp4";
          case "audio/mpeg":
           return "mp3";
          case "audio/ogg":
           return "ogg";
          case "audio/wav":
          case "audio/x-wav":
           return "wav";
          default:
           return "webm"
         }
        }(t.type);
       e.append(N.TRANSCRIBE_FIELDS.audio, t, `recording.${s}`), e.append(N.TRANSCRIBE_FIELDS.hint, n.targetText);
       let i = await fetch(N.TRANSCRIBE_PATH, {
        method: "POST",
        body: e
       });
       if (i.ok) {
        let e = await i.json(),
         t = (e.transcript || "").trim(),
         s = "number" == typeof e.noSpeechProb ? e.noSpeechProb : null;
        if (t && !(null !== s && s > .6)) {
         let e = u(t);
         a && e.accuracy >= 90 || (x = e, o(e, m))
        }
       } else p = !0
      } catch {
       p = !0
      }
      x && (tS.current = {
       blob: t,
       idx: n.idx,
       targetText: n.targetText
      }, tT(n.idx), tE(t), tI(""));
      let f = await l;
      if (x) {
       if (f) {
        x.audioKey = f, o(x, !0);
        try {
         let e = n.resultsStorageKey,
          t = JSON.parse(localStorage.getItem(e) || "{}"),
          s = t[n.idx];
         Array.isArray(s) && s.length > 0 && (s[0].audioKey = f, s[0].timestamp = Date.now(), localStorage.setItem(e, JSON.stringify(t)))
        } catch {}
       }
      } else f && (0, z.deleteAudioFromR2)(f).catch(() => {}), eQ(p ? "Hệ thống chấm điểm đang bận một chút 🙏\nBạn nhấn thu âm và đọc lại giúp mình nhé — lần này chưa tính điểm." : "Mình chưa nghe rõ lời bạn nói 😅\nBạn vui lòng nói lại to và rõ hơn giúp mình nhé — lần này chưa tính điểm.");
      eJ(!1)
     }, tu.current = i, i.start(), tg.current = "", tj.current = 0, tw.current = [], td.current = null, tk.current && clearTimeout(tk.current), tk.current = setTimeout(() => {
      tu.current?.state === "recording" && tN.current()
     }, 3e4), e) {
     let t = new e;
     t.continuous = !0, t.interimResults = !0, t.lang = "en-US", t.onresult = e => {
      let t = "";
      for (let s = 0; s < e.results.length; s++) t += e.results[s][0].transcript;
      tg.current = t, ek(t)
     }, t.onerror = e => {
      console.warn("Speech recognition error:", e.error), "no-speech" === e.error && (eG("Không nghe thấy tiếng, bạn nói to hơn chút nhé?"), setTimeout(() => eG(""), 3e3))
     }, t.onend = () => {
      if (tu.current?.state === "recording") try {
       t.start()
      } catch (e) {} else O(!1)
     }, td.current = t, t.start()
    }
    O(!0), ek("")
   } catch (e) {
    console.error("Failed to start recognition", e), O(!1)
   }
  }, sR = e => {
   let t = Number(e?.duration);
   if (isFinite(t) && t > 0) return t;
   let s = Number(e?.start_time ?? e?.startTime),
    i = Number(e?.end_time ?? e?.endTime);
   return isFinite(s) && isFinite(i) && i > s ? i - s : 0
  }, sz = () => {
   if (tk.current && (clearTimeout(tk.current), tk.current = null), tf.current = {
     targetText: st?.text || "",
     idx: B,
     videoId: si,
     resultsStorageKey: sa,
     nativeSeconds: sR(st)
    }, td.current) try {
    td.current.stop()
   } catch (e) {}
   if (tu.current && "inactive" !== tu.current.state) try {
    tu.current.stop()
   } catch (e) {}
   O(!1), eJ(!0)
  };
  tN.current = sz;
  let sM = () => {
    if (tu.current?.state === "recording") sz();
    else {
     if (tf.current = null, eG(""), eQ(""), eZ(null), eb) try {
      eb.pauseVideo()
     } catch (e) {}
     $(!1), sE()
    }
   },
   s_ = async () => {
    let e = tS.current;
    if (e && !tM) {
     t_(!0), tI("");
     try {
      let t = await E(e.blob),
       s = await fetch(w.EVALUATE_PATH, (0, R.postJson)({
        category: "shadowing_pron",
        payload: {
         audioBase64: t,
         targetText: e.targetText
        }
       }));
      if (401 === s.status) return void tI("Bạn cần đăng nhập để dùng Chấm sâu AI.");
      if (403 === s.status) return void tD(!0);
      let i = await (0, R.readJson)(s);
      if (i?.error || !i?.evaluation) return void tI(i?.message || "Chấm sâu chưa thành công — bạn thử lại nhé.");
      ex(t => {
       let s = t[e.idx] ? [...t[e.idx]] : [];
       s.length > 0 && (s[0] = {
        ...s[0],
        deep: i.evaluation
       });
       let r = {
        ...t,
        [e.idx]: s
       };
       try {
        localStorage.setItem(sa, JSON.stringify(r))
       } catch {}
       return r
      })
     } catch {
      tI("Chấm sâu chưa thành công — bạn thử lại nhé.")
     } finally {
      t_(!1)
     }
    }
   };
  return (0, t.jsxs)("div", {
   className: "app",
   ref: ta,
   children: [(0, t.jsxs)("header", {
    className: "topbar",
    children: [(0, t.jsxs)("div", {
     className: "tb-left",
     children: [(0, t.jsx)(x.default, {
      href: j,
      className: "icon-btn",
      "aria-label": "Back",
      children: (0, t.jsx)("svg", {
       width: "22",
       height: "22",
       viewBox: "0 0 24 24",
       fill: "none",
       stroke: "currentColor",
       strokeWidth: "2.2",
       strokeLinecap: "round",
       strokeLinejoin: "round",
       children: (0, t.jsx)("path", {
        d: "M19 12H5M12 19l-7-7 7-7"
       })
      })
     }), (0, t.jsx)("button", {
      className: "icon-btn star",
      "aria-label": "Favorite",
      children: (0, t.jsx)("svg", {
       width: "21",
       height: "21",
       viewBox: "0 0 24 24",
       fill: "none",
       stroke: "currentColor",
       strokeWidth: "2",
       strokeLinecap: "round",
       strokeLinejoin: "round",
       children: (0, t.jsx)("polygon", {
        points: "12 2 15.1 8.3 22 9.3 17 14.1 18.2 21 12 17.8 5.8 21 7 14.1 2 9.3 8.9 8.3 12 2"
       })
      })
     }), (0, t.jsx)("span", {
      className: "level-badge",
      children: su
     }), (0, t.jsx)("span", {
      className: "tb-title",
      children: sd
     })]
    }), (0, t.jsxs)("div", {
     className: "seg seg-glow",
     id: "modeSeg",
     children: [(0, t.jsxs)("button", {
      className: "shadowing" === ey ? "active" : "",
      onClick: () => ej("shadowing"),
      children: [(0, t.jsxs)("svg", {
       width: "17",
       height: "17",
       viewBox: "0 0 24 24",
       fill: "none",
       stroke: "currentColor",
       strokeWidth: "2",
       strokeLinecap: "round",
       strokeLinejoin: "round",
       children: [(0, t.jsx)("path", {
        d: "M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"
       }), (0, t.jsx)("path", {
        d: "M19 10v2a7 7 0 0 1-14 0v-2M12 19v3"
       })]
      }), "Shadowing"]
     }), (0, t.jsxs)("button", {
      className: "dictation" === ey ? "active" : "",
      onClick: () => ej("dictation"),
      children: [(0, t.jsxs)("svg", {
       width: "17",
       height: "17",
       viewBox: "0 0 24 24",
       fill: "none",
       stroke: "currentColor",
       strokeWidth: "2",
       strokeLinecap: "round",
       strokeLinejoin: "round",
       children: [(0, t.jsx)("path", {
        d: "M3 14v-2a9 9 0 0 1 18 0v2"
       }), (0, t.jsx)("path", {
        d: "M21 16a2 2 0 0 1-2 2h-1v-6h1a2 2 0 0 1 2 2zM3 16a2 2 0 0 0 2 2h1v-6H5a2 2 0 0 0-2 2z"
       })]
      }), "Dictation"]
     }), (0, t.jsxs)("button", {
      onClick: t7,
      children: [(0, t.jsxs)("svg", {
       width: "17",
       height: "17",
       viewBox: "0 0 24 24",
       fill: "none",
       stroke: "currentColor",
       strokeWidth: "2",
       strokeLinecap: "round",
       strokeLinejoin: "round",
       children: [(0, t.jsx)("rect", {
        x: "3",
        y: "5",
        width: "18",
        height: "14",
        rx: "2"
       }), (0, t.jsx)("path", {
        d: "M7 9h10M7 13h6"
       }), (0, t.jsx)("circle", {
        cx: "17",
        cy: "13",
        r: "1.5",
        fill: "currentColor",
        stroke: "none"
       })]
      }), "Quiz"]
     }), (0, t.jsx)("button", {
      onClick: eM,
      disabled: "dictation" === ey ? 0 === sc.size : 0 === Object.keys(eh).length,
      className: "end-lesson-btn",
      children: "Kết thúc bài ↗"
     })]
    }), (0, t.jsxs)("div", {
     className: "tb-right",
     children: [(0, t.jsxs)("button", {
      className: "theme-toggle",
      id: "themeToggle",
      title: "Sáng / Tối",
      "aria-label": "Chuyển sáng tối",
      onClick: () => document.body.classList.toggle("night"),
      children: [(0, t.jsx)("span", {
       className: "t-icon t-sun",
       children: (0, t.jsxs)("svg", {
        width: "24",
        height: "24",
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "2.2",
        strokeLinecap: "round",
        children: [(0, t.jsx)("circle", {
         className: "core",
         cx: "12",
         cy: "12",
         r: "4.4",
         fill: "currentColor",
         stroke: "none"
        }), (0, t.jsxs)("g", {
         className: "rays",
         children: [(0, t.jsx)("line", {
          x1: "12",
          y1: "1.5",
          x2: "12",
          y2: "4"
         }), (0, t.jsx)("line", {
          x1: "12",
          y1: "20",
          x2: "12",
          y2: "22.5"
         }), (0, t.jsx)("line", {
          x1: "1.5",
          y1: "12",
          x2: "4",
          y2: "12"
         }), (0, t.jsx)("line", {
          x1: "20",
          y1: "12",
          x2: "22.5",
          y2: "12"
         }), (0, t.jsx)("line", {
          x1: "4.4",
          y1: "4.4",
          x2: "6.2",
          y2: "6.2"
         }), (0, t.jsx)("line", {
          x1: "17.8",
          y1: "17.8",
          x2: "19.6",
          y2: "19.6"
         }), (0, t.jsx)("line", {
          x1: "4.4",
          y1: "19.6",
          x2: "6.2",
          y2: "17.8"
         }), (0, t.jsx)("line", {
          x1: "17.8",
          y1: "6.2",
          x2: "19.6",
          y2: "4.4"
         })]
        })]
       })
      }), (0, t.jsx)("span", {
       className: "t-icon t-moon",
       children: (0, t.jsx)("svg", {
        width: "22",
        height: "22",
        viewBox: "0 0 24 24",
        fill: "currentColor",
        children: (0, t.jsx)("path", {
         d: "M21 12.8A8.5 8.5 0 1 1 11.2 3a6.6 6.6 0 0 0 9.8 9.8z"
        })
       })
      })]
     }), (0, t.jsxs)("div", {
      className: "layout-toggle",
      children: [(0, t.jsx)("button", {
       className: er ? "active" : "",
       onClick: () => en(!er),
       "aria-label": "Toggle Captions",
       children: (0, t.jsxs)("svg", {
        width: "18",
        height: "18",
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "2",
        strokeLinecap: "round",
        strokeLinejoin: "round",
        children: [(0, t.jsx)("rect", {
         x: "2",
         y: "4",
         width: "20",
         height: "16",
         rx: "2.5",
         ry: "2.5"
        }), (0, t.jsx)("path", {
         d: "M7 10h10M7 14h6"
        })]
       })
      }), (0, t.jsx)("button", {
       onClick: () => {
        ta.current && (document.fullscreenElement ? (document.exitFullscreen(), to(!1)) : (ta.current.requestFullscreen().catch(e => {
         console.error(`Error attempting to enable full-screen mode: ${e.message}`)
        }), to(!0)))
       },
       "aria-label": "Fullscreen",
       children: tl ? (0, t.jsx)(u.Minimize2, {
        size: 18
       }) : (0, t.jsx)(d.Maximize2, {
        size: 18
       })
      })]
     })]
    })]
   }), (0, t.jsxs)("div", {
    className: `body ${"dictation"===ey?"dict-mode":""}`,
    style: "dictation" === ey ? {
     "--dict-mode": "1"
    } : {},
    children: [(0, t.jsxs)("aside", {
     className: "side",
     style: {
      flexBasis: t0 + "px"
     },
     children: [(0, t.jsx)("div", {
      className: "video",
      children: si && null !== sh.current ? (0, t.jsx)(m.default, {
       videoId: si,
       opts: {
        width: "100%",
        height: "100%",
        playerVars: {
         autoplay: 1,
         start: sh.current,
         controls: 1,
         modestbranding: 1
        }
       },
       className: "absolute inset-0 [&>iframe]:w-full [&>iframe]:h-full",
       onReady: e => ev(e.target),
       onPlay: () => $(!0),
       onPause: () => $(!1)
      }) : (0, t.jsx)("div", {
       className: "w-full h-full absolute inset-0 flex items-center justify-center bg-black/80 text-white",
       children: (0, t.jsx)(a.Loader2, {
        className: "animate-spin",
        size: 32
       })
      })
     }), (0, t.jsxs)("div", {
      className: "side-pad",
      children: [(0, t.jsxs)("div", {
       className: "side-tabs",
       id: "sideTabs",
       children: [(0, t.jsxs)("button", {
        className: "side-tab active",
        children: [(0, t.jsx)("svg", {
         width: "18",
         height: "18",
         viewBox: "0 0 24 24",
         fill: "none",
         stroke: "currentColor",
         strokeWidth: "2",
         strokeLinecap: "round",
         strokeLinejoin: "round",
         children: (0, t.jsx)("path", {
          d: "M3 5h18M3 12h18M3 19h12"
         })
        }), "Phụ đề", (0, t.jsxs)("svg", {
         className: "deco",
         width: "16",
         height: "16",
         viewBox: "0 0 24 24",
         "aria-hidden": "true",
         children: [(0, t.jsx)("circle", {
          cx: "12",
          cy: "12",
          r: "10",
          fill: "#2F6FE0"
         }), (0, t.jsx)("circle", {
          cx: "12",
          cy: "12",
          r: "6",
          fill: "#fff"
         }), (0, t.jsx)("circle", {
          cx: "12",
          cy: "12",
          r: "2.6",
          fill: "#E8554E"
         })]
        })]
       }), (0, t.jsx)("div", {
        className: "speeds",
        id: "speeds",
        children: [.5, .75, 1, 1.25, 1.5].map(e => (0, t.jsxs)("button", {
         className: ed === e ? "active" : "",
         onClick: () => {
          eu(e), eb && eb.setPlaybackRate(e)
         },
         children: [e, "x"]
        }, e))
       })]
      }), (0, t.jsxs)("div", {
       className: "prog-sticky",
       children: [(0, t.jsxs)("div", {
        className: "prog-head",
        children: [(0, t.jsxs)("span", {
         className: "cnt",
         id: "dictCount",
         children: [B, "/", se.length]
        }), (0, t.jsxs)("div", {
         className: "show-toggle",
         children: ["Hiện", (0, t.jsx)("div", {
          className: er ? "switch" : "switch off",
          onClick: () => en(!er)
         })]
        })]
       }), (0, t.jsxs)("div", {
        className: "pbar-wrap",
        children: [(0, t.jsx)("div", {
         className: "pbar",
         children: (0, t.jsx)("div", {
          style: {
           width: `${B/Math.max(1,se.length-1)*100}%`
          }
         })
        }), (0, t.jsx)("div", {
         className: "road-tree",
         style: {
          left: "16%"
         }
        }), (0, t.jsx)("div", {
         className: "road-cloud",
         style: {
          left: "30%"
         }
        }), (0, t.jsx)("div", {
         className: "road-qblock",
         style: {
          left: "48%"
         }
        }), (0, t.jsx)("div", {
         className: "road-tree",
         style: {
          left: "64%"
         }
        }), (0, t.jsx)("div", {
         className: "road-bush",
         style: {
          left: "80%"
         }
        }), (0, t.jsxs)("div", {
         className: "sign-8-0",
         children: [(0, t.jsxs)("div", {
          className: "sign-board",
          children: [(0, t.jsx)("div", {
           className: "sign-top",
           children: "8.0"
          }), (0, t.jsx)("div", {
           className: "sign-bot"
          })]
         }), (0, t.jsx)("div", {
          className: "sign-stick"
         })]
        }), (0, t.jsxs)("div", {
         className: "mario-say",
         id: "marioSay",
         style: {
          left: `${B/Math.max(1,se.length-1)*100}%`
         },
         children: [Math.round(B / Math.max(1, se.length - 1) * 100), "%"]
        }), (0, t.jsx)("div", {
         className: `dino ${eh[B]&&eh[B].length>0&&eh[B][0].score>=80?"cheer":""}`,
         id: "dinoSide",
         style: {
          left: `${B/Math.max(1,se.length-1)*100}%`
         }
        })]
       })]
      }), (0, t.jsx)("div", {
       className: "slist",
       children: se.map((e, s) => (0, t.jsx)("div", {
        onClick: () => {
         D(s), eb && (eb.seekTo(e.start_time || e.startTime), eb.playVideo(), $(!0))
        },
        className: [B === s ? "sitem active" : "sitem", "dictation" === ey && sc.has(s) ? "dict-done" : ""].filter(Boolean).join(" "),
        children: B === s ? (0, t.jsxs)(t.Fragment, {
         children: [(0, t.jsxs)("div", {
          className: "achead",
          children: [(0, t.jsx)("div", {
           className: "radio",
           children: (0, t.jsx)("div", {
            className: "ic"
           })
          }), (0, t.jsxs)("div", {
           className: "snum",
           children: ["#", s + 1]
          }), (0, t.jsx)("span", {
           className: "badge-learn",
           children: "ĐANG HỌC"
          }), (0, t.jsx)("div", {
           className: "ac-actions",
           children: (0, t.jsx)("button", {
            className: "icon-btn",
            "aria-label": "Audio",
            onClick: t => {
             t.stopPropagation(), sj(e.text)
            },
            children: (0, t.jsx)(n.Volume2, {
             size: 16
            })
           })
          })]
         }), (0, t.jsxs)("div", {
          className: "stext dword",
          children: [er ? (0, t.jsx)("span", {
           className: "w-rest",
           children: e.text
          }) : "Phụ đề đã ẩn", ea && (0, t.jsx)("div", {
           style: {
            marginTop: "8px",
            color: "var(--muted)",
            fontSize: "14px",
            fontWeight: "bold"
           },
           children: ts[s] || e.vietnamese_text || "Đang dịch..."
          })]
         })]
        }) : (0, t.jsxs)(t.Fragment, {
         children: [(0, t.jsx)("div", {
          className: "radio"
         }), (0, t.jsxs)("div", {
          children: [(0, t.jsxs)("div", {
           className: "snum",
           children: ["#", s + 1]
          }), (0, t.jsxs)("div", {
           className: "stext dword",
           children: [(0, t.jsx)("span", {
            className: "w-rest",
            children: e.text
           }), sc.has(s) && (0, t.jsx)("span", {
            style: {
             fontSize: "12px",
             color: "var(--olive-700)",
             marginLeft: "6px"
            },
            children: "✓"
           })]
          })]
         })]
        })
       }, s))
      })]
     })]
    }), (0, t.jsxs)("div", {
     className: "mobile-mode-tabs",
     children: [(0, t.jsxs)("button", {
      className: "shadowing" === ey ? "active" : "",
      onClick: () => ej("shadowing"),
      children: [(0, t.jsx)(i.Mic, {
       size: 15
      }), " Shadowing"]
     }), (0, t.jsxs)("button", {
      className: "dictation" === ey ? "active" : "",
      onClick: () => ej("dictation"),
      children: [(0, t.jsx)(l.Headphones, {
       size: 15
      }), " Dictation"]
     }), (0, t.jsxs)("button", {
      onClick: t7,
      children: [(0, t.jsxs)("svg", {
       width: "15",
       height: "15",
       viewBox: "0 0 24 24",
       fill: "none",
       stroke: "currentColor",
       strokeWidth: "2",
       strokeLinecap: "round",
       strokeLinejoin: "round",
       children: [(0, t.jsx)("rect", {
        x: "3",
        y: "5",
        width: "18",
        height: "14",
        rx: "2"
       }), (0, t.jsx)("path", {
        d: "M7 9h10M7 13h6"
       }), (0, t.jsx)("circle", {
        cx: "17",
        cy: "13",
        r: "1.5",
        fill: "currentColor",
        stroke: "none"
       })]
      }), "Quiz"]
     }), (0, t.jsx)("button", {
      onClick: eM,
      disabled: "dictation" === ey ? 0 === sc.size : 0 === Object.keys(eh).length,
      style: {
       opacity: ("dictation" === ey ? 0 === sc.size : 0 === Object.keys(eh).length) ? .5 : 1
      },
      children: "Kết thúc ↗"
     }), (0, t.jsxs)("span", {
      className: "mobile-sent-counter",
      children: ["#", B + 1, " / ", se.length]
     })]
    }), (0, t.jsx)("div", {
     className: "splitter",
     onMouseDown: e => {
      e.preventDefault(), t2.current = !0, document.body.classList.add("dragging")
     },
     children: (0, t.jsx)("div", {
      className: "grip"
     })
    }), (0, t.jsxs)("main", {
     className: "main",
     children: [eN && (0, t.jsx)(V, {
      mode: ey,
      videoId: si,
      videoTitle: sd || "Bài luyện tập",
      elapsedSeconds: eE,
      completedCount: "dictation" === ey ? sc.size : Object.keys(eh).length,
      totalCount: se.length,
      stats: "shadowing" === ey ? (() => {
       let e = Object.entries(eh);
       if (0 === e.length) return null;
       let t = 0,
        s = 0,
        i = 0,
        r = 0,
        n = 0,
        a = 0,
        l = new Map,
        o = [];
       for (let [c, d] of e) {
        let e = Array.isArray(d) ? d[0] : null;
        if (!e) continue;
        for (let o of (t += e.score || 0, s++, "number" == typeof e.accuracy && (i += e.accuracy, r++), "number" == typeof e.fluency && (n += e.fluency, a++), e.wordResults || [])) {
         if ("correct" === (o.status ?? (o.correct ? "correct" : "wrong"))) continue;
         let e = String(o.word).replace(/[’‘`´]/g, "'").replace(/[^A-Za-z'-]/g, "").toLowerCase();
         e.length > 1 && l.set(e, (l.get(e) || 0) + 1)
        }
        let u = Number(c);
        o.push({
         idx: u,
         text: se[u]?.text || "",
         score: e.score || 0
        })
       }
       return 0 === s ? null : {
        avgScore: Math.round(t / s),
        avgAccuracy: r ? Math.round(i / r) : null,
        avgFluency: a ? Math.round(n / a) : null,
        errorWords: [...l.entries()].map(([e, t]) => ({
         word: e,
         count: t
        })).sort((e, t) => t.count - e.count).slice(0, 10),
        weakest: o.filter(e => e.score < 80).sort((e, t) => e.score - t.score).slice(0, 3)
       }
      })() : null,
      onJumpTo: e => {
       eS(!1), D(e);
       let t = se[e];
       eb && t && (eb.seekTo(t.start_time ?? t.startTime), eb.playVideo(), $(!0))
      },
      onDrillWord: e => {
       eS(!1), tz(e)
      },
      onClose: () => eS(!1)
     }), (0, t.jsxs)("div", {
      className: "main-inner",
      children: ["shadowing" === ey && (0, t.jsxs)("div", {
       className: "scard",
       id: "shadowView",
       children: [(0, t.jsx)("svg", {
        className: "deco deco-abs",
        style: {
         left: "-9px",
         top: "-11px",
         animation: "decobob 4s ease-in-out infinite"
        },
        width: "26",
        height: "26",
        viewBox: "0 0 24 24",
        "aria-hidden": "true",
        children: (0, t.jsx)("path", {
         d: "M12 1c.5 5.5 5 10 10.5 10.5C17 12 12.5 16.5 12 22c-.5-5.5-5-10-10.5-10.5C7 11 11.5 6.5 12 1z",
         fill: "#E9B53A"
        })
       }), (0, t.jsxs)("div", {
        className: "scard-tools",
        children: [(0, t.jsxs)("span", {
         className: "hint-item hint-tap",
         id: "hintTranslate",
         children: [(0, t.jsx)("span", {
          className: "hint-emoji",
          children: "👀"
         }), " Click the word to translate"]
        }), (0, t.jsx)("span", {
         className: "tsep",
         children: "|"
        }), (0, t.jsxs)("button", {
         className: `stool ${es?"on":""}`,
         onClick: () => ei(!es),
         children: [(0, t.jsx)("svg", {
          width: "17",
          height: "17",
          viewBox: "0 0 24 24",
          fill: "none",
          stroke: "currentColor",
          strokeWidth: "2",
          strokeLinecap: "round",
          strokeLinejoin: "round",
          children: (0, t.jsx)("path", {
           d: "M2 10v4M6 6v12M10 3v18M14 7v10M18 5v14M22 10v4"
          })
         }), "IPA"]
        }), (0, t.jsx)("span", {
         className: "tsep",
         children: "|"
        }), (0, t.jsxs)("button", {
         className: `stool ${ea?"on":""}`,
         onClick: () => el(!ea),
         children: [(0, t.jsxs)("svg", {
          width: "17",
          height: "17",
          viewBox: "0 0 24 24",
          fill: "none",
          stroke: "currentColor",
          strokeWidth: "2",
          strokeLinecap: "round",
          strokeLinejoin: "round",
          children: [(0, t.jsx)("path", {
           d: "M4 5h10M9 3v2M11 5c0 4-3 7-7 8M7 9c0 2.5 3 4.5 6 5"
          }), (0, t.jsx)("path", {
           d: "M14 21l4-9 4 9M15.5 17h5"
          })]
         }), "Dịch nghĩa"]
        })]
       }), (0, t.jsx)("div", {
        className: "sentence",
        children: er ? st?.text?.split(/\s+/).map((e, s) => (0, t.jsxs)("span", {
         className: "w",
         onClick: () => sy(e, st?.text ?? ""),
         children: [e, " "]
        }, s)) : (0, t.jsx)("span", {
         style: {
          color: "var(--muted)",
          fontStyle: "italic"
         },
         children: "Phụ đề đã ẩn. Hãy lắng nghe và lặp lại."
        })
       }), es && st?.ipa && "/.../" !== st.ipa && (0, t.jsx)("div", {
        className: "ipa",
        children: st.ipa
       }), ea && (0, t.jsxs)("div", {
        className: "vi-trans",
        children: [(0, t.jsxs)("span", {
         className: "tool-lbl",
         children: [(0, t.jsx)("span", {
          className: "tl-dot"
         }), "Dịch nghĩa"]
        }), ts[B] || st?.vietnamese_text || (0, t.jsx)("span", {
         style: {
          color: "var(--muted)",
          fontWeight: 400
         },
         children: "Đang dịch..."
        })]
       }), eh[B] && eh[B].length > 0 && !F && !eH && (0, t.jsx)("div", {
        style: {
         marginTop: "20px",
         display: "flex",
         flexDirection: "column",
         gap: "16px"
        },
        children: eh[B].map((e, s) => (0, t.jsxs)("div", {
         style: {
          padding: "16px",
          background: 0 === s ? "var(--olive-soft)" : "rgba(255,255,255,0.05)",
          borderRadius: "14px",
          border: 0 === s ? "1px solid var(--olive-300)" : "1px solid var(--line)"
         },
         children: [(0, t.jsxs)("div", {
          style: {
           display: "flex",
           justifyContent: "space-between",
           alignItems: "flex-start",
           marginBottom: "8px"
          },
          children: [(0, t.jsxs)("div", {
           style: {
            fontWeight: 900,
            color: 0 === s ? "var(--olive-700)" : "var(--ink)",
            fontSize: "20px"
           },
           children: ["Kết quả: ", e.score, "% ", 0 === s && (0, t.jsx)("span", {
            style: {
             fontSize: "11px",
             background: "#d4e7c5",
             padding: "3px 8px",
             borderRadius: "99px",
             verticalAlign: "middle",
             marginLeft: "8px",
             color: "var(--olive-700)"
            },
            children: "Mới nhất"
           }), e.algo >= 2 && (0, t.jsx)("span", {
            title: "Điểm = 70% chính xác + 30% trôi chảy",
            style: {
             fontSize: "10px",
             background: "transparent",
             border: "1px solid var(--line)",
             padding: "2px 7px",
             borderRadius: "99px",
             verticalAlign: "middle",
             marginLeft: "6px",
             color: "var(--muted)",
             fontWeight: 700,
             letterSpacing: "0.04em"
            },
            children: "THANG CHẤM MỚI"
           })]
          }), e.audioKey && (0, t.jsx)("button", {
           onClick: () => t8(e.audioKey),
           className: "history-play-btn",
           style: {
            border: 0 === s ? "1px solid var(--olive-300)" : "1px solid var(--line)",
            color: 0 === s ? "var(--olive-700)" : "var(--ink-2)",
            background: 0 === s ? "var(--panel)" : "transparent"
           },
           children: t4 === e.audioKey ? "⏹ Dừng" : "▶ Nghe lại"
          })]
         }), t4 === e.audioKey && t3[e.audioKey] && (0, t.jsx)("audio", {
          src: t3[e.audioKey],
          autoPlay: !0,
          onEnded: () => t5(null),
          style: {
           display: "none"
          }
         }), e.algo >= 2 && (0, t.jsxs)("div", {
          style: {
           fontSize: "12.5px",
           color: "var(--muted)",
           marginBottom: "8px",
           display: "flex",
           gap: "12px",
           flexWrap: "wrap",
           alignItems: "center",
           fontWeight: 600
          },
          children: [(0, t.jsxs)("span", {
           children: ["🎯 Chính xác ", (0, t.jsxs)("b", {
            style: {
             color: 0 === s ? "var(--olive-700)" : "var(--ink)"
            },
            children: [e.accuracy, "%"]
           })]
          }), (0, t.jsxs)("span", {
           children: ["🌊 Trôi chảy ", (0, t.jsx)("b", {
            style: {
             color: 0 === s ? "var(--olive-700)" : "var(--ink)"
            },
            children: "number" == typeof e.fluency ? `${e.fluency}%` : "—"
           })]
          }), e.fluVerdict && T.FLUENCY_VERDICT_LABEL[e.fluVerdict] && (0, t.jsx)("span", {
           style: {
            fontWeight: 500
           },
           children: T.FLUENCY_VERDICT_LABEL[e.fluVerdict]
          })]
         }), e.spokenText?.trim() && (0, t.jsxs)("div", {
          style: {
           fontSize: "13px",
           color: "var(--muted)",
           marginBottom: "10px",
           fontStyle: "italic"
          },
          children: ["Mình nghe thấy: “", e.spokenText.trim(), "”"]
         }), (0, t.jsx)("div", {
          style: {
           display: "flex",
           gap: "8px",
           flexWrap: "wrap"
          },
          children: e.wordResults?.map((e, s) => {
           let i = e.status ?? (e.correct ? "correct" : "wrong"),
            r = String(e.word).replace(/[’‘`´]/g, "'").replace(/[^A-Za-z'-]/g, "");
           return (0, t.jsx)("button", {
            type: "button",
            onClick: () => {
             "correct" === i ? sy(e.word) : r && tz(r)
            },
            title: "correct" === i ? "Tra nghĩa từ này" : "Luyện phát âm từ này 🎤",
            style: {
             padding: "4px 8px",
             borderRadius: "8px",
             fontSize: "13px",
             fontWeight: "bold",
             cursor: "pointer",
             ..."correct" === i ? {
              background: "#fff",
              color: "var(--olive-700)",
              border: "1px solid var(--line)"
             } : "close" === i ? {
              background: "#fff7d6",
              color: "#8a6d1a",
              border: "1px solid #e0c25a"
             } : {
              background: "#fbeceb",
              color: "#e5483f",
              border: "1px solid #e98b86"
             }
            },
            children: e.word
           }, s)
          })
         }), 0 === s && (0, t.jsxs)("div", {
          style: {
           marginTop: "12px",
           display: "flex",
           flexDirection: "column",
           gap: "8px"
          },
          children: [!e.deep && tC === B && (0, t.jsx)("button", {
           onClick: s_,
           disabled: tM,
           style: {
            alignSelf: "flex-start",
            padding: "8px 14px",
            borderRadius: "10px",
            border: "1px solid var(--olive-300)",
            background: "var(--panel)",
            color: "var(--olive-700)",
            fontSize: "13px",
            fontWeight: 800,
            cursor: tM ? "wait" : "pointer",
            opacity: tM ? .7 : 1
           },
           children: tM ? "⏳ AI đang nghe bản thu của bạn…" : "🔬 Chấm sâu AI — nghe trực tiếp bản thu"
          }), tA && (0, t.jsx)("div", {
           style: {
            fontSize: "13px",
            color: "#c0392b",
            fontWeight: 600
           },
           children: tA
          }), e.deep?.pronunciation?.words?.length > 0 && (0, t.jsx)(K.default, {
           words: e.deep.pronunciation.words,
           mispronounced: e.deep.pronunciation.mispronounced || [],
           audioBlob: tC === B ? tL : null,
           onSpeak: sj,
           micBusy: F
          })]
         })]
        }, s))
       })]
      }), "dictation" === ey && (0, t.jsxs)("div", {
       className: eD >= sw.totalLetters && sw.totalLetters > 0 ? "dict-card done" : "dict-card",
       id: "dictView",
       onClick: () => {
        sb || tO.current?.focus()
       },
       children: [(0, t.jsx)("input", {
        ref: tO,
        className: "dict-type-catcher",
        type: "text",
        inputMode: "text",
        autoComplete: "off",
        autoCorrect: "off",
        autoCapitalize: "none",
        spellCheck: !1,
        defaultValue: "",
        "aria-label": "Gõ những gì bạn nghe được",
        onKeyDown: e => {
         if (!e.metaKey && !e.altKey) {
          if (e.ctrlKey) {
           e.preventDefault(), sk();
           return
          }
          if ("Tab" === e.key) {
           e.preventDefault(), sN();
           return
          }
          if ("Enter" === e.key) {
           e.preventDefault(), sS();
           return
          }
          if ("Backspace" === e.key) {
           e.preventDefault(), sT();
           return
          }
          e.nativeEvent.isComposing || 229 === e.nativeEvent.keyCode || 1 !== e.key.length || " " === e.key || (tP.current = !0, sL(e.key), setTimeout(() => {
           tP.current = !1
          }, 0))
         }
        }
       }), (0, t.jsx)("svg", {
        className: "deco deco-abs",
        style: {
         right: "-8px",
         top: "-12px",
         animation: "decobob 4.5s ease-in-out infinite"
        },
        width: "26",
        height: "26",
        viewBox: "0 0 24 24",
        "aria-hidden": "true",
        children: (0, t.jsx)("path", {
         d: "M12 1c.5 5.5 5 10 10.5 10.5C17 12 12.5 16.5 12 22c-.5-5.5-5-10-10.5-10.5C7 11 11.5 6.5 12 1z",
         fill: "#E9B53A"
        })
       }), (0, t.jsxs)("div", {
        className: "dict-head",
        children: [(0, t.jsx)("span", {
         className: "hint-emoji",
         children: "✍️"
        }), "Type what you hear — letters reveal as you go", (0, t.jsxs)("div", {
         className: "dict-stat",
         id: "dictStat",
         children: [eD, " / ", sw.totalLetters, " ", sw.totalLetters > 0 && `\xb7 Khớp: ${Math.round(eD/sw.totalLetters*100)}%`]
        })]
       }), (0, t.jsx)("div", {
        className: "dict-sentence",
        children: sw.words.map((e, i) => e.isSpace ? (0, t.jsx)("span", {
         className: "dchar space",
         children: " "
        }, i) : (0, t.jsx)("span", {
         className: "dword2",
         onClick: () => {
          (e => {
           if (e.isSpace || 0 === e.chars.length) return;
           let t = e.chars.filter(e => e.isLetter);
           if (0 === t.length) return;
           let s = t[0].letterIndex,
            i = t[t.length - 1].letterIndex;
           eD <= s ? eW(s + 1) : eD <= i && eW(i + 1)
          })(e), eD >= sw.totalLetters && sy(e.chars.map(e => e.raw).join(""))
         },
         style: {
          cursor: "pointer"
         },
         children: e.chars.map((e, i) => (0, t.jsx)(s.default.Fragment, {
          children: e.isLetter ? (0, t.jsx)("span", {
           className: ["dchar letter", e.letterIndex < eD ? "shown" : "", e.letterIndex === eD && null === e$ ? "cursor" : "", e.letterIndex === eD && null !== e$ ? "wrong" : ""].filter(Boolean).join(" "),
           children: e.letterIndex === eD && null !== e$ ? "❌" : e.raw
          }) : (0, t.jsx)("span", {
           className: "dchar punct",
           children: e.raw
          })
         }, i))
        }, i))
       }), (0, t.jsx)("div", {
        className: "dbox-row",
        children: sw.words.filter(e => !e.isSpace).map((e, i) => (0, t.jsx)("div", {
         className: "dbox-word",
         children: e.chars.map((e, i) => (0, t.jsx)(s.default.Fragment, {
          children: e.isLetter ? (0, t.jsx)("span", {
           className: ["dbox", e.letterIndex < eD ? "filled" : "", e.letterIndex === eD && null === e$ ? "cursor" : "", e.letterIndex === eD && null !== e$ ? "pop" : ""].filter(Boolean).join(" "),
           children: e.letterIndex < eD ? e.raw : (0, t.jsx)("span", {
            className: "dot"
           })
          }) : (0, t.jsx)("span", {
           className: "dbox-punct",
           children: e.raw
          })
         }, i))
        }, i))
       }), (0, t.jsxs)("div", {
        className: "dict-bar-wrap",
        children: [(0, t.jsx)("div", {
         className: "dict-bar",
         children: (0, t.jsx)("div", {
          id: "dictBar",
          style: {
           width: `${sw.totalLetters>0?eD/sw.totalLetters*100:0}%`
          }
         })
        }), (0, t.jsx)("div", {
         className: "road-cloud",
         style: {
          left: "20%"
         }
        }), (0, t.jsx)("div", {
         className: "road-cloud",
         style: {
          left: "66%"
         }
        }), (0, t.jsx)("div", {
         className: "road-qblock",
         style: {
          left: "46%"
         }
        }), (0, t.jsx)("div", {
         className: "road-bush",
         style: {
          left: "9%"
         }
        }), (0, t.jsx)("div", {
         className: "road-bush",
         style: {
          left: "82%"
         }
        }), (0, t.jsx)("div", {
         className: "flagpole"
        }), (0, t.jsx)("div", {
         className: `dino ${eD>=sw.totalLetters&&sw.totalLetters>0?"cheer":""}`,
         id: "dinoDict",
         style: {
          left: `${sw.totalLetters>0?eD/Math.max(1,sw.totalLetters-1)*100:0}%`
         }
        }), (0, t.jsx)("div", {
         className: `yoohoo ${eD>=sw.totalLetters&&sw.totalLetters>0?"show":""}`,
         id: "yoohoo",
         children: "yoo hoo! 🇻🇳"
        })]
       }), (0, t.jsxs)("div", {
        className: "dict-actions",
        style: {
         display: "flex",
         gap: "12px",
         marginTop: "24px"
        },
        children: [(0, t.jsxs)("button", {
         className: "dbtn",
         id: "dictReveal",
         onClick: () => eW(sw.totalLetters),
         children: [(0, t.jsx)("span", {
          className: "be",
          children: "👀"
         }), " Hiện đáp án"]
        }), (0, t.jsxs)("button", {
         className: "dbtn",
         id: "dictReset",
         onClick: () => {
          eW(0), eb && st && (eb.seekTo(st.start_time || st.startTime), eb.playVideo(), $(!0))
         },
         children: [(0, t.jsx)("span", {
          className: "be",
          children: "↻"
         }), " Làm lại"]
        })]
       }), sf && eD < sw.totalLetters && (0, t.jsxs)("div", {
        className: "mt-8 w-full max-w-[500px] mx-auto flex flex-col gap-3",
        children: [(0, t.jsxs)("div", {
         className: "flex items-center gap-3",
         children: [!sb && (0, t.jsx)("button", {
          type: "button",
          onClick: () => tO.current?.focus(),
          className: "flex-1 flex items-center justify-center gap-2 h-12 bg-white border-2 border-slate-200 rounded-2xl font-black text-slate-600 uppercase tracking-widest text-sm active:scale-95 transition-all shadow-[0_3px_0_rgba(226,232,240,1)]",
          children: "⌨️ Chạm để gõ"
         }), (0, t.jsx)("button", {
          type: "button",
          onClick: () => {
           sv(e => {
            let t = !e;
            return t ? tO.current?.blur() : tO.current?.focus(), t
           })
          },
          className: `${sb?"flex-1":""} flex items-center justify-center gap-2 h-12 px-4 rounded-2xl font-black uppercase tracking-widest text-xs active:scale-95 transition-all border-2 ${sb?"bg-herb-600 border-herb-600 text-white shadow-[0_3px_0_var(--olive-700,#4a5d2a)]":"bg-white border-slate-200 text-slate-500 shadow-[0_3px_0_rgba(226,232,240,1)]"}`,
          children: sb ? "⌨️ Tắt bàn phím ảo" : "⌨️ Bàn phím ảo"
         })]
        }), sb && (0, t.jsxs)("div", {
         className: "flex flex-col gap-2",
         children: [
          [
           ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
           ["a", "s", "d", "f", "g", "h", "j", "k", "l", "'"],
           ["z", "x", "c", "v", "b", "n", "m", "-"]
          ].map((e, s) => (0, t.jsx)("div", {
           className: "flex justify-center gap-1.5 sm:gap-2",
           children: e.map(e => (0, t.jsx)("button", {
            type: "button",
            onClick: () => sL(e),
            className: "h-11 sm:h-12 flex-1 max-w-[40px] bg-white border-2 border-slate-200 rounded-xl font-black text-slate-600 uppercase hover:bg-slate-50 active:bg-slate-200 active:border-slate-400 active:scale-95 transition-all flex items-center justify-center text-sm sm:text-base shadow-[0_2px_0_rgba(226,232,240,1)]",
            children: e
           }, e))
          }, s)), (0, t.jsxs)("div", {
           className: "flex justify-center gap-1.5 sm:gap-2",
           children: [(0, t.jsx)("button", {
            type: "button",
            onClick: () => {
             eW(e => Math.max(0, e - 1)), eF(null)
            },
            className: "h-11 sm:h-12 flex-1 max-w-[120px] bg-white border-2 border-slate-200 rounded-xl font-black text-slate-600 active:bg-slate-200 active:scale-95 transition-all flex items-center justify-center text-base shadow-[0_2px_0_rgba(226,232,240,1)]",
            children: "⌫"
           }), (0, t.jsx)("button", {
            type: "button",
            onClick: sS,
            className: "h-11 sm:h-12 flex-[2] bg-herb-600 border-2 border-herb-600 rounded-xl font-black text-white uppercase tracking-widest text-xs active:scale-95 transition-all flex items-center justify-center shadow-[0_2px_0_var(--olive-700,#4a5d2a)]",
            children: "Câu tiếp →"
           })]
          })
         ]
        })]
       })]
      }), "shadowing" === ey && (0, t.jsxs)("button", {
       className: F ? "record recording" : "record",
       onClick: sM,
       children: [(0, t.jsx)("div", {
        className: "mic",
        children: eH ? (0, t.jsx)(a.Loader2, {
         className: "animate-spin",
         size: 24
        }) : (0, t.jsxs)("svg", {
         width: "24",
         height: "24",
         viewBox: "0 0 24 24",
         fill: "none",
         stroke: "currentColor",
         strokeWidth: "2.5",
         strokeLinecap: "round",
         strokeLinejoin: "round",
         children: [(0, t.jsx)("path", {
          d: "M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"
         }), (0, t.jsx)("path", {
          d: "M19 10v2a7 7 0 0 1-14 0v-2M12 19v3"
         })]
        })
       }), (0, t.jsxs)("div", {
        className: "rtxt",
        children: [(0, t.jsx)("div", {
         className: "rt1",
         children: eH ? "Đang xử lý..." : F ? "Đang ghi âm..." : "Nhấn để thu âm"
        }), (0, t.jsx)("div", {
         className: "rt2",
         children: eH ? "Vui lòng chờ" : F ? "Nhấn lần nữa để kết thúc" : "Tối đa 30 giây"
        })]
       }), (0, t.jsx)("kbd", {
        className: "key-hint",
        children: "Space"
       })]
      }), "shadowing" === ey && eq && (0, t.jsx)("div", {
       style: {
        marginTop: "14px",
        padding: "12px 16px",
        background: "#fbeceb",
        border: "1px solid #e98b86",
        borderRadius: "12px",
        color: "#c0392b",
        fontSize: "14px",
        fontWeight: 700,
        textAlign: "center"
       },
       children: eq
      }), eX && (0, t.jsx)("div", {
       onClick: () => eQ(""),
       style: {
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.55)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: "20px"
       },
       children: (0, t.jsxs)("div", {
        onClick: e => e.stopPropagation(),
        style: {
         background: "#fff",
         borderRadius: "20px",
         padding: "28px 24px",
         maxWidth: "360px",
         width: "100%",
         textAlign: "center",
         boxShadow: "0 20px 60px rgba(0,0,0,0.35)"
        },
        children: [(0, t.jsx)("div", {
         style: {
          fontSize: "44px",
          marginBottom: "10px",
          lineHeight: 1
         },
         children: "🎤"
        }), (0, t.jsx)("div", {
         style: {
          fontSize: "15px",
          fontWeight: 700,
          color: "#1e293b",
          whiteSpace: "pre-line",
          lineHeight: 1.55,
          marginBottom: "22px"
         },
         children: eX
        }), (0, t.jsxs)("div", {
         style: {
          display: "flex",
          gap: "10px"
         },
         children: [(0, t.jsx)("button", {
          onClick: () => eQ(""),
          style: {
           flex: 1,
           padding: "11px 0",
           borderRadius: "12px",
           border: "1.5px solid #cbd5e1",
           background: "#fff",
           color: "#475569",
           fontSize: "14px",
           fontWeight: 700,
           cursor: "pointer"
          },
          children: "Để sau"
         }), (0, t.jsx)("button", {
          onClick: () => {
           eQ(""), eH || F || sM()
          },
          style: {
           flex: 1.4,
           padding: "11px 0",
           borderRadius: "12px",
           border: "none",
           background: "#6A8042",
           color: "#fff",
           fontSize: "14px",
           fontWeight: 800,
           cursor: "pointer"
          },
          children: "Thu âm lại"
         })]
        })]
       })
      }), "shadowing" === ey && eY && (0, t.jsxs)("div", {
       style: {
        marginTop: "16px",
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        alignItems: "center"
       },
       children: [(0, t.jsxs)("div", {
        style: {
         fontSize: "13px",
         fontWeight: 600,
         color: "var(--muted)",
         display: "flex",
         alignItems: "center",
         gap: "8px"
        },
        children: ["Nghe lại bản thu: ", (0, t.jsx)("kbd", {
         className: "key-hint",
         children: "R"
        })]
       }), (0, t.jsx)("audio", {
        ref: tW,
        src: eY,
        controls: !0,
        style: {
         height: "36px",
         width: "100%",
         maxWidth: "300px"
        }
       }), tC === B && (0, t.jsx)("button", {
        onClick: () => {
         let e = Number(st?.start_time ?? st?.startTime),
          t = sR(st),
          s = () => {
           let e = tW.current ?? tb.current;
           e && (e.currentTime = 0, e.play().catch(() => {}))
          };
         if (eb && st && isFinite(e) && t > 0) {
          try {
           eb.seekTo(e), eb.playVideo(), $(!0)
          } catch {}
          setTimeout(() => {
           try {
            eb.pauseVideo()
           } catch {}
           $(!1), s()
          }, t / ed * 1e3 + 150)
         } else s()
        },
        style: {
         padding: "7px 14px",
         borderRadius: "99px",
         border: "1px solid var(--olive-300)",
         background: "transparent",
         color: "var(--olive-700)",
         fontSize: "13px",
         fontWeight: 800,
         cursor: "pointer"
        },
        title: "Phát câu mẫu rồi phát ngay bản thu của bạn",
        children: "🔁 So sánh mẫu ↔ bạn"
       })]
      }), (0, t.jsxs)("div", {
       className: "playback",
       children: [(0, t.jsxs)("button", {
        className: "pb3d pb-prev",
        onClick: () => {
         if (B > 0) {
          let e = se[B - 1];
          D(B - 1), eb && e && (eb.seekTo(e.start_time || e.startTime), eb.playVideo(), $(!0))
         }
        },
        disabled: 0 === B,
        style: {
         opacity: 0 === B ? .5 : 1
        },
        children: [(0, t.jsx)("div", {
         className: "pbico",
         children: (0, t.jsx)(o.SkipBack, {
          size: 20,
          strokeWidth: 2.5
         })
        }), (0, t.jsx)("span", {
         className: "pl",
         children: "Câu trước"
        }), (0, t.jsx)("kbd", {
         children: "Ctrl"
        })]
       }), (0, t.jsxs)("button", {
        className: "pb3d pb-replay",
        onClick: () => {
         let e = se[B];
         eb && e && (eb.seekTo(e.start_time || e.startTime), eb.playVideo(), $(!0))
        },
        children: [(0, t.jsx)("div", {
         className: "pbico",
         children: (0, t.jsx)(r.RotateCcw, {
          size: 20,
          strokeWidth: 2.5
         })
        }), (0, t.jsx)("span", {
         className: "pl",
         children: "Nghe lại"
        }), (0, t.jsx)("kbd", {
         children: "Tab"
        })]
       }), (0, t.jsxs)("button", {
        className: "pb3d pb-next",
        onClick: () => {
         if (B < se.length - 1) {
          let e = se[B + 1];
          D(B + 1), eb && e && (eb.seekTo(e.start_time || e.startTime), eb.playVideo(), $(!0))
         }
        },
        disabled: B === se.length - 1,
        style: {
         opacity: B === se.length - 1 ? .5 : 1
        },
        children: [(0, t.jsx)("div", {
         className: "pbico",
         children: (0, t.jsx)(c.SkipForward, {
          size: 20,
          strokeWidth: 2.5
         })
        }), (0, t.jsx)("span", {
         className: "pl",
         children: "Câu sau"
        }), (0, t.jsx)("kbd", {
         children: "Enter"
        })]
       })]
      })]
     })]
    })]
   }), e6 && e0 && (0, t.jsxs)("div", {
    className: "fixed inset-0 z-[200] flex items-center justify-center p-4",
    onClick: () => e8(!1),
    children: [(0, t.jsx)("div", {
     className: "absolute inset-0 bg-black/40 backdrop-blur-sm"
    }), (0, t.jsxs)("div", {
     className: "relative bg-white text-slate-900 rounded-[28px] p-6 w-full max-w-sm shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200",
     onClick: e => e.stopPropagation(),
     children: [(0, t.jsx)("button", {
      onClick: () => e8(!1),
      className: "absolute top-4 right-4 text-slate-400 hover:text-slate-800 transition-colors",
      children: (0, t.jsx)(h.X, {
       size: 18
      })
     }), (0, t.jsxs)("div", {
      className: "flex items-center gap-3 mb-3 pr-6",
      children: [(0, t.jsx)("h4", {
       className: "text-xl font-black text-slate-800 capitalize",
       children: e0
      }), (0, t.jsx)("button", {
       onClick: () => sj(e0),
       className: "text-herb-600 hover:scale-110 transition-transform disabled:opacity-30",
       disabled: e5,
       children: (0, t.jsx)(n.Volume2, {
        size: 20
       })
      })]
     }), e5 ? (0, t.jsxs)("div", {
      className: "space-y-2 animate-pulse",
      children: [(0, t.jsx)("div", {
       className: "h-3 w-20 bg-slate-200 rounded"
      }), (0, t.jsx)("div", {
       className: "h-3 w-full bg-slate-200 rounded"
      })]
     }) : (0, t.jsxs)(t.Fragment, {
      children: [(0, t.jsx)("p", {
       className: "text-sm font-mono text-herb-600 mb-3",
       children: e2?.phonetic || "/.../"
      }), e2?.vietnamese && (0, t.jsxs)("div", {
       className: "mb-3 px-3 py-2 bg-herb-50 rounded-xl border border-herb-100",
       children: [(0, t.jsx)("span", {
        className: "text-[9px] font-black text-herb-500 uppercase tracking-widest block mb-0.5",
        children: "Tiếng Việt"
       }), (0, t.jsx)("p", {
        className: "text-sm font-black text-herb-700",
        children: e2.vietnamese
       })]
      }), e2?.error ? (0, t.jsx)("p", {
       className: "text-sm font-bold text-slate-500 italic mb-3",
       children: e2.error
      }) : (0, t.jsx)("p", {
       className: "text-sm font-bold leading-relaxed text-slate-500 mb-4",
       children: e2?.meanings?.[0]?.definitions?.[0]?.definition || "Chưa tìm thấy nghĩa bạn ơi 🤔"
      }), (0, t.jsx)(p.default, {
       word: e0 ?? "",
       definition: e2?.vietnamese || e2?.meanings?.[0]?.definitions?.[0]?.definition || "",
       example: e2?.meanings?.[0]?.definitions?.[0]?.example || "",
       source: "shadowing",
       variant: "full",
       size: "md",
       dropdownPosition: "up",
       dropdownAlign: "center"
      })]
     })]
    })]
   }), tR && (0, t.jsx)(U.default, {
    word: tR,
    source: "shadowing_drill",
    micBusy: F,
    onSpeak: sj,
    onClose: () => tz(null)
   }), (0, t.jsx)(J.default, {
    open: tB,
    onClose: () => tD(!1),
    title: "Chấm sâu AI là quyền lợi TIDian",
    body: "AI nghe trực tiếp bản thu của bạn và chỉ ra từng âm đọc sai — kèm IPA chuẩn và bài luyện lại tại chỗ. Quyền lợi này dành riêng cho gói TIDian."
   }), (0, t.jsx)(g.AnimatePresence, {
    children: tH && (0, t.jsx)(f.motion.div, {
     initial: {
      opacity: 0
     },
     animate: {
      opacity: 1
     },
     exit: {
      opacity: 0
     },
     className: "fixed inset-0 z-[100] bg-black/70 backdrop-blur-md flex items-center justify-center p-4",
     children: (0, t.jsx)(f.motion.div, {
      initial: {
       scale: .88,
       y: 24,
       opacity: 0
      },
      animate: {
       scale: 1,
       y: 0,
       opacity: 1
      },
      exit: {
       scale: .88,
       y: 24,
       opacity: 0
      },
      transition: {
       type: "spring",
       stiffness: 340,
       damping: 28
      },
      className: "relative w-full max-w-sm overflow-hidden rounded-3xl shadow-2xl",
      onClick: e => e.stopPropagation(),
      children: (0, t.jsxs)("div", {
       style: {
        background: "linear-gradient(145deg, #1a2010 0%, #252e14 60%, #1e2812 100%)",
        border: "1.5px solid rgba(122,157,49,.35)"
       },
       className: "rounded-3xl p-8 text-center",
       children: [(0, t.jsx)("div", {
        style: {
         background: "rgba(110,124,63,.22)",
         border: "1.5px solid rgba(122,157,49,.4)"
        },
        className: "w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6",
        children: (0, t.jsxs)("svg", {
         width: "32",
         height: "32",
         viewBox: "0 0 24 24",
         fill: "none",
         stroke: "#a3b86a",
         strokeWidth: "2.2",
         strokeLinecap: "round",
         strokeLinejoin: "round",
         children: [(0, t.jsx)("path", {
          d: "M12 2a10 10 0 1 1 0 20A10 10 0 0 1 12 2z"
         }), (0, t.jsx)("polyline", {
          points: "12 6 12 12 16 14"
         })]
        })
       }), (0, t.jsx)("h2", {
        style: {
         color: "#e8edcf"
        },
        className: "text-2xl font-black mb-2 tracking-tight",
        children: "Tiếp tục bài học?"
       }), tX ? (0, t.jsxs)("p", {
        style: {
         color: "#8fa06a"
        },
        className: "text-sm font-medium mb-8 leading-relaxed",
        children: ["Bài này vừa được ngắt câu lại cho khớp lời nói hơn.", (0, t.jsx)("br", {}), "Đã giữ lại ", (0, t.jsxs)("b", {
         style: {
          color: "#e8edcf"
         },
         children: [tX.carried, " câu"]
        }), " bạn luyện", tX.dropped > 0 && (0, t.jsxs)(t.Fragment, {
         children: ["; ", (0, t.jsxs)("b", {
          style: {
           color: "#e8edcf"
          },
          children: [tX.dropped, " câu"]
         }), " đổi cách ngắt cần luyện lại"]
        }), "."]
       }) : (0, t.jsxs)("p", {
        style: {
         color: "#8fa06a"
        },
        className: "text-sm font-medium mb-8 leading-relaxed",
        children: ["Bạn đang học dở bài Shadowing này.", (0, t.jsx)("br", {}), "Muốn học tiếp và giữ điểm số cũ không?"]
       }), (0, t.jsxs)("div", {
        className: "flex flex-col gap-3",
        children: [(0, t.jsx)("button", {
         onClick: () => sx(!0),
         style: {
          background: "linear-gradient(135deg, #7a9d31, #6e7c3f)",
          color: "#fff",
          boxShadow: "0 4px 18px rgba(110,124,63,.45)"
         },
         className: "w-full font-black py-4 rounded-2xl text-base transition-all hover:brightness-110 active:scale-95",
         children: "▶ Học tiếp"
        }), (0, t.jsx)("button", {
         onClick: () => sx(!1),
         style: {
          background: "rgba(255,255,255,.06)",
          color: "#c4cfa0",
          border: "1.5px solid rgba(196,207,160,.25)"
         },
         className: "w-full font-bold py-4 rounded-2xl text-base transition-all hover:bg-white/10 active:scale-95",
         children: "↺ Làm lại từ đầu"
        })]
       })]
      })
     })
    })
   })]
  })
 }
 e.s(["default", 0, function({
  params: e
 }) {
  let i = (0, s.use)(e);
  return (0, t.jsx)(s.Suspense, {
   fallback: (0, t.jsx)("div", {
    className: "h-screen bg-[#050914] flex items-center justify-center",
    children: (0, t.jsx)(a.Loader2, {
     className: "animate-spin text-herb-600",
     size: 48
    })
   }),
   children: (0, t.jsx)(Z, {
    lessonId: i.lessonId
   })
  })
 }], 651731)
}]);