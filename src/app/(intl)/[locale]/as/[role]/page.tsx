import { notFound } from 'next/navigation';
import Browse from '@/components/screen/Browse';
import { ROLE_IDS, isRoleId } from '@/content/roles';
import { getSite } from '@/content/store';
import { PREFIXED_LOCALES, isLocale } from '@/i18n/config';
import { buildBrowseMetadata } from '@/lib/metadata';

export { viewport } from '@/lib/metadata';

// (ko)/as/[role] 와 같은 이유로 true — false 면 저장 직후 404(NoFallbackError)
export const dynamicParams = true;

export function generateStaticParams() {
  return PREFIXED_LOCALES.flatMap((locale) => ROLE_IDS.map((role) => ({ locale, role })));
}

type Props = { params: Promise<{ locale: string; role: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale, role } = await params;
  return isLocale(locale) && isRoleId(role) ? buildBrowseMetadata(await getSite(), locale, role) : {};
}

export default async function LocalizedBrowse({ params }: Props) {
  const { locale, role } = await params;
  if (!isLocale(locale) || locale === 'ko' || !isRoleId(role)) notFound();
  return <Browse site={await getSite()} locale={locale} role={role} />;
}
