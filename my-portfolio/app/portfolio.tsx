"use client";

import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import {
  type FormEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { createSupabaseClient, type Project } from "@/src/lib/supabase";

const categories = ["All", "Engineering", "UI/UX Design", "Photography"] as const;
type Category = (typeof categories)[number];
type FormState = "idle" | "loading" | "success" | "error";

const engineeringSkills = ["TypeScript", "Next.js", "Python", "SQL", "Supabase"];
const designSkills = ["Figma", "UI/UX Prototyping", "DaVinci Resolve"];
const productionSkills = ["Event Photography", "Audio/Visual Systems"];

const reveal: Variants = {
  hidden: { opacity: 0, y: 22 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  },
};

function ArrowIcon({ diagonal = false }: { diagonal?: boolean }) {
  return (
    <svg
      aria-hidden="true"
      className="arrow-icon"
      viewBox="0 0 20 20"
      fill="none"
    >
      {diagonal ? (
        <path d="M5 15 15 5M6 5h9v9" />
      ) : (
        <path d="M3.5 10h12m-5-5 5 5-5 5" />
      )}
    </svg>
  );
}

function SparkIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 32 32" fill="none">
      <path
        d="M16 2.5c1.7 7.1 5.4 10.8 13.5 13.5-8.1 2.7-11.8 6.4-13.5 13.5C14.3 22.4 10.6 18.7 2.5 16 10.6 13.3 14.3 9.6 16 2.5Z"
        fill="currentColor"
      />
      <circle cx="27" cy="5" r="2" fill="currentColor" />
    </svg>
  );
}

function SkillChip({ children }: { children: string }) {
  return <span className="skill-chip">{children}</span>;
}

function ProjectCard({
  project,
  index,
  onSelect,
}: {
  project: Project;
  index: number;
  onSelect: (project: Project) => void;
}) {
  const imageStyle = project.image_url
    ? { backgroundImage: `url("${project.image_url}")` }
    : undefined;

  return (
    <motion.button
      className="project-card"
      type="button"
      onClick={() => onSelect(project)}
      aria-label={`View case study: ${project.title}`}
      variants={reveal}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
      transition={{ delay: index * 0.07 }}
      whileHover={{ y: -7 }}
      layout
    >
      <div
        className={`project-art ${project.image_url ? "has-image" : ""}`}
        style={imageStyle}
      >
        {!project.image_url && (
          <>
            <div className="art-glow" />
            <div className="art-grid" />
            <div className="art-mark">
              <span>{project.category === "Photography" ? "VISUAL STORY" : "CASE STUDY"}</span>
              <SparkIcon />
            </div>
          </>
        )}
        {project.featured && <span className="featured-label">Featured</span>}
        <span className="art-open" aria-hidden="true">
          <ArrowIcon diagonal />
        </span>
      </div>
      <div className="project-card-copy">
        <div>
          <span className="eyebrow">{project.category}</span>
          <h3>{project.title}</h3>
        </div>
        <p>{project.summary}</p>
        {project.tech_stack && project.tech_stack.length > 0 && (
          <div className="project-tags">
            {project.tech_stack.slice(0, 3).map((tech) => (
              <span key={tech}>{tech}</span>
            ))}
          </div>
        )}
      </div>
    </motion.button>
  );
}

function ProjectModal({
  project,
  onClose,
}: {
  project: Project;
  onClose: () => void;
}) {
  const closeButton = useRef<HTMLButtonElement>(null);
  const modalRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement;
    document.body.style.overflow = "hidden";
    closeButton.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (event.key === "Tab") {
        const focusable = modalRef.current?.querySelectorAll<HTMLElement>(
          'a[href], button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])',
        );
        if (!focusable?.length) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
      if (previousFocus instanceof HTMLElement) previousFocus.focus();
    };
  }, [onClose]);

  return (
    <motion.div
      className="modal-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <motion.section
        ref={modalRef}
        className="case-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="case-title"
        initial={{ opacity: 0, y: 22, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.98 }}
        transition={{ duration: 0.24 }}
      >
        <div className="modal-topline">
          <span className="eyebrow">{project.category} / CASE STUDY</span>
          <button
            ref={closeButton}
            className="icon-button"
            type="button"
            onClick={onClose}
            aria-label="Close case study"
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>
        <div
          className={`modal-art ${project.image_url ? "has-image" : ""}`}
          style={
            project.image_url
              ? { backgroundImage: `url("${project.image_url}")` }
              : undefined
          }
        >
          {!project.image_url && (
            <>
              <div className="art-glow" />
              <div className="art-grid" />
              <div className="modal-art-mark">
                <SparkIcon />
                <span>IDEAS INTO IMPACT</span>
              </div>
            </>
          )}
        </div>
        <div className="modal-content">
          <h2 id="case-title">{project.title}</h2>
          <p className="modal-summary">{project.summary}</p>
          <div className="modal-details">
            <h3>The story</h3>
            <p>{project.details}</p>
          </div>
          {project.tech_stack && project.tech_stack.length > 0 && (
            <div className="modal-details">
              <h3>Tools & skills</h3>
              <div className="project-tags modal-tags">
                {project.tech_stack.map((tech) => (
                  <span key={tech}>{tech}</span>
                ))}
              </div>
            </div>
          )}
          <div className="modal-actions">
            {project.live_url && (
              <a
                className="button button-primary"
                href={project.live_url}
                target="_blank"
                rel="noreferrer"
              >
                View live project <ArrowIcon diagonal />
              </a>
            )}
            {project.repo_url && (
              <a
                className="button button-secondary"
                href={project.repo_url}
                target="_blank"
                rel="noreferrer"
              >
                View repository <ArrowIcon diagonal />
              </a>
            )}
          </div>
        </div>
      </motion.section>
    </motion.div>
  );
}

function ContactForm() {
  const [formState, setFormState] = useState<FormState>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setFormState("loading");
    setErrorMessage("");

    const formData = new FormData(form);
    formData.set("form-name", "contact");
    const body = new URLSearchParams();
    formData.forEach((value, key) => {
      body.append(key, String(value));
    });

    try {
      const response = await fetch("/__forms.html", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
      });

      if (!response.ok) {
        throw new Error(`The form could not be submitted (${response.status}).`);
      }

      form.reset();
      setFormState("success");
    } catch (error) {
      setFormState("error");
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.",
      );
    }
  }

  return (
    <form id="contact-form" className="contact-form" onSubmit={handleSubmit}>
      <div className="form-row">
        <label>
          Your name
          <input
            autoComplete="name"
            name="name"
            placeholder="Jane Smith"
            required
          />
        </label>
        <label>
          Email address
          <input
            autoComplete="email"
            name="email"
            type="email"
            placeholder="jane@example.com"
            required
          />
        </label>
      </div>
      <label>
        What are you looking for?
        <select name="projectType" defaultValue="" required>
          <option value="" disabled>
            Select a project type
          </option>
          <option>Web development</option>
          <option>UI/UX design</option>
          <option>Photography or visual production</option>
          <option>Something else</option>
        </select>
      </label>
      <label>
        A little about your project
        <textarea
          name="message"
          placeholder="The idea, the challenge, the big picture..."
          rows={4}
          required
        />
      </label>
      <div className="form-bottom">
        <p aria-live="polite" className={`form-feedback ${formState}`}>
          {formState === "loading" && "Sending your message..."}
          {formState === "success" &&
            "Message sent. Thanks for reaching out!"}
          {formState === "error" && errorMessage}
        </p>
        <button
          className="button button-primary submit-button"
          type="submit"
          disabled={formState === "loading"}
        >
          {formState === "loading" ? "Sending..." : "Send message"}
          <ArrowIcon />
        </button>
      </div>
    </form>
  );
}

export default function Portfolio() {
  const [activeCategory, setActiveCategory] = useState<Category>("All");
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [projectsError, setProjectsError] = useState("");
  const reduceMotion = useReducedMotion();
  const closeSelectedProject = useCallback(() => setSelectedProject(null), []);
  const setCategoryAndJump = (category: Category) => {
    setActiveCategory(category);
    document.getElementById("work")?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    let active = true;

    async function loadProjects() {
      try {
        const supabase = createSupabaseClient();
        const { data, error } = await supabase
          .from("projects")
          .select("*")
          .order("featured", { ascending: false })
          .order("created_at", { ascending: false });

        if (error) throw error;
        if (active) setProjects(data);
      } catch (error) {
        if (active) {
          setProjectsError(
            error instanceof Error
              ? error.message
              : typeof error === "object" &&
                  error !== null &&
                  "message" in error &&
                  typeof error.message === "string"
                ? error.message
                : "An unknown error prevented projects from loading.",
          );
        }
      } finally {
        if (active) setProjectsLoading(false);
      }
    }

    void loadProjects();
    return () => {
      active = false;
    };
  }, []);

  const visibleProjects =
    activeCategory === "All"
      ? projects
      : projects.filter((project) => project.category === activeCategory);
  const revealProps = reduceMotion
    ? { initial: false as const }
    : { initial: "hidden" as const, whileInView: "visible" as const };

  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#home" aria-label="Ivan Luis Simarmata home">
          <span className="brand-mark">IS</span>
          <span>ivan luis<span className="brand-dot">.</span></span>
        </a>
        <nav className="desktop-nav" aria-label="Main navigation">
          <a href="#work">Work</a>
          <a href="#skills">Skills</a>
          <a href="#about">About</a>
          <a href="#contact">Contact</a>
        </nav>
        <a className="button button-primary nav-cta" href="#contact">
          Let&apos;s talk <ArrowIcon diagonal />
        </a>
      </header>

      <section className="hero section-shell" id="home">
        <div className="hero-copy">
          <motion.div
            className="availability"
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="availability-dot" />
            DIGITAL CRAFT ACROSS DISCIPLINES
          </motion.div>
          <motion.h1
            initial={reduceMotion ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.08 }}
          >
            Digital craft,
            <br />
            <span>with a human</span>
            <br />
            point of view<span className="hero-period">.</span>
          </motion.h1>
          <motion.p
            className="hero-intro"
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.16 }}
          >
            I&apos;m Ivan Luis Simarmata — an Informatics graduate shaping
            thoughtful digital experiences, from the first sketch to the final
            frame.
          </motion.p>
          <motion.div
            className="hero-roles"
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
          >
            <span>Full-Stack Developer</span>
            <i />
            <span>UI/UX Designer</span>
            <i />
            <span>Event Photographer</span>
          </motion.div>
          <motion.div
            className="hero-actions"
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.32 }}
          >
            <a className="button button-primary" href="#work">
              Explore my work <ArrowIcon />
            </a>
            <a className="text-link" href="#about">
              A bit about me <ArrowIcon diagonal />
            </a>
          </motion.div>
          <div className="quick-filters" aria-label="Explore work by discipline">
            <span>EXPLORE BY</span>
            {(["Engineering", "UI/UX Design", "Photography"] as const).map(
              (category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setCategoryAndJump(category)}
                >
                  {category} <ArrowIcon diagonal />
                </button>
              ),
            )}
          </div>
        </div>

        <motion.div
          className="hero-visual"
          initial={reduceMotion ? false : { opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.12 }}
        >
          <div className="visual-orbit orbit-one" />
          <div className="visual-orbit orbit-two" />
          <div className="visual-glow" />
          <div className="visual-card">
            <div className="visual-card-top">
              <span>CREATIVE ENGINEER</span>
              <span className="visual-index">01 / 04</span>
            </div>
            <div className="visual-monogram">
              <span>I</span>
              <span className="monogram-l">L</span>
              <span className="monogram-s">S</span>
            </div>
            <div className="visual-card-bottom">
              <div>
                <strong>Ivan Luis Simarmata</strong>
                <span>Developer / Designer / Creator</span>
              </div>
              <SparkIcon />
            </div>
          </div>
          <div className="floating-note note-code">
            <span className="note-icon">{`{ }`}</span>
            <span>build with intent</span>
          </div>
          <div className="floating-note note-visual">
            <span className="note-icon note-camera">O</span>
            <span>see a new angle</span>
          </div>
        </motion.div>

        <div className="hero-bottom">
          <span>DEVELOPMENT / DESIGN / VISUAL STORYTELLING</span>
          <a href="#skills">
            SCROLL TO EXPLORE <span aria-hidden="true">v</span>
          </a>
        </div>
      </section>

      <section className="section-shell skills-section" id="skills">
        <motion.div
          className="section-heading"
          variants={reveal}
          {...revealProps}
          viewport={{ once: true, amount: 0.3 }}
        >
          <div>
            <span className="eyebrow">MY TOOLKIT</span>
            <h2>Different disciplines.<br />One curious mind.</h2>
          </div>
          <p>
            I like moving between code, design, and the details that make an
            experience feel effortless.
          </p>
        </motion.div>

        <div className="skills-grid">
          <motion.article
            className="skill-card skill-engineering"
            variants={reveal}
            {...revealProps}
            viewport={{ once: true, amount: 0.2 }}
            whileHover={reduceMotion ? undefined : { y: -5 }}
          >
            <div className="skill-card-top">
              <span className="skill-number">01</span>
              <span className="skill-icon icon-terminal" aria-hidden="true">
                &lt;/&gt;
              </span>
            </div>
            <span className="eyebrow">ENGINEERING</span>
            <h3>Make it work.<br />Make it matter.</h3>
            <p>Reliable foundations and considered interfaces for the web.</p>
            <div className="skill-chips">
              {engineeringSkills.map((skill) => (
                <SkillChip key={skill}>{skill}</SkillChip>
              ))}
            </div>
            <div className="code-decoration" aria-hidden="true">
              <span>const idea =</span>
              <span>&nbsp;&nbsp;build<span className="code-accent">(impact)</span>;</span>
              <span className="code-cursor" />
            </div>
          </motion.article>

          <motion.article
            className="skill-card skill-design"
            variants={reveal}
            {...revealProps}
            viewport={{ once: true, amount: 0.2 }}
            whileHover={reduceMotion ? undefined : { y: -5 }}
          >
            <div className="skill-card-top">
              <span className="skill-number">02</span>
              <span className="design-flower" aria-hidden="true">
                <i /><i /><i /><i />
              </span>
            </div>
            <span className="eyebrow">DESIGN & STORY</span>
            <h3>Make it clear.<br />Make it felt.</h3>
            <p>From a rough flow to a polished, purposeful visual system.</p>
            <div className="skill-chips">
              {designSkills.map((skill) => (
                <SkillChip key={skill}>{skill}</SkillChip>
              ))}
            </div>
          </motion.article>

          <motion.article
            className="skill-card skill-production"
            variants={reveal}
            {...revealProps}
            viewport={{ once: true, amount: 0.2 }}
            whileHover={reduceMotion ? undefined : { y: -5 }}
          >
            <div className="skill-card-top">
              <span className="skill-number">03</span>
              <span className="production-sun" aria-hidden="true">+</span>
            </div>
            <span className="eyebrow">CREATIVE PRODUCTION</span>
            <h3>Capture the<br />in-between.</h3>
            <p>Good energy, well-framed moments, and smooth live production.</p>
            <div className="skill-chips">
              {productionSkills.map((skill) => (
                <SkillChip key={skill}>{skill}</SkillChip>
              ))}
            </div>
          </motion.article>

          <motion.div
            className="skill-manifesto"
            variants={reveal}
            {...revealProps}
            viewport={{ once: true, amount: 0.2 }}
          >
            <SparkIcon />
            <p>Curiosity is a<br /><span>creative superpower.</span></p>
            <span className="eyebrow">ALWAYS LEARNING, ALWAYS MAKING</span>
          </motion.div>
        </div>
      </section>

      <section className="work-section" id="work">
        <div className="section-shell">
          <motion.div
            className="section-heading work-heading"
            variants={reveal}
            {...revealProps}
            viewport={{ once: true, amount: 0.3 }}
          >
            <div>
              <span className="eyebrow">SELECTED WORK</span>
              <h2>Proof of curiosity.</h2>
            </div>
            <p>
              A selection of things I&apos;ve helped bring to life. Choose a
              project to get the full story.
            </p>
          </motion.div>

          <div className="filter-row" role="tablist" aria-label="Filter projects">
            {categories.map((category) => (
              <button
                className={`filter-tab ${activeCategory === category ? "active" : ""}`}
                key={category}
                type="button"
                role="tab"
                aria-selected={activeCategory === category}
                onClick={() => setActiveCategory(category)}
              >
                {activeCategory === category && (
                  <motion.span
                    className="filter-pill"
                    layoutId="filter-pill"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
                <span>{category}</span>
              </button>
            ))}
          </div>

          {projectsError ? (
            <div className="project-state error-state" role="alert">
              <span className="state-symbol">!</span>
              <h3>Projects aren&apos;t available right now.</h3>
              <p>{projectsError}</p>
            </div>
          ) : projectsLoading ? (
            <div className="project-state" aria-live="polite">
              <span className="loading-ring" />
              <p>Gathering the good stuff...</p>
            </div>
          ) : visibleProjects.length > 0 ? (
            <motion.div className="projects-grid" layout>
              <AnimatePresence mode="popLayout">
                {visibleProjects.map((project, index) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    index={index}
                    onSelect={setSelectedProject}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          ) : (
            <div className="project-state">
              <span className="state-symbol">+</span>
              <h3>
                {projects.length === 0
                  ? "The next story is taking shape."
                  : "No projects in this category just yet."}
              </h3>
              <p>
                {projects.length === 0
                  ? "Check back soon for new work."
                  : "Try another filter to explore more of my work."}
              </p>
            </div>
          )}
          <div className="work-footnote">
            <span>GOOD WORK IS A TEAM SPORT.</span>
            <a href="#contact">Have a project in mind? <ArrowIcon diagonal /></a>
          </div>
        </div>
      </section>

      <section className="about-section section-shell" id="about">
        <motion.div
          className="about-visual"
          variants={reveal}
          {...revealProps}
          viewport={{ once: true, amount: 0.2 }}
        >
          <div className="about-frame">
            <div className="about-orbit" />
            <div className="about-monogram">IL<span>S</span></div>
            <div className="about-caption">
              <span>THINK / MAKE / CAPTURE</span>
              <span>IDEAS IN MOTION</span>
            </div>
          </div>
          <span className="about-sticker">A LITTLE<br />BIT OF<br /><span>EVERYTHING</span></span>
        </motion.div>
        <motion.div
          className="about-copy"
          variants={reveal}
          {...revealProps}
          viewport={{ once: true, amount: 0.2 }}
        >
          <span className="eyebrow">THE PERSON BEHIND THE PIXELS</span>
          <h2>One foot in<br />logic. One in<br /><span>imagination.</span></h2>
          <p>
            I&apos;m an Informatics graduate who loves connecting the dots
            between technology and people. I build for the details users feel,
            create with intention, and carry a camera to catch what words can&apos;t.
          </p>
          <p>
            Whether I&apos;m writing code, sketching a flow, or helping a live
            event run smoothly, I bring the same thing: curiosity, care, and a
            bias toward making.
          </p>
          <a className="text-link" href="#contact">
            Let&apos;s make something meaningful <ArrowIcon diagonal />
          </a>
        </motion.div>
      </section>

      <section className="contact-section" id="contact">
        <div className="section-shell contact-layout">
          <motion.div
            className="contact-copy"
            variants={reveal}
            {...revealProps}
            viewport={{ once: true, amount: 0.2 }}
          >
            <span className="eyebrow">HAVE A GOOD ONE IN MIND?</span>
            <h2>Let&apos;s make<br />it <span>real.</span></h2>
            <p>
              Tell me what you&apos;re dreaming up. I&apos;ll bring the curiosity,
              the craft, and a thoughtful first conversation.
            </p>
            <a className="contact-email" href="#contact-form">
              Start a conversation <ArrowIcon diagonal />
            </a>
            <div className="contact-location">
              <span className="availability-dot" />
              GOOD IDEAS START WITH A NOTE
            </div>
          </motion.div>
          <motion.div
            className="contact-form-wrap"
            variants={reveal}
            {...revealProps}
            viewport={{ once: true, amount: 0.2 }}
          >
            <div className="form-heading">
              <span className="eyebrow">START A CONVERSATION</span>
              <span className="form-step">01 / 01</span>
            </div>
            <ContactForm />
          </motion.div>
        </div>
      </section>

      <footer className="site-footer section-shell">
        <a className="brand footer-brand" href="#home">
          <span className="brand-mark">IS</span>
          <span>ivan luis<span className="brand-dot">.</span></span>
        </a>
        <span className="footer-note">MADE WITH INTENTION / BUILT FOR PEOPLE.</span>
        <a className="back-top" href="#home">BACK TO TOP ^</a>
        <span className="footer-copyright">COPYRIGHT IVAN LUIS SIMARMATA</span>
      </footer>

      <AnimatePresence>
        {selectedProject && (
          <ProjectModal
            key={selectedProject.id}
            project={selectedProject}
            onClose={closeSelectedProject}
          />
        )}
      </AnimatePresence>
    </main>
  );
}
