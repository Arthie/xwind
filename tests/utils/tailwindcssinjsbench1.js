module.exports = {
  "initial load (just import)    ": {
    code: "\n          import tw from '@tailwindcssinjs/macro';\n          ",
    snapshot: true,
  },
  "cursor-text                   ": {
    code:
      "\n  import tw from '@tailwindcssinjs/macro';\n  const css = tw`cursor-text`;\n  ",
    snapshot: true,
  },
  "md:hover:cursor-text          ": {
    code:
      "\n  import tw from '@tailwindcssinjs/macro';\n  const css = tw`md:hover:cursor-text`;\n  ",
    snapshot: true,
  },
  "text-xs                       ": {
    code:
      "\n  import tw from '@tailwindcssinjs/macro';\n  const css = tw`text-xs`;\n  ",
    snapshot: true,
  },
  "md:hover:text-xs              ": {
    code:
      "\n  import tw from '@tailwindcssinjs/macro';\n  const css = tw`md:hover:text-xs`;\n  ",
    snapshot: true,
  },
  "text-sm                       ": {
    code:
      "\n  import tw from '@tailwindcssinjs/macro';\n  const css = tw`text-sm`;\n  ",
    snapshot: true,
  },
  "md:hover:text-sm              ": {
    code:
      "\n  import tw from '@tailwindcssinjs/macro';\n  const css = tw`md:hover:text-sm`;\n  ",
    snapshot: true,
  },
  "text-base                     ": {
    code:
      "\n  import tw from '@tailwindcssinjs/macro';\n  const css = tw`text-base`;\n  ",
    snapshot: true,
  },
  "md:hover:text-base            ": {
    code:
      "\n  import tw from '@tailwindcssinjs/macro';\n  const css = tw`md:hover:text-base`;\n  ",
    snapshot: true,
  },
  "text-lg                       ": {
    code:
      "\n  import tw from '@tailwindcssinjs/macro';\n  const css = tw`text-lg`;\n  ",
    snapshot: true,
  },
  "md:hover:text-lg              ": {
    code:
      "\n  import tw from '@tailwindcssinjs/macro';\n  const css = tw`md:hover:text-lg`;\n  ",
    snapshot: true,
  },
  "text-xl                       ": {
    code:
      "\n  import tw from '@tailwindcssinjs/macro';\n  const css = tw`text-xl`;\n  ",
    snapshot: true,
  },
  "md:hover:text-xl              ": {
    code:
      "\n  import tw from '@tailwindcssinjs/macro';\n  const css = tw`md:hover:text-xl`;\n  ",
    snapshot: true,
  },
  "text-2xl                      ": {
    code:
      "\n  import tw from '@tailwindcssinjs/macro';\n  const css = tw`text-2xl`;\n  ",
    snapshot: true,
  },
  "md:hover:text-2xl             ": {
    code:
      "\n  import tw from '@tailwindcssinjs/macro';\n  const css = tw`md:hover:text-2xl`;\n  ",
    snapshot: true,
  },
  "text-3xl                      ": {
    code:
      "\n  import tw from '@tailwindcssinjs/macro';\n  const css = tw`text-3xl`;\n  ",
    snapshot: true,
  },
  "multiple transforms 20 classes": {
    code:
      "\n          import tw from '@tailwindcssinjs/macro';\n          const css1 = tw`cursor-text md:hover:cursor-text text-xs md:hover:text-xs text-sm md:hover:text-sm text-base md:hover:text-base text-lg md:hover:text-lg text-xl md:hover:text-xl text-2xl md:hover:text-2xl text-3xl md:hover:text-3xl text-4xl md:hover:text-4xl text-5xl md:hover:text-5xl`;\n          const css2 = tw`md:hover:text-sm text-base md:hover:text-base text-lg md:hover:text-lg text-xl md:hover:text-xl text-2xl md:hover:text-2xl text-3xl md:hover:text-3xl text-4xl md:hover:text-4xl text-5xl md:hover:text-5xl text-6xl md:hover:text-6xl text-left md:hover:text-left text-center`;\n          const css3 = tw`text-xl md:hover:text-xl text-2xl md:hover:text-2xl text-3xl md:hover:text-3xl text-4xl md:hover:text-4xl text-5xl md:hover:text-5xl text-6xl md:hover:text-6xl text-left md:hover:text-left text-center md:hover:text-center text-right md:hover:text-right text-justify md:hover:text-justify`;\n          const css4 = tw`md:hover:text-3xl text-4xl md:hover:text-4xl text-5xl md:hover:text-5xl text-6xl md:hover:text-6xl text-left md:hover:text-left text-center md:hover:text-center text-right md:hover:text-right text-justify md:hover:text-justify text-transparent md:hover:text-transparent text-current md:hover:text-current text-black`;\n          const css5 = tw`text-6xl md:hover:text-6xl text-left md:hover:text-left text-center md:hover:text-center text-right md:hover:text-right text-justify md:hover:text-justify text-transparent md:hover:text-transparent text-current md:hover:text-current text-black md:hover:text-black text-white md:hover:text-white text-gray-100 md:hover:text-gray-100`;\n          const css6 = tw`md:hover:text-center text-right md:hover:text-right text-justify md:hover:text-justify text-transparent md:hover:text-transparent text-current md:hover:text-current text-black md:hover:text-black text-white md:hover:text-white text-gray-100 md:hover:text-gray-100 text-gray-200 md:hover:text-gray-200 text-gray-300 md:hover:text-gray-300 text-gray-400`;\n          const css7 = tw`text-transparent md:hover:text-transparent text-current md:hover:text-current text-black md:hover:text-black text-white md:hover:text-white text-gray-100 md:hover:text-gray-100 text-gray-200 md:hover:text-gray-200 text-gray-300 md:hover:text-gray-300 text-gray-400 md:hover:text-gray-400 text-gray-500 md:hover:text-gray-500 text-gray-600 md:hover:text-gray-600`;\n          const css8 = tw`md:hover:text-black text-white md:hover:text-white text-gray-100 md:hover:text-gray-100 text-gray-200 md:hover:text-gray-200 text-gray-300 md:hover:text-gray-300 text-gray-400 md:hover:text-gray-400 text-gray-500 md:hover:text-gray-500 text-gray-600 md:hover:text-gray-600 text-gray-700 md:hover:text-gray-700 text-gray-800 md:hover:text-gray-800 text-gray-900`;\n          const css9 = tw`text-gray-200 md:hover:text-gray-200 text-gray-300 md:hover:text-gray-300 text-gray-400 md:hover:text-gray-400 text-gray-500 md:hover:text-gray-500 text-gray-600 md:hover:text-gray-600 text-gray-700 md:hover:text-gray-700 text-gray-800 md:hover:text-gray-800 text-gray-900 md:hover:text-gray-900 text-red-100 md:hover:text-red-100 text-red-200 md:hover:text-red-200`;\n          ",
    snapshot: true,
  },
  "test 10 classes               ": {
    code:
      "\n          import tw from '@tailwindcssinjs/macro';\n          const css = tw`cursor-text md:hover:cursor-text text-xs md:hover:text-xs text-sm md:hover:text-sm text-base md:hover:text-base text-lg md:hover:text-lg`;\n          ",
    snapshot: true,
  },
  "test 20 classes               ": {
    code:
      "\n          import tw from '@tailwindcssinjs/macro';\n          const css = tw`cursor-text md:hover:cursor-text text-xs md:hover:text-xs text-sm md:hover:text-sm text-base md:hover:text-base text-lg md:hover:text-lg text-xl md:hover:text-xl text-2xl md:hover:text-2xl text-3xl md:hover:text-3xl text-4xl md:hover:text-4xl text-5xl md:hover:text-5xl`;\n          ",
    snapshot: true,
  },
  "test 40 classes               ": {
    code:
      "\n          import tw from '@tailwindcssinjs/macro';\n          const css = tw`cursor-text md:hover:cursor-text text-xs md:hover:text-xs text-sm md:hover:text-sm text-base md:hover:text-base text-lg md:hover:text-lg text-xl md:hover:text-xl text-2xl md:hover:text-2xl text-3xl md:hover:text-3xl text-4xl md:hover:text-4xl text-5xl md:hover:text-5xl text-6xl md:hover:text-6xl text-left md:hover:text-left text-center md:hover:text-center text-right md:hover:text-right text-justify md:hover:text-justify text-transparent md:hover:text-transparent text-current md:hover:text-current text-black md:hover:text-black text-white md:hover:text-white text-gray-100 md:hover:text-gray-100`;\n          ",
    snapshot: true,
  },
  "test 80 classes               ": {
    code:
      "\n          import tw from '@tailwindcssinjs/macro';\n          const css = tw`cursor-text md:hover:cursor-text text-xs md:hover:text-xs text-sm md:hover:text-sm text-base md:hover:text-base text-lg md:hover:text-lg text-xl md:hover:text-xl text-2xl md:hover:text-2xl text-3xl md:hover:text-3xl text-4xl md:hover:text-4xl text-5xl md:hover:text-5xl text-6xl md:hover:text-6xl text-left md:hover:text-left text-center md:hover:text-center text-right md:hover:text-right text-justify md:hover:text-justify text-transparent md:hover:text-transparent text-current md:hover:text-current text-black md:hover:text-black text-white md:hover:text-white text-gray-100 md:hover:text-gray-100 text-gray-200 md:hover:text-gray-200 text-gray-300 md:hover:text-gray-300 text-gray-400 md:hover:text-gray-400 text-gray-500 md:hover:text-gray-500 text-gray-600 md:hover:text-gray-600 text-gray-700 md:hover:text-gray-700 text-gray-800 md:hover:text-gray-800 text-gray-900 md:hover:text-gray-900 text-red-100 md:hover:text-red-100 text-red-200 md:hover:text-red-200 text-red-300 md:hover:text-red-300 text-red-400 md:hover:text-red-400 text-red-500 md:hover:text-red-500 text-red-600 md:hover:text-red-600 text-red-700 md:hover:text-red-700 text-red-800 md:hover:text-red-800 text-red-900 md:hover:text-red-900 text-orange-100 md:hover:text-orange-100 text-orange-200 md:hover:text-orange-200 text-orange-300 md:hover:text-orange-300`;\n          ",
    snapshot: true,
  },
  "test 160 classes              ": {
    code:
      "\n          import tw from '@tailwindcssinjs/macro';\n          const css = tw`cursor-text md:hover:cursor-text text-xs md:hover:text-xs text-sm md:hover:text-sm text-base md:hover:text-base text-lg md:hover:text-lg text-xl md:hover:text-xl text-2xl md:hover:text-2xl text-3xl md:hover:text-3xl text-4xl md:hover:text-4xl text-5xl md:hover:text-5xl text-6xl md:hover:text-6xl text-left md:hover:text-left text-center md:hover:text-center text-right md:hover:text-right text-justify md:hover:text-justify text-transparent md:hover:text-transparent text-current md:hover:text-current text-black md:hover:text-black text-white md:hover:text-white text-gray-100 md:hover:text-gray-100 text-gray-200 md:hover:text-gray-200 text-gray-300 md:hover:text-gray-300 text-gray-400 md:hover:text-gray-400 text-gray-500 md:hover:text-gray-500 text-gray-600 md:hover:text-gray-600 text-gray-700 md:hover:text-gray-700 text-gray-800 md:hover:text-gray-800 text-gray-900 md:hover:text-gray-900 text-red-100 md:hover:text-red-100 text-red-200 md:hover:text-red-200 text-red-300 md:hover:text-red-300 text-red-400 md:hover:text-red-400 text-red-500 md:hover:text-red-500 text-red-600 md:hover:text-red-600 text-red-700 md:hover:text-red-700 text-red-800 md:hover:text-red-800 text-red-900 md:hover:text-red-900 text-orange-100 md:hover:text-orange-100 text-orange-200 md:hover:text-orange-200 text-orange-300 md:hover:text-orange-300 text-orange-400 md:hover:text-orange-400 text-orange-500 md:hover:text-orange-500 text-orange-600 md:hover:text-orange-600 text-orange-700 md:hover:text-orange-700 text-orange-800 md:hover:text-orange-800 text-orange-900 md:hover:text-orange-900 text-yellow-100 md:hover:text-yellow-100 text-yellow-200 md:hover:text-yellow-200 text-yellow-300 md:hover:text-yellow-300 text-yellow-400 md:hover:text-yellow-400 text-yellow-500 md:hover:text-yellow-500 text-yellow-600 md:hover:text-yellow-600 text-yellow-700 md:hover:text-yellow-700 text-yellow-800 md:hover:text-yellow-800 text-yellow-900 md:hover:text-yellow-900 text-green-100 md:hover:text-green-100 text-green-200 md:hover:text-green-200 text-green-300 md:hover:text-green-300 text-green-400 md:hover:text-green-400 text-green-500 md:hover:text-green-500 text-green-600 md:hover:text-green-600 text-green-700 md:hover:text-green-700 text-green-800 md:hover:text-green-800 text-green-900 md:hover:text-green-900 text-teal-100 md:hover:text-teal-100 text-teal-200 md:hover:text-teal-200 text-teal-300 md:hover:text-teal-300 text-teal-400 md:hover:text-teal-400 text-teal-500 md:hover:text-teal-500 text-teal-600 md:hover:text-teal-600 text-teal-700 md:hover:text-teal-700 text-teal-800 md:hover:text-teal-800 text-teal-900 md:hover:text-teal-900 text-blue-100 md:hover:text-blue-100 text-blue-200 md:hover:text-blue-200 text-blue-300 md:hover:text-blue-300 text-blue-400 md:hover:text-blue-400 text-blue-500 md:hover:text-blue-500 text-blue-600 md:hover:text-blue-600 text-blue-700 md:hover:text-blue-700`;\n          ",
    snapshot: true,
  },
  "test 220 classes              ": {
    code:
      "\n          import tw from '@tailwindcssinjs/macro';\n          const css = tw`cursor-text md:hover:cursor-text text-xs md:hover:text-xs text-sm md:hover:text-sm text-base md:hover:text-base text-lg md:hover:text-lg text-xl md:hover:text-xl text-2xl md:hover:text-2xl text-3xl md:hover:text-3xl text-4xl md:hover:text-4xl text-5xl md:hover:text-5xl text-6xl md:hover:text-6xl text-left md:hover:text-left text-center md:hover:text-center text-right md:hover:text-right text-justify md:hover:text-justify text-transparent md:hover:text-transparent text-current md:hover:text-current text-black md:hover:text-black text-white md:hover:text-white text-gray-100 md:hover:text-gray-100 text-gray-200 md:hover:text-gray-200 text-gray-300 md:hover:text-gray-300 text-gray-400 md:hover:text-gray-400 text-gray-500 md:hover:text-gray-500 text-gray-600 md:hover:text-gray-600 text-gray-700 md:hover:text-gray-700 text-gray-800 md:hover:text-gray-800 text-gray-900 md:hover:text-gray-900 text-red-100 md:hover:text-red-100 text-red-200 md:hover:text-red-200 text-red-300 md:hover:text-red-300 text-red-400 md:hover:text-red-400 text-red-500 md:hover:text-red-500 text-red-600 md:hover:text-red-600 text-red-700 md:hover:text-red-700 text-red-800 md:hover:text-red-800 text-red-900 md:hover:text-red-900 text-orange-100 md:hover:text-orange-100 text-orange-200 md:hover:text-orange-200 text-orange-300 md:hover:text-orange-300 text-orange-400 md:hover:text-orange-400 text-orange-500 md:hover:text-orange-500 text-orange-600 md:hover:text-orange-600 text-orange-700 md:hover:text-orange-700 text-orange-800 md:hover:text-orange-800 text-orange-900 md:hover:text-orange-900 text-yellow-100 md:hover:text-yellow-100 text-yellow-200 md:hover:text-yellow-200 text-yellow-300 md:hover:text-yellow-300 text-yellow-400 md:hover:text-yellow-400 text-yellow-500 md:hover:text-yellow-500 text-yellow-600 md:hover:text-yellow-600 text-yellow-700 md:hover:text-yellow-700 text-yellow-800 md:hover:text-yellow-800 text-yellow-900 md:hover:text-yellow-900 text-green-100 md:hover:text-green-100 text-green-200 md:hover:text-green-200 text-green-300 md:hover:text-green-300 text-green-400 md:hover:text-green-400 text-green-500 md:hover:text-green-500 text-green-600 md:hover:text-green-600 text-green-700 md:hover:text-green-700 text-green-800 md:hover:text-green-800 text-green-900 md:hover:text-green-900 text-teal-100 md:hover:text-teal-100 text-teal-200 md:hover:text-teal-200 text-teal-300 md:hover:text-teal-300 text-teal-400 md:hover:text-teal-400 text-teal-500 md:hover:text-teal-500 text-teal-600 md:hover:text-teal-600 text-teal-700 md:hover:text-teal-700 text-teal-800 md:hover:text-teal-800 text-teal-900 md:hover:text-teal-900 text-blue-100 md:hover:text-blue-100 text-blue-200 md:hover:text-blue-200 text-blue-300 md:hover:text-blue-300 text-blue-400 md:hover:text-blue-400 text-blue-500 md:hover:text-blue-500 text-blue-600 md:hover:text-blue-600 text-blue-700 md:hover:text-blue-700 text-blue-800 md:hover:text-blue-800 text-blue-900 md:hover:text-blue-900 text-indigo-100 md:hover:text-indigo-100 text-indigo-200 md:hover:text-indigo-200 text-indigo-300 md:hover:text-indigo-300 text-indigo-400 md:hover:text-indigo-400 text-indigo-500 md:hover:text-indigo-500 text-indigo-600 md:hover:text-indigo-600 text-indigo-700 md:hover:text-indigo-700 text-indigo-800 md:hover:text-indigo-800 text-indigo-900 md:hover:text-indigo-900 text-purple-100 md:hover:text-purple-100 text-purple-200 md:hover:text-purple-200 text-purple-300 md:hover:text-purple-300 text-purple-400 md:hover:text-purple-400 text-purple-500 md:hover:text-purple-500 text-purple-600 md:hover:text-purple-600 text-purple-700 md:hover:text-purple-700 text-purple-800 md:hover:text-purple-800 text-purple-900 md:hover:text-purple-900 text-pink-100 md:hover:text-pink-100 text-pink-200 md:hover:text-pink-200 text-pink-300 md:hover:text-pink-300 text-pink-400 md:hover:text-pink-400 text-pink-500 md:hover:text-pink-500 text-pink-600 md:hover:text-pink-600 text-pink-700 md:hover:text-pink-700 text-pink-800 md:hover:text-pink-800 text-pink-900 md:hover:text-pink-900 select-text md:hover:select-text`;\n          ",
    snapshot: true,
  },
};
