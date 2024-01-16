import { resourceStringEn } from "./en";
import { resourceStringEs } from "./es";
import { resourceStringFr } from "./fr";
import { resourceStringPt } from "./pt";
import { resourceStringRu } from "./ru";
import { ResourceStrings } from "./types";
import { ResourceStringLanguage } from "../types";

export const resourceStrings: Record<ResourceStringLanguage, ResourceStrings> = {
    [ResourceStringLanguage.ENGLISH]: resourceStringEn,
    [ResourceStringLanguage.SPANISH]: resourceStringEs,
    [ResourceStringLanguage.FRENCH]: resourceStringFr,
    [ResourceStringLanguage.PORTUGUESE]: resourceStringPt,
    [ResourceStringLanguage.RUSSIAN]: resourceStringRu,
}
