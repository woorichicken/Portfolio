'use client';

import Image from 'next/image';
import { useRef, useState } from 'react';
import { isMediaSrc } from '@/content/images';
import { LOCALES, type Locale } from '@/i18n/config';
import { IconDown, IconUp } from '../screen/icons';
import { mediaNameOf, uploadMedia } from './admin-api';
import { getIn, keyOf, listAdd, listMove, listRemove, setAll, setAllOptional, setOne, setOptionalText, toggleGroup, type FieldProblems, type L3, type Path } from './editor-model';
import type { Spec } from './editor-spec';

// 칸 그리기 — editor-spec.ts 의 칸 목록을 세 언어 나란히(ko · en · es) 그린다. 값은 부모가 든 draft(L3) 하나에서 읽고 쓴다.
// 서버 검사(422)의 문제는 problems[칸 열쇠] 로 받아 그 칸 바로 아래에 붙인다(열쇠 = editor-model 의 keyOf).

export type Draft = L3<Record<string, unknown>>;
type Ctx = { draft: Draft; set: (next: Draft) => void; problems: FieldProblems['byField']; disabled?: boolean };

const LOCALE_TAG: Record<Locale, string> = { ko: 'KO', en: 'EN', es: 'ES' };

export function FieldList({ specs, base, ctx }: { specs: Spec[]; base: Path; ctx: Ctx }) {
  return (
    <>
      {specs.map((s) => (
        <Field key={s.key} spec={s} path={[...base, s.key]} ctx={ctx} />
      ))}
    </>
  );
}

export function Problems({ list }: { list?: FieldProblems['all'] }) {
  if (!list?.length) return null;
  return (
    <ul className="admin-field-problems" role="alert">
      {list.map((p, i) => (
        <li key={i}>{p.locale ? `${p.locale.toUpperCase()} · ` : ''}{p.message}</li>
      ))}
    </ul>
  );
}

function Field({ spec, path, ctx }: { spec: Spec; path: Path; ctx: Ctx }) {
  const key = keyOf(path);
  switch (spec.t) {
    case 'text':
      return <TextField spec={spec} path={path} ctx={ctx} />;
    case 'number':
      return (
        <div className="admin-field" data-field={key}>
          <span className="admin-field-label">{spec.label}</span>
          <input className="admin-input admin-input-short" type="number" min={1} value={String(getIn(ctx.draft.ko, path) ?? '')} disabled={ctx.disabled} aria-label={spec.label} onChange={(e) => ctx.set(setAll(ctx.draft, path, Number(e.target.value) || 0))} />
          <Problems list={ctx.problems[key]} />
        </div>
      );
    case 'shot':
      return <ShotField label={spec.label} path={path} ctx={ctx} />;
    case 'group':
      return <GroupField spec={spec} path={path} ctx={ctx} />;
    case 'list':
      return <ListField spec={spec} path={path} ctx={ctx} />;
  }
}

function TextField({ spec, path, ctx }: { spec: Extract<Spec, { t: 'text' }>; path: Path; ctx: Ctx }) {
  const key = keyOf(path);
  const Tag = spec.long ? 'textarea' : 'input';
  if (spec.same) {
    const value = String(getIn(ctx.draft.ko, path) ?? '');
    return (
      <div className="admin-field" data-field={key}>
        <span className="admin-field-label">{spec.label}<small>세 언어 같음</small></span>
        {spec.readOnly ? (
          <code className="admin-readonly">{value}</code>
        ) : (
          <Tag
            className="admin-input"
            value={value}
            disabled={ctx.disabled}
            aria-label={spec.label}
            data-field={key}
            spellCheck={false}
            onChange={(e) => ctx.set(spec.optional ? setAllOptional(ctx.draft, path, e.target.value) : setAll(ctx.draft, path, e.target.value))}
          />
        )}
        {spec.hint && <span className="admin-hint">{spec.hint}</span>}
        <Problems list={ctx.problems[key]} />
      </div>
    );
  }
  return (
    <div className="admin-field" data-field={key}>
      <span className="admin-field-label">{spec.label}</span>
      <div className="admin-l3">
        {LOCALES.map((l) => (
          <label key={l} className="admin-loc">
            <span className="admin-loc-tag">{LOCALE_TAG[l]}</span>
            <Tag
              className="admin-input"
              value={String(getIn(ctx.draft[l], path) ?? '')}
              disabled={ctx.disabled}
              aria-label={`${spec.label} ${LOCALE_TAG[l]}`}
              data-field={key}
              data-locale={l}
              rows={spec.long ? 3 : undefined}
              onChange={(e) => ctx.set(spec.optional ? setOptionalText(ctx.draft, l, path, e.target.value) : setOne(ctx.draft, l, path, e.target.value))}
            />
          </label>
        ))}
      </div>
      {spec.hint && <span className="admin-hint">{spec.hint}</span>}
      <Problems list={ctx.problems[key]} />
    </div>
  );
}

/** 파일 고르기 → 올리기. 다 올라가면 onUploaded(src, 크기) */
export function UploadButton({ label, accept, onUploaded, disabled }: { label: string; accept: string; onUploaded: (u: { src: string; width?: number; height?: number }, file: File) => void; disabled?: boolean }) {
  const ref = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<{ busy: boolean; error?: string }>({ busy: false });
  return (
    <span className="admin-upload">
      <input
        ref={ref}
        type="file"
        accept={accept}
        className="visually-hidden"
        aria-label={label}
        tabIndex={-1}
        onChange={async (e) => {
          const file = e.target.files?.[0];
          e.target.value = '';
          if (!file) return;
          setState({ busy: true });
          const r = await uploadMedia(file, mediaNameOf(file));
          if (!r.ok) return setState({ busy: false, error: r.error.message });
          setState({ busy: false });
          onUploaded({ src: r.data.src, width: r.data.shot?.width, height: r.data.shot?.height }, file);
        }}
      />
      <button type="button" className="btn btn-ghost btn-sm" disabled={disabled || state.busy} onClick={() => ref.current?.click()}>
        {state.busy ? '올리는 중…' : label}
      </button>
      {state.error && <span className="admin-field-problems" role="alert">{state.error}</span>}
    </span>
  );
}

function Thumb({ src, width, height }: { src: string; width: number; height: number }) {
  if (!src) return <div className="admin-shot-thumb" />;
  return (
    <div className="admin-shot-thumb">
      <Image src={src} unoptimized={isMediaSrc(src)} alt="" width={width || 16} height={height || 9} sizes="160px" />
    </div>
  );
}

function ShotField({ label, path, ctx, onRemove }: { label: string; path: Path; ctx: Ctx; onRemove?: () => void }) {
  const key = keyOf(path);
  const shot = (getIn(ctx.draft.ko, path) ?? {}) as { src?: string; width?: number; height?: number };
  return (
    <div className="admin-field admin-shot" data-field={key}>
      <span className="admin-field-label">{label}</span>
      <div className="admin-shot-row">
        <Thumb src={shot.src ?? ''} width={shot.width ?? 0} height={shot.height ?? 0} />
        <div className="admin-shot-meta">
          <code className="admin-readonly" data-shot-src={key}>{shot.src || '(사진 없음)'}</code>
          <span className="admin-hint">{shot.width ?? '?'} × {shot.height ?? '?'} · jpg·png·webp 10MB · 1400px 안팎으로 줄여서</span>
          <span className="admin-row-actions">
            <UploadButton
              label={`${label} 바꾸기`}
              accept="image/jpeg,image/png,image/webp,image/gif"
              disabled={ctx.disabled}
              onUploaded={(u) => {
                // 파일·크기는 세 언어 같이, alt 는 언어마다 그대로 둔다
                let next = setAll(ctx.draft, [...path, 'src'], u.src);
                if (u.width && u.height) next = setAll(setAll(next, [...path, 'width'], u.width), [...path, 'height'], u.height);
                ctx.set(next);
              }}
            />
            {onRemove && <button type="button" className="btn btn-ghost btn-sm" disabled={ctx.disabled} onClick={onRemove}>빼기</button>}
          </span>
        </div>
      </div>
      <TextField spec={{ t: 'text', key: 'alt', label: '사진 설명(alt)' }} path={[...path, 'alt']} ctx={ctx} />
      <TextField spec={{ t: 'text', key: 'caption', label: '캡션(선택)', optional: true }} path={[...path, 'caption']} ctx={ctx} />
      <Problems list={[...(ctx.problems[key] ?? []), ...(ctx.problems[`${key}.src`] ?? []), ...(ctx.problems[`${key}.width`] ?? []), ...(ctx.problems[`${key}.height`] ?? [])]} />
    </div>
  );
}

function GroupField({ spec, path, ctx }: { spec: Extract<Spec, { t: 'group' }>; path: Path; ctx: Ctx }) {
  const key = keyOf(path);
  const present = getIn(ctx.draft.ko, path) !== undefined;
  if (!present) {
    return (
      <div className="admin-field admin-group" data-field={key}>
        <span className="admin-field-label">{spec.label}</span>
        <button type="button" className="btn btn-ghost btn-sm" disabled={ctx.disabled || !spec.blank} onClick={() => spec.blank && ctx.set(toggleGroup(ctx.draft, path, spec.blank))}>+ {spec.label} 넣기</button>
        <Problems list={ctx.problems[key]} />
      </div>
    );
  }
  return (
    <fieldset className="admin-group" data-field={key}>
      <legend className="admin-field-label">
        {spec.label}
        {spec.optional && <button type="button" className="admin-link-btn" disabled={ctx.disabled} onClick={() => ctx.set(toggleGroup(ctx.draft, path, null))}>빼기</button>}
      </legend>
      <FieldList specs={spec.fields} base={path} ctx={ctx} />
      <Problems list={ctx.problems[key]} />
    </fieldset>
  );
}

function ListField({ spec, path, ctx }: { spec: Extract<Spec, { t: 'list' }>; path: Path; ctx: Ctx }) {
  const key = keyOf(path);
  const list = (getIn(ctx.draft.ko, path) as unknown[] | undefined) ?? [];
  const rowLabel = spec.rowLabel ?? spec.label;
  const head = (i: number) => (
    <div className="admin-row-head">
      <span>{rowLabel} {i + 1}</span>
      <span className="admin-row-actions">
        <button type="button" className="icon-btn" aria-label={`${rowLabel} ${i + 1} 위로`} disabled={ctx.disabled || i === 0} onClick={() => ctx.set(listMove(ctx.draft, path, i, -1))}><IconUp /></button>
        <button type="button" className="icon-btn" aria-label={`${rowLabel} ${i + 1} 아래로`} disabled={ctx.disabled || i === list.length - 1} onClick={() => ctx.set(listMove(ctx.draft, path, i, 1))}><IconDown /></button>
        {spec.item !== 'shot' && <button type="button" className="btn btn-ghost btn-sm" disabled={ctx.disabled} onClick={() => ctx.set(listRemove(ctx.draft, path, i, spec.optional))}>빼기</button>}
      </span>
    </div>
  );
  return (
    <fieldset className="admin-group admin-list-block" data-field={key}>
      <legend className="admin-field-label">{spec.label}<small>{list.length}줄 · 줄 추가·빼기·순서는 세 언어 같이</small></legend>
      <Problems list={ctx.problems[key]} />
      {list.map((_, i) => (
        <div key={i} className="admin-row" data-field={keyOf([...path, i])}>
          {head(i)}
          {spec.item === 'text' ? (
            <TextField spec={{ t: 'text', key: String(i), label: `${rowLabel} ${i + 1}`, long: spec.long, hint: undefined }} path={[...path, i]} ctx={ctx} />
          ) : spec.item === 'shot' ? (
            <ShotField label={`${rowLabel} ${i + 1}`} path={[...path, i]} ctx={ctx} onRemove={() => ctx.set(listRemove(ctx.draft, path, i, spec.optional))} />
          ) : (
            <FieldList specs={spec.item} base={[...path, i]} ctx={ctx} />
          )}
        </div>
      ))}
      {spec.item === 'shot' ? (
        <UploadButton
          label={`+ ${rowLabel} 올려서 넣기`}
          accept="image/jpeg,image/png,image/webp,image/gif"
          disabled={ctx.disabled}
          onUploaded={(u) => ctx.set(listAdd(ctx.draft, path, () => ({ src: u.src, width: u.width ?? 0, height: u.height ?? 0, alt: '' })))}
        />
      ) : (
        <button type="button" className="btn btn-ghost btn-sm" disabled={ctx.disabled || !spec.blank} onClick={() => spec.blank && ctx.set(listAdd(ctx.draft, path, spec.blank))}>+ {rowLabel} 추가</button>
      )}
    </fieldset>
  );
}
