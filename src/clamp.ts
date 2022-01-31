/*!
 * Clamp.js ported to TypeScript.
 *
 * Original author: Joseph Schmitt http://joe.sh under the WTFPL license
 *
 * Ported to TypeScript by Aamir Shah github.com/aamir1995
 */

/********************************************************
 *                                                       *
 *  INTERFACES                                           *
 *                                                       *
 *********************************************************/

export interface IClampOptions {
  clamp?: number | string | 'auto';
  useNativeClamp?: boolean;
  splitOnChars?: Array<string>;
  animate?: boolean;
  truncationChar?: string;
  truncationHTML?: string;
}

export interface IClampResponse {
  original: string;
  clamped: string;
}

/**
 * @description Returns the height of an element as an integer (max of scroll/offset/client).
 * Note: inline elements return 0 for scrollHeight and clientHeight.
 * @param elem 
 * @returns height in number'
 * @author github.com/danmana - copied from https://github.com/josephschmitt/Clamp.js/pull/18
 */
const getElemHeight = (elem: HTMLElement | Element): number => {
  return Math.max(elem.scrollHeight, (<HTMLElement>elem).offsetHeight, elem.clientHeight);
}

/********************************************************
 *                                                       *
 *  UTILITY FUNCTIONS                                    *
 *                                                       *
 *********************************************************/

/**
 * @description Return the current style for an element.
 * @param elem The element to compute.
 * @param prop The style property.
 * @returns CSS property values.
 */
const computeStyle = (elem: HTMLElement | Element, prop: string): string => {
  const win: Window = window;

  /**
   * @todo re-enable if needed
   */
  // if (!win.getComputedStyle) {
  //     win.getComputedStyle = (el: Element, pseudo) => {
  //         // this.el = el;
  //         return {
  //             getPropertyValue(prop) {
  //                 var re = /(\-([a-z]){1})/g;
  //                 if (prop == 'float')
  //                     prop = 'styleFloat';
  //                 if (re.test(prop)) {
  //                     prop = prop.replace(re, function () {
  //                         return arguments[2].toUpperCase();
  //                     });
  //                 }
  //                 return el.currentStyle && el.currentStyle[prop] ? el.currentStyle[prop] : null;
  //             }
  //         }
  //         // return get
  //     };
  // }
  return win.getComputedStyle(elem, null).getPropertyValue(prop);
};

/**
 * @description Returns the maximum number of lines of text that should be rendered based
 * on the current height of the element and the line-height of the text.
 * @param element any HTML element
 * @param height element's height
 * @returns max lines
 */
const getMaxLines = (element: HTMLElement | Element, height?: number): number => {
  const availHeight = height || getElemHeight(element),
    lineHeight = getLineHeight(element);
  return Math.max(Math.floor(availHeight / lineHeight), 0);
};

/**
 * @description Returns the maximum height a given element should have based on the line-
 * height of the text and the given clamp value.
 *
 * @param element any HTML element
 * @param clmp number of clamps
 * @returns max height
 */
const getMaxHeight = (element: HTMLElement | Element, clmp: number): number => {
  const lineHeight = getLineHeight(element);
  return lineHeight * clmp;
};

/**
 * @description Returns the line-height of an element as an integer.
 * @param elem any HTML Element
 * @returns line-height of the element
 */
const getLineHeight = (elem: HTMLElement | Element): number => {
  const lh = computeStyle(elem, 'line-height');
  if (lh == 'normal') {
    // Normal line heights vary from browser to browser. The spec recommends
    // a value between 1.0 and 1.2 of the font size. Using 1.1 to split the diff.
    return parseInt(computeStyle(elem, 'font-size')) * 1.2;
  }
  return parseInt(lh);
};

/**
 * @description Gets an element's last child. That may be another node or a node's contents.
 * @param elem any HTML Element
 * @param options config option
 * @returns Element's last child.
 */
const getLastChild = (elem: HTMLElement | Element, options: IClampOptions): HTMLElement => {
  //Current element has children, need to go deeper and get last child as a text node
  if (
    (elem.lastChild as any).children &&
    (elem.lastChild as any).children.length > 0
  ) {
    return getLastChild(
      Array.prototype.slice.call(elem.children).pop(),
      options
    );
  }
  //This is the absolute last child, a text node, but something's wrong with it. Remove it and keep trying
  else if (
    !elem.lastChild ||
    !elem.lastChild.nodeValue ||
    elem.lastChild.nodeValue === '' ||
    elem.lastChild.nodeValue == options.truncationChar
  ) {
    elem.lastChild.parentNode.removeChild(elem.lastChild);
    return getLastChild(elem, options);
  }
  //This is the last child we want, return it
  else {
    return elem.lastChild as HTMLElement;
  }
};

/**
 * @description Applies ellipsis to the provided string.
 * @param elem any HTML element
 * @param str string that needs to be truncated
 * @param options config option
 */
const applyEllipsis = (
  elem: HTMLElement | Element,
  str: string,
  options: IClampOptions
): void => {
  elem.nodeValue = str + options.truncationChar;
};

/**
 * @description Removes one character at a time from the text until its width or
 * height is beneath the passed-in max param.
 * @param target
 * @param element
 * @param truncationHTMLContainer
 * @param maxHeight
 * @param options
 * @param config
 * @returns innerHTML
 */
const truncate = (
  target: HTMLElement | Element,
  element: HTMLElement | Element,
  truncationHTMLContainer: HTMLElement,
  maxHeight: number,
  options: IClampOptions,
  config: any = {
    splitOnChars: options.splitOnChars.slice(0),
    splitChar: options.splitOnChars.slice(0)[0],
    chunks: null,
    lastChunk: null,
  }
): string => {
  if (!maxHeight) {
    return element.innerHTML;
  }

  let nodeValue = target.nodeValue.replace(options.truncationChar, '');

  let { splitOnChars, splitChar, chunks, lastChunk } = config;

  //Grab the next chunks
  if (!chunks) {
    //If there are more characters to try, grab the next one
    if (splitOnChars.length > 0) {
      splitChar = splitOnChars.shift();
    }
    //No characters to chunk by. Go character-by-character
    else {
      splitChar = '';
    }
    chunks = nodeValue.split(splitChar);
  }
  //If there are chunks left to remove, remove the last one and see if
  // the nodeValue fits.
  if (chunks.length > 1) {
    lastChunk = chunks.pop();
    applyEllipsis(target, chunks.join(splitChar), options);
  }
  //No more chunks can be removed using this character
  else {
    chunks = null;
  }
  // Insert the custom HTML before the truncation character
  if (truncationHTMLContainer) {
    target.nodeValue = target.nodeValue.replace(options.truncationChar, '');
    element.innerHTML =
      target.nodeValue +
      ' ' +
      truncationHTMLContainer.innerHTML +
      options.truncationChar;
  }
  // Search produced valid chunks
  if (chunks) {
    // It fits
    if (getElemHeight(element) <= maxHeight) {
      // There's still more characters to try splitting on, not quite done yet
      if (splitOnChars.length >= 0 && splitChar !== '') {
        applyEllipsis(
          target,
          chunks.join(splitChar) + splitChar + lastChunk,
          options
        );
        chunks = null;
      }
      // Finished!
      else {
        return element.innerHTML;
      }
    }
  }
  // No valid chunks produced
  else {
    // No valid chunks even when splitting by letter, time to move
    // on to the next node
    if (splitChar === '') {
      applyEllipsis(target, '', options);
      target = getLastChild(element, options);

      // reset vars
      splitOnChars = options.splitOnChars.slice(0);
      splitChar = splitOnChars[0];
      chunks = null;
      lastChunk = null;
    }
  }
  // If you get here it means still too big, let's keep truncating
  if (options.animate) {
    setTimeout(
      () => {
        truncate(target, element, truncationHTMLContainer, maxHeight, options, {
          splitOnChars,
          splitChar,
          chunks,
          lastChunk,
        });
      },
      options.animate === true ? 10 : options.animate
    );
  } else {
    return truncate(
      target,
      element,
      truncationHTMLContainer,
      maxHeight,
      options,
      { splitOnChars, splitChar, chunks, lastChunk }
    );
  }

  // just to suppress TS warning...
  return element.innerHTML;
};


/********************************************************
 *                                                       *
 *  EXPORTED METHOD                                      *
 *                                                       *
 *********************************************************/

/**
 * @description Clamps a text node.
 * @param element. Element containing the text node to clamp.
 * @param options. Options to pass to the clamper.
 */
export function clamp(element: Element | HTMLElement, options?: IClampOptions): IClampResponse {
  /**
   * merge default options with provided options (if any).
   */
  options = {
    clamp: 2,
    useNativeClamp: true,
    splitOnChars: ['.', '-', '–', '—', ' '],
    animate: false,
    truncationChar: '…',
    ...options,
  };

  const sty = (<HTMLElement>element).style;
  const original = element.innerHTML;
  const supportsNativeClamp =
    typeof (<HTMLElement>element).style.webkitLineClamp != 'undefined';
  let clampValue = options.clamp;
  const isCSSValue =
    (<string>clampValue).indexOf &&
    ((<string>clampValue).indexOf('px') > -1 ||
      (<string>clampValue).indexOf('em') > -1);
  let truncationHTMLContainer;
  if (options.truncationHTML) {
    truncationHTMLContainer = document.createElement('span');
    truncationHTMLContainer.innerHTML = options.truncationHTML;
  }

  // CONSTRUCTOR ________________________________________________________________
  if (clampValue == 'auto') {
    clampValue = getMaxLines(element);
  } else if (isCSSValue) {
    clampValue = getMaxLines(element, parseInt(clampValue as string));
  }
  let clamped: string;
  if (supportsNativeClamp && options.useNativeClamp) {
    sty.overflow = 'hidden';
    sty.textOverflow = 'ellipsis';
    sty.webkitBoxOrient = 'vertical';
    sty.display = '-webkit-box';
    sty.webkitLineClamp = clampValue as string;
    if (isCSSValue) {
      sty.height = <string>options.clamp;
    }
  } else {
    const height = getMaxHeight(element, clampValue as number);
    if (height <= getElemHeight(element)) {
      clamped = truncate(
        getLastChild(element, options),
        element,
        truncationHTMLContainer,
        height,
        options
      );
    }
  }
  return {
    original,
    clamped,
  };
}
