import { buttonVariants } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AddGitlabProvider } from "./add-gitlab-provider";
import {
	BitbucketIcon,
	GithubIcon,
	GitlabIcon,
} from "@/components/icons/data-tools-icons";
import { AddGithubProvider } from "./add-github-provider";
import { AddBitbucketProvider } from "./add-bitbucket-provider";
import { api } from "@/utils/api";
import Link from "next/link";
import { RemoveGitProvider } from "../github/remove-github-app";
import { useUrl } from "@/utils/hooks/use-url";

export const ShowGitProviders = () => {
	const { data } = api.gitProvider.getAll.useQuery();

	const url = useUrl();

	const getGitlabUrl = (clientId: string, gitlabId: string) => {
		const redirectUri = `${url}/api/providers/gitlab/callback?gitlabId=${gitlabId}`;

		const scope = "api read_user read_repository";

		const authUrl = `https://gitlab.com/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}`;

		return authUrl;
	};
	return (
		<div className="p-6 space-y-6">
			<div className="space-y-2">
				<h1 className="text-2xl font-bold">Git Providers</h1>
				<p className="text-muted-foreground">
					Connect your Git Providers to use it for login.
				</p>
			</div>
			<Card className=" bg-transparent">
				<CardContent className="p-4">
					<div className="flex gap-4 sm:flex-row flex-col w-full">
						<AddGithubProvider />
						<AddGitlabProvider />
						<AddBitbucketProvider />
					</div>
				</CardContent>
			</Card>
			{data?.map((gitProvider, index) => {
				const isGithub = gitProvider.providerType === "github";
				const isGitlab = gitProvider.providerType === "gitlab";
				const haveGithubRequirements =
					gitProvider.providerType === "github" &&
					gitProvider.githubProvider?.githubPrivateKey &&
					gitProvider.githubProvider?.githubAppId &&
					gitProvider.githubProvider?.githubInstallationId;

				const haveGitlabRequirements =
					gitProvider.gitlabProvider?.accessToken &&
					gitProvider.gitlabProvider?.refreshToken;
				return (
					<div
						className="space-y-4"
						key={`${gitProvider.gitProviderId}-${index}`}
					>
						<Card className="flex sm:flex-row max-sm:gap-2 flex-col justify-between items-center p-4">
							<div className="flex items-center space-x-4 w-full">
								{gitProvider.providerType === "github" && (
									<GithubIcon className="w-6 h-6" />
								)}
								{gitProvider.providerType === "gitlab" && (
									<GitlabIcon className="w-6 h-6" />
								)}
								{gitProvider.providerType === "bitbucket" && (
									<BitbucketIcon className="w-6 h-6" />
								)}
								<div>
									<p className="font-medium">
										{gitProvider.providerType === "github"
											? "GitHub"
											: gitProvider.providerType === "gitlab"
												? "GitLab"
												: "Bitbucket"}
									</p>
									<p className="text-sm text-muted-foreground">
										{gitProvider.name}
									</p>
								</div>
							</div>
							<div className="flex  sm:gap-4 sm:flex-row flex-col">
								{!haveGithubRequirements && isGithub && (
									<div className="flex flex-col  gap-1">
										<Link
											href={`${gitProvider?.githubProvider?.githubAppName}/installations/new?state=gh_setup:${gitProvider?.githubProvider.githubProviderId}`}
											className={buttonVariants({ className: "w-fit" })}
										>
											Install Github App
										</Link>
									</div>
								)}

								{haveGithubRequirements && isGithub && (
									<div className="flex flex-col  gap-1">
										<Link
											href={`${gitProvider?.githubProvider?.githubAppName}`}
											target="_blank"
											className={buttonVariants({
												className: "w-fit",
												variant: "secondary",
											})}
										>
											<span className="text-sm">Manage Github App</span>
										</Link>
									</div>
								)}

								{!haveGitlabRequirements && isGitlab && (
									<div className="flex flex-col  gap-1">
										<Link
											href={getGitlabUrl(
												gitProvider.gitlabProvider?.applicationId || "",
												gitProvider.gitlabProvider?.gitlabProviderId || "",
											)}
											target="_blank"
											className={buttonVariants({
												className: "w-fit",
												variant: "secondary",
											})}
										>
											<span className="text-sm">Install Gitlab App</span>
										</Link>
									</div>
								)}

								<RemoveGitProvider
									gitProviderId={gitProvider.gitProviderId}
									gitProviderType={gitProvider.providerType}
								/>
							</div>
						</Card>
					</div>
				);
			})}
		</div>
	);
};