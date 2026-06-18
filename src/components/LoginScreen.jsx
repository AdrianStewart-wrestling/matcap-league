import { useState } from "react";
import { C, displayFont, bodyFont } from "../theme";
import { TextInput, PrimaryButton } from "./Primitives";

export function LoginScreen({ managers, leagueName, onLogin }) {
  const [name, setName] = useState("");
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 20px",
        background: `radial-gradient(ellipse at top, ${C.maroonBright} 0%, ${C.maroonDeep} 65%)`,
      }}
    >
      <div style={{ width: "100%", maxWidth: 380 }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontFamily: displayFont, fontSize: 32, fontWeight: 700, color: C.chalk, letterSpacing: 0.5, textTransform: "uppercase" }}>
            {leagueName || "MatCap League"}
          </div>
          <div style={{ fontSize: 13.5, color: C.chalkDim, marginTop: 6 }}>
            NCAA wrestling fantasy league.
          </div>
        </div>

        <div style={{ background: C.chalk, borderRadius: 6, padding: 24 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.inkSoft, marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.4 }}>
            Enter your name
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onLogin(name);
            }}
          >
            <TextInput
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Jordan"
              autoFocus
              style={{ marginBottom: 12 }}
            />
            <PrimaryButton type="submit" style={{ width: "100%" }}>
              {managers.some((m) => m.name.toLowerCase() === name.trim().toLowerCase()) ? "Log in" : "Join the league"}
            </PrimaryButton>
          </form>

          {managers.length > 0 && (
            <div style={{ marginTop: 22 }}>
              <div style={{ fontSize: 11.5, fontWeight: 700, color: C.inkSoft, marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.4 }}>
                Returning managers
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                {managers.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => onLogin(m.name)}
                    style={{
                      fontFamily: bodyFont,
                      fontSize: 13,
                      padding: "7px 13px",
                      borderRadius: 16,
                      border: `1.5px solid ${C.line}`,
                      background: C.white,
                      color: C.ink,
                      cursor: "pointer",
                    }}
                  >
                    {m.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
