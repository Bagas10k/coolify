import React, { useState, useEffect } from 'react';
import Card from './components/Card';
import Button from './components/Button';
import { ExternalLink, Sparkles, Layers, Box, Terminal } from 'lucide-react';

export default function Portfolio({ onNavigate }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="portfolio-container">
      {/* ─── Hero Section ─── */}
      <section className="hero-section" id="home">
        <div className="hero-content">
          <div className="badge-accent">
            <Sparkles size={14} className="inline mr-1" /> Web Developer Workspace
          </div>
          <h1 className="hero-title">
            The best place to <br />
            <span className="text-underline-wrap">explore</span> and <span class="highlight-yellow">play</span> <br />
            with my web apps
          </h1>
          <p className="hero-subtitle">
            Welcome to my personal cloud server. I build clean web interfaces, try out interactive projects, and host them right here without terminal deployments.
          </p>
          <div className="hero-buttons">
            <a href="#apps" onClick={(e) => {
              e.preventDefault();
              document.getElementById('apps').scrollIntoView({ behavior: 'smooth' });
            }}>
              <Button variant="primary">Explore Projects</Button>
            </a>
            <a href="#about" onClick={(e) => {
              e.preventDefault();
              document.getElementById('about').scrollIntoView({ behavior: 'smooth' });
            }}>
              <Button variant="secondary">What I Do</Button>
            </a>
          </div>
        </div>

        <div className="hero-visual">
          <div className="mascot-container-floating">
            <img src="/mascot.png" alt="Mascot Astronaut" className="mascot-img-large" />
          </div>
        </div>
      </section>

      {/* ─── Features Section ─── */}
      <section className="features-section" id="about">
        <div className="section-intro">
          <h2>Our interactive <span className="gradient-text">features</span></h2>
          <p>Here is how my personal environment serves web projects behind the scenes.</p>
        </div>

        <div className="features-grid">
          <Card
            title="Static Sandbox"
            icon={<Layers size={24} />}
            badge="HTML / CSS / JS"
            badgeVariant="primary"
            className="f-card-purple"
          >
            Supports compiled React apps, static HTML/CSS, and modern frontend outputs built instantly.
          </Card>

          <Card
            title="PHP Engine"
            icon={<Terminal size={24} />}
            badge="PHP-CLI Proxy"
            badgeVariant="secondary"
            className="f-card-blue"
          >
            Auto-spawns independent server instances in the background for executing script databases and dynamic backends.
          </Card>

          <Card
            title="Zip Deployment"
            icon={<Box size={24} />}
            badge="Instant Serve"
            badgeVariant="yellow"
            className="f-card-yellow"
          >
            No terminal commands. Simply upload any package from the dashboard, extract, and check the live project.
          </Card>
        </div>
      </section>

      {/* ─── Projects Section ─── */}
      <section className="projects-section" id="apps">
        <div className="section-intro">
          <h2>Explore my <span className="gradient-text">deployed apps</span></h2>
          <p>These applications are hosted directly on this server. Click to open each in a new tab.</p>
        </div>

        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Fetching active projects...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="empty-state">
            <Layers size={48} className="opacity-30" />
            <p>No projects have been uploaded yet. Log in to upload your first application!</p>
          </div>
        ) : (
          <div className="projects-grid">
            {projects.map((p) => (
              <Card
                key={p.name}
                title={p.name}
                subtitle={p.uploadedAt ? `Deployed on ${new Date(p.uploadedAt).toLocaleDateString()}` : 'Active App'}
                badge={p.type.toUpperCase()}
                badgeVariant={p.type === 'php' ? 'secondary' : 'primary'}
                footer={
                  <a href={p.url} target="_blank" rel="noopener noreferrer" className="w-full">
                    <Button variant="primary" size="sm" fullWidth icon={<ExternalLink size={14} />}>
                      Launch Project
                    </Button>
                  </a>
                }
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
