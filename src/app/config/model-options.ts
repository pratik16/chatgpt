export interface ModelOption {
  label: string;
  value: string;
}

export interface ModelGroup {
  provider: string;
  options: ModelOption[];
}

export const DEFAULT_MODEL = 'auto';

export const MODEL_GROUPS: ModelGroup[] = [
  {
    provider: 'GPT',
    options: [
      { label: 'gpt-4.1-nano', value: 'GPT:gpt-4.1-nano' },
      { label: 'gpt-5-nano', value: 'GPT:gpt-5-nano' },
      { label: 'gpt-5-mini', value: 'GPT:gpt-5-mini' },
      { label: 'gpt-5', value: 'GPT:gpt-5' }
    ]
  },
  {
    provider: 'Antropic',
    options: [
      { label: 'Claude Sonnet 3.5', value: 'CLAUDE:claude-3-5-sonnet-20241022' },
      { label: 'Claude Sonnet 4', value: 'CLAUDE:claude-sonnet-4-20250514' },
      { label: 'Claude Sonnet 4.5', value: 'CLAUDE:claude-sonnet-4-5-20250929' }
    ]
  }
];


