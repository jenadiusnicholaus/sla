# Shared UI components (`@/components/ui`)

shadcn-vue style primitives — copy-owned components you can extend in the repo.

## Installed

- `Button` — variants: default, secondary, outline, ghost, link, destructive
- `Input`, `Textarea`, `Label`
- `Card` (+ Header, Title, Description, Content, Footer)
- `Badge`, `Separator`
- `Dialog` (+ Header, Title, Description, Content, Footer, …)
- `FormDialog` — shared create/edit modal wrapping Dialog + Card

## Form dialogs

Create/edit flows use `FormDialog`:

```vue
<script setup lang="ts">
import { FormDialog } from '@/components/ui'
</script>

<template>
  <FormDialog
    v-model:open="open"
    title="Add program"
    description="Shown on the landing page."
    submit-label="Save"
    :loading="saving"
    @submit="save"
  >
    <!-- form fields -->
  </FormDialog>
</template>
```

Used by CMS (programs, team, values, gallery images), Profiles, and QR Codes.

## Usage

```vue
<script setup lang="ts">
import { Button, Input, Label, Card, CardHeader, CardTitle, CardContent } from '@/components/ui'
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle>Sign in</CardTitle>
    </CardHeader>
    <CardContent class="grid gap-4">
      <Label for="email">Email</Label>
      <Input id="email" type="email" placeholder="you@example.com" />
      <Button>Continue</Button>
    </CardContent>
  </Card>
</template>
```

## Add more components

Requires **Node 22+** for the CLI (or run on a machine with Node 22):

```bash
cd sla
npx shadcn-vue@latest add dialog
npx shadcn-vue@latest add select tabs dropdown-menu
```

Config lives in `sla/components.json`. Theme tokens are in `src/assets/ui.css` (Street Labs orange / green / navy).

## Utilities

```ts
import { cn } from '@/lib/utils'

cn('px-4', condition && 'bg-primary')
```
