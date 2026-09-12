import {sqliteTable,text,integer} from 'drizzle-orm/sqlite-core';
export const guideCounters=sqliteTable('guide_counters',{key:text('key').primaryKey(),used:integer('used').notNull().default(0),expires:integer('expires').notNull()});
export const guideCache=sqliteTable('guide_cache',{key:text('key').primaryKey(),value:text('value'),expires:integer('expires').notNull()});
