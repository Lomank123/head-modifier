import type { Profile, Rule, State } from '../types';

type DNRRule = chrome.declarativeNetRequest.Rule;
type HeaderInfo = chrome.declarativeNetRequest.ModifyHeaderInfo;
type HeaderOperation = chrome.declarativeNetRequest.HeaderOperation;

const ALL_RESOURCE_TYPES = [
  'main_frame', 'sub_frame', 'stylesheet', 'script', 'image', 'font',
  'object', 'xmlhttprequest', 'ping', 'csp_report', 'media', 'websocket', 'other',
] as chrome.declarativeNetRequest.ResourceType[];

function headerInfoForHeaderRow(rule: Rule): HeaderInfo {
  if (rule.value === '') {
    return { header: rule.name, operation: 'remove' as HeaderOperation };
  }
  return { header: rule.name, operation: 'set' as HeaderOperation, value: rule.value };
}

function headerInfoForCookieRow(rule: Rule): HeaderInfo {
  const header = rule.target === 'request' ? 'cookie' : 'set-cookie';
  return {
    header,
    operation: 'append' as HeaderOperation,
    value: `${rule.name}=${rule.value}`,
  };
}

function isActiveRow(rule: Rule): boolean {
  return rule.enabled && rule.name.trim() !== '';
}

export function buildRules(state: State): DNRRule[] {
  if (!state.globalEnabled) return [];
  const profile: Profile | undefined = state.profiles.find(
    (p) => p.id === state.activeProfileId,
  );
  if (!profile) return [];

  const rules: DNRRule[] = [];
  let id = 1;

  const emit = (rule: Rule, info: HeaderInfo) => {
    const action: chrome.declarativeNetRequest.RuleAction = {
      type: 'modifyHeaders' as chrome.declarativeNetRequest.RuleActionType,
    };
    if (rule.target === 'request') action.requestHeaders = [info];
    else action.responseHeaders = [info];

    const condition: chrome.declarativeNetRequest.RuleCondition = {
      resourceTypes: ALL_RESOURCE_TYPES,
    };
    if (profile.urlFilter.trim() !== '') condition.urlFilter = profile.urlFilter;

    rules.push({ id: id++, priority: 1, action, condition });
  };

  for (const row of profile.headers) {
    if (isActiveRow(row)) emit(row, headerInfoForHeaderRow(row));
  }
  for (const row of profile.cookies) {
    if (isActiveRow(row)) emit(row, headerInfoForCookieRow(row));
  }

  return rules;
}
