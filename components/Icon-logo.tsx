import React from 'react';

interface LogoProps {
  width?: number | string;
  height?: number | string;
  color?: string;
  fillColor?: string;
  className?: string;
  strokeWidth?: number;
}

const Logo: React.FC<LogoProps> = ({
  width = 24,
  height = 24,
  color = 'white',
  fillColor = 'black',
  className = '',
  strokeWidth = 2,
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill={fillColor}
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      width={width}
      height={height}
      className={className}
    >
      <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
    </svg>
  );
};

export default Logo;
