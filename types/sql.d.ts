declare module "sql.js" {
  export interface Database {
    run(sql: string): void;
    exec(sql: string): any[];
    prepare(sql: string): Statement;
  }

  export interface Statement {
    step(): boolean;
    getAsObject(): Record<string, any>;
    free(): void;
  }

  export class Database {
    run(sql: string): void;
    exec(sql: string): any[];
    prepare(sql: string): Statement;
  }

  const SQL: {
    Database: typeof Database;
  };

  export default SQL;
}
