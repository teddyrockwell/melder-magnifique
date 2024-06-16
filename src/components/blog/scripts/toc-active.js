// document.addEventListener('astro:page-load', () => {
//   function addIntersectionObserver() {
//     const observer = new IntersectionObserver((sections) => {
//       sections.forEach((section) => {
//         const heading = section.target.querySelector('h2, h3, h4, h5, h6');
//         if (!heading) return;
//         const id = heading.getAttribute('id');
//         const link = document.querySelector(`nav.toc li a[href="#${id}"]`);
//         if (!link) return;
//         const addRemove = section.intersectionRatio > 0 ? 'add' : 'remove';
//         link.classList[addRemove]('active');

//         // Log the intersection status and the link update
//         // console.log(`Section ${id} is ${section.intersectionRatio > 0 ? 'in view' : 'out of view'}`);
//         // console.log(`Link ${link.href} ${addRemove} class 'active'`);
//       });
//     });

//     document.querySelectorAll('article section').forEach((section) => {
//       observer.observe(section);
//       const heading = section.querySelector('h2, h3, h4, h5, h6');
//       if (heading) {
//         console.log(`Observing section: ${heading.id}`);
//       }
//     });
//   }

//   addIntersectionObserver();
// });
