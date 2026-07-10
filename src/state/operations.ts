import type { Profile, Rule, RuleTarget, State, Theme } from '../types';
import { createProfile, createRule } from './defaults';

type Section = 'headers' | 'cookies';

export function getActiveProfile(state: State): Profile | undefined {
  return state.profiles.find((p) => p.id === state.activeProfileId);
}

function mapActiveProfile(state: State, fn: (p: Profile) => Profile): State {
  return {
    ...state,
    profiles: state.profiles.map((p) =>
      p.id === state.activeProfileId ? fn(p) : p,
    ),
  };
}

export function addProfile(state: State, name: string): State {
  const profile = createProfile(name);
  return {
    ...state,
    profiles: [...state.profiles, profile],
    activeProfileId: profile.id,
  };
}

export function renameProfile(state: State, id: string, name: string): State {
  return {
    ...state,
    profiles: state.profiles.map((p) => (p.id === id ? { ...p, name } : p)),
  };
}

export function deleteProfile(state: State, id: string): State {
  if (state.profiles.length <= 1) return state;
  const profiles = state.profiles.filter((p) => p.id !== id);
  const activeProfileId =
    state.activeProfileId === id ? profiles[0].id : state.activeProfileId;
  return { ...state, profiles, activeProfileId };
}

export function setActiveProfile(state: State, id: string): State {
  if (!state.profiles.some((p) => p.id === id)) return state;
  return { ...state, activeProfileId: id };
}

export function addRow(state: State, section: Section, target: RuleTarget): State {
  return mapActiveProfile(state, (p) => ({
    ...p,
    [section]: [...p[section], createRule(target)],
  }));
}

export function updateRow(state: State, section: Section, rule: Rule): State {
  return mapActiveProfile(state, (p) => ({
    ...p,
    [section]: p[section].map((r) => (r.id === rule.id ? rule : r)),
  }));
}

export function deleteRow(state: State, section: Section, ruleId: string): State {
  return mapActiveProfile(state, (p) => ({
    ...p,
    [section]: p[section].filter((r) => r.id !== ruleId),
  }));
}

export function setUrlFilter(state: State, filter: string): State {
  return mapActiveProfile(state, (p) => ({ ...p, urlFilter: filter }));
}

export function setGlobalEnabled(state: State, enabled: boolean): State {
  return { ...state, globalEnabled: enabled };
}

export function setTheme(state: State, theme: Theme): State {
  return { ...state, theme };
}
