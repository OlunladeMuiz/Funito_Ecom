import "./Loading.css";

interface LoadingProps {
  size?: "small" | "medium" | "large";
  fullPage?: boolean;
}

export function Loading({ size = "medium", fullPage = false }: LoadingProps) {
  const spinner = (
    <div className={`spinner spinner-${size}`}>
      <div className="spinner-ring"></div>
    </div>
  );

  if (fullPage) {
    return <div className="loading-fullpage">{spinner}</div>;
  }

  return spinner;
}
