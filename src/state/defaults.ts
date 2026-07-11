import type { Profile, Rule, RuleTarget, State } from '../types';

function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export function createRule(target: RuleTarget = 'request'): Rule {
  return { id: uid(), enabled: true, name: '', value: '', target };
}

export function createProfile(name: string): Profile {
  return {
    id: uid(),
    name,
    urlFilter: '',
    headers: [createRule(), createRule()],
    cookies: [createRule(), createRule()],
  };
}

export function createDefaultState(): State {
  const profile = createProfile('Default');
  return {
    profiles: [profile],
    activeProfileId: profile.id,
    globalEnabled: true,
    theme: 'light',
  };
}
