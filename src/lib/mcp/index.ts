import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listNotebooks from "./tools/list-notebooks";
import listNotes from "./tools/list-notes";
import getNote from "./tools/get-note";
import searchNotes from "./tools/search-notes";
import createNote from "./tools/create-note";
import updateNote from "./tools/update-note";
import createNotebook from "./tools/create-notebook";

// Read the direct Supabase project ref (never the .lovable.cloud proxy) for the
// OAuth issuer. Vite inlines VITE_SUPABASE_PROJECT_ID at build time, so this
// stays import-safe. The fallback keeps the issuer well-formed during the
// throwaway manifest-extract eval where no token will actually verify.
const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "notebook-archive-mcp",
  title: "Notebook Archive",
  version: "0.1.0",
  instructions:
    "Tools for the signed-in user's Notebook Archive workspace. Use `list_notebooks` and `list_notes` to browse, `search_notes` to find content, `get_note` to read a note's full markdown, and `create_note` / `update_note` / `create_notebook` to write. All actions are scoped to the authenticated user via row-level security.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [
    listNotebooks,
    listNotes,
    getNote,
    searchNotes,
    createNote,
    updateNote,
    createNotebook,
  ],
});
