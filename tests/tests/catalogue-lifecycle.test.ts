import { describe, it, expect } from 'vitest';

type CatalogueStatus = 'draft' | 'published' | 'expired';

function getCatalogueStatus(
  published: boolean,
  validUntil: Date,
  currentDate: Date
): CatalogueStatus {

  if (!published) {
    return 'draft';
  }

  if (currentDate > validUntil) {
    return 'expired';
  }

  return 'published';
}

describe('Catalogue Lifecycle', () => {

  it('should have Draft status when catalogue is not published', () => {
    const status = getCatalogueStatus(
      false,
      new Date('2026-12-31'),
      new Date('2026-10-02')
    );

    expect(status).toBe('draft');
  });

  it('should have Published status before expiry date', () => {
    const status = getCatalogueStatus(
      true,
      new Date('2026-12-31'),
      new Date('2026-10-02')
    );

    expect(status).toBe('published');
  });

  it('should have Expired status after expiry date', () => {
    const status = getCatalogueStatus(
      true,
      new Date('2026-09-30'),
      new Date('2026-10-02')
    );

    expect(status).toBe('expired');
  });

  it('should not be expired when expiry date is in the future', () => {
    const status = getCatalogueStatus(
      true,
      new Date('2026-10-03'),
      new Date('2026-10-02')
    );

    expect(status).toBe('published');
  });

});