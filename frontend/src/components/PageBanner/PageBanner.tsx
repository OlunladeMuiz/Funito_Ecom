import { Link } from "react-router-dom";
import "./PageBanner.css";

interface PageBannerProps {
  title: string;
  breadcrumbs?: { label: string; href?: string }[];
}

export function PageBanner({ title, breadcrumbs = [] }: PageBannerProps) {
  return (
    <div className="page-banner">
      <div className="container">
        <h1>{title}</h1>
        {breadcrumbs.length > 0 && (
          <nav className="breadcrumbs">
            <Link to="/">Home</Link>
            {breadcrumbs.map((crumb, index) => (
              <span key={index}>
                <span className="separator">/</span>
                {crumb.href ? (
                  <Link to={crumb.href}>{crumb.label}</Link>
                ) : (
                  <span className="current">{crumb.label}</span>
                )}
              </span>
            ))}
          </nav>
        )}
      </div>
    </div>
  );
}
