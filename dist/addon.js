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

function DotsIcon({ className = "h-4 w-4" } = {}) {
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
    h("circle", { cx: "12", cy: "12", r: "1" }),
    h("circle", { cx: "19", cy: "12", r: "1" }),
    h("circle", { cx: "5", cy: "12", r: "1" })
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
  }, []);

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

  const selectedWords = selectedMemo ? countWords(selectedMemo.content) : 0;

  return h(
    "div",
    { className: "grid h-[calc(100vh-1rem)] min-h-[640px] overflow-hidden bg-background text-foreground md:grid-cols-[300px_minmax(0,1fr)]" },
    h(
      "aside",
      { className: "flex min-h-0 flex-col border-b bg-muted/20 md:border-b-0 md:border-r" },
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
            )
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
                    onClick: () => setSelectedId(memo.id),
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
    ),
    h(
      "main",
      { className: "relative min-h-0 overflow-hidden bg-background" },
      !selectedMemo
        ? h(EmptyState, { onCreate: createNewMemo })
        : h(
            "div",
            { className: "relative flex h-full min-h-0 flex-col" },
            h(
              "div",
              { className: "absolute right-4 top-4 z-10 flex items-center gap-2 md:right-6" },
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
                  className: "inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                  title: "More",
                  "aria-label": "More"
                },
                h(DotsIcon)
              )
            ),
            h(
              "div",
              { className: "mx-auto flex h-full w-full max-w-3xl flex-col px-6 pb-24 pt-20 md:px-10 md:pt-24" },
              h("input", {
                value: selectedMemo.title,
                onChange: (event) => updateSelected({ title: event.target.value }),
                placeholder: "Untitled memo",
                className: "w-full bg-transparent text-3xl font-semibold leading-tight tracking-normal outline-none placeholder:text-muted-foreground md:text-4xl"
              }),
              h("textarea", {
                value: selectedMemo.content,
                onChange: (event) => updateSelected({ content: event.target.value }),
                placeholder: "Write notes, thesis updates, review reminders, or account tasks...",
                className: "mt-5 min-h-0 flex-1 resize-none bg-transparent text-base leading-8 outline-none placeholder:text-muted-foreground md:text-lg"
              }),
              h(
                "div",
                { className: "mt-4 flex items-center gap-3 text-xs text-muted-foreground" },
                h("span", null, `${selectedWords} words`),
                h("span", null, `Updated ${formatDate(selectedMemo.updatedAt)}`)
              )
            ),
            h(
              "div",
              { className: "absolute bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-lg border bg-muted/90 px-2 py-1.5 text-sm text-muted-foreground shadow-lg backdrop-blur" },
              h("button", { type: "button", className: "rounded px-2 py-1 font-medium hover:bg-background hover:text-foreground", title: "Heading" }, "H"),
              h("button", { type: "button", className: "rounded px-2 py-1 font-semibold hover:bg-background hover:text-foreground", title: "Bold" }, "B"),
              h("button", { type: "button", className: "rounded px-2 py-1 italic hover:bg-background hover:text-foreground", title: "Italic" }, "I"),
              h("span", { className: "mx-1 h-4 w-px bg-border" }),
              h("button", { type: "button", className: "rounded px-2 py-1 hover:bg-background hover:text-foreground", title: "Link" }, "Link"),
              h("button", { type: "button", className: "rounded px-2 py-1 hover:bg-background hover:text-foreground", title: "More" }, h(DotsIcon))
            )
          )
      )
  );
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
