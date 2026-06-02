// --------------------------------------------------------------------------
// GitHub Analyzer Service
// --------------------------------------------------------------------------
// Orchestrates fetching, filtering, scoring, and normalizing GitHub data.
// Returns a GithubSummary — never raw API payloads.
//
// API call strategy (minimizes GitHub API usage):
//   1. Fetch user profile           — 1 call
//   2. Fetch all repos              — 1 call (100 per page)
//   3. Filter + quick-score (using repo.language, not /languages endpoint)
//   4. Sort, pick top 5
//   5. For top 5 only:
//      - Check README existence     — 5 calls
//      - Fetch detailed languages   — 5 calls
//   6. Re-score with README data
//   7. Fetch profile README         — 1 call
//   Total: ~13 calls max
// --------------------------------------------------------------------------

import { githubFetch, githubFetchRaw } from "@/src/lib/github";
import { GithubError } from "@/src/lib/errors";
import { logger } from "@/src/lib/logger";
import type {
  GithubApiUser,
  GithubApiRepo,
  GithubSummary,
  GithubUser,
  GithubRepoScored,
} from "./github.types";
import {
  isQualityRepo,
  calculateRepoScore,
  normalizeRepo,
  aggregateLanguages,
} from "./github.utils";
import type { OnProgressCallback } from "../generation/generation.types";

const SERVICE = "GithubAnalyzer";
const TOP_REPO_COUNT = 5;

/**
 * Analyze a GitHub profile and return normalized, scored data.
 */
export async function analyzeGithubProfile(
  username: string,
  onProgress?: OnProgressCallback
): Promise<GithubSummary> {
  logger.info(SERVICE, `Starting analysis for "${username}"`);
  logger.time(`github-analysis-${username}`);

  try {
    // 1. Fetch user profile
    await onProgress?.("Fetching user profile data...", "Fetching GitHub profile", 7);
    logger.info(SERVICE, "Fetching user profile...");
    const apiUser = await githubFetch<GithubApiUser>({
      path: `/users/${username}`,
    });
    const user = normalizeUser(apiUser);

    // 2. Fetch repositories (up to 100, sorted by most recently updated)
    await onProgress?.("Fetching repositories...", "Fetching repositories", 10);
    logger.info(SERVICE, "Fetching repositories...");
    const apiRepos = await githubFetch<GithubApiRepo[]>({
      path: `/users/${username}/repos`,
      params: {
        per_page: "100",
        sort: "updated",
        type: "owner",
      },
    });

    // 3. Filter out forks, archived, empty
    const qualityRepos = apiRepos.filter(isQualityRepo);
    await onProgress?.(`Found ${apiRepos.length} repos, ${qualityRepos.length} passed quality filters.`, "Filtering archived repositories", 15);
    logger.info(SERVICE, `Found ${apiRepos.length} repos, ${qualityRepos.length} passed quality filter`);

    if (qualityRepos.length === 0) {
      logger.warn(SERVICE, "No quality repositories found");
      return {
        user,
        repositories: [],
        allLanguages: [],
        profileReadme: null,
      };
    }

    // 4. Quick-score using only data from the repo listing (no extra API calls)
    //    At this stage we don't know about READMEs, so readmeExists = false
    const quickScored = qualityRepos.map((repo) => ({
      repo,
      quickScore: calculateRepoScore(repo, false),
    }));

    // Sort descending and pick top N candidates
    quickScored.sort((a, b) => b.quickScore - a.quickScore);
    const topCandidates = quickScored.slice(0, TOP_REPO_COUNT);

    // 5. For top candidates only: fetch README existence + detailed languages
    await onProgress?.(`Ranking top ${topCandidates.length} repositories based on quality metrics...`, "Ranking repository quality", 20);
    logger.info(SERVICE, `Fetching details for top ${topCandidates.length} repositories...`);

    const scoredRepos: GithubRepoScored[] = await Promise.all(
      topCandidates.map(async ({ repo }) => {
        // Check README and fetch it
        const readme = await githubFetchRaw(username, repo.name, "README.md");
        const hasReadme = readme !== null;

        // Fetch detailed language breakdown for top repos
        let detailedLanguages: string[] = [];
        try {
          const langData = await githubFetch<Record<string, number>>({
            path: `/repos/${username}/${repo.name}/languages`,
          });
          detailedLanguages = Object.keys(langData);
        } catch {
          // Fallback to primary language if languages endpoint fails
          detailedLanguages = repo.language ? [repo.language] : [];
        }

        // Recalculate score with README data
        const finalScore = calculateRepoScore(repo, hasReadme);

        return normalizeRepo(repo, finalScore, hasReadme, readme, detailedLanguages);
      })
    );

    // Re-sort by final score
    scoredRepos.sort((a, b) => b.score - a.score);

    // 6. Aggregate languages
    const allLanguages = aggregateLanguages(scoredRepos);

    // 7. Fetch profile README (username/username repo)
    await onProgress?.("Fetching profile README...", "Reading profile README", 23);
    logger.info(SERVICE, "Fetching profile README...");
    const profileReadme = await githubFetchRaw(username, username, "README.md");

    const summary: GithubSummary = {
      user,
      repositories: scoredRepos,
      allLanguages,
      profileReadme,
    };

    logger.timeEnd(SERVICE, `github-analysis-${username}`);
    await onProgress?.(`Analysis complete. ${scoredRepos.length} repos scored, ${allLanguages.length} technologies found.`, "Reading profile README", 25);
    logger.info(SERVICE, `Analysis complete. ${scoredRepos.length} repos scored, ${allLanguages.length} languages found`);

    return summary;
  } catch (error) {
    logger.timeEnd(SERVICE, `github-analysis-${username}`);

    if (error instanceof GithubError) {
      throw error;
    }

    throw new GithubError(
      `Failed to analyze GitHub profile "${username}": ${error instanceof Error ? error.message : String(error)}`,
      500,
      { username }
    );
  }
}

function normalizeUser(apiUser: GithubApiUser): GithubUser {
  return {
    name: apiUser.name,
    bio: apiUser.bio,
    avatarUrl: apiUser.avatar_url,
    company: apiUser.company,
    location: apiUser.location,
    blog: apiUser.blog,
    twitterUsername: apiUser.twitter_username,
    publicRepos: apiUser.public_repos,
    followers: apiUser.followers,
  };
}
