import type { MermaidConfig } from "mermaid";
import Panzoom, { type PanzoomObject } from "@panzoom/panzoom";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { cn } from "./utils";

const initializeMermaid = async (customConfig?: MermaidConfig) => {
  const defaultConfig: MermaidConfig = {
    startOnLoad: false,
    theme: "default",
    securityLevel: "strict",
    fontFamily: "monospace",
    suppressErrorRendering: true,
  } as MermaidConfig;

  const config = { ...defaultConfig, ...customConfig };

  const mermaidModule = await import("mermaid");
  const mermaid = mermaidModule.default;

  // Always reinitialize with the current config to support different configs per component
  mermaid.initialize(config);

  return mermaid;
};

type MermaidProps = {
  chart: string;
  className?: string;
  config?: MermaidConfig;
  onPanzoomReady?: (isReady: boolean) => void;
  enablePanZoom?: boolean;
  renderId?: string;
};

export type MermaidControls = {
  reset: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
};

let renderCounter = 0;
const INLINE_MAX_HEIGHT = "28rem";

const createRenderId = () => {
  renderCounter += 1;
  return `streamdown-mermaid-${Date.now().toString(36)}-${renderCounter.toString(36)}`;
};

export const Mermaid = forwardRef<MermaidControls, MermaidProps>(
  ({ chart, className, config, onPanzoomReady, enablePanZoom = false, renderId }: MermaidProps, ref) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const panzoomRef = useRef<PanzoomObject | null>(null);
    const wheelHandlerRef = useRef<((event: WheelEvent) => void) | null>(null);
    const readyCallbackRef = useRef<((isReady: boolean) => void) | undefined>(undefined);
    const lastValidSvgRef = useRef<string>("");

    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [hasRendered, setHasRendered] = useState(false);

    useEffect(() => {
      readyCallbackRef.current = onPanzoomReady;
    }, [onPanzoomReady]);

    useImperativeHandle(
      ref,
      () => ({
        reset: () => {
          panzoomRef.current?.reset();
        },
        zoomIn: () => {
          panzoomRef.current?.zoomIn();
        },
        zoomOut: () => {
          panzoomRef.current?.zoomOut();
        },
      }),
      []
    );

    const destroyPanzoom = () => {
      if (wheelHandlerRef.current && containerRef.current) {
        containerRef.current.removeEventListener("wheel", wheelHandlerRef.current);
      }

      wheelHandlerRef.current = null;

      if (panzoomRef.current) {
        panzoomRef.current.destroy();
        panzoomRef.current = null;
      }

      readyCallbackRef.current?.(false);
    };

    const applySvgSizing = (svgElement: SVGElement) => {
      svgElement.removeAttribute("width");
      svgElement.removeAttribute("height");
      svgElement.setAttribute("preserveAspectRatio", "xMidYMid meet");
      svgElement.style.display = "block";
      svgElement.style.margin = "0 auto";

      if (enablePanZoom) {
        svgElement.style.width = "auto";
        svgElement.style.height = "100%";
        svgElement.style.maxWidth = "100%";
        svgElement.style.maxHeight = "100%";
      } else {
        svgElement.style.width = "100%";
        svgElement.style.height = "auto";
        svgElement.style.maxWidth = "100%";
        svgElement.style.maxHeight = INLINE_MAX_HEIGHT;
      }
    };

    const getNaturalSize = (svgElement: SVGElement) => {
      const viewBox = (svgElement as SVGSVGElement).viewBox?.baseVal;
      if (viewBox && viewBox.width > 0 && viewBox.height > 0) {
        return { width: viewBox.width, height: viewBox.height } as const;
      }

      const bbox = (svgElement as SVGGraphicsElement).getBBox();
      if (bbox.width > 0 && bbox.height > 0) {
        return {
          width: bbox.width,
          height: bbox.height,
        } as const;
      }

      const rect = svgElement.getBoundingClientRect();
      return {
        width: rect.width || 1,
        height: rect.height || 1,
      } as const;
    };

    const initializePanzoom = (svgElement: SVGElement) => {
      destroyPanzoom();

      // Ensure SVG can expand inside container before panzoom
      applySvgSizing(svgElement);

      const panzoomInstance = Panzoom(svgElement, {
        animate: true,
        contain: enablePanZoom ? null : "inside",
        duration: 200,
        easing: "ease-in-out",
        maxScale: enablePanZoom ? 10 : 5,
        minScale: 0.5,
        step: 0.1,
        startScale: 1,
      });

      panzoomRef.current = panzoomInstance;

      if (containerRef.current) {
        const handleWheel = (event: WheelEvent) => {
          if (!panzoomRef.current) {
            return;
          }

          event.preventDefault();
          panzoomRef.current.zoomWithWheel(event);
        };

        containerRef.current.addEventListener("wheel", handleWheel, {
          passive: false,
        });
        wheelHandlerRef.current = handleWheel;
      }

      svgElement.style.cursor = "grab";

      const container = containerRef.current;
      if (container) {
        requestAnimationFrame(() => {
          if (!panzoomRef.current) {
            return;
          }

          const { width: naturalWidth, height: naturalHeight } =
            getNaturalSize(svgElement);

          if (naturalWidth === 0 || naturalHeight === 0) {
            return;
          }

          const containerRect = container.getBoundingClientRect();
          const scaleX = containerRect.width / naturalWidth;
          const scaleY = containerRect.height / naturalHeight;
          const fitScale = Math.min(scaleX, scaleY, 1);
          const clampedFit = Number.isFinite(fitScale) && fitScale > 0 ? fitScale : 1;
          const initialScale = enablePanZoom
            ? clampedFit * 1
            : clampedFit;

          panzoomRef.current.setOptions({
            minScale: clampedFit * 0.5,
            maxScale: clampedFit * 8,
          });

          panzoomRef.current.reset({ animate: false });
          panzoomRef.current.zoom(clampedFit, { animate: false });
        });
      }

      readyCallbackRef.current?.(true);
    };

    // biome-ignore lint/correctness/useExhaustiveDependencies: "Mermaid needs to rerun when chart or config changes"
    useEffect(() => {
      let isCancelled = false;

      const renderChart = async () => {
        const container = containerRef.current;
        if (!container) {
          return;
        }

        setIsLoading(true);
        setError(null);
        readyCallbackRef.current?.(false);

        const previousContent = container.innerHTML;
        const idToUse = renderId ?? createRenderId();

        try {
          const mermaid = await initializeMermaid(config);
          if (isCancelled) {
            return;
          }

          destroyPanzoom();
          const { svg } = await mermaid.render(idToUse, chart);

          if (isCancelled || !containerRef.current) {
            return;
          }

          containerRef.current.innerHTML = svg;

          const svgElement = containerRef.current.querySelector("svg");

          if (svgElement instanceof SVGElement) {
            // Ensure the SVG has the expected id so controls can target it reliably
            svgElement.id = idToUse;
            
            if (enablePanZoom) {
              void initializePanzoom(svgElement);
            } else {
              applySvgSizing(svgElement);
              readyCallbackRef.current?.(true);
            }
          }

          if (isCancelled) {
            return;
          }

          lastValidSvgRef.current = container.innerHTML;
          setHasRendered(true);
        } catch (err) {
          if (isCancelled) {
            return;
          }

          const fallback = lastValidSvgRef.current;

          if (fallback && containerRef.current) {
            containerRef.current.innerHTML = fallback;
            const fallbackSvg = containerRef.current.querySelector("svg");
            if (fallbackSvg instanceof SVGElement) {
              // Restore the id on fallback SVG as well
              fallbackSvg.id = idToUse;
              
              if (enablePanZoom) {
                void initializePanzoom(fallbackSvg);
              } else {
                applySvgSizing(fallbackSvg);
                readyCallbackRef.current?.(true);
              }
            }
            setHasRendered(true);
          } else {
            container.innerHTML = previousContent;
            setHasRendered(false);
          }

          const message =
            err instanceof Error ? err.message : "Failed to render Mermaid chart";

          if (!fallback) {
            setError(message);
          }
        } finally {
          if (!isCancelled) {
            setIsLoading(false);
          }
        }
      };

      renderChart();

      return () => {
        isCancelled = true;
        destroyPanzoom();
      };
    }, [chart, config]);

    const containerStyle = useMemo(() => {
      if (enablePanZoom) {
        return { height: "100%", maxHeight: "100%" } as const;
      }

      return {
        maxHeight: INLINE_MAX_HEIGHT,
      } as const;
    }, [enablePanZoom]);

    const hasContent = hasRendered || Boolean(lastValidSvgRef.current);

    if (!hasContent && error) {
      return (
        <div
          className={cn(
            "my-4 rounded-lg border border-red-200 bg-red-50 p-4",
            className
          )}
        >
          <p className="font-mono text-red-700 text-sm">Mermaid Error: {error}</p>
          <details className="mt-2">
            <summary className="cursor-pointer text-red-600 text-xs">Show Code</summary>
            <pre className="mt-2 overflow-x-auto rounded bg-red-100 p-2 text-red-800 text-xs">
              {chart}
            </pre>
          </details>
        </div>
      );
    }

    return (
      <div
        aria-label="Mermaid chart"
        className={cn(
          "flex w-full items-center justify-center",
          enablePanZoom
            ? "my-0 h-full overflow-hidden"
            : "my-4 max-h-[28rem] overflow-auto",
          className
        )}
        ref={containerRef}
        style={containerStyle}
        role="img"
      />
    );
  }
);

Mermaid.displayName = "Mermaid";
