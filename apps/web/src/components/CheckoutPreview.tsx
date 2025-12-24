'use client';

import { useMemo } from "react";

export type CheckoutPreviewProps = {
  theme: "Light" | "Dark";
  showLogo: boolean;
  showBanner: boolean;
  requiredAddress: boolean;
  requiredPhone: boolean;
  requiredBirthdate: boolean;
  requiredDocument: boolean;
  countdownEnabled?: boolean;
  accentColor?: string;
  counterBgColor: string;
  counterTextColor: string;
};

export default function CheckoutPreview(props: CheckoutPreviewProps) {
  const {
    theme,
    showLogo,
    showBanner,
    requiredAddress,
    requiredPhone,
    requiredBirthdate,
    requiredDocument,
    countdownEnabled = false,
    accentColor = "#18a64a",
    counterBgColor,
    counterTextColor,
  } = props;

  const previewHtml = useMemo(() => {
    const isLight = theme === "Light";
    const bg = isLight ? "#e1e1e1" : "#05070c";
    const cardBg = isLight ? "#ffffff" : "#0d111b";
    const sideCardBg = isLight ? "#f4f4f4" : "#0f1522";
    const border = isLight ? "1px solid rgba(0,0,0,0.08)" : "1px solid rgba(255,255,255,0.08)";
    const accent = accentColor || "#18a64a";
    const neutral = isLight ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.08)";
    const placeholder = (h: number, w = "100%", mb = 10) =>
      `<div style="width:${w};height:${h}px;border-radius:10px;background:${neutral};border:${border};margin-bottom:${mb}px;"></div>`;

    const logoHtml = showLogo
      ? `<div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;">
            <div style="width:46px;height:46px;border-radius:14px;background:${neutral};border:${border};"></div>
            <div style="flex:1;height:18px;border-radius:6px;background:${neutral};"></div>
         </div>`
      : "";
    const bannerHtml = showBanner
      ? `<div style="width:100%;height:140px;border-radius:14px;background:${neutral};border:${border};margin-bottom:18px;"></div>`
      : "";

    const requiredBlocks = [
      requiredPhone && placeholder(34),
      requiredAddress && placeholder(34),
      requiredBirthdate && placeholder(34),
      requiredDocument && placeholder(34),
    ]
      .filter(Boolean)
      .join("");

    const countdownHtml = `<div style="height:36px;border-radius:8px;background:${counterBgColor};color:${counterTextColor};border:${border};margin-top:12px;"></div>`;

    return `
      <html>
        <head>
          <style>
            body { margin:0; padding:0; background:${bg}; font-family: Inter, system-ui, -apple-system, sans-serif; color:#cbd5e1; }
            .top { height:64px; background:${accent}; display:flex; align-items:center; justify-content:center; color:#fff; font-weight:700; }
            .progress { height:56px; background:#d1d5db; }
            .wrap { padding:28px; display:flex; gap:20px; }
            .main { flex:2; display:flex; flex-direction:column; gap:18px; }
            .side { flex:1; display:flex; flex-direction:column; gap:16px; }
            .card { background:${cardBg}; border:${border}; border-radius:16px; padding:18px; }
            .side-card { background:${sideCardBg}; border:${border}; border-radius:16px; padding:16px; }
            .row { display:flex; gap:12px; }
            .btn { height:46px; border-radius:10px; background:${accent}; border:none; }
          </style>
        </head>
        <body>
          ${countdownEnabled ? `<div class="top"></div>` : ""}
          ${countdownEnabled ? `<div class="progress"></div>` : ""}
          <div class="wrap">
            <div class="main">
              <div class="card">
                ${logoHtml}
                ${bannerHtml}
                ${placeholder(26, "20%", 12)}
                ${placeholder(16, "100%", 12)}
                <div class="row">
                  ${placeholder(34, "55%", 0)}
                  ${placeholder(34, "45%", 0)}
                </div>
                <div class="row" style="margin-top:10px;">
                  ${placeholder(34, "45%", 0)}
                  ${placeholder(34, "55%", 0)}
                </div>
                ${placeholder(34)}
                ${requiredBlocks}
                <div class="row" style="margin-top:12px; gap:10px;">
                  ${placeholder(34, "32%", 0)}
                  ${placeholder(34, "32%", 0)}
                  ${placeholder(34, "32%", 0)}
                </div>
                ${placeholder(34, "100%", 10)}
                ${placeholder(34, "48%", 10)}
                ${placeholder(34, "48%", 10)}
                <button class="btn"></button>
                ${countdownHtml}
              </div>
            </div>
            <div class="side">
              <div class="side-card">
                ${placeholder(32, "100%", 12)}
                ${placeholder(16, "70%", 10)}
                ${placeholder(12, "90%", 8)}
                ${placeholder(12, "80%", 8)}
                ${placeholder(12, "75%", 8)}
              </div>
              <div class="side-card">
                ${placeholder(26, "40%", 10)}
                ${placeholder(16, "90%", 8)}
                ${placeholder(16, "90%", 8)}
                ${placeholder(16, "90%", 8)}
              </div>
            </div>
          </div>
        </body>
      </html>
    `;
  }, [
    theme,
    showLogo,
    showBanner,
    requiredAddress,
    requiredPhone,
    requiredBirthdate,
    requiredDocument,
    countdownEnabled,
    accentColor,
    counterBgColor,
    counterTextColor,
  ]);

  return (
    <iframe
      title="Preview checkout"
      srcDoc={previewHtml}
      className="h-[560px] w-full max-w-[760px] rounded-[12px] border border-foreground/10 bg-card/70 shadow-[0_20px_50px_rgba(0,0,0,0.35)]"
    />
  );
}
