<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { computed, useSlots } from 'vue'
import { cn } from '@/lib/utils'

export type DataTableColumn = {
  key: string
  label: string
  width?: string
  class?: HTMLAttributes['class']
}

const props = withDefaults(
  defineProps<{
    columns: DataTableColumn[]
    rows: Record<string, unknown>[]
    rowKey?: string
    emptyText?: string
    class?: HTMLAttributes['class']
  }>(),
  {
    rowKey: 'id',
    emptyText: 'No items yet.',
  },
)

const slots = useSlots()

const gridTemplate = computed(() => {
  const cols = props.columns.map((column) => column.width || '1fr').join(' ')
  return slots.actions ? `${cols} auto` : cols
})

function rowId(row: Record<string, unknown>) {
  return String(row[props.rowKey] ?? '')
}
</script>

<template>
  <div :class="cn('data-table', props.class)">
    <div class="data-table-row data-table-head" :style="{ gridTemplateColumns: gridTemplate }">
      <span
        v-for="column in columns"
        :key="column.key"
        :class="cn('data-table-head-cell', column.class)"
      >
        {{ column.label }}
      </span>
      <span v-if="$slots.actions" class="data-table-head-cell data-table-actions-head" />
    </div>

    <p v-if="!rows.length" class="data-table-empty">{{ emptyText }}</p>

    <div
      v-for="row in rows"
      :key="rowId(row)"
      class="data-table-row"
      :style="{ gridTemplateColumns: gridTemplate }"
    >
      <span
        v-for="column in columns"
        :key="column.key"
        :class="cn('data-table-cell', column.class)"
      >
        <slot :name="`cell-${column.key}`" :row="row" :value="row[column.key]">
          {{ row[column.key] }}
        </slot>
      </span>
      <span v-if="$slots.actions" class="data-table-cell data-table-actions">
        <slot name="actions" :row="row" />
      </span>
    </div>
  </div>
</template>

<style scoped>
.data-table {
  overflow: hidden;
  border-radius: 16px;
  border: 1px solid #eef1f5;
  background: #fff;
}

.data-table-row {
  display: grid;
  gap: 0.75rem;
  align-items: center;
  padding: 0.85rem 1.25rem;
  border-bottom: 1px solid #eef1f5;
}

.data-table-row:last-child {
  border-bottom: 0;
}

.data-table-head {
  background: #f8fafc;
  border-bottom: 1px solid #eef1f5;
}

.data-table-head-cell {
  min-width: 0;
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  color: #5b6b82;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.data-table-cell {
  min-width: 0;
  overflow: hidden;
  font-size: 0.92rem;
  color: #0a1f44;
}

.data-table-empty {
  margin: 0;
  padding: 1.25rem 1.25rem;
  color: #5b6b82;
  font-size: 0.9rem;
}

.data-table-actions,
.data-table-actions-head {
  justify-self: end;
}

.data-table-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 0.4rem;
}

@media (max-width: 900px) {
  .data-table {
    overflow-x: auto;
  }

  .data-table-row {
    min-width: 720px;
  }
}
</style>
