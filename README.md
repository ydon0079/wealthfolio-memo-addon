# Wealthfolio Memo Add-on

A Wealthfolio-style memo workspace for private investment notes.

## Features

- Adds a `Memo` entry to Wealthfolio's add-on navigation.
- Left note list with search and new-note action.
- Full-page editor with title, body, timestamps, autosave status, and delete action.
- Persists notes through Wealthfolio add-on scoped secrets, with browser `localStorage` as fallback.

## Install

Package the add-on as a ZIP with `manifest.json`, `dist/addon.js`, and `README.md` at the ZIP root:

```bash
zip -r wealthfolio-memo-addon-0.2.0.zip manifest.json dist README.md
```

Install the ZIP from Wealthfolio's Add-ons settings page, then enable `Memo`.

## Storage

The add-on stores notes as JSON under its own scoped Wealthfolio secret key. If that API is unavailable, it falls back to browser local storage.

## Limitations

- This is an add-on UI, not a native Wealthfolio core page.
- There is no rich-text formatting in the first version; the editor is plain text.
