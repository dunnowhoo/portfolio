import { Experience, Project, Achievement, Organization } from './types';

export const TECH_STACK = [
  'flutter', 'dart', 'js', 'ts', 'react', 'nextjs', 'vue', 'tailwind',
  'py', 'pytorch', 'tensorflow', 'sklearn', 'opencv',
  'java', 'spring', 'nestjs', 'fastapi', 'django',
  'postgres', 'redis', 'supabase', 'docker', 'gcp', 'aws',
  'git', 'postman', 'selenium'
];

export const ORGANIZATIONS: Organization[] = [
  {
    id: 1,
    role: "Director of Mobile Development",
    org: "RISTEK Fasilkom UI",
    period: "2026 - 2027",
    description: "",
    category: "Tech",
    link: "https://www.ristek.cs.ui.ac.id/"
  },
  {
    id: 2,
    role: "PIC of Sponsorship",
    org: "COMPFEST",
    period: "Jan 2025 - Dec 2025",
    description: "Acquired and built partnerships with 5+ major sponsors (Google Cloud, NTT Data, Ottersec). Secured IDR 200M+ in funding via end-to-end pitching.",
    category: "Science & Tech",
    link: "https://compfest.id/"
  },
  {
    id: 3,
    role: "Vice President",
    org: "MATA UI",
    period: "Nov 2024 - Nov 2025",
    description: "Led the off-campus association for Purwakarta students, managing 82 members and organizing visits to 12 schools to inspire local students.",
    category: "Leadership",
    link: "https://www.instagram.com/mata_ui/"
  },
  {
    id: 4,
    role: "Youth Conference Delegate",
    org: "AIESEC in Vietnam",
    period: "Nov 2020",
    description: "Participated in 'Leadership & Opportunities' conference with 200 delegates from Vietnam, Indonesia, and Myanmar focused on SDG 4: Quality Education.",
    category: "Education"
  }
];

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 5,
    title: "2nd Runner Up Datathon",
    description: "Datathon RISTEK Fasilkom UI 2026",
    icon: "military_tech"
  },
  {
    id: 0,
    title: "Awardee Scholarship",
    description: "Pertamina Sobat Bumi 2025",
    icon: "school"
  },
  {
    id: 1,
    title: "1st Winner Business Case",
    description: "Brawijaya Dialogue Nexgen 2025",
    icon: "emoji_events"
  },
  {
    id: 2,
    title: "2nd Winner Hackathon",
    description: "Hacksphere by KAI & PresUniv",
    icon: "trophy"
  },
  {
    id: 3,
    title: "Finalist Web3 Hackathon",
    description: "OJK & EKRAF Hackathon 2025",
    icon: "workspace_premium"
  },
  {
    id: 4,
    title: "Finalist Software Dev",
    description: "ITFest IPB 2025",
    icon: "code"
  }
];

export const EXPERIENCES: Experience[] = [
  {
    id: 6,
    role: "AI Solutions Engineer",
    company: "Halo AI",
    period: "Jun 2026 – Sep 2026",
    description: "Built production AI agents across WhatsApp, Shopee, and Instagram for 24/7 sales and customer support. Engineered RAG pipelines with custom tool-calling and strict guardrails to pull live pricing, schedules, and catalog data without hallucination. Automated B2B SOPs into appointment scheduling, CRM ticketing, invoicing, and human-agent escalation, backed by auto-grader evaluation suites and multi-turn stress tests.",
    tech: ["LLM Agents", "RAG", "Tool Calling", "WhatsApp API", "AI Evaluation"]
  },
  {
    id: 1,
    role: "AI Engineer",
    company: "EMS Paramitra",
    period: "Mar 2026 – Jun 2026",
    description: "Architected a Hybrid Search engine combining OpenAI semantic embeddings and PostgreSQL fuzzy search, achieving >95% OCR accuracy for the BankSoal platform. Developed a scalable ML auto-classification system (KNN + category centroid embeddings) to automate the question bank ecosystem and reduce manual operations. Leveraged cloud-based LLM APIs (OpenRouter) to build an end-to-end OCR cleaning pipeline for enterprise content management.",
    tech: ["Python", "PostgreSQL", "OCR", "OpenRouter", "OpenAI Embeddings", "KNN"]
  },
  {
    id: 2,
    role: "Fullstack Engineer Intern",
    company: "Telkom Indonesia",
    period: "Feb 2026 – Apr 2026",
    description: "Engineered 5 scalable B2B MVPs for the Digital Solution Catalog using React and NestJS. Implemented clean code architecture and ensured highly reliable integrations.",
    tech: ["React", "NestJS", "PostgreSQL", "Docker"]
  },
  {
    id: 3,
    role: "Mobile Developer",
    company: "TVRI Nasional",
    period: "Jun 2025 – Dec 2025",
    description: "Engineered core engagement features for TVRI Citizen Journalism app, implemented real-time WebSocket chat, and managed Apple App Store deployment.",
    tech: ["Flutter", "WebSockets", "iOS"]
  },
  {
    id: 4,
    role: "Software Engineer Intern",
    company: "Techno Glow Innovation",
    period: "Jul 2025 - Aug 2025",
    description: "Developed AI-powered B2B skincare simulator features using Zapier and ElevenLabs. Optimized Django backend latency for real-time generation.",
    tech: ["Django", "Python", "Zapier"],
    link: "https://ai.iziapp.id/technobsim"
  },
  {
    id: 5,
    role: "Teaching Assistant",
    company: "Fasilkom UI",
    period: "Jan 2025 – Jun 2025",
    description: "TA for Principles of Information Systems. Mentored 200+ students (9% acceptance rate) and provided actionable feedback.",
    tech: ["Teaching", "Mentoring"]
  }
];

export const PROJECTS: Project[] = [
  {
    id: 13,
    title: "DermatoAI",
    description: "2nd Runner Up Datathon RISTEK 2026. Multimodal agentic AI for skin lesion triage and last-mile care navigation. Two ONNX models (EfficientNet-B0 oncology, AUC 0.936; ConvNeXt-Tiny for 9 common conditions) fuse the photo with patient history. A deterministic, code-enforced Safety Gate owns urgency, not the LLM: it can retake, abstain, or escalate, blocks OTC products for suspected malignancy, and routes users to a doctor or to PubMed-backed self-care. Built the FastAPI backend, FSM agent orchestrator, and Cloud Run CI/CD.",
    image: "/assets/project/DermatoAI/dermato.png",
    images: [
      "/assets/project/DermatoAI/dermato.png"
    ],
    category: "AI/Data",
    techStack: ["py", "pytorch", "nextjs", "ts", "postgres", "docker"],
    links: [
      { type: "github", url: "https://github.com/dunnowhoo/dermato-ai" },
      { type: "url", url: "https://huggingface.co/dunnowho/dermatoai-multimodal" },
      { type: "url", url: "https://dermato-2vismcfva-fauzan-putra-sanjayas-projects.vercel.app/appointments" }
    ],
    embed: `<div style="position: relative; width: 100%; height: 0; padding-top: 56.2500%;
 padding-bottom: 0; box-shadow: 0 2px 8px 0 rgba(63,69,81,0.16); margin-top: 1.6em; margin-bottom: 0.9em; overflow: hidden;
 border-radius: 8px; will-change: transform;">
  <iframe loading="lazy" style="position: absolute; width: 100%; height: 100%; top: 0; left: 0; border: none; padding: 0;margin: 0;"
    src="https://www.canva.com/design/DAHVL4ua_i0/Q78OK3RY7mz2KY5G0o8MDw/view?embed" allowfullscreen="allowfullscreen" allow="fullscreen">
  </iframe>
</div>
<a href="https:&#x2F;&#x2F;www.canva.com&#x2F;design&#x2F;DAHVL4ua_i0&#x2F;Q78OK3RY7mz2KY5G0o8MDw&#x2F;view?utm_content=DAHVL4ua_i0&amp;utm_campaign=designshare&amp;utm_medium=embeds&amp;utm_source=link" target="_blank" rel="noopener">Salinan dari [Draf] Pitch Deck - NAGA CIPUTAT</a> oleh Fauzan Putra.S`
  },
  {
    id: 14,
    title: "DKE Smart Sales & CRM",
    description: "Enterprise omnichannel sales and customer care platform for a major aesthetic clinic, built on Next.js 16 and an Odoo 17 backend. Features a real-time multi-session WhatsApp Shared Inbox (SSE + Redis Pub/Sub) with atomic SQL locking for race-free ticket claiming, internal ticketing between Customer Care and Expert Staff, promo broadcasts, Shopee transaction sync, and analytics dashboards. Deployed with immutable Docker images on GCP Compute Engine and Cloud SQL as Lead Programmer & Cloud Architect.",
    image: "/assets/project/DKE/dke.png",
    images: [
      "/assets/project/DKE/dke.png"
    ],
    category: "Web",
    techStack: ["nextjs", "ts", "tailwind", "py", "postgres", "docker"],
    links: [
      { type: "github", url: "https://github.com/dunnowhoo/dke-be" },
      { type: "github", url: "https://github.com/dunnowhoo/dke-fe" },
      { type: "url", url: "https://propenheimer.vercel.app" }
    ],
    embed: `<div style="position: relative; width: 100%; height: 0; padding-top: 56.2500%;
 padding-bottom: 0; box-shadow: 0 2px 8px 0 rgba(63,69,81,0.16); margin-top: 1.6em; margin-bottom: 0.9em; overflow: hidden;
 border-radius: 8px; will-change: transform;">
  <iframe loading="lazy" style="position: absolute; width: 100%; height: 100%; top: 0; left: 0; border: none; padding: 0;margin: 0;"
    src="https://www.canva.com/design/DAHMp62zdq0/IXG8lq2VBMToI9Ig_0rhdw/view?embed" allowfullscreen="allowfullscreen" allow="fullscreen">
  </iframe>
</div>
<a href="https:&#x2F;&#x2F;www.canva.com&#x2F;design&#x2F;DAHMp62zdq0&#x2F;IXG8lq2VBMToI9Ig_0rhdw&#x2F;view?utm_content=DAHMp62zdq0&amp;utm_campaign=designshare&amp;utm_medium=embeds&amp;utm_source=link" target="_blank" rel="noopener">DKE Smart Sales</a> oleh Fauzan Putra.S`
  },
  {
    id: 15,
    title: "Saka : Psychological Assessment App",
    description: "Resilience & mental health mobile app funded by the BIMA research grant. Users take the K-10 mental health assessment, enriched by an AI stimulus stage where recorded video and audio run through asynchronous facial and speech emotion recognition, plus an RRM resilience questionnaire, assessment history, and gated psychoeducation (topic → material → quiz, pass mark ≥ 85). Flutter with Clean Architecture (BLoC/Cubit, get_it, go_router) on Supabase Auth, Postgres RLS, Storage, and Edge Functions.",
    image: "/assets/project/Saka/saka.png",
    images: [
      "/assets/project/Saka/saka.png"
    ],
    category: "Mobile",
    techStack: ["flutter", "dart", "supabase", "postgres", "py"],
    links: []
  },
  {
    id: 16,
    title: "Almanac : Crypto Quant System",
    description: "Quantitative crypto futures trading system. An 11-strategy tournament across 46 coins produced a momentum-based ensemble, re-validated on 88 coins over 6 years with a Deflated Sharpe Ratio check and cross-exchange validation on Binance with no parameter changes. Ships with a Python engine for paper trading, an order-flow collector, and a Next.js dashboard on public Bybit v5 data for daily signals, position sizing, Monte Carlo projections, and a trade journal. The TypeScript strategy port matches the Python engine bar-for-bar (7,100/7,100).",
    image: "/assets/project/Almanac/almanac.png",
    images: [
      "/assets/project/Almanac/almanac.png"
    ],
    category: "AI/Data",
    techStack: ["py", "nextjs", "ts", "supabase"],
    links: []
  },
  {
    id: 17,
    title: "Rekap AI : Monthly Spending Tracker",
    description: "Turns Bank Mandiri and BCA e-Statement PDFs into a clean monthly finance recap with automatic transaction extraction, category classification, and a cash-flow dashboard. Classification runs in two deliberate stages: deterministic rules (177 known merchants plus structural patterns) first, then Groq LLM only for unrecognized merchants. Benchmarked on 204 unique merchants, letting the LLM override confident rules lowered accuracy, so the model never overrides them and any LLM failure falls back to rules safely.",
    image: "/assets/project/RekapAI/rekap.png",
    images: [
      "/assets/project/RekapAI/rekap.png"
    ],
    category: "AI/Data",
    techStack: ["nextjs", "ts", "supabase", "postgres", "tailwind"],
    links: [
      { type: "url", url: "https://www.rekap-ai.com/" }
    ]
  },
  {
    id: 1,
    title: "KAI Pandu",
    description: "AI-powered accessibility app for visually impaired train passengers with voice commands & computer vision.",
    image: "/assets/project/KAI-Pandu/kaipandu.png",
    images: [
      "https://images.unsplash.com/photo-1474487548417-781cb714c2f0?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1515165592879-1849288ec97a?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&q=80&w=800"
    ],
    category: "AI/Data",
    techStack: ["nextjs", "ts", "supabase", "py"],
    links: [
      { type: "url", url: "https://kai-pandu.vercel.app/" }
    ],
    embed: `<div style="position: relative; width: 100%; height: 0; padding-top: 56.2500%;
 padding-bottom: 0; box-shadow: 0 2px 8px 0 rgba(63,69,81,0.16); margin-top: 1.6em; margin-bottom: 0.9em; overflow: hidden;
 border-radius: 8px; will-change: transform;">
  <iframe loading="lazy" style="position: absolute; width: 100%; height: 100%; top: 0; left: 0; border: none; padding: 0;margin: 0;"
    src="https://www.canva.com/design/DAG0zfBzbKs/_zu3ipfjttUT2w95uxUldw/view?embed" allowfullscreen="allowfullscreen" allow="fullscreen">
  </iframe>
</div>
<a href="https:&#x2F;&#x2F;www.canva.com&#x2F;design&#x2F;DAG0zfBzbKs&#x2F;_zu3ipfjttUT2w95uxUldw&#x2F;view?utm_content=DAG0zfBzbKs&amp;utm_campaign=designshare&amp;utm_medium=embeds&amp;utm_source=link" target="_blank" rel="noopener">KAInnovators_KAIPandu_Hacksphere2025</a> oleh Fauzan Putra.S`
  },
  {
    id: 2,
    title: "Jejakriya Protocol",
    description: "Web3 Trust & Liquidity Protocol for the Creative Economy on Sepolia testnet.",
    image: "/assets/project/JejaKriya/jejakriya.png",
    images: [
      "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1621504450168-38f647311816?auto=format&fit=crop&q=80&w=800"
    ],
    category: "Web",
    techStack: ["nextjs", "ts", "git"],
    links: [
      { type: "url", url: "https://jejakriya.vercel.app/" }
    ],
    embed: `<div style="position: relative; width: 100%; height: 0; padding-top: 56.2500%;
 padding-bottom: 0; box-shadow: 0 2px 8px 0 rgba(63,69,81,0.16); margin-top: 1.6em; margin-bottom: 0.9em; overflow: hidden;
 border-radius: 8px; will-change: transform;">
  <iframe loading="lazy" style="position: absolute; width: 100%; height: 100%; top: 0; left: 0; border: none; padding: 0;margin: 0;"
    src="https://www.canva.com/design/DAG438UGrrg/jFC-cycclPu3JzvpUYD2nA/view?embed" allowfullscreen="allowfullscreen" allow="fullscreen">
  </iframe>
</div>
<a href="https:&#x2F;&#x2F;www.canva.com&#x2F;design&#x2F;DAG438UGrrg&#x2F;jFC-cycclPu3JzvpUYD2nA&#x2F;view?utm_content=DAG438UGrrg&amp;utm_campaign=designshare&amp;utm_medium=embeds&amp;utm_source=link" target="_blank" rel="noopener">Pitch Deck - JejaKriya Protocol</a> oleh Fauzan Putra.S`
  },
  {
    id: 3,
    title: "TVRI Journalism",
    description: "Citizen journalism mobile application with real-time chat and video reporting features.",
    image: "/assets/project/TVRI/TVRI.png",
    images: [
      "/assets/project/TVRI/TVRI.png",
    ],
    category: "Mobile",
    techStack: ["flutter", "dart", "git"],
    links: [
      { type: "playstore", url: "https://play.google.com/store/apps/details?id=com.tvri.citizenjournalism&hl=en" }
    ]
  },
  {
    id: 4,
    title: "SRE UI ReEnergize",
    description: "Official summit platform promoting renewable energy transition in Indonesia with competition and event management.",
    image: "/assets/project/SRE/sre.png",
    images: [
      "/assets/project/SRE/sre.png"
    ],
    category: "Web",
    techStack: ["js", "tailwind", "html", "django"],
    links: [
      { type: "url", url: "https://sreui.com/" }
    ]
  },
  {
    id: 5,
    title: "Westeros App",
    description: "A Game of Thrones companion app featuring immersive character lore and world details using public APIs.",
    image: "https://i.imgur.com/Ys0xU1l.png",
    images: [
      "https://i.imgur.com/Ys0xU1l.png",
      "https://i.imgur.com/cX5hcmJ.jpeg",
      "https://i.imgur.com/BkLwe01.jpeg",
      "https://i.imgur.com/GEtEqXF.jpeg",
      "https://i.imgur.com/97AfDhJ.jpeg",
      "https://i.imgur.com/Z1z2BgA.jpeg",
      "https://i.imgur.com/0dPsZAy.jpeg",
      "https://i.imgur.com/nEJ1qzC.jpeg",
      "https://i.imgur.com/pESiB3g.jpeg"
    ],
    category: "Mobile",
    techStack: ["flutter", "dart"],
    links: [
      { type: "github", url: "https://github.com/dunnowhoo/westeros-app" }
    ]
  },
  {
    id: 6,
    title: "EpiTrack",
    description: "GEMASTIK XVII surveillance system for detecting and monitoring Dengue & TBC outbreaks in smart cities.",
    image: "/assets/project/EpiTrack/epitrack.png",
    images: [
      "/assets/project/EpiTrack/epitrack.png"
    ],
    category: "Smart City",
    techStack: ["figma"],
    links: [
      { type: "docs", url: "https://docs.google.com/document/d/1aXf6AcNuqNbqkbil77RP-iz0nk7S0fIW_PV2T10M7rM/edit?usp=sharing" },
      { type: "youtube", url: "https://youtu.be/cp5KDpKXKYA?si=4iYLaTWmcwTpR86_" },
      { type: "figma", url: "https://www.figma.com/design/4MIUZ8Sapa8DqZwybHxDHM/YouTopia?node-id=0-1" }
    ],
    embed: `<iframe width="560" height="315" src="https://www.youtube.com/embed/cp5KDpKXKYA?si=7TmeQX9p3M-wgAC3" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`
  },
  {
    id: 7,
    title: "Emoji Inpainting",
    description: "High-fidelity image restoration system using Conditional GANs (Pix2Pix) and U-Net Generator.",
    image: "/assets/project/Emoji/Emoji.png",
    images: [
      "/assets/project/Emoji/Emoji.png",
      "/assets/project/Emoji/emoji2.png"
    ],
    category: "AI/Data",
    techStack: ["pytorch", "py", "tensorflow"],
    links: [
      { type: "github", url: "https://github.com/dunnowhoo/image-inpainting" }
    ]
  },
  {
    id: 8,
    title: "Vehicle Rental System",
    description: "Fullstack enterprise rental platform with Spring Boot, Docker, and Vue.js frontend.",
    image: "/assets/project/VehicleRental/vehicle.png",
    images: [
      "/assets/project/VehicleRental/vehicle.png",
      "/assets/project/VehicleRental/vehicle2.png"
    ],
    category: "Web",
    techStack: ["java", "spring", "vue", "docker", "aws"],
    links: [
      { type: "github", url: "https://github.com/dunnowhoo/vehiclerental-fe" },
      { type: "github", url: "https://github.com/dunnowhoo/vehiclerental-be" }
    ]
  },
  {
    id: 9,
    title: "Cross-Platform Social Media Stance Analysis",
    description: "Developed a Multi-layered Hybrid Analytical Framework to analyze public discourse regarding the 2025 DPR Demonstrations across X (Twitter) and YouTube, processing over 35,000 clean data points. Fine-tuned the IndoBERTweet transformer model for contextual stance analysis, achieving a superior accuracy of 85.90% compared to traditional models like SVM and XGBoost, enabling precise target-specific sentiment detection against actors (Government, Police, Protesters). Implemented Lexical Mutation Clustering using multilingual-e5-small embeddings and Louvain Community Detection to identify evolving narratives and slang (e.g., 'Mulyono', 'Gedung Kura-kura') often missed by traditional keyword tracking.",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800",
    images: [
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=800"
    ],
    category: "AI/Data",
    techStack: ["py", "sklearn", "selenium"],
    links: [
      { type: "github", url: "https://github.com/dunnowhoo/socialmedia-stance-analysis" }
    ],
    embed: `<div style="position: relative; width: 100%; height: 0; padding-top: 56.2500%;
 padding-bottom: 0; box-shadow: 0 2px 8px 0 rgba(63,69,81,0.16); margin-top: 1.6em; margin-bottom: 0.9em; overflow: hidden;
 border-radius: 8px; will-change: transform;">
  <iframe loading="lazy" style="position: absolute; width: 100%; height: 100%; top: 0; left: 0; border: none; padding: 0;margin: 0;"
    src="https://www.canva.com/design/DAHAp9mx_pw/T9DJgsSGYbz9HMJ3IJh_wg/view?embed" allowfullscreen="allowfullscreen" allow="fullscreen">
  </iframe>
</div>
<a href="https:&#x2F;&#x2F;www.canva.com&#x2F;design&#x2F;DAHAp9mx_pw&#x2F;T9DJgsSGYbz9HMJ3IJh_wg&#x2F;view?utm_content=DAHAp9mx_pw&amp;utm_campaign=designshare&amp;utm_medium=embeds&amp;utm_source=link" target="_blank" rel="noopener">Salinan dari TugasKelompok3_akar17plus8_Slide</a> oleh Fauzan Putra.S`
  },
  {
    id: 10,
    title: "MoodTune",
    description: "Aplikasi kesejahteraan emosional yang menggabungkan mood journaling, analitik emosional, dan rekomendasi musik harian berbasis AI + Spotify.",
    image: "/assets/project/MoodTune/moodtune.png",
    images: [
      "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1514525253440-b393452e8d26?auto=format&fit=crop&q=80&w=800"
    ],
    category: "Mobile",
    techStack: ["flutter", "gemini"],
    links: [
      { type: "github", url: "https://github.com/mobilekenatilang/moodtune" }
    ],
    embed: `<div style="position: relative; width: 100%; height: 0; padding-top: 56.2500%;
 padding-bottom: 0; box-shadow: 0 2px 8px 0 rgba(63,69,81,0.16); margin-top: 1.6em; margin-bottom: 0.9em; overflow: hidden;
 border-radius: 8px; will-change: transform;">
  <iframe loading="lazy" style="position: absolute; width: 100%; height: 100%; top: 0; left: 0; border: none; padding: 0;margin: 0;"
    src="https://www.canva.com/design/DAGuEJ8kWQA/3t-_MIgztk_Pn5vpHT1R6w/view?embed" allowfullscreen="allowfullscreen" allow="fullscreen">
  </iframe>
</div>
<a href="https:&#x2F;&#x2F;www.canva.com&#x2F;design&#x2F;DAGuEJ8kWQA&#x2F;3t-_MIgztk_Pn5vpHT1R6w&#x2F;view?utm_content=DAGuEJ8kWQA&amp;utm_campaign=designshare&amp;utm_medium=embeds&amp;utm_source=link" target="_blank" rel="noopener">SoftwareDevelopment_MobileKenaTilang_PitchDeck</a> oleh Fauzan Putra.S`
  },
  {
    id: 11,
    title: "SIZOPI : Zoo Information System",
    description: "Integrated Supabase backend for a Next.js frontend to manage exhibits and reservations. Authored SQL datasets and implemented triggers for capacity enforcement and staff rotation. Designed intuitive management interfaces for zoo operations.",
    image: "/assets/project/Sizopi/sizopi1.png",
    images: [
      "/assets/project/Sizopi/sizopi.png",
      "/assets/project/Sizopi/sizopi2.png"
    ],
    category: "Web",
    techStack: ["nextjs", "supabase", "postgres"],
    links: [
      { type: "url", url: "https://sizopi-a6.vercel.app/" },
      { type: "github", url: "https://github.com/A6-BASDAT-SIZOPI/sizopi" }
    ]
  },
  {
    id: 12,
    title: "QRypto",
    description: "Base Mini-App bridging on-chain IDRX stablecoin to real-world QRIS merchants. Features gasless transactions via Account Abstraction and seamless FaceID/Passkey login with Coinbase Smart Wallet.",
    image: "/assets/project/Qrypto/qrypto.png",
    images: [
      "/assets/project/Qrypto/qrypto.png",
      "/assets/project/Qrypto/qrypto2.png"
    ],
    category: "Web",
    techStack: ["nextjs", "solidity", "ts", "tailwind", "prisma", "foundry", "wagmi", "coinbase", "onchainkit"],
    links: [
      { type: "github", url: "https://github.com/dunnowhoo/qrypto-app" },
      { type: "url", url: "https://qrypto.vercel.app/login" }
    ],
    embed: `<div style="position: relative; width: 100%; height: 0; padding-top: 56.2500%;
 padding-bottom: 0; box-shadow: 0 2px 8px 0 rgba(63,69,81,0.16); margin-top: 1.6em; margin-bottom: 0.9em; overflow: hidden;
 border-radius: 8px; will-change: transform;">
  <iframe loading="lazy" style="position: absolute; width: 100%; height: 100%; top: 0; left: 0; border: none; padding: 0;margin: 0;"
    src="https://www.canva.com/design/DAHAqd4d9LQ/7sKI5Yx1dWNxURf0Y3kYCw/view?embed" allowfullscreen="allowfullscreen" allow="fullscreen">
  </iframe>
</div>
<a href="https:&#x2F;&#x2F;www.canva.com&#x2F;design&#x2F;DAHAqd4d9LQ&#x2F;7sKI5Yx1dWNxURf0Y3kYCw&#x2F;view?utm_content=DAHAqd4d9LQ&amp;utm_campaign=designshare&amp;utm_medium=embeds&amp;utm_source=link" target="_blank" rel="noopener">Indonesia Base Hacakthon Deck.pdf</a> oleh Fauzan Putra.S`
  }
];