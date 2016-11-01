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

function articleSize({ chars, bytes, words }) {
   return withReqs(function articleSize(data) {
      return !!(
         chars && data.chars >= chars.atLeast ||
         bytes && data.bytes >= bytes.atLeast ||
         words && data.words >= words.atLeast);
   }, {
      chars: !!chars,
      bytes: !!bytes,
      words: !!words,
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

export const RuleFlags = Object.freeze({
   optional: 1,
   informational: 2,
});

export default function readRules(rules) {
   return rules.map(rule => ({
      type: rule.type,
      flags: rule.flags,
      params: rule.params,
      check: allRules[rule.type](rule.params),
      userOnly: userRules.indexOf(rule.type) !== -1,
   }));
}

export function getRulesReqs(rules) {
   return rules.map(rule => rule.check.reqs || []).reduce((a, b) => [ ...a, ...b ], []);
}
