export default {
  extends: ['@commitlint/config-conventional'],
  plugins: [
    {
      rules: {
        'body-min-lines': (parsed) => {
          const { body } = parsed;
          if (!body) return [false, 'commit body가 없습니다. 2줄 이상 작성해 주세요.'];
          const lines = body.split('\n').filter((line) => line.trim() !== '');
          return lines.length >= 2
            ? [true, '']
            : [false, `commit body는 2줄 이상이어야 합니다. (현재 ${lines.length}줄)`];
        },
      },
    },
  ],
  rules: {
    'subject-empty': [2, 'never'],
    'body-min-lines': [2, 'always'],
  },
};
