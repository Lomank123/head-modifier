import type { Profile, Rule, RuleTarget, State, Theme } from '../types';
import { createProfile, createRule } from './defaults';

type Section = 'headers' | 'cookies';

/** Blank starter rows shown in an empty category so users can type immediately. */
const MIN_SLOTS = 2;

/** Maximum length of a profile name. */
export const PROFILE_NAME_MAX = 128;

function clampName(name: string): string {
  return name.trim().slice(0, PROFILE_NAME_MAX);
}

function seedSection(rows: Rule[]): Rule[] {
  if (rows.length > 0) return rows;
  return Array.from({ length: MIN_SLOTS }, () => createRule('request'));
}

/** Tops up any empty category with blank slots. Safe to run on hydrated state. */
export function ensureMinRows(state: State): State {
  return {
    ...state,
    profiles: state.profiles.map((p) => ({
      ...p,
      headers: seedSection(p.headers),
      cookies: seedSection(p.cookies),
    })),
  };
}

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
  const profile = createProfile(clampName(name));
  return {
    ...state,
    profiles: [...state.profiles, profile],
    activeProfileId: profile.id,
  };
}

export function renameProfile(state: State, id: string, name: string): State {
  const clamped = clampName(name);
  return {
    ...state,
    profiles: state.profiles.map((p) => (p.id === id ? { ...p, name: clamped } : p)),
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

export function setSectionEnabled(state: State, section: Section, enabled: boolean): State {
  return mapActiveProfile(state, (p) => ({
    ...p,
    [section]: p[section].map((r) => ({ ...r, enabled })),
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
