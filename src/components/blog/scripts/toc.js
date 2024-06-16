document.addEventListener('astro:page-load', () => {
  const progressBar = document.querySelector('.toc-progress-bar div');
  const tocLinks = document.querySelectorAll('.toc a');
  const sections = Array.from(tocLinks).map((link) => document.querySelector(link.getAttribute('href')));
  const blogPostContainer = document.querySelector('article'); // Adjust the selector to match your blog post container
  let lastActiveLink = null;

  if (!progressBar || !tocLinks || !sections || !blogPostContainer) {
    console.error('Progress bar, TOC links, sections, or blog post container not found');
    return;
  }

  const handleScroll = () => {
    const scrollPosition = window.scrollY + window.innerHeight * 0.4; // Adjust to ensure proper activation at 60% of the viewport
    const blogHeight = blogPostContainer.scrollHeight;
    const blogOffsetTop = blogPostContainer.offsetTop;
    const documentHeight = blogHeight + blogOffsetTop - window.innerHeight;
    const scrollPercentage = ((scrollPosition - blogOffsetTop) / documentHeight) * 100;
    progressBar.style.width = `${Math.min(Math.max(scrollPercentage, 0), 100)}%`; // Ensure the percentage stays within 0-100%

    // Determine the currently active section
    let activeSection = null;
    for (let i = sections.length - 1; i >= 0; i--) {
      if (scrollPosition >= sections[i].offsetTop) {
        activeSection = sections[i];
        break;
      }
    }

    if (activeSection) {
      tocLinks.forEach((link) => {
        link.classList.remove('active');
        if (link.classList.contains('toc-link-level-2')) {
          const parentLink = link.closest('ul').previousElementSibling;
          if (parentLink) {
            parentLink.classList.remove('active');
          }
        }
      });

      const activeLink = document.querySelector(`a[href="#${activeSection.id}"]`);
      activeLink.classList.add('active');
      if (activeLink.classList.contains('toc-link-level-2')) {
        const parentLink = activeLink.closest('ul').previousElementSibling;
        if (parentLink) {
          parentLink.classList.add('active');
        }
      }
      lastActiveLink = activeLink;
    }
  };

  window.addEventListener('scroll', handleScroll);
  handleScroll(); // Call once to set initial state

  // Set up the IntersectionObserver to handle snapping behavior
  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -55% 0px', // Trigger when the section is 60% in view
    threshold: 0, // Threshold set to 0 to trigger immediately when the section enters the root margin
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const link = document.querySelector(`a[href="#${entry.target.id}"]`);
      const isActive = entry.isIntersecting;

      if (isActive) {
        link.classList.add('active');
        if (link.classList.contains('toc-link-level-2')) {
          const parentLink = link.closest('ul').previousElementSibling;
          if (parentLink) {
            parentLink.classList.add('active');
          }
        }
        lastActiveLink = link;
      } else {
        link.classList.remove('active');
        if (link.classList.contains('toc-link-level-2')) {
          const parentLink = link.closest('ul').previousElementSibling;
          if (parentLink) {
            const siblingLinks = Array.from(parentLink.nextElementSibling.querySelectorAll('.toc-link-level-2'));
            const anySiblingActive = siblingLinks.some((siblingLink) => siblingLink.classList.contains('active'));
            if (!anySiblingActive) {
              parentLink.classList.remove('active');
            }
          }
        }
      }
    });
  }, observerOptions);

  sections.forEach((section) => {
    if (section) {
      observer.observe(section);
    }
  });
});
document.addEventListener('astro:page-load', () => {
  const backToTopButton = document.querySelector('.toc-back-to-top');
  backToTopButton?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
});
