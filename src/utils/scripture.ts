// Builds canonical jw.org study-bible URLs from a scripture reference string.
//
// URL shape:
//   https://www.jw.org/en/library/bible/study-bible/books/{slug}/{chapter}/#v{BBCCCVVV}
// where the anchor is 8 digits: book number (2) + chapter (3) + verse (3),
// each zero-padded. e.g. Joel 3:20 -> book 29, ch 003, v 020 -> #v29003020

interface BibleBook {
  /** Canonical book number, 1 (Genesis) .. 66 (Revelation). */
  number: number
  /** jw.org URL slug, e.g. "1-chronicles", "song-of-solomon". */
  slug: string
  /** Lowercased names/abbreviations used to match a reference. */
  aliases: string[]
}

// Order matters: index + 1 is the canonical book number.
const BOOKS: BibleBook[] = [
  { number: 1, slug: 'genesis', aliases: ['genesis', 'gen', 'ge', 'gn'] },
  { number: 2, slug: 'exodus', aliases: ['exodus', 'exod', 'exo', 'ex'] },
  { number: 3, slug: 'leviticus', aliases: ['leviticus', 'lev', 'le', 'lv'] },
  { number: 4, slug: 'numbers', aliases: ['numbers', 'num', 'nu', 'nm', 'nb'] },
  { number: 5, slug: 'deuteronomy', aliases: ['deuteronomy', 'deut', 'deu', 'dt'] },
  { number: 6, slug: 'joshua', aliases: ['joshua', 'josh', 'jos', 'jsh'] },
  { number: 7, slug: 'judges', aliases: ['judges', 'judg', 'jdg', 'jg', 'jdgs'] },
  { number: 8, slug: 'ruth', aliases: ['ruth', 'rut', 'ru', 'rth'] },
  { number: 9, slug: '1-samuel', aliases: ['1 samuel', '1samuel', '1 sam', '1sam', '1sm', '1sa', 'i samuel'] },
  { number: 10, slug: '2-samuel', aliases: ['2 samuel', '2samuel', '2 sam', '2sam', '2sm', '2sa', 'ii samuel'] },
  { number: 11, slug: '1-kings', aliases: ['1 kings', '1kings', '1 kgs', '1kgs', '1ki', '1kin', 'i kings'] },
  { number: 12, slug: '2-kings', aliases: ['2 kings', '2kings', '2 kgs', '2kgs', '2ki', '2kin', 'ii kings'] },
  { number: 13, slug: '1-chronicles', aliases: ['1 chronicles', '1chronicles', '1 chron', '1chron', '1 chr', '1chr', '1ch', 'i chronicles'] },
  { number: 14, slug: '2-chronicles', aliases: ['2 chronicles', '2chronicles', '2 chron', '2chron', '2 chr', '2chr', '2ch', 'ii chronicles'] },
  { number: 15, slug: 'ezra', aliases: ['ezra', 'ezr', 'ez'] },
  { number: 16, slug: 'nehemiah', aliases: ['nehemiah', 'neh', 'ne'] },
  { number: 17, slug: 'esther', aliases: ['esther', 'esth', 'est', 'es'] },
  { number: 18, slug: 'job', aliases: ['job', 'jb'] },
  { number: 19, slug: 'psalms', aliases: ['psalms', 'psalm', 'psa', 'ps', 'pss', 'pslm'] },
  { number: 20, slug: 'proverbs', aliases: ['proverbs', 'prov', 'pro', 'prv', 'pr'] },
  { number: 21, slug: 'ecclesiastes', aliases: ['ecclesiastes', 'eccl', 'ecc', 'ec', 'qoh'] },
  { number: 22, slug: 'song-of-solomon', aliases: ['song of solomon', 'song of songs', 'song', 'sos', 'song sol', 'canticles', 'cant', 'so'] },
  { number: 23, slug: 'isaiah', aliases: ['isaiah', 'isa', 'is'] },
  { number: 24, slug: 'jeremiah', aliases: ['jeremiah', 'jer', 'je', 'jr'] },
  { number: 25, slug: 'lamentations', aliases: ['lamentations', 'lam', 'la'] },
  { number: 26, slug: 'ezekiel', aliases: ['ezekiel', 'ezek', 'eze', 'ezk'] },
  { number: 27, slug: 'daniel', aliases: ['daniel', 'dan', 'da', 'dn'] },
  { number: 28, slug: 'hosea', aliases: ['hosea', 'hos', 'ho'] },
  { number: 29, slug: 'joel', aliases: ['joel', 'joe', 'jl'] },
  { number: 30, slug: 'amos', aliases: ['amos', 'amo', 'am'] },
  { number: 31, slug: 'obadiah', aliases: ['obadiah', 'obad', 'oba', 'ob'] },
  { number: 32, slug: 'jonah', aliases: ['jonah', 'jon', 'jnh'] },
  { number: 33, slug: 'micah', aliases: ['micah', 'mic', 'mc'] },
  { number: 34, slug: 'nahum', aliases: ['nahum', 'nah', 'na'] },
  { number: 35, slug: 'habakkuk', aliases: ['habakkuk', 'hab', 'hb'] },
  { number: 36, slug: 'zephaniah', aliases: ['zephaniah', 'zeph', 'zep', 'zp'] },
  { number: 37, slug: 'haggai', aliases: ['haggai', 'hag', 'hg'] },
  { number: 38, slug: 'zechariah', aliases: ['zechariah', 'zech', 'zec', 'zc'] },
  { number: 39, slug: 'malachi', aliases: ['malachi', 'mal', 'ml'] },
  { number: 40, slug: 'matthew', aliases: ['matthew', 'matt', 'mat', 'mt'] },
  { number: 41, slug: 'mark', aliases: ['mark', 'mrk', 'mar', 'mk', 'mr'] },
  { number: 42, slug: 'luke', aliases: ['luke', 'luk', 'lk'] },
  { number: 43, slug: 'john', aliases: ['john', 'joh', 'jhn', 'jn'] },
  { number: 44, slug: 'acts', aliases: ['acts', 'act', 'ac'] },
  { number: 45, slug: 'romans', aliases: ['romans', 'rom', 'ro', 'rm'] },
  { number: 46, slug: '1-corinthians', aliases: ['1 corinthians', '1corinthians', '1 cor', '1cor', '1co', 'i corinthians'] },
  { number: 47, slug: '2-corinthians', aliases: ['2 corinthians', '2corinthians', '2 cor', '2cor', '2co', 'ii corinthians'] },
  { number: 48, slug: 'galatians', aliases: ['galatians', 'gal', 'ga'] },
  { number: 49, slug: 'ephesians', aliases: ['ephesians', 'eph', 'ephes'] },
  { number: 50, slug: 'philippians', aliases: ['philippians', 'phil', 'php', 'pp'] },
  { number: 51, slug: 'colossians', aliases: ['colossians', 'col', 'co'] },
  { number: 52, slug: '1-thessalonians', aliases: ['1 thessalonians', '1thessalonians', '1 thess', '1thess', '1 thes', '1th', 'i thessalonians'] },
  { number: 53, slug: '2-thessalonians', aliases: ['2 thessalonians', '2thessalonians', '2 thess', '2thess', '2 thes', '2th', 'ii thessalonians'] },
  { number: 54, slug: '1-timothy', aliases: ['1 timothy', '1timothy', '1 tim', '1tim', '1ti', 'i timothy'] },
  { number: 55, slug: '2-timothy', aliases: ['2 timothy', '2timothy', '2 tim', '2tim', '2ti', 'ii timothy'] },
  { number: 56, slug: 'titus', aliases: ['titus', 'tit', 'ti'] },
  { number: 57, slug: 'philemon', aliases: ['philemon', 'philem', 'phm', 'pm'] },
  { number: 58, slug: 'hebrews', aliases: ['hebrews', 'heb'] },
  { number: 59, slug: 'james', aliases: ['james', 'jas', 'jm'] },
  { number: 60, slug: '1-peter', aliases: ['1 peter', '1peter', '1 pet', '1pet', '1pe', '1pt', 'i peter'] },
  { number: 61, slug: '2-peter', aliases: ['2 peter', '2peter', '2 pet', '2pet', '2pe', '2pt', 'ii peter'] },
  { number: 62, slug: '1-john', aliases: ['1 john', '1john', '1 jn', '1jn', '1jo', 'i john'] },
  { number: 63, slug: '2-john', aliases: ['2 john', '2john', '2 jn', '2jn', '2jo', 'ii john'] },
  { number: 64, slug: '3-john', aliases: ['3 john', '3john', '3 jn', '3jn', '3jo', 'iii john'] },
  { number: 65, slug: 'jude', aliases: ['jude', 'jud', 'jd'] },
  { number: 66, slug: 'revelation', aliases: ['revelation', 'revelations', 'rev', 're', 'rv', 'apocalypse'] },
]

// alias -> book lookup, built once.
const BOOK_BY_ALIAS = new Map<string, BibleBook>()
for (const book of BOOKS) {
  for (const alias of book.aliases) {
    BOOK_BY_ALIAS.set(alias, book)
  }
}

/** Normalize a book token: lowercase, strip periods, collapse whitespace. */
function normalizeBook(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/\./g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

export interface ParsedScripture {
  book: BibleBook
  chapter: number
  verse: number
  /** Last verse of a range (e.g. 6 for "23:1-6"), if one was given. */
  endVerse: number | null
  /** The verse the URL anchors to, formatted "Book Chapter:Verse". */
  canonical: string
  url: string
}

const pad = (n: number, len: number) => String(n).padStart(len, '0')

/**
 * Parse a reference like "Joel 3:20", "1 Chronicles 4:2", "2 Tim 3:12",
 * "Ps 23:1-6" and return the jw.org study-bible URL for the first verse.
 * Returns null if the book can't be recognized.
 */
export function parseScriptureReference(reference: string): ParsedScripture | null {
  // Capture: book (lazy, may start with a leading number), chapter, verse,
  // and an optional end verse for ranges ("-6" / "–6").
  const m = reference.match(/^\s*([1-3]?\s*[A-Za-z][A-Za-z. ]*?)\s+(\d+)\s*:\s*(\d+)(?:\s*[-–]\s*(\d+))?/)
  if (!m) return null

  const book = BOOK_BY_ALIAS.get(normalizeBook(m[1]))
  if (!book) return null

  const chapter = parseInt(m[2], 10)
  const verse = parseInt(m[3], 10)
  if (!chapter || !verse) return null

  const endParsed = m[4] ? parseInt(m[4], 10) : NaN
  const endVerse = Number.isFinite(endParsed) && endParsed > verse ? endParsed : null

  const anchor = `${pad(book.number, 2)}${pad(chapter, 3)}${pad(verse, 3)}`
  const url = `https://www.jw.org/en/library/bible/study-bible/books/${book.slug}/${chapter}/#v${anchor}`

  return { book, chapter, verse, endVerse, canonical: `${book.slug} ${chapter}:${verse}`, url }
}

/** Convenience: just the URL, or null if unparseable. */
export function scriptureUrl(reference: string): string | null {
  return parseScriptureReference(reference)?.url ?? null
}
