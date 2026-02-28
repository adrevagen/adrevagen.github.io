import React, { useEffect, useMemo, useRef, useState } from "react";

const NAV_ITEMS = ["hero", "about", "skills", "projects", "experience", "contact"];
const PROJECT_ITEMS = [
  {
    id: "presensi",
    title: "Presensi",
    type: "Internal Web App",
    summary: "End-to-end attendance and HR submission platform (mobile check-in, website for  leave/permission/duty requests) with real-time dashboards, audit trails, and payroll-ready reporting.",
    challenge: "Attendance was previously tracked via handkey machines and manual recaps, making cross-unit visibility slow and error-prone. HR struggled with delayed reporting, incomplete records, and frequent discrepancies that impacted allowance/tunjangan payments.",
    solution: "Built a unified attendance and HR submission system: mobile check-in/out with location validation, digital workflows for leave/permission/duty with multi-level approvals, organization-based dashboards for HR, and automated payroll-ready exports. Added audit trails, role-based access, and automated monthly summaries to eliminate manual recaps.",
    impact: "Eliminated manual month-end attendance recaps by digitizing attendance and HR submissions. Accelerated allowance processing by ~5d0%, improved HR service responsiveness by ~40%, and increased data accuracy by ~50%, significantly reducing allowance payment discrepancies.",
    stack: ["Vue", "Laravel", "PostgreSQL", "REST API"],
    status: "Private",
    tone: "tone-green",
    coverImage: "/images/presensi.png"
  },
  {
    id: "eregulasi",
    title: "E-Regulasi",
    type: "Document Platform",
    summary: "Internal regulation portal with fast search, version control, and scheduled publishing.",
    challenge: "Policy documents were scattered across folders and latest versions were hard to track.",
    solution: "Built a centralized portal with tagging, full-text search, and version metadata.",
    impact: "PPolicy lookup became ~40% faster, and versioning mistakes dropped by ~30% after implementing clearer version rules, validation checks, and safer publish workflows.",
    stack: ["Vue", "Node.js", "PostgreSQL", "Redis"],
    status: "Private",
    tone: "tone-blue",
    coverImage: "/images/e-regulasi.png"
  },
  {
    id: "icore-revamp",
    title: "Icore Revamp",
    type: "Enterprise System",
    summary: "Master data and workflow revamp focused on stability, speed, and maintainability.",
    challenge: "The legacy system became hard to extend due to tight coupling and slow database queries.",
    solution: "Executed phased refactoring, query optimization, and frontend component restructuring.",
    impact: "Delivered ~30% faster key screens, a more user-friendly UI, and ~40% fewer regression defects through component standardization and improved QA.",
    stack: ["React", "TypeScript", "PHP", "PostgreSQL"],
    status: "Private",
    tone: "tone-amber",
    coverImage: "/images/icore-revamp.png"
  },
  {
    id: "meal",
    title: "Meal Planner",
    type: "Enterprise System",
    summary: "Weekly meal planning app with cost estimation and automatic shopping list generation.",
    challenge: "Employees’ meal orders were hard to track. This often led to food overproduction, unclear daily demand, and difficulty maintaining a predictable monthly budget.",
    solution: "Built a dynamic ordering system for mobile, website, and kiosk/machine with real-time order tracking, automated budget calculation and quota/portion controls per employee or unit",
    impact: "“Improved demand accuracy and operational transparency across mobile, web, and kiosk channels. Reduced leftover meals by ~50% through real-time quota/portion controls and vendor-ready production lists. Lowered the company’s meal provisioning costs by ~30% by aligning daily production with actual orders, making monthly budgeting more predictable and reducing week-to-week waste",
    stack: ["Next.js", "Tailwind", "Express Js"],
    status: "Private",
    tone: "tone-rose",
    coverImage: "/images/emeal.png"
  }
];

function App() {
  const wrapperRef = useRef(null);
  const [activeSection, setActiveSection] = useState("hero");
  const [showScrollIndicator, setShowScrollIndicator] = useState(true);
  const [formStatus, setFormStatus] = useState("");
  const [activeProjectFilter, setActiveProjectFilter] = useState("All");
  const [selectedProject, setSelectedProject] = useState(null);

  const codeLines = useMemo(
    () => [
      'const developer = {',
      '  name: "Van Rodiansyah",',
      '  role: "Full Stack",',
      '  passion: "Building things",',
      "  coffee: Infinity,",
      "  async createAwesome() {",
      '    return "Magic";',
      "  }",
      "};"
    ],
    []
  );
  const projectFilters = useMemo(
    () => ["All", ...new Set(PROJECT_ITEMS.map((project) => project.type))],
    []
  );
  const filteredProjects = useMemo(() => {
    if (activeProjectFilter === "All") return PROJECT_ITEMS;
    return PROJECT_ITEMS.filter((project) => project.type === activeProjectFilter);
  }, [activeProjectFilter]);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const sections = Array.from(wrapper.querySelectorAll("section"));

    const onScroll = () => {
      let current = "hero";
      sections.forEach((section) => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        if (wrapper.scrollTop >= sectionTop - sectionHeight / 3) {
          current = section.id;
        }
      });

      setActiveSection(current);
      setShowScrollIndicator(wrapper.scrollTop <= 100);
    };

    wrapper.addEventListener("scroll", onScroll);
    onScroll();

    return () => {
      wrapper.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => {
    const bars = document.querySelectorAll(".skill-progress");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const width = entry.target.getAttribute("data-width");
            entry.target.style.width = `${width}%`;
          }
        });
      },
      { threshold: 0.5 }
    );

    bars.forEach((bar) => observer.observe(bar));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!selectedProject) return;

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        setSelectedProject(null);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [selectedProject]);

  const scrollToSection = (id) => {
    const target = document.getElementById(id);
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setFormStatus("Message sent successfully! I will get back to you soon.");
    event.currentTarget.reset();
    setTimeout(() => setFormStatus(""), 5000);
  };

  const getProjectCoverStyle = (project) => {
    if (!project?.coverImage) return undefined;
    return {
      backgroundImage: `url(${project.coverImage})`,
      backgroundSize: "cover",
      backgroundPosition: "center"
    };
  };

  return (
    <div className="app-wrapper" id="app-wrapper" ref={wrapperRef}>
      <div className="floating-shapes">
        <div className="shape" />
        <div className="shape" />
        <div className="shape" />
      </div>

      <nav className="fixed right-6 top-1/2 -translate-y-1/2 z-50 hidden md:flex flex-col gap-4" id="nav-dots">
        {NAV_ITEMS.map((item) => (
          <button
            key={item}
            type="button"
            className={`nav-dot ${activeSection === item ? "active" : ""}`}
            data-section={item}
            onClick={() => scrollToSection(item)}
            aria-label={`Go to ${item} section`}
          />
        ))}
      </nav>

      <main className="relative z-10">
        <section id="hero" className="section flex items-center justify-center min-h-screen">
          <div className="max-w-6xl mx-auto w-full">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <div className="flex items-center gap-3">
                  <div className="status-indicator" />
                  <span className="font-mono text-sm opacity-70">Available for opportunities</span>
                </div>
                <div className="space-y-4">
                  <p className="font-mono text-sm tracking-widest opacity-50">HELLO, I'M</p>
                  <h1 className="text-5xl md:text-7xl font-bold leading-tight">
                    <span className="gradient-text">Van Rodiansyah</span>
                    <br />
                    <span>Developer</span>
                  </h1>
                  <p className="text-xl md:text-2xl opacity-70 font-light">Full Stack Developer</p>
                </div>
                <p className="text-lg opacity-60 max-w-md leading-relaxed">
                  Crafting digital experiences through clean code and thoughtful design. Passionate about building
                  products that make a difference.
                </p>
                <div className="flex flex-wrap gap-4">
                  <button type="button" className="btn-primary" onClick={() => scrollToSection("projects")}>
                    View Projects
                  </button>
                  <button type="button" className="btn-secondary" onClick={() => scrollToSection("contact")}>
                    Get in Touch
                  </button>
                </div>
              </div>
              <div className="hidden lg:block">
                <div className="code-block">
                  <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-700">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="ml-4 text-xs opacity-50">developer.js</span>
                  </div>
                  <div className="space-y-2">
                    {codeLines.map((line, index) => (
                      <p className="code-line" style={{ animationDelay: `${0.1 * (index + 1)}s` }} key={line}>
                        {line}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="scroll-indicator" style={{ opacity: showScrollIndicator ? 0.6 : 0 }}>
            <span className="font-mono text-xs tracking-widest">SCROLL</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M19 12l-7 7-7-7" />
            </svg>
          </div>
        </section>

        <section id="about" className="section flex items-center">
          <div className="max-w-6xl mx-auto w-full">
            <div className="flex items-start gap-8">
              <div className="hidden md:block section-indicator font-mono opacity-30">ABOUT ME</div>
              <div className="flex-1 space-y-12">
                <div className="space-y-4">
                  <h2 className="text-4xl md:text-5xl font-bold">
                    <span className="gradient-text">About</span> Me
                  </h2>
                  <div className="w-20 h-1 bg-gradient-to-r from-green-400 to-transparent rounded" />
                </div>
                <div className="grid md:grid-cols-2 gap-12">
                  <div className="space-y-6">
                    <p className="text-lg opacity-70 leading-relaxed">
                      I'm a passionate developer with 5+ years of experience in building web applications. I love
                      turning complex problems into simple, beautiful solutions.
                    </p>
                    <p className="text-lg opacity-70 leading-relaxed">
                      When I'm not coding, you'll find me exploring new technologies or
                      enjoying a good cup of coffee while reading tech articles.
                    </p>
                    <div className="pt-4">
                      <a href="#" className="inline-flex items-center gap-2 text-green-400 hover:gap-4 transition-all font-medium">
                        <span>Download Resume</span>
                      </a>
                    </div>
                  </div>
                  <div className="space-y-6">
                    {[
                      ["Problem Solver", "Analytical Thinking", "Breaking down complex challenges into manageable, elegant solutions."],
                      ["Fast Learner", "Always Growing", "Quickly adapting to new technologies and methodologies."],
                      ["Creative Thinker", "Innovation Driven", "Bringing fresh perspectives and innovative ideas to every project."]
                    ].map(([title, subtitle, desc]) => (
                      <div className="card rounded-2xl p-6 glow-border" key={title}>
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-400/20 to-blue-400/20 flex items-center justify-center text-xl">
                            *
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">{title}</h3>
                            <p className="text-sm opacity-50">{subtitle}</p>
                          </div>
                        </div>
                        <p className="text-sm opacity-60">{desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="skills" className="section flex items-center">
          <div className="max-w-6xl mx-auto w-full">
            <div className="flex items-start gap-8">
              <div className="hidden md:block section-indicator font-mono opacity-30">EXPERTISE</div>
              <div className="flex-1 space-y-12">
                <div className="space-y-4">
                  <h2 className="text-4xl md:text-5xl font-bold">
                    <span className="gradient-text">Skills</span> & Tools
                  </h2>
                  <div className="w-20 h-1 bg-gradient-to-r from-green-400 to-transparent rounded" />
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    ["Frontend", [["React / Next.js", 95], ["TypeScript", 90], ["Tailwind CSS", 92], ["Vue.js", 80]]],
                    ["Backend", [["Node.js", 92], ["Laravel", 88], ["PostgreSQL", 85], ["MySql", 82]]],
                    ["Tools & DevOps", [["Git / GitHub", 95], ["Docker", 85]]]
                  ].map(([group, skills]) => (
                    <div className="card rounded-2xl p-6 space-y-6" key={group}>
                      <h3 className="font-semibold">{group}</h3>
                      <div className="space-y-4">
                        {skills.map(([name, percentage]) => (
                          <div className="space-y-2" key={name}>
                            <div className="flex justify-between text-sm">
                              <span>{name}</span>
                              <span className="opacity-50">{percentage}%</span>
                            </div>
                            <div className="skill-bar">
                              <div className="skill-progress" data-width={percentage} style={{ width: 0 }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="card rounded-2xl p-8">
                  <p className="text-sm font-mono opacity-50 mb-6">// Technologies I work with</p>
                  <div className="flex flex-wrap gap-4">
                    {[
                      "React",
                      "Next.js",
                      "TypeScript",
                      "Node.js",
                      "Vue",
                      "Laravel",
                      "PostgreSQL",
                      "MySql",
                      "Git",
                      "Docker",
                      "Tailwind",
                      "Figma"
                    ].map((tag) => (
                      <span className="project-tag" key={tag}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="projects" className="section flex items-center">
          <div className="max-w-6xl mx-auto w-full">
            <div className="flex items-start gap-8">
              <div className="hidden md:block section-indicator font-mono opacity-30">PORTFOLIO</div>
              <div className="flex-1 space-y-12">
                <div className="space-y-4">
                  <h2 className="text-4xl md:text-5xl font-bold">
                    Featured <span className="gradient-text">Projects</span>
                  </h2>
                  <div className="w-20 h-1 bg-gradient-to-r from-green-400 to-transparent rounded" />
                  <p className="text-sm opacity-60 max-w-2xl">
                    All projects below are private client work, so this section focuses on problem context, solution,
                    and measurable impact.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  {projectFilters.map((filter) => (
                    <button
                      key={filter}
                      type="button"
                      className={`project-filter ${activeProjectFilter === filter ? "active" : ""}`}
                      onClick={() => setActiveProjectFilter(filter)}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  {filteredProjects.map((project) => (
                    <article className="card rounded-2xl overflow-hidden glow-border group" key={project.id}>
                      <div className={`h-48 project-cover ${project.tone}`} style={getProjectCoverStyle(project)}>
                        <span className="project-private-chip">{project.status}</span>
                      </div>
                      <div className="p-6 space-y-4">
                        <div className="flex items-center justify-between gap-3">
                          <h3 className="font-bold text-xl">{project.title}</h3>
                          <span className="project-tag">{project.type}</span>
                        </div>
                        <p className="text-sm opacity-60">{project.summary}</p>
                        <div className="flex flex-wrap gap-2">
                          {project.stack.slice(0, 3).map((item) => (
                            <span className="project-tag" key={item}>
                              {item}
                            </span>
                          ))}
                        </div>
                        <button
                          type="button"
                          className="btn-secondary w-full"
                          onClick={() => setSelectedProject(project)}
                        >
                          View Detail
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="experience" className="section flex items-center">
          <div className="max-w-6xl mx-auto w-full">
            <div className="flex items-start gap-8">
              <div className="hidden md:block section-indicator font-mono opacity-30">JOURNEY</div>
              <div className="flex-1 space-y-12">
                <div className="space-y-4">
                  <h2 className="text-4xl md:text-5xl font-bold">
                    Work <span className="gradient-text">Experience</span>
                  </h2>
                  <div className="w-20 h-1 bg-gradient-to-r from-green-400 to-transparent rounded" />
                </div>
                <div className="space-y-8 relative pl-12">
                  <div className="experience-line" />
                  {[
                    ["Full Stack Developer", "Freelance", "2023 - Present"],
                    ["Full Stack Developer ", "Civil Service Goverment", "2018 - present"],
                  ].map(([role, company, period]) => (
                    <div className="relative" key={role}>
                      <div className="experience-dot" />
                      <div className="card rounded-2xl p-6 ml-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                          <div>
                            <h3 className="font-bold text-xl">{role}</h3>
                            <p className="text-green-400 font-medium">{company}</p>
                          </div>
                          <span className="font-mono text-sm opacity-50">{period}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="contact" className="section flex items-center">
          <div className="max-w-6xl mx-auto w-full">
            <div className="flex items-start gap-8">
              <div className="hidden md:block section-indicator font-mono opacity-30">CONTACT</div>
              <div className="flex-1 space-y-12">
                <div className="space-y-4">
                  <h2 className="text-4xl md:text-5xl font-bold">
                    Let's <span className="gradient-text">Connect</span>
                  </h2>
                  <div className="w-20 h-1 bg-gradient-to-r from-green-400 to-transparent rounded" />
                  <p className="text-lg opacity-60 max-w-lg">
                    I'm always open to discussing new projects, creative ideas, or opportunities to be part of your
                    vision.
                  </p>
                </div>
                <div className="grid gap-8">
                  <div className="space-y-6">
                    <a href="mailto:rodiansyah.van@gmail.com" className="card rounded-2xl p-6 flex items-center gap-4 glow-border group w-full">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-400/20 to-blue-400/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                        @
                      </div>
                      <div>
                        <p className="font-mono text-xs opacity-50 mb-1">EMAIL</p>
                        <p className="font-medium">rodiansyah.van@gmail.com</p>
                      </div>
                    </a>
                   
                    <a
                      href="https://www.linkedin.com/in/van-rodiansyah-77a929287/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="card rounded-2xl p-6 flex items-center gap-4 glow-border group w-full"
                    >
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-400/20 to-cyan-400/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                        IN
                      </div>
                      <div>
                        <p className="font-mono text-xs opacity-50 mb-1">LINKEDIN</p>
                        <p className="font-medium">van-rodiansyah</p>
                      </div>
                    </a>
                  </div>
                  {/* <div className="card rounded-2xl p-8 glow-border">
                    <h3 className="font-bold text-xl mb-6">Send a Message</h3>
                    <form className="space-y-4" onSubmit={handleSubmit}>
                      <div>
                        <label htmlFor="name" className="block text-sm font-mono opacity-50 mb-2">
                          NAME
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          required
                          className="w-full px-4 py-3 bg-black/30 border border-gray-700 rounded-lg focus:border-green-400 focus:outline-none transition-colors"
                          placeholder="Your name"
                        />
                      </div>
                      <div>
                        <label htmlFor="email" className="block text-sm font-mono opacity-50 mb-2">
                          EMAIL
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          required
                          className="w-full px-4 py-3 bg-black/30 border border-gray-700 rounded-lg focus:border-green-400 focus:outline-none transition-colors"
                          placeholder="your@email.com"
                        />
                      </div>
                      <div>
                        <label htmlFor="message" className="block text-sm font-mono opacity-50 mb-2">
                          MESSAGE
                        </label>
                        <textarea
                          id="message"
                          name="message"
                          required
                          rows="4"
                          className="w-full px-4 py-3 bg-black/30 border border-gray-700 rounded-lg focus:border-green-400 focus:outline-none transition-colors resize-none"
                          placeholder="Your message..."
                        />
                      </div>
                      <button type="submit" className="btn-primary w-full">
                        Send Message
                      </button>
                    </form>
                    {formStatus && <p className="mt-4 text-center text-sm text-green-400">{formStatus}</p>}
                  </div> */}
                </div>
                <div className="pt-12 border-t border-gray-800">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="font-mono text-sm opacity-50">(c) 2026 Van Rodiansyah. All rights reserved.</p>
                    <p className="font-mono text-sm opacity-50">Crafted with care and lots of coffee</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {selectedProject && (
        <div className="project-modal-backdrop" role="presentation" onClick={() => setSelectedProject(null)}>
          <div
            className="project-modal card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="project-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className={`project-modal-cover ${selectedProject.tone}`} style={getProjectCoverStyle(selectedProject)}>
              <span className="project-private-chip">{selectedProject.status}</span>
            </div>
            <div className="p-6 md:p-8 space-y-5">
              <div className="flex items-start justify-between gap-6">
                <div>
                  <p className="font-mono text-xs opacity-50 mb-2">PROJECT DETAIL</p>
                  <h3 id="project-modal-title" className="text-2xl font-bold">
                    {selectedProject.title}
                  </h3>
                </div>
                <button
                  type="button"
                  className="project-modal-close"
                  onClick={() => setSelectedProject(null)}
                  aria-label="Close project detail"
                >
                  x
                </button>
              </div>

              <span className="project-tag">{selectedProject.type}</span>

              <div className="space-y-4">
                <div>
                  <p className="font-mono text-xs opacity-50 mb-1">CHALLENGE</p>
                  <p className="text-sm opacity-80 leading-relaxed">{selectedProject.challenge}</p>
                </div>
                <div>
                  <p className="font-mono text-xs opacity-50 mb-1">SOLUTION</p>
                  <p className="text-sm opacity-80 leading-relaxed">{selectedProject.solution}</p>
                </div>
                <div>
                  <p className="font-mono text-xs opacity-50 mb-1">IMPACT</p>
                  <p className="text-sm opacity-80 leading-relaxed">{selectedProject.impact}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {selectedProject.stack.map((item) => (
                  <span key={item} className="project-tag">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
