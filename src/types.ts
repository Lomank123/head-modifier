export type RuleTarget = 'request' | 'response';

export interface Rule {
  id: string;
  enabled: boolean;
  name: string;
  value: string;
  target: RuleTarget;
}

export interface Profile {
  id: string;
  name: string;
  urlFilter: string; // '' = all URLs
  headers: Rule[];
  cookies: Rule[];
}

export type Theme = 'light' | 'dark';

export interface State {
  profiles: Profile[];
  activeProfileId: string;
  globalEnabled: boolean;
  theme: Theme;
}
