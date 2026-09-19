/**
 * Manual smoke against the live registry (not part of CI).
 * Run: npx tsx scripts/smoke-tools.ts
 */
import { listComponents } from '../src/tools/list-components';
import { searchComponents } from '../src/tools/search-components';
import { getComponent } from '../src/tools/get-component';
import { addComponents } from '../src/tools/add-components';
import { doctor } from '../src/tools/doctor';

function text(result: { content: { type: string; text?: string }[] }) {
  return JSON.parse(result.content[0].text || '{}');
}

async function main() {
  const list = await listComponents({ tier: 'free', q: 'button', category: 'component' });
  const listBody = text(list);
  console.log('list count', listBody.count, listBody.items?.slice(0, 3).map((i: { name: string }) => i.name));

  const search = await searchComponents({ query: 'dialog', tier: 'free', limit: 5 });
  console.log(
    'search',
    text(search).matches?.map((m: { name: string }) => m.name)
  );

  const get = await getComponent({ name: 'card', includeSource: false });
  const getBody = text(get);
  console.log('get', getBody.name, getBody.tier, 'files', getBody.files?.length);

  const pro = await addComponents({ names: ['layout-pricing'] });
  const proBody = text(pro);
  console.log('pro reject', pro.isError === true, String(proBody.error || '').slice(0, 100));

  // doctor is read-only. Skip init_project here — it writes ply-ui.json.
  const doc = await doctor({ cwd: process.cwd() });
  console.log('doctor', doc.isError === true ? 'problems' : 'ok', String(text(doc).error || text(doc).ok).slice(0, 80));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
