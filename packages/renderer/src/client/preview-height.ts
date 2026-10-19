/**
 * The message a scripted preview frame and its page exchange. The frame's
 * reporter (preview-document.ts) posts `{ type, height }` with its content
 * height; the page posts `{ type }` to ask for the height again.
 */
export const PREVIEW_HEIGHT_MESSAGE = "cookbook:preview-height";

const previewFrames = () =>
  document.querySelectorAll<HTMLIFrameElement>("[data-element=Preview] iframe");

/**
 * Size each preview frame to the height its document reports plus the frame's
 * `data-buffer` length, a validated CSS length. The frame's `min-height` and
 * `max-height` clamp the value, so this only sets `height`.
 */
export function initializePreviewHeight(): void {
  addEventListener("message", resizePreviewFrame);
  // Frames usually load and report before this deferred module runs.
  for (const frame of previewFrames())
    frame.contentWindow?.postMessage({ type: PREVIEW_HEIGHT_MESSAGE }, "*");
}

function resizePreviewFrame({ data, source }: MessageEvent): void {
  const height: unknown = data?.type === PREVIEW_HEIGHT_MESSAGE && data.height;
  if (typeof height !== "number" || !Number.isFinite(height) || height < 0)
    return;
  for (const frame of previewFrames())
    if (frame.contentWindow === source) {
      const content = `${Math.ceil(height)}px`;
      const { buffer } = frame.dataset;
      frame.style.height = buffer ? `calc(${content} + ${buffer})` : content;
      return;
    }
}
