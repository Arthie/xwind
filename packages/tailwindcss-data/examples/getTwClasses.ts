import corePlugins from "tailwindcss/lib/corePlugins";
import {
  tailwindData,
  createTwClassDictionary,
} from "@tailwindcssinjs/tailwindcss-data";

import config from "../../../tailwind.config.js";

const { utilitiesRoot, componentsRoot } = tailwindData(config, corePlugins);

const twClassDictionary = createTwClassDictionary(
  componentsRoot,
  utilitiesRoot
);

function getTwClasses() {
  const out = Object.keys(twClassDictionary);
  console.log(out);
  return out;
}

// OUTPUT CSS:
// [
//   'container',   'form-input',    'form-textarea', 'form-multiselect',
//   'form-select', 'form-checkbox', 'form-radio',    'prose',
//   'prose-sm',    'prose-lg',      'prose-xl',      'prose-2xl',
//   'space-y-0',   'space-x-0',     'space-y-1',     'space-x-1',
//   ... 4247 more items
// ]
getTwClasses();
