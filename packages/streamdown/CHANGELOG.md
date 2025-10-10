# streamdown

## 1.4.0

### Minor Changes

- 6c6f507: migrate from harden-react-markdown to rehype-harden

### Patch Changes

- d0444a3: Add support for isAnimating
- 7a7464f: Correctly passes through remark rehype options into react-markdown. Previously this was ignored
- c68ebd6: Support incomplete URL parsing for links
- 0bfca42: 1.4 fixes and cleanup
- 6c0672b: Fix footnotes parsing
- 239e41d: fix: Block-level Markdown escapes <details> containers when paragraphs/blank lines are present
- 7cd5048: Add support for remarkMathOptions and remarkGfmOptions props
- f5d6cd6: Remove options props, make plugins fully customizable
- 699622f: Allow base64 images
- 38ad1ed: Fix node="[object Object]" HTML attribute bug. Fixed AST node objects being passed as HTML attributes by explicitly filtering out the node prop from component props before spreading to HTML elements.
- 21a7031: Fix themed backgrounds for code blocks
- 04f6f3a: Extract images from paragraph tags
- 3c780b4: Fit footnotes rendering
- 20ca02d: fixed email addresses being rendered as blocked link

## 1.3.0

### Minor Changes

- 73b17a4: Add controls prop to control copy/download button visibility.
- 64b5afa: feat: memoize components to prevent child re-renders
- d2edc90: feat: add custom Mermaid configuration support

### Patch Changes

- f34c039: fix: <br> in markdown tables from gpt-oss seem encoded or printed to output
- 11b347e: `fix: fallback to plain text when unsupported language is passed to Shiki, preventing runtime errors`
- 266fa2b: Fix word-internal underscores being incorrectly treated as incomplete markdown

  Previously, underscores used as word separators (e.g., `hello_world`, `snake_case`) were incorrectly identified as incomplete italic markdown, causing an extra underscore to be appended. This fix:

  - Detects when underscores are between word characters and treats them as literals
  - Preserves the streaming markdown completion for genuine incomplete italics (e.g., `_italic text`)
  - Correctly handles trailing newlines when completing italic formatting

  Fixes the issue where `hello_world` would become `hello_world_` when `parseIncompleteMarkdown` was enabled.

- 0ebf67d: misc 1.3 fixes and cleanup
- d29281e: Fix the background color of `TableDropDownMenu` from `bg-white` to `bg-background`
- 333df85: Update moduleResolution in tsconfig.json to bundler
- d583b1f: import `Lexer` only for possible tree-shaking
- 20330ba: add table text/html copy so that it can be recognized as table format in applications like Excel
- 7ae9881: fix: long link text overflows (#139)

## 1.2.0

### Minor Changes

- fa7733c: 1.2 cleanup

### Patch Changes

- bc3f423: handle lists with emphasis character blocks
- 3fab433: feat: add table markdown copy and csv/markdown download options
- c3a2eaa: misc fixes and improvements
- 435a2c6: feat: add download functionality to code blocks
- a4a10fc: feat: add image download functionality with hover controls

## 1.1.10

### Patch Changes

- 4459b14: apply whitespace-nowrap to th and match table colors with CodeBlock
- 426c897: fix: parseIncompleteMarkdown Emphasis Character Block Issue

## 1.1.9

### Patch Changes

- 5a50f22: bump deps
- 23d8efe: prevent copy event occurs too frequently
- 4737c99: fix: long list items break to a new line

## 1.1.8

### Patch Changes

- 76b68bf: add more code block data attributes
- faba69f: Support multiple simultaneous code blocks with different languages
- bda3134: add rtl unit tests
- f45ea6d: fix: links invisible while streaming

## 1.1.7

### Patch Changes

- e7f0402: Redesign CodeBlock for improved UX
- 6e0f722: use javascript regex engine for shiki
- 6751cbb: fix katex post-processing

## 1.1.6

### Patch Changes

- e01669b: add test app, fix code block incomplete parsing
- 69fb1e0: fix single dollar sign text rendering as math

## 1.1.5

### Patch Changes

- 593e49e: fix multiple renders of the same mermaid diagram
- bf8c798: update props in readme

## 1.1.4

### Patch Changes

- 5fbad80: fix asterisk list termination
- 13898aa: Add data-streamdown attributes to components
- 390bbc7: temporary fix for error color in rehype katex
- 5f4ed3d: chore: remove package-lock.json
- 9b5b56d: enable release-based web deploys

## 1.1.2

### Patch Changes

- 045907f: fix: handleIncompleteSingleUnderscoreItalic is not accounting for the usage inside math equations
- dc9ab5f: fix unit tests, run on release and PR
- 01e5eb0: Add Publishing CI Pipeline
- f834892: fix: codeblock dark mode and background
