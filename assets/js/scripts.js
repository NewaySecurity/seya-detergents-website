// Add event listeners to navigation links
document.querySelectorAll('nav a').forEach(link => {
  link.addEventListener('click', event => {
    // Add smooth scrolling to anchor links
    if (link.getAttribute('href').startsWith('#')) {
      event.preventDefault();
      document.querySelector(link.getAttribute('href')).scrollIntoView({
        behavior: 'smooth'
      });
    }
  });
});