import "es6-promise/auto";
import * as SDK from "azure-devops-extension-sdk";
import { GitServiceIds, IVersionControlRepositoryService } from "azure-devops-extension-api/Git";
import { CommonServiceIds, getClient, IHostPageLayoutService } from "azure-devops-extension-api";
import { combineUrlPaths } from "azure-devops-extension-api/Common/Util/Url"

declare global {
  interface Window {
    sourceCommitId: string;
  }
}

export interface GitCommit {
  comment: string;
  commitId: string;
  readonly: string;
}

export interface ActionContext {
  commit: GitCommit;
  serviceBaseUrl: string;
}

SDK.register("source-commit-menu", () => {
  return {
    execute: async (context: ActionContext) => {
      const gitService = await SDK.getService<IVersionControlRepositoryService>(GitServiceIds.VersionControlRepositoryService);
      const result = await gitService.getCurrentGitRepository();
      //TODO: Implement commits compare
      window.sourceCommitId = context.commit.commitId;      
    }
  }
});

SDK.register("target-commit-menu", () => {
  return {
    execute: async (context: ActionContext) => {
      const dialogSvc = await SDK.getService<IHostPageLayoutService>(CommonServiceIds.HostPageLayoutService);
      if (window.sourceCommitId == null || window.sourceCommitId == undefined) {
        dialogSvc.openMessageDialog("Please select source commit first", { showCancel: false });
        return;
      }
      const gitService = await SDK.getService<IVersionControlRepositoryService>(GitServiceIds.VersionControlRepositoryService);
      const result = await gitService.getCurrentGitRepository();
      const url = combineUrlPaths("https://dev.azure.com", result!.url, `branchcompare?baseVersion=GC${window.sourceCommitId}&targetVersion=GC${context.commit.commitId}&_a=files`);      
      window.open(url);
    }
  }
});

SDK.init();