import React, { useState, useCallback } from "react";

interface ButtonProps {
  label: string;
  disabled?: boolean;
  onClick: () => void;
}

export function SampleButton({ label, disabled, onClick }: ButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = useCallback(() => {
    if (!disabled) {
      onClick();
    }
  }, [disabled, onClick]);

  return (
    <button
      disabled={disabled}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isHovered ? `${label}!` : label}
    </button>
  );
}
