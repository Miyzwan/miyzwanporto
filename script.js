// ===== NAVBAR TOGGLE =====
function toggleNav() {
  const nav = document.getElementById('navLinks');
  const hamburger = document.getElementById('hamburger');
  nav.classList.toggle('active');
  hamburger.classList.toggle('active');
}

// Close nav on link click
document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', () => {
    document.getElementById('navLinks').classList.remove('active');
    document.getElementById('hamburger').classList.remove('active');
  });
});

// Navbar scroll effect
window.addEventListener('scroll', () => {
  const navbar = document.querySelector('.navbar');
  if (window.scrollY > 50) {
    navbar.style.borderBottom = '1px solid rgba(139,92,246,0.15)';
    navbar.style.boxShadow = '0 4px 20px rgba(0,0,0,0.3)';
  } else {
    navbar.style.borderBottom = '1px solid rgba(139,92,246,0.1)';
    navbar.style.boxShadow = 'none';
  }

  // Active nav link
  const sections = document.querySelectorAll('section[id]');
  const scrollY = window.scrollY + 100;
  sections.forEach(section => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.offsetHeight;
    const id = section.getAttribute('id');
    if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
      document.querySelectorAll('.nav-links a').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === '#' + id) {
          link.classList.add('active');
        }
      });
    }
  });
});

// ===== PARTICLE CANVAS =====
const canvas = document.getElementById('particleCanvas');
const ctx = canvas.getContext('2d');
let particles = [];

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

function createParticles() {
  particles = [];
  const count = Math.floor((canvas.width * canvas.height) / 15000);
  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 2 + 0.5,
      speedX: (Math.random() - 0.5) * 0.5,
      speedY: (Math.random() - 0.5) * 0.5,
      opacity: Math.random() * 0.5 + 0.1
    });
  }
}

function animateParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach(p => {
    p.x += p.speedX;
    p.y += p.speedY;
    if (p.x > canvas.width) p.x = 0;
    if (p.x < 0) p.x = canvas.width;
    if (p.y > canvas.height) p.y = 0;
    if (p.y < 0) p.y = canvas.height;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(139, 92, 246, ${p.opacity})`;
    ctx.fill();
  });

  // Draw connections
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 120) {
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.strokeStyle = `rgba(139, 92, 246, ${0.1 * (1 - dist / 120)})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
    }
  }
  requestAnimationFrame(animateParticles);
}

resizeCanvas();
createParticles();
animateParticles();
window.addEventListener('resize', () => {
  resizeCanvas();
  createParticles();
});

// ===== TYPEWRITER EFFECT =====
const typewriterEl = document.getElementById('typewriter');
const words = ['Dimas Dwi Ismaunnizam', 'Machine Learning Engineer', 'Web Developer', 'AI Enthusiast'];
let wordIndex = 0;
let charIndex = 0;
let isDeleting = false;

function typeEffect() {
  const currentWord = words[wordIndex];
  if (!isDeleting) {
    typewriterEl.textContent = currentWord.substring(0, charIndex + 1);
    charIndex++;
    if (charIndex === currentWord.length) {
      isDeleting = true;
      setTimeout(typeEffect, 2000);
      return;
    }
  } else {
    typewriterEl.textContent = currentWord.substring(0, charIndex - 1);
    charIndex--;
    if (charIndex === 0) {
      isDeleting = false;
      wordIndex = (wordIndex + 1) % words.length;
    }
  }
  const speed = isDeleting ? 50 : 100;
  setTimeout(typeEffect, speed);
}

if (typewriterEl) {
  setTimeout(typeEffect, 500);
}

// ===== INTERSECTION OBSERVER =====
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      // Animate skill bars
      if (entry.target.classList.contains('skill-fill')) {
        entry.target.style.width = entry.target.dataset.width + '%';
      }
    }
  });
}, observerOptions);

// Observe sections
document.querySelectorAll('section').forEach(section => {
  section.classList.add('animate-on-scroll');
  observer.observe(section);
});

// Observe skill bars
document.querySelectorAll('.skill-fill').forEach(bar => {
  observer.observe(bar);
});

// ===== LOAD PROJECTS =====
async function loadProjects() {
  const grid = document.getElementById('projectGrid');
  if (!grid) return;

  try {
    const res = await fetch('/api/projects');
    const projects = await res.json();
    renderProjects(projects);
    setupFilters(projects);
  } catch (err) {
    console.error('Failed to load projects:', err);
    grid.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:var(--text-muted)">Gagal memuat proyek.</p>';
  }
}

function renderProjects(projects) {
  const grid = document.getElementById('projectGrid');
  grid.innerHTML = projects.map(project => `
    <div class="project-card" data-category="${project.category}">
      <div class="project-image">
        <img src="${project.image}" alt="${project.title}" loading="lazy">
        <div class="overlay">
          ${project.liveUrl ? `<a href="${project.liveUrl}" target="_blank" title="Live Demo"><i class="fas fa-external-link-alt"></i></a>` : ''}
          ${project.sourceUrl ? `<a href="${project.sourceUrl}" target="_blank" title="Source Code"><i class="fab fa-github"></i></a>` : ''}
        </div>
      </div>
      <div class="project-info">
        <span class="project-category">${project.category}</span>
        <h3>${project.title}</h3>
        <p>${project.description}</p>
        <div class="project-tech">
          ${project.techStack.map(t => `<span>${t}</span>`).join('')}
        </div>
      </div>
    </div>
  `).join('');
}

function setupFilters(projects) {
  const filterBtns = document.querySelectorAll('.filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      if (filter === 'all') {
        renderProjects(projects);
      } else {
        renderProjects(projects.filter(p => p.category === filter));
      }
    });
  });
}

// ===== LOAD BLOGS =====
async function loadBlogs() {
  const grid = document.getElementById('blogGrid');
  if (!grid) return;

  try {
    const res = await fetch('/api/blogs');
    const blogs = await res.json();
    // Show latest 3 on homepage, all on blog listing
    const isHome = grid.closest('#blog');
    const displayBlogs = isHome ? blogs.slice(0, 3) : blogs;
    renderBlogs(displayBlogs);
  } catch (err) {
    console.error('Failed to load blogs:', err);
    grid.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:var(--text-muted)">Gagal memuat blog.</p>';
  }
}

function renderBlogs(blogs) {
  const grid = document.getElementById('blogGrid');
  if (!grid) return;

  grid.innerHTML = blogs.map(blog => `
    <div class="blog-card">
      <a href="/blog-detail.html?slug=${blog.slug}">
        <div class="blog-image">
          <img src="${blog.coverImage}" alt="${blog.title}" loading="lazy">
        </div>
      </a>
      <div class="blog-body">
        <div class="blog-date">${formatDate(blog.createdAt)}</div>
        <h3><a href="/blog-detail.html?slug=${blog.slug}">${blog.title}</a></h3>
        <p>${blog.excerpt}</p>
        <div class="blog-tags">
          ${blog.tags.map(t => `<span>${t}</span>`).join('')}
        </div>
      </div>
    </div>
  `).join('');
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
}

// ===== CONTACT FORM =====
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    alert('Terima kasih! Pesan Anda telah dikirim. Saya akan menghubungi Anda segera.');
    contactForm.reset();
  });
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  loadProjects();
  loadBlogs();
});
