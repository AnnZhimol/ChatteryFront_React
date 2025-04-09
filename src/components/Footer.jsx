import "react";
import '../styles/Footer.css';

export const Footer = () => {
  return (
    <footer className="footer">
      Посетите автора на{" "}
      <a
        href="https://github.com/AnnZhimol"
        target="_blank"
        rel="noopener noreferrer"
        className="github-link"
      >
        GitHub
      </a>
      .
    </footer>
  );
};
