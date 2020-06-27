export interface IConfig {
  /** Selected npmrc type (project/user/global/builtin) [user]. */
  type?: string,
  /** Include overridden configs? [false] */
  long?: boolean,
  /** Path to project npmrc. */
  projectconfig?: string,
  /** Path to user npmrc. */
  userconfig?: string,
  /** Path to global npmrc. */
  globalconfig?: string
}
