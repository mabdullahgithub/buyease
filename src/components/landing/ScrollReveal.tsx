"use client";

import { useEffect } from "react";

export default function ScrollReveal() {
  useEffect(() => {
    const selector = ".reveal, .reveal-scale, .reveal-left, .reveal-right";

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -40px 0px",
      }
    );

    const observeTargets = (root: ParentNode) => {
      const targets = root.querySelectorAll(selector);
      targets.forEach((el) => observer.observe(el));
    };

    observeTargets(document);

    // Also watch for dynamically inserted reveal elements (e.g. Show More).
    const mutationObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (!(node instanceof HTMLElement)) return;

          if (node.matches(selector)) {
            observer.observe(node);
          }

          observeTargets(node);
        });
      });
    });

    mutationObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      mutationObserver.disconnect();
      observer.disconnect();
    };
  }, []);

  return null;
}
