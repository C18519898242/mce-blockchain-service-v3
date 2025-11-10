/**
 * Application Configuration
 */

export interface AppConfig {
  port: number;
  nodeEnv: string;
}

export const appConfig: AppConfig = {
  get port(): number {
    return parseInt(process.env.PORT || '9001', 10);
  },
  get nodeEnv(): string {
    return process.env.NODE_ENV || 'development';
  }
};
