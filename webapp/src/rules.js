import moment from 'moment';

function withReqs(fn, reqs) {
   const arr = [];
   for (var key in reqs) {
      if (reqs[key])
         arr.push(key);
   }
   fn.reqs = arr;
   return fn;
}

function articleSize({ chars, bytes }) {
   return withReqs(function articleSize(data) {
      return chars && data.chars >= chars.atLeast
          || bytes && data.bytes >= bytes.atLeast;
   }, {
      chars: !!chars,
      bytes: !!bytes,
   });
}

function submitterIsCreator() {
   return withReqs(function submitterIsCreator(data, ctx) {
      return data.creator === ctx.user.name;
   }, { creator: true });
}

function articleCreated({ after, before }) {
   return withReqs(function articleCreated(data) {
      return (after ? moment(data.created).isAfter(after) : true)
          && (before ? moment(data.created).isBefore(before) : true);
   }, { created: true });
}

function submitterRegistered({ after }) {
   return function submitterRegistered(data, ctx) {
      return ctx.user.registered && moment(ctx.user.registered).isAfter(after);
   };
}

function namespace({ isIn }) {
   return withReqs(function namespace(data) {
      return isIn.indexOf(data.ns) !== -1;
   }, { ns: true });
}

const allRules = { articleSize, submitterIsCreator, articleCreated, submitterRegistered, namespace };
const userRules = [ 'submitterRegistered' ];

export const RuleSeverity = Object.freeze({
   requirement: 0,
   warning: 1,
   info: 2,
});

export default function readRules(rules, severity = []) {
   return rules.map(rule => ({
      type: rule.type,
      severity: rule.severity,
      params: rule.params,
      check: allRules[rule.type](rule.params),
      userOnly: userRules.indexOf(rule.type) !== -1,
   })).filter(rule => !severity.length || severity.indexOf(rule.severity) !== -1);
}

export function getRulesReqs(rules) {
   return rules.map(rule => rule.check.reqs || []).reduce((a, b) => [ ...a, ...b ], []);
}
