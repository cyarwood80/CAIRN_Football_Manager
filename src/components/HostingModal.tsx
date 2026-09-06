// src/components/HostingModal.tsx
import React from "react";
import { X, Globe, Terminal, Server, Check, Copy } from "lucide-react";

interface HostingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HostingModal: React.FC<HostingModalProps> = ({ isOpen, onClose }) => {
  const [copiedCmd, setCopiedCmd] = React.useState<string | null>(null);

  if (!isOpen) return null;

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(id);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(3, 7, 18, 0.82)",
        backdropFilter: "blur(14px)",
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
      onClick={onClose}
    >
      <div
        className="glass-panel"
        style={{
          width: "100%",
          maxWidth: "680px",
          maxHeight: "90vh",
          overflowY: "auto",
          padding: "28px",
          background: "rgba(11, 15, 25, 0.95)",
          border: "1px solid rgba(0, 242, 254, 0.3)",
          boxShadow: "0 25px 60px rgba(0,0,0,0.8), 0 0 30px rgba(0,242,254,0.15)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Globe size={24} color="var(--accent-cyan)" />
            <h2 style={{ fontSize: "1.35rem", fontWeight: "800", color: "#fff" }}>
              Hosting Guide: Play with Friends Online
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer" }}
          >
            <X size={20} />
          </button>
        </div>

        <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", lineHeight: "1.5", marginBottom: "24px" }}>
          By default, local servers run on <code style={{ color: "var(--accent-cyan)", fontFamily: "var(--font-mono)" }}>localhost</code>.
          Here is how to share this game with friends anywhere in the world:
        </p>

        {/* Method 1: Instant Tunnel */}
        <div
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "12px",
            padding: "18px",
            marginBottom: "20px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
            <Terminal size={18} color="var(--accent-cyan)" />
            <h3 style={{ fontSize: "1rem", fontWeight: "700", color: "#fff" }}>
              Method 1: Instant Zero-Setup Tunnel (Recommended for Testing)
            </h3>
          </div>
          <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", marginBottom: "12px" }}>
            Run this command in a new terminal window inside the project folder. It launches a free, secure Cloudflare tunnel and generates a public HTTPS link:
          </p>

          <div
            style={{
              background: "#030712",
              padding: "10px 14px",
              borderRadius: "8px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontFamily: "var(--font-mono)",
              fontSize: "0.85rem",
              color: "var(--accent-cyan)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <span>npm run share</span>
            <button
              onClick={() => copyText("npm run share", "share")}
              style={{ background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer" }}
            >
              {copiedCmd === "share" ? <Check size={14} color="var(--accent-green)" /> : <Copy size={14} />}
            </button>
          </div>

          <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "8px" }}>
            Send the generated URL to your friends. No cloud account or credit card needed!
          </div>
        </div>

        {/* Method 2: 24/7 Cloud Deployment */}
        <div
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "12px",
            padding: "18px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
            <Server size={18} color="var(--accent-gold)" />
            <h3 style={{ fontSize: "1rem", fontWeight: "700", color: "#fff" }}>
              Method 2: Permanent 24/7 Cloud Host (Railway / Render / Docker)
            </h3>
          </div>
          <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", marginBottom: "12px" }}>
            To keep your cup online 24/7 on your own permanent web address (e.g. <code style={{ color: "var(--accent-gold)" }}>https://agentic-cup.up.railway.app</code>):
          </p>

          <ol style={{ paddingLeft: "18px", fontSize: "0.82rem", color: "var(--text-secondary)", display: "flex", flexDirection: "column", gap: "8px" }}>
            <li>
              Push this folder to a <strong>GitHub repository</strong>.
            </li>
            <li>
              Go to <a href="https://railway.app" target="_blank" rel="noreferrer" style={{ color: "var(--accent-cyan)" }}>Railway.app</a> or <a href="https://render.com" target="_blank" rel="noreferrer" style={{ color: "var(--accent-cyan)" }}>Render.com</a>.
            </li>
            <li>
              Select your repo. It will automatically detect the included <code style={{ fontFamily: "var(--font-mono)" }}>Dockerfile</code> and deploy it in 2 minutes!
            </li>
            <li>
              Click <strong>"Generate Domain"</strong> to get your live public web address to share.
            </li>
          </ol>
        </div>

        <div style={{ marginTop: "24px", display: "flex", justifyContent: "flex-end" }}>
          <button className="btn btn-primary" onClick={onClose}>
            Got it, Let's Play!
          </button>
        </div>
      </div>
    </div>
  );
};
