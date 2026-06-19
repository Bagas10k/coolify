import React, { useState, useEffect } from 'react';
import Card from './components/Card';
import Button from './components/Button';
import Input from './components/Input';
import { 
  ExternalLink, Sparkles, Layers, Box, Terminal, 
  User, Send, Phone, Monitor, Video, Palette, 
  CheckCircle, GraduationCap, Award
} from 'lucide-react';

export default function Portfolio() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [projectTab, setProjectTab] = useState('web'); // 'web' | 'design' | 'video'

  // Contact form state
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [formSubmitted, setFormSubmitted] = useState(false);

  useEffect(() => {
    async function fetchProjects() {
      try {
        const res = await fetch('/api/public-projects');
        if (!res.ok) throw new Error();
        const data = await res.json();
        setProjects(data);
      } catch (err) {
        console.error('Failed to load projects');
      } finally {
        setLoading(false);
      }
    }
    fetchProjects();
  }, []);

  const handleContactSubmit = (e) => {
    e.preventDefault();
    // Simulate contact submission
    setFormSubmitted(true);
    setContactName('');
    setContactEmail('');
    setContactMessage('');
    setTimeout(() => setFormSubmitted(false), 5000);
  };

  // Mock Graphic Design Projects (Vector illustrations)
  const graphicDesigns = [
    {
      id: 1,
      title: "Vivid Brand Logo Identity",
      category: "Branding",
      desc: "Branding concept with sleek lines and geometric layout.",
      svgColor: "from-blue-400 to-indigo-500"
    },
    {
      id: 2,
      title: "Playful Character Mascot Vector",
      category: "Illustration",
      desc: "Friendly vector mascot style designed for children's learning platform.",
      svgColor: "from-purple-400 to-pink-500"
    },
    {
      id: 3,
      title: "Retro Cyberpunk Poster Concept",
      category: "Poster Design",
      desc: "Light neon cyberpunk layout built entirely in vector shapes.",
      svgColor: "from-amber-400 to-orange-500"
    }
  ];

  // Mock Video Projects
  const videoProjects = [
    {
      id: 1,
      title: "FTV Cinematic Teaser 2026",
      role: "Director & Lead Editor",
      desc: "Promotional cinematic video for the FTV UKM showing student activities.",
      platform: "YouTube Preview",
      duration: "2:45"
    },
    {
      id: 2,
      title: "UKM Business Startup Profile",
      role: "Video Editor / Motion Designer",
      desc: "Commercial marketing video showcasing corporate values and services.",
      platform: "Drive Embed",
      duration: "1:30"
    }
  ];

  // Skill badges divided by categories
  const codingSkills = ["React", "TypeScript", "Tailwind CSS", "Node.js", "Express", "PHP", "MySQL", "Git"];
  const creativeSkills = ["Premiere Pro", "After Effects", "Figma", "Photoshop", "Illustrator", "Motion Graphics"];

  return (
    <div className="portfolio-container">
      {/* ─── 1. Hero Section ─── */}
      <section className="hero-section" id="home">
        <div className="hero-content">
          <div className="badge-accent">
            <Sparkles size={14} className="inline mr-1" /> Tech & Creative Synergy
          </div>
          <h1 className="hero-title">
            Hi, saya <span className="gradient-text">Bagas</span>. Saya menjembatani teknologi & estetika melalui desain & kode.
          </h1>
          <p className="hero-subtitle font-medium text-slate-500 mt-3" style={{ fontSize: '1.2rem' }}>
            IT Student | Graphic Designer | Video Editor
          </p>
          <p className="hero-subtitle">
            Welcome to my personal cloud workspace. Explore my web applications, graphic vector designs, and video editing showreels.
          </p>
          <div className="hero-buttons">
            <a href="#projects" onClick={(e) => {
              e.preventDefault();
              document.getElementById('projects').scrollIntoView({ behavior: 'smooth' });
            }}>
              <Button variant="primary">Explore Projects</Button>
            </a>
            <a href="#about" onClick={(e) => {
              e.preventDefault();
              document.getElementById('about').scrollIntoView({ behavior: 'smooth' });
            }}>
              <Button variant="secondary">About Me</Button>
            </a>
          </div>
        </div>

        <div className="hero-visual">
          <div className="mascot-container-floating">
            <img src="/mascot.png" alt="Mascot Astronaut" className="mascot-img-large" />
          </div>
        </div>
      </section>

      {/* ─── 2. About Me Section ─── */}
      <section className="features-section border-t border-slate-100/60 pt-16" id="about">
        <div className="section-intro">
          <h2>About <span className="gradient-text">Me</span></h2>
          <p>Get to know my journey as an IT enthusiast and entrepreneur.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start mb-12">
          {/* Bio Column */}
          <div className="bg-white p-10 rounded-3xl border border-slate-100 shadow-sm text-left">
            <h3 className="font-fun text-xl font-bold text-slate-800 mb-4 flex items-center gap-3">
              <GraduationCap className="text-blue-500" size={24} /> Education & Story
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed mb-4">
              Halo! Saya adalah seorang mahasiswa IT yang sangat bersemangat memadukan fungsionalitas kode pemrograman dengan keindahan desain grafis serta sinematografi. Sebagai seseorang yang berjiwa entrepreneur, saya senang membangun ide-ide startup digital dan membantu brand berkembang secara visual.
            </p>
            <p className="text-sm text-slate-600 leading-relaxed">
              Saya aktif mengelola project-project multimedia untuk bisnis kecil hingga menengah, serta berpartisipasi aktif dalam kegiatan kampus seperti UKM FTV (Film & Televisi) untuk terus mengasah kemampuan editing video dan kreativitas saya.
            </p>
          </div>

          {/* Skillset Column */}
          <div className="bg-white p-10 rounded-3xl border border-slate-100 shadow-sm text-left flex flex-col gap-8">
            <div>
              <h3 className="font-fun text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                <Terminal className="text-purple-500" size={20} /> Tech Stack & Development
              </h3>
              <div className="flex flex-wrap gap-2">
                {codingSkills.map(skill => (
                  <span key={skill} className="px-3 py-1 text-xs font-bold bg-blue-50 text-blue-600 rounded-full border border-blue-100">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-fun text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                <Palette className="text-amber-500" size={20} /> Design & Video Production
              </h3>
              <div className="flex flex-wrap gap-2">
                {creativeSkills.map(skill => (
                  <span key={skill} className="px-3 py-1 text-xs font-bold bg-amber-50 text-amber-600 rounded-full border border-amber-100">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 3. Projects Showcase ─── */}
      <section className="projects-section border-t border-slate-100/60 pt-16" id="projects">
        <div className="section-intro">
          <h2>My <span className="gradient-text">Project Showcase</span></h2>
          <p>Explore my works across code development, design vectors, and film cinematography.</p>
        </div>

        {/* Categories Tab Selector */}
        <div className="flex justify-center gap-3 mb-10 flex-wrap">
          <button
            onClick={() => setProjectTab('web')}
            className={`px-6 py-3.5 rounded-full text-xs font-bold uppercase tracking-wider border transition-all duration-200
              ${projectTab === 'web' 
                ? 'bg-blue-500 border-transparent text-white shadow-md shadow-blue-100' 
                : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
          >
            Web Development
          </button>
          <button
            onClick={() => setProjectTab('design')}
            className={`px-6 py-3.5 rounded-full text-xs font-bold uppercase tracking-wider border transition-all duration-200
              ${projectTab === 'design' 
                ? 'bg-blue-500 border-transparent text-white shadow-md shadow-blue-100' 
                : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
          >
            Graphic Design
          </button>
          <button
            onClick={() => setProjectTab('video')}
            className={`px-6 py-3.5 rounded-full text-xs font-bold uppercase tracking-wider border transition-all duration-200
              ${projectTab === 'video' 
                ? 'bg-blue-500 border-transparent text-white shadow-md shadow-blue-100' 
                : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
          >
            Video Editing
          </button>
        </div>

        {/* Tab 1: Web Development */}
        {projectTab === 'web' && (
          loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Fetching deployed applications...</p>
            </div>
          ) : projects.length === 0 ? (
            <div className="empty-state">
              <Layers size={48} className="opacity-30" />
              <p>No web projects have been deployed yet. Login to upload yours!</p>
            </div>
          ) : (
            <div className="projects-grid">
              {projects.map((p) => (
                <Card
                  key={p.name}
                  title={p.name}
                  subtitle={p.uploadedAt ? `Deployed on ${new Date(p.uploadedAt).toLocaleDateString()}` : 'Live Web Application'}
                  badge={p.type.toUpperCase()}
                  badgeVariant={p.type === 'php' ? 'secondary' : 'primary'}
                  footer={
                    <a href={p.url} target="_blank" rel="noopener noreferrer" className="w-full">
                      <Button variant="primary" size="sm" fullWidth icon={<ExternalLink size={14} />}>
                        Launch Demo
                      </Button>
                    </a>
                  }
                />
              ))}
            </div>
          )
        )}

        {/* Tab 2: Graphic Design */}
        {projectTab === 'design' && (
          <div className="projects-grid">
            {graphicDesigns.map((design) => (
              <Card
                key={design.id}
                title={design.title}
                subtitle={design.category}
                badge="Vector Shape"
                badgeVariant="yellow"
                footer={
                  <Button variant="secondary" size="sm" fullWidth icon={<Palette size={14} />} onClick={() => alert('Viewing high-res vector design artwork.')}>
                    View Artwork
                  </Button>
                }
              >
                <div className="w-full h-32 rounded-2xl mb-4 flex items-center justify-center bg-slate-50 border border-slate-100">
                  <div className={`w-14 h-14 rounded-full bg-gradient-to-r ${design.svgColor} flex items-center justify-center text-white shadow-md`}>
                    <Palette size={24} />
                  </div>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">{design.desc}</p>
              </Card>
            ))}
          </div>
        )}

        {/* Tab 3: Video Editing */}
        {projectTab === 'video' && (
          <div className="projects-grid">
            {videoProjects.map((video) => (
              <Card
                key={video.id}
                title={video.title}
                subtitle={video.role}
                badge={video.duration}
                badgeVariant="secondary"
                footer={
                  <Button variant="primary" size="sm" fullWidth icon={<Video size={14} />} onClick={() => alert('Opening sample video playback popup.')}>
                    Play Video Teaser
                  </Button>
                }
              >
                <div className="w-full h-36 rounded-2xl mb-4 relative overflow-hidden bg-slate-800 flex items-center justify-center text-white">
                  <div className="absolute inset-0 bg-slate-900/50 flex items-center justify-center hover:bg-slate-900/30 transition-all duration-200 cursor-pointer">
                    <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/40 shadow-lg">
                      <Play size={20} className="fill-white ml-0.5" />
                    </div>
                  </div>
                  <span className="absolute bottom-2 right-2 px-2 py-0.5 text-[10px] font-bold bg-black/60 rounded text-white">{video.platform}</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">{video.desc}</p>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* ─── 4. Services Section ─── */}
      <section className="features-section border-t border-slate-100/60 pt-16" id="services">
        <div className="section-intro">
          <h2>Services & <span className="gradient-text">Value Proposition</span></h2>
          <p>What I offer to help your business and projects grow.</p>
        </div>

        <div className="features-grid">
          <Card
            title="Web Development"
            icon={<Monitor size={24} />}
            badge="Full Stack"
            badgeVariant="primary"
            className="f-card-blue"
          >
            Membuat web aplikasi yang responsif, cepat, serta fungsional dengan integrasi API, database, dan deploy otomatis.
          </Card>

          <Card
            title="Brand Identity Design"
            icon={<Palette size={24} />}
            badge="Creative Design"
            badgeVariant="yellow"
            className="f-card-yellow"
          >
            Mendesain aset grafis visual seperti logo, vector mockup, dan presentasi branding minimalis untuk bisnis Anda.
          </Card>

          <Card
            title="Video Production"
            icon={<Video size={24} />}
            badge="Cinematic"
            badgeVariant="secondary"
            className="f-card-purple"
          >
            Mengedit video promosi, teaser media sosial, dokumentasi bisnis, dan profil sinematik kreatif.
          </Card>
        </div>

        {/* Experience citation card */}
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm text-left max-w-2xl mx-auto mt-12 flex items-start gap-6">
          <Award className="text-amber-500 shrink-0 mt-0.5" size={28} />
          <div>
            <h4 className="font-fun font-bold text-slate-800 text-base mb-2">Pengalaman Terverifikasi</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Mengerjakan video profile di UKM FTV, kolaborasi pembuatan portofolio branding bisnis produk kecil, dan mengelola server hosting mandiri untuk projek digital.
            </p>
          </div>
        </div>
      </section>

      {/* ─── 5. Contact Section ─── */}
      <section className="projects-section border-t border-slate-100/60 pt-16" id="contact">
        <div className="section-intro">
          <h2>Get in <span className="gradient-text">Touch</span></h2>
          <p>Let's collaborate on your next development or design project!</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch mb-12">
          {/* Quick Links Column */}
          <div className="bg-white p-10 rounded-3xl border border-slate-100 shadow-sm text-left flex flex-col justify-between">
            <div>
              <h3 className="font-fun text-xl font-bold text-slate-800 mb-4">Direct Channels</h3>
              <p className="text-sm text-slate-500 leading-relaxed mb-6">
                Hubungi saya langsung melalui salah satu jejaring sosial media atau nomor WhatsApp berikut. Saya siap merespon pesan Anda secepatnya.
              </p>
              
              <div className="flex flex-col gap-4">
                <a href="https://wa.me/62812345678" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-slate-600 hover:text-blue-500 font-semibold transition">
                  <span className="p-3 rounded-xl bg-slate-50 border border-slate-100"><Phone size={18} /></span>
                  WhatsApp (Fast Response)
                </a>
                <a href="https://github.com/Bagas10k" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-slate-600 hover:text-blue-500 font-semibold transition">
                  <span className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>
                  </span>
                  GitHub (Code Repositories)
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-slate-600 hover:text-blue-500 font-semibold transition">
                  <span className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
                  </span>
                  LinkedIn (Professional Networks)
                </a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-slate-600 hover:text-blue-500 font-semibold transition">
                  <span className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                  </span>
                  Instagram (Creative Feeds)
                </a>
              </div>
            </div>
            
            <div className="text-xs text-slate-400 mt-6 font-semibold flex items-center gap-2">
              <CheckCircle size={14} className="text-emerald-500" />
              Available for freelance projects.
            </div>
          </div>

          {/* Form Column */}
          <div className="bg-white p-10 rounded-3xl border border-slate-100 shadow-sm text-left">
            <h3 className="font-fun text-xl font-bold text-slate-800 mb-4">Send a Message</h3>
            
            {formSubmitted ? (
              <div className="h-full flex flex-col items-center justify-center p-6 text-center">
                <CheckCircle size={48} className="text-emerald-500 mb-3" />
                <h4 className="font-fun font-bold text-slate-800 text-lg mb-1">Message Sent!</h4>
                <p className="text-xs text-slate-500">Terima kasih atas pesan Anda. Saya akan membalas secepat mungkin.</p>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="flex flex-col gap-5">
                <Input
                  label="Name"
                  id="contact-name"
                  placeholder="Your full name"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  required
                  icon={<User size={14} />}
                />

                <Input
                  label="Email"
                  id="contact-email"
                  type="email"
                  placeholder="your-email@example.com"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  required
                />

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Message</label>
                  <textarea
                    rows={4}
                    placeholder="Describe your design or coding project details..."
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    required
                    className="w-full px-4 py-3 text-sm bg-slate-50/70 border border-slate-200 rounded-xl text-slate-800 outline-none transition duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:bg-white"
                  />
                </div>

                <Button type="submit" variant="primary" fullWidth icon={<Send size={14} />}>
                  Send Message
                </Button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
