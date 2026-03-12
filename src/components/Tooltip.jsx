import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Info } from "lucide-react";

const TOOLTIP_WIDTH = 288;
const MARGIN = 8;

export function InfoTip({ size = 13, info }) {
  const [rect, setRect] = useState(null);
  const iconRef = useRef(null);

  function handleEnter() {
    setRect(iconRef.current.getBoundingClientRect());
  }

  function handleLeave() {
    setRect(null);
  }

  if (!info) return null;

  return (
    <>
      <Info
        ref={iconRef}
        size={size}
        className="text-gray-300 hover:text-blue-500 cursor-pointer transition-colors shrink-0"
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
      />
      {rect && createPortal(
        <TooltipPopup info={info} iconRect={rect} />,
        document.body
      )}
    </>
  );
}

function TooltipPopup({ info, iconRect }) {
  const ref = useRef(null);
  const [style, setStyle] = useState({ visibility: "hidden", left: 0, top: 0 });

  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    const height = el.offsetHeight;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // Horizontal: right of icon → flip left if overflow
    let left = iconRect.right + MARGIN;
    if (left + TOOLTIP_WIDTH > vw - MARGIN) {
      left = iconRect.left - TOOLTIP_WIDTH - MARGIN;
    }
    left = Math.max(MARGIN, left);

    // Vertical: align top with icon → flip up if overflow below
    let top = iconRect.top;
    if (top + height > vh - MARGIN) {
      top = iconRect.bottom - height;
    }
    top = Math.max(MARGIN, top);

    setStyle({ visibility: "visible", left, top });
  }, [iconRect]);

  return (
    <div
      ref={ref}
      style={{ position: "fixed", zIndex: 99999, width: TOOLTIP_WIDTH, ...style }}
      className="bg-gray-900 text-white text-xs rounded-xl px-3 py-3 shadow-2xl flex flex-col gap-1.5 pointer-events-none"
    >
      <p className="font-semibold text-blue-300 text-sm">{info.title}</p>
      <p className="text-gray-300 leading-relaxed">{info.explanation}</p>
      {info.legal && (
        <p className="text-gray-500 italic border-t border-gray-700 pt-1.5 mt-0.5">
          📋 {info.legal}
        </p>
      )}
    </div>
  );
}
