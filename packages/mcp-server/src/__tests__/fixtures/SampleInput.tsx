import React, { forwardRef, memo } from "react";
import { useCustomValidation } from "./hooks";

type InputProps = {
  value: string;
  onChange: (value: string) => void;
  children?: React.ReactNode;
};

export const SampleInput = memo(
  forwardRef<HTMLInputElement, InputProps>(function SampleInput(
    { value, onChange, children },
    ref
  ) {
    const { isValid } = useCustomValidation(value);

    return (
      <div>
        <input
          ref={ref}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        {!isValid && <span>Invalid</span>}
        {children}
      </div>
    );
  })
);
