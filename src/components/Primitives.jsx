import { C, displayFont, bodyFont } from "../theme";

export function FieldLabel({ children }) {
  return (
    <label style={{ display: "block", fontSize: 12, fontWeight: 700, letterSpacing: 0.4, textTransform: "uppercase", color: C.inkSoft, marginBottom: 6 }}>
      {children}
    </label>
  );
}

export function TextInput(props) {
  return (
    <input
      {...props}
      style={{
        width: "100%",
        padding: "11px 13px",
        fontSize: 15,
        fontFamily: bodyFont,
        border: `1.5px solid ${C.line}`,
        borderRadius: 4,
        background: C.white,
        color: C.ink,
        outline: "none",
        ...props.style,
      }}
    />
  );
}

export function PrimaryButton({ children, style, ...rest }) {
  return (
    <button
      {...rest}
      style={{
        fontFamily: displayFont,
        fontSize: 14,
        fontWeight: 600,
        letterSpacing: 0.5,
        textTransform: "uppercase",
        padding: "11px 22px",
        borderRadius: 4,
        border: "none",
        background: C.maroon,
        color: C.chalk,
        cursor: "pointer",
        ...style,
      }}
    >
      {children}
    </button>
  );
}

export function OutlineButton({ children, small, style, ...rest }) {
  return (
    <button
      {...rest}
      style={{
        fontFamily: displayFont,
        fontSize: small ? 11.5 : 13.5,
        fontWeight: 600,
        letterSpacing: 0.4,
        textTransform: "uppercase",
        padding: small ? "6px 12px" : "9px 18px",
        borderRadius: 4,
        border: `1.5px solid ${C.maroon}`,
        background: "transparent",
        color: C.maroon,
        cursor: "pointer",
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      {children}
    </button>
  );
}

export function Card({ children, style }) {
  return (
    <div
      style={{
        background: C.white,
        border: `1px solid ${C.line}`,
        borderRadius: 4,
        padding: 18,
        marginBottom: 16,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function PageTitle({ children, subtitle }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <h1 style={{ fontFamily: displayFont, fontSize: 26, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, color: C.ink, margin: 0 }}>
        {children}
      </h1>
      {subtitle && <div style={{ fontSize: 13.5, color: C.inkSoft, marginTop: 4 }}>{subtitle}</div>}
    </div>
  );
}

export function Toast({ message }) {
  return (
    <div
      style={{
        position: "fixed",
        bottom: 24,
        left: "50%",
        transform: "translateX(-50%)",
        background: C.ink,
        color: C.chalk,
        padding: "12px 22px",
        borderRadius: 6,
        fontSize: 14,
        fontWeight: 600,
        boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
        zIndex: 1000,
        maxWidth: "90vw",
        textAlign: "center",
      }}
    >
      {message}
    </div>
  );
}
