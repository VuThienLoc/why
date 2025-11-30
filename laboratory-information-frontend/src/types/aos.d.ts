declare module "aos" {
  interface AOSOptions {
    offset?: number;
    delay?: number;
    duration?: number;
    easing?: string;
    once?: boolean;
    mirror?: boolean;
    anchorPlacement?: "top-bottom" | "top-center" | "top-top" | "center-bottom" | "center-center" | "center-top" | "bottom-bottom" | "bottom-center" | "bottom-top";
  }

  interface AOSStatic {
    init(options?: AOSOptions): void;
    refresh(): void;
    refreshHard(): void;
  }

  const AOS: AOSStatic;
  export default AOS;
}


