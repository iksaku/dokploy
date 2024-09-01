import { GithubIcon } from "@/components/icons/data-tools-icons";
import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { api } from "@/utils/api";
import { useUrl } from "@/utils/hooks/use-url";
import { format } from "date-fns";
import { useEffect, useState } from "react";

export const AddGithubProvider = () => {
	const [isOpen, setIsOpen] = useState(false);
	const url = useUrl();
	const { data } = api.auth.get.useQuery();
	const [manifest, setManifest] = useState("");
	const [isOrganization, setIsOrganization] = useState(false);
	const [organizationName, setOrganization] = useState("");

	useEffect(() => {
		const url = document.location.origin;
		const manifest = JSON.stringify(
			{
				redirect_url: `${origin}/api/providers/github/redirect?authId=${data?.id}`,
				name: `Dokploy-${format(new Date(), "yyyy-MM-dd")}`,
				url: origin,
				hook_attributes: {
					url: `${url}/api/deploy/github`,
				},
				callback_urls: [`${origin}/api/providers/github/redirect`],
				public: false,
				request_oauth_on_install: true,
				default_permissions: {
					contents: "read",
					metadata: "read",
					emails: "read",
					pull_requests: "write",
				},
				default_events: ["pull_request", "push"],
			},
			null,
			4,
		);

		setManifest(manifest);
	}, [data?.id]);

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>
				<Button variant="secondary" className="flex items-center space-x-1">
					<GithubIcon />
					<span>Github</span>
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-2xl ">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						Github Provider <GithubIcon className="size-5" />
					</DialogTitle>
				</DialogHeader>

				<div id="hook-form-add-project" className="grid w-full gap-1">
					<CardContent className="p-0">
						<div className="flex flex-col ">
							<p className="text-muted-foreground text-sm">
								To integrate your GitHub account with our services, you'll need
								to create and install a GitHub app. This process is
								straightforward and only takes a few minutes. Click the button
								below to get started.
							</p>
							<div className="mt-4 flex flex-col gap-4">
								<div className="flex flex-row gap-4">
									<span>Organization?</span>
									<Switch
										checked={isOrganization}
										onCheckedChange={(checked) => setIsOrganization(checked)}
									/>
								</div>

								{isOrganization && (
									<Input
										required
										placeholder="Organization name"
										onChange={(e) => setOrganization(e.target.value)}
									/>
								)}
							</div>
							<form
								action={
									isOrganization
										? `https://github.com/organizations/${organizationName}/settings/apps/new?state=gh_init:${data?.id}`
										: `https://github.com/settings/apps/new?state=gh_init:${data?.id}`
								}
								method="post"
							>
								<input
									type="text"
									name="manifest"
									id="manifest"
									defaultValue={manifest}
									className="invisible"
								/>
								<br />

								<div className="flex w-full justify-end">
									<Button
										disabled={isOrganization && organizationName.length < 1}
										type="submit"
										className="self-end"
									>
										Create GitHub App
									</Button>
								</div>
							</form>
						</div>
					</CardContent>
				</div>
			</DialogContent>
		</Dialog>
	);
};