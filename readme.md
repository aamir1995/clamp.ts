![NPM release](https://github.com/aamir1995/clamp.ts/actions/workflows/release.yml/badge.svg)
![version on NPM](https://img.shields.io/npm/v/clamp.ts)
![total downloads](https://img.shields.io/npm/dt/clamp.ts)
![bundle size](https://img.shields.io/bundlephobia/minzip/clamp.ts)
![license](https://img.shields.io/github/license/aamir1995/clamp.ts)

# clamp.ts
TypeScript fork of [clamp.js](https://github.com/josephschmitt/Clamp.js) - all of the relevant unmerged PRs from the original repo are merged.

Clamps (ie. cuts off) an HTML element's content by adding ellipsis to it if the 
content inside is too long.

Install by running:
```
npm install clamp.ts
```

 Demo: https://stackblitz.com/edit/typescript-zi38tc?file=index.ts

## Sample Usage
The `clamp` method is the primary way of interacting with Clamp.ts, and it takes two
arguments. The first is the element which should be clamped, and the second is an
Object with options in JSON notation.
```
import { clamp } from  'clamp.ts';

const  paragraph = document.querySelector('#paragraph');

clamp(paragraph, { // options here, read below for more info });
```


## Options

| Property | Type | Default | Description |
|--|--|--|--|
| clamp | `number|string|‘auto’` | `2` | This controls where and when to clamp the text of an element. Submitting a number controls the number of lines that should be displayed. Second, you can submit a CSS value (in px or em) that controls the height of the element as a String. Finally, you can submit the word `'auto'` as a string. Auto will try to fill up the available space with the content and then automatically clamp once content no longer fits. This last option should only be set if a static  height is being set on the element elsewhere (such as through CSS) otherwise no  clamping will be done. |
| useNativeClamp | boolean | `true` | Enables or disables using the native `-webkit-line-clamp` in a supported browser (ie. Webkit). It defaults to true if you're using Webkit, but it can behave wonky sometimes so you can set it to false to use the JavaScript-based solution. |
| truncationChar | string | `…` | The character to insert at the end of the HTML element after truncation is performed. This defaults to an ellipsis (…). |
| truncationHTML | string || A string of HTML to insert before the truncation character. This is useful if you'd like to add a "Read more" link or some such thing at the end of your clamped node. |
| splitOnChars | Array | `['.', '-', '–', '—', ' ']` | Determines what characters to use to chunk an element into smaller pieces. you have an option to pass a list of characters it can use. For example, it you pass an array of `['.', ',', ' ']` then it will first remove sentences, then remove comma-phrases, and remove words, and finally remove individual characters to try and find the correct height. This will lead to increased performance and less looping when removing larger pieces of text (such as in paragraphs). The default is set to remove sentences (periods), hypens, en-dashes, em-dashes, and finally words  (spaces). Removing by character is always enabled as the last attempt no matter what is submitted in the array. |
| animate | Boolean | `false` | Silly little easter-egg that, when set to true, will animate removing individual characters from the end of the element until the content fits. Defaults to `false`. |
