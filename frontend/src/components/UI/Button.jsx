// src/components/UI/Button.jsx
import React from "react";
import { Link } from "react-router-dom";
import "../../styles/Button.css";

/*
 - children: node
 - to: string (optional) - if provided renders an <a> link
 - onClick: func (optional)
 - variant: "primary" | "secondary" | "ghost" (default: primary)
 - className: string (optional)
 - disabled: boolean (optional)
 - type: "button" | "submit" (default: button)
*/

function Button({
  children,
  to,
  onClick,
  variant = "primary",
  className = "",
  disabled = false,
  type = "button",
}) {
  const base = `btn ${variant}-btn ${className}`.trim();

  if (to) {
    return (
      <Link
        to={to}
        className={base}
        aria-disabled={disabled}
        onClick={(e) => {
          if (disabled) e.preventDefault();
          else if (onClick) onClick(e);
        }}
      >
        {children}
      </Link>
    );
  }

  return (
    <button className={base} onClick={onClick} disabled={disabled} type={type}>
      {children}
    </button>
  );
}

export default Button;
