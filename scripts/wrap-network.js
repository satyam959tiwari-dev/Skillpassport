const fs = require("fs");
const path = require("path");

const src = path.join(__dirname, "..", "src", "app.js");
const dest = path.join(__dirname, "..", "public", "network", "app.js");
let source = fs.readFileSync(src, "utf8");

source = source.replace(
  "const canvas=document.getElementById('network');",
  "const canvas=document.getElementById('network');\n  if (!canvas) return;",
);

const wrapped = `/**
 * Bootable hero network for the Next.js site.
 * Safe to call on remount. Original static renderer remains in src/app.js.
 */
window.__bootSkillNetwork = function __bootSkillNetwork() {
  if (typeof window.__spNetworkCleanup === "function") {
    try { window.__spNetworkCleanup(); } catch (e) {}
    window.__spNetworkCleanup = null;
  }
${source}
  window.__spNetworkCleanup = function () {
    try { stop(); } catch (e) {}
    try { window.removeEventListener("resize", resize); } catch (e) {}
    try { document.removeEventListener("visibilitychange", sync); } catch (e) {}
    try { window.removeEventListener("pagehide", stop); } catch (e) {}
  };
};
`;

fs.writeFileSync(dest, wrapped);
console.log("rewrote", dest, wrapped.length);
