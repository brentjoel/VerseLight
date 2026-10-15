import { readFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";

// Canonical English book names, with singular Psalm matching the content convention.
const books = new Set((
  "Genesis|Exodus|Leviticus|Numbers|Deuteronomy|Joshua|Judges|Ruth|1 Samuel|2 Samuel|" +
  "1 Kings|2 Kings|1 Chronicles|2 Chronicles|Ezra|Nehemiah|Esther|Job|Psalm|Proverbs|" +
  "Ecclesiastes|Song of Solomon|Isaiah|Jeremiah|Lamentations|Ezekiel|Daniel|Hosea|Joel|" +
  "Amos|Obadiah|Jonah|Micah|Nahum|Habakkuk|Zephaniah|Haggai|Zechariah|Malachi|" +
  "Matthew|Mark|Luke|John|Acts|Romans|1 Corinthians|2 Corinthians|Galatians|Ephesians|" +
  "Philippians|Colossians|1 Thessalonians|2 Thessalonians|1 Timothy|2 Timothy|Titus|" +
  "Philemon|Hebrews|James|1 Peter|2 Peter|1 John|2 John|3 John|Jude|Revelation"
).split("|"));
const referencePattern = /^((?:[1-3] )?[A-Z][a-z]+(?: [A-Z][a-z]+)*) ([1-9]\d*):([1-9]\d*)(?:-([1-9]\d*))?$/;
const slugPattern = /^[a-z]+(?:-[a-z]+)*$/;
const isObject = (value) => value !== null && typeof value === "object" && !Array.isArray(value);
const isText = (value) => typeof value === "string" && value.trim().length > 0 && !value.includes("\u2014");

export function validateData(emotions, prompts) {
  const errors = [];
  const check = (condition, message) => { if (!condition) errors.push(message); };
  const checkReference = (reference) => {
    const match = typeof reference === "string" ? reference.match(referencePattern) : null;
    check(Boolean(match && books.has(match[1]) && (!match[4] || Number(match[4]) >= Number(match[3]))), `Invalid reference: ${reference}`);
  };

  if (!Array.isArray(emotions) || !isObject(prompts)) return ["Expected an emotions array and a prompts object."];
  check(emotions.length === 8, "Expected exactly 8 broad emotions.");
  const emotionIds = new Set();
  for (const emotion of emotions) {
    if (!isObject(emotion)) { errors.push("Invalid emotion object."); continue; }
    check(isText(emotion.id) && slugPattern.test(emotion.id) && !emotionIds.has(emotion.id), `Invalid or duplicate emotion id: ${emotion.id}`);
    emotionIds.add(emotion.id);
    check([emotion.name, emotion.description, emotion.emoji].every(isText), `Missing emotion content or em dash: ${emotion.id}`);
    if (!Array.isArray(emotion.specifics)) { errors.push(`Missing specific feelings: ${emotion.id}`); continue; }
    check(emotion.specifics.length === 4, `Expected 4 specific feelings: ${emotion.id}`);
    const specificIds = new Set();
    for (const specific of emotion.specifics) {
      if (!isObject(specific)) { errors.push(`Invalid specific feeling: ${emotion.id}`); continue; }
      check(isText(specific.id) && slugPattern.test(specific.id) && !specificIds.has(specific.id), `Invalid or duplicate specific id: ${emotion.id}/${specific.id}`);
      specificIds.add(specific.id);
      check(isText(specific.name), `Missing specific name or em dash: ${specific.id}`);
      if (!Array.isArray(specific.references)) { errors.push(`Missing references: ${specific.id}`); continue; }
      check(specific.references.length === 4 && new Set(specific.references).size === 4, `Expected 4 distinct references: ${specific.id}`);
      for (const reference of specific.references) {
        checkReference(reference);
        check(Object.hasOwn(prompts, reference), `Missing prompt: ${reference}`);
      }
    }
  }
  for (const [reference, prompt] of Object.entries(prompts)) {
    checkReference(reference);
    check(isObject(prompt) && isText(prompt.reflect) && isText(prompt.prayer), `Invalid prompt or em dash: ${reference}`);
  }
  return errors;
}

export function validateVerses(emotions, translations) {
  const errors = [];
  const references = new Set(emotions.flatMap(emotion => emotion.specifics.flatMap(specific => specific.references)));
  for (const id of ["kjv", "web", "asv", "bsb"]) {
    const verses = translations[id];
    if (!isObject(verses)) { errors.push(`Missing translation file: ${id}.json`); continue; }
    for (const reference of references) {
      if (!Object.hasOwn(verses, reference) || typeof verses[reference] !== "string" || !verses[reference].trim()) {
        errors.push(`Missing or empty verse text: ${id.toUpperCase()} ${reference}`);
      }
    }
  }
  return errors;
}

// Importing the validator for focused checks does not execute the CLI.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const [emotions, prompts] = await Promise.all([
      readFile(new URL("../data/emotions.json", import.meta.url), "utf8").then(JSON.parse),
      readFile(new URL("../data/prompts.json", import.meta.url), "utf8").then(JSON.parse),
    ]);
    const translations = Object.fromEntries(await Promise.all(["kjv", "web", "asv", "bsb"].map(async id => [id,
      JSON.parse(await readFile(new URL(`../data/verses/${id}.json`, import.meta.url), "utf8")),
    ])));
    const errors = [...validateData(emotions, prompts), ...validateVerses(emotions, translations)];
    if (errors.length) {
      console.error(errors.join("\n"));
      process.exitCode = 1;
    } else {
      console.log(`Validated ${emotions.length} emotions, 32 specific feelings, ${Object.keys(prompts).length} verse prompts, and all references in KJV, WEB, ASV, BSB.`);
    }
  } catch (error) {
    console.error("Could not validate content:", error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
}
