/**
 * Lightweight class-name joiner.
 * For Tailwind conflict resolution (e.g. `px-2 px-4`), install `clsx` +
 * `tailwind-merge` and swap the body for `twMerge(clsx(inputs))`.
 */
export function cn(
  ...inputs: Array<string | false | null | undefined>
): string {
  return inputs.filter(Boolean).join(" ");
}