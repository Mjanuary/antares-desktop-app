import { FunctionComponent } from "react";

export interface LogoProps extends React.SVGAttributes<SVGElement> {}

export const Logo: FunctionComponent<LogoProps> = (props) => {
  return (
    <svg
      width="66"
      height="66"
      viewBox="0 0 66 66"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M17.8897 20.1941L21.4419 29.7939L21.6563 30.3731L22.2354 30.5874L31.8353 34.1397L22.2354 37.6919L21.6563 37.9063L21.4419 38.4854L17.8897 48.0853L14.3374 38.4854L14.1231 37.9063L13.5439 37.6919L3.94407 34.1397L13.5439 30.5874L14.1231 30.3731L14.3374 29.7939L17.8897 20.1941Z"
        stroke="white"
        strokeWidth="2.68596"
      />
    </svg>
  );
};
