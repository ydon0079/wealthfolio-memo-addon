# Wealthfolio Memo Add-on

A Wealthfolio-style memo workspace for private investment notes.

## Features

- Adds a `Memo` entry to Wealthfolio's add-on navigation.
- Left memo selector with search and new-note action.
- Clean two-pane editor with a focused writing canvas, autosave status, delete action, and copy action.
- Mobile layout with a toggleable memo drawer so the editor keeps the full screen.
- Persists notes through Wealthfolio add-on scoped secrets, with browser `localStorage` as fallback.

## Install

Package the add-on as a ZIP with `manifest.json`, `dist/addon.js`, and `README.md` at the ZIP root:

```bash
zip -r wealthfolio-memo-addon-0.3.3.zip manifest.json dist README.md
```

Install the ZIP from Wealthfolio's Add-ons settings page, then enable `Memo`.

## Storage

The add-on stores notes as JSON under its own scoped Wealthfolio secret key. If that API is unavailable, it falls back to browser local storage.

## Limitations

- This is an add-on UI, not a native Wealthfolio core page.
- There is no rich-text formatting in the first version; the editor is plain text.
