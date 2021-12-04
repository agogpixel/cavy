import { CleanConfig } from './clean';
import { CopyConfig } from './copy';
import { LintConfig } from './lint';
import { PackConfig } from './pack';
import { PublishConfig } from './publish';

export interface Config {
  lint: LintConfig;
  clean: CleanConfig;
  copy: CopyConfig;
  pack: PackConfig;
  publish: PublishConfig;
}
