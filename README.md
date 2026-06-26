# Context Picker for Framer

![Context Picker for Framer Banner](https://offload-assets.framercoder.com/8f8f69d5-5895-47be-8b54-a54389f0583a/d478f7cc-ff40-470a-96db-b7db10dfce32_Cotext%20Picker%20Hover%20Main.webp?width=1600&height=1200)

Context Picker is a small Framer plugin that copies the currently selected
canvas layer context to your clipboard.

It is built for workflows where you use an external AI agent to edit a Framer
project. Framer's internal agent already knows what you selected on the canvas,
but external agents usually only receive plain text from your prompt. This
plugin bridges that gap by turning your current Framer selection into a compact
JSON payload that an external agent can use to target the right node.

## What It Does

- Watches the current Framer canvas selection.
- Automatically copies the selected layer's node ID and name.
- Includes the surrounding Framer scope, such as a web page, design page, or
  component canvas.
- Includes the URL path only for real website pages.
- Includes replica metadata when Framer exposes it, so agents can understand
  variant or inherited component-layer selections.
- Keeps a short recent selection history that can be copied again.

## Why This Exists

When asking an external agent to make a Framer edit, prompts like this are often
ambiguous:

```text
Make this headline red.
```

The agent cannot see what "this" is. With Context Picker, you can select the
layer in Framer and paste something like:

```json
{
  "nodeId": "xKhQ7Zqi3Ep0YdBifg",
  "nodeName": "Headline",
  "scopeType": "ComponentNode",
  "scopeId": "naKOBz4Df",
  "scopeName": "FAQ",
  "urlPath": null
}
```

Then your prompt can be:

```text
Make this text red:
{...copied JSON...}
```

## Clipboard Payload

The copied JSON is intentionally flat and explicit.

### Common Fields

| Field            | Meaning                                                                           |
| ---------------- | --------------------------------------------------------------------------------- |
| `nodeId`         | The selected Framer layer/node ID.                                                |
| `nodeName`       | The selected layer/node name.                                                     |
| `scopeType`      | The Framer canvas root type: `WebPageNode`, `DesignPageNode`, or `ComponentNode`. |
| `scopeId`        | The ID of the current canvas scope.                                               |
| `scopeName`      | Human-readable scope name when available.                                         |
| `urlPath`        | Website route for `WebPageNode`; `null` for design pages and component canvases.  |
| `isReplica`      | Present when the selected node is a Framer replica.                               |
| `originalNodeId` | Present when Framer exposes the original node ID for a replica.                   |

### Web Page Example

```json
{
  "nodeId": "abc123",
  "nodeName": "Hero Title",
  "scopeType": "WebPageNode",
  "scopeId": "pageNodeId",
  "urlPath": "/"
}
```

### Design Page Example

```json
{
  "nodeId": "abc123",
  "nodeName": "Tweet Card",
  "scopeType": "DesignPageNode",
  "scopeId": "Uux2VISHp",
  "scopeName": "Tweets",
  "urlPath": null
}
```

### Component Canvas Example

```json
{
  "nodeId": "xKhQ7Zqi3Ep0YdBifg",
  "nodeName": "what is a token presale?",
  "scopeType": "ComponentNode",
  "scopeId": "naKOBz4Df",
  "scopeName": "FAQ",
  "urlPath": null,
  "isReplica": true,
  "originalNodeId": "Ep0YdBifg"
}
```

## Usage

1. Open the plugin in Framer.
2. Select any layer on the canvas or in the layer sidebar.
3. The plugin automatically copies the selection context as JSON.
4. Paste that JSON into your external agent prompt.
5. Use the recent selections list if you need to copy an earlier target again.

## Development

Install dependencies:

```bash
pnpm install
```

Run the plugin locally:

```bash
pnpm dev
```

Build for production:

```bash
pnpm build
```

Lint:

```bash
pnpm lint
```

Type check:

```bash
pnpm exec tsc --noEmit --skipLibCheck
```

The project currently uses `skipLibCheck` for type checking because the installed
`@framer/plugin` declaration files report errors under this TypeScript setup.

## Project Structure

```text
src/hooks/useContextPicker.ts  Selection, clipboard, history, and scope logic
src/hooks/useSelection.ts      Framer selection subscription
src/hooks/useCanvasRoot.ts     Framer canvas root subscription
src/lib/selection.ts           Clipboard JSON formatter
src/lib/clipboard.ts           Clipboard fallback handling
src/components/                Small plugin UI components
```
