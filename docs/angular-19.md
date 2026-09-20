# Angular 19+ free-tier source

This file is only on the `compat/angular-19` branch of [ply-ui-ng/ply](https://github.com/ply-ui-ng/ply).

## Why this branch exists

Free primitives are already signals + `input()` / `output()` / `model()` + OnPush. That API has been stable since Angular 17. The published `main` line still says Angular 22 because **one path** imports `@angular/forms/signals`:

- `components/input-group/input-group.component.ts` — `contentChild(FormField)` for `[formField]` error chrome
- `components/password-input/password-input.component.ts` — `inject(FORM_FIELD)`

Those tokens do not exist on Angular 19, so a copy-in install from `main` fails typecheck on 19.

This branch removes those imports. Validation chrome uses `NgControl` (`formControlName` / `ngModel`) only.

## What stays on `main`

- Signal-forms `[formField]` error styling on input-group and password-input
- Docs site, Pro catalog, and `npx ply-ui-cli add` from ply-ui.com (Angular 22)

Do **not** merge this branch into `main`.

## How to use it

Copy `components/<name>/` from this branch into an Angular 19+ app (same layout as `npx ply-ui-cli add`). Match `@angular/cdk` to your Angular major.

```html
<ply-input-group>
  <ply-label>Email</ply-label>
  <input ply-input type="email" formControlName="email" />
  <ply-error>Required</ply-error>
</ply-input-group>
```

CVA hosts (`ply-toggle`, `ply-custom-select`, `ply-combobox`, …) still take `[(ngModel)]` or `formControlName` on the host.

## Floor

| API | Minimum Angular |
| --- | --- |
| `input()` / `output()` / `model()`, signal queries, `@if` / `@for` | 17 |
| `afterRenderEffect`, `afterEveryRender` | 19 |
| Signal-forms `[formField]` | 21+ on `main` only |

Practical floor for this branch: **Angular 19**.
