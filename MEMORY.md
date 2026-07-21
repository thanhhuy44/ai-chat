# Feature Checklist

## AI Chat

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 1 | **Database schema** | ✅ Done | `conversation` + `message` tables with enums (`message_role`, `message_status`), relations, foreign keys |
| 2 | **Drizzle ORM integration** | ✅ Done | Schema in `src/db/schema.ts`, client in `src/db/index.ts`, migrations via Drizzle Kit |
| 3 | **Authentication (Better Auth)** | ✅ Done | Email/password auth, sessions, protected routes, tRPC `protectedProcedure` |
| 4 | **Conversation CRUD** | ✅ Done | Create conversation, list with cursor pagination (`getAll`), update title, get messages |
| 5 | **Send user message** | ✅ Done | `messages.send` mutation — inserts user message, creates AI placeholder with `status: 'streaming'` |
| 6 | **Cancel generation** | ✅ Done | `messages.cancelGeneration` mutation — aborts in-flight generation via `AbortController` |
| 7 | **Retry failed message** | ✅ Done | `messages.retryMessage` mutation — resets failed message to `streaming` for re-subscription |
| 8 | **Regenerate AI response** | ✅ Done | `messages.regenerate` mutation — resets completed message to `streaming` for re-subscription |
| 9 | **SSE streaming** | ✅ Done | `messages.streamMessage` subscription — async generator yielding `connected` / `streaming` / `completed` / `error` events |
| 10 | **OpenAI integration** | ✅ Done | `src/lib/ai.ts` — configured with env vars (`OPENAI_API_KEY`, `OPENAI_BASE_URL`, `OPENAI_MODEL`) |
| 11 | **System prompt** | ✅ Done | `src/constants/system_promt.ts` — ChatGPT-style system prompt with personal context instructions |
| 12 | **Thought tag filtering** | ✅ Done | `createChunkProcessor` strips `<thought>...</thought>` tags from AI output before storing |
| 13 | **Chat container** | ✅ Done | `ChatContainer` in `src/features/chat/components/container.tsx` — orchestrates messages query, streaming, send/regenerate, auto-scroll |
| 14 | **New chat page** | ✅ Done | `NewChatPage` in `src/features/chat/index.tsx` — standalone form with react-hook-form, navigates to conversation on submit |
| 15 | **Chat input** | ✅ Done | `ChatInput` in `src/features/chat/components/input.tsx` — textarea + send/stop button, Enter to submit, Shift+Enter for newline |
| 16 | **Message list** | ✅ Done | `MessageList` in `src/features/chat/components/message-list.tsx` — renders user messages as plain text, AI messages as Markdown via `AiMessage` |
| 17 | **AI message Markdown rendering** | ✅ Done | `AiMessage` component using Streamdown — headings, paragraphs, lists, tables, links, inline/fenced code, blockquotes |
| 18 | **Code syntax highlighting** | ✅ Done | Streamdown's built-in `CodeBlock` with Shiki — copy button, line numbers, language detection |
| 19 | **Streaming cursor indicator** | ✅ Done | Animated pulsing dot after streaming content, animated bouncing dots for thinking state |
| 20 | **Auto-scroll to bottom** | ✅ Done | `useAutoScroll` hook — scrolls when new content arrives if user is near bottom (≤120px offset) |
| 21 | **Client subscription (useStream)** | ✅ Done | `useStream` hook — subscribes to `streamMessage`, updates query cache incrementally on completion, handles errors |
| 22 | **Resume unfinished generation** | ✅ Done | `ChatContainer` checks for messages with `status: 'streaming'` on mount and re-subscribes |
| 23 | **Conversation sidebar** | ✅ Done | Sidebar lists conversations, supports navigation, powered by TanStack Router |
| 24 | **AI message actions** | ✅ Done | `AiMessageActions` in `src/features/chat/components/actions.tsx` — regenerate + copy buttons with shadcn Tooltip |
| 25 | **Stop generation button** | ✅ Done | Pause icon replaces send button during streaming, calls `cancelGeneration` mutation |
| 26 | **Error handling** | ✅ Done | tRPC `TRPCError` with `UNAUTHORIZED`, `NOT_FOUND` codes; failed messages shown with retry button |
| 27 | **Route guards** | ✅ Done | `_auth/` layout protects authenticated routes; `_public/` layout for sign-in/sign-up |
| 28 | **Environment validation** | ✅ Done | `src/env.ts` with `@t3-oss/env-core` — validates all required env vars at startup |

---

## Next Up (suggested)

| Priority | Feature | Effort | Why |
|----------|---------|--------|-----|
| P0 | **Delete conversation** 🗑️ | ✅ Done | `conversations.delete` mutation + sidebar DropdownMenu with AlertDialog confirmation |
| P0 | **Rename conversation** ✏️ | ✅ Done | `conversations.update` mutation + sidebar DropdownMenu with Dialog inline edit |
| P1 | **Model selector** 🤖 | ✅ Done | Per-conversation model dropdown in chat input; stores `model` on `conversation` table as `model_name` enum; selects system prompt per model from `constants/prompts.ts` |
| P1 | **Dark/light mode toggle** 🌓 | Small | Toggle button in sidebar footer or nav-user dropdown; persist preference |
| P1 | **Loading skeleton** | Small | Replace plain "Loading..." text with skeleton placeholders for messages and sidebar |
| P2 | **Type-safe thought rendering** 💭 | Medium | Render `<thought>` content in a collapsible expandable block instead of stripping it |
| P2 | **Edit user message** ✏️ | Medium | Allow editing a sent message to re-trigger AI response |
| P2 | **Conversation search/filter** 🔍 | Medium | Filter sidebar conversations by title |
| P3 | **Token usage tracking** 📊 | Medium | Track prompt + completion tokens per message, display in UI |
| P3 | **Share conversation** 🔗 | Large | Generate a read-only share link |

---
*Last updated: 2026-07-16*
