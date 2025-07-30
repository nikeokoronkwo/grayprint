import { Octokit } from "npm:octokit@^5.0.0";

export interface GithubAPI {
  getRepo(user: string, repo: string, ref?: string): Promise<ArrayBuffer>;
}

export class GithubClient implements GithubAPI {
  private octokit: Octokit;

  constructor(
    octokit?: Octokit,
  ) {
    this.octokit = octokit ?? new Octokit();
  }

  async getRepo(user: string, repo: string, ref?: string) {
    const { data } = await this.octokit.rest.repos
      .downloadTarballArchive({
        owner: user,
        repo,
        ref: ref ?? "main",
      });

    const buffer = data as ArrayBuffer;

    return buffer;
  }
}
