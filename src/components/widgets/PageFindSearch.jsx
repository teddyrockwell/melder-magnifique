import React, { useEffect } from 'react';

const PageFindSearch = () => {
  useEffect(() => {
    function initializePagefind() {
      new PagefindUI({
        element: '#search',
        highlightParam: 'highlight',
        showSubResults: true,
        pageSize: 5,
        translations: {
          placeholder: 'Search',
          zero_results: 'No results related to [SEARCH_TERM].',
        },
        ranking: {
          pageLength: 0.5,
          termSimilarity: 0.75,
          termFrequency: 0.5,
        },
      });

      window.addEventListener('keydown', (event) => {
        if (event.key === '/' || event.key === '.') {
          event.preventDefault();
          document.querySelector('div#search input').focus();
        }
      });
    }

    document.addEventListener('astro:page-load', initializePagefind);
    initializePagefind();

    return () => {
      document.removeEventListener('astro:page-load', initializePagefind);
    };
  }, []);

  return <div id="search" className="py-8 -mt-8"></div>;
};

export default PageFindSearch;
