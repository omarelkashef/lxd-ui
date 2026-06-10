import { test, expect } from "./fixtures/lxd-test";
import {
  createClusterLink,
  deleteClusterLink,
  editClusterLink,
  randomLinkName,
  skipIfNotSupported,
} from "./helpers/cluster-links";
import { skipIfNotClustered } from "./helpers/cluster";
import { execSync } from "child_process";

test("cluster link create edit delete", async ({
  page,
  lxdVersion,
}, testInfo) => {
  skipIfNotSupported(lxdVersion);
  skipIfNotClustered(testInfo.project.name);

  const link = randomLinkName();
  await createClusterLink(page, link);
  const row = page.getByRole("row").filter({ hasText: link });
  await expect(row).toBeVisible();
  await expect(row.getByRole("cell", { name: "Type" })).toHaveText(
    "Bidirectional",
  );
  await expect(row.getByRole("cell", { name: "Status" })).toHaveText("Pending");
  await expect(row.getByRole("cell", { name: "Addresses" })).toHaveText("-");
  await expect(row.getByRole("cell", { name: "Description" })).toHaveText("");

  await editClusterLink(page, link);
  await expect(row.getByRole("cell", { name: "Description" })).toHaveText(
    "My link",
  );

  await deleteClusterLink(page, link);
  await expect(row).toHaveCount(0);
});

test("cluster link table displays all links", async ({
  page,
  lxdVersion,
}, testInfo) => {
  skipIfNotSupported(lxdVersion);
  skipIfNotClustered(testInfo.project.name);

  const link1 = randomLinkName();
  const link2 = randomLinkName();
  await createClusterLink(page, link1);
  await createClusterLink(page, link2);

  const row1 = page.getByRole("row").filter({ hasText: link1 });
  const row2 = page.getByRole("row").filter({ hasText: link2 });

  await expect(row1).toBeVisible();
  await expect(row2).toBeVisible();

  await deleteClusterLink(page, link1);
  await deleteClusterLink(page, link2);
});

test("consume token to create cluster link", async ({
  page,
  lxdVersion,
}, testInfo) => {
  skipIfNotSupported(lxdVersion);
  skipIfNotClustered(testInfo.project.name);

  const link = randomLinkName();
  const targetVM = process.env.LXD_UI_CLUSTER_LINK_TARGET_VM;
  if (!targetVM) {
    throw new Error("Missing required env var: LXD_UI_CLUSTER_LINK_TARGET_VM");
  }
  const authGroupName = `link-${link}`;
  const generateTokenCommand = `
    lxc auth group create ${authGroupName} &&
    lxc auth group permission add ${authGroupName} server admin &&
    lxc cluster link create ${link} --auth-group ${authGroupName}
  `;
  const output = execSync(
    `lxc exec ${targetVM} -- sh -c '${generateTokenCommand}'`,
  )
    .toString()
    .trim();

  // Extract token from the output (it's on the last line)
  const token = output.split("\n").pop() || "";
  await createClusterLink(page, link, token);

  const row = page.getByRole("row").filter({ hasText: link });
  await expect(row.getByRole("cell", { name: "Status" })).toHaveText(
    "Reachable",
  );
  await expect(row.getByRole("cell", { name: "Auth groups" })).toHaveText("1");
});
