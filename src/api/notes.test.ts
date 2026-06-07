import { describe, it, expect, vi, afterEach } from 'vitest';
import { createNote, updateNote } from './notes';

const mockOkResponse = (body: unknown) =>
  vi.fn().mockResolvedValueOnce({ ok: true, json: async () => body } as Response);

const mockErrorResponse = () =>
  vi.fn().mockResolvedValueOnce({ ok: false, json: async () => ({}) } as Response);

describe('createNote', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should include tags in request body when called with title, content, and non-empty tags', async () => {
    vi.stubGlobal(
      'fetch',
      mockOkResponse({
        id: '1',
        title: 'T',
        content: 'C',
        createdAt: '',
        updatedAt: '',
        tags: ['work'],
      }),
    );

    await createNote({ title: 'T', content: 'C', tags: ['work'] });

    const [, init] = vi.mocked(fetch).mock.calls[0];
    const body = JSON.parse(init!.body as string);
    expect(body.tags).toEqual(['work']);
  });

  it('should include empty array in request body when called with tags: []', async () => {
    vi.stubGlobal(
      'fetch',
      mockOkResponse({ id: '1', title: 'T', content: 'C', createdAt: '', updatedAt: '', tags: [] }),
    );

    await createNote({ title: 'T', content: 'C', tags: [] });

    const [, init] = vi.mocked(fetch).mock.calls[0];
    const body = JSON.parse(init!.body as string);
    expect(body.tags).toEqual([]);
  });

  it("should throw Error('Failed to create note') when response is not ok", async () => {
    vi.stubGlobal('fetch', mockErrorResponse());

    await expect(createNote({ title: 'T', content: 'C', tags: [] })).rejects.toThrow(
      'Failed to create note',
    );
  });
});

describe('updateNote', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should include tags in request body when tags are provided in updates', async () => {
    vi.stubGlobal(
      'fetch',
      mockOkResponse({
        id: '1',
        title: 'T',
        content: 'C',
        createdAt: '',
        updatedAt: '',
        tags: ['work'],
      }),
    );

    await updateNote('1', { tags: ['work'] });

    const [, init] = vi.mocked(fetch).mock.calls[0];
    const body = JSON.parse(init!.body as string);
    expect(body.tags).toEqual(['work']);
  });

  it('should succeed without tags field when tags is omitted from updates (Partial)', async () => {
    vi.stubGlobal(
      'fetch',
      mockOkResponse({
        id: '1',
        title: 'New Title',
        content: 'C',
        createdAt: '',
        updatedAt: '',
        tags: [],
      }),
    );

    const result = await updateNote('1', { title: 'New Title' });

    expect(result.title).toBe('New Title');
  });

  it("should throw Error('Failed to update note') when response is not ok", async () => {
    vi.stubGlobal('fetch', mockErrorResponse());

    await expect(updateNote('1', { tags: ['work'] })).rejects.toThrow('Failed to update note');
  });
});
