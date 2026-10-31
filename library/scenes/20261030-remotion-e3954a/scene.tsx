import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig, spring } from "remotion";
import { theme, sec, Appear, Title } from "@kit";

export default function Scene() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const drawP = interpolate(frame, [sec(0.35), sec(2.0)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const pAread = interpolate(frame, [sec(2.11), sec(3.3)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const pAback = interpolate(frame, [sec(3.79), sec(5.0)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const pBread = interpolate(frame, [sec(6.57), sec(7.8)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const pBback = interpolate(frame, [sec(8.29), sec(9.4)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const pWrite = interpolate(frame, [sec(11.37), sec(12.6)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const pFinal = interpolate(frame, [sec(22.1), sec(23.6)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const liftA = interpolate(frame, [sec(2.11), sec(3.5)], [0, -28], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const enlarge = interpolate(frame, [sec(9.51), sec(10.8)], [1, 1.35], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const gap = interpolate(frame, [sec(17.19), sec(19.2)], [0, 130], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const popAF = frame - (sec(3.79) + 14);
  const popA = popAF < 0 ? 0 : spring({ frame: popAF, fps, config: { damping: 14 } });
  const popBF = frame - (sec(8.29) + 14);
  const popB = popBF < 0 ? 0 : spring({ frame: popBF, fps, config: { damping: 14 } });
  const lockF = frame - sec(20.63);
  const lockS = lockF < 0 ? 0 : spring({ frame: lockF, fps, config: { damping: 14 } });

  const isFlashWindow = frame >= sec(11.37) && frame < sec(17.19);
  const flashOn = isFlashWindow && frame % 10 < 5;
  const isShakeWindow = frame >= sec(15.17) && frame < sec(17.19);
  const shake = isShakeWindow ? Math.sin(frame * 0.9) * 14 : 0;
  const counterPulse = 1 + Math.sin(frame * 0.15) * 0.015;

  const showAread = frame >= sec(2.11) && frame < sec(3.79);
  const showAback = frame >= sec(3.79) && frame < sec(5.6);
  const showBread = frame >= sec(6.57) && frame < sec(8.29);
  const showBback = frame >= sec(8.29) && frame < sec(10.0);
  const showWrite = frame >= sec(11.37) && frame < sec(13.4);
  const showWait = frame >= sec(20.63) && frame < sec(22.1);
  const showFinal = frame >= sec(22.1);

  const counterVal = frame < sec(12.2) ? "1" : "0";
  const counterLocked = frame >= sec(20.63);

  const xAread = 780 * (1 - pAread) + 195 * pAread;
  const yAread = 600 * (1 - pAread) + 960 * pAread;
  const xAback = 195 * (1 - pAback) + 780 * pAback;
  const yAback = 960 * (1 - pAback) + 600 * pAback;
  const xBread = 780 * (1 - pBread) + 195 * pBread;
  const yBread = 860 * (1 - pBread) + 960 * pBread;
  const xBback = 195 * (1 - pBback) + 780 * pBback;
  const yBback = 960 * (1 - pBback) + 860 * pBback;
  const xWA = 780 * (1 - pWrite) + 195 * pWrite;
  const yWA = 600 * (1 - pWrite) + 960 * pWrite;
  const xWB = 780 * (1 - pWrite) + 195 * pWrite;
  const yWB = 860 * (1 - pWrite) + 960 * pWrite;
  const xFin = 430 * (1 - pFinal) + 195 * pFinal;
  const yFin = 860 * (1 - pFinal) + 960 * pFinal;

  const tlX0 = 80;
  const tlX1 = 1000;
  const tlY = 1190;
  const tlW = (tlX1 - tlX0) * drawP;
  const headPulse = 0.6 + Math.sin(frame * 0.3) * 0.4;

  const ticks = [0, 1, 2, 3, 4, 5, 6, 7, 8];

  return (
    <AbsoluteFill style={{ background: theme.bg }}>
      <Title text="How it breaks" at={0} size={92} y={230} />

      {/* SWIMLANES */}
      <Appear at={sec(0.35)} dy={30} style={{ position: "absolute", top: 470, left: 80, width: 920 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div
              style={{
                fontFamily: theme.font,
                fontWeight: 900,
                fontSize: 52,
                color: theme.accent,
                background: "rgba(0,229,255,0.12)",
                border: `3px solid ${theme.accent}`,
                borderRadius: 16,
                padding: "6px 22px",
              }}
            >
              USER A
            </div>
            <div style={{ fontFamily: theme.mono, fontSize: 34, color: theme.muted }}>READ / WRITE</div>
          </div>
          <div style={{ marginTop: 18, height: 10, borderRadius: 6, background: "rgba(0,229,255,0.22)", position: "relative" }}>
            <div
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                height: "100%",
                width: `${drawP * 100}%`,
                background: theme.accent,
                borderRadius: 6,
              }}
            />
          </div>
        </div>
      </Appear>

      <Appear at={sec(0.35)} dy={30} style={{ position: "absolute", top: 730, left: 80, width: 920 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div
              style={{
                fontFamily: theme.font,
                fontWeight: 900,
                fontSize: 52,
                color: theme.accent2,
                background: "rgba(255,45,149,0.12)",
                border: `3px solid ${theme.accent2}`,
                borderRadius: 16,
                padding: "6px 22px",
              }}
            >
              USER B
            </div>
            <div style={{ fontFamily: theme.mono, fontSize: 34, color: theme.muted }}>READ / WRITE</div>
          </div>
          <div style={{ marginTop: 18, height: 10, borderRadius: 6, background: "rgba(255,45,149,0.22)", position: "relative" }}>
            <div
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                height: "100%",
                width: `${drawP * 100}%`,
                background: theme.accent2,
                borderRadius: 6,
              }}
            />
          </div>
        </div>
      </Appear>

      {/* COUNTER BOX */}
      <Appear at={sec(0.35)} style={{ position: "absolute", top: 950, left: 80 }}>
        <div style={{ transform: `translateX(${shake}px) scale(${counterPulse})` }}>
          <div style={{ fontFamily: theme.mono, fontSize: 36, color: theme.muted, marginBottom: 8 }}>COUNTER</div>
          <div
            style={{
              width: 220,
              height: 170,
              borderRadius: 24,
              border: `7px solid ${flashOn ? theme.accent2 : "#FFFFFF"}`,
              background: flashOn ? theme.accent2 : "#101826",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transform: `translateY(${frame >= sec(2.11) && frame < sec(3.79) ? liftA : 0}px)`,
              boxShadow: flashOn ? `0 0 45px ${theme.accent2}` : "0 0 25px rgba(255,255,255,0.25)",
            }}
          >
            <div style={{ fontFamily: theme.font, fontWeight: 900, fontSize: 110, color: "#fff" }}>{counterVal}</div>
          </div>
          <div style={{ marginTop: 8, width: 220, height: 14, background: "rgba(255,255,255,0.25)", borderRadius: 7 }} />
          {frame >= sec(11.37) && (
            <div
              style={{
                marginTop: 10,
                fontFamily: theme.font,
                fontWeight: 900,
                fontSize: 44,
                color: flashOn ? theme.accent2 : theme.accent3,
              }}
            >
              {frame < sec(12.2) ? "BOTH WRITE 0" : "OVERSOLD!"}
            </div>
          )}
        </div>
      </Appear>

      {/* TIMELINE ARROW */}
      <div style={{ position: "absolute", top: tlY, left: tlX0, width: 920, height: 60 }}>
        <div style={{ position: "absolute", top: 0, left: 0, width: 920, height: 8, background: "rgba(255,255,255,0.18)", borderRadius: 5 }} />
        <div style={{ position: "absolute", top: 0, left: 0, width: tlW, height: 8, background: "#fff", borderRadius: 5 }} />
        {ticks.map((i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: i * 115,
              top: -10,
              width: 6,
              height: 28,
              background: i * 115 <= tlW ? "#fff" : "rgba(255,255,255,0.25)",
              borderRadius: 3,
            }}
          />
        ))}
        <div
          style={{
            position: "absolute",
            left: tlW - 6,
            top: -16,
            width: 0,
            height: 0,
            borderLeft: "26px solid #fff",
            borderTop: "20px solid transparent",
            borderBottom: "20px solid transparent",
            opacity: 0.5 + headPulse * 0.5,
          }}
        />
        <div style={{ position: "absolute", top: 30, left: 0, fontFamily: theme.mono, fontSize: 30, color: theme.muted }}>TIME {"->"} SERIAL ORDER</div>
      </div>

      {/* READ A */}
      {showAread && (
        <div style={{ position: "absolute", left: xAread, top: yAread }}>
          <div
            style={{
              fontFamily: theme.font,
              fontWeight: 900,
              fontSize: 46,
              color: "#001318",
              background: theme.accent,
              borderRadius: 40,
              padding: "10px 28px",
              boxShadow: `0 0 30px ${theme.accent}`,
            }}
          >
            READ
          </div>
        </div>
      )}
      {showAback && (
        <div style={{ position: "absolute", left: xAback, top: yAback }}>
          <div
            style={{
              fontFamily: theme.font,
              fontWeight: 900,
              fontSize: 52,
              color: "#001318",
              background: "#fff",
              border: `6px solid ${theme.accent}`,
              borderRadius: 50,
              width: 110,
              height: 110,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 0 30px ${theme.accent}`,
            }}
          >
            1
          </div>
        </div>
      )}

      {/* READ B */}
      {showBread && (
        <div style={{ position: "absolute", left: xBread, top: yBread }}>
          <div
            style={{
              fontFamily: theme.font,
              fontWeight: 900,
              fontSize: 46,
              color: "#1A0010",
              background: theme.accent2,
              borderRadius: 40,
              padding: "10px 28px",
              boxShadow: `0 0 30px ${theme.accent2}`,
            }}
          >
            READ
          </div>
        </div>
      )}
      {showBback && (
        <div style={{ position: "absolute", left: xBback, top: yBback }}>
          <div
            style={{
              fontFamily: theme.font,
              fontWeight: 900,
              fontSize: 52,
              color: "#1A0010",
              background: "#fff",
              border: `6px solid ${theme.accent2}`,
              borderRadius: 50,
              width: 110,
              height: 110,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 0 30px ${theme.accent2}`,
            }}
          >
            1
          </div>
        </div>
      )}

      {/* GREEN CHECKS */}
      {frame >= sec(3.79) + 10 && (
        <div style={{ position: "absolute", left: 830, top: 540, transform: `scale(${(popA * (frame >= sec(9.51) ? enlarge : 1)).toFixed(3)})` }}>
          <div
            style={{
              width: 110,
              height: 110,
              borderRadius: 60,
              background: theme.good,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 72,
              fontWeight: 900,
              color: "#04140A",
              boxShadow: `0 0 28px ${theme.good}`,
              border: "5px solid #fff",
            }}
          >
            ✓
          </div>
        </div>
      )}
      {frame >= sec(8.29) + 10 && (
        <div style={{ position: "absolute", left: 830, top: 800, transform: `scale(${(popB * (frame >= sec(9.51) ? enlarge : 1)).toFixed(3)})` }}>
          <div
            style={{
              width: 110,
              height: 110,
              borderRadius: 60,
              background: theme.good,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 72,
              fontWeight: 900,
              color: "#04140A",
              boxShadow: `0 0 28px ${theme.good}`,
              border: "5px solid #fff",
            }}
          >
            ✓
          </div>
        </div>
      )}
      {frame >= sec(9.51) && frame < sec(11.37) && (
        <div style={{ position: "absolute", top: 688, left: 0, width: 1080, textAlign: "center" }}>
          <div style={{ fontFamily: theme.font, fontWeight: 900, fontSize: 56, color: theme.good }}>BOTH PASS ✓✓</div>
        </div>
      )}

      {/* WRITE ARROWS */}
      {showWrite && (
        <>
          <div style={{ position: "absolute", left: xWA, top: yWA }}>
            <div style={{ fontFamily: theme.font, fontWeight: 900, fontSize: 44, background: theme.accent, color: "#001318", borderRadius: 36, padding: "10px 26px" }}>
              WRITE 0
            </div>
          </div>
          <div style={{ position: "absolute", left: xWB, top: yWB }}>
            <div style={{ fontFamily: theme.font, fontWeight: 900, fontSize: 44, background: theme.accent2, color: "#1A0010", borderRadius: 36, padding: "10px 26px" }}>
              WRITE 0
            </div>
          </div>
        </>
      )}

      {/* RECEIPT CARDS */}
      {(frame >= sec(15.17) || frame >= sec(15.5)) && (
        <div style={{ position: "absolute", top: 950, left: 360, display: "flex", gap: 18 }}>
          <Appear at={sec(15.17)} dy={-40} style={{ position: "relative" }}>
            <div style={{ width: 250, height: 200, background: "#fff", borderRadius: 22, padding: 16, transform: `translateX(${shake * 0.5}px)` }}>
              <div style={{ fontSize: 62, textAlign: "center" }}>⚡</div>
              <div style={{ fontFamily: theme.font, fontWeight: 900, fontSize: 44, color: "#111", textAlign: "center" }}>A $49</div>
              <div style={{ fontFamily: theme.mono, fontSize: 32, color: theme.accent3, background: "#111", borderRadius: 10, textAlign: "center", marginTop: 6 }}>
                CHARGED
              </div>
            </div>
          </Appear>
          <Appear at={sec(15.5)} dy={-40} style={{ position: "relative" }}>
            <div style={{ width: 250, height: 200, background: "#fff", borderRadius: 22, padding: 16, transform: `translateX(${-shake * 0.5}px)` }}>
              <div style={{ fontSize: 62, textAlign: "center" }}>⚡</div>
              <div style={{ fontFamily: theme.font, fontWeight: 900, fontSize: 44, color: "#111", textAlign: "center" }}>B $49</div>
              <div style={{ fontFamily: theme.mono, fontSize: 32, color: theme.accent3, background: "#111", borderRadius: 10, textAlign: "center", marginTop: 6 }}>
                CHARGED
              </div>
            </div>
          </Appear>
        </div>
      )}

      {/* CHECK vs ACT SPLIT */}
      {frame >= sec(17.19) && (
        <div style={{ position: "absolute", top: 1275, left: 0, width: 1080, display: "flex", justifyContent: "center", alignItems: "center" }}>
          <div
            style={{
              fontFamily: theme.font,
              fontWeight: 900,
              fontSize: 62,
              color: "#111",
              background: theme.accent3,
              borderRadius: 18,
              padding: "12px 30px",
              transform: `translateX(${-gap / 2}px)`,
            }}
          >
            CHECK
          </div>
          <div
            style={{
              fontFamily: theme.font,
              fontWeight: 900,
              fontSize: 62,
              color: frame >= sec(19.2) ? "#FF2D5E" : theme.muted,
              margin: "0 18px",
              transform: `scale(${1 + Math.sin(frame * 0.4) * 0.08})`,
            }}
          >
            ≠
          </div>
          <div
            style={{
              fontFamily: theme.font,
              fontWeight: 900,
              fontSize: 62,
              color: "#fff",
              border: "5px solid #fff",
              borderRadius: 18,
              padding: "8px 30px",
              transform: `translateX(${gap / 2}px)`,
            }}
          >
            ACT
          </div>
        </div>
      )}

      {/* LOCK + WAITING QUEUE */}
      {showWait && (
        <div style={{ position: "absolute", left: 380, top: 830 }}>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <div style={{ width: 44, height: 44, borderRadius: 24, background: theme.accent2, opacity: frame % 12 < 6 ? 1 : 0.3 }} />
            <div style={{ width: 44, height: 44, borderRadius: 24, background: theme.accent2, opacity: frame % 12 < 6 ? 0.3 : 1 }} />
            <div style={{ fontFamily: theme.font, fontWeight: 900, fontSize: 48, color: theme.accent2, marginLeft: 8 }}>WAIT</div>
          </div>
        </div>
      )}
      {showFinal && (
        <div style={{ position: "absolute", left: xFin, top: yFin }}>
          <div style={{ fontFamily: theme.font, fontWeight: 900, fontSize: 44, background: theme.accent2, color: "#fff", borderRadius: 36, padding: "10px 26px" }}>
            READ 0
          </div>
        </div>
      )}
      {counterLocked && (
        <div style={{ position: "absolute", top: 920, left: 60, transform: `scale(${Math.max(0.01, lockS).toFixed(3)})` }}>
          <div
            style={{
              width: 260,
              height: 230,
              borderRadius: 28,
              border: "8px solid #E8EEF6",
              background: "rgba(232,238,246,0.12)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 40px rgba(232,238,246,0.6)",
            }}
          >
            <div style={{ fontSize: 110, lineHeight: 1 }}>🔒</div>
            <div style={{ fontFamily: theme.font, fontWeight: 900, fontSize: 40, color: "#fff" }}>LOCKED</div>
          </div>
          <div style={{ textAlign: "center", marginTop: 8, fontFamily: theme.mono, fontSize: 34, color: theme.good }}>SERIALIZED ✓</div>
        </div>
      )}
    </AbsoluteFill>
  );
}