/**
 * Next generates next-env.d.ts on a build and gitignores it, so a checkout that
 * has never built has no types for a static image import and `tsc --noEmit`
 * fails with "Cannot find module ... .jpg". Locally it passes, because an
 * earlier build left the generated file behind. That gap put main red once.
 *
 * These references are the same ones the generated file carries, checked in so
 * the type check stands on its own.
 */
/// <reference types="next" />
/// <reference types="next/image-types/global" />
