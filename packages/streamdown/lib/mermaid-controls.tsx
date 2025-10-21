import {
  CheckIcon,
  CopyIcon,
  DownloadIcon,
  Maximize,
  RefreshCw,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import type { MermaidConfig } from "mermaid";
import {
  type ComponentProps,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { StreamdownRuntimeContext } from "../index";
import { Mermaid, type MermaidControls } from "./mermaid";
import { cn, save, svgToPNG } from "./utils";

const findMermaidSvg = (anchor: HTMLElement | null, renderId?: string) => {
  if (typeof document !== "undefined" && renderId) {
    const byId = document.getElementById(renderId);
    if (byId instanceof SVGElement) {
      return byId as SVGElement;
    }
  }
  const mermaidBlock = anchor?.closest('[data-streamdown="mermaid-block"]');
  return mermaidBlock?.querySelector("svg") as SVGElement | null;
};

type DropdownButtonProps = {
  className?: string;
  chart: string;
  onCopy?: () => void;
  onDownload?: () => void;
  onError?: (error: Error) => void;
  timeout?: number;
  type: "download" | "copy";
  renderId?: string;
};

const DropdownButton = ({
  className,
  chart,
  onCopy,
  onDownload,
  onError,
  timeout = 2000,
  type,
  renderId,
}: DropdownButtonProps) => {
  const { isAnimating } = useContext(StreamdownRuntimeContext);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef(0);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    return () => {
      window.clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleCopyWebP = async () => {
    if (typeof window === "undefined" || !navigator?.clipboard?.write) {
      onError?.(new Error("Clipboard API not available"));
      return;
    }

    try {
      const svgElement = findMermaidSvg(dropdownRef.current, renderId);

      if (!svgElement) {
        throw new Error("Mermaid diagram not found");
      }

      const blob = await svgToPNG(svgElement, 1.0);
      await navigator.clipboard.write([
        new ClipboardItem({
          "image/png": blob,
        }),
      ]);

      onCopy?.();
      setIsOpen(false);
    } catch (error) {
      onError?.(error as Error);
    }
  };

  const handleCopyMmd = async () => {
    if (typeof window === "undefined" || !navigator?.clipboard?.writeText) {
      onError?.(new Error("Clipboard API not available"));
      return;
    }

    try {
      await navigator.clipboard.writeText(chart);
      onCopy?.();
      setIsOpen(false);
    } catch (error) {
      onError?.(error as Error);
    }
  };

  const handleDownloadWebP = async () => {
    try {
      const svgElement = findMermaidSvg(dropdownRef.current, renderId);
      console.log('svgElement', svgElement);

      if (!svgElement) {
        throw new Error("Mermaid diagram not found");
      }
      const blob = await svgToPNG(svgElement, 1.0);
      console.log('blob', blob);
      save(`mermaid-diagram-${Date.now()}.png`, blob, "image/png");
      onDownload?.();
      setIsOpen(false);
    } catch (error) {
      onError?.(error as Error);
    }
  };

  const handleDownloadMmd = () => {
    try {
      save(`mermaid-diagram-${Date.now()}.mmd`, chart, "text/plain");
      onDownload?.();
      setIsOpen(false);
    } catch (error) {
      onError?.(error as Error);
    }
  };

  const Icon = type === "download" ? DownloadIcon : CopyIcon;
  const title = type === "download" ? "Download diagram" : "Copy diagram";

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className={cn(
          "cursor-pointer p-1 text-muted-foreground transition-all hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50 w-fit",
          className
        )}
        disabled={isAnimating}
        onClick={() => setIsOpen((prev) => !prev)}
        title={title}
        type="button"
      >
        <Icon size={14} />
      </button>
      {isOpen && (
        <div className="absolute top-full right-0 z-10 mt-1 w-max rounded-md border border-border bg-background shadow-lg" style={{
                  width: "max-content",
                }}>
          {type === "copy" ? (
            <>
              <button
                className="flex w-max items-center gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-muted/40"
                onClick={handleCopyWebP}
                type="button"
                style={{
                  width: "max-content",
                }}
              >
                  <CopyIcon className="h-4 w-4" />
                <span>Copy as PNG</span>
              </button>
              <button
                className="flex w-max items-center gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-muted/40"
                onClick={handleCopyMmd}
                type="button"
                style={{
                  width: "max-content",
                }}
              >
                <CopyIcon className="h-4 w-4" />
                <span>Copy as MMD</span>
              </button>
            </>
          ) : (
            <>
              <button
                className="flex w-max items-center gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-muted/40"
                onClick={handleDownloadWebP}
                type="button"
                style={{
                  width: "max-content",
                }}
              >
                <DownloadIcon className="h-4 w-4" />
                <span>Download as PNG</span>
              </button>
              <button
                className="flex w-max items-center gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-muted/40"
                onClick={handleDownloadMmd}
                type="button"
                style={{
                  width: "max-content",
                }}
              >
                <DownloadIcon className="h-4 w-4" />
                <span>Download as MMD</span>
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export type MermaidCopyButtonProps = {
  className?: string;
  chart: string;
  onCopy?: () => void;
  onError?: (error: Error) => void;
  timeout?: number;
  renderId?: string;
};

export const MermaidCopyButton = ({
  className,
  chart,
  onCopy,
  onError,
  timeout = 2000,
  renderId,
}: MermaidCopyButtonProps) => {
  return (
    <DropdownButton
      chart={chart}
      className={className}
      onCopy={onCopy}
      onError={onError}
      timeout={timeout}
      renderId={renderId}
      type="copy"
    />
  );
};

export type MermaidDownloadButtonProps = {
  className?: string;
  chart: string;
  onDownload?: () => void;
  onError?: (error: Error) => void;
  renderId?: string;
};

export const MermaidDownloadButton = ({
  className,
  chart,
  onDownload,
  onError,
  renderId,
}: MermaidDownloadButtonProps) => {
  return (
    <DropdownButton
      chart={chart}
      className={className}
      onDownload={onDownload}
      onError={onError}
      renderId={renderId}
      type="download"
    />
  );
};

/**
 * Button component to view a Mermaid diagram in fullscreen mode with pan/zoom controls
 */
export type MermaidFullscreenButtonProps = ComponentProps<"button"> & {
  chart: string;
  config?: MermaidConfig;
};

export const MermaidFullscreenButton = ({
  chart,
  config,
  children,
  className,
  ...props
}: MermaidFullscreenButtonProps) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { isAnimating } = useContext(StreamdownRuntimeContext);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<MermaidControls | null>(null);
  const [isPanzoomReady, setIsPanzoomReady] = useState(false);

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen((prev) => !prev);
  }, []);

  const handleControlsRef = useCallback((instance: MermaidControls | null) => {
    controlsRef.current = instance;
  }, []);

  const handleZoomIn = useCallback(() => {
    controlsRef.current?.zoomIn();
  }, []);

  const handleZoomOut = useCallback(() => {
    controlsRef.current?.zoomOut();
  }, []);

  const handleReset = useCallback(() => {
    controlsRef.current?.reset();
  }, []);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    if (isFullscreen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";

      // Add webkit scrollbar hiding style
      const style = document.createElement("style");
      style.id = "streamdown-fullscreen-scrollbar-hide";
      style.textContent = `
        .streamdown-fullscreen-scroll::-webkit-scrollbar {
          display: none;
        }
      `;
      document.head.appendChild(style);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";

      // Remove the style tag
      const style = document.getElementById(
        "streamdown-fullscreen-scrollbar-hide"
      );
      if (style) {
        style.remove();
      }
    };
  }, [isFullscreen]);

  useEffect(() => {
    if (!isFullscreen) {
      controlsRef.current = null;
      setIsPanzoomReady(false);
    }
  }, [isFullscreen]);

  return (
    <>
      <button
        className={cn(
          "cursor-pointer p-1 text-muted-foreground transition-all hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        disabled={isAnimating}
        onClick={toggleFullscreen}
        title="View fullscreen"
        type="button"
        {...props}
      >
        {children ?? <Maximize size={14} />}
      </button>

      {isFullscreen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm p-4 sm:p-6 md:p-8"
          onClick={toggleFullscreen}
        >
          <div
            className="relative flex h-full w-full max-h-[calc(100vh-2rem)] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-xl border bg-background shadow-2xl sm:max-h-[calc(100vh-3rem)] sm:max-w-[calc(100vw-3rem)] md:max-h-[calc(100vh-4rem)] md:max-w-[calc(100vw-4rem)]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-4 right-4 z-10 cursor-pointer rounded-md p-2 text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
              onClick={toggleFullscreen}
              title="Close fullscreen (ESC)"
              type="button"
            >
              <X size={20} />
            </button>
            {isFullscreen && (
              <div className="absolute left-1/2 top-4 z-10 -translate-x-1/2 transform rounded-md border bg-background/95 shadow-lg">
                <div className="flex items-center divide-x divide-border/70">
                  <button
                    className="flex items-center gap-2 px-3 py-2 text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={!isPanzoomReady}
                    onClick={handleZoomOut}
                    title="Zoom out"
                    type="button"
                  >
                    <ZoomOut className="h-4 w-4" />
                    <span className="hidden sm:inline">Out</span>
                  </button>
                  <button
                    className="flex items-center gap-2 px-3 py-2 text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={!isPanzoomReady}
                    onClick={handleReset}
                    title="Reset view"
                    type="button"
                  >
                    <RefreshCw className="h-4 w-4" />
                    <span className="hidden sm:inline">Reset</span>
                  </button>
                  <button
                    className="flex items-center gap-2 px-3 py-2 text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={!isPanzoomReady}
                    onClick={handleZoomIn}
                    title="Zoom in"
                    type="button"
                  >
                    <ZoomIn className="h-4 w-4" />
                    <span className="hidden sm:inline">In</span>
                  </button>
                </div>
              </div>
            )}
            <div
              ref={scrollContainerRef}
              className="streamdown-fullscreen-scroll flex h-full items-center justify-center overflow-hidden p-4 sm:p-6 md:p-8"
              style={{
                scrollbarWidth: "none",
                msOverflowStyle: "none",
                WebkitOverflowScrolling: "touch",
              }}
            >
              <div className="h-full w-full">
                <Mermaid
                  chart={chart}
                  className="my-0 h-full"
                  config={config}
                  enablePanZoom={true}
                  onPanzoomReady={setIsPanzoomReady}
                  ref={handleControlsRef}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

