import { test, expect, type Page } from '@playwright/test';

const API = 'http://localhost:3001';

// Vite dev 서버가 ES 모듈을 모두 로드하고 React가 마운트될 때까지 대기
async function gotoApp(page: Page) {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
}

test.describe('태그 기능', () => {
  // S1, S2, S3: 에디터 내 UI 동작 — 저장하지 않으므로 cleanup 불필요

  test('[U1] should show tag badge in editor when user types a tag and presses Enter', async ({
    page,
  }) => {
    await gotoApp(page);
    await page.getByRole('button', { name: '+ 새 노트' }).click();

    const tagTextbox = page.getByTestId('tag-input').getByRole('textbox');
    await tagTextbox.fill('react');
    await tagTextbox.press('Enter');

    await expect(page.getByTestId('tag-input')).toContainText('react');
    await expect(page.getByTestId('tag-input').getByRole('button', { name: /×/ })).toHaveCount(1);
  });

  test('[U1] should show tag badge in editor when user types a tag and presses comma', async ({
    page,
  }) => {
    await gotoApp(page);
    await page.getByRole('button', { name: '+ 새 노트' }).click();

    const tagTextbox = page.getByTestId('tag-input').getByRole('textbox');
    await tagTextbox.fill('design');
    await tagTextbox.press(',');

    await expect(page.getByTestId('tag-input')).toContainText('design');
    await expect(page.getByTestId('tag-input').getByRole('button', { name: /×/ })).toHaveCount(1);
  });

  test('[U2] should remove tag badge from editor when user clicks × button', async ({ page }) => {
    await gotoApp(page);
    await page.getByRole('button', { name: '+ 새 노트' }).click();

    const tagTextbox = page.getByTestId('tag-input').getByRole('textbox');
    await tagTextbox.fill('typescript');
    await tagTextbox.press('Enter');
    await expect(page.getByTestId('tag-input').getByRole('button', { name: /×/ })).toHaveCount(1);

    await page.getByTestId('tag-input').getByRole('button', { name: /×/ }).click();

    await expect(page.getByTestId('tag-input').getByRole('button', { name: /×/ })).toHaveCount(0);
    await expect(page.getByTestId('tag-input')).not.toContainText('typescript');
  });

  // S4, S5: 저장 후 서버 반영 — afterEach에서 생성된 노트 삭제
  test.describe('저장 및 서버 반영', () => {
    let createdNoteId: string | null = null;

    test.afterEach(async ({ request }) => {
      if (createdNoteId) {
        await request.delete(`${API}/notes/${createdNoteId}`).catch(() => {});
        createdNoteId = null;
      }
    });

    test('[U3+U4] should display saved tags in sidebar NoteItem after user adds tags and saves', async ({
      page,
      request,
    }) => {
      const suffix = Date.now().toString().slice(-7);
      const noteTitle = `E2E 연동 ${suffix}`;
      const tagName = `e2etag${suffix}`;

      await gotoApp(page);
      await page.getByRole('button', { name: '+ 새 노트' }).click();

      await page.getByPlaceholder('제목').fill(noteTitle);

      const tagTextbox = page.getByTestId('tag-input').getByRole('textbox');
      await tagTextbox.fill(tagName);
      await tagTextbox.press('Enter');

      await page.getByRole('button', { name: '저장' }).click();

      // 저장 완료 → 사이드바에 노트 제목이 나타날 때까지 대기
      await expect(page.locator('h3', { hasText: noteTitle })).toBeVisible();

      // 사이드바 NoteItem에 태그 뱃지가 표시되는지 확인 (Editor↔사이드바 연동)
      await expect(page.getByTestId('tag-badge').filter({ hasText: tagName })).toBeVisible();

      const res = await request.get(`${API}/notes`);
      const notes: Array<{ id: string; title: string }> = await res.json();
      createdNoteId = notes.find((n) => n.title === noteTitle)?.id ?? null;
    });

    test('[U3] should persist tags so they are visible after page reload', async ({
      page,
      request,
    }) => {
      const suffix = Date.now().toString().slice(-7);
      const noteTitle = `E2E 영속성 ${suffix}`;
      const tagName = `ptag${suffix}`;

      await gotoApp(page);
      await page.getByRole('button', { name: '+ 새 노트' }).click();

      await page.getByPlaceholder('제목').fill(noteTitle);

      const tagTextbox = page.getByTestId('tag-input').getByRole('textbox');
      await tagTextbox.fill(tagName);
      await tagTextbox.press('Enter');

      await page.getByRole('button', { name: '저장' }).click();

      // 저장 완료 확인
      await expect(page.locator('h3', { hasText: noteTitle })).toBeVisible();

      const res = await request.get(`${API}/notes`);
      const notes: Array<{ id: string; title: string }> = await res.json();
      createdNoteId = notes.find((n) => n.title === noteTitle)?.id ?? null;

      // 새 탭으로 재방문해 서버에서 데이터를 다시 로드
      await gotoApp(page);

      // 재방문 후에도 사이드바에 태그 뱃지가 유지되는지 확인
      await expect(page.getByTestId('tag-badge').filter({ hasText: tagName })).toBeVisible();
    });
  });

  // S6: 새 노트 전환 시 태그 초기화 — beforeEach에서 기존 태그 노트 생성
  test.describe('새 노트 초기화', () => {
    let existingNoteId: string | null = null;

    test.beforeEach(async ({ request }) => {
      const res = await request.post(`${API}/notes`, {
        data: {
          title: 'E2E 기존 태그 노트',
          content: '테스트용',
          tags: ['existing-tag'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      });
      const note = await res.json();
      existingNoteId = note.id;

      // json-server --watch 옵션이 db.json 변경을 감지하고 재시작할 수 있으므로
      // 노트가 실제로 조회될 때까지 대기
      await expect(async () => {
        const check = await request.get(`${API}/notes/${existingNoteId}`);
        expect(check.status()).toBe(200);
      }).toPass({ timeout: 5000 });
    });

    test.afterEach(async ({ request }) => {
      if (existingNoteId) {
        await request.delete(`${API}/notes/${existingNoteId}`).catch(() => {});
        existingNoteId = null;
      }
    });

    test('[U6] should show no tag badges when user opens new note creation', async ({ page }) => {
      await gotoApp(page);
      await page.locator('h3').filter({ hasText: 'E2E 기존 태그 노트' }).click();
      await expect(page.getByTestId('tag-input')).toContainText('existing-tag');

      await page.getByRole('button', { name: '+ 새 노트' }).click();

      await expect(page.getByTestId('tag-input').getByRole('button', { name: /×/ })).toHaveCount(0);
    });
  });
});
