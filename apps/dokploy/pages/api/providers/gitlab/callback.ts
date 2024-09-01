import {
	getGitlabProvider,
	updateGitlabProvider,
} from "@/server/api/services/git-provider";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse,
) {
	console.log(req.body);
	const { code, gitlabId } = req.query;

	if (!code || Array.isArray(code)) {
		return res.status(400).json({ error: "Missing or invalid code" });
	}

	const gitlab = await getGitlabProvider(gitlabId as string);

	const response = await fetch("https://gitlab.com/oauth/token", {
		method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
		},
		body: new URLSearchParams({
			client_id: gitlab.applicationId as string,
			client_secret: gitlab.secret as string,
			code: code as string,
			grant_type: "authorization_code",
			redirect_uri: `${gitlab.redirectUri}?gitlabId=${gitlabId}`,
		}),
	});

	const result = await response.json();

	if (!result.access_token || !result.refresh_token) {
		return res.status(400).json({ error: "Missing or invalid code" });
	}
	const expiresAt = Math.floor(Date.now() / 1000) + result.expires_in;
	const updatedGiltab = await updateGitlabProvider(gitlab.gitlabId, {
		accessToken: result.access_token,
		refreshToken: result.refresh_token,
		expiresAt,
	});

	return res.redirect(307, "/dashboard/settings/git-providers");
}