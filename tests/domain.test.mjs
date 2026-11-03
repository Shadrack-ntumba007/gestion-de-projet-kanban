import test from 'node:test';
import assert from 'node:assert/strict';
import { taskCompletionPercent, projectProgress, tasksForProject, formatShortDate } from '../src/utils/taskMetrics.ts';
import { canEdit, canDeleteProject, canManageMembers } from '../src/utils/permissions.ts';
import { validEmail, validPassword, nonEmpty } from '../src/utils/validation.ts';

test('sous-tâches: 2 sur 3 -> 67 %',()=>assert.equal(taskCompletionPercent([{done:true},{done:true},{done:false}]),67));
test('sous-tâches: vide -> 0 %',()=>assert.equal(taskCompletionPercent([]),0));
test('progression du projet',()=>assert.equal(projectProgress([{statusId:'todo'},{statusId:'done'},{statusId:'done'}],['done']),67));
test('filtrage des tâches par projet',()=>assert.deepEqual(tasksForProject([{projectId:'a',id:1},{projectId:'b',id:2}],'a'),[{projectId:'a',id:1}]));
test('format des dates absent / invalide',()=>{assert.equal(formatShortDate(null),'Sans échéance');assert.equal(formatShortDate('not-a-date'),'Date invalide');});
test('permissions locales',()=>{assert.equal(canEdit('viewer'),false);assert.equal(canEdit('editor'),true);assert.equal(canManageMembers('admin'),true);assert.equal(canManageMembers('editor'),false);assert.equal(canDeleteProject('owner'),true);});
test('validation des champs',()=>{assert.equal(validEmail('a@b.cd'),true);assert.equal(validEmail('not-an-email'),false);assert.equal(validPassword('1234567'),false);assert.equal(validPassword('12345678'),true);assert.equal(nonEmpty('  '),false);});

import {calendarDateToIso} from '../src/utils/dates.ts';
test('dates strictes',()=>{assert.equal(calendarDateToIso('2026-02-30'),null);assert.equal(calendarDateToIso('2026-12-31'),'2026-12-31T12:00:00.000Z');});
