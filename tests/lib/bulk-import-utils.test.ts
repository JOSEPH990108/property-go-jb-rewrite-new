import { describe, expect, it } from 'vitest';

import { csvToObjects, keepFirstOccurrenceRows, parseCSV } from '@/lib/bulk-import-utils';

describe('bulk import CSV header mapping', () => {
  it('preserves canonical camelCase project headers', () => {
    const rows = parseCSV([
      'action,slug,name,developerSlug,tenureTypeCode',
      'create,test-project,Test Project,dev-slug,FREEHOLD',
    ].join('\n'));

    const [record] = csvToObjects(rows);

    expect(record).toMatchObject({
      action: 'create',
      slug: 'test-project',
      name: 'Test Project',
      developerSlug: 'dev-slug',
      tenureTypeCode: 'FREEHOLD',
    });
  });

  it('maps lowercase legacy headers to canonical schema keys', () => {
    const rows = parseCSV([
      'action,slug,name,developerslug,tenuretypecode',
      'create,test-project,Test Project,dev-slug,FREEHOLD',
    ].join('\n'));

    const [record] = csvToObjects(rows);

    expect(record.developerSlug).toBe('dev-slug');
    expect(record.tenureTypeCode).toBe('FREEHOLD');
  });

  it('handles BOM and separator variations in headers', () => {
    const rows = parseCSV([
      '\uFEFFaction,slug,name,developer slug,tenure-type-code',
      'create,test-project,Test Project,dev-slug,FREEHOLD',
    ].join('\n'));

    const [record] = csvToObjects(rows);

    expect(record.action).toBe('create');
    expect(record.developerSlug).toBe('dev-slug');
    expect(record.tenureTypeCode).toBe('FREEHOLD');
  });

  it('maps snake_case developer headers to canonical keys', () => {
    const rows = parseCSV([
      'slug,name,legal_name,is_active',
      'alam-heights,Alam Heights Sdn. Bhd.,Alam Heights Sdn. Bhd. (1180698A/201601009770),true',
    ].join('\n'));

    const [record] = csvToObjects(rows);

    expect(record.slug).toBe('alam-heights');
    expect(record.legalName).toBe('Alam Heights Sdn. Bhd. (1180698A/201601009770)');
    expect(record.isActive).toBe('true');
  });

  it('keeps the first duplicate row and drops later duplicates', () => {
    const rows = parseCSV([
      'slug,name',
      'alam-heights,Alam Heights Sdn. Bhd.',
      'alam-heights,Duplicate Alam Heights',
      'ksl-holdings,KSL Holdings',
    ].join('\n'));

    const records = csvToObjects(rows);
    const deduped = keepFirstOccurrenceRows(records, ['slug']);

    expect(deduped).toHaveLength(2);
    expect(deduped[0]?.slug).toBe('alam-heights');
    expect(deduped[0]?.name).toBe('Alam Heights Sdn. Bhd.');
    expect(deduped[1]?.slug).toBe('ksl-holdings');
  });
});