const React = globalThis.React;

const ADDON_ID = "wealthfolio-memo-addon";
const ROUTE = "/addon/memo";
const SECRET_KEY = "memos.v1";
const LOCAL_STORAGE_KEY = "wealthfolio:memo-addon:memos.v1";

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

function h(type, props, ...children) {
  return React.createElement(type, props, ...children);
}

function createMemo() {
  const now = new Date().toISOString();
  return {
    id: `memo_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    title: "Untitled memo",
    content: "",
    createdAt: now,
    updatedAt: now
  };
}

function formatDate(value) {
  if (!value) return "";
  try {
    return new Intl.DateTimeFormat(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }).format(new Date(value));
  } catch (_error) {
    return value;
  }
}

function getPreview(memo) {
  const firstLine = (memo.content || "").split("\n").find((line) => line.trim());
  return firstLine?.trim() || "No content yet";
}

function normalizeTitle(value) {
  const title = value.replace(/\s+/g, " ").trim();
  return title || "Untitled memo";
}

function displayTitle(memo) {
  return normalizeTitle(memo?.title || "");
}

async function loadMemos(ctx) {
  try {
    const raw = await ctx?.api?.secrets?.get?.(SECRET_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (error) {
    ctx?.api?.logger?.warn?.(`Memo addon: failed to read secrets storage: ${String(error)}`);
  }

  try {
    const raw = window.localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (_error) {
    void 0;
  }

  return [];
}

async function saveMemos(ctx, memos) {
  const raw = JSON.stringify(memos);
  window.localStorage.setItem(LOCAL_STORAGE_KEY, raw);
  if (!ctx?.api?.secrets?.set) {
    return "local";
  }
  try {
    await ctx.api.secrets.set(SECRET_KEY, raw);
    return "synced";
  } catch (error) {
    ctx?.api?.logger?.warn?.(`Memo addon: saved locally, but secrets storage failed: ${String(error)}`);
    return "local";
  }
}

function MemoIcon({ className = "h-5 w-5" } = {}) {
  return h(
    "svg",
    {
      className,
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      "aria-hidden": "true"
    },
    h("path", { d: "M15 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" }),
    h("path", { d: "M14 3v5h5" }),
    h("path", { d: "M8 13h8" }),
    h("path", { d: "M8 17h5" })
  );
}

function MenuIcon({ className = "h-4 w-4" } = {}) {
  return h(
    "svg",
    {
      className,
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      "aria-hidden": "true"
    },
    h("path", { d: "M4 6h16" }),
    h("path", { d: "M4 12h16" }),
    h("path", { d: "M4 18h16" })
  );
}

function XIcon({ className = "h-4 w-4" } = {}) {
  return h(
    "svg",
    {
      className,
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      "aria-hidden": "true"
    },
    h("path", { d: "M18 6 6 18" }),
    h("path", { d: "m6 6 12 12" })
  );
}

function PlusIcon({ className = "h-4 w-4" } = {}) {
  return h(
    "svg",
    {
      className,
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      "aria-hidden": "true"
    },
    h("path", { d: "M5 12h14" }),
    h("path", { d: "M12 5v14" })
  );
}

function TrashIcon({ className = "h-4 w-4" } = {}) {
  return h(
    "svg",
    {
      className,
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      "aria-hidden": "true"
    },
    h("path", { d: "M3 6h18" }),
    h("path", { d: "M8 6V4h8v2" }),
    h("path", { d: "M19 6l-1 14H6L5 6" }),
    h("path", { d: "M10 11v6" }),
    h("path", { d: "M14 11v6" })
  );
}

function SearchIcon({ className = "h-4 w-4" } = {}) {
  return h(
    "svg",
    {
      className,
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      "aria-hidden": "true"
    },
    h("circle", { cx: "11", cy: "11", r: "8" }),
    h("path", { d: "m21 21-4.3-4.3" })
  );
}

function CopyIcon({ className = "h-4 w-4" } = {}) {
  return h(
    "svg",
    {
      className,
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      "aria-hidden": "true"
    },
    h("rect", { x: "9", y: "9", width: "13", height: "13", rx: "2", ry: "2" }),
    h("path", { d: "M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" })
  );
}

function CheckIcon({ className = "h-4 w-4" } = {}) {
  return h(
    "svg",
    {
      className,
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      "aria-hidden": "true"
    },
    h("path", { d: "M20 6 9 17l-5-5" })
  );
}

function AlertIcon({ className = "h-4 w-4" } = {}) {
  return h(
    "svg",
    {
      className,
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      "aria-hidden": "true"
    },
    h("circle", { cx: "12", cy: "12", r: "10" }),
    h("path", { d: "M12 8v4" }),
    h("path", { d: "M12 16h.01" })
  );
}

function countWords(value) {
  const trimmed = value.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).filter(Boolean).length;
}

async function copyTextToClipboard(value) {
  if (navigator?.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  textarea.style.top = "0";
  document.body.appendChild(textarea);
  textarea.select();
  try {
    document.execCommand("copy");
  } finally {
    document.body.removeChild(textarea);
  }
}

function StatusPill({ saveState, loaded }) {
  const config =
    saveState === "saving"
      ? { label: "Saving", className: "border-border text-muted-foreground", icon: null }
      : saveState === "error"
        ? { label: "Save failed", className: "border-destructive/30 bg-destructive/10 text-destructive", icon: h(AlertIcon, { className: "h-3.5 w-3.5" }) }
        : saveState === "local"
          ? { label: "Saved locally", className: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300", icon: h(CheckIcon, { className: "h-3.5 w-3.5" }) }
          : loaded
            ? { label: "Saved", className: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300", icon: h(CheckIcon, { className: "h-3.5 w-3.5" }) }
            : { label: "Loading", className: "border-border text-muted-foreground", icon: null };

  return h(
    "span",
    {
      className: cx(
        "inline-flex h-7 items-center gap-1.5 rounded-full border px-2.5 text-xs font-medium",
        config.className
      )
    },
    config.icon,
    config.label
  );
}

function EmptyState({ onCreate }) {
  return h(
    "div",
    { className: "flex h-full min-h-[420px] flex-col items-center justify-center px-6 text-center" },
    h("div", { className: "bg-muted mb-4 flex h-14 w-14 items-center justify-center rounded-full border" }, h(MemoIcon, { className: "text-muted-foreground h-7 w-7" })),
    h("h2", { className: "text-xl font-semibold tracking-tight" }, "No memos yet"),
    h("p", { className: "text-muted-foreground mt-2 max-w-sm text-sm leading-6" }, "Create a private note for investment ideas, account reminders, or review checklists."),
    h(
      "button",
      {
        type: "button",
        onClick: onCreate,
        className: "bg-primary text-primary-foreground hover:bg-primary/90 mt-5 inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm font-medium shadow-sm transition-colors"
      },
      h(PlusIcon),
      "New memo"
    )
  );
}

function MemoPage({ ctx }) {
  const [memos, setMemos] = React.useState([]);
  const [selectedId, setSelectedId] = React.useState(null);
  const [query, setQuery] = React.useState("");
  const [loaded, setLoaded] = React.useState(false);
  const [saveState, setSaveState] = React.useState("idle");
  const [copyState, setCopyState] = React.useState("idle");
  const [isMobile, setIsMobile] = React.useState(() => window.innerWidth < 768);
  const [sidebarOpen, setSidebarOpen] = React.useState(() => window.innerWidth >= 768);

  React.useEffect(() => {
    let active = true;
    loadMemos(ctx)
      .then((items) => {
        if (!active) return;
        const normalized = items
          .filter((item) => item && item.id)
          .map((item) => ({
            id: String(item.id),
            title: String(item.title || ""),
            content: String(item.content || ""),
            createdAt: item.createdAt || new Date().toISOString(),
            updatedAt: item.updatedAt || item.createdAt || new Date().toISOString()
          }))
          .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        setMemos(normalized);
        setSelectedId(normalized[0]?.id || null);
        setLoaded(true);
      })
      .catch((error) => {
        ctx?.api?.logger?.error?.(`Memo addon: failed to load memos: ${String(error)}`);
        if (active) setLoaded(true);
      });
    return () => {
      active = false;
    };
  }, []);

  React.useEffect(() => {
    const handleResize = () => {
      const nextIsMobile = window.innerWidth < 768;
      setIsMobile(nextIsMobile);
      setSidebarOpen((current) => (nextIsMobile ? current : true));
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  React.useEffect(() => {
    if (!loaded) return;
    setSaveState("saving");
    const timer = window.setTimeout(() => {
      saveMemos(ctx, memos)
        .then((result) => setSaveState(result === "local" ? "local" : "saved"))
        .catch((error) => {
          ctx?.api?.logger?.error?.(`Memo addon: failed to save memos: ${String(error)}`);
          setSaveState("error");
        });
    }, 350);
    return () => window.clearTimeout(timer);
  }, [memos, loaded]);

  const selectedMemo = React.useMemo(
    () => memos.find((memo) => memo.id === selectedId) || null,
    [memos, selectedId]
  );

  const filteredMemos = React.useMemo(() => {
    const needle = query.trim().toLowerCase();
    const sorted = [...memos].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    if (!needle) return sorted;
    return sorted.filter((memo) => {
      return memo.title.toLowerCase().includes(needle) || memo.content.toLowerCase().includes(needle);
    });
  }, [memos, query]);

  const createNewMemo = React.useCallback(() => {
    const memo = createMemo();
    setMemos((current) => [memo, ...current]);
    setSelectedId(memo.id);
    if (isMobile) setSidebarOpen(false);
  }, [isMobile]);

  const updateSelected = React.useCallback(
    (patch) => {
      if (!selectedMemo) return;
      const updatedAt = new Date().toISOString();
      setMemos((current) =>
        current.map((memo) =>
          memo.id === selectedMemo.id
            ? {
                ...memo,
                ...patch,
                updatedAt
              }
            : memo
        )
      );
    },
    [selectedMemo]
  );

  const deleteSelected = React.useCallback(() => {
    if (!selectedMemo) return;
    const confirmed = window.confirm(`Delete "${displayTitle(selectedMemo)}"?`);
    if (!confirmed) return;
    setMemos((current) => {
      const next = current.filter((memo) => memo.id !== selectedMemo.id);
      setSelectedId(next[0]?.id || null);
      return next;
    });
  }, [selectedMemo]);

  const copySelected = React.useCallback(() => {
    if (!selectedMemo) return;
    const text = [displayTitle(selectedMemo), selectedMemo.content || ""].filter(Boolean).join("\n\n");
    copyTextToClipboard(text)
      .then(() => {
        setCopyState("copied");
        window.setTimeout(() => setCopyState("idle"), 1200);
      })
      .catch((error) => {
        ctx?.api?.logger?.error?.(`Memo addon: failed to copy memo: ${String(error)}`);
        setCopyState("error");
        window.setTimeout(() => setCopyState("idle"), 1600);
      });
  }, [ctx, selectedMemo]);

  const selectedWords = selectedMemo ? countWords(selectedMemo.content) : 0;
  const mobileViewportHeight = window.CSS?.supports?.("height", "100dvh") ? "100dvh" : "100vh";

  const rootStyle = {
    display: isMobile ? "block" : "grid",
    gridTemplateColumns: isMobile ? "1fr" : "300px minmax(0, 1fr)",
    height: isMobile ? mobileViewportHeight : "calc(100vh - 1rem)",
    minHeight: isMobile ? "0" : "640px",
    position: "relative",
    width: "100%"
  };

  const closeOverlay =
    isMobile && sidebarOpen
      ? h("button", {
          type: "button",
          onClick: () => setSidebarOpen(false),
          className: "absolute inset-0 bg-black/30",
          style: {
            border: 0,
            cursor: "default",
            height: "100%",
            left: 0,
            padding: 0,
            position: "absolute",
            top: 0,
            width: "100%",
            zIndex: 20
          },
          title: "Close memos",
          "aria-label": "Close memos"
        })
      : null;

  const sidebar = h(
    "aside",
    {
      className: "flex flex-col border-r bg-muted/20",
      style: {
        background: "hsl(var(--background))",
        boxShadow: isMobile && sidebarOpen ? "0 24px 80px rgba(0, 0, 0, 0.28)" : "none",
        height: "100%",
        minHeight: 0,
        position: isMobile ? "absolute" : "relative",
        transform: isMobile && !sidebarOpen ? "translateX(-104%)" : "translateX(0)",
        transition: "transform 180ms ease",
        width: isMobile ? "min(86vw, 320px)" : "300px",
        zIndex: 30
      }
    },
    h(
      "div",
      { className: "shrink-0 border-b bg-background/80 px-3 py-3" },
      h(
        "div",
        { className: "mb-3 flex items-center justify-between gap-2" },
        h(
          "div",
          { className: "flex min-w-0 items-center gap-2" },
          h("div", { className: "flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground" }, h(MemoIcon, { className: "h-4 w-4" })),
          h("div", { className: "truncate text-sm font-semibold" }, "Memos")
        ),
        h(
          "div",
          { className: "flex items-center gap-1" },
          h(
            "button",
            {
              type: "button",
              onClick: createNewMemo,
              className: "inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
              title: "New memo",
              "aria-label": "New memo"
            },
            h(PlusIcon)
          ),
          isMobile
            ? h(
                "button",
                {
                  type: "button",
                  onClick: () => setSidebarOpen(false),
                  className: "inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                  title: "Close memos",
                  "aria-label": "Close memos"
                },
                h(XIcon)
              )
            : null
        )
      ),
      h(
        "div",
        { className: "relative" },
        h(SearchIcon, { className: "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" }),
        h("input", {
          value: query,
          onChange: (event) => setQuery(event.target.value),
          placeholder: "Search",
          className: "h-9 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
        })
      )
    ),
    h(
      "div",
      { className: "min-h-0 flex-1 overflow-y-auto px-2 py-2" },
      !loaded
        ? h("div", { className: "px-3 py-4 text-sm text-muted-foreground" }, "Loading memos...")
        : filteredMemos.length === 0
          ? h("div", { className: "px-3 py-4 text-sm text-muted-foreground" }, query ? "No matching memos." : "No memos yet.")
          : filteredMemos.map((memo) =>
              h(
                "button",
                {
                  key: memo.id,
                  type: "button",
                  onClick: () => {
                    setSelectedId(memo.id);
                    if (isMobile) setSidebarOpen(false);
                  },
                  className: cx(
                    "mb-1 w-full rounded-md px-3 py-2.5 text-left transition-colors",
                    memo.id === selectedId ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                  )
                },
                h("div", { className: "truncate text-sm font-medium" }, displayTitle(memo)),
                h("div", { className: "mt-1 line-clamp-2 text-xs leading-5" }, getPreview(memo)),
                h("div", { className: "mt-2 text-xs text-muted-foreground" }, formatDate(memo.updatedAt))
              )
            )
    )
  );

  const editor = selectedMemo
    ? h(
        "div",
        {
          className: "relative flex flex-col",
          style: {
            height: "100%",
            minHeight: 0
          }
        },
        isMobile
          ? h(
              "button",
              {
                type: "button",
                onClick: () => setSidebarOpen(true),
                className: "absolute left-3 top-3 z-10 inline-flex h-8 w-8 items-center justify-center rounded-md border bg-background text-muted-foreground shadow-sm transition-colors hover:bg-muted hover:text-foreground",
                title: "Open memos",
                "aria-label": "Open memos"
              },
              h(MenuIcon)
            )
          : null,
        h(
          "div",
          {
            className: "absolute z-10 flex items-center gap-2",
            style: {
              right: isMobile ? "12px" : "24px",
              top: isMobile ? "12px" : "16px"
            }
          },
          h(StatusPill, { saveState, loaded }),
          h(
            "button",
            {
              type: "button",
              onClick: deleteSelected,
              className: "inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive",
              title: "Delete memo",
              "aria-label": "Delete memo"
            },
            h(TrashIcon)
          ),
          h(
            "button",
            {
              type: "button",
              onClick: copySelected,
              className: cx(
                "inline-flex h-8 items-center justify-center rounded-md px-2 text-xs transition-colors hover:bg-muted hover:text-foreground",
                copyState === "copied"
                  ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                  : copyState === "error"
                    ? "bg-destructive/10 text-destructive"
                    : "text-muted-foreground"
              ),
              title: "Copy memo",
              "aria-label": "Copy memo"
            },
            copyState === "copied" ? "Copied" : copyState === "error" ? "Failed" : h(CopyIcon)
          )
        ),
        h(
          "div",
          {
            className: "flex w-full flex-col",
            style: {
              boxSizing: "border-box",
              height: "100%",
              minHeight: 0,
              padding: isMobile ? "70px 18px 56px 18px" : "88px 72px 92px 72px"
            }
          },
          h("input", {
            value: selectedMemo.title,
            onChange: (event) => updateSelected({ title: event.target.value }),
            placeholder: "Untitled memo",
            className: "w-full bg-transparent text-3xl font-semibold leading-tight tracking-normal outline-none placeholder:text-muted-foreground md:text-4xl",
            style: {
              fontSize: isMobile ? "28px" : undefined,
              margin: "0 auto",
              maxWidth: "980px"
            }
          }),
          h("textarea", {
            value: selectedMemo.content,
            onChange: (event) => updateSelected({ content: event.target.value }),
            placeholder: "Write notes, thesis updates, review reminders, or account tasks...",
            className: "mt-5 resize-none bg-transparent text-base leading-8 outline-none placeholder:text-muted-foreground md:text-lg",
            style: {
              boxSizing: "border-box",
              flex: "1 1 auto",
              height: "100%",
              marginLeft: "auto",
              marginRight: "auto",
              maxWidth: "980px",
              minHeight: isMobile ? `calc(${mobileViewportHeight} - 220px)` : "520px",
              width: "100%"
            }
          }),
          h(
            "div",
            {
              className: "mt-4 flex items-center gap-3 text-xs text-muted-foreground",
              style: {
                marginLeft: "auto",
                marginRight: "auto",
                maxWidth: "980px",
                width: "100%"
              }
            },
            h("span", null, `${selectedWords} words`),
            h("span", null, `Updated ${formatDate(selectedMemo.updatedAt)}`)
          )
        )
      )
    : h(EmptyState, { onCreate: createNewMemo });

  const main = h(
    "main",
    {
      className: "relative overflow-hidden bg-background",
      style: {
        height: "100%",
        minHeight: 0
      }
    },
    editor
  );

  return h("div", { className: "overflow-hidden bg-background text-foreground", style: rootStyle }, closeOverlay, sidebar, main);
}

export default function enable(ctx) {
  if (!React) {
    ctx?.api?.logger?.error?.("Memo addon: React global is unavailable");
    return;
  }

  const sidebarItem = ctx.sidebar.addItem({
    id: ADDON_ID,
    label: "Memo",
    icon: h(MemoIcon, { className: "h-5 w-5" }),
    route: ROUTE,
    order: 70
  });

  let removed = false;
  const removeSidebarItem = () => {
    if (removed) return;
    removed = true;
    try {
      sidebarItem.remove();
    } catch (error) {
      ctx?.api?.logger?.error?.(`Memo addon: failed to remove sidebar item: ${String(error)}`);
    }
  };

  const Wrapper = () => h(MemoPage, { ctx });
  ctx.router.add({
    path: ROUTE,
    component: React.lazy(() => Promise.resolve({ default: Wrapper }))
  });

  ctx.onDisable(removeSidebarItem);

  ctx?.api?.logger?.info?.("Memo addon enabled");

  return {
    disable() {
      removeSidebarItem();
      ctx?.api?.logger?.info?.("Memo addon disabled");
    }
  };
}
