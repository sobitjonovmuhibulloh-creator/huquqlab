import { ImageResponse } from "next/og";

export const alt = "HuquqLab — Huquqingni bil. Kelajagingni himoya qil.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: 80, background: "#0a1222", color: "#e6ebf3" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20, fontSize: 40, fontWeight: 800 }}>
          <div style={{ width: 64, height: 64, borderRadius: 18, background: "#26c3d9", display: "flex", alignItems: "center", justifyContent: "center", color: "#0a1222", fontSize: 40 }}>
            H
          </div>
          HuquqLab
        </div>
        <div style={{ marginTop: 48, fontSize: 76, fontWeight: 800, lineHeight: 1.1 }}>Huquqingni bil.</div>
        <div style={{ fontSize: 76, fontWeight: 800, lineHeight: 1.1, color: "#26c3d9" }}>Kelajagingni himoya qil.</div>
        <div style={{ marginTop: 40, fontSize: 30, color: "#a3b2ca" }}>Darslar · simulyatorlar · testlar — 7–11-sinf o‘quvchilari uchun</div>
      </div>
    ),
    size,
  );
}
