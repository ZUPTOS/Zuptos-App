'use client';

import { useMemo } from "react";

export type CheckoutPreviewProps = {
  theme: "Light" | "Dark" | "light" | "dark";
  showLogo: boolean;
  showBanner: boolean;
  logoSrc?: string;
  bannerSrc?: string;
  logoPosition?: "left" | "center" | "right";
  showTestimonials?: boolean;
  showOrderBumps?: boolean;
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
    logoSrc,
    bannerSrc,
    logoPosition = "left",
    showTestimonials = false,
    showOrderBumps = false,
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
    const isLight = (theme || "dark").toLowerCase() === "light";
    const bg = isLight ? "#e1e1e1" : "#05070c";
    const cardBg = isLight ? "#ffffff" : "#0d111b";
    const sideCardBg = isLight ? "#f4f4f4" : "#0f1522";
    const border = isLight ? "1px solid rgba(0,0,0,0.08)" : "1px solid rgba(255,255,255,0.08)";
    const accent = accentColor || "#18a64a";
    const neutral = isLight ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.08)";
    const placeholder = (h: number, w = "100%", mb = 10) =>
      `<div style="width:${w};height:${h}px;border-radius:10px;background:${neutral};border:${border};margin-bottom:${mb}px;"></div>`;

    const logoAlignment =
      logoPosition === "center" ? "center" : logoPosition === "right" ? "flex-end" : "flex-start";
    const logoInlineHtml = showLogo
      ? `<div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;justify-content:${logoAlignment};">
            ${
              logoSrc
                ? `<img src="${logoSrc}" style="width:46px;height:46px;border-radius:14px;object-fit:cover;border:${border};" />`
                : `<div style="width:46px;height:46px;border-radius:14px;background:${neutral};border:${border};"></div>`
            }
            <div style="flex:1;max-width:60%;height:18px;border-radius:6px;background:${neutral};${
              logoAlignment !== "flex-start" ? "margin-left:8px;" : ""
            }"></div>
         </div>`
      : "";
    const bannerAlignStyle =
      logoPosition === "center"
        ? "left:50%;transform:translate(-50%, 50%);"
        : logoPosition === "right"
        ? "right:18px;transform:translate(0, 50%);"
        : "left:18px;transform:translate(0, 50%);";
    const bannerHtml = showBanner
      ? `<div style="position:relative;margin-bottom:${showLogo ? "30px" : "18px"};">
            ${
              bannerSrc
            ? `<img src="${bannerSrc}" style="width:100%;height:70px;border-radius:14px;object-fit:cover;border:${border};" />`
            : `<div style="width:100%;height:70px;border-radius:14px;background:${neutral};border:${border};"></div>`
            }
            ${
              showLogo
                ? `<div style="position:absolute;bottom:0;${bannerAlignStyle}width:52px;height:52px;border-radius:50%;background:${cardBg};border:${border};display:flex;align-items:center;justify-content:center;box-shadow:0 8px 18px rgba(0,0,0,0.35);">
                      ${
                        logoSrc
                          ? `<img src="${logoSrc}" style="width:48px;height:48px;border-radius:50%;object-fit:cover;" />`
                          : `<div style="width:48px;height:48px;border-radius:50%;background:${neutral};"></div>`
                      }
                   </div>`
                : ""
            }
         </div>`
      : "";

    const requiredBlocks = [
      requiredPhone && placeholder(34),
      requiredAddress && placeholder(34),
      requiredBirthdate && placeholder(34),
      requiredDocument && placeholder(34),
    ]
      .filter(Boolean)
      .join("");

    const producerHtml = `
      <div class="card">
        <div class="row">
          <div class="icon"></div>
          <div style="flex:1;">
            ${placeholder(12, "60%", 6)}
            ${placeholder(10, "40%", 0)}
          </div>
        </div>
        ${placeholder(10, "85%", 8)}
        ${placeholder(10, "55%", 0)}
      </div>
    `;

    const productHtml = `
      <div class="card">
        <div class="row">
          <div class="thumb"></div>
          <div style="flex:1;">
            ${placeholder(12, "70%", 6)}
            ${placeholder(10, "45%", 0)}
          </div>
        </div>
      </div>
    `;

    const paymentHtml = `
      <div class="card">
        ${placeholder(12, "40%", 12)}
        <div class="row">
          <div class="pill"></div>
          <div class="pill"></div>
          <div class="pill"></div>
        </div>
        <div class="row" style="margin-top:12px;">
          ${placeholder(30, "50%", 0)}
          ${placeholder(30, "50%", 0)}
        </div>
        <div style="margin-top:10px;">${requiredBlocks}</div>
        ${placeholder(32, "100%", 0)}
      </div>
    `;

    const testimonialItem = `
      <div class="row">
        <div class="avatar"></div>
        <div style="flex:1;">
          ${placeholder(10, "55%", 6)}
          ${placeholder(10, "40%", 0)}
        </div>
      </div>
      ${placeholder(10, "100%", 0)}
    `;

    const benefitItem = `
      <div class="row">
        <div class="icon"></div>
        <div style="flex:1;">
          ${placeholder(10, "70%", 6)}
          ${placeholder(8, "90%", 0)}
        </div>
      </div>
    `;
    const benefitsHtml = `
      <div class="card">
        <div class="stack">
          ${benefitItem}
          ${benefitItem}
          ${benefitItem}
          ${benefitItem}
        </div>
      </div>
    `;

    const emptyRightHtml = `
      <div class="card muted">
        ${placeholder(12, "45%", 12)}
        ${placeholder(10, "85%", 8)}
        ${placeholder(10, "65%", 0)}
      </div>
    `;

    const testimonialsHtml = showTestimonials
      ? `
        <div class="card">
          ${placeholder(12, "40%", 12)}
          <div class="stack">
            ${testimonialItem}
            ${testimonialItem}
          </div>
        </div>
      `
      : emptyRightHtml;

    const rightColumnHtml = `
      <div class="stack">
        ${benefitsHtml}
        ${testimonialsHtml}
      </div>
    `;

    const orderBumpsHtml = showOrderBumps
      ? `
        <div class="card">
          ${placeholder(12, "35%", 12)}
          <div class="stack">
            <div class="row">
              <div class="checkbox"></div>
              <div style="flex:1;">
                ${placeholder(10, "60%", 6)}
                ${placeholder(10, "45%", 0)}
              </div>
            </div>
            <div class="row">
              <div class="checkbox"></div>
              <div style="flex:1;">
                ${placeholder(10, "60%", 6)}
                ${placeholder(10, "45%", 0)}
              </div>
            </div>
          </div>
        </div>
      `
      : emptyRightHtml;

    return `
      <html>
        <head>
          <style>
            body { margin:0; padding:0; background:${bg}; font-family: Inter, system-ui, -apple-system, sans-serif; color:#cbd5e1; }
            .top { height:64px; background:${accent}; display:flex; align-items:center; justify-content:center; color:#fff; font-weight:700; }
            .progress { height:56px; background:#d1d5db; }
            .wrap { padding:24px; }
            .content { display:flex; flex-direction:column; gap:16px; }
            .grid { display:grid; grid-template-columns: 1.25fr 0.75fr; gap:16px; }
            .card { background:${cardBg}; border:${border}; border-radius:16px; padding:18px; }
            .row { display:flex; gap:12px; }
            .stack { display:flex; flex-direction:column; gap:12px; }
            .btn { height:46px; border-radius:10px; background:${accent}; border:none; }
            .span-2 { grid-column: span 2; }
            .icon { width:38px; height:38px; border-radius:12px; background:${neutral}; border:${border}; }
            .thumb { width:54px; height:54px; border-radius:12px; background:${neutral}; border:${border}; }
            .pill { width:68px; height:26px; border-radius:8px; background:${neutral}; border:${border}; }
            .avatar { width:38px; height:38px; border-radius:50%; background:${neutral}; border:${border}; }
            .checkbox { width:20px; height:20px; border-radius:6px; background:${neutral}; border:${border}; }
            .muted { opacity:0.65; }
          </style>
        </head>
        <body>
          ${countdownEnabled ? `<div class="top"></div>` : ""}
          ${countdownEnabled ? `<div class="progress"></div>` : ""}
          <div class="wrap">
            <div class="content">
              ${showBanner ? bannerHtml : logoInlineHtml}
              ${showBanner ? "" : bannerHtml}
              <div class="grid">
                ${producerHtml}
                ${productHtml}
                ${paymentHtml}
                ${rightColumnHtml}
                ${orderBumpsHtml}
                ${emptyRightHtml}
              </div>
              <button class="btn"></button>
            </div>
          </div>
        </body>
      </html>
    `;
  }, [
    theme,
    showLogo,
    showBanner,
    logoSrc,
    bannerSrc,
    logoPosition,
    showTestimonials,
    showOrderBumps,
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
