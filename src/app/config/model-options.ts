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
      { label: 'gpt-4.1-nano', value: 'gpt-4.1-nano' },
      { label: 'gpt-5-nano', value: 'gpt-5-nano' },
      { label: 'gpt-5-mini', value: 'gpt-5-mini' },
      { label: 'gpt-5', value: 'gpt-5' }
    ]
  },
  {
    provider: 'Antropic',
    options: [
      { label: 'Claude Sonnet 3.7', value: 'Claude Sonnet 3.7' },
      { label: 'Claude Sonnet 4', value: 'Claude Sonnet 4' },
      { label: 'Claude Sonnet 4.5', value: 'Claude Sonnet 4.5' }
    ]
  }
];


