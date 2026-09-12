import { computed, signal } from '@preact/signals'
import { describe } from '@/url/describe'
import { diagnose } from '@/url/diagnose'
import { serialize } from '@/url/serialize'
import { tokenize } from '@/url/tokenize'
import type { PartName, Parts } from '@/url/types'

export const raw = signal('')
export const activePart = signal<PartName | null>(null)
export const hoverPart = signal<PartName | null>(null)
export const inputEl: { current: HTMLTextAreaElement | null } = { current: null }

const tokenized = computed(() => tokenize(raw.value))
export const parts = computed(() => tokenized.value.parts)
export const ranges = computed(() => tokenized.value.ranges)
export const diagnostics = computed(() => diagnose(raw.value))
export const summary = computed(() => describe(parts.value))

export function update(fn: (parts: Parts) => Parts): void {
  raw.value = serialize(fn(parts.value))
}
