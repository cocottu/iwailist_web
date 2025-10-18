/**
 * ログユーティリティ
 * 本番環境ではログを出力しないように制御します
 */

class Logger {
  private isDevelopment = import.meta.env.DEV;
  private isProduction = import.meta.env.PROD;

  debug(message: string, ...args: any[]): void {
    if (this.isDevelopment) {
      console.debug(`[DEBUG] ${message}`, ...args);
    }
  }

  info(message: string, ...args: any[]): void {
    if (this.isDevelopment) {
      console.info(`[INFO] ${message}`, ...args);
    }
  }

  warn(message: string, ...args: any[]): void {
    if (this.isDevelopment) {
      console.warn(`[WARN] ${message}`, ...args);
    }
  }

  error(message: string, ...args: any[]): void {
    // エラーログは本番環境でも出力（ただし簡潔に）
    if (this.isProduction) {
      console.error(`[ERROR] ${message}`);
    } else {
      console.error(`[ERROR] ${message}`, ...args);
    }
  }

  // 本番環境用の簡潔なエラーログ
  productionError(message: string): void {
    if (this.isProduction) {
      console.error(`[ERROR] ${message}`);
    }
  }
}

export const logger = new Logger();
